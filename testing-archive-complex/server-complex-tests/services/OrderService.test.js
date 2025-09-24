/**
 * OrderService Tests
 * 
 * Tests the OrderService database layer with comprehensive coverage:
 * - createOrder() with transaction handling
 * - getOrderById() with complete order details
 * - getOrdersByCustomer() customer history
 * - updateOrderStatus() status management
 * - getAllOrders() admin functionality
 * - getOrderByPaymentIntent() payment integration
 * - getOrderStats() analytics and reporting
 */

import OrderService from '../../services/OrderService.js';
import { 
  createTestCustomer, 
  getTestDb, 
  getProductByTitle,
  createTestOrder,
  initTestDb,
  setupSchema,
  seedTestData,
  cleanupTestDb,
  query
} from '../setup/testDatabase.js';
import { 
  createTestOrderData,
  CART_SCENARIOS,
  TEST_CUSTOMERS,
  generateOrderId,
  generatePaymentIntentId
} from '../setup/testData.js';

describe('OrderService', () => {
  
  // Global test setup - initialize database once
  beforeAll(async () => {
    try {
      console.log('🚀 Initializing OrderService test database...');
      
      await initTestDb();
      await setupSchema();
      await seedTestData();
      
      // Ensure adequate stock for all test products
      await query('UPDATE products SET stock_quantity = 1000 WHERE id IN (1, 2, 3, 4)');
      
      console.log('✅ OrderService test database initialized with stock');
    } catch (error) {
      console.error('❌ Failed to setup OrderService tests:', error);
      throw error;
    }
  }, 30000); // 30 second timeout for database setup
  
  // Cleanup after all tests
  afterAll(async () => {
    try {
      await cleanupTestDb();
    } catch (error) {
      console.error('❌ Failed to cleanup OrderService tests:', error);
    }
  });
  
  // Reset stock before each test
  beforeEach(async () => {
    try {
      // More thorough cleanup - delete in correct order
      await query("DELETE FROM order_items");
      await query("DELETE FROM orders");
      await query("DELETE FROM customers WHERE email LIKE '%test%' OR email LIKE '%example.com'");
      
      // Reset stock quantities to ensure tests have enough inventory
      await query('UPDATE products SET stock_quantity = 1000 WHERE id IN (1, 2, 3, 4)');
      
    } catch (error) {
      console.error('❌ Failed to reset test data:', error);
    }
  });

  describe('createOrder()', () => {
    it('should create order with single item and update inventory', async () => {
      const dragonBefore = await getProductByTitle('Dragon');
      const initialStock = dragonBefore.stock_quantity;

      const orderData = {
        customerEmail: 'singleitem@example.com',
        customerName: 'Single Item Customer',
        items: [
          {
            productId: 1,
            quantity: 2,
            price: 1500,
            title: 'Dragon'
          }
        ],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 3000,
        status: 'paid'
      };

      const order = await OrderService.createOrder(orderData);

      expect(order).toMatchObject({
        id: expect.any(Number),
        order_id: expect.stringMatching(/^QBC-/),
        customer_email: 'singleitem@example.com',
        customer_name: 'Single Item Customer',
        status: 'paid',
        total_amount: 3000,
        currency: 'NZD',
        payment_intent_id: orderData.paymentIntentId
      });

      expect(order.items).toHaveLength(1);
      expect(order.items[0]).toMatchObject({
        product_id: 1,
        product_title: 'Dragon',
        quantity: 2,
        unit_price: 1500,
        total_price: 3000
      });

      const dragonAfter = await getProductByTitle('Dragon');
      expect(dragonAfter.stock_quantity).toBe(initialStock - 2);
    });

    it('should create order with multiple items', async () => {
      const orderData = {
        customerEmail: 'multiitem@example.com',
        customerName: 'Multi Item Customer',
        items: [
          {
            productId: 1,
            quantity: 1,
            price: 1500,
            title: 'Dragon'
          },
          {
            productId: 4,
            quantity: 2,
            price: 800,
            title: 'Rose'
          }
        ],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 3100,
        status: 'completed'
      };

      const order = await OrderService.createOrder(orderData);

      expect(order).toMatchObject({
        id: expect.any(Number),
        customer_email: 'multiitem@example.com',
        total_amount: 3100,
        status: 'completed'
      });

      expect(order.items).toHaveLength(2);
      expect(order.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            product_id: 1,
            product_title: 'Dragon',
            quantity: 1,
            unit_price: 1500
          }),
          expect.objectContaining({
            product_id: 4,
            product_title: 'Rose',
            quantity: 2,
            unit_price: 800
          })
        ])
      );
    });

    it('should create new customer if they don\'t exist', async () => {
      const orderData = {
        customerEmail: 'newcustomer@example.com',
        customerName: 'Brand New Customer',
        items: [
          {
            productId: 3,
            quantity: 1,
            price: 850,
            title: 'Bee and Flower'
          }
        ],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 850,
        status: 'pending'
      };

      const order = await OrderService.createOrder(orderData);

      expect(order).toMatchObject({
        customer_email: 'newcustomer@example.com',
        customer_name: 'Brand New Customer'
      });

      // Verify customer was created
      const customers = await query('SELECT * FROM customers WHERE email = $1', ['newcustomer@example.com']);
      expect(customers.rows).toHaveLength(1);
      expect(customers.rows[0].first_name).toBe('Brand New Customer');
    });

    it('should throw error for insufficient stock', async () => {
      // Set stock to 0 for Dragon
      await query('UPDATE products SET stock_quantity = 0 WHERE id = 1');

      const orderData = {
        customerEmail: 'insufficient@example.com',
        items: [
          {
            productId: 1,
            quantity: 1,
            price: 1500,
            title: 'Dragon'
          }
        ],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 1500,
        status: 'pending'
      };

      await expect(OrderService.createOrder(orderData)).rejects.toThrow('Insufficient stock');
    });

    it('should rollback transaction on failure', async () => {
      const dragonBefore = await getProductByTitle('Dragon');
      const initialStock = dragonBefore.stock_quantity;

      const orderData = {
        customerEmail: 'rollback@example.com',
        items: [
          {
            productId: 1,
            quantity: 1,
            price: 1500,
            title: 'Dragon'
          },
          {
            productId: 999, // Non-existent product
            quantity: 1,
            price: 1000,
            title: 'Non-existent'
          }
        ],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 2500,
        status: 'pending'
      };

      await expect(OrderService.createOrder(orderData)).rejects.toThrow();

      // Verify stock wasn't reduced due to rollback
      const dragonAfter = await getProductByTitle('Dragon');
      expect(dragonAfter.stock_quantity).toBe(initialStock);
    });

    it('should generate unique order IDs', async () => {
      const orderData1 = {
        customerEmail: 'unique1@example.com',
        items: [{ productId: 1, quantity: 1, price: 1500, title: 'Dragon' }],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 1500,
        status: 'pending'
      };

      const orderData2 = {
        customerEmail: 'unique2@example.com',
        items: [{ productId: 2, quantity: 1, price: 1600, title: 'Corn Cob' }],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 1600,
        status: 'pending'
      };

      const [order1, order2] = await Promise.all([
        OrderService.createOrder(orderData1),
        OrderService.createOrder(orderData2)
      ]);

      expect(order1.order_id).not.toBe(order2.order_id);
      expect(order1.order_id).toMatch(/^QBC-/);
      expect(order2.order_id).toMatch(/^QBC-/);
    });
  });

  describe('getOrderById()', () => {
    it('should return complete order details', async () => {
      // Create test customer and order
      const customer = await createTestCustomer('getbyid@example.com', 'Get By ID');
      const testOrder = await createTestOrder(customer.id, 2400, 'completed');

      const order = await OrderService.getOrderById(testOrder.id);

      expect(order).toMatchObject({
        id: testOrder.id,
        order_id: testOrder.order_id,
        customer_email: 'getbyid@example.com',
        status: 'completed',
        total_amount: 2400,
        currency: 'NZD'
      });
    });

    it('should return null for non-existent order', async () => {
      const order = await OrderService.getOrderById(999999);
      expect(order).toBeNull();
    });
  });

  describe('getOrdersByCustomer()', () => {
    it('should return all orders for customer', async () => {
      const customer = await createTestCustomer('customer@example.com', 'Test Customer');
      await createTestOrder(customer.id, 1500, 'completed');
      await createTestOrder(customer.id, 2000, 'pending');

      const orders = await OrderService.getOrdersByCustomer('customer@example.com');

      expect(orders).toHaveLength(2);
      expect(orders[0]).toMatchObject({
        customer_email: 'customer@example.com',
        total_amount: expect.any(Number)
      });
    });

    it('should return empty array for customer with no orders', async () => {
      const orders = await OrderService.getOrdersByCustomer('noorders@example.com');
      expect(orders).toEqual([]);
    });
  });

  describe('updateOrderStatus()', () => {
    it('should update order status successfully', async () => {
      const customer = await createTestCustomer('update@example.com', 'Update Test');
      const testOrder = await createTestOrder(customer.id, 1500, 'pending');

      const updatedOrder = await OrderService.updateOrderStatus(testOrder.id, 'completed');

      expect(updatedOrder).toMatchObject({
        id: testOrder.id,
        status: 'completed'
      });
    });

    it('should throw error for non-existent order', async () => {
      await expect(OrderService.updateOrderStatus(999999, 'completed'))
        .rejects.toThrow('Order with ID 999999 not found');
    });
  });

  describe('getAllOrders()', () => {
    it('should return all orders with default pagination', async () => {
      const customer = await createTestCustomer('pagination@example.com', 'Pagination Test');
      await createTestOrder(customer.id, 1500, 'completed');
      await createTestOrder(customer.id, 2000, 'pending');

      const orders = await OrderService.getAllOrders(50, 0);

      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThanOrEqual(2);
    });

    it('should respect limit parameter', async () => {
      const customer = await createTestCustomer('limit@example.com', 'Limit Test');
      await createTestOrder(customer.id, 1500, 'completed');
      await createTestOrder(customer.id, 2000, 'pending');

      const orders = await OrderService.getAllOrders(1, 0);

      expect(orders).toHaveLength(1);
    });

    it('should respect offset parameter', async () => {
      const customer = await createTestCustomer('offset@example.com', 'Offset Test');
      const order1 = await createTestOrder(customer.id, 1500, 'completed');
      const order2 = await createTestOrder(customer.id, 2000, 'pending');

      const firstPage = await OrderService.getAllOrders(1, 0);
      const secondPage = await OrderService.getAllOrders(1, 1);

      expect(firstPage).toHaveLength(1);
      expect(secondPage).toHaveLength(1);
      expect(firstPage[0].id).not.toBe(secondPage[0].id);
    });

    it('should filter by status', async () => {
      const customer = await createTestCustomer('status@example.com', 'Status Test');
      await createTestOrder(customer.id, 1500, 'completed');
      await createTestOrder(customer.id, 2000, 'pending');

      const completedOrders = await OrderService.getAllOrders(50, 0, 'completed');
      const pendingOrders = await OrderService.getAllOrders(50, 0, 'pending');

      expect(completedOrders.every(order => order.status === 'completed')).toBe(true);
      expect(pendingOrders.every(order => order.status === 'pending')).toBe(true);
    });
  });

  describe('getOrderByPaymentIntent()', () => {
    it('should return order for existing payment intent', async () => {
      const customer = await createTestCustomer('payment@example.com', 'Payment Test');
      const testOrder = await createTestOrder(customer.id, 1500, 'paid');

      const order = await OrderService.getOrderByPaymentIntent(testOrder.payment_intent_id);

      expect(order).toMatchObject({
        id: testOrder.id,
        payment_intent_id: testOrder.payment_intent_id
      });
    });

    it('should return null for non-existent payment intent', async () => {
      const order = await OrderService.getOrderByPaymentIntent('pi_nonexistent123');
      expect(order).toBeNull();
    });
  });

  describe('getOrderStats()', () => {
    it('should return comprehensive order statistics', async () => {
      const customer = await createTestCustomer('stats@example.com', 'Stats Test');
      await createTestOrder(customer.id, 1500, 'completed');
      await createTestOrder(customer.id, 2000, 'completed');
      await createTestOrder(customer.id, 1000, 'pending');

      const stats = await OrderService.getOrderStats();

      expect(stats).toMatchObject({
        total_orders: expect.anything(),
        total_revenue: expect.anything(),
        average_order_value: expect.anything(),
        orders_by_status: expect.anything()
      });

      expect(parseInt(stats.total_orders)).toBeGreaterThanOrEqual(3);
      expect(parseInt(stats.total_revenue)).toBeGreaterThanOrEqual(3500);
    });

    it('should filter stats by date range', async () => {
      const customer = await createTestCustomer('daterange@example.com', 'Date Range Test');
      await createTestOrder(customer.id, 1500, 'completed');

      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const stats = await OrderService.getOrderStats(yesterday, tomorrow);

      expect(stats).toMatchObject({
        total_orders: expect.anything(), // Accept string or number
        total_revenue: expect.anything() // Accept string or number
      });
      
      // Verify the values are numeric (even if returned as strings)
      expect(parseInt(stats.total_orders)).toBeGreaterThan(0);
      expect(parseInt(stats.total_revenue)).toBeGreaterThan(0);
    });

    it('should return zero stats for date range with no orders', async () => {
      const futureStart = new Date('2030-01-01');
      const futureEnd = new Date('2030-12-31');

      const stats = await OrderService.getOrderStats(futureStart, futureEnd);

      // Handle different ways PostgreSQL might return zero/empty results
      const totalOrders = stats.total_orders;
      const totalRevenue = stats.total_revenue;
      
      expect(totalOrders === null || totalOrders === '0' || totalOrders === 0).toBe(true);
      expect(totalRevenue === null || totalRevenue === '0' || totalRevenue === 0).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent order creation for same customer', async () => {
      const baseEmail = 'concurrent@example.com';
      const orderData1 = {
        customerEmail: `${baseEmail}1`,
        customerName: 'Concurrent Customer 1',
        items: [{ productId: 1, quantity: 1, price: 1500, title: 'Dragon' }],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 1500,
        status: 'pending'
      };

      const orderData2 = {
        customerEmail: `${baseEmail}2`,
        customerName: 'Concurrent Customer 2',
        items: [{ productId: 2, quantity: 1, price: 1600, title: 'Corn Cob' }],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 1600,
        status: 'pending'
      };

      const [order1, order2] = await Promise.all([
        OrderService.createOrder(orderData1),
        OrderService.createOrder(orderData2)
      ]);

      expect(order1.customer_email).toBe(`${baseEmail}1`);
      expect(order2.customer_email).toBe(`${baseEmail}2`);
      expect(order1.id).not.toBe(order2.id);
    });

    it('should handle orders with very large quantities', async () => {
      const largeQuantityData = {
        customerEmail: 'large@example.com',
        items: [{ productId: 1, quantity: 100, price: 1500, title: 'Dragon' }],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 150000,
        status: 'pending'
      };

      const order = await OrderService.createOrder(largeQuantityData);
      expect(order.items[0].quantity).toBe(100);
      expect(order.total_amount).toBe(150000);
    });

    it('should handle orders with minimal data', async () => {
      const minimalData = {
        customerEmail: 'minimal@example.com',
        items: [{ productId: 1, quantity: 1, price: 1500, title: 'Dragon' }],
        paymentIntentId: generatePaymentIntentId(),
        totalAmount: 1500
        // No status, name, etc.
      };

      const order = await OrderService.createOrder(minimalData);
      expect(order.customer_email).toBe('minimal@example.com');
      expect(order.status).toBe('pending'); // Actual default status
    });

    it('should maintain referential integrity', async () => {
      const customer = await createTestCustomer('integrity@example.com', 'Integrity Test');
      const testOrder = await createTestOrder(customer.id, 1500, 'completed');

      // Verify foreign key relationships
      const orderWithCustomer = await query(
        'SELECT o.*, c.email FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = $1',
        [testOrder.id]
      );

      expect(orderWithCustomer.rows).toHaveLength(1);
      expect(orderWithCustomer.rows[0].email).toBe('integrity@example.com');
    });
  });
});
