import express from "express";
import {
  getAllProducts,
  getProductById,
  updateProduct,
  createProduct,
  deleteProduct,
  updateStock,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Simple authentication middleware (you can enhance this later)
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"; // Change this!

  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid admin credentials",
    });
  }

  next();
};

// Apply auth middleware to all admin routes
router.use(adminAuth);

// Product management routes
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.patch("/products/:id/stock", updateStock);
router.delete("/products/:id", deleteProduct);

// Order management routes
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
