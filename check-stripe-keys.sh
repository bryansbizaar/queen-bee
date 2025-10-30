#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Stripe Key Environment Check"
echo "========================================"
echo ""

# Check if .env files exist
if [ ! -f "client/.env" ]; then
    echo -e "${RED}❌ client/.env not found!${NC}"
    echo "   Create it from client/.env.example"
    exit 1
fi

if [ ! -f "server/.env" ]; then
    echo -e "${RED}❌ server/.env not found!${NC}"
    echo "   Create it from server/.env.example"
    exit 1
fi

# Extract keys
CLIENT_KEY=$(grep VITE_STRIPE_PUBLISHABLE_KEY client/.env | cut -d '=' -f2 | tr -d ' "' | tr -d "'")
SERVER_KEY=$(grep STRIPE_SECRET_KEY server/.env | cut -d '=' -f2 | tr -d ' "' | tr -d "'")

echo -e "${BLUE}📋 Current Keys:${NC}"
echo "   Frontend: ${CLIENT_KEY:0:25}..."
echo "   Backend:  ${SERVER_KEY:0:25}..."
echo ""

# Determine environments
CLIENT_ENV="unknown"
SERVER_ENV="unknown"

if [[ $CLIENT_KEY == pk_test_* ]]; then
    CLIENT_ENV="test"
elif [[ $CLIENT_KEY == pk_live_* ]]; then
    CLIENT_ENV="live"
fi

if [[ $SERVER_KEY == sk_test_* ]]; then
    SERVER_ENV="test"
elif [[ $SERVER_KEY == sk_live_* ]]; then
    SERVER_ENV="live"
fi

echo -e "${BLUE}🔍 Analysis:${NC}"
echo "   Frontend using: $CLIENT_ENV mode"
echo "   Backend using:  $SERVER_ENV mode"
echo ""

# Check for match
if [ "$CLIENT_ENV" == "$SERVER_ENV" ] && [ "$CLIENT_ENV" != "unknown" ]; then
    echo -e "${GREEN}✅ SUCCESS: Both frontend and backend are using $CLIENT_ENV mode${NC}"
    echo ""
    echo -e "${GREEN}Your Stripe keys are properly configured!${NC}"
    exit 0
else
    echo -e "${RED}❌ MISMATCH DETECTED!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  This will cause payment errors like:${NC}"
    echo "   'No such payment_intent' or 'Invalid API key'"
    echo ""
    echo -e "${YELLOW}💡 Fix:${NC}"
    echo "   1. Decide which mode to use (test or live)"
    echo "   2. Update BOTH .env files to match"
    echo "   3. Restart your dev servers"
    echo ""
    echo "   For TEST mode (recommended for development):"
    echo "     client/.env:  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_..."
    echo "     server/.env:  STRIPE_SECRET_KEY=sk_test_..."
    echo ""
    echo "   For LIVE mode (production only):"
    echo "     client/.env:  VITE_STRIPE_PUBLISHABLE_KEY=pk_live_..."
    echo "     server/.env:  STRIPE_SECRET_KEY=sk_live_..."
    echo ""
    echo "   Get keys from: https://dashboard.stripe.com/apikeys"
    exit 1
fi
