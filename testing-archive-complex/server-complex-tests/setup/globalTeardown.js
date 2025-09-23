/**
 * Global Test Teardown for Queen Bee Candles
 * 
 * Runs after all tests to:
 * - Close database connections
 * - Clean up test resources
 */

import { closeTestDb } from './testDatabase.js';

export default async function globalTeardown() {
  try {
    console.log('🧹 Starting global test teardown...');
    
    // Close database connections
    await closeTestDb();
    
    console.log('✅ Global test teardown complete');
    
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't exit with error code in teardown
  }
}
