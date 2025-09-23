import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { CartProvider } from '../context/CartContext'
import Header from '../components/Header'
import Card from '../components/Card'
import useCart from '../context/useCart'

// Mock the lucide-react ShoppingCart icon
vi.mock('lucide-react', () => ({
  ShoppingCart: ({ size = 24 }) => <div data-testid="shopping-cart-icon" data-size={size}>🛒</div>
}))

// Mock the logo import
vi.mock('../assets/logo.png', () => ({ default: 'mocked-logo.png' }))

// Test Component that simulates adding items to cart
const TestShop = () => {
  const { addToCart, removeFromCart, updateQuantity, cartItems, getCartTotal, getCartCount } = useCart()
  
  const mockProducts = [
    {
      id: 1,
      title: 'Vanilla Delight',
      price: 2500,
      description: 'Creamy vanilla scented candle',
      image: 'vanilla.jpg'
    },
    {
      id: 2,
      title: 'Lavender Dreams',
      price: 3000,
      description: 'Relaxing lavender scented candle',
      image: 'lavender.jpg'
    }
  ]

  return (
    <div>
      <Header />
      
      <div className="products">
        {mockProducts.map(product => (
          <div key={product.id} className="product-wrapper">
            <Card {...product} />
            <button 
              onClick={() => addToCart(product)}
              data-testid={`add-${product.id}`}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary" data-testid="cart-summary">
        <p data-testid="cart-total">Total: ${(getCartTotal() / 100).toFixed(2)}</p>
        <p data-testid="cart-count">Items: {getCartCount()}</p>
        
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item" data-testid={`cart-item-${item.id}`}>
              <span>{item.title} - Qty: {item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                data-testid={`increase-${item.id}`}
              >
                +
              </button>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                data-testid={`decrease-${item.id}`}
              >
                -
              </button>
              <button 
                onClick={() => removeFromCart(item.id)}
                data-testid={`remove-${item.id}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const TestWrapper = ({ children = null }) => (
  <BrowserRouter>
    <CartProvider>
      {children}
    </CartProvider>
  </BrowserRouter>
)

TestWrapper.propTypes = {
  children: PropTypes.node
}

describe('Cart Workflow Integration Tests', () => {
  it('displays initial empty cart state', () => {
    render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $0.00')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 0')
    
    const cartBadges = screen.queryAllByText('0')
    expect(cartBadges).toHaveLength(0)
  })

  it('adds single item to cart and updates all displays', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    const addVanillaBtn = screen.getByTestId('add-1')
    await user.click(addVanillaBtn)

    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $25.00')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 1')
    expect(screen.getAllByText('1')).toHaveLength(2)
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Vanilla Delight - Qty: 1')
  })

  it('adds multiple different items to cart', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('add-1'))
    await user.click(screen.getByTestId('add-2'))

    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $55.00')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 2')
    expect(screen.getAllByText('2')).toHaveLength(2)
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('cart-item-2')).toBeInTheDocument()
  })

  it('increases quantity of existing item', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('add-1'))
    await user.click(screen.getByTestId('add-1'))

    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $50.00')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 2')
    expect(screen.getAllByText('2')).toHaveLength(2)
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Vanilla Delight - Qty: 2')
    
    const cartItems = screen.getAllByTestId(/cart-item-/)
    expect(cartItems).toHaveLength(1)
  })

  it('updates quantity using quantity controls', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('add-1'))
    await user.click(screen.getByTestId('increase-1'))
    await user.click(screen.getByTestId('increase-1'))

    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $75.00')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 3')
    expect(screen.getAllByText('3')).toHaveLength(2)
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Vanilla Delight - Qty: 3')
  })

  it('decreases quantity using quantity controls', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('add-1'))
    await user.click(screen.getByTestId('increase-1'))
    await user.click(screen.getByTestId('decrease-1'))

    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $25.00')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 1')
    expect(screen.getAllByText('1')).toHaveLength(2)
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Vanilla Delight - Qty: 1')
  })

  it('removes item when quantity reaches zero', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('add-1'))
    await user.click(screen.getByTestId('decrease-1'))

    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $0.00')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 0')
    expect(screen.queryAllByText('1')).toHaveLength(0)
    expect(screen.queryByTestId('cart-item-1')).not.toBeInTheDocument()
  })

  it('removes item using remove button', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('add-1'))
    await user.click(screen.getByTestId('add-2'))
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 2')
    
    await user.click(screen.getByTestId('remove-1'))

    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $30.00')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 1')
    expect(screen.getAllByText('1')).toHaveLength(2)
    expect(screen.queryByTestId('cart-item-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('cart-item-2')).toBeInTheDocument()
  })

  it('handles complex cart operations', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('add-1'))
    await user.click(screen.getByTestId('add-1'))
    await user.click(screen.getByTestId('add-2'))
    await user.click(screen.getByTestId('increase-2'))
    await user.click(screen.getByTestId('increase-2'))

    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $140.00')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 5')
    expect(screen.getAllByText('5')).toHaveLength(2)
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Vanilla Delight - Qty: 2')
    expect(screen.getByTestId('cart-item-2')).toHaveTextContent('Lavender Dreams - Qty: 3')
    
    await user.click(screen.getByTestId('remove-1'))
    
    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $90.00')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 3')
    expect(screen.getAllByText('3')).toHaveLength(2)
    expect(screen.queryByTestId('cart-item-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('cart-item-2')).toHaveTextContent('Lavender Dreams - Qty: 3')
  })

  it('cart icon updates reflect across all instances', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    const cartBadges = screen.queryAllByText('0')
    expect(cartBadges).toHaveLength(0)

    await user.click(screen.getByTestId('add-1'))
    await user.click(screen.getByTestId('add-2'))

    const badgeCount = screen.getAllByText('2')
    expect(badgeCount.length).toBeGreaterThan(0)
  })

  it('maintains cart state across component re-renders', async () => {
    const user = userEvent.setup()
    
    const { rerender } = render(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('add-1'))
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 1')

    rerender(
      <TestWrapper>
        <TestShop />
      </TestWrapper>
    )

    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 1')
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument()
  })
})