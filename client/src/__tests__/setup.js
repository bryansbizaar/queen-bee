import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock fetch globally for all tests
// This is needed because Node.js (used in CI) doesn't have fetch by default
if (!global.fetch) {
  global.fetch = vi.fn()
}

// Set up a base URL for API calls in tests
// This allows relative URLs like '/api/products' to work in tests
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080'

// Store the original fetch for potential restoration
const originalFetch = global.fetch

// Helper to reset fetch mock between tests
export const resetFetchMock = () => {
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear()
  }
}

// Make API_BASE_URL available for tests
export { API_BASE_URL }
