/**
 * Test Data Fixtures for Queen Bee Candles
 * 
 * Provides realistic test data including:
 * - Real product data from the application
 * - Customer test data
 * - Order scenarios
 * - Payment intent fixtures
 */

/**
 * Real Queen Bee Candles product data
 */
export const TEST_PRODUCTS = [
  {
    id: 1,
    title: 'Dragon',
    description: 'Majestic dragon-shaped beeswax candle, hand-crafted with intricate details',
    price: 1500, // $15.00 in cents
    image: 'dragon.jpg',
    category: 'candles',
    stock_quantity: 10,
    is_active: true
  },
  {
    id: 2,
    title: 'Corn Cob',
    description: 'Rustic corn cob candle made from pure beeswax, perfect for country decor',
    price: 1600, // $16.00 in cents
    image: 'corn-cob.jpg',
    category: 'candles',
    stock_quantity: 15,
    is_active: true
  },
  {
    id: 3,
    title: 'Bee and Flower',
    description: 'Delicate bee and flower design, symbolizing nature\'s harmony',
    price: 850, // $8.50 in cents
    image: 'bee-and-flower.jpg',
    category: 'candles',
    stock_quantity: 20,
    is_active: true
  },
  {
    id: 4,
    title: 'Rose',
    description: 'Elegant rose-shaped candle with natural beeswax fragrance',
    price: 800, // $8.00 in cents
    image: 'rose.jpg',
    category: 'candles',
    stock_quantity: 25,
    is_active: true
  }
];

/**
 * Test customer data
 */
export const TEST_CUSTOMERS = [
  {
    email: 'sarah.williams@example.com',
    first_name: 'Sarah',
    last_name: 'Williams',
    phone: '+64 21 123 4567'
  },
  {
    email: 'mike.johnson@example.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    phone: '+64 27 234 5678'
  },
  {
    email: 'emma.brown@example.com',
    first_name: 'Emma',
    last_name: 'Brown',
    phone: '+64 22 345 6789'
  },
  {
    email: 'test.customer@example.com',
    first_name: 'Test',
    last_name: 'Customer',
    phone: '+64 20 000 0000'
  }
];

/**
 * Cart scenarios for testing
 */
export const CART_SCENARIOS = {
  SINGLE_ITEM: {
    items: [
      {
        id: 1,
        title: 'Dragon',
        price: 1500,
        quantity: 1
      }
    ],
    total: 1500,
    itemCount: 1
  },
  
  MULTIPLE_ITEMS: {
    items: [
      {
        id: 1,
        title: 'Dragon',
        price: 1500,
        quantity: 2
      },
      {
        id: 4,
        title: 'Rose',
        price: 800,
        quantity: 1
      }
    ],
    total: 3800, // (1500 * 2) + 800
    itemCount: 3
  },

  LARGE_ORDER: {
    items: [
      {
        id: 1,
        title: 'Dragon',
        price: 1500,
        quantity: 3
      },
      {
        id: 2,
        title: 'Corn Cob',
        price: 1600,
        quantity: 2
      },
      {
        id: 3,
        title: 'Bee and Flower',
        price: 850,
        quantity: 4
      },
      {
        id: 4,
        title: 'Rose',
        price: 800,
        quantity: 2
      }
    ],
    total: 12300, // (1500*3) + (1600*2) + (850*4) + (800*2)
    itemCount: 11
  },

  HIGH_VALUE_ORDER: {
    items: [
      {
        id: 1,
        title: 'Dragon',
        price: 1500,
        quantity: 10
      },
      {
        id: 2,
        title: 'Corn Cob',
        price: 1600,
        quantity: 5
      }
    ],
    total: 23000, // (1500*10) + (1600*5)
    itemCount: 15
  }
};

/**
 * Order status test scenarios
 */
