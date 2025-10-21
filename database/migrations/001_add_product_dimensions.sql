-- Quick Start Migration: Add Dimensions to 4 Test Products
-- Date: 2025-10-22
-- Purpose: Get shipping calculator working with existing products ASAP
-- Run this: psql -d queenbee -U your_username -f database/migrations/001_add_product_dimensions.sql

-- ==================================================================
-- STEP 1: Add dimension columns
-- ==================================================================

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,3),
ADD COLUMN IF NOT EXISTS length_mm INTEGER,
ADD COLUMN IF NOT EXISTS width_mm INTEGER,
ADD COLUMN IF NOT EXISTS height_mm INTEGER;

-- Add helpful comments to columns
COMMENT ON COLUMN products.weight_kg IS 'Product weight in kilograms (e.g., 0.150 = 150g) - CANDLE ONLY, packaging added by system';
COMMENT ON COLUMN products.length_mm IS 'Longest horizontal dimension in millimeters - CANDLE ONLY';
COMMENT ON COLUMN products.width_mm IS 'Shortest horizontal dimension in millimeters - CANDLE ONLY';
COMMENT ON COLUMN products.height_mm IS 'Vertical dimension in millimeters - CANDLE ONLY';

-- ==================================================================
-- STEP 2: Add estimated dimensions based on your descriptions
-- ==================================================================
-- Using your existing product descriptions as guide
-- Format seen: "150g 11.5H x 8W" → 150g, 80×80×115mm
-- IMPORTANT: These are CANDLE dimensions only
-- ShippingService will add +40mm per dimension + 50g for packaging

-- Dragon: "150g 11.5H x 8W" → 150g, 80mm×80mm×115mm
UPDATE products 
SET 
  weight_kg = 0.150,
  length_mm = 80,
  width_mm = 80,
  height_mm = 115
WHERE title = 'Dragon';

-- Corn Cob: "160g 15.5H x 4.5W" → 160g, 45mm×45mm×155mm (cylindrical)
UPDATE products 
SET 
  weight_kg = 0.160,
  length_mm = 45,
  width_mm = 45,
  height_mm = 155
WHERE title = 'Corn Cob';

-- Bee and Flower: "45g 3H X 6.5W" → 45g, 65mm×65mm×30mm (flat)
UPDATE products 
SET 
  weight_kg = 0.045,
  length_mm = 65,
  width_mm = 65,
  height_mm = 30
WHERE title = 'Bee and Flower';

-- Rose: "40g 3H X 6.5W" → 40g, 65mm×65mm×30mm (flat)
UPDATE products 
SET 
  weight_kg = 0.040,
  length_mm = 65,
  width_mm = 65,
  height_mm = 30
WHERE title = 'Rose';

-- ==================================================================
-- STEP 3: Verify - Should show all 4 products with dimensions
-- ==================================================================

DO $$
DECLARE
  product_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO missing_count FROM products WHERE weight_kg IS NULL;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration Complete!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total products: %', product_count;
  RAISE NOTICE 'Products with dimensions: %', product_count - missing_count;
  RAISE NOTICE 'Products missing dimensions: %', missing_count;
  RAISE NOTICE '';
  
  IF missing_count > 0 THEN
    RAISE NOTICE '⚠️  Some products still need dimensions';
  ELSE
    RAISE NOTICE '✅ All products have dimensions!';
  END IF;
  RAISE NOTICE '============================================';
END $$;

-- Display summary for review
SELECT 
  title,
  price / 100.0 as price_nzd,
  weight_kg || 'kg' as weight,
  length_mm || '×' || width_mm || '×' || height_mm || 'mm' as dimensions,
  CASE 
    WHEN weight_kg < 0.070 THEN 'Small'
    WHEN weight_kg < 0.140 THEN 'Medium'
    ELSE 'Large'
  END as size_category
FROM products
ORDER BY weight_kg;

-- Expected output:
-- Rose             | $8.00  | 0.040kg | 65×65×30mm   | Small
-- Bee and Flower   | $8.50  | 0.045kg | 65×65×30mm   | Small
-- Dragon           | $15.00 | 0.150kg | 80×80×115mm  | Large
-- Corn Cob         | $16.00 | 0.160kg | 45×45×155mm  | Large

-- ==================================================================
-- DONE! Ready to test shipping calculator
-- ==================================================================

-- Notes:
-- - These are CANDLE dimensions (not packaged)
-- - ShippingService will add +40mm per dimension + 50g for packaging
-- - You can measure actual products later and update with real values
-- - For now, this gets you testing the shipping feature!

-- To update a product's dimensions later:
-- UPDATE products SET weight_kg = 0.155, length_mm = 85 WHERE title = 'Dragon';

-- Rollback if needed:
-- ALTER TABLE products 
-- DROP COLUMN IF EXISTS weight_kg,
-- DROP COLUMN IF EXISTS length_mm,
-- DROP COLUMN IF EXISTS width_mm,
-- DROP COLUMN IF EXISTS height_mm;
