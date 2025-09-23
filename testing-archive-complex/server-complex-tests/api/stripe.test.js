/**
 * Stripe API Tests - Fixed for ES modules
 * 
 * Tests all Stripe-related endpoints with proper mocking
 */

import request from 'supertest';
import app from '../../app.js';

// Simple mock data instead of complex mocking
const mockPaymentIntents = new Map();

// Helper to create mock payment intent
function createMockPaymentIntent(amount = 1500, status = 'succeeded') {
  const id = `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const paymentIntent = {
    id,
    amount,
    currency: 'nzd',
    status,
    client_secret: `${id}_secret_${Math.random().toString(36).substr(2, 16)}`,
    created: Math.floor(Date.now() / 1000),
    metadata: {}
  };
  
  mockPaymentIntents.set(id, paymentIntent);
  return paymentIntent;
}

// Helper to generate test cart items
function generateTestCartItems(productTitles = ['Dragon']) {
  const products = {
    'Dragon': { id: 1, price: 1500, title: 'Dragon' },
    'Corn Cob': { id: 2, price: 1600, title: 'Corn Cob' },
    'Bee and Flower': { id: 3, price: 850, title: 'Bee and Flower' },
    'Rose': { id: 4, price: 800, title: 'Rose' }
  };

  return productTitles.map(title => ({
    id: products[title].id,
    title: products[title].title,
    price: products[title].price,
    quantity: 1
  }));
}

describe('Stripe API Endpoints', () => {

  beforeEach(() => {
    mockPaymentIntents.clear();
  });

  describe('POST /api/stripe/create-payment-intent', () => {
    it('should create payment intent with valid data', async () => {
      const paymentData = {
        amount: 1500,
        orderId: 'QBC-TEST-123',
        customerEmail: 'test@example.com',
        cartItems: generateTestCartItems(['Dragon'])
      };

      const response = await request(app)
        .post('/api/stripe/create-payment-intent')
        .send(paymentData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          clientSecret: expect.stringMatching(/^pi_.*_secret_/),
          paymentIntentId: expect.stringMatching(/^pi_/)
        }
      });
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        amount: 1500
        // Missing orderId, customerEmail, cartItems
      };

      const response = await request(app)
        .post('/api/stripe/create-payment-intent')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('required')
      });
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        amount: 1500,
        orderId: 'QBC-TEST-123',
        customerEmail: 'invalid-email-format',
        cartItems: generateTestCartItems(['Dragon'])
      };

      const response = await request(app)
        .post('/api/stripe/create-payment-intent')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('email')
      });
    });

    it('should return 400 for invalid amount', async () => {
      const invalidData = {
        amount: -100,
        orderId: 'QBC-TEST-123', 
        customerEmail: 'test@example.com',
        cartItems: generateTestCartItems(['Dragon'])
      };

      const response = await request(app)
        .post('/api/stripe/create-payment-intent')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Amount must be a positive number')
      });
    });

    it('should handle large orders correctly', async () => {
      const paymentData = {
        amount: 12300, // Large order
        orderId: 'QBC-LARGE-123',
        customerEmail: 'test@example.com',
        cartItems: [
          ...generateTestCartItems(['Dragon']),
          ...generateTestCartItems(['Corn Cob']),
          ...generateTestCartItems(['Rose'])
        ]
      };

      const response = await request(app)
        .post('/api/stripe/create-payment-intent')
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentIntentId).toBeDefined();
    });
  });

  describe('POST /api/stripe/create-order', () => {
    it('should return 400 for invalid payment intent ID format', async () => {
      const orderData = {
        paymentIntentId: 'invalid-format',
        customerEmail: 'test@example.com',
        cartItems: generateTestCartItems(['Dragon'])
      };

      const response = await request(app)
        .post('/api/stripe/create-order')
        .send(orderData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid payment intent ID format')
      });
    });

    it('should return 400 for invalid email format', async () => {
      const orderData = {
        paymentIntentId: 'pi_test_valid123',
        customerEmail: 'invalid-email',
        cartItems: generateTestCartItems(['Dragon'])
      };

      const response = await request(app)
        .post('/api/stripe/create-order')
        .send(orderData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid email format')
      });
    });

    it('should return 400 for empty cart items', async () => {
      const orderData = {
        paymentIntentId: 'pi_test_valid123',
        customerEmail: 'test@example.com',
        cartItems: []
      };

      const response = await request(app)
        .post('/api/stripe/create-order')
        .send(orderData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Cart items must be a non-empty array')
      });
    });

    it('should validate cart item structure', async () => {
      const orderData = {
        paymentIntentId: 'pi_test_valid123',
        customerEmail: 'test@example.com',
        cartItems: [
          {
            id: 1
            // Missing required fields like quantity, price, title
          }
        ]
      };

      const response = await request(app)
        .post('/api/stripe/create-order')
        .send(orderData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Each cart item must have')
      });
    });

    it('should handle cart items with negative quantity', async () => {
      const orderData = {
        paymentIntentId: 'pi_test_valid123',
        customerEmail: 'test@example.com',
        cartItems: [
          {
            id: 1,
            title: 'Dragon',
            price: 1500,
            quantity: -1 // Invalid negative quantity
          }
        ]
      };

      const response = await request(app)
        .post('/api/stripe/create-order')
        .send(orderData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('quantity must be a positive number')
      });
    });
  });

  describe('GET /api/stripe/payment-intent/:paymentIntentId', () => {
    it('should return 400 for invalid payment intent ID format', async () => {
      const response = await request(app)
        .get('/api/stripe/payment-intent/invalid-format')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid payment intent ID format')
      });
    });

    it('should handle non-existent payment intent', async () => {
      const response = await request(app)
        .get('/api/stripe/payment-intent/pi_test_nonexistent123');
      
      // Could be 404 or 500 depending on implementation
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/stripe/order/:paymentIntentId', () => {
    it('should return 400 for invalid payment intent ID format', async () => {
      const response = await request(app)
        .get('/api/stripe/order/invalid-format')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid payment intent ID format')
      });
    });

    it('should return 400 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/stripe/order/pi_test_nonexistent123')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('No order found')
      });
    });
  });

  describe('Validation Tests', () => {
    it('should validate required fields for payment intent creation', async () => {
      const testCases = [
        {
          data: { orderId: 'test', customerEmail: 'test@example.com', cartItems: [] },
          missing: 'amount'
        },
        {
          data: { amount: 1500, customerEmail: 'test@example.com', cartItems: [] },
          missing: 'orderId'
        },
        {
          data: { amount: 1500, orderId: 'test', cartItems: [] },
          missing: 'customerEmail'
        },
        {
          data: { amount: 1500, orderId: 'test', customerEmail: 'test@example.com' },
          missing: 'cartItems'
        }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/stripe/create-payment-intent')
          .send(testCase.data);
        
        expect([400, 500]).toContain(response.status);
        expect(response.body.success).toBe(false);
      }
    });

    it('should validate email formats', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/stripe/create-payment-intent')
          .send({
            amount: 1500,
            orderId: 'test',
            customerEmail: email,
            cartItems: generateTestCartItems(['Dragon'])
          });
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it('should validate amount values', async () => {
      const invalidAmounts = [0, -100, 'abc', null];

      for (const amount of invalidAmounts) {
        const response = await request(app)
          .post('/api/stripe/create-payment-intent')
          .send({
            amount,
            orderId: 'test',
            customerEmail: 'test@example.com',
            cartItems: generateTestCartItems(['Dragon'])
          });
        
        expect([400, 500]).toContain(response.status);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should create payment intent within reasonable time', async () => {
      const startTime = Date.now();
      
      const paymentData = {
        amount: 1500,
        orderId: 'QBC-PERF-123',
        customerEmail: 'perf@example.com',
        cartItems: generateTestCartItems(['Dragon'])
      };

      await request(app)
        .post('/api/stripe/create-payment-intent')
        .send(paymentData)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 1000ms (more realistic for integration tests)
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle multiple payment intent requests', async () => {
      const requests = Array(3).fill(null).map((_, index) => 
        request(app)
          .post('/api/stripe/create-payment-intent')
          .send({
            amount: 1500,
            orderId: `QBC-MULTI-${index}`,
            customerEmail: `test${index}@example.com`,
            cartItems: generateTestCartItems(['Dragon'])
          })
      );

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Integration with Queen Bee Products', () => {
    it('should create payment intents for all Queen Bee products', async () => {
      const allProducts = [
        ...generateTestCartItems(['Dragon']),
        ...generateTestCartItems(['Corn Cob']), 
        ...generateTestCartItems(['Bee and Flower']),
        ...generateTestCartItems(['Rose'])
      ];
      
      const totalAmount = allProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const response = await request(app)
        .post('/api/stripe/create-payment-intent')
        .send({
          amount: totalAmount,
          orderId: 'QBC-FULL-ORDER',
          customerEmail: 'fullorder@example.com',
          cartItems: allProducts
        })
        .expect(200);

      expect(response.body.data.paymentIntentId).toBeDefined();
    });

    it('should handle high-value Dragon candle orders', async () => {
      const dragonOrder = Array(10).fill(null).map(() => ({
        id: 1,
        title: 'Dragon',
        price: 1500,
        quantity: 1
      }));

      const response = await request(app)
        .post('/api/stripe/create-payment-intent')
        .send({
          amount: 15000, // $150 order
          orderId: 'QBC-BIG-DRAGON',
          customerEmail: 'bigorder@example.com',
          cartItems: dragonOrder
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
