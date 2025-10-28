-- Migration: Add Dimensions to New Products
-- Date: 2025-10-27
-- Purpose: Add dimension data to the 22 products inserted via add-products.sql
-- Run this: psql -h localhost -U queenbee -d queen_bee_candles -f database/migrations/002_add_dimensions_to_new_products.sql

-- ==================================================================
-- BACKGROUND
-- ==================================================================
-- Products were inserted with dimensions in the description field
-- Format: "150g 11.5H x 8W" means 150g weight, 11.5cm height, 8cm width
-- 
-- This migration extracts those dimensions and populates the proper columns:
-- - weight_kg: Weight in kilograms (converted from grams)
-- - height_mm: Height in millimeters (converted from cm)
-- - length_mm & width_mm: Horizontal dimensions in millimeters
--
-- IMPORTANT: These are CANDLE dimensions only (not packaged)
-- ShippingService will add +40mm per dimension + 50g for packaging

-- ==================================================================
-- DIMENSION UPDATES - Extracted from description strings
-- ==================================================================

-- Featured Products (display_order 5-10)

-- Flower: "40g 3H x 6.5W" → 40g, 65mm×65mm×30mm (flat)
UPDATE products 
SET 
  weight_kg = 0.040,
  length_mm = 65,
  width_mm = 65,
  height_mm = 30
WHERE title = 'Flower';

-- Swirl: "160g 6.5H x 7.5W" → 160g, 75mm×75mm×65mm
UPDATE products 
SET 
  weight_kg = 0.160,
  length_mm = 75,
  width_mm = 75,
  height_mm = 65
WHERE title = 'Swirl';

-- Fern Ball: "280g 8H x 9W" → 280g, 90mm×90mm×80mm (largest product)
UPDATE products 
SET 
  weight_kg = 0.280,
  length_mm = 90,
  width_mm = 90,
  height_mm = 80
WHERE title = 'Fern Ball';

-- Beehive Skep (med): "90g 6.5H x 6W" → 90g, 60mm×60mm×65mm
UPDATE products 
SET 
  weight_kg = 0.090,
  length_mm = 60,
  width_mm = 60,
  height_mm = 65
WHERE title = 'Beehive Skep (med)';

-- Bear and Skep: "50g 6H x 5W" → 50g, 50mm×50mm×60mm
UPDATE products 
SET 
  weight_kg = 0.050,
  length_mm = 50,
  width_mm = 50,
  height_mm = 60
WHERE title = 'Bear and Skep';

-- Woodland Bear: "50g 5.5H x 4.5W" → 50g, 45mm×45mm×55mm
UPDATE products 
SET 
  weight_kg = 0.050,
  length_mm = 45,
  width_mm = 45,
  height_mm = 55
WHERE title = 'Woodland Bear';

-- Regular Catalog (display_order 11+)

-- Honey Pot: "135g 5H x 7W" → 135g, 70mm×70mm×50mm
UPDATE products 
SET 
  weight_kg = 0.135,
  length_mm = 70,
  width_mm = 70,
  height_mm = 50
WHERE title = 'Honey Pot';

-- Old Man Winter: "95g 7H x 5W" → 95g, 50mm×50mm×70mm
UPDATE products 
SET 
  weight_kg = 0.095,
  length_mm = 50,
  width_mm = 50,
  height_mm = 70
WHERE title = 'Old Man Winter';

-- Beehive Skep (sm): "30g 4H x 3.5W" → 30g, 35mm×35mm×40mm (smallest)
UPDATE products 
SET 
  weight_kg = 0.030,
  length_mm = 35,
  width_mm = 35,
  height_mm = 40
WHERE title = 'Beehive Skep (sm)';

-- Pinecone (sm): "25g 4H x 3.5W" → 25g, 35mm×35mm×40mm (lightest)
UPDATE products 
SET 
  weight_kg = 0.025,
  length_mm = 35,
  width_mm = 35,
  height_mm = 40
WHERE title = 'Pinecone (sm)';

-- Pinecone (lg): "65g 8.5H x 4W" → 65g, 40mm×40mm×85mm (tall & thin)
UPDATE products 
SET 
  weight_kg = 0.065,
  length_mm = 40,
  width_mm = 40,
  height_mm = 85
WHERE title = 'Pinecone (lg)';

-- Snowman: "35g 6H x 4W" → 35g, 40mm×40mm×60mm
UPDATE products 
SET 
  weight_kg = 0.035,
  length_mm = 40,
  width_mm = 40,
  height_mm = 60
WHERE title = 'Snowman';

