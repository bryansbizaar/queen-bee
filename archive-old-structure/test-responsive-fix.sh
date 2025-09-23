#!/bin/bash

echo "🔧 Testing Restored Responsive Functions"
echo "========================================"
echo ""

echo "📋 Checking Card.test.jsx imports:"
grep -n "enhancedTestUtils" client/src/components/Card.test.jsx

echo ""
echo "📋 Checking ProductDetail.test.jsx imports:"
grep -n "enhancedTestUtils" client/src/components/ProductDetail.test.jsx

echo ""
echo "📋 Checking if enhancedTestSetup.js exists:"
ls -la client/src/tests/setup/enhancedTestSetup.js 2>/dev/null && echo "✅ enhancedTestSetup.js exists" || echo "❌ enhancedTestSetup.js NOT found"

echo ""
echo "🏃‍♂️ Test the fixed files:"
echo "cd client && npm test Card.test.jsx -- --run"
echo "cd client && npm test ProductDetail.test.jsx -- --run"
