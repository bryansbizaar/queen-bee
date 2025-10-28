/**
 * Test Database Setup and Seed Data
 * 
 * This file provides controlled, deterministic test data for API tests.
 * Benefits:
 * 1. Tests are predictable - always the same 4 products
 * 2. Tests are isolated - each test run starts fresh
 * 3. Tests are fast - small dataset loads quickly
 * 4. Tests are maintainable - easy to update fixtures
 */

import pool from '../../config/database.js';

// Core test products - These 4 products are used across all tests
export const TEST_PRODUCTS = [
  {
    id: 1,
    title: 'Dragon',
    description: '150g 11.5H x 8W',
    price: 1500, // $15.00
    image: 'dragon.jpg',
    category: 'candles',
    stock_quantity: 15,
    is_active: true,
    is_featured: true,
    display_order: 1
  },
  {
    id: 2,
    title: 'Corn Cob',
    description: '160g 15.5H x 4.5W',
    price: 1600, // $16.00
    image: 'corn-cob.jpg',
    category: 'candles',
    stock_quantity: 12,
    is_active: true,
    is_featured: true,
    display_order: 2
  },
  {
    id: 3,
    title: 'Bee and Flower',
    description: '45g 3H X 6.5W',
    price: 850, // $8.50
    image: 'bee-and-flower.jpg',
    category: 'candles',
    stock_quantity: 18,
    is_active: true,
    is_featured: false,
    display_order: 3
  },
  {
    id: 4,
    title: 'Rose',
    description: '40g 3H X 6.5W',
    price: 800, // $8.00
    image: 'rose.jpg',
    category: 'candles',
    stock_quantity: 20,
    is_active: true,
    is_featured: false,
    display_order: 4
  }
];

/**
 * Seed the test database with known test data
 * This ensures every test run starts with the same predictable state
 */
export async function seedTestData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Clear existing data (in correct order to handle foreign keys)
    await client.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE customers RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
    
    // Insert test products
    for (const product of TEST_PRODUCTS) {
      await client.query(
        `INSERT INTO products 
         (id, title, description, price, image, category, stock_quantity, is_active, is_featured, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          product.id,
          product.title,
          product.description,
          product.price,
          product.image,
          product.category,
          product.stock_quantity,
          product.is_active,
          product.is_featured,
          product.display_order
        ]
      );
    }
    
    // Reset the sequence to start after our seeded products
    await client.query('SELECT setval(\'products_id_seq\', 4, true)');
    
    await client.query('COMMIT');
    console.log('✅ Test data seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Clean up test data between tests (if needed for specific test suites)
 */
export async function cleanupTestData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Only clean up order-related data, keep products
    await client.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE customers RESTART IDENTITY CASCADE');
    
    // Reset product stock quantities to original values
    for (const product of TEST_PRODUCTS) {
      await client.query(
        'UPDATE products SET stock_quantity = $1 WHERE id = $2',
        [product.stock_quantity, product.id]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error cleaning up test data:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default {
  TEST_PRODUCTS,
  seedTestData,
  cleanupTestData
};
