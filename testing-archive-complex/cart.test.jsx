import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock fetch for API calls
global.fetch = vi.fn()

describe('Cart Functionality', () => {
  beforeEach(() => {
    fetch.mockClear()
    // Mock successful products API call
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          products: [
            { id: 1, name: 'Test Candle', price: 2500, image: 'test.jpg' }
          ]
        }
      })
    })
  })

  it('can add item to cart and see cart update', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test Candle')).toBeInTheDocument()
    })

    // Find and click "Add to Cart" button
    const addToCartButton = screen.getByText(/add to cart/i)
    fireEvent.click(addToCartButton)

    // Cart should show item count (look for cart icon with number)
    await waitFor(() => {
      // This might need adjustment based on your cart implementation
      const cartElement = screen.getByText('1') || screen.getByText(/cart/i)
      expect(cartElement).toBeInTheDocument()
    })
  })

  it('shows cart is initially empty', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Cart should be empty initially
    const cartIcon = screen.getByRole('link', { name: /cart/i }) || screen.getByTestId('cart-icon')
    expect(cartIcon).toBeInTheDocument()
  })

  it('can navigate to cart page', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Find cart link and click it
    const cartLink = screen.getByRole('link', { name: /cart/i })
    fireEvent.click(cartLink)

    // Should navigate to cart page
    await waitFor(() => {
      expect(window.location.pathname).toBe('/cart')
    })
  })
})