#!/bin/bash
# Run database migrations on Render PostgreSQL
# This adds the dimension columns needed for shipping calculations

set -e  # Exit on any error

echo "============================================"
echo "🚀 Queen Bee Candles - Render DB Migration"
echo "============================================"
echo ""

# Check if DATABASE_URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: DATABASE_URL is required"
    echo ""
    echo "Usage: ./database/run_render_migrations.sh 'postgresql://user:pass@host/database'"
    echo ""
    echo "Get your DATABASE_URL from:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Click on 'queen-bee-db' database"
    echo "3. Copy the 'External Database URL'"
    echo ""
    exit 1
fi

DATABASE_URL="$1"

echo "📋 Migration Plan:"
echo "  1. Add dimension columns (weight_kg, length_mm, width_mm, height_mm)"
echo "  2. Update all 26 products with their dimensions"
echo "  3. Verify data integrity"
echo ""
echo "⏱️  Estimated time: 30 seconds"
echo ""
read -p "Press ENTER to continue or Ctrl+C to cancel..."
echo ""

# Run migration 001
echo "📦 Step 1/3: Adding dimension columns..."
psql "$DATABASE_URL" -f database/migrations/001_add_product_dimensions.sql

if [ $? -eq 0 ]; then
    echo "✅ Step 1 complete: Dimension columns added"
else
    echo "❌ Step 1 failed"
    exit 1
fi

echo ""

# Run migration 002
echo "📦 Step 2/3: Adding dimensions to all products..."
psql "$DATABASE_URL" -f database/migrations/002_add_dimensions_to_new_products.sql

if [ $? -eq 0 ]; then
    echo "✅ Step 2 complete: Product dimensions added"
else
    echo "❌ Step 2 failed"
    exit 1
fi

echo ""

# Verify
echo "📊 Step 3/3: Verifying migration..."
psql "$DATABASE_URL" << 'SQL'
\echo ''
\echo '============================================'
\echo 'Migration Verification'
\echo '============================================'

-- Count products with dimensions
SELECT 
    COUNT(*) as total_products,
    COUNT(weight_kg) as products_with_dimensions,
    COUNT(*) - COUNT(weight_kg) as missing_dimensions
FROM products;

\echo ''
\echo 'Sample products (first 5):'
SELECT 
    id,
    title,
    weight_kg,
    length_mm || 'x' || width_mm || 'x' || height_mm || 'mm' as dimensions
FROM products
ORDER BY id
LIMIT 5;

\echo ''
\echo '============================================'
\echo '✅ Migration Complete!'
\echo '============================================'
SQL

echo ""
echo "🎉 All migrations completed successfully!"
echo ""
echo "Next steps:"
echo "1. Test the API endpoint: https://queen-bee-candles.onrender.com/api/products/1"
echo "2. Verify the product has dimension data"
echo "3. Test shipping calculator with products in cart"
echo ""
