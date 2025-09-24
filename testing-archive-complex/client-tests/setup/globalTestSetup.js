// Global test setup that prevents database conflicts
// client/src/tests/setup/globalTestSetup.js

import { beforeAll, beforeEach, afterEach, vi } from 'vitest';
import './customMatchers.js'; // Load custom matchers
import { TEST_CONFIG, mockApiResponses } from './testConfig.js';

beforeAll(() => {
  // Prevent any real database operations during tests
  if (TEST_CONFIG.disableDatabaseWrites) {
    // Mock fetch globally to prevent real API calls
    global.fetch = vi.fn();
  }
  
  console.log('🧪 Test environment initialized with database protection');
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  if (TEST_CONFIG.mockApiCalls) {
    // Set up default API mock responses
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.products)
        });
      }
      
      if (url.includes('/api/stripe/create-payment-intent')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              clientSecret: 'pi_test_mock_secret',
              paymentIntentId: 'pi_test_mock'
            }
          })
        });
      }
      
      // Default mock response
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} })
      });
    });
  }
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks();
});

// Utility functions for tests
export const testUtils = {
  // Safe way to test components without database impact
  renderWithMockData: (component, customData = null) => {
    // This ensures tests use mock data instead of making real API calls
    return component;
  },
  
  // Helper to create consistent test products
  createTestProduct: (overrides = {}) => {
    return {
      id: 1,
      title: "Dragon",
      price: 1500,
      description: "150g 11.5H x 8W", 
      image: "dragon.jpg",
      ...overrides
    };
  },
  
  // Helper for cart testing without persistence
  createTestCartState: (items = []) => {
    return {
      cartItems: items,
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      getCartTotal: () => items.reduce((total, item) => total + (item.price * item.quantity), 0),
      getCartCount: () => items.reduce((count, item) => count + item.quantity, 0),
      clearCart: vi.fn()
    };
  }
};

export default testUtils;
