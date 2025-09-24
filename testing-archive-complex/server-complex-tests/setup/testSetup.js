/**
 * Simplified Test Setup - No database dependency
 * 
 * Provides basic test utilities without database operations
 */

// Setup before each test
beforeEach(async () => {
  // Reset any global state if needed
  // jest.clearAllMocks() is handled by Jest config clearMocks: true
});

// Global cleanup after each test to prevent contamination
afterEach(async () => {
  // Add a small delay to let async operations complete
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Suppress console.log in tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  if (process.env.NODE_ENV === 'test' && !process.env.DEBUG_TESTS) {
    console.log = () => {}; // Silent console.log
    // Keep error logging for debugging
    console.error = originalConsoleError;
  }
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
