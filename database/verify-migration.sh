#!/bin/bash
# Verification script to test database migration
# Run this after migration to ensure everything works

set -e

echo "🧪 Starting migration verification tests..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="ecommerce-postgres"
DB_NAME="queen_bee_candles"
DB_USER="queenbee"
SERVER_URL="http://localhost:8080"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass_test() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail_test() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

info_test() {
  echo -e "${YELLOW}ℹ️  INFO${NC}: $1"
}

# Test 1: Docker container is running
echo "Test 1: Checking Docker container..."
if docker ps | grep -q "${CONTAINER_NAME}"; then
  pass_test "Docker container is running"
else
  fail_test "Docker container is not running"
fi
echo ""

# Test 2: Database tables exist
echo "Test 2: Verifying database schema..."
TABLES=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "\dt" | grep -c "public")
if [ "$TABLES" -ge 4 ]; then
  pass_test "All database tables exist ($TABLES tables found)"
else
  fail_test "Missing database tables (found $TABLES, expected at least 4)"
fi
echo ""

# Test 3: Products table has data
echo "Test 3: Checking products data..."
PRODUCT_COUNT=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM products;")
PRODUCT_COUNT=$(echo $PRODUCT_COUNT | xargs) # Trim whitespace
if [ "$PRODUCT_COUNT" -gt 0 ]; then
  pass_test "Products table has data ($PRODUCT_COUNT products)"
  
  # Show sample product data
  echo ""
  info_test "Sample product data:"
  docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT id, title, stock_quantity, price FROM products ORDER BY id LIMIT 5;"
else
  fail_test "Products table is empty"
fi
echo ""

# Test 4: Orders table exists and has data
echo "Test 4: Checking orders data..."
ORDER_COUNT=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM orders;")
ORDER_COUNT=$(echo $ORDER_COUNT | xargs)
if [ "$ORDER_COUNT" -ge 0 ]; then
  pass_test "Orders table exists ($ORDER_COUNT orders)"
  
  if [ "$ORDER_COUNT" -gt 0 ]; then
    echo ""
    info_test "Recent orders:"
    docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT order_id, customer_email, status, total_amount/100.0 as total_nzd FROM orders ORDER BY created_at DESC LIMIT 3;"
  fi
else
  fail_test "Orders table check failed"
fi
echo ""

# Test 5: Check specific inventory levels
echo "Test 5: Verifying specific inventory levels..."
PRODUCT_5_STOCK=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT stock_quantity FROM products WHERE id = 5;")
PRODUCT_5_STOCK=$(echo $PRODUCT_5_STOCK | xargs)
PRODUCT_6_STOCK=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT stock_quantity FROM products WHERE id = 6;")
PRODUCT_6_STOCK=$(echo $PRODUCT_6_STOCK | xargs)

info_test "Product 5 stock: $PRODUCT_5_STOCK (expected: 6)"
info_test "Product 6 stock: $PRODUCT_6_STOCK (expected: 8)"

if [ "$PRODUCT_5_STOCK" == "6" ] && [ "$PRODUCT_6_STOCK" == "8" ]; then
  pass_test "Inventory levels match expected values"
else
  fail_test "Inventory levels do not match (Product 5: $PRODUCT_5_STOCK, Product 6: $PRODUCT_6_STOCK)"
fi
echo ""

# Test 6: Server connectivity (optional - only if server is running)
echo "Test 6: Testing server connectivity..."
if curl -s "${SERVER_URL}/health" > /dev/null 2>&1 || curl -s "${SERVER_URL}" > /dev/null 2>&1; then
  pass_test "Server is responding"
  
  # Try to fetch products from API
  if curl -s "${SERVER_URL}/api/products" > /dev/null 2>&1; then
    pass_test "Products API endpoint is working"
  else
    info_test "Products API endpoint not accessible (server may need restart)"
  fi
else
  info_test "Server not running or not responding (this is OK if you haven't started it yet)"
fi
echo ""

# Test 7: Database indexes
echo "Test 7: Verifying database indexes..."
INDEX_COUNT=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';")
INDEX_COUNT=$(echo $INDEX_COUNT | xargs)
if [ "$INDEX_COUNT" -ge 8 ]; then
  pass_test "Database indexes are created ($INDEX_COUNT indexes)"
else
  fail_test "Missing database indexes (found $INDEX_COUNT, expected at least 8)"
fi
echo ""

# Test 8: Foreign key relationships
echo "Test 8: Checking foreign key constraints..."
FK_COUNT=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';")
FK_COUNT=$(echo $FK_COUNT | xargs)
if [ "$FK_COUNT" -ge 3 ]; then
  pass_test "Foreign key constraints exist ($FK_COUNT constraints)"
else
  fail_test "Missing foreign key constraints (found $FK_COUNT, expected at least 3)"
fi
echo ""

# Summary
echo "════════════════════════════════════════════"
echo "📊 Test Results Summary"
echo "════════════════════════════════════════════"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed! Migration successful!${NC}"
  echo ""
  echo "🎯 Next steps:"
  echo "1. Start your Node.js server: cd server && npm start"
  echo "2. Test the application in your browser"
  echo "3. Create a test order to verify functionality"
  echo "4. Optional: Stop local PostgreSQL: brew services stop postgresql@15"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed. Please review the errors above.${NC}"
  echo ""
  echo "🔧 Troubleshooting:"
  echo "1. Check Docker logs: docker logs ecommerce-postgres"
  echo "2. Verify restore completed: ./database/restore-to-docker.sh"
  echo "3. Check server logs for connection errors"
  echo "4. Review MIGRATION_GUIDE.md for detailed help"
  exit 1
fi
