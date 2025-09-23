import request from 'supertest';
import app from '../app.js';

describe('API Health Tests', () => {
  describe('Products API', () => {
    test('GET /api/products returns products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('products');
      expect(Array.isArray(response.body.data.products)).toBe(true);
      
      // Should have 4 candle products
      expect(response.body.data.products.length).toBe(4);
    });

    test('Products have required fields', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      const products = response.body.data.products;
      
      products.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('image');
        expect(typeof product.price).toBe('number');
      });
    });
  });

  describe('Server Health', () => {
    test('Server responds to requests', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.status).toBe(200);
    });

    test('CORS headers are present', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      // Should have CORS headers for client requests
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Error Handling', () => {
    test('Returns 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
});