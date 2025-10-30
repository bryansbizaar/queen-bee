-- Quick Fix: Add dimensions to remaining 22 products
-- This completes the migration for all products that were added via production-products.sql
-- Run this if migration 002 didn't catch all products

-- Products 5-10 (Featured)
UPDATE products SET weight_kg = 0.040, length_mm = 65, width_mm = 65, height_mm = 30 WHERE id = 5 AND title = 'Flower';
UPDATE products SET weight_kg = 0.160, length_mm = 75, width_mm = 75, height_mm = 65 WHERE id = 6 AND title = 'Swirl';
UPDATE products SET weight_kg = 0.280, length_mm = 90, width_mm = 90, height_mm = 80 WHERE id = 7 AND title = 'Fern Ball';
UPDATE products SET weight_kg = 0.090, length_mm = 60, width_mm = 60, height_mm = 65 WHERE id = 8 AND title = 'Beehive Skep (med)';
UPDATE products SET weight_kg = 0.050, length_mm = 50, width_mm = 50, height_mm = 60 WHERE id = 9 AND title = 'Bear and Skep';
UPDATE products SET weight_kg = 0.050, length_mm = 45, width_mm = 45, height_mm = 55 WHERE id = 10 AND title = 'Woodland Bear';

-- Products 11-26 (Regular Catalog)
UPDATE products SET weight_kg = 0.135, length_mm = 70, width_mm = 70, height_mm = 50 WHERE id = 11 AND title = 'Honey Pot';
UPDATE products SET weight_kg = 0.095, length_mm = 50, width_mm = 50, height_mm = 70 WHERE id = 12 AND title = 'Old Man Winter';
UPDATE products SET weight_kg = 0.030, length_mm = 35, width_mm = 35, height_mm = 40 WHERE id = 13 AND title = 'Beehive Skep (sm)';
UPDATE products SET weight_kg = 0.025, length_mm = 35, width_mm = 35, height_mm = 40 WHERE id = 14 AND title = 'Pinecone (sm)';
UPDATE products SET weight_kg = 0.065, length_mm = 40, width_mm = 40, height_mm = 85 WHERE id = 15 AND title = 'Pinecone (lg)';
UPDATE products SET weight_kg = 0.035, length_mm = 40, width_mm = 40, height_mm = 60 WHERE id = 16 AND title = 'Snowman';
UPDATE products SET weight_kg = 0.080, length_mm = 45, width_mm = 45, height_mm = 110 WHERE id = 17 AND title = 'Morel Mushroom';
UPDATE products SET weight_kg = 0.080, length_mm = 40, width_mm = 40, height_mm = 20 WHERE id = 18 AND title = 'Flowers (set of 4)';
UPDATE products SET weight_kg = 0.245, length_mm = 75, width_mm = 75, height_mm = 80 WHERE id = 19 AND title = 'Beehive Skep (lg)';
UPDATE products SET weight_kg = 0.040, length_mm = 40, width_mm = 40, height_mm = 80 WHERE id = 20 AND title = 'Tree (sm)';
UPDATE products SET weight_kg = 0.200, length_mm = 70, width_mm = 70, height_mm = 140 WHERE id = 21 AND title = 'Tree (lg)';
UPDATE products SET weight_kg = 0.100, length_mm = 80, width_mm = 80, height_mm = 90 WHERE id = 22 AND title = 'Turkey';
UPDATE products SET weight_kg = 0.120, length_mm = 60, width_mm = 60, height_mm = 60 WHERE id = 23 AND title = 'Frog';
UPDATE products SET weight_kg = 0.060, length_mm = 50, width_mm = 50, height_mm = 55 WHERE id = 24 AND title = 'Hedgehog';
UPDATE products SET weight_kg = 0.045, length_mm = 40, width_mm = 40, height_mm = 55 WHERE id = 25 AND title = 'Racoon';
UPDATE products SET weight_kg = 0.040, length_mm = 40, width_mm = 40, height_mm = 50 WHERE id = 26 AND title = 'Moose';

-- Verify all products have dimensions
SELECT 
    COUNT(*) as total_products,
    COUNT(weight_kg) as with_dimensions,
    COUNT(*) - COUNT(weight_kg) as missing_dimensions
FROM products;

-- Show any products still missing dimensions
SELECT id, title, 'MISSING DIMENSIONS' as status
FROM products 
WHERE weight_kg IS NULL
ORDER BY id;

-- Show summary of all products with dimensions
SELECT 
    id,
    title,
    weight_kg || 'kg' as weight,
    length_mm || 'x' || width_mm || 'x' || height_mm || 'mm' as dimensions
FROM products
WHERE weight_kg IS NOT NULL
ORDER BY id;
