import express from "express";
import { ProductService } from "../services/productService.js";
import {
  getAllProducts,
  getProductById,
  getProductCategories,
  getSearchSuggestions,
  getProductStats,
  healthCheck,
  checkStock,
  updateStock,
  getLowStockProducts,
  adjustStock,
} from "../controllers/product.controller.js";

const router = express.Router();

// Basic product routes (already enhanced via controllers)
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Category and search routes
router.get("/categories", getProductCategories);
router.get("/search/suggestions", getSearchSuggestions);

// Stats and health
router.get("/stats", getProductStats);
router.get("/health", healthCheck);

// NEW: Get products by category route
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    // Basic category validation
    if (!category || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid category",
      });
    }

    const products = await ProductService.getProductsByCategory(
      category.toLowerCase()
    );

    res.json({
      success: true,
      data: products,
      count: products.length,
      category: category,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products by category",
      message: error.message,
    });
  }
});

// NEW: Create new product (for future admin functionality)
router.post("/", async (req, res) => {
  try {
    const { title, description, price, image, category, stock_quantity } =
      req.body;

    // Basic validation
    if (!title || !price) {
      return res.status(400).json({
        success: false,
        error: "Title and price are required",
      });
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Price must be a positive number",
      });
    }

    const productData = {
      title: title.trim(),
      description: description?.trim() || "",
      price: parseFloat(price),
      image: image?.trim() || "",
      category: category?.trim() || "candles",
      stock_quantity: parseInt(stock_quantity) || 0,
    };

    const newProduct = await ProductService.createProduct(productData);

    res.status(201).json({
      success: true,
      data: newProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create product",
      message: error.message,
    });
  }
});

// Inventory management routes
router.get("/:id/stock", checkStock);
router.patch("/:id/stock", updateStock);
router.post("/:id/stock/adjust", adjustStock);
router.get("/admin/low-stock", getLowStockProducts);

export default router;
