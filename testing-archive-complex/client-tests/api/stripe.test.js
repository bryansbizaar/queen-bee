import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  mockSuccessfulApiCall, 
  mockFailedApiCall, 
  setupApiMocks
} from '../setup/mockApi'
import { TEST_CART_ITEMS, TEST_ORDERS } from '../setup/testData'

// Mock the API base URL
const API_BASE_URL = 'http://localhost:3001'

// Test data for Stripe testing
const stripeTestData = {
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
  }
}

// Helper function to create mock payment intents
const createMockPaymentIntent = (amount = 1725, status = 'requires_payment_method') => {
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

// Simulate client-side Stripe API service functions
const StripeAPI = {
  async createPaymentIntent(amount, orderData) {
    const response = await fetch(`${API_BASE_URL}/api/stripe/payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'nzd',
        ...orderData
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  },

  async confirmPayment(paymentIntentId, paymentMethod) {
    // This would normally use the Stripe SDK
    // For testing, we'll simulate the API call
    const response = await fetch(`${API_BASE_URL}/api/stripe/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        paymentMethod
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  },

  async handlePaymentSuccess(paymentIntentId) {
    const response = await fetch(`${API_BASE_URL}/api/stripe/payment-success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  },

  async refundPayment(paymentIntentId, amount) {
    const response = await fetch(`${API_BASE_URL}/api/stripe/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        amount
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  }
}

describe('Stripe API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupApiMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createPaymentIntent', () => {
    it('successfully creates payment intent for NZD currency', async () => {
      const amount = 1725 // $17.25 NZD
      const orderData = {
        orderId: 'QBC-TEST-12345',
        customerEmail: 'test@example.com',
        items: TEST_CART_ITEMS
      }

      const expectedPaymentIntent = createMockPaymentIntent(amount)
      
      mockSuccessfulApiCall('/api/stripe/payment-intent', {
        success: true,
        data: expectedPaymentIntent
      })

      const result = await StripeAPI.createPaymentIntent(amount, orderData)

      expect(result.success).toBe(true)
      expect(result.data.amount).toBe(amount)
      expect(result.data.currency).toBe('nzd')
      expect(result.data.status).toBe('requires_payment_method')
      
      // Verify correct API call
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/stripe/payment-intent'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            amount,
            currency: 'nzd',
            ...orderData
          })
        })
      )
    })

    it('handles invalid amount', async () => {
      const invalidAmount = -100
      const orderData = { orderId: 'QBC-TEST-12345' }

      mockFailedApiCall('/api/stripe/payment-intent', {
        success: false,
        error: 'Invalid amount',
        details: 'Amount must be greater than 0'
      }, 400)

      await expect(StripeAPI.createPaymentIntent(invalidAmount, orderData)).rejects.toThrow('HTTP error! status: 400')
    })

    it('handles missing order data', async () => {
      const amount = 1725
      const incompleteOrderData = {} // Missing required fields

      mockFailedApiCall('/api/stripe/payment-intent', {
        success: false,
        error: 'Missing required order data',
        details: {
          missingFields: ['orderId', 'customerEmail']
        }
      }, 400)

      await expect(StripeAPI.createPaymentIntent(amount, incompleteOrderData)).rejects.toThrow('HTTP error! status: 400')
    })

    it('calculates correct amount including NZ GST', async () => {
      const subtotal = 1500 // $15.00
      const tax = Math.round(subtotal * 0.15) // $2.25 (15% GST)
      const total = subtotal + tax // $17.25

      const orderData = {
        orderId: 'QBC-TEST-12345',
        customerEmail: 'test@example.com',
        subtotal,
        tax,
        total
      }

      mockSuccessfulApiCall('/api/stripe/payment-intent', {
        success: true,
        data: createMockPaymentIntent(total)
      })

      const result = await StripeAPI.createPaymentIntent(total, orderData)

      expect(result.data.amount).toBe(total)
      expect(result.data.currency).toBe('nzd')
    })

    it('handles Stripe API errors', async () => {
      const amount = 1725
      const orderData = { orderId: 'QBC-TEST-12345' }

      mockFailedApiCall('/api/stripe/payment-intent', {
        success: false,
        error: 'Stripe API error',
        stripeError: {
          type: 'api_error',
          message: 'Unable to connect to Stripe'
        }
      }, 503)

      await expect(StripeAPI.createPaymentIntent(amount, orderData)).rejects.toThrow('HTTP error! status: 503')
    })
  })

  describe('confirmPayment', () => {
    it('successfully confirms payment with valid card', async () => {
      const paymentIntentId = 'pi_test_12345'
      const paymentMethod = {
        card: stripeTestData.validCard,
        billingDetails: {
          email: 'test@example.com',
          name: 'Test Customer'
        }
      }

      mockSuccessfulApiCall('/api/stripe/confirm-payment', {
        success: true,
        data: {
          paymentIntent: {
            id: paymentIntentId,
            status: 'succeeded',
            amount: 1725,
            currency: 'nzd'
          }
        }
      })

      const result = await StripeAPI.confirmPayment(paymentIntentId, paymentMethod)

      expect(result.success).toBe(true)
      expect(result.data.paymentIntent.status).toBe('succeeded')
      expect(result.data.paymentIntent.id).toBe(paymentIntentId)
    })

    it('handles card declined', async () => {
      const paymentIntentId = 'pi_test_12345'
      const paymentMethod = {
        card: stripeTestData.declinedCard
      }

      mockFailedApiCall('/api/stripe/confirm-payment', {
        success: false,
        error: 'Payment failed',
        stripeError: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.'
        }
      }, 402)

      await expect(StripeAPI.confirmPayment(paymentIntentId, paymentMethod)).rejects.toThrow('HTTP error! status: 402')
    })

    it('handles insufficient funds', async () => {
      const paymentIntentId = 'pi_test_12345'
      const paymentMethod = {
        card: stripeTestData.insufficientFundsCard
      }

      mockFailedApiCall('/api/stripe/confirm-payment', {
        success: false,
        error: 'Payment failed',
        stripeError: {
          type: 'card_error',
          code: 'insufficient_funds',
          message: 'Your card has insufficient funds.'
        }
      }, 402)

      await expect(StripeAPI.confirmPayment(paymentIntentId, paymentMethod)).rejects.toThrow('HTTP error! status: 402')
    })

    it('handles authentication required', async () => {
      const paymentIntentId = 'pi_test_12345'
      const paymentMethod = {
        card: stripeTestData.authRequiredCard
      }

      mockSuccessfulApiCall('/api/stripe/confirm-payment', {
        success: true,
        data: {
          paymentIntent: {
            id: paymentIntentId,
            status: 'requires_action',
            next_action: {
              type: 'use_stripe_sdk'
            }
          }
        }
      })

      const result = await StripeAPI.confirmPayment(paymentIntentId, paymentMethod)

      expect(result.success).toBe(true)
      expect(result.data.paymentIntent.status).toBe('requires_action')
      expect(result.data.paymentIntent.next_action.type).toBe('use_stripe_sdk')
    })

    it('handles invalid payment intent ID', async () => {
      const invalidPaymentIntentId = 'invalid_id'
      const paymentMethod = { card: stripeTestData.validCard }

      mockFailedApiCall('/api/stripe/confirm-payment', {
        success: false,
        error: 'Invalid payment intent ID'
      }, 404)

      await expect(StripeAPI.confirmPayment(invalidPaymentIntentId, paymentMethod)).rejects.toThrow('HTTP error! status: 404')
    })
  })

  describe('handlePaymentSuccess', () => {
    it('successfully processes payment success', async () => {
      const paymentIntentId = 'pi_test_12345'

      mockSuccessfulApiCall('/api/stripe/payment-success', {
        success: true,
        data: {
          order: TEST_ORDERS[0],
          paymentIntent: {
            id: paymentIntentId,
            status: 'succeeded'
          }
        }
      })

      const result = await StripeAPI.handlePaymentSuccess(paymentIntentId)

      expect(result.success).toBe(true)
      expect(result.data.order.status).toBe('confirmed')
      expect(result.data.paymentIntent.status).toBe('succeeded')
    })

    it('handles payment intent not found', async () => {
      const paymentIntentId = 'pi_nonexistent'

      mockFailedApiCall('/api/stripe/payment-success', {
        success: false,
        error: 'Payment intent not found'
      }, 404)

      await expect(StripeAPI.handlePaymentSuccess(paymentIntentId)).rejects.toThrow('HTTP error! status: 404')
    })

    it('handles already processed payment', async () => {
      const paymentIntentId = 'pi_test_12345'

      mockFailedApiCall('/api/stripe/payment-success', {
        success: false,
        error: 'Payment already processed',
        details: {
          orderId: 'QBC-TEST-12345',
          status: 'already_confirmed'
        }
      }, 409)

      await expect(StripeAPI.handlePaymentSuccess(paymentIntentId)).rejects.toThrow('HTTP error! status: 409')
    })

    it('handles order creation failure', async () => {
      const paymentIntentId = 'pi_test_12345'

      mockFailedApiCall('/api/stripe/payment-success', {
        success: false,
        error: 'Order creation failed',
        details: {
          reason: 'Insufficient inventory after payment'
        }
      }, 500)

      await expect(StripeAPI.handlePaymentSuccess(paymentIntentId)).rejects.toThrow('HTTP error! status: 500')
    })
  })

  describe('refundPayment', () => {
    it('successfully processes full refund', async () => {
      const paymentIntentId = 'pi_test_12345'
      const refundAmount = 1725

      mockSuccessfulApiCall('/api/stripe/refund', {
        success: true,
        data: {
          refund: {
            id: 're_test_12345',
            amount: refundAmount,
            status: 'succeeded',
            paymentIntent: paymentIntentId
          }
        }
      })

      const result = await StripeAPI.refundPayment(paymentIntentId, refundAmount)

      expect(result.success).toBe(true)
      expect(result.data.refund.amount).toBe(refundAmount)
      expect(result.data.refund.status).toBe('succeeded')
    })

    it('successfully processes partial refund', async () => {
      const paymentIntentId = 'pi_test_12345'
      const originalAmount = 1725
      const refundAmount = 800 // Partial refund

      mockSuccessfulApiCall('/api/stripe/refund', {
        success: true,
        data: {
          refund: {
            id: 're_test_12345',
            amount: refundAmount,
            status: 'succeeded',
            paymentIntent: paymentIntentId
          }
        }
      })

      const result = await StripeAPI.refundPayment(paymentIntentId, refundAmount)

      expect(result.success).toBe(true)
      expect(result.data.refund.amount).toBe(refundAmount)
      expect(result.data.refund.amount).toBeLessThan(originalAmount)
    })

    it('handles refund amount exceeding original payment', async () => {
      const paymentIntentId = 'pi_test_12345'
      const excessiveRefundAmount = 5000 // More than original payment

      mockFailedApiCall('/api/stripe/refund', {
        success: false,
        error: 'Refund amount exceeds original payment',
        details: {
          originalAmount: 1725,
          requestedRefund: excessiveRefundAmount
        }
      }, 400)

      await expect(StripeAPI.refundPayment(paymentIntentId, excessiveRefundAmount)).rejects.toThrow('HTTP error! status: 400')
    })

    it('handles refund of already refunded payment', async () => {
      const paymentIntentId = 'pi_test_12345'
      const refundAmount = 1725

      mockFailedApiCall('/api/stripe/refund', {
        success: false,
        error: 'Payment already fully refunded'
      }, 409)

      await expect(StripeAPI.refundPayment(paymentIntentId, refundAmount)).rejects.toThrow('HTTP error! status: 409')
    })
  })

  describe('Payment Flow Integration', () => {
    it('handles complete payment workflow', async () => {
      const amount = 1725
      const orderData = {
        orderId: 'QBC-TEST-12345',
        customerEmail: 'test@example.com',
        items: TEST_CART_ITEMS
      }

      // 1. Create payment intent
      const paymentIntent = createMockPaymentIntent(amount)
      mockSuccessfulApiCall('/api/stripe/payment-intent', {
        success: true,
        data: paymentIntent
      })

      const createResult = await StripeAPI.createPaymentIntent(amount, orderData)
      expect(createResult.data.status).toBe('requires_payment_method')

      // 2. Confirm payment
      mockSuccessfulApiCall('/api/stripe/confirm-payment', {
        success: true,
        data: {
          paymentIntent: {
            ...paymentIntent,
            status: 'succeeded'
          }
        }
      })

      const confirmResult = await StripeAPI.confirmPayment(paymentIntent.id, {
        card: stripeTestData.validCard
      })
      expect(confirmResult.data.paymentIntent.status).toBe('succeeded')

      // 3. Handle success
      mockSuccessfulApiCall('/api/stripe/payment-success', {
        success: true,
        data: {
          order: { ...TEST_ORDERS[0], status: 'confirmed' }
        }
      })

      const successResult = await StripeAPI.handlePaymentSuccess(paymentIntent.id)
      expect(successResult.data.order.status).toBe('confirmed')

      // Verify all API calls were made
      expect(globalThis.fetch).toHaveBeenCalledTimes(3)
    })

    it('handles payment failure and retry', async () => {
      const paymentIntentId = 'pi_test_12345'
      const paymentMethod = { card: stripeTestData.validCard }

      // First attempt fails
      mockFailedApiCall('/api/stripe/confirm-payment', {
        success: false,
        error: 'Payment failed',
        stripeError: {
          type: 'card_error',
          code: 'card_declined'
        }
      }, 402)

      await expect(StripeAPI.confirmPayment(paymentIntentId, paymentMethod)).rejects.toThrow('HTTP error! status: 402')

      // Second attempt succeeds
      mockSuccessfulApiCall('/api/stripe/confirm-payment', {
        success: true,
        data: {
          paymentIntent: {
            id: paymentIntentId,
            status: 'succeeded'
          }
        }
      })

      const retryResult = await StripeAPI.confirmPayment(paymentIntentId, paymentMethod)
      expect(retryResult.success).toBe(true)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles network timeouts during payment', async () => {
      const paymentIntentId = 'pi_test_12345'
      const paymentMethod = { card: stripeTestData.validCard }

      globalThis.fetch.mockImplementationOnce(() =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100)
        })
      )

      await expect(StripeAPI.confirmPayment(paymentIntentId, paymentMethod)).rejects.toThrow('Request timeout')
    })

    it('handles malformed Stripe response', async () => {
      const amount = 1725
      const orderData = { orderId: 'QBC-TEST-12345' }

      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON from Stripe')
        }
      })

      await expect(StripeAPI.createPaymentIntent(amount, orderData)).rejects.toThrow('Invalid JSON from Stripe')
    })

    it('handles concurrent payment attempts', async () => {
      const paymentIntentId = 'pi_test_12345'
      const paymentMethod = { card: stripeTestData.validCard }

      // Mock successful responses for concurrent requests
      globalThis.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            paymentIntent: {
              id: paymentIntentId,
              status: 'succeeded'
            }
          }
        })
      })

      // Attempt multiple concurrent payments
      const promises = Array.from({ length: 3 }, () => 
        StripeAPI.confirmPayment(paymentIntentId, paymentMethod)
      )
      
      const results = await Promise.all(promises)

      // All should succeed (in reality, Stripe would handle idempotency)
      results.forEach(result => {
        expect(result.success).toBe(true)
      })

      expect(globalThis.fetch).toHaveBeenCalledTimes(3)
    })
  })
})
