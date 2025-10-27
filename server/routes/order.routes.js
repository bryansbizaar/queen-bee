import express from "express";
import OrderService from "../services/OrderService.js";

const router = express.Router();

// POST /api/orders - Create a new order
router.post("/", async (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      billingAddress,
      items,
      paymentIntentId,
      totalAmount,
      status,
    } = req.body;

    // Validation
    if (
      !customerEmail ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "Missing required fields: customerEmail, items",
      });
    }

    if (!paymentIntentId || !totalAmount) {
      return res.status(400).json({
        error: "Missing required fields: paymentIntentId, totalAmount",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Validate items structure FIRST - check for missing fields (but allow 0 values)
    for (const item of items) {
      if (!item.productId || item.quantity === undefined || item.quantity === null || item.price === undefined || item.price === null) {
        return res.status(400).json({
          error: "Each item must have productId, quantity, and price",
        });
      }
    }

    // THEN validate positive numbers
    for (const item of items) {
      if (item.quantity <= 0 || item.price <= 0) {
        return res.status(400).json({
          error: "Item quantity and price must be positive numbers",
        });
      }
    }

    // Check if order already exists for this payment intent
    const existingOrder = await OrderService.getOrderByPaymentIntent(
      paymentIntentId
    );
    if (existingOrder) {
      return res.status(409).json({
        error: "Order already exists for this payment",
        orderId: existingOrder.id,
      });
    }

    // Create the order
    const orderData = {
      customerEmail,
      customerName: customerName || "Guest Customer",
      customerPhone,
      shippingAddress: shippingAddress || {
        country: "New Zealand",
        city: "Auckland",
        address: "To be collected",
      },
      billingAddress,
      items,
      paymentIntentId,
      totalAmount: parseFloat(totalAmount),
      status: status || "completed",
    };

    const newOrder = await OrderService.createOrder(orderData);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    // Handle specific error types
    if (error.message.includes("Insufficient stock")) {
      return res.status(409).json({
        error: "Insufficient stock for one or more items",
        details: error.message,
      });
    }

    if (error.message.includes("does not exist")) {
      return res.status(404).json({
        error: "One or more products not found",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to create order",
      details: error.message,
    });
  }
});

// GET /api/orders/:id - Get order by ID (FIXED negative ID handling)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check for non-numeric or invalid IDs
    const numericId = parseInt(id);
    if (!id || isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({
        error: "Valid order ID is required",
      });
    }

    const order = await OrderService.getOrderById(numericId);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      error: "Failed to fetch order",
      details: error.message,
    });
  }
});

// GET /api/orders/customer/:email - Get orders by customer email
router.get("/customer/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        error: "Customer email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    const orders = await OrderService.getOrdersByCustomer(email);

    res.json({
      success: true,
      orders: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({
      error: "Failed to fetch customer orders",
      details: error.message,
    });
  }
});

// GET /api/orders/payment-intent/:paymentIntentId - Get order by payment intent
router.get("/payment-intent/:paymentIntentId", async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: "Payment intent ID is required",
      });
    }

    const order = await OrderService.getOrderByPaymentIntent(paymentIntentId);

    if (!order) {
      return res.status(404).json({
        error: "Order not found for this payment intent",
      });
    }

    res.json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Error fetching order by payment intent:", error);
    res.status(500).json({
      error: "Failed to fetch order",
      details: error.message,
    });
  }
});

// GET /api/orders - Get all orders (with pagination)
router.get("/", async (req, res) => {
  try {
    const { limit = 50, offset = 0, status = null } = req.query;

    // Validate pagination parameters
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: "Limit must be between 1 and 100",
      });
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        error: "Offset must be a non-negative number",
      });
    }

    const orders = await OrderService.getAllOrders(limitNum, offsetNum, status);

    res.json({
      success: true,
      orders: orders,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        count: orders.length,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      error: "Failed to fetch orders",
      details: error.message,
    });
  }
});

// GET /api/orders/stats - Get order statistics
router.get("/stats", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let start = null;
    let end = null;

    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          error: "Invalid start date format",
        });
      }
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          error: "Invalid end date format",
        });
      }
    }

    if (start && end && start > end) {
      return res.status(400).json({
        error: "Start date must be before end date",
      });
    }

    const stats = await OrderService.getOrderStats(start, end);

    res.json({
      success: true,
      stats: stats,
      period: {
        startDate: start ? start.toISOString() : null,
        endDate: end ? end.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      error: "Failed to fetch order statistics",
      details: error.message,
    });
  }
});

export default router;
