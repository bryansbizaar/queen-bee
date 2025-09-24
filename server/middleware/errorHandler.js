import { AppError, ValidationError } from "./errors/CustomErrors.js";

// Enhanced error logging function
const logError = (error, req) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get("User-Agent") || "Unknown";
  const ip = req.ip || req.connection.remoteAddress || "Unknown";

  const errorLog = {
    timestamp,
    level: error.statusCode >= 500 ? "ERROR" : "WARN",
    message: error.message,
    statusCode: error.statusCode,
    method,
    url,
    ip,
    userAgent,
    stack: error.stack,
    isOperational: error.isOperational,
    ...(error.field && { field: error.field }),
    ...(error.value && { value: error.value }),
  };

  // In production, you'd send this to a logging service like Winston, Bunyan, or external service
  if (process.env.NODE_ENV === "production") {
    // Only log essential info in production, no stack traces for operational errors
    console.error(
      JSON.stringify({
        ...errorLog,
        stack: error.isOperational ? undefined : error.stack,
      })
    );
  } else {
    // Development: Full error details
    console.error("🚨 Error Details:", errorLog);
  }
};

// Format error response based on environment
const formatErrorResponse = (error, req) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Base error response
  const errorResponse = {
    success: false,
    status: error.status || "error",
    message: error.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Add error-specific fields
  if (error.field) {
    errorResponse.field = error.field;
  }

  // Add request ID if available (useful for tracking)
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  // In development, add more debugging info
  if (!isProduction) {
    errorResponse.stack = error.stack;

    // Add request details for debugging
    errorResponse.debug = {
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: req.body ? JSON.stringify(req.body).substring(0, 500) : undefined,
    };
  }

  // Ensure we have an error property for tests
  if (!errorResponse.error) {
    errorResponse.error = error.message;
  }

  return errorResponse;
};

// Handle specific error types
const handleSpecificErrors = (error) => {
  // MongoDB/Database errors (if you add a database later)
  if (error.name === "CastError") {
    return new AppError("Invalid ID format", 400);
  }

  if (error.code === 11000) {
    return new AppError("Duplicate field value", 400);
  }

  if (error.name === "ValidationError") {
    // Handle our custom ValidationError
    if (error instanceof ValidationError) {
      return error;
    }
    // Handle MongoDB-style validation errors
    const errors = Object.values(error.errors).map((val) => val.message);
    return new AppError(`Invalid input data: ${errors.join(". ")}`, 400);
  }

  // JWT errors (for future authentication)
  if (error.name === "JsonWebTokenError") {
    return new AppError("Invalid token", 401);
  }

  if (error.name === "TokenExpiredError") {
    return new AppError("Token expired", 401);
  }

  // File system errors
  if (error.code === "ENOENT") {
    return new AppError("File not found", 404);
  }

  if (error.code === "EACCES") {
    return new AppError("Permission denied", 403);
  }

  // Stripe errors
  if (error.type === "StripeCardError") {
    return new AppError(`Payment failed: ${error.message}`, 400);
  }

  if (error.type === "StripeInvalidRequestError") {
    return new AppError("Invalid payment request", 400);
  }

  return error;
};

// Main error handling middleware
export const globalErrorHandler = (error, req, res, next) => {
  // Handle specific error types
  let processedError = handleSpecificErrors(error);

  // If it's not an operational error, convert it
  if (!processedError.isOperational) {
    processedError = new AppError(
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : processedError.message,
      processedError.statusCode || 500,
      false
    );
  }

  // Log the error
  logError(processedError, req);

  // Format and send response
  const errorResponse = formatErrorResponse(processedError, req);

  res.status(processedError.statusCode || 500).json(errorResponse);
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper for route handlers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Graceful shutdown handler
export const setupGracefulShutdown = (server) => {
  const gracefulShutdown = (signal) => {
    console.log(`🛑 ${signal} received. Starting graceful shutdown...`);

    server.close((err) => {
      if (err) {
        console.error("❌ Error during graceful shutdown:", err);
        process.exit(1);
      }

      console.log("✅ Server closed successfully");
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error("⚠️ Forced shutdown after timeout");
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught Exception:", error);
    gracefulShutdown("UNCAUGHT_EXCEPTION");
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("UNHANDLED_REJECTION");
  });
};
