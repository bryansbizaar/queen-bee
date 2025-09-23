import { vi } from 'vitest'
import React from 'react'

// Mock Stripe Elements
export const mockStripeElements = {
  create: vi.fn(() => ({
    mount: vi.fn(),
    unmount: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    update: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    clear: vi.fn(),
  })),
  getElement: vi.fn(),
  fetchUpdates: vi.fn(),
}

// Mock Stripe instance
export const mockStripe = {
  elements: vi.fn(() => mockStripeElements),
  createPaymentMethod: vi.fn(),
  confirmCardPayment: vi.fn(),
  confirmPayment: vi.fn(),
  processPayment: vi.fn(),
  retrievePaymentIntent: vi.fn(),
  handleCardAction: vi.fn(),
  handleNextAction: vi.fn(),
  createToken: vi.fn(),
  createSource: vi.fn(),
  retrieveSource: vi.fn(),
  paymentRequest: vi.fn(),
  redirectToCheckout: vi.fn(),
}

// Mock successful payment scenarios
export const mockSuccessfulPayment = () => {
  mockStripe.confirmCardPayment.mockResolvedValue({
    paymentIntent: {
      id: 'pi_test_12345',
      status: 'succeeded',
      amount: 1725,
      currency: 'nzd',
      metadata: {
        orderId: 'QBC-TEST-12345',
        customerEmail: 'test@example.com'
      }
    },
    error: null
  })
}

// Mock failed payment scenarios
export const mockFailedPayment = (errorType = 'card_error') => {
  const errorMessages = {
    card_error: 'Your card was declined.',
    validation_error: 'Please check your card details.',
    processing_error: 'We encountered an error processing your payment.',
    authentication_required: 'Your payment requires authentication.',
    insufficient_funds: 'Your card has insufficient funds.',
    network_error: 'A network error occurred.'
  }

  mockStripe.confirmCardPayment.mockResolvedValue({
    paymentIntent: null,
    error: {
      type: errorType,
      code: errorType,
      message: errorMessages[errorType] || 'An error occurred.',
      charge: null,
      decline_code: errorType === 'card_error' ? 'generic_decline' : null
    }
  })
}

// Mock payment requiring authentication
export const mockPaymentRequiringAuth = () => {
  mockStripe.confirmCardPayment.mockResolvedValue({
    paymentIntent: {
      id: 'pi_test_12345',
      status: 'requires_action',
      amount: 1725,
      currency: 'nzd',
      next_action: {
        type: 'use_stripe_sdk'
      }
    },
    error: null
  })
}

// Mock payment method creation
export const mockPaymentMethodCreation = (success = true) => {
  if (success) {
    mockStripe.createPaymentMethod.mockResolvedValue({
      paymentMethod: {
        id: 'pm_test_12345',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025
        },
        billing_details: {
          email: 'test@example.com',
          name: 'Test Customer'
        }
      },
      error: null
    })
  } else {
    mockStripe.createPaymentMethod.mockResolvedValue({
      paymentMethod: null,
      error: {
        type: 'validation_error',
        message: 'Please check your card details.'
      }
    })
  }
}

// Setup function to mock all Stripe functionality
export const setupStripeMocks = () => {
  // Mock the Stripe library
  vi.mock('@stripe/stripe-js', () => ({
    loadStripe: vi.fn(() => Promise.resolve(mockStripe))
  }))

  // Mock Stripe React hooks
  vi.mock('@stripe/react-stripe-js', () => ({
    Elements: ({ children }) => children,
    CardElement: ({ onReady, onChange: _onChange, onFocus: _onFocus, onBlur: _onBlur, ...props }) => {
      React.useEffect(() => {
        if (onReady) onReady()
      }, [onReady])
      
      return React.createElement('div', { 'data-testid': 'card-element', ...props })
    },
    useStripe: () => mockStripe,
    useElements: () => mockStripeElements,
    ElementsConsumer: ({ children }) => children({ stripe: mockStripe, elements: mockStripeElements })
  }))
}

// Helper function to reset all Stripe mocks
export const resetStripeMocks = () => {
  Object.values(mockStripe).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear()
    }
  })
  
  Object.values(mockStripeElements).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear()
    }
  })
}

// Helper function to simulate Stripe events
export const simulateStripeEvents = {
  cardReady: (element) => {
    const onReady = element.on.mock.calls.find(call => call[0] === 'ready')?.[1]
    if (onReady) onReady()
  },
  
  cardChange: (element, event = {}) => {
    const onChange = element.on.mock.calls.find(call => call[0] === 'change')?.[1]
    if (onChange) onChange({
      complete: true,
      error: null,
      elementType: 'card',
      ...event
    })
  },
  
  cardError: (element, error) => {
    const onChange = element.on.mock.calls.find(call => call[0] === 'change')?.[1]
    if (onChange) onChange({
      complete: false,
      error: {
        type: 'validation_error',
        message: 'Your card number is invalid.',
        ...error
      },
      elementType: 'card'
    })
  },
  
  cardFocus: (element) => {
    const onFocus = element.on.mock.calls.find(call => call[0] === 'focus')?.[1]
    if (onFocus) onFocus()
  },
  
  cardBlur: (element) => {
    const onBlur = element.on.mock.calls.find(call => call[0] === 'blur')?.[1]
    if (onBlur) onBlur()
  }
}

// Test data for Stripe testing
export const stripeTestData = {
  validCard: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  },
  
  declinedCard: {
    number: '4000000000000002',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  },
  
  authRequiredCard: {
    number: '4000002500003155',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  },
  
  insufficientFundsCard: {
    number: '4000000000009995',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  },
  
  processingErrorCard: {
    number: '4000000000000119',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  }
}

// Helper function to create mock payment intents
export const createMockPaymentIntent = (amount = 1725, status = 'requires_payment_method') => {
  return {
    id: 'pi_test_12345',
    amount,
    currency: 'nzd',
    status,
    client_secret: 'pi_test_12345_secret_test',
    metadata: {
      orderId: 'QBC-TEST-12345',
      customerEmail: 'test@example.com'
    }
  }
}
