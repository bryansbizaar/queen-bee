import { ProductService } from "../services/productService.js";
import {
  NotFoundError,
  InternalServerError,
} from "../middleware/errors/CustomErrors.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Helper function to filter and sort products
const processProductsQuery = (productsArray, query) => {
  let filteredProducts = [...productsArray];

  // Search functionality
  if (query.q) {
    const searchTerm = query.q.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (product.category &&
          product.category.toLowerCase().includes(searchTerm))
    );
  }

  // Category filter
  if (query.category) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.category &&
        product.category.toLowerCase() === query.category.toLowerCase()
    );
  }

  // Price range filter
  if (query.minPrice) {
    const minPrice = parseFloat(query.minPrice);
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice
    );
  }

  if (query.maxPrice) {
    const maxPrice = parseFloat(query.maxPrice);
    filteredProducts = filteredProducts.filter(
      (product) => product.price <= maxPrice
    );
  }

  // Sorting
  if (query.sortBy) {
    filteredProducts.sort((a, b) => {
      switch (query.sortBy) {
        case "price":
          return query.sortOrder === "desc"
            ? b.price - a.price
            : a.price - b.price;
        case "title":
          return query.sortOrder === "desc"
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title);
        case "category":
          const categoryA = a.category || "";
          const categoryB = b.category || "";
          return query.sortOrder === "desc"
            ? categoryB.localeCompare(categoryA)
            : categoryA.localeCompare(categoryB);
        case "created_at":
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return query.sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        default:
          return 0;
      }
    });
  }

  return filteredProducts;
};

// GET /api/products - Get all products with advanced filtering and search
export const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // Get all products from database
    const allProducts = await ProductService.getAllProducts();

    // Apply filtering and sorting
    const filteredProducts = processProductsQuery(allProducts, req.query);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const response = {
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredProducts.length / limit),
          totalProducts: allProducts.length,
          filteredCount: filteredProducts.length,
          hasNextPage: endIndex < filteredProducts.length,
          hasPrevPage: page > 1,
        },
        filters: {
          search: req.query.q || null,
          category: req.query.category || null,
          priceRange: {
            min: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
            max: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
          },
          sortBy: req.query.sortBy || null,
          sortOrder: req.query.sortOrder || "asc",
        },
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    throw new InternalServerError("Failed to retrieve products");
  }
});

// GET /api/products/:id - Get product by ID with related products
export const getProductById = asyncHandler(async (req, res) => {
  try {
    // Validate product ID
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID. Product ID must be a positive integer.",
        timestamp: new Date().toISOString(),
      });
    }

    const product = await ProductService.getProductById(productId);

    if (!product) {
      throw new NotFoundError("Product");
    }

    // Get all products to find related ones
    const allProducts = await ProductService.getAllProducts();

    // Add related products (based on category or price range)
    const relatedProducts = allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.category === product.category ||
            Math.abs(p.price - product.price) <= product.price * 0.3)
      )
      .slice(0, 4); // Limit to 4 related products

    const response = {
      success: true,
      data: {
        product,
        relatedProducts,
        availability: {
          inStock: product.stock_quantity > 0,
          stockLevel: product.stock_quantity || 0,
          estimatedDelivery:
            product.stock_quantity > 0 ? "3-5 business days" : "Out of stock",
        },
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError("Failed to retrieve product");
  }
});

