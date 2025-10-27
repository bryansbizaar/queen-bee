// Test environment setup
process.env.NODE_ENV = 'test';
process.env.DISABLE_RATE_LIMITING = 'true';

// Global teardown - close any open connections after all tests
afterAll(async () => {
  // Give a small delay for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 500));
});

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
