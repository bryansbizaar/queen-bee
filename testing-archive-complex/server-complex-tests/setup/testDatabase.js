/**
 * Test Database Setup and Utilities
 * 
 * Provides:
 * - Test database connection management
 * - Schema setup and teardown
 * - Test data seeding and cleanup
 * - Transaction isolation between tests
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test database configuration - use environment variables for CI
const TEST_DB_CONFIG = {
  user: process.env.DATABASE_USER || 'bryanowens',
  password: process.env.DATABASE_PASSWORD || '', // Use env var for CI, empty for local
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'queen_bee_test'
};

// Database connection pools
let testPool;
let adminPool; // For database creation/deletion

/**
 * Initialize test database connection
 */
export async function initTestDb() {
  try {
    // Since queen_bee_test already exists, we can skip the creation step
    // and connect directly to the test database
    testPool = new Pool(TEST_DB_CONFIG);

    // Test connection
    const client = await testPool.connect();
    await client.query('SELECT NOW()');
    client.release();

    console.log('✅ Test database connection established');
    return testPool;
  } catch (error) {
    console.error('❌ Failed to initialize test database:', error);
    throw error;
  }
}

/**
 * Create test database if it doesn't exist
 */
async function createTestDatabase() {
  const client = await adminPool.connect();
  try {
    // Check if database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [TEST_DB_CONFIG.database]
    );

    if (result.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE "${TEST_DB_CONFIG.database}"`);
      console.log(`✅ Created test database: ${TEST_DB_CONFIG.database}`);
    }
  } catch (error) {
    console.error('❌ Error creating test database:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Setup database schema from init.sql
 */
export async function setupSchema() {
  try {
    // Read the init.sql file
    const schemaPath = path.resolve(__dirname, '../../database/init.sql');
    let schemaSql;
    
    try {
      schemaSql = fs.readFileSync(schemaPath, 'utf8');
    } catch (error) {
      // If init.sql doesn't exist, create basic schema
      schemaSql = getBasicSchema();
      console.log('⚠️ Using basic schema - init.sql not found');
    }

    const client = await testPool.connect();
    try {
      await client.query(schemaSql);
      console.log('✅ Database schema setup complete');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Failed to setup database schema:', error);
    throw error;
  }
}

/**
 * Basic schema if init.sql is not found
 */
function getBasicSchema() {
  return `
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
  `;
}

/**
 * Seed test data with real Queen Bee Candles products
 */
export async function seedTestData() {
  const client = await testPool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data completely
    await client.query('TRUNCATE TABLE order_items, orders, customers, products RESTART IDENTITY CASCADE');
    
    // Ensure we start with a clean slate - delete any remaining products
    await client.query('DELETE FROM products WHERE 1=1');

    // Insert real product data with realistic stock quantities
    const products = [
      {
        title: 'Dragon',
        description: 'Majestic dragon-shaped beeswax candle, hand-crafted with intricate details',
        price: 1500, // $15.00 in cents
        image: 'dragon.jpg',
        category: 'candles',
        stock_quantity: 15 // Realistic stock for premium handcrafted item
      },
      {
        title: 'Corn Cob',
        description: 'Rustic corn cob candle made from pure beeswax, perfect for country decor',
        price: 1600, // $16.00 in cents
        image: 'corn-cob.jpg',
        category: 'candles',
        stock_quantity: 12 // Realistic stock for unique item
      },
      {
        title: 'Bee and Flower',
        description: 'Delicate bee and flower design, symbolizing nature\'s harmony',
        price: 850, // $8.50 in cents
        image: 'bee-and-flower.jpg',
        category: 'candles',
        stock_quantity: 18 // Good stock for popular theme
      },
      {
        title: 'Rose',
        description: 'Elegant rose-shaped candle with natural beeswax fragrance',
        price: 800, // $8.00 in cents
        image: 'rose.jpg',
        category: 'candles',
        stock_quantity: 20 // Highest stock for classic design
      }
    ];

    for (const product of products) {
      await client.query(
        `INSERT INTO products (title, description, price, image, category, stock_quantity, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [product.title, product.description, product.price, product.image, product.category, product.stock_quantity]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Test data seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to seed test data:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Clean up test data between tests
 */
export async function cleanupTestData() {
  const client = await testPool.connect();
  try {
    // Clear transaction-dependent tables first
    await client.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE customers RESTART IDENTITY CASCADE');
    
    // Reset product stock quantities but keep products
    await client.query(`UPDATE products SET stock_quantity = CASE 
      WHEN title = 'Dragon' THEN 15
      WHEN title = 'Corn Cob' THEN 12  
      WHEN title = 'Bee and Flower' THEN 18
      WHEN title = 'Rose' THEN 20
      ELSE stock_quantity
    END`);
    
    console.log('✅ Test data cleanup complete');
  } catch (error) {
    console.error('❌ Failed to cleanup test data:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Clean up and close test database
 */
export async function cleanupTestDb() {
  try {
    if (testPool) {
      // Close the test database connection
      await testPool.end();
      testPool = null;
      console.log('✅ Test database cleaned up');
    }
    if (adminPool) {
      await adminPool.end();
      adminPool = null;
    }
  } catch (error) {
    console.error('❌ Error cleaning up test database:', error);
  }
}

/**
 * Close all database connections
 */
export async function closeTestDb() {
  try {
    if (testPool) {
      await testPool.end();
      console.log('✅ Test database pool closed');
    }
    if (adminPool) {
      await adminPool.end();
      console.log('✅ Admin database pool closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
}

/**
 * Get test database pool
 */
export function getTestDb() {
  if (!testPool) {
    throw new Error('Test database not initialized. Call initTestDb() first.');
  }
  return testPool;
}

/**
 * Execute query with test database
 */
export async function query(text, params = []) {
  const client = await testPool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Helper to get a database client for transactions
 */
export async function getClient() {
  return await testPool.connect();
}

/**
 * Create test customer
 */
export async function createTestCustomer(email = 'test@example.com', name = 'Test Customer') {
  const result = await query(
    'INSERT INTO customers (email, first_name) VALUES ($1, $2) RETURNING *',
    [email, name]
  );
  return result.rows[0];
}

/**
 * Create test order
 */
export async function createTestOrder(customerId, totalAmount = 1500, status = 'pending') {
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  const orderId = `QBC-TEST-${Date.now()}-${randomSuffix}`;
  const paymentIntentId = `pi_test_${Date.now()}_${randomSuffix}`;
  
  const result = await query(
    `INSERT INTO orders (order_id, customer_id, customer_email, status, total_amount, payment_intent_id)
     VALUES ($1, $2, 'test@example.com', $3, $4, $5) RETURNING *`,
    [orderId, customerId, status, totalAmount, paymentIntentId]
  );
  return result.rows[0];
}

/**
 * Get product by title for testing
 */
export async function getProductByTitle(title) {
  const result = await query('SELECT * FROM products WHERE title = $1', [title]);
  return result.rows[0];
}
