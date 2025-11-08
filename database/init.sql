-- Queen Bee Candles Database Schema
-- Production database initialization with all products and dimensions

-- Create products table with dimension columns
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  image VARCHAR(255),
  category VARCHAR(100) DEFAULT 'candles',
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  weight_kg DECIMAL(10,3), -- Product weight in kilograms (candle only)
  length_mm INTEGER, -- Longest horizontal dimension in millimeters (candle only)
  width_mm INTEGER, -- Shortest horizontal dimension in millimeters (candle only)
  height_mm INTEGER, -- Vertical dimension in millimeters (candle only)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  customer_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'NZD',
  payment_intent_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_title VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL, -- Price in cents
  total_price INTEGER NOT NULL, -- Total in cents
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Insert all 25 Queen Bee Candles products with dimensions
-- Note: Rose was removed as it was a duplicate of Flower
INSERT INTO products (id, title, description, price, image, category, stock_quantity, is_active, is_featured, display_order, weight_kg, length_mm, width_mm, height_mm) VALUES
(1, 'Dragon', '150g 11.5H x 8W', 1500, 'dragon.jpg', 'candles', 15, true, true, 1, 0.150, 80, 80, 115),
(2, 'Corn Cob', '160g 15.5H x 4.5W', 1600, 'corn-cob.jpg', 'candles', 12, true, true, 2, 0.160, 45, 45, 155),
(3, 'Bee and Flower', '45g 3H X 6.5W', 850, 'bee-and-flower.jpg', 'candles', 18, true, true, 3, 0.045, 65, 65, 30),
(5, 'Flower', '40g 3H x 6.5W', 800, 'flower.jpg', 'candles', 6, true, true, 5, 0.040, 65, 65, 30),
(6, 'Swirl', '160g 6.5H x 7.5W', 1500, 'swirl.jpg', 'candles', 7, true, true, 6, 0.160, 75, 75, 65),
(7, 'Fern Ball', '280g 8H x 9W', 2000, 'fern-ball.jpg', 'candles', 9, true, true, 7, 0.280, 90, 90, 80),
(8, 'Beehive Skep (med)', '90g 6.5H x 6W', 1000, 'skep-lg.jpg', 'candles', 9, true, true, 8, 0.090, 60, 60, 65),
(9, 'Bear and Skep', '50g 6H x 5W', 900, 'bear-and-skep.jpg', 'candles', 8, true, true, 9, 0.050, 50, 50, 60),
(10, 'Woodland Bear', '50g 5.5H x 4.5W', 900, 'bear-lg.jpg', 'candles', 9, true, true, 10, 0.050, 45, 45, 55),
(11, 'Honey Pot', '135g 5H x 7W', 1300, 'honey-pot.jpg', 'candles', 9, true, false, 11, 0.135, 70, 70, 50),
(12, 'Old Man Winter', '95g 7H x 5W', 1100, 'old-man-winter.jpg', 'candles', 9, true, false, 12, 0.095, 50, 50, 70),
(13, 'Beehive Skep (sm)', '30g 4H x 3.5W', 700, 'skep-sm.jpg', 'candles', 9, true, false, 13, 0.030, 35, 35, 40),
(14, 'Pinecone (sm)', '25g 4H x 3.5W', 600, 'pinecone-sm.jpg', 'candles', 10, true, false, 14, 0.025, 35, 35, 40),
(15, 'Pinecone (lg)', '65g 8.5H x 4W', 900, 'pinecone-lg.jpg', 'candles', 10, true, false, 15, 0.065, 40, 40, 85),
(16, 'Snowman', '35g 6H x 4W', 800, 'snowman.jpg', 'candles', 10, true, false, 16, 0.035, 40, 40, 60),
(17, 'Morel Mushroom', '80g 11H x 4.5W each', 1000, 'morel.jpg', 'candles', 10, true, false, 17, 0.080, 45, 45, 110),
(18, 'Flowers (set of 4)', '80g (4x 20g) 2H x 4W', 1000, 'four-flowers.jpg', 'candles', 10, true, false, 18, 0.080, 40, 40, 20),
(19, 'Beehive Skep (lg)', '245g 8H x 7.5W', 1700, 'skep-lg.jpg', 'candles', 10, true, false, 19, 0.245, 75, 75, 80),
(20, 'Tree (sm)', '40g 8H x 4W', 800, 'tree-sm.jpg', 'candles', 10, true, false, 20, 0.040, 40, 40, 80),
(21, 'Tree (lg)', '200g 14H x 7W', 1600, 'tree-lg.jpg', 'candles', 10, true, false, 21, 0.200, 70, 70, 140),
(22, 'Turkey', '100g 9H x 8W', 1200, 'turkey.jpg', 'candles', 10, true, false, 22, 0.100, 80, 80, 90),
(23, 'Frog', '120g 6H x 6W', 1300, 'tree-sm.jpg', 'candles', 10, true, false, 23, 0.120, 60, 60, 60),
(24, 'Hedgehog', '60g 5.5H x 5W', 800, 'hedgehog.jpg', 'candles', 10, true, false, 24, 0.060, 50, 50, 55),
(25, 'Racoon', '45g 5.5H x 4W', 800, 'racoon.jpg', 'candles', 10, true, false, 25, 0.045, 40, 40, 55),
(26, 'Moose', '40g 5H x 4W', 800, 'moose.jpg', 'candles', 10, true, false, 26, 0.040, 40, 40, 50);

-- Update the sequence to start after the highest ID
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
