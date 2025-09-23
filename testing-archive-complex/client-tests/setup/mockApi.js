import { vi } from 'vitest'

// Mock API responses
export const mockApiResponses = {
  products: {
    success: {
      success: true,
      data: [
        {
          id: 1,
          title: 'Dragon',
          price: 1500,
          image: 'dragon.jpg',
          category: 'figurine',
          stock: 5,
          description: 'Handcrafted beeswax dragon candle'
        },
        {
          id: 2,
          title: 'Corn Cob',
          price: 1600,
          image: 'corn-cob.jpg',
          category: 'shaped',
          stock: 3,
          description: 'Realistic corn cob beeswax candle'
        },
        {
          id: 3,
          title: 'Bee and Flower',
          price: 850,
          image: 'bee-and-flower.jpg',
          category: 'nature',
          stock: 8,
          description: 'Beautiful bee and flower design'
        },
        {
          id: 4,
          title: 'Rose',
          price: 800,
          image: 'rose.jpg',
          category: 'nature',
          stock: 10,
          description: 'Elegant rose-shaped beeswax candle'
        }
      ]
    },
    error: {
      success: false,
      error: 'Failed to fetch products'
    },
    empty: {
      success: true,
      data: []
    }
  },
  
  orders: {
    success: {
      success: true,
      data: {
        id: 'QBC-TEST-12345',
        customerEmail: 'test@example.com',
        customerName: 'Test Customer',
        items: [
          {
            productId: 1,
            title: 'Dragon',
            price: 1500,
            quantity: 1
          }
        ],
        subtotal: 1500,
        tax: 225,
        total: 1725,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    },
    error: {
      success: false,
      error: 'Failed to create order'
    },
    validation: {
      success: false,
      error: 'Validation failed',
      details: {
        email: 'Invalid email format',
        items: 'Cart cannot be empty'
      }
    }
  },
  
  stripe: {
    paymentIntent: {
      success: {
        id: 'pi_test_12345',
        client_secret: 'pi_test_12345_secret_test',
        amount: 1725,
        currency: 'nzd',
        status: 'requires_payment_method'
      },
      error: {
        error: {
          message: 'Your card was declined.',
          type: 'card_error',
          code: 'card_declined'
        }
      }
    }
  }
}

// Helper function to mock successful API calls
export const mockSuccessfulApiCall = (endpoint, data) => {
  globalThis.fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data
  })
}

// Helper function to mock failed API calls
export const mockFailedApiCall = (endpoint, error, status = 500) => {
  globalThis.fetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => error
  })
}

// Helper function to mock network errors
export const mockNetworkError = (endpoint) => {
  globalThis.fetch.mockRejectedValueOnce(new Error('Network error'))
}

// Setup function to mock all API endpoints with default responses
export const setupApiMocks = () => {
  globalThis.fetch.mockImplementation((url, options) => {
    const method = options?.method || 'GET'
    
    // Products endpoints
    if (url.includes('/api/products') && method === 'GET') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.products.success
      })
    }
    
    // Orders endpoints
    if (url.includes('/api/orders') && method === 'POST') {
      return Promise.resolve({
        ok: true,
        status: 201,
        json: async () => mockApiResponses.orders.success
      })
    }
    
    // Stripe endpoints
    if (url.includes('/api/stripe/payment-intent') && method === 'POST') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.stripe.paymentIntent.success
      })
    }
    
    // Default fallback
    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' })
    })
  })
}

// Helper function to mock specific endpoints
export const mockEndpoint = (endpoint, response, options = {}) => {
  const { method = 'GET', status = 200, ok = true } = options
  
  globalThis.fetch.mockImplementation((url, requestOptions) => {
    const requestMethod = requestOptions?.method || 'GET'
    
    if (url.includes(endpoint) && requestMethod === method) {
      return Promise.resolve({
        ok,
        status,
        json: async () => response
      })
    }
    
    // Call the original mock for other endpoints
    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' })
    })
  })
}

// Helper function to verify API calls
export const verifyApiCall = (endpoint, options = {}) => {
  const { method = 'GET', times = 1 } = options
  
  // Check if fetch was called with URL containing the endpoint
  const calls = globalThis.fetch.mock.calls
  const matchingCall = calls.find(call => call[0].includes(endpoint))
  
  expect(matchingCall).toBeDefined()
  expect(matchingCall[0]).toContain(endpoint)
  
  if (times > 1) {
    expect(globalThis.fetch).toHaveBeenCalledTimes(times)
  }
}

// Helper function to get the last API call
export const getLastApiCall = () => {
  const calls = globalThis.fetch.mock.calls
  return calls[calls.length - 1]
}

// Helper function to get all API calls for an endpoint
export const getApiCalls = (endpoint) => {
  return globalThis.fetch.mock.calls.filter(call => 
    call[0].includes(endpoint)
  )
}
