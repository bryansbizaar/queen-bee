import '@testing-library/jest-dom';
import { vi, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';


// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.sessionStorage = sessionStorageMock;

// Mock Image for image loading tests
globalThis.Image = class {
  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 100);
  }
};

// Mock IntersectionObserver for lazy loading tests
globalThis.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock ResizeObserver for responsive components
globalThis.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo for navigation tests
globalThis.scrollTo = vi.fn();

// Mock console methods for cleaner test output
console.error = vi.fn();
console.warn = vi.fn();

// Make navigator.onLine writable for tests
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

import { setupServer } from 'msw/node';
import { handlers } from '../tests/setup/mockApiHandlers';

const server = setupServer(...handlers);

// Make the server instance available globally for tests that need to manipulate handlers
global.server = server;

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-off error cases).
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

// Set up mocks before each test
beforeEach(() => {
  // Reset any previous mocks
  vi.clearAllMocks();

  // Mock the global fetch function
  vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
    })
  );
});

// Clean up after each test
afterEach(() => {
  // Restore all mocked functions to their original implementations
  vi.restoreAllMocks();
});
