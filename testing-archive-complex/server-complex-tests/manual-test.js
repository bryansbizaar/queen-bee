/**
 * Simple test script to verify app works
 * Run with: node tests/manual-test.js
 */

import app from '../app.js';
import request from 'supertest';

async function runBasicTests() {
  console.log('🧪 Running basic app tests...');
  
  try {
    // Test health endpoint
    const healthResponse = await request(app)
      .get('/api/health')
      .expect(200);
    
    console.log('✅ Health check passed:', healthResponse.body);
    
    // Test root endpoint
    const rootResponse = await request(app)
      .get('/')
      .expect(200);
    
    console.log('✅ Root endpoint passed:', rootResponse.body);
    
    console.log('🎉 All basic tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runBasicTests();