-- Morel Mushroom: "80g 11H x 4.5W each" → 80g, 45mm×45mm×110mm (very tall)
UPDATE products 
SET 
  weight_kg = 0.080,
  length_mm = 45,
  width_mm = 45,
  height_mm = 110
WHERE title = 'Morel Mushroom';

-- Flowers (set of 4): "80g (4x 20g) 2H x 4W" → 80g total, treat as flat set 40mm×40mm×20mm
UPDATE products 
SET 
  weight_kg = 0.080,
  length_mm = 40,
  width_mm = 40,
  height_mm = 20
WHERE title = 'Flowers (set of 4)';

-- Beehive Skep (lg): "245g 8H x 7.5W" → 245g, 75mm×75mm×80mm (heavy)
UPDATE products 
SET 
  weight_kg = 0.245,
  length_mm = 75,
  width_mm = 75,
  height_mm = 80
WHERE title = 'Beehive Skep (lg)';

-- Tree (sm): "40g 8H x 4W" → 40g, 40mm×40mm×80mm (tall & thin)
UPDATE products 
SET 
  weight_kg = 0.040,
  length_mm = 40,
  width_mm = 40,
  height_mm = 80
WHERE title = 'Tree (sm)';

-- Tree (lg): "200g 14H x 7W" → 200g, 70mm×70mm×140mm (very tall)
UPDATE products 
SET 
  weight_kg = 0.200,
  length_mm = 70,
  width_mm = 70,
  height_mm = 140
WHERE title = 'Tree (lg)';

-- Turkey: "100g 9H x 8W" → 100g, 80mm×80mm×90mm
UPDATE products 
SET 
  weight_kg = 0.100,
  length_mm = 80,
  width_mm = 80,
  height_mm = 90
WHERE title = 'Turkey';

-- Frog: "120g 6H x 6W" → 120g, 60mm×60mm×60mm (cube-like)
UPDATE products 
SET 
  weight_kg = 0.120,
  length_mm = 60,
  width_mm = 60,
  height_mm = 60
WHERE title = 'Frog';

-- Hedgehog: "60g 5.5H x 5W" → 60g, 50mm×50mm×55mm
UPDATE products 
SET 
  weight_kg = 0.060,
  length_mm = 50,
  width_mm = 50,
  height_mm = 55
WHERE title = 'Hedgehog';

-- Racoon: "45g 5.5H x 4W" → 45g, 40mm×40mm×55mm
UPDATE products 
SET 
  weight_kg = 0.045,
  length_mm = 40,
  width_mm = 40,
  height_mm = 55
WHERE title = 'Racoon';

-- Moose: "40g 5H x 4W" → 40g, 40mm×40mm×50mm
UPDATE products 
SET 
  weight_kg = 0.040,
  length_mm = 40,
  width_mm = 40,
  height_mm = 50
WHERE title = 'Moose';

-- ==================================================================
-- VERIFICATION - Check results
-- ==================================================================

DO $$
DECLARE
  total_count INTEGER;
  with_dims_count INTEGER;
  missing_dims_count INTEGER;
BEGIN
  -- Count all products
  SELECT COUNT(*) INTO total_count FROM products;
  
  -- Count products with dimensions
  SELECT COUNT(*) INTO with_dims_count 
  FROM products 
  WHERE weight_kg IS NOT NULL;
  
  -- Count products missing dimensions
  SELECT COUNT(*) INTO missing_dims_count 
  FROM products 
  WHERE weight_kg IS NULL;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration 002 Complete!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total products in database: %', total_count;
  RAISE NOTICE 'Products with dimensions: %', with_dims_count;
  RAISE NOTICE 'Products missing dimensions: %', missing_dims_count;
  RAISE NOTICE '';
  
  IF missing_dims_count > 0 THEN
    RAISE NOTICE '⚠️  Warning: % products still need dimensions', missing_dims_count;
  ELSE
    RAISE NOTICE '✅ Success! All products have dimensions!';
  END IF;
  
  RAISE NOTICE '============================================';
END $$;

-- Display summary sorted by weight (lightest to heaviest)
SELECT 
  title,
  price / 100.0 as price_nzd,
  weight_kg || 'kg' as weight,
  length_mm || '×' || width_mm || '×' || height_mm || 'mm' as candle_dims,
  CASE 
    WHEN weight_kg < 0.050 THEN 'XS'
    WHEN weight_kg < 0.100 THEN 'S'
    WHEN weight_kg < 0.150 THEN 'M'
    WHEN weight_kg < 0.200 THEN 'L'
    ELSE 'XL'
  END as size_class
FROM products
WHERE weight_kg IS NOT NULL
ORDER BY weight_kg ASC, title ASC;