export const ORDER_STATUS_SCENARIOS = {
  PENDING: 'pending',
  PAID: 'paid',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

/**
 * Shipping address test data
 */
export const TEST_ADDRESSES = {
  AUCKLAND: {
    line1: '123 Queen Street',
    line2: 'Apartment 4B',
    city: 'Auckland',
    state: 'Auckland',
    postal_code: '1010',
    country: 'NZ'
  },
  
  WELLINGTON: {
    line1: '456 Lambton Quay',
    city: 'Wellington',
    state: 'Wellington',
    postal_code: '6011',
    country: 'NZ'
  },

  CHRISTCHURCH: {
    line1: '789 Colombo Street',
    city: 'Christchurch',
    state: 'Canterbury',
    postal_code: '8011',
    country: 'NZ'
  },

  WHANGAREI: {
    line1: '321 Bank Street',
    city: 'Whangarei',
    state: 'Northland',
    postal_code: '0110',
    country: 'NZ'
  }
};

/**
 * API request/response examples
 */
export const API_EXAMPLES = {
  CREATE_ORDER_REQUEST: {
    customerEmail: 'sarah.williams@example.com',
    customerName: 'Sarah Williams',
    items: CART_SCENARIOS.SINGLE_ITEM.items,
    paymentIntentId: 'pi_test_1234567890',
    totalAmount: 1500,
    status: 'paid'
  },

  CREATE_ORDER_RESPONSE: {
    success: true,
    message: 'Order created successfully',
    order: {
      id: 1,
      order_id: 'QBC-1234567890',
      customer_email: 'sarah.williams@example.com',
      status: 'paid',
      total_amount: 1500,
      currency: 'NZD',
      payment_intent_id: 'pi_test_1234567890',
      items: CART_SCENARIOS.SINGLE_ITEM.items
    }
  },

  PAYMENT_INTENT_REQUEST: {
    amount: 1500,
    orderId: 'QBC-1234567890',
    customerEmail: 'sarah.williams@example.com',
    cartItems: CART_SCENARIOS.SINGLE_ITEM.items
  },

  PAYMENT_INTENT_RESPONSE: {
    success: true,
    data: {
      clientSecret: 'pi_test_1234567890_secret_abc123',
      paymentIntentId: 'pi_test_1234567890'
    }
  }
};

/**
 * Error scenarios for testing
 */
export const ERROR_SCENARIOS = {
  INVALID_EMAIL: {
    customerEmail: 'invalid-email',
    expectedError: 'Invalid email format'
  },

  MISSING_ITEMS: {
    customerEmail: 'test@example.com',
    items: [],
    expectedError: 'Missing required fields: customerEmail, items'
  },

  INSUFFICIENT_STOCK: {
    customerEmail: 'test@example.com',
    items: [
      {
        id: 1,
        title: 'Dragon',
        price: 1500,
        quantity: 999 // More than available stock
      }
    ],
    expectedError: 'Insufficient stock'
  },

  INVALID_PRODUCT_ID: {
    customerEmail: 'test@example.com',
    items: [
      {
        id: 999, // Non-existent product
        title: 'Non-existent Product',
        price: 1000,
        quantity: 1
      }
    ],
    expectedError: 'does not exist'
  },

  NEGATIVE_QUANTITY: {
    customerEmail: 'test@example.com',
    items: [
      {
        id: 1,
        title: 'Dragon',
        price: 1500,
        quantity: -1
      }
    ],
    expectedError: 'Item quantity and price must be positive numbers'
  },

  ZERO_AMOUNT: {
    amount: 0,
    expectedError: 'Amount must be a positive number'
  },

  INVALID_PAYMENT_INTENT: {
    paymentIntentId: 'invalid_payment_intent_id',
    expectedError: 'Invalid payment intent ID format'
  }
};

/**
 * Database constraint test scenarios
 */
export const DB_CONSTRAINT_SCENARIOS = {
  DUPLICATE_EMAIL_ORDER: {
    // Test creating multiple orders with same email (should be allowed)
    customerEmail: 'duplicate@example.com',
    orderCount: 3
  },

  DUPLICATE_PAYMENT_INTENT: {
    // Test creating order with duplicate payment intent (should fail)
    paymentIntentId: 'pi_duplicate_test_123',
    expectedError: 'Order already exists for this payment'
  },

  FOREIGN_KEY_VIOLATION: {
    // Test creating order item with non-existent product
    productId: 999,
    expectedError: 'violates foreign key constraint'
  }
};

/**
 * Performance test scenarios
 */
export const PERFORMANCE_SCENARIOS = {
  CONCURRENT_ORDERS: {
    // Test creating multiple orders simultaneously
    orderCount: 10,
    concurrentRequests: 5
  },

  LARGE_CART: {
    // Test performance with large cart
    itemCount: 50,
    uniqueProducts: 4
  },

  BULK_INVENTORY_UPDATE: {
    // Test updating inventory for multiple products
    productCount: 100,
    stockReductions: 10
  }
};

/**
 * Validation test data
 */
export const VALIDATION_TESTS = {
  VALID_EMAILS: [
    'test@example.com',
    'user.name@domain.co.nz',
    'first.last+tag@gmail.com',
    'valid@subdomain.example.org'
  ],

  INVALID_EMAILS: [
    'invalid-email',
    '@example.com',
    'user@',
    'user..name@example.com',
    'user name@example.com'
  ],

  VALID_ORDER_IDS: [
    'QBC-1234567890',
    'QBC-2023-001',
    'QBC-TEST-123'
  ],

  INVALID_ORDER_IDS: [
    '',
    '123',
    'invalid-format',
    null,
    undefined
  ],

  VALID_AMOUNTS: [
    50,   // Minimum amount (50 cents)
    1500, // Standard product price
    10000 // High value order
  ],

  INVALID_AMOUNTS: [
    0,
    -100,
    49,    // Below minimum
    'abc', // Non-numeric
    null,
    undefined
  ]
};

/**
 * Helper functions for test data
 */

/**
 * Get random test customer
 */
export function getRandomCustomer() {
  return TEST_CUSTOMERS[Math.floor(Math.random() * TEST_CUSTOMERS.length)];
}

/**
 * Get random test product
 */
export function getRandomProduct() {
  return TEST_PRODUCTS[Math.floor(Math.random() * TEST_PRODUCTS.length)];
}

/**
 * Generate random order ID
 */
export function generateOrderId() {
  return `QBC-TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Generate random payment intent ID
 */
export function generatePaymentIntentId() {
  return `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

/**
 * Calculate cart total
 */
export function calculateCartTotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Calculate cart item count
 */
export function calculateCartItemCount(items) {
  return items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Create test order data
 */
export function createTestOrderData(scenario = 'SINGLE_ITEM', customer = null) {
  const cartScenario = CART_SCENARIOS[scenario];
  const testCustomer = customer || getRandomCustomer();
  
  return {
    customerEmail: testCustomer.email,
    customerName: testCustomer.first_name,
    items: cartScenario.items.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      title: item.title
    })),
    paymentIntentId: generatePaymentIntentId(),
    totalAmount: cartScenario.total,
    status: 'paid'
  };
}

/**
 * Create test payment intent data
 */
export function createTestPaymentIntentData(scenario = 'SINGLE_ITEM', customer = null) {
  const cartScenario = CART_SCENARIOS[scenario];
  const testCustomer = customer || getRandomCustomer();
  
  return {
    amount: cartScenario.total,
    orderId: generateOrderId(),
    customerEmail: testCustomer.email,
    cartItems: cartScenario.items
  };
}

export default {
  TEST_PRODUCTS,
  TEST_CUSTOMERS,
  CART_SCENARIOS,
  ORDER_STATUS_SCENARIOS,
  TEST_ADDRESSES,
  API_EXAMPLES,
  ERROR_SCENARIOS,
  DB_CONSTRAINT_SCENARIOS,
  PERFORMANCE_SCENARIOS,
  VALIDATION_TESTS,
  getRandomCustomer,
  getRandomProduct,
  generateOrderId,
  generatePaymentIntentId,
  calculateCartTotal,
  calculateCartItemCount,
  createTestOrderData,
  createTestPaymentIntentData
};
