import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { validateRequest, validationRules } from "../middleware/validation.js";
import { rateLimit } from "../middleware/security.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  BadRequestError,
  InternalServerError,
} from "../middleware/errors/CustomErrors.js";
import OrderService from "../services/OrderService.js";

dotenv.config();

const router = express.Router();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Validation rule for payment intent ID
const paymentIntentIdValidation = (req) => {
  const { paymentIntentId } = req.params;

  if (!paymentIntentId) {
    return "Payment intent ID is required";
  }

  if (
    typeof paymentIntentId !== "string" ||
    !paymentIntentId.startsWith("pi_")
  ) {
    return "Invalid payment intent ID format";
  }

  return null;
};

// Simple validation function for order creation
const validateOrderCreation = (req, res, next) => {
  const { paymentIntentId, customerEmail, cartItems } = req.body;

  // Validate paymentIntentId
  if (
    !paymentIntentId ||
    typeof paymentIntentId !== "string" ||
    !paymentIntentId.startsWith("pi_")
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid payment intent ID format",
    });
  }

  // Validate customerEmail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customerEmail || !emailRegex.test(customerEmail)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format",
    });
  }

  // Validate cartItems
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Cart items must be a non-empty array",
    });
  }

  for (const item of cartItems) {
    if (!item.id || !item.quantity || !item.price || !item.title) {
      return res.status(400).json({
        success: false,
        error: "Each cart item must have id, quantity, price, and title",
      });
    }
    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Item quantity must be a positive number",
      });
    }
    if (typeof item.price !== "number" || item.price <= 0) {
      return res.status(400).json({
        success: false,
        error: "Item price must be a positive number",
      });
    }
  }

  next();
};

// POST /api/stripe/create-payment-intent
router.post(
  "/create-payment-intent",
  rateLimit("payment", "Too many payment attempts. Please try again later."),
  validateRequest([validationRules.stripePayment]),
  asyncHandler(async (req, res) => {
    try {
      const { amount, orderId, customerEmail, cartItems } = req.body;

      // Convert amount to cents for Stripe (multiply by 100)
      const amountInCents = Math.round(parseFloat(amount) * 100);

      // Create payment intent with enhanced metadata
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "nzd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: orderId,
          customerEmail: customerEmail,
          cartItems: JSON.stringify(cartItems).length > 500 
            ? JSON.stringify(cartItems.slice(0, 3)) + "..." 
            : JSON.stringify(cartItems),
          itemCount: cartItems.length.toString(),
          totalItems: cartItems
            .reduce((sum, item) => sum + item.quantity, 0)
            .toString(),
          requestId: req.id || "unknown",
        },
        description: `Queen Bee Candles Order ${orderId}`,
        receipt_email: customerEmail,
        statement_descriptor: "Queen Bee Candles",
      });

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new InternalServerError("Failed to create payment intent");
    }
  })
);

// POST /api/stripe/create-order
router.post(
  "/create-order",
  rateLimit(
    "order",
    "Too many order creation attempts. Please try again later."
  ),
  validateOrderCreation,
  asyncHandler(async (req, res) => {
    try {
      const {
        paymentIntentId,
        customerEmail,
        cartItems,
        customerName,
        shippingAddress,
      } = req.body;



      // 1. Verify the payment intent was successful
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (paymentIntent.status !== "succeeded") {
        throw new BadRequestError(
          "Payment has not been completed successfully"
        );
      }

      // 2. Check if order already exists for this payment intent
      const existingOrder = await OrderService.getOrderByPaymentIntent(
        paymentIntentId
      );
      if (existingOrder) {
        return res.json({
          success: true,
          message: "Order already exists",
          data: {
            orderId: existingOrder.id,
            status: existingOrder.status,
            totalAmount: existingOrder.total_amount,
          },
        });
      }

      // 3. Validate that cart items match payment intent metadata
      const metadataCartItems = JSON.parse(
        paymentIntent.metadata.cartItems || "[]"
      );
      if (metadataCartItems.length !== cartItems.length) {
        throw new BadRequestError("Cart items do not match payment intent");
      }

      // 4. Convert cart items to order items format
      const orderItems = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price, // Price in cents, already stored correctly
        title: item.title,
      }));

      // 5. Prepare order data
      const orderData = {
        customerEmail,
        customerName: customerName || null,
        customerPhone: null, // Could be added later if needed
        shippingAddress: shippingAddress || {
          line1: "Address to be provided",
          city: "Whangarei",
          state: "Northland",
          postal_code: "",
          country: "NZ",
        },
        billingAddress: null, // Use shipping address as billing for now
        items: orderItems,
        paymentIntentId,
        totalAmount: paymentIntent.amount, // Amount in cents
        status: "paid", // Payment succeeded, so order is paid
      };

      // 6. Create the order
      const order = await OrderService.createOrder(orderData);

      res.json({
        success: true,
        message: "Order created successfully",
        data: {
          orderId: order.id,
          status: order.status,
          totalAmount: order.total_amount,
          customerEmail: order.customer_email,
          itemCount: order.items.length,
          createdAt: order.created_at,
        },
      });
    } catch (error) {
      console.error("Error creating order:", error);

      if (error instanceof BadRequestError) {
        throw error;
      }

      // Check for specific database errors
      if (error.message && error.message.includes("Insufficient stock")) {
        throw new BadRequestError(error.message);
      }

      throw new InternalServerError("Failed to create order");
    }
  })
);

// GET /api/stripe/payment-intent/:paymentIntentId
router.get(
  "/payment-intent/:paymentIntentId",
  rateLimit("retrieve", "Too many retrieval attempts. Please try again later."),
  asyncHandler(async (req, res) => {
    const validationError = paymentIntentIdValidation(req);
    if (validationError) {
      throw new BadRequestError(validationError);
    }

    try {
      const { paymentIntentId } = req.params;
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      res.json({
        success: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          created: paymentIntent.created,
          metadata: paymentIntent.metadata,
        },
      });
    } catch (error) {
      console.error("Error retrieving payment intent:", error);
      throw new InternalServerError("Failed to retrieve payment intent");
    }
  })
);

// GET /api/stripe/order/:paymentIntentId
router.get(
  "/order/:paymentIntentId",
  rateLimit("retrieve", "Too many retrieval attempts. Please try again later."),
  asyncHandler(async (req, res) => {
    const validationError = paymentIntentIdValidation(req);
    if (validationError) {
      throw new BadRequestError(validationError);
    }

    try {
      const { paymentIntentId } = req.params;
      const order = await OrderService.getOrderByPaymentIntent(paymentIntentId);

      if (!order) {
        throw new BadRequestError("No order found for this payment intent");
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Error retrieving order:", error);

      if (error instanceof BadRequestError) {
        throw error;
      }

      throw new InternalServerError("Failed to retrieve order");
    }
  })
);

export default router;
