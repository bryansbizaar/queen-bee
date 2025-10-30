-- Queen Bee Candles - Production Products
-- Run this to add real products to production database

-- First, clear the test data
DELETE FROM products;

-- Reset the sequence
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Insert real Queen Bee Candles products (all 26)
INSERT INTO products (
  title, 
  description, 
  price, 
  image, 
  category, 
  stock_quantity, 
  is_featured,
  display_order
) VALUES

-- Featured Products (1-10)
('Dragon', '150g 11.5H x 8W', 1500, 'dragon.jpg', 'candles', 5, true, 1),
('Corn Cob', '160g 15.5H x 4.5W', 1600, 'corn-cob.jpg', 'candles', 12, true, 2),
('Bee and Flower', '45g 3H X 6.5W', 850, 'bee-and-flower.jpg', 'candles', 18, true, 3),
('Rose', '40g 3H X 6.5W', 800, 'rose.jpg', 'candles', 20, true, 4),
('Flower', '40g 3H x 6.5W', 800, 'flower.jpg', 'candles', 10, true, 5),
('Swirl', '160g 6.5H x 7.5W', 1500, 'swirl.jpg', 'candles', 10, true, 6),
('Fern Ball', '280g 8H x 9W', 2000, 'fern-ball.jpg', 'candles', 10, true, 7),
('Beehive Skep (med)', '90g 6.5H x 6W', 1000, 'skep-med.jpg', 'candles', 10, true, 8),
('Bear and Skep', '50g 6H x 5W', 900, 'bear-and-skep.jpg', 'candles', 10, true, 9),
('Woodland Bear', '50g 5.5H x 4.5W', 900, 'bear-lg.jpg', 'candles', 10, true, 10),

-- Regular Catalog (11+)
('Honey Pot', '135g 5H x 7W', 1300, 'honey-pot.jpg', 'candles', 10, false, 11),
('Old Man Winter', '95g 7H x 5W', 1100, 'old-man-winter.jpg', 'candles', 10, false, 12),
('Beehive Skep (sm)', '30g 4H x 3.5W', 700, 'skep-sm.jpg', 'candles', 10, false, 13),
('Pinecone (sm)', '25g 4H x 3.5W', 600, 'pinecone-sm.jpg', 'candles', 10, false, 14),
('Pinecone (lg)', '65g 8.5H x 4W', 900, 'pinecone-lg.jpg', 'candles', 10, false, 15),
('Snowman', '35g 6H x 4W', 800, 'snowman.jpg', 'candles', 10, false, 16),
('Morel Mushroom', '80g 11H x 4.5W each', 1000, 'morel.jpg', 'candles', 10, false, 17),
('Flowers (set of 4)', '80g (4x 20g) 2H x 4W', 1000, 'four-flowers.jpg', 'candles', 10, false, 18),
('Beehive Skep (lg)', '245g 8H x 7.5W', 1700, 'skep-lg.jpg', 'candles', 10, false, 19),
('Tree (sm)', '40g 8H x 4W', 800, 'tree-sm.jpg', 'candles', 10, false, 20),
('Tree (lg)', '200g 14H x 7W', 1600, 'tree-lg.jpg', 'candles', 10, false, 21),
('Turkey', '100g 9H x 8W', 1200, 'turkey.jpg', 'candles', 10, false, 22),
('Frog', '120g 6H x 6W', 1300, 'frog.jpg', 'candles', 10, false, 23),
('Hedgehog', '60g 5.5H x 5W', 800, 'hedgehog.jpg', 'candles', 10, false, 24),
('Racoon', '45g 5.5H x 4W', 800, 'racoon.jpg', 'candles', 10, false, 25),
('Moose', '40g 5H x 4W', 800, 'moose.jpg', 'candles', 10, false, 26);

-- Verify
SELECT id, title, price, stock_quantity, is_featured, display_order 
FROM products 
ORDER BY is_featured DESC, display_order ASC;
