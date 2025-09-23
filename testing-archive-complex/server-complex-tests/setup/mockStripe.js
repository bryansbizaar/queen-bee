/**
 * Mock Stripe API for Testing
 * 
 * Provides realistic Stripe API mocking for:
 * - Payment Intent creation and retrieval
 * - Error scenarios and edge cases
 * - NZD currency handling
 * - Metadata preservation
 */

// Mock payment intent data
const mockPaymentIntents = new Map();

/**
 * Mock Stripe Payment Intent
 */
export class MockPaymentIntent {
  constructor(data) {
    this.id = data.id || `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.amount = data.amount;
    this.currency = data.currency || 'nzd';
    this.status = data.status || 'requires_payment_method';
    this.client_secret = `${this.id}_secret_${Math.random().toString(36).substr(2, 16)}`;
    this.metadata = data.metadata || {};
    this.description = data.description;
    this.receipt_email = data.receipt_email;
    this.statement_descriptor = data.statement_descriptor;
    this.created = Math.floor(Date.now() / 1000);
    this.automatic_payment_methods = data.automatic_payment_methods;
    
    // Store in mock database
    mockPaymentIntents.set(this.id, this);
  }

  /**
   * Simulate payment success
   */
  succeed() {
    this.status = 'succeeded';
    return this;
  }

  /**
   * Simulate payment failure
   */
  fail(failureCode = 'card_declined') {
    this.status = 'requires_payment_method';
    this.last_payment_error = {
      code: failureCode,
      message: `Your card was declined.`,
      type: 'card_error'
    };
    return this;
  }

  /**
   * Convert to JSON (like Stripe API)
   */
  toJSON() {
    return {
      id: this.id,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      client_secret: this.client_secret,
      metadata: this.metadata,
      description: this.description,
      receipt_email: this.receipt_email,
      statement_descriptor: this.statement_descriptor,
      created: this.created,
      automatic_payment_methods: this.automatic_payment_methods,
      last_payment_error: this.last_payment_error
    };
  }
}

/**
 * Mock Stripe Error Classes
 */
export class StripeError extends Error {
  constructor(message, type = 'api_error', code = null, statusCode = 400) {
    super(message);
    this.name = 'StripeError';
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class StripeCardError extends StripeError {
  constructor(message, code = 'card_declined') {
    super(message, 'card_error', code, 402);
    this.name = 'StripeCardError';
  }
}

export class StripeInvalidRequestError extends StripeError {
  constructor(message, param = null) {
    super(message, 'invalid_request_error', null, 400);
    this.name = 'StripeInvalidRequestError';
    this.param = param;
  }
}

/**
 * Mock Stripe Client
 */
export class MockStripe {
  constructor() {
    this.paymentIntents = {
      create: this.createPaymentIntent.bind(this),
      retrieve: this.retrievePaymentIntent.bind(this),
      update: this.updatePaymentIntent.bind(this),
      confirm: this.confirmPaymentIntent.bind(this)
    };
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(data) {
    // Validate required fields
    if (!data.amount || typeof data.amount !== 'number') {
      throw new StripeInvalidRequestError('Missing required parameter: amount', 'amount');
    }

    if (data.amount < 50) {
      throw new StripeInvalidRequestError('Amount must be at least 50 cents', 'amount');
    }

    if (!data.currency) {
      data.currency = 'nzd';
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));

    // Create mock payment intent
    const paymentIntent = new MockPaymentIntent(data);

    console.log(`🔧 Mock Stripe: Created payment intent ${paymentIntent.id} for ${data.amount} ${data.currency}`);
    
    return paymentIntent.toJSON();
  }

  /**
   * Retrieve payment intent
   */
  async retrievePaymentIntent(id) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 30));

    const paymentIntent = mockPaymentIntents.get(id);
    
    if (!paymentIntent) {
      throw new StripeInvalidRequestError(`No such payment_intent: ${id}`, 'id');
    }

    console.log(`🔧 Mock Stripe: Retrieved payment intent ${id} with status ${paymentIntent.status}`);
    
    return paymentIntent.toJSON();
  }

  /**
   * Update payment intent
   */
  async updatePaymentIntent(id, data) {
    await new Promise(resolve => setTimeout(resolve, 30));

    const paymentIntent = mockPaymentIntents.get(id);
    
    if (!paymentIntent) {
      throw new StripeInvalidRequestError(`No such payment_intent: ${id}`, 'id');
    }

    // Update fields
    Object.assign(paymentIntent, data);
    
    return paymentIntent.toJSON();
  }

  /**
   * Confirm payment intent (simulate payment processing)
   */
  async confirmPaymentIntent(id, data = {}) {
    await new Promise(resolve => setTimeout(resolve, 100));

    const paymentIntent = mockPaymentIntents.get(id);
    
    if (!paymentIntent) {
      throw new StripeInvalidRequestError(`No such payment_intent: ${id}`, 'id');
    }

    // Simulate different outcomes based on test data
    if (data.payment_method === 'pm_card_visa') {
      paymentIntent.succeed();
    } else if (data.payment_method === 'pm_card_chargeDeclined') {
      paymentIntent.fail('card_declined');
    } else if (data.payment_method === 'pm_card_insufficientFunds') {
      paymentIntent.fail('insufficient_funds');
    } else {
      // Default to success for testing
      paymentIntent.succeed();
    }
    
    return paymentIntent.toJSON();
  }
}

/**
 * Test helper functions
 */

/**
 * Create a successful payment intent for testing
 */
export function createSuccessfulPaymentIntent(amount = 1500, metadata = {}) {
  const stripe = new MockStripe();
  return stripe.createPaymentIntent({
    amount,
    currency: 'nzd',
    metadata,
    automatic_payment_methods: { enabled: true }
  }).then(pi => {
    // Mark as succeeded
    const mockPi = mockPaymentIntents.get(pi.id);
    mockPi.succeed();
    return mockPi.toJSON();
  });
}

/**
 * Create a failed payment intent for testing
 */
export function createFailedPaymentIntent(amount = 1500, failureCode = 'card_declined') {
  const stripe = new MockStripe();
  return stripe.createPaymentIntent({
    amount,
    currency: 'nzd',
    automatic_payment_methods: { enabled: true }
  }).then(pi => {
    // Mark as failed
    const mockPi = mockPaymentIntents.get(pi.id);
    mockPi.fail(failureCode);
    return mockPi.toJSON();
  });
}

/**
 * Clear all mock payment intents
 */
export function clearMockPaymentIntents() {
  mockPaymentIntents.clear();
  console.log('🧹 Cleared all mock payment intents');
}

/**
 * Get mock payment intent by ID
 */
export function getMockPaymentIntent(id) {
  return mockPaymentIntents.get(id);
}

/**
 * Mock Stripe module for jest.mock()
 */
export const mockStripeModule = {
  default: function(secretKey) {
    console.log(`🔧 Mock Stripe initialized with key: ${secretKey?.substr(0, 12)}...`);
    return new MockStripe();
  },
  errors: {
    StripeError,
    StripeCardError,
    StripeInvalidRequestError
  }
};

/**
 * Setup Stripe mocks for Jest
 */
export function setupStripeMocks() {
  // Mock the Stripe module
  jest.mock('stripe', () => mockStripeModule);
  
  // Clear mocks before each test
  beforeEach(() => {
    clearMockPaymentIntents();
  });
}

/**
 * Test scenarios for different payment outcomes
 */
export const TEST_SCENARIOS = {
  SUCCESSFUL_PAYMENT: {
    payment_method: 'pm_card_visa',
    expected_status: 'succeeded'
  },
  DECLINED_CARD: {
    payment_method: 'pm_card_chargeDeclined',
    expected_status: 'requires_payment_method',
    expected_error: 'card_declined'
  },
  INSUFFICIENT_FUNDS: {
    payment_method: 'pm_card_insufficientFunds',
    expected_status: 'requires_payment_method',
    expected_error: 'insufficient_funds'
  },
  PROCESSING_ERROR: {
    payment_method: 'pm_card_processingError',
    expected_status: 'requires_payment_method',
    expected_error: 'processing_error'
  }
};

/**
 * Generate test cart items with real Queen Bee products
 */
export function generateTestCartItems(productTitles = ['Dragon', 'Rose']) {
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

export default MockStripe;
