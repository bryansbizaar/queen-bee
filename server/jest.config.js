/**
 * Simple Jest Configuration for Queen Bee Candles Server Testing
 */

export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  clearMocks: true,
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true,
  
  // Handle ES modules - removed extensionsToTreatAsEsm since package.json has "type": "module"
  transform: {},
  
  // Don't transform node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(express-rate-limit)/)',
  ],
  
  // Coverage settings (disabled for simple setup)
  collectCoverage: false,
};