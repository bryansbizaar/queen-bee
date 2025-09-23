#!/bin/bash

echo "🧹 Testing ProductDetail.test.jsx after cleanup..."
echo ""

# Check if the test file exists
if [ ! -f "client/src/components/ProductDetail.test.jsx" ]; then
    echo "❌ ProductDetail.test.jsx not found!"
    exit 1
fi

# Check if the import file exists
if [ ! -f "client/src/tests/setup/testUtils.js" ]; then
    echo "❌ testUtils.js not found!"
    exit 1
fi

echo "✅ Test file exists: client/src/components/ProductDetail.test.jsx"
echo "✅ Import file exists: client/src/tests/setup/testUtils.js"
echo ""

# Check the import statement
echo "📋 Checking import statement..."
grep "from.*testUtils" client/src/components/ProductDetail.test.jsx

echo ""
echo "🏃‍♂️ Ready to test! Run:"
echo "cd client && npm test ProductDetail.test.jsx -- --run"
