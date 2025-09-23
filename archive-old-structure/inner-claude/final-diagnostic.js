/**
 * Final diagnostic - check exactly what's happening with database connections
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment from server directory
dotenv.config({ path: './server/.env' });

console.log('🔍 FINAL DIAGNOSTIC - AFTER CLEANUP');
console.log('===================================\n');

console.log('📋 Current Environment Variables:');
console.log(`   NODE_ENV: "${process.env.NODE_ENV}"`);
console.log(`   DATABASE_NAME: "${process.env.DATABASE_NAME}"`);
console.log(`   DATABASE_HOST: "${process.env.DATABASE_HOST}"`);
console.log(`   DATABASE_USER: "${process.env.DATABASE_USER}"`);
console.log(`   DATABASE_PORT: "${process.env.DATABASE_PORT}"`);

// Test connection to database
const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

async function finalDiagnostic() {
  try {
    // Check which database we're connected to
    const dbCheck = await pool.query('SELECT current_database() as db');
    console.log(`\n🔗 Actually connected to database: "${dbCheck.rows[0].db}"`);
    
    // Get the Dragon product specifically
    const dragonResult = await pool.query(`
      SELECT id, title, description, price, stock_quantity 
      FROM products 
      WHERE title = 'Dragon' 
      LIMIT 1
    `);
    
    if (dragonResult.rows.length > 0) {
      const dragon = dragonResult.rows[0];
      console.log(`\n🐉 Dragon product in database:`);
      console.log(`   ID: ${dragon.id}`);
      console.log(`   Title: ${dragon.title}`);
      console.log(`   Description: "${dragon.description}"`);
      console.log(`   Price: $${(dragon.price / 100).toFixed(2)}`);
      console.log(`   Stock: ${dragon.stock_quantity}`);
      
      if (dragon.description === "150g 11.5H x 8W") {
        console.log('\n✅ DATABASE HAS CORRECT DATA!');
        console.log('   The issue must be in the application code or server cache');
      } else if (dragon.description.includes('Majestic dragon')) {
        console.log('\n❌ DATABASE STILL HAS TEST DATA!');
        console.log('   Need to clean the database directly');
      } else {
        console.log('\n⚠️  DATABASE HAS UNEXPECTED DATA');
      }
    } else {
      console.log('\n❌ No Dragon product found in database');
    }
    
    // Check if there are multiple Dragon products
    const allDragons = await pool.query(`
      SELECT id, title, description 
      FROM products 
      WHERE title ILIKE '%dragon%' 
      ORDER BY id
    `);
    
    if (allDragons.rows.length > 1) {
      console.log(`\n⚠️  Found ${allDragons.rows.length} Dragon-related products:`);
      allDragons.rows.forEach(product => {
        console.log(`   ID ${product.id}: "${product.description}"`);
      });
    }
    
    // Show all products
    const allProducts = await pool.query('SELECT id, title, description FROM products ORDER BY id');
    console.log(`\n📦 All products in database (${allProducts.rows.length} total):`);
    allProducts.rows.forEach(product => {
      console.log(`   ${product.id}: ${product.title} - "${product.description}"`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

finalDiagnostic();