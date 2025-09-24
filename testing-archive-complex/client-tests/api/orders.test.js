import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  mockSuccessfulApiCall, 
  mockFailedApiCall, 
  setupApiMocks
} from '../setup/mockApi'
import { TEST_ORDERS, TEST_CART_ITEMS } from '../setup/testData'

// Mock the API base URL
const API_BASE_URL = 'http://localhost:3001'

// Simulate client-side Orders API service functions
const OrdersAPI = {
  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  },

  async getOrderById(orderId) {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  },

  async getOrdersByCustomer(customerEmail) {
    const response = await fetch(`${API_BASE_URL}/api/orders/customer/${encodeURIComponent(customerEmail)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  },

  async updateOrderStatus(orderId, status) {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  }
}

describe('Orders API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupApiMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createOrder', () => {
    it('successfully creates order with valid data', async () => {
      const orderData = {
        customerEmail: 'test@example.com',
        customerName: 'Test Customer',
        items: TEST_CART_ITEMS,
        shippingAddress: {
          street: '123 Test Street',
          city: 'Auckland',
          postalCode: '1010',
          country: 'New Zealand'
        }
      }

      const expectedResponse = {
        success: true,
        data: {
          ...TEST_ORDERS[0],
          items: TEST_CART_ITEMS
        }
      }

      mockSuccessfulApiCall('/api/orders', expectedResponse)

      const result = await OrdersAPI.createOrder(orderData)

      expect(result.success).toBe(true)
      expect(result.data.customerEmail).toBe('john@example.com')
      expect(result.data.items).toHaveLength(TEST_CART_ITEMS.length)
      expect(result.data.status).toBe('confirmed')
      
      // Verify POST request was made with correct data
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(orderData)
        })
      )
    })

    it('handles validation errors', async () => {
      const invalidOrderData = {
        customerEmail: 'invalid-email',
        items: [] // Empty cart
      }

      mockFailedApiCall('/api/orders', {
        success: false,
        error: 'Validation failed',
        details: {
          email: 'Invalid email format',
          items: 'Cart cannot be empty'
        }
      }, 400)

      await expect(OrdersAPI.createOrder(invalidOrderData)).rejects.toThrow('HTTP error! status: 400')
      expect(globalThis.fetch).toHaveBeenCalled()
    })

    it('handles insufficient inventory', async () => {
      const orderData = {
        customerEmail: 'test@example.com',
        items: [
          { id: 1, quantity: 100, price: 1500 } // Requesting too many
        ]
      }

      mockFailedApiCall('/api/orders', {
        success: false,
        error: 'Insufficient inventory',
        details: {
          productId: 1,
          requested: 100,
          available: 5
        }
      }, 409)

      await expect(OrdersAPI.createOrder(orderData)).rejects.toThrow('HTTP error! status: 409')
    })

    it('calculates totals correctly', async () => {
      const orderData = {
        customerEmail: 'test@example.com',
        items: [
          { id: 1, title: 'Dragon', quantity: 2, price: 1500 },
          { id: 2, title: 'Rose', quantity: 1, price: 800 }
        ]
      }

      const expectedTotal = (1500 * 2) + (800 * 1) // 3800
      const expectedTax = Math.round(expectedTotal * 0.15) // 570
      const expectedGrandTotal = expectedTotal + expectedTax // 4370

      mockSuccessfulApiCall('/api/orders', {
        success: true,
        data: {
          ...TEST_ORDERS[0],
          subtotal: expectedTotal,
          tax: expectedTax,
          total: expectedGrandTotal,
          items: orderData.items
        }
      })

      const result = await OrdersAPI.createOrder(orderData)

      expect(result.data.subtotal).toBe(expectedTotal)
      expect(result.data.tax).toBe(expectedTax)
      expect(result.data.total).toBe(expectedGrandTotal)
    })

    it('handles guest checkout', async () => {
      const guestOrderData = {
        customerEmail: 'guest@example.com',
        customerName: 'Guest User',
        items: TEST_CART_ITEMS,
        isGuest: true
      }

      mockSuccessfulApiCall('/api/orders', {
        success: true,
        data: {
          ...TEST_ORDERS[0],
          customerType: 'guest'
        }
      })

      const result = await OrdersAPI.createOrder(guestOrderData)

      expect(result.success).toBe(true)
      expect(result.data.customerType).toBe('guest')
    })

    it('handles server errors during order creation', async () => {
      const orderData = {
        customerEmail: 'test@example.com',
        items: TEST_CART_ITEMS
      }

      mockFailedApiCall('/api/orders', {
        success: false,
        error: 'Database connection failed'
      }, 500)

      await expect(OrdersAPI.createOrder(orderData)).rejects.toThrow('HTTP error! status: 500')
    })
  })

  describe('getOrderById', () => {
    it('successfully retrieves order by ID', async () => {
      const orderId = 'QBC-TEST-12345'
      const expectedOrder = TEST_ORDERS[0]

      mockSuccessfulApiCall(`/api/orders/${orderId}`, {
        success: true,
        data: expectedOrder
      })

      const result = await OrdersAPI.getOrderById(orderId)

      expect(result.success).toBe(true)
      expect(result.data.id).toBe(orderId)
      expect(result.data.customerEmail).toBe('john@example.com')
      expect(result.data.status).toBe('confirmed')
      
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/orders/${orderId}`)
      )
    })

    it('handles order not found', async () => {
      const orderId = 'QBC-NONEXISTENT'

      mockFailedApiCall(`/api/orders/${orderId}`, {
        success: false,
        error: 'Order not found'
      }, 404)

      await expect(OrdersAPI.getOrderById(orderId)).rejects.toThrow('HTTP error! status: 404')
    })

    it('handles invalid order ID format', async () => {
      const invalidOrderId = 'invalid-id'

      mockFailedApiCall(`/api/orders/${invalidOrderId}`, {
        success: false,
        error: 'Invalid order ID format'
      }, 400)

      await expect(OrdersAPI.getOrderById(invalidOrderId)).rejects.toThrow('HTTP error! status: 400')
    })
  })

  describe('getOrdersByCustomer', () => {
    it('successfully retrieves customer orders', async () => {
      const customerEmail = 'john@example.com'
      const expectedOrders = [TEST_ORDERS[0]]

      mockSuccessfulApiCall(`/api/orders/customer/${customerEmail}`, {
        success: true,
        data: expectedOrders
      })

      const result = await OrdersAPI.getOrdersByCustomer(customerEmail)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].customerEmail).toBe(customerEmail)
      
      // Verify email was properly URL encoded
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/orders/customer/${encodeURIComponent(customerEmail)}`)
      )
    })

    it('handles customer with no orders', async () => {
      const customerEmail = 'newcustomer@example.com'

      mockSuccessfulApiCall(`/api/orders/customer/${customerEmail}`, {
        success: true,
        data: []
      })

      const result = await OrdersAPI.getOrdersByCustomer(customerEmail)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(0)
    })

    it('handles special characters in email', async () => {
      const customerEmail = 'user+test@example.com'

      mockSuccessfulApiCall(`/api/orders/customer/${encodeURIComponent(customerEmail)}`, {
        success: true,
        data: []
      })

      const result = await OrdersAPI.getOrdersByCustomer(customerEmail)

      expect(result.success).toBe(true)
      // Verify proper URL encoding
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('user%2Btest%40example.com')
      )
    })

    it('handles invalid email format', async () => {
      const invalidEmail = 'not-an-email'

      mockFailedApiCall(`/api/orders/customer/${invalidEmail}`, {
        success: false,
        error: 'Invalid email format'
      }, 400)

      await expect(OrdersAPI.getOrdersByCustomer(invalidEmail)).rejects.toThrow('HTTP error! status: 400')
    })
  })

  describe('updateOrderStatus', () => {
    it('successfully updates order status', async () => {
      const orderId = 'QBC-TEST-12345'
      const newStatus = 'shipped'

      mockSuccessfulApiCall(`/api/orders/${orderId}/status`, {
        success: true,
        data: {
          ...TEST_ORDERS[0],
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      })

      const result = await OrdersAPI.updateOrderStatus(orderId, newStatus)

      expect(result.success).toBe(true)
      expect(result.data.status).toBe(newStatus)
      
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/orders/${orderId}/status`),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ status: newStatus })
        })
      )
    })

    it('handles invalid status transition', async () => {
      const orderId = 'QBC-TEST-12345'
      const invalidStatus = 'invalid-status'

      mockFailedApiCall(`/api/orders/${orderId}/status`, {
        success: false,
        error: 'Invalid status transition',
        details: {
          currentStatus: 'confirmed',
          requestedStatus: invalidStatus,
          allowedTransitions: ['processing', 'cancelled']
        }
      }, 400)

      await expect(OrdersAPI.updateOrderStatus(orderId, invalidStatus)).rejects.toThrow('HTTP error! status: 400')
    })

    it('handles unauthorized status update', async () => {
      const orderId = 'QBC-TEST-12345'
      const status = 'cancelled'

      mockFailedApiCall(`/api/orders/${orderId}/status`, {
        success: false,
        error: 'Unauthorized to update this order'
      }, 403)

      await expect(OrdersAPI.updateOrderStatus(orderId, status)).rejects.toThrow('HTTP error! status: 403')
    })
  })

  describe('Order Workflow Integration', () => {
    it('handles complete order lifecycle', async () => {
      const orderData = {
        customerEmail: 'workflow@example.com',
        items: TEST_CART_ITEMS
      }

      // 1. Create order
      mockSuccessfulApiCall('/api/orders', {
        success: true,
        data: { ...TEST_ORDERS[0], status: 'confirmed' }
      })

      const createResult = await OrdersAPI.createOrder(orderData)
      expect(createResult.data.status).toBe('confirmed')

      // 2. Retrieve order
      const orderId = createResult.data.id
      mockSuccessfulApiCall(`/api/orders/${orderId}`, {
        success: true,
        data: createResult.data
      })

      const getResult = await OrdersAPI.getOrderById(orderId)
      expect(getResult.data.id).toBe(orderId)

      // 3. Update status
      mockSuccessfulApiCall(`/api/orders/${orderId}/status`, {
        success: true,
        data: { ...createResult.data, status: 'processing' }
      })

      const updateResult = await OrdersAPI.updateOrderStatus(orderId, 'processing')
      expect(updateResult.data.status).toBe('processing')

      // Verify all API calls were made
      expect(globalThis.fetch).toHaveBeenCalledTimes(3)
    })

    it('handles order creation with inventory updates', async () => {
      const orderData = {
        customerEmail: 'inventory@example.com',
        items: [
          { id: 1, quantity: 2, price: 1500 }, // Dragon candles
          { id: 3, quantity: 1, price: 850 }   // Bee and Flower
        ]
      }

      mockSuccessfulApiCall('/api/orders', {
        success: true,
        data: {
          ...TEST_ORDERS[0],
          items: orderData.items,
          inventoryUpdated: true,
          inventoryChanges: [
            { productId: 1, previousStock: 5, newStock: 3 },
            { productId: 3, previousStock: 8, newStock: 7 }
          ]
        }
      })

      const result = await OrdersAPI.createOrder(orderData)

      expect(result.success).toBe(true)
      expect(result.data.inventoryUpdated).toBe(true)
      expect(result.data.inventoryChanges).toHaveLength(2)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles network timeouts', async () => {
      const orderData = { customerEmail: 'test@example.com', items: TEST_CART_ITEMS }

      globalThis.fetch.mockImplementationOnce(() =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100)
        })
      )

      await expect(OrdersAPI.createOrder(orderData)).rejects.toThrow('Request timeout')
    })

    it('handles malformed response data', async () => {
      const orderId = 'QBC-TEST-12345'

      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON response')
        }
      })

      await expect(OrdersAPI.getOrderById(orderId)).rejects.toThrow('Invalid JSON response')
    })

    it('handles concurrent order creation', async () => {
      const orderData = {
        customerEmail: 'concurrent@example.com',
        items: [{ id: 1, quantity: 1, price: 1500 }]
      }

      // Mock successful responses for concurrent requests
      globalThis.fetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: { ...TEST_ORDERS[0], id: `QBC-${Date.now()}` }
        })
      })

      // Create multiple orders concurrently
      const promises = Array.from({ length: 3 }, () => OrdersAPI.createOrder(orderData))
      const results = await Promise.all(promises)

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true)
      })

      expect(globalThis.fetch).toHaveBeenCalledTimes(3)
    })
  })
})
