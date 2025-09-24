import { ValidationError, BadRequestError } from "./errors/CustomErrors.js";

// Generic validation middleware factory
export const validateRequest = (validationRules) => {
  return (req, res, next) => {
    try {
      const errors = [];

      // Validate each rule
      for (const rule of validationRules) {
        const error = rule(req);
        if (error) {
          errors.push(error);
        }
      }

      if (errors.length > 0) {
        throw new ValidationError(`Validation failed: ${errors.join(", ")}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation rules
export const validationRules = {
  // Validate product ID parameter
  productId: (req) => {
    const id = req.params.id;

    if (!id) {
      return "Product ID is required";
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      return "Product ID must be a positive integer";
    }

    // Store parsed ID for use in controller
    req.params.id = numericId;
    return null;
  },

  // Validate pagination parameters
  pagination: (req) => {
    const { page, limit } = req.query;

    if (page && (isNaN(page) || parseInt(page) < 1)) {
      return "Page must be a positive integer";
    }

    if (
      limit &&
      (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)
    ) {
      return "Limit must be between 1 and 100";
    }

    // Set defaults and parse
    req.query.page = parseInt(page) || 1;
    req.query.limit = parseInt(limit) || 10;
    return null;
  },

  // Validate search parameters
  search: (req) => {
    const { q, category, minPrice, maxPrice, sortBy } = req.query;

    if (q && (typeof q !== "string" || q.trim().length < 2)) {
      return "Search query must be at least 2 characters";
    }

    if (category && typeof category !== "string") {
      return "Category must be a string";
    }

    if (minPrice && (isNaN(minPrice) || parseFloat(minPrice) < 0)) {
      return "Minimum price must be a non-negative number";
    }

    if (maxPrice && (isNaN(maxPrice) || parseFloat(maxPrice) < 0)) {
      return "Maximum price must be a non-negative number";
    }

    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      return "Minimum price cannot be greater than maximum price";
    }

    if (
      sortBy &&
      !["price", "name", "created", "popularity"].includes(sortBy)
    ) {
      return "Sort by must be one of: price, name, created, popularity";
    }

    return null;
  },

  // Validate Stripe payment data
  stripePayment: (req) => {
    const { amount, orderId, customerEmail, cartItems } = req.body;

    if (!amount || !orderId || !customerEmail || !cartItems) {
      return "Missing required fields: amount, orderId, customerEmail, cartItems";
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return "Invalid email format";
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return "Amount must be a positive number";
    }

    if (numericAmount < 0.5) {
      return "Amount must be at least $0.50 NZD";
    }

    // Validate order ID
    if (typeof orderId !== "string" || orderId.trim().length === 0) {
      return "Order ID must be a non-empty string";
    }

    // Validate cart items
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return "Cart items must be a non-empty array";
    }

    // Validate each cart item
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      if (!item.id || !item.title || !item.price || !item.quantity) {
        return `Cart item ${
          i + 1
        } is missing required fields (id, title, price, quantity)`;
      }

      if (isNaN(item.price) || item.price <= 0) {
        return `Cart item ${i + 1} has invalid price`;
      }

      if (isNaN(item.quantity) || item.quantity <= 0) {
        return `Cart item ${i + 1} has invalid quantity`;
      }
    }

    return null;
  },
};

// Sanitize request body middleware
export const sanitizeRequest = (req, res, next) => {
  try {
    // Remove any potential harmful properties
    const sanitizeObject = (obj) => {
      if (typeof obj !== "object" || obj === null) return obj;

      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip dangerous properties
        if (
          key.startsWith("__") ||
          key === "constructor" ||
          key === "prototype"
        ) {
          continue;
        }

        if (typeof value === "string") {
          // Basic XSS protection - strip HTML tags
          sanitized[key] = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<[^>]*>/g, "")
            .trim();
        } else if (typeof value === "object" && value !== null) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    next();
  } catch (error) {
    next(new BadRequestError("Invalid request data"));
  }
};

// Request size validation middleware
export const validateRequestSize = (req, res, next) => {
  const contentLength = req.get("content-length");
  const maxSize = 10 * 1024 * 1024; // 10MB limit

  if (contentLength && parseInt(contentLength) > maxSize) {
    return next(new BadRequestError("Request body too large"));
  }

  next();
};
