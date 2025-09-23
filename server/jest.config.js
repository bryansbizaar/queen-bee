/**
 * Simple Jest Configuration for Queen Bee Candles Server Testing
 */

export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/simple-tests/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  
  clearMocks: true,
  maxWorkers: 1,
  forceExit: true,
  
  // Handle ES modules - removed extensionsToTreatAsEsm since package.json has "type": "module"
  transform: {},
  
  // Coverage settings (disabled for simple setup)
  collectCoverage: false,
};