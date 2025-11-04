#!/bin/bash
# Test shipping API endpoint locally

echo "======================================"
echo "Testing Shipping API Locally"
echo "======================================"
echo ""

# Check if server is running
echo "1. Checking if server is running..."
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Start it with: cd server && npm start"
    exit 1
fi

echo ""
echo "2. Testing shipping calculation..."
echo ""

# Test with valid data
RESPONSE=$(curl -s -X POST http://localhost:8080/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": 1, "quantity": 2}
    ],
    "postcode": "0110"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""

# Check if response is successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Shipping calculation successful!"
    
    # Extract shipping cost if available
    COST=$(echo "$RESPONSE" | jq -r '.data.options[0].cost // "N/A"' 2>/dev/null)
    if [ "$COST" != "N/A" ] && [ "$COST" != "null" ]; then
        echo "   First shipping option cost: \$$COST"
    fi
else
    echo "❌ Shipping calculation failed"
    ERROR=$(echo "$RESPONSE" | jq -r '.error // .message // "Unknown error"' 2>/dev/null)
    echo "   Error: $ERROR"
fi

echo ""
echo "======================================"
echo "Test Complete"
echo "======================================"
