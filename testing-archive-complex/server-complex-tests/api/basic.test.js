/**
 * Simple App Test - Verify basic setup works
 */

import request from 'supertest';
import app from '../../app.js';
import { closePool } from '../../config/database.js';

describe('Basic App Setup', () => {
  // Clean up database connections after tests
  afterAll(async () => {
    try {
      await closePool();
    } catch (error) {
      // Ignore cleanup errors
    }  
  });

  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .timeout(30000)
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'OK',
      environment: 'test'
    });
  }, 60000); // 60 second timeout

  it('should respond to root route', async () => {
    const response = await request(app)
      .get('/')
      .timeout(30000)
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'Welcome to Queen Bee Candles API'
    });
  }, 60000); // 60 second timeout
});
