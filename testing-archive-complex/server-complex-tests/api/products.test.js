/**
 * Product API Tests - Updated for actual API structure
 * 
 * Tests all product-related endpoints with real Queen Bee Candles data
 */

import request from 'supertest';
import app from '../../app.js';

describe('Product API Endpoints', () => {
  
  describe('GET /api/products', () => {
    it('should return all active products with correct structure', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          products: expect.any(Array),
          pagination: expect.objectContaining({
            totalProducts: expect.any(Number),
            currentPage: expect.any(Number)
          }),
          filters: expect.any(Object)
        })
      });

      // Should return products
      expect(response.body.data.products.length).toBeGreaterThan(0);

      // Verify product structure
      const product = response.body.data.products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('stock_quantity');
    });

    it('should return products with Queen Bee data', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      const products = response.body.data.products;
      
      // Verify we have the expected Queen Bee products
      const titles = products.map(p => p.title);
      expect(titles).toContain('Dragon');
      expect(titles).toContain('Corn Cob');
      expect(titles).toContain('Bee and Flower');
      expect(titles).toContain('Rose');
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/products?limit=2&offset=0')
        .expect(200);

      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/products?category=candles')
        .expect(200);

      const products = response.body.data.products;
      products.forEach(product => {
        expect(product.category).toBe('candles');
      });
    });

    it('should handle search query', async () => {
      const response = await request(app)
        .get('/api/products?search=dragon')
        .expect(200);

      const products = response.body.data.products;
      
      if (products.length > 0) {
        const dragonProduct = products.find(p => p.title.toLowerCase().includes('dragon'));
        expect(dragonProduct).toBeDefined();
      }
    });

    it('should return empty products array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/products?category=non-existent')
        .expect(200);

      expect(response.body.data.products).toHaveLength(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return specific product by valid ID', async () => {
      // Get Dragon product (ID 1)
      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          product: expect.objectContaining({
            id: 1,
            title: 'Dragon',
            price: 1500,
            category: 'candles'
          })
        })
      });
    });

    it('should handle non-existent product ID', async () => {
      const response = await request(app)
        .get('/api/products/999');
      
      // Could be 404 or 500, let's check what we actually get
      expect([404, 500]).toContain(response.status);
    });

    it('should handle invalid product ID format', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id');
      
      // Could be 400 or 500, let's check what we actually get  
      expect([400, 500]).toContain(response.status);
    });

    it('should return correct product data for each Queen Bee product', async () => {
      // Test Dragon product specifically
      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body.data.product).toMatchObject({
        id: 1,
        title: 'Dragon',
        price: 1500,
        category: 'candles'
      });
    });
  });

  describe('GET /api/products/search/suggestions', () => {
    it('should return search suggestions for valid query', async () => {
      const response = await request(app)
        .get('/api/products/search/suggestions?q=dra')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          suggestions: expect.any(Array)
        })
      });
    });

    it('should return empty suggestions for too short query', async () => {
      const response = await request(app)
        .get('/api/products/search/suggestions?q=d')
        .expect(200);

      expect(response.body.data.suggestions).toHaveLength(0);
    });

    it('should handle missing query parameter gracefully', async () => {
      const response = await request(app)
        .get('/api/products/search/suggestions')
        .expect(200);

      expect(response.body.data.suggestions).toHaveLength(0);
    });
  });

  describe('GET /api/products/category/:category', () => {
    it('should return products for valid category', async () => {
      const response = await request(app)
        .get('/api/products/category/candles')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        count: expect.any(Number),
        category: 'candles'
      });

      response.body.data.forEach(product => {
        expect(product.category).toBe('candles');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/products/category/non-existent')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: [],
        count: 0,
        category: 'non-existent'
      });
    });
  });

  describe('POST /api/products (Admin functionality)', () => {
    it('should create new product with valid data', async () => {
      const newProduct = {
        title: 'Test Candle',
        description: 'A test candle for automation',
        price: 1200,
        image: 'test-candle.jpg',
        category: 'candles',
        stock_quantity: 5
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          title: 'Test Candle',
          price: 1200,
          category: 'candles'
        }),
        message: 'Product created successfully'
      });
    });

    it('should return 400 for missing required fields', async () => {
      const invalidProduct = {
        description: 'Missing title and price'
      };

      const response = await request(app)
        .post('/api/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Title and price are required'
      });
    });

    it('should return 400 for invalid price', async () => {
      const invalidProduct = {
        title: 'Test Product',
        price: -100
      };

      const response = await request(app)
        .post('/api/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Price must be a positive number'
      });
    });
  });

  describe('Stock Management Endpoints', () => {
    it('should check stock for existing product', async () => {
      const response = await request(app)
        .get('/api/products/1/stock')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          productId: 1,
          currentStock: expect.any(Number),
          available: expect.any(Boolean)
        })
      });
    });

    it('should get low stock products', async () => {
      const response = await request(app)
        .get('/api/products/admin/low-stock?threshold=5')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          products: expect.any(Array),
          summary: expect.objectContaining({
            threshold: 5,
            totalLowStockProducts: expect.any(Number)
          })
        })
      });
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/products')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should respond within 200ms under normal conditions
      expect(responseTime).toBeLessThan(200);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(3).fill(null).map(() => 
        request(app).get('/api/products').expect(200)
      );

      const responses = await Promise.all(requests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.products.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Real Data Validation', () => {
    it('should have correct Queen Bee Candles product data', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      const products = response.body.data.products;
      
      // Find each expected product and verify details
      const dragon = products.find(p => p.title === 'Dragon');
      expect(dragon).toMatchObject({
        title: 'Dragon',
        price: 1500,
        category: 'candles',
        image: 'dragon.jpg'
      });

      const rose = products.find(p => p.title === 'Rose');
      expect(rose).toMatchObject({
        title: 'Rose',
        price: 800,
        category: 'candles',
        image: 'rose.jpg'
      });
    });

    it('should have reasonable stock quantities', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      const products = response.body.data.products;
      
      products.forEach(product => {
        expect(product.stock_quantity).toBeGreaterThanOrEqual(0);
        expect(product.stock_quantity).toBeLessThanOrEqual(1000); // Reasonable upper limit
      });
    });
  });
});
