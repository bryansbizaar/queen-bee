/**
 * SAFE Test Environment Variables
 * 
 * CRITICAL: This file ONLY sets environment variables for Jest tests
 * It does NOT override production environment when server runs normally
 */

// Only override environment if we're actually running tests
if (process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('jest'))) {
  console.log('🧪 Loading TEST environment for Jest tests');
  
  // Override database configuration for tests ONLY
  process.env.DATABASE_HOST = 'localhost';
  process.env.DATABASE_PORT = '5432';
  process.env.DATABASE_NAME = 'queen_bee_test';
  process.env.DATABASE_USER = 'bryanowens';
  process.env.DATABASE_PASSWORD = 'testpassword';

  // Test Stripe keys - Use real keys if available, otherwise use test-safe values
  const hasRealStripeKeys = process.env.STRIPE_SECRET_KEY && 
    process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') && 
    process.env.STRIPE_SECRET_KEY.length > 30;
  
  if (!hasRealStripeKeys) {
    // If no real keys, use values that won't call real Stripe API
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_testing';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key_for_testing';
    process.env.USE_STRIPE_MOCKS = 'true';
    console.log('🔧 Using Stripe mocks for testing (no real keys provided)');
  } else {
    console.log('🔑 Using real Stripe test keys for integration testing');
  }

  // Test-specific flags - REDUCE NOISE
  process.env.DISABLE_RATE_LIMITING = 'true';
  process.env.DISABLE_CORS = 'true';
  process.env.LOG_LEVEL = 'silent'; // Reduce test noise
  process.env.SUPPRESS_VALIDATION_LOGS = 'true'; // Hide expected validation errors
  
} else {
  console.log('🚀 Production mode - NOT loading test environment overrides');
}
