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
echo "Using API URL: $VITE_API_URL"
npm run build
cd ..

echo "✅ Build complete!"
