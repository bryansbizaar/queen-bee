#!/usr/bin/env bash
# Render build script for Queen Bee Candles

set -e

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo "📦 Installing client dependencies..."
cd client
npm install

echo "🏗️  Building client for production..."
echo "Environment variables:"
echo "VITE_API_URL=$VITE_API_URL"
echo "NODE_ENV=$NODE_ENV"
echo "VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY:0:20}..."
npm run build
cd ..

echo "✅ Build complete!"
