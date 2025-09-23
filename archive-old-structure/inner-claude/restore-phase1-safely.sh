#!/bin/bash

# RESTORE PHASE 1 TESTS WITH SAFETY MODIFICATIONS
# This script restores server tests but prevents environment override issues

echo "🔄 RESTORING PHASE 1 SERVER TESTS (SAFELY)"
echo "=========================================="

BACKUP_DIR="../queen-bee-testing-backup-20250719-120904"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

echo "📁 Found backup directory: $BACKUP_DIR"

cd server || { echo "❌ Server directory not found"; exit 1; }

echo ""
echo "🔄 RESTORING TEST FILES WITH MODIFICATIONS..."

# 1. Restore tests directory structure
if [ -d "$BACKUP_DIR/tests" ]; then
    cp -r "$BACKUP_DIR/tests" .
    echo "✅ Restored: tests/ directory"
else
    echo "❌ No tests directory in backup"
    exit 1
fi

# 2. Restore Jest configuration but modify it
if [ -f "$BACKUP_DIR/jest.config.js" ]; then
    cp "$BACKUP_DIR/jest.config.js" .
    echo "✅ Restored: jest.config.js"
else
    echo "❌ No jest.config.js in backup"
fi

# 3. Create SAFE environment override file
echo ""
echo "🔧 CREATING SAFE TEST ENVIRONMENT CONFIGURATION..."

cat > tests/setup/env.js << 'EOF'
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
  process.env.DATABASE_PASSWORD = '';

  // Test Stripe keys - USE YOUR OWN TEST KEYS
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE';
  process.env.STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE';

  // Test-specific flags
  process.env.DISABLE_RATE_LIMITING = 'true';
  process.env.DISABLE_CORS = 'true';
  process.env.LOG_LEVEL = 'error';
  
} else {
  console.log('🚀 Production mode - NOT loading test environment overrides');
}
EOF

echo "✅ Created SAFE env.js (only activates during Jest tests)"

# 4. Create safe Jest configuration
echo ""
echo "🔧 CREATING SAFE JEST CONFIGURATION..."

cat > jest.config.js << 'EOF'
/**
 * SAFE Jest Configuration for Queen Bee Candles Server Testing
 * Modified to prevent production environment interference
 */

export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  
  // SAFE: Only load env.js when actually running tests
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.js'],
  
  clearMocks: true,
  maxWorkers: 1,
  forceExit: true,
  
  // Coverage settings
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // No transforms - let Node.js handle ES modules natively
  transform: {}
};
EOF

echo "✅ Created safe jest.config.js"

# 5. Create separate test environment file for explicit testing
cat > .env.test << 'EOF'
# SAFE Test Environment File
# This file is ONLY used when NODE_ENV=test is explicitly set

NODE_ENV=test
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_test
DATABASE_USER=bryanowens
DATABASE_PASSWORD=

# Test Stripe keys - REPLACE WITH YOUR OWN
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
EOF

echo "✅ Created safe .env.test"

echo ""
echo "🔍 VERIFYING SAFETY MODIFICATIONS..."

# Check that the new env.js has safety checks
if grep -q "NODE_ENV === 'test'" tests/setup/env.js; then
    echo "✅ env.js has safety check - will only activate during tests"
else
    echo "❌ env.js safety check missing!"
fi

# Count restored test files
TEST_COUNT=$(find tests -name "*.test.js" | wc -l)
echo "✅ Restored $TEST_COUNT test files"

echo ""
echo "🎯 PHASE 1 RESTORATION COMPLETE!"
echo "==============================="
echo "✅ Tests restored with safety modifications"
echo "✅ Environment overrides ONLY active during Jest runs"
echo "✅ Production environment protected"
echo ""
echo "🧪 TEST THE RESTORATION:"
echo "1. Test server still works: npm run dev"
echo "2. Test Phase 1 tests work: npm test"
echo "3. Verify production data: curl http://localhost:8080/api/products/1"
echo ""
echo "🛡️ SAFETY FEATURES:"
echo "- env.js only activates when NODE_ENV=test or running Jest"
echo "- Production server will NOT load test environment"
echo "- Test database separate from production database"
EOF