// GET /api/products/categories - Get all product categories with counts
export const getProductCategories = asyncHandler(async (req, res) => {
  try {
    const allProducts = await ProductService.getAllProducts();

    // Extract unique categories
    const categories = [
      ...new Set(
        allProducts
          .filter((product) => product.category)
          .map((product) => product.category)
      ),
    ];

    // Build categories with counts and price ranges
    const categoriesWithCounts = categories.map((category) => {
      const categoryProducts = allProducts.filter(
        (product) => product.category === category
      );

      const prices = categoryProducts.map((p) => p.price);

      return {
        name: category,
        count: categoryProducts.length,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
        averagePrice: Math.round(
          prices.reduce((a, b) => a + b, 0) / prices.length
        ),
      };
    });

    const response = {
      success: true,
      data: {
        categories: categoriesWithCounts,
        totalCategories: categories.length,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    throw new InternalServerError("Failed to retrieve categories");
  }
});

// GET /api/products/search/suggestions - Get search suggestions
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: { suggestions: [] },
        timestamp: new Date().toISOString(),
      });
    }

    const searchTerm = q.toLowerCase();
    const suggestions = new Set();

    // Get all products from database
    const allProducts = await ProductService.getAllProducts();

    allProducts.forEach((product) => {
      // Add matching titles
      if (product.title.toLowerCase().includes(searchTerm)) {
        suggestions.add(product.title);
      }

      // Add matching categories
      if (
        product.category &&
        product.category.toLowerCase().includes(searchTerm)
      ) {
        suggestions.add(product.category);
      }

      // Add matching words from description
      if (product.description) {
        const words = product.description.toLowerCase().split(" ");
        words.forEach((word) => {
          if (word.includes(searchTerm) && word.length > 3) {
            suggestions.add(word);
          }
        });
      }
    });

    const response = {
      success: true,
      data: {
        suggestions: Array.from(suggestions).slice(0, 10), // Limit to 10 suggestions
        searchTerm: q,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    throw new InternalServerError("Failed to retrieve search suggestions");
  }
});

// GET /api/products/stats - Get product statistics
export const getProductStats = asyncHandler(async (req, res) => {
  try {
    const allProducts = await ProductService.getAllProducts();

    const stats = {
      totalProducts: allProducts.length,
      totalValue: allProducts.reduce(
        (sum, product) => sum + product.price * (product.stock_quantity || 0),
        0
      ),
      averagePrice: Math.round(
        allProducts.reduce((sum, product) => sum + product.price, 0) /
          allProducts.length
      ),
      categoriesCount: [...new Set(allProducts.map((p) => p.category))].length,
      inStockCount: allProducts.filter((p) => (p.stock_quantity || 0) > 0)
        .length,
      outOfStockCount: allProducts.filter((p) => (p.stock_quantity || 0) === 0)
        .length,
      priceRanges: {
        under25: allProducts.filter((p) => p.price < 25).length,
        between25and50: allProducts.filter((p) => p.price >= 25 && p.price < 50)
          .length,
        between50and100: allProducts.filter(
          (p) => p.price >= 50 && p.price < 100
        ).length,
        over100: allProducts.filter((p) => p.price >= 100).length,
      },
    };

    const response = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    throw new InternalServerError("Failed to retrieve product statistics");
  }
});

// Health check endpoint for products service
export const healthCheck = asyncHandler(async (req, res) => {
  try {
    // Test database connection by getting product count
    const allProducts = await ProductService.getAllProducts();

    const response = {
      success: true,
      data: {
        status: "healthy",
        database: "connected",
        productsCount: allProducts.length,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    // If database fails, return unhealthy status
    const response = {
      success: false,
      data: {
        status: "unhealthy",
        database: "disconnected",
        error: error.message,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    };

    res.status(503).json(response);
  }
});
// GET /api/products/:id/stock - Check stock availability for a specific quantity
export const checkStock = asyncHandler(async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID. Product ID must be a positive integer.",
        timestamp: new Date().toISOString(),
      });
    }
    
    const requestedQuantity = parseInt(req.query.quantity) || 1;

    if (requestedQuantity < 1) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be at least 1",
        timestamp: new Date().toISOString(),
      });
    }

    const product = await ProductService.getProductById(productId);

    if (!product) {
      throw new NotFoundError("Product");
    }

    const currentStock = product.stock_quantity || 0;
    const available = currentStock >= requestedQuantity;

    const response = {
      success: true,
      data: {
        productId,
        productTitle: product.title,
        requestedQuantity,
        currentStock,
        available,
        maxAvailable: currentStock,
        stockStatus:
          currentStock === 0
            ? "out_of_stock"
            : currentStock <= 5
            ? "low_stock"
            : "in_stock",
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError("Failed to check stock");
  }
});

