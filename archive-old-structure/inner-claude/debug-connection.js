/**
 * Find out WHY server is connecting to test database
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment from server directory
dotenv.config({ path: './server/.env' });

console.log('🔍 ENVIRONMENT DEBUGGING');
console.log('========================\n');

console.log('📋 Environment Variables:');
console.log(`NODE_ENV: "${process.env.NODE_ENV}"`);
console.log(`DATABASE_NAME: "${process.env.DATABASE_NAME}"`);
console.log(`DATABASE_HOST: "${process.env.DATABASE_HOST}"`);
console.log(`DATABASE_USER: "${process.env.DATABASE_USER}"`);
console.log(`DATABASE_PORT: "${process.env.DATABASE_PORT}"`);

// Test connection to what we THINK is the production database
const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

async function debugConnection() {
  try {
    // Check what database we're actually connecting to
    const dbCheck = await pool.query('SELECT current_database() as db');
    console.log(`\n🔗 Actually connected to: "${dbCheck.rows[0].db}"`);
    
    // Check if this database has the test data
    const dragonCheck = await pool.query(`
      SELECT description 
      FROM products 
      WHERE title = 'Dragon' 
      LIMIT 1
    `);
    
    if (dragonCheck.rows.length > 0) {
      console.log(`\n📦 Dragon description in this database:`);
      console.log(`"${dragonCheck.rows[0].description}"`);
      
      if (dragonCheck.rows[0].description.includes('Majestic dragon-shaped')) {
        console.log('\n❌ PROBLEM FOUND: This database contains TEST DATA');
        console.log('Your server is connecting to the test database!');
        
        console.log('\n🔧 SOLUTION:');
        console.log('1. Your server is somehow using the test database connection');
        console.log('2. Check if NODE_ENV is set to "test" in your environment');
        console.log('3. Make sure your server is loading the right .env file');
        console.log('4. Restart your server with: NODE_ENV=development npm run dev');
      } else {
        console.log('\n✅ This database contains your production data');
        console.log('The issue might be elsewhere...');
      }
    } else {
      console.log('\n❌ No Dragon product found in this database');
      console.log('This database might be empty');
    }
    
    // Show all products in this database
    const allProducts = await pool.query('SELECT id, title, description FROM products ORDER BY id');
    console.log(`\n📦 All products in this database (${allProducts.rows.length} total):`);
    allProducts.rows.forEach(product => {
      console.log(`   ${product.id}: ${product.title}`);
      console.log(`      Description: "${product.description}"`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 PostgreSQL is not running. Start with: brew services start postgresql');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database does not exist. Check your DATABASE_NAME in .env');
    }
  } finally {
    await pool.end();
  }
}

debugConnection();