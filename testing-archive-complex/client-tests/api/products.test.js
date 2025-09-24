import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mockSuccessfulApiCall,
  mockFailedApiCall,
  mockNetworkError,
  setupApiMocks,
} from "../setup/mockApi";
import { TEST_PRODUCTS, TEST_API_RESPONSES } from "../setup/testData";

// Mock the API base URL
const API_BASE_URL = "http://localhost:3001";

// Simulate client-side API service functions
const ProductsAPI = {
  async fetchProducts() {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  },

  async fetchProductById(id) {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  },

  async searchProducts(query) {
    const response = await fetch(
      `${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  },

  async getProductsByCategory(category) {
    const response = await fetch(
      `${API_BASE_URL}/api/products/category/${category}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  },
};

describe("Products API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupApiMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchProducts", () => {
    it("successfully fetches all products", async () => {
      mockSuccessfulApiCall(
        "/api/products",
        TEST_API_RESPONSES.success.products
      );

      const result = await ProductsAPI.fetchProducts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(TEST_PRODUCTS.length);
      expect(result.data[0]).toMatchObject({
        id: 1,
        title: "Dragon",
        price: 1500,
        category: "figurine",
      });

      // Simple verification that fetch was called
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/products")
      );
    });

    it("handles empty product list", async () => {
      mockSuccessfulApiCall("/api/products", {
        success: true,
        data: [],
      });

      const result = await ProductsAPI.fetchProducts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it("handles server errors gracefully", async () => {
      mockFailedApiCall(
        "/api/products",
        TEST_API_RESPONSES.error.products,
        500
      );

      await expect(ProductsAPI.fetchProducts()).rejects.toThrow(
        "HTTP error! status: 500"
      );
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it("handles network errors", async () => {
      mockNetworkError("/api/products");

      await expect(ProductsAPI.fetchProducts()).rejects.toThrow(
        "Network error"
      );
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it("handles malformed JSON response", async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(ProductsAPI.fetchProducts()).rejects.toThrow("Invalid JSON");
    });
  });

  describe("fetchProductById", () => {
    it("successfully fetches product by ID", async () => {
      const productId = 1;
      const expectedProduct = TEST_PRODUCTS[0];

      mockSuccessfulApiCall(`/api/products/${productId}`, {
        success: true,
        data: expectedProduct,
      });

      const result = await ProductsAPI.fetchProductById(productId);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(expectedProduct);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/products/${productId}`)
      );
    });

    it("handles product not found (404)", async () => {
      const productId = 999;

      mockFailedApiCall(
        `/api/products/${productId}`,
        {
          success: false,
          error: "Product not found",
        },
        404
      );

      await expect(ProductsAPI.fetchProductById(productId)).rejects.toThrow(
        "HTTP error! status: 404"
      );
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it("handles invalid product ID", async () => {
      const invalidId = "invalid";

      mockFailedApiCall(
        `/api/products/${invalidId}`,
        {
          success: false,
          error: "Invalid product ID",
        },
        400
      );

      await expect(ProductsAPI.fetchProductById(invalidId)).rejects.toThrow(
        "HTTP error! status: 400"
      );
      expect(globalThis.fetch).toHaveBeenCalled();
    });
  });

  describe("searchProducts", () => {
    it("successfully searches products by query", async () => {
      const searchQuery = "dragon";
      const expectedResults = TEST_PRODUCTS.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      mockSuccessfulApiCall("/api/products/search", {
        success: true,
        data: expectedResults,
      });

      const result = await ProductsAPI.searchProducts(searchQuery);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("Dragon");
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it("handles empty search results", async () => {
      const searchQuery = "nonexistent";

      mockSuccessfulApiCall("/api/products/search", {
        success: true,
        data: [],
      });

      const result = await ProductsAPI.searchProducts(searchQuery);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it("handles special characters in search query", async () => {
      const searchQuery = "bee & flower";

      mockSuccessfulApiCall("/api/products/search", {
        success: true,
        data: [TEST_PRODUCTS[2]], // Bee and Flower product
      });

      const result = await ProductsAPI.searchProducts(searchQuery);

      expect(result.success).toBe(true);
      expect(result.data[0].title).toBe("Bee and Flower");

      // Verify the query was properly URL encoded
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("q=bee%20%26%20flower")
      );
    });

    it("handles empty search query", async () => {
      const searchQuery = "";

      mockSuccessfulApiCall("/api/products/search", {
        success: true,
        data: TEST_PRODUCTS,
      });

      const result = await ProductsAPI.searchProducts(searchQuery);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(TEST_PRODUCTS.length); // Returns all products
    });
  });

  describe("getProductsByCategory", () => {
    it("successfully fetches products by category", async () => {
      const category = "figurine";
      const expectedProducts = TEST_PRODUCTS.filter(
        (p) => p.category === category
      );

      mockSuccessfulApiCall(`/api/products/category/${category}`, {
        success: true,
        data: expectedProducts,
      });

      const result = await ProductsAPI.getProductsByCategory(category);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].category).toBe("figurine");
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it("handles invalid category", async () => {
      const category = "invalid-category";

      mockFailedApiCall(
        `/api/products/category/${category}`,
        {
          success: false,
          error: "Invalid category",
        },
        400
      );

      await expect(ProductsAPI.getProductsByCategory(category)).rejects.toThrow(
        "HTTP error! status: 400"
      );
    });

    it("handles empty category results", async () => {
      const category = "empty-category";

      mockSuccessfulApiCall(`/api/products/category/${category}`, {
        success: true,
        data: [],
      });

      const result = await ProductsAPI.getProductsByCategory(category);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("handles timeout errors", async () => {
      // Mock a timeout scenario
      globalThis.fetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Request timeout")), 100);
          })
      );

      await expect(ProductsAPI.fetchProducts()).rejects.toThrow(
        "Request timeout"
      );
    });

    it("handles rate limiting (429 status)", async () => {
      mockFailedApiCall(
        "/api/products",
        {
          success: false,
          error: "Rate limit exceeded",
        },
        429
      );

      await expect(ProductsAPI.fetchProducts()).rejects.toThrow(
        "HTTP error! status: 429"
      );
    });

    it("handles server maintenance (503 status)", async () => {
      mockFailedApiCall(
        "/api/products",
        {
          success: false,
          error: "Service temporarily unavailable",
        },
        503
      );

      await expect(ProductsAPI.fetchProducts()).rejects.toThrow(
        "HTTP error! status: 503"
      );
    });
  });

  describe("Response Validation", () => {
    it("validates required product fields", async () => {
      const incompleteProduct = {
        id: 1,
        title: "Incomplete Product",
        // Missing required fields like price, category, etc.
      };

      mockSuccessfulApiCall("/api/products/1", {
        success: true,
        data: incompleteProduct,
      });

      const result = await ProductsAPI.fetchProductById(1);

      expect(result.data).toMatchObject({
        id: 1,
        title: "Incomplete Product",
      });

      // In a real implementation, you might want to validate required fields
      expect(result.data.price).toBeUndefined();
      expect(result.data.category).toBeUndefined();
    });

    it("handles unexpected response structure", async () => {
      const unexpectedResponse = {
        // Wrong structure - missing 'success' and 'data' wrapper
        products: TEST_PRODUCTS,
      };

      mockSuccessfulApiCall("/api/products", unexpectedResponse);

      const result = await ProductsAPI.fetchProducts();

      expect(result.products).toEqual(TEST_PRODUCTS);
      expect(result.success).toBeUndefined();
    });
  });

  describe("Performance and Reliability", () => {
    it("handles concurrent API calls", async () => {
      // Mock multiple successful responses
      globalThis.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => TEST_API_RESPONSES.success.products,
      });

      // Make multiple concurrent calls
      const promises = Array.from({ length: 5 }, () =>
        ProductsAPI.fetchProducts()
      );
      const results = await Promise.all(promises);

      // All calls should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(TEST_PRODUCTS.length);
      });

      // Should have made 5 separate API calls
      expect(globalThis.fetch).toHaveBeenCalledTimes(5);
    });

    it("measures API response time", async () => {
      mockSuccessfulApiCall(
        "/api/products",
        TEST_API_RESPONSES.success.products
      );

      const startTime = performance.now();
      await ProductsAPI.fetchProducts();
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000); // Should be fast in tests
    });
  });
});
