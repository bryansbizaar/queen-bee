/**
 * Global Test Setup for Queen Bee Candles
 * 
 * Runs before all tests to:
 * - Initialize test database
 * - Setup database schema
 * - Configure test environment
 */

import { initTestDb, setupSchema, seedTestData } from './testDatabase.js';
import { setupStripeMocks } from './mockStripe.js';

export default async function globalSetup() {
  try {
    console.log('🚀 Starting global test setup...');
    
    // Initialize test database connection
    await initTestDb();
    
    // Setup database schema
    await setupSchema();
    
    // Seed initial test data
    await seedTestData();
    
    // Setup Stripe mocks
    setupStripeMocks();
    
    console.log('✅ Global test setup complete');
    
    // Store setup completion flag
    global.__TEST_SETUP_COMPLETE__ = true;
    
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    process.exit(1);
  }
}
