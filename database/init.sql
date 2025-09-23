-- Queen Bee Candles Database Schema
-- Production database initialization

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  image VARCHAR(255),
  category VARCHAR(100) DEFAULT 'candles',
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
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
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Insert initial Queen Bee Candles products
INSERT INTO products (title, description, price, image, category, stock_quantity, is_active) VALUES
('Dragon', 'Majestic dragon-shaped beeswax candle, hand-crafted with intricate details', 1500, 'dragon.jpg', 'candles', 15, true),
('Corn Cob', 'Rustic corn cob candle made from pure beeswax, perfect for country decor', 1600, 'corn-cob.jpg', 'candles', 12, true),
('Bee and Flower', 'Delicate bee and flower design, symbolizing nature''s harmony', 850, 'bee-and-flower.jpg', 'candles', 18, true),
('Rose', 'Elegant rose-shaped candle with natural beeswax fragrance', 800, 'rose.jpg', 'candles', 20, true)
ON CONFLICT (title) DO NOTHING;