// PATCH /api/products/:id/stock - Update stock quantity (admin function)
export const updateStock = asyncHandler(async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID. Product ID must be a positive integer.",
        timestamp: new Date().toISOString(),
      });
    }
    
    const { quantity, reason = "manual_adjustment" } = req.body;

    // Validation
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        error: "Quantity is required",
        timestamp: new Date().toISOString(),
      });
    }

    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be a non-negative number",
        timestamp: new Date().toISOString(),
      });
    }

    // Check if product exists
    const product = await ProductService.getProductById(productId);
    if (!product) {
      throw new NotFoundError("Product");
    }

    const oldQuantity = product.stock_quantity || 0;

    // Update stock
    const updatedProduct = await ProductService.updateStock(
      productId,
      newQuantity,
      reason
    );

    const response = {
      success: true,
      data: {
        product: updatedProduct,
        stockChange: {
          oldQuantity,
          newQuantity,
          difference: newQuantity - oldQuantity,
          reason,
          updatedAt: new Date().toISOString(),
        },
      },
      message: `Stock updated successfully for ${product.title}`,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError("Failed to update stock");
  }
});

// GET /api/products/admin/low-stock - Get products with low stock (admin function)
export const getLowStockProducts = asyncHandler(async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;

    if (threshold < 0) {
      return res.status(400).json({
        success: false,
        error: "Threshold must be non-negative",
        timestamp: new Date().toISOString(),
      });
    }

    const allProducts = await ProductService.getAllProducts();

    const lowStockProducts = allProducts
      .filter((product) => (product.stock_quantity || 0) <= threshold)
      .map((product) => ({
        id: product.id,
        title: product.title,
        category: product.category,
        price: product.price,
        stock_quantity: product.stock_quantity || 0,
        stockStatus:
          product.stock_quantity === 0 ? "out_of_stock" : "low_stock",
        estimatedValue: product.price * (product.stock_quantity || 0),
      }))
      .sort((a, b) => a.stock_quantity - b.stock_quantity); // Sort by lowest stock first

    const summary = {
      totalLowStockProducts: lowStockProducts.length,
      outOfStockCount: lowStockProducts.filter((p) => p.stock_quantity === 0)
        .length,
      lowStockCount: lowStockProducts.filter(
        (p) => p.stock_quantity > 0 && p.stock_quantity <= threshold
      ).length,
      totalValue: lowStockProducts.reduce(
        (sum, p) => sum + p.estimatedValue,
        0
      ),
      threshold,
    };

    const response = {
      success: true,
      data: {
        products: lowStockProducts,
        summary,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    throw new InternalServerError("Failed to retrieve low stock products");
  }
});

// POST /api/products/:id/stock/adjust - Adjust stock with reason tracking
export const adjustStock = asyncHandler(async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID. Product ID must be a positive integer.",
        timestamp: new Date().toISOString(),
      });
    }
    
    const { adjustment, reason = "manual_adjustment", notes } = req.body;

    // Validation
    if (adjustment === undefined || adjustment === null) {
      return res.status(400).json({
        success: false,
        error: "Adjustment amount is required",
        timestamp: new Date().toISOString(),
      });
    }

    const adjustmentAmount = parseInt(adjustment);
    if (isNaN(adjustmentAmount)) {
      return res.status(400).json({
        success: false,
        error: "Adjustment must be a number",
        timestamp: new Date().toISOString(),
      });
    }

    // Check if product exists
    const product = await ProductService.getProductById(productId);
    if (!product) {
      throw new NotFoundError("Product");
    }

    const currentStock = product.stock_quantity || 0;
    const newQuantity = Math.max(0, currentStock + adjustmentAmount); // Prevent negative stock

    // Update stock
    const updatedProduct = await ProductService.updateStock(
      productId,
      newQuantity,
      reason
    );

    const response = {
      success: true,
      data: {
        product: updatedProduct,
        adjustment: {
          previousQuantity: currentStock,
          adjustmentAmount,
          newQuantity,
          reason,
          notes: notes || null,
          adjustedAt: new Date().toISOString(),
        },
      },
      message: `Stock ${
        adjustmentAmount > 0 ? "increased" : "decreased"
      } by ${Math.abs(adjustmentAmount)} for ${product.title}`,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError("Failed to adjust stock");
  }
});
