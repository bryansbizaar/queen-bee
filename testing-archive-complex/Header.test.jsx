import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { CartProvider } from '../context/CartContext'
import Header from './Header'
import useCart from '../context/useCart'

// Mock the lucide-react ShoppingCart icon
vi.mock('lucide-react', () => ({
  ShoppingCart: ({ size = 24 }) => <div data-testid="shopping-cart-icon" data-size={size}>🛒</div>
}))

// Mock the logo import
vi.mock('../assets/logo.png', () => ({ default: 'mocked-logo.png' }))

// Test component to manipulate cart state
const CartController = () => {
  const { addToCart, removeFromCart, updateQuantity } = useCart()
  
  const mockProducts = [
    { id: 1, title: 'Candle 1', price: 1000, description: 'Test candle 1' },
    { id: 2, title: 'Candle 2', price: 2000, description: 'Test candle 2' }
  ]

  return (
    <div data-testid="cart-controller">
      <button 
        onClick={() => addToCart(mockProducts[0])}
        data-testid="add-candle-1"
      >
        Add Candle 1
      </button>
      <button 
        onClick={() => addToCart(mockProducts[1], 2)}
        data-testid="add-candle-2-qty-2"
      >
        Add 2 Candle 2
      </button>
      <button 
        onClick={() => removeFromCart(1)}
        data-testid="remove-candle-1"
      >
        Remove Candle 1
      </button>
      <button 
        onClick={() => updateQuantity(2, 5)}
        data-testid="update-candle-2-qty-5"
      >
        Update Candle 2 to 5
      </button>
    </div>
  )
}

const TestWrapper = ({ children = null }) => (
  <BrowserRouter>
    <CartProvider>
      <Header />
      <CartController />
      {children}
    </CartProvider>
  </BrowserRouter>
)

TestWrapper.propTypes = {
  children: PropTypes.node
}

describe('Header Navigation and Cart Integration Tests', () => {
  it('renders header with logo and navigation', () => {
    render(<TestWrapper />)

    expect(screen.getByRole('img', { name: 'Queen Bee Candles Logo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Queen Bee Candles' })).toBeInTheDocument()
    expect(screen.getByText('Pure NZ Beeswax')).toBeInTheDocument()
    
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument()
  })

  it('displays cart icons in both desktop and mobile navigation', () => {
    render(<TestWrapper />)

    const cartIcons = screen.getAllByTestId('shopping-cart-icon')
    expect(cartIcons).toHaveLength(2)
  })

  it('shows no cart badge when cart is empty', () => {
    render(<TestWrapper />)

    expect(screen.queryByText('0')).not.toBeInTheDocument()
    
    const cartIcons = screen.getAllByTestId('shopping-cart-icon')
    cartIcons.forEach(icon => {
      expect(icon.nextSibling).toBeFalsy()
    })
  })

  it('displays cart badge with correct count when items added', async () => {
    const user = userEvent.setup()
    
    render(<TestWrapper />)

    await user.click(screen.getByTestId('add-candle-1'))

    await waitFor(() => {
      const badges = screen.getAllByText('1')
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('updates cart badge count when multiple items added', async () => {
    const user = userEvent.setup()
    
    render(<TestWrapper />)

    await user.click(screen.getByTestId('add-candle-1'))
    await user.click(screen.getByTestId('add-candle-2-qty-2'))

    await waitFor(() => {
      const badges = screen.getAllByText('3')
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('updates cart badge when item quantity changes', async () => {
    const user = userEvent.setup()
    
    render(<TestWrapper />)

    await user.click(screen.getByTestId('add-candle-2-qty-2'))
    
    await waitFor(() => {
      const badges = screen.getAllByText('2')
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })

    await user.click(screen.getByTestId('update-candle-2-qty-5'))

    await waitFor(() => {
      const badges = screen.getAllByText('5')
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('removes cart badge when all items removed', async () => {
    const user = userEvent.setup()
    
    render(<TestWrapper />)

    await user.click(screen.getByTestId('add-candle-1'))
    
    await waitFor(() => {
      const badges = screen.getAllByText('1')
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })

    await user.click(screen.getByTestId('remove-candle-1'))

    await waitFor(() => {
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })
  })

  it('toggles mobile menu', async () => {
    const user = userEvent.setup()
    
    render(<TestWrapper />)

    const menuToggle = screen.getByRole('button', { name: /navigation menu/i })
    const nav = screen.getByRole('navigation')

    expect(nav).not.toHaveClass('is-open')

    await user.click(menuToggle)
    expect(nav).toHaveClass('is-open')

    await user.click(menuToggle)
    expect(nav).not.toHaveClass('is-open')
  })

  it('closes mobile menu when navigation link clicked', async () => {
    const user = userEvent.setup()
    
    render(<TestWrapper />)

    const menuToggle = screen.getByRole('button', { name: /navigation menu/i })
    const nav = screen.getByRole('navigation')
    const homeLink = screen.getByRole('link', { name: 'Home' })

    await user.click(menuToggle)
    expect(nav).toHaveClass('is-open')

    await user.click(homeLink)
    expect(nav).not.toHaveClass('is-open')
  })

  it('has accessible menu toggle button', () => {
    render(<TestWrapper />)

    const menuToggle = screen.getByRole('button', { name: /navigation menu/i })
    expect(menuToggle).toHaveAttribute('aria-label', 'Open navigation menu')
  })

  it('has proper navigation structure', () => {
    render(<TestWrapper />)

    const nav = screen.getByRole('navigation')
    const navList = screen.getByRole('list')
    
    expect(nav).toContainElement(navList)
    
    const navItems = screen.getAllByRole('listitem')
    expect(navItems).toHaveLength(4)
  })

  it('cart icons are links to cart page', () => {
    render(<TestWrapper />)

    const cartLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href') === '/cart'
    )
    
    expect(cartLinks).toHaveLength(2)
  })

  it('logo links to home page', () => {
    render(<TestWrapper />)

    const logoImg = screen.getByRole('img', { name: 'Queen Bee Candles Logo' })
    const logoLink = logoImg.closest('a')
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('navigation links have correct href attributes', () => {
    render(<TestWrapper />)

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
  })

  it('handles rapid cart updates correctly', async () => {
    const user = userEvent.setup()
    
    render(<TestWrapper />)

    await user.click(screen.getByTestId('add-candle-1'))
    await user.click(screen.getByTestId('add-candle-1'))
    await user.click(screen.getByTestId('add-candle-2-qty-2'))
    await user.click(screen.getByTestId('remove-candle-1'))

    await waitFor(() => {
      const badges = screen.getAllByText('2')
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('cart badge displays correctly for high quantities', async () => {
    const user = userEvent.setup()
    
    render(<TestWrapper />)

    await user.click(screen.getByTestId('add-candle-2-qty-2'))
    await user.click(screen.getByTestId('update-candle-2-qty-5'))

    await waitFor(() => {
      const badges = screen.getAllByText('5')
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('maintains proper CSS classes for styling', () => {
    render(<TestWrapper />)

    expect(screen.getByRole('banner')).toHaveClass('header')
    expect(screen.getByRole('navigation')).toHaveClass('main-nav')
    
    const logoImg = screen.getByRole('img', { name: 'Queen Bee Candles Logo' })
    expect(logoImg).toHaveClass('logo')
  })

  it('has proper semantic HTML structure', () => {
    render(<TestWrapper />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})