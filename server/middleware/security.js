import { TooManyRequestsError } from "./errors/CustomErrors.js";

// Simple in-memory rate limiter (for production, use Redis)
class RateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now - data.windowStart > this.windowMs) {
        this.requests.delete(key);
      }
    }
  }

  isAllowed(identifier) {
    const now = Date.now();
    const data = this.requests.get(identifier);

    if (!data) {
      this.requests.set(identifier, {
        count: 1,
        windowStart: now,
      });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }

    // Check if we're in a new window
    if (now - data.windowStart > this.windowMs) {
      this.requests.set(identifier, {
        count: 1,
        windowStart: now,
      });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }

    // We're in the same window
    if (data.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.windowStart + this.windowMs,
      };
    }

    data.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - data.count,
    };
  }
}

// Create different rate limiters for different endpoints
const limiters = {
  general: new RateLimiter(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  api: new RateLimiter(15 * 60 * 1000, 1000), // 1000 API requests per 15 minutes
  payment: new RateLimiter(60 * 60 * 1000, 10), // 10 payment attempts per hour
  auth: new RateLimiter(15 * 60 * 1000, 5), // 5 auth attempts per 15 minutes (future use)
};

// Rate limiting middleware factory
export const rateLimit = (type = "general", customMessage = null) => {
  return (req, res, next) => {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMITING === 'true') {
      return next();
    }

    const limiter = limiters[type] || limiters.general;
    const identifier = req.ip || req.connection.remoteAddress || "unknown";

    const result = limiter.isAllowed(identifier);

    // Add rate limit headers
    res.set({
      "X-RateLimit-Limit": limiter.maxRequests,
      "X-RateLimit-Remaining": result.remaining,
      "X-RateLimit-Window": Math.ceil(limiter.windowMs / 1000),
    });

    if (!result.allowed) {
      res.set("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

      const message =
        customMessage ||
        `Too many requests. Please try again after ${Math.ceil(
          limiter.windowMs / 60000
        )} minutes.`;

      return next(new TooManyRequestsError(message));
    }

    next();
  };
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  res.set({
    // Prevent XSS attacks
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",

    // HTTPS enforcement (uncomment for production with HTTPS)
    // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Content Security Policy (basic)
    "Content-Security-Policy":
      "default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'",
  });

  next();
};

// Request ID middleware for tracking
export const requestId = (req, res, next) => {
  req.id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  res.set("X-Request-ID", req.id);
  next();
};

// IP tracking middleware
export const ipTracker = (req, res, next) => {
  // Get real IP address (considering proxies)
  const ip =
    req.get("X-Forwarded-For") ||
    req.get("X-Real-IP") ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  req.ip = ip;
  next();
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;

    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      requestId: req.id,
    };

    // Log based on status code
    if (res.statusCode >= 400) {
      console.error("🔴 Request Error:", JSON.stringify(logData));
    } else if (res.statusCode >= 300) {
      console.warn("🟡 Request Redirect:", JSON.stringify(logData));
    } else {
      console.log("🟢 Request Success:", JSON.stringify(logData));
    }

    originalEnd.apply(this, args);
  };

  next();
};

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173", // Vite default
      "http://127.0.0.1:5173",
    ];

    // Add production origins when deployed
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
