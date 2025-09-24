// client/src/tests/setup/cartTestUtils.js
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from '../../context/CartContext'
import PropTypes from 'prop-types'

// Enhanced test wrapper with cart provider
export const CartTestWrapper = ({ children, initialRoute = '/' }) => {
  return (
    <BrowserRouter>
      <CartProvider>
        <div data-testid="cart-test-wrapper">
          {children}
        </div>
      </CartProvider>
    </BrowserRouter>
  )
}

CartTestWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  initialRoute: PropTypes.string
}

// Custom render function with cart context
export const renderWithCart = (ui, options = {}) => {
  const { initialRoute = '/', ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <CartTestWrapper initialRoute={initialRoute}>
        {children}
      </CartTestWrapper>
    ),
    ...renderOptions
  })
}

// Helper to create cart scenarios
export const createCartScenario = (products = []) => {
  return {
    products,
    totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    uniqueItems: products.length
  }
}

// Cart test utilities
export const cartTestHelpers = {
  // Create a product for testing
  createTestProduct: (overrides = {}) => ({
    id: 1,
    title: 'Test Product',
    price: 1000,
    stock: 5,
    description: 'A test product',
    category: 'Test',
    image: '/test-image.jpg',
    ...overrides
  }),

  // Create multiple products for testing
  createTestProducts: (count = 3) => {
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      title: `Test Product ${index + 1}`,
      price: (index + 1) * 1000,
      stock: 5,
      description: `Test product ${index + 1}`,
      category: 'Test',
      image: `/test-image-${index + 1}.jpg`
    }))
  },

  // Cart state matchers
  expectCartToHaveItems: (cartItems, expectedCount) => {
    expect(cartItems).toHaveLength(expectedCount)
  },

  expectCartToHaveProduct: (cartItems, productId, quantity = 1) => {
    const item = cartItems.find(item => item.id === productId)
    expect(item).toBeDefined()
    expect(item.quantity).toBe(quantity)
  },

  expectCartTotal: (getCartTotal, expectedTotal) => {
    expect(getCartTotal()).toBe(expectedTotal)
  },

  expectCartCount: (getCartCount, expectedCount) => {
    expect(getCartCount()).toBe(expectedCount)
  }
}
