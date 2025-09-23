// Custom error classes for the client
export class APIError extends Error {
  constructor(message, status, code = null, field = null) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

export class NetworkError extends Error {
  constructor(message = "Network connection failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

// API configuration
const API_CONFIG = {
  baseURL: import.meta.env?.VITE_API_URL || "http://localhost:8080/api",
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Utility function to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Enhanced fetch wrapper with retry logic and better error handling
const fetchWithRetry = async (url, options = {}, attempt = 1) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    // Handle different response types
    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = { message: response.statusText };
      }

      throw new APIError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code,
        errorData.field
      );
    }

    // Parse JSON response
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (error.name === "AbortError") {
      throw new NetworkError("Request timeout");
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new NetworkError("Network connection failed");
    }

    // Retry logic for certain errors
    if (attempt < API_CONFIG.retryAttempts && shouldRetry(error)) {
      if (import.meta.env?.MODE === "development") {
        console.warn(
          `API request failed, retrying... (${attempt}/${API_CONFIG.retryAttempts})`,
          error.message
        );
      }
      await wait(API_CONFIG.retryDelay * attempt); // Exponential backoff
      return fetchWithRetry(url, options, attempt + 1);
    }

    throw error;
  }
};

// Determine if we should retry the request
const shouldRetry = (error) => {
  // Retry on network errors
  if (error instanceof NetworkError) return true;

  // Retry on server errors (5xx) but not client errors (4xx)
  if (error instanceof APIError) {
    return error.status >= 500;
  }

  return false;
};

// API service class
class APIService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetchWithRetry(url, options);

      // Log successful requests in development
      if (import.meta.env?.MODE === "development") {
        console.log(
          `✅ API Success: ${options.method || "GET"} ${endpoint}`,
          response
        );
      }

      return response;
    } catch (error) {
      // Log errors
      console.error(`❌ API Error: ${options.method || "GET"} ${endpoint}`, {
        error: error.message,
        status: error.status,
        code: error.code,
        field: error.field,
      });

      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, { method: "GET" });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

// Create API service instance
const apiService = new APIService();

// Product API methods
export const productAPI = {
  // Get all products with filtering and pagination
  getAll: async (params = {}) => {
    try {
      const response = await apiService.get("/products", params);
      return response.data;
    } catch (error) {
      throw new APIError(
        `Failed to load products: ${error.message}`,
        error.status || 500
      );
    }
  },

  // Get product by ID
  getById: async (id) => {
    if (!id || isNaN(id)) {
      throw new ValidationError("Product ID must be a valid number", "id");
    }

    try {
      const response = await apiService.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        throw new APIError("Product not found", 404);
      }
      throw new APIError(
        `Failed to load product: ${error.message}`,
        error.status || 500
      );
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      const response = await apiService.get("/products/categories");
      return response.data;
    } catch (error) {
      throw new APIError(
        `Failed to load categories: ${error.message}`,
        error.status || 500
      );
    }
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    try {
      const response = await apiService.get("/products/search/suggestions", {
        q: query,
      });
      return response.data;
    } catch (error) {
      // Don't throw for search suggestions - just return empty
      console.warn("Search suggestions failed:", error.message);
      return { suggestions: [] };
    }
  },
};

// Stripe/Payment API methods
export const paymentAPI = {
  // Create payment intent
  createPaymentIntent: async (paymentData) => {
    // Validate required fields
    const requiredFields = ["amount", "orderId", "customerEmail", "cartItems"];
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        throw new ValidationError(`${field} is required`, field);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paymentData.customerEmail)) {
      throw new ValidationError("Invalid email format", "customerEmail");
    }

    // Validate amount
    if (isNaN(paymentData.amount) || paymentData.amount <= 0) {
      throw new ValidationError("Amount must be a positive number", "amount");
    }

    try {
      const response = await apiService.post(
        "/stripe/create-payment-intent",
        paymentData
      );
      return response.data;
    } catch (error) {
      throw new APIError(
        `Payment setup failed: ${error.message}`,
        error.status || 500,
        error.code,
        error.field
      );
    }
  },

  // Get payment intent status
  getPaymentIntent: async (paymentIntentId) => {
    if (!paymentIntentId) {
      throw new ValidationError(
        "Payment intent ID is required",
        "paymentIntentId"
      );
    }

    try {
      const response = await apiService.get(
        `/stripe/payment-intent/${paymentIntentId}`
      );
      return response.data;
    } catch (error) {
      throw new APIError(
        `Failed to get payment status: ${error.message}`,
        error.status || 500
      );
    }
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    try {
      const response = await apiService.get("/health");
      return response.data;
    } catch (error) {
      throw new APIError(
        `Health check failed: ${error.message}`,
        error.status || 500
      );
    }
  },
};

// Error handler hook for React components
export const useAPIErrorHandler = () => {
  const handleError = (error) => {
    if (error instanceof ValidationError) {
      // Handle validation errors (show field-specific messages)
      return {
        type: "validation",
        message: error.message,
        field: error.field,
      };
    }

    if (error instanceof NetworkError) {
      // Handle network errors
      return {
        type: "network",
        message: "Please check your internet connection and try again.",
      };
    }

    if (error instanceof APIError) {
      // Handle API errors based on status
      switch (error.status) {
        case 400:
          return {
            type: "client",
            message:
              error.message || "Invalid request. Please check your input.",
          };
        case 401:
          return {
            type: "auth",
            message: "Please log in to continue.",
          };
        case 403:
          return {
            type: "permission",
            message: "You don't have permission to perform this action.",
          };
        case 404:
          return {
            type: "notfound",
            message: error.message || "The requested item was not found.",
          };
        case 429:
          return {
            type: "ratelimit",
            message: "Too many requests. Please try again later.",
          };
        case 500:
        default:
          return {
            type: "server",
            message: "Server error. Our team has been notified.",
          };
      }
    }

    // Unknown error
    return {
      type: "unknown",
      message: "An unexpected error occurred. Please try again.",
    };
  };

  return { handleError };
};

// Default export
export default apiService;
