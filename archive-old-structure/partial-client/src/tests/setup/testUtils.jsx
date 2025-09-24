import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { CartProvider } from '../../context/CartContext'

// Test wrapper component that includes all providers
const TestWrapper = ({ children, initialCartItems = [] }) => {
  // Mock cart context with default values
  const mockCartValue = {
    cartItems: initialCartItems,
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    getCartTotal: vi.fn(() => 0),
    getCartCount: vi.fn(() => 0),
  }

  return (
    <BrowserRouter>
      <CartProvider value={mockCartValue}>
        {children}
      </CartProvider>
    </BrowserRouter>
  )
}

// Custom render function with all providers
const customRender = (ui, options = {}) => {
  const { initialCartItems = [], ...renderOptions } = options
  
  return render(ui, {
    wrapper: (props) => <TestWrapper {...props} initialCartItems={initialCartItems} />,
    ...renderOptions,
  })
}

// Helper function to create mock cart items
export const createMockCartItems = (items = []) => {
  const defaultItems = [
    {
      id: 1,
      title: 'Dragon',
      price: 1500,
      quantity: 1,
      image: 'dragon.jpg',
      category: 'figurine'
    },
    {
      id: 2,
      title: 'Corn Cob',
      price: 1600,
      quantity: 2,
      image: 'corn-cob.jpg',
      category: 'shaped'
    }
  ]
  
  return items.length > 0 ? items : defaultItems
}

// Helper function to create mock products
export const createMockProducts = (count = 4) => {
  const products = [
    { id: 1, title: 'Dragon', price: 1500, image: 'dragon.jpg', category: 'figurine', stock: 5 },
    { id: 2, title: 'Corn Cob', price: 1600, image: 'corn-cob.jpg', category: 'shaped', stock: 3 },
    { id: 3, title: 'Bee and Flower', price: 850, image: 'bee-and-flower.jpg', category: 'nature', stock: 8 },
    { id: 4, title: 'Rose', price: 800, image: 'rose.jpg', category: 'nature', stock: 10 }
  ]
  
  return products.slice(0, count)
}

// Helper function to create mock orders
export const createMockOrder = (overrides = {}) => {
  return {
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
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

// Helper function to wait for loading states
export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved } = await import('@testing-library/react')
  
  try {
    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i), {
      timeout: 3000
    })
  } catch (error) {
    // Loading element might not be present, that's okay
  }
}

// Helper function to simulate user interactions
export const simulateUserActions = {
  addToCart: async (user, productId) => {
    const button = screen.getByTestId(`add-to-cart-${productId}`)
    await user.click(button)
  },
  
  removeFromCart: async (user, productId) => {
    const button = screen.getByTestId(`remove-from-cart-${productId}`)
    await user.click(button)
  },
  
  updateQuantity: async (user, productId, quantity) => {
    const input = screen.getByTestId(`quantity-input-${productId}`)
    await user.clear(input)
    await user.type(input, quantity.toString())
  },
  
  navigateToCheckout: async (user) => {
    const checkoutButton = screen.getByRole('button', { name: /checkout/i })
    await user.click(checkoutButton)
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Export our custom render as the default render
export { customRender as render }
