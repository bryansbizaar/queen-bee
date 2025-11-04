#!/bin/bash

# Setup test database for running tests
# This script ensures PostgreSQL is running and test database exists

echo "🔍 Checking for PostgreSQL..."

# Check if Docker container is running
if docker ps | grep -q ecommerce-postgres; then
    echo "✅ Docker PostgreSQL is running"
    
    # Create test database if it doesn't exist
    echo "📦 Setting up test database..."
    docker exec ecommerce-postgres psql -U queenbee -d queen_bee -c "CREATE DATABASE queen_bee_test;" 2>/dev/null || echo "Test database already exists"
    
    echo "✅ Test database ready"
    exit 0
fi

# Check if local PostgreSQL is running
if pg_isready -h localhost -p 5432 &>/dev/null; then
    echo "✅ Local PostgreSQL is running"
    
    # Create test database if it doesn't exist
    echo "📦 Setting up test database..."
    psql -U queenbee -d queen_bee -c "CREATE DATABASE queen_bee_test;" 2>/dev/null || echo "Test database already exists"
    
    echo "✅ Test database ready"
    exit 0
fi

# Neither is running
echo "❌ PostgreSQL is not running!"
echo ""
echo "Please start PostgreSQL:"
echo "  Docker:  docker-compose up -d postgres"
echo "  Local:   brew services start postgresql"
exit 1
