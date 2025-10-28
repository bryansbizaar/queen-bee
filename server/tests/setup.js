// Test environment setup
// Load .env.test BEFORE anything else to ensure correct database
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { closePool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.test file for testing
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

process.env.NODE_ENV = 'test';
process.env.DISABLE_RATE_LIMITING = 'true';

// Verify we're using the test database
if (process.env.DATABASE_NAME !== 'queen_bee_test') {
  console.error('❌ WARNING: Not using test database!');
  console.error('Current database:', process.env.DATABASE_NAME);
  console.error('Expected: queen_bee_test');
  process.exit(1);
}

// Global teardown - close database connections after all tests
afterAll(async () => {
  // Close database pool
  await closePool();
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
