import OrderService from "../services/OrderService.js";

class OrderController {
  // Create a new order
  static async createOrder(req, res) {
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
      } = req.body;

      // Validation
      if (
        !customerEmail ||
        !customerName ||
        !shippingAddress ||
        !items ||
        !paymentIntentId ||
        !totalAmount
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: customerEmail, customerName, shippingAddress, items, paymentIntentId, totalAmount",
        });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Items must be a non-empty array",
        });
      }

      // Validate items structure
      for (const item of items) {
        if (!item.productId || !item.quantity || !item.price) {
          return res.status(400).json({
            success: false,
            message: "Each item must have productId, quantity, and price",
          });
        }
      }

      // Check if order already exists for this payment intent
      const existingOrder = await OrderService.getOrderByPaymentIntent(
        paymentIntentId
      );
      if (existingOrder) {
        return res.status(409).json({
          success: false,
          message: "Order already exists for this payment",
          orderId: existingOrder.id,
        });
      }

      // Create the order
      const order = await OrderService.createOrder({
        customerEmail,
        customerName,
        customerPhone,
        shippingAddress,
        billingAddress,
        items,
        paymentIntentId,
        totalAmount,
        status: "completed", // Since payment was successful
      });

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error creating order:", error);

      if (error.message.includes("Insufficient stock")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create order",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Get order by ID
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Valid order ID is required",
        });
      }

      const order = await OrderService.getOrderById(parseInt(id));

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Get orders by customer email
  static async getCustomerOrders(req, res) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Customer email is required",
        });
      }

      const orders = await OrderService.getOrdersByCustomer(email);

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch customer orders",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Update order status
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Valid order ID is required",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      // Validate status
      const validStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "completed",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const updatedOrder = await OrderService.updateOrderStatus(
        parseInt(id),
        status,
        notes
      );

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Error updating order status:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update order status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Get all orders (admin endpoint)
  static async getAllOrders(req, res) {
    try {
      const { limit = 50, offset = 0, status } = req.query;

      // Validate pagination parameters
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 100",
        });
      }

      if (isNaN(offsetNum) || offsetNum < 0) {
        return res.status(400).json({
          success: false,
          message: "Offset must be 0 or greater",
        });
      }

      const orders = await OrderService.getAllOrders(
        limitNum,
        offsetNum,
        status
      );

      res.json({
        success: true,
        data: orders,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          count: orders.length,
        },
      });
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Get order statistics (admin endpoint)
  static async getOrderStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let start = null;
      let end = null;

      if (startDate) {
        start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date format",
          });
        }
      }

      if (endDate) {
        end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date format",
          });
        }
      }

      if (start && end && start > end) {
        return res.status(400).json({
          success: false,
          message: "Start date must be before end date",
        });
      }

      const stats = await OrderService.getOrderStats(start, end);

      res.json({
        success: true,
        data: {
          ...stats,
          period: {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching order stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order statistics",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Get order by payment intent ID
  static async getOrderByPaymentIntent(req, res) {
    try {
      const { paymentIntentId } = req.params;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: "Payment intent ID is required",
        });
      }

      const order = await OrderService.getOrderByPaymentIntent(paymentIntentId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "No order found for this payment intent",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Error fetching order by payment intent:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

export default OrderController;
