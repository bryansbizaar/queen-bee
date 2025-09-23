import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, afterEach } from 'vitest'
import CardList from '../components/CardList'

// Mock fetch for API calls
global.fetch = vi.fn()

describe('Products Display', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    // Mock fetch to never resolve (simulate loading)
    fetch.mockImplementation(() => new Promise(() => {}))
    
    render(
      <MemoryRouter>
        <CardList />
      </MemoryRouter>
    )
    
    // Look for the loading spinner by test id
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('handles successful product fetch', async () => {
    // Mock successful API response
    const mockProducts = [
      { id: 1, name: 'Lavender Candle', price: 2500, image: 'lavender.jpg', description: 'A lovely lavender candle', title: 'Lavender Candle' },
      { id: 2, name: 'Vanilla Candle', price: 2500, image: 'vanilla.jpg', description: 'A sweet vanilla candle', title: 'Vanilla Candle' }
    ]

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { products: mockProducts }
      })
    })

    render(
      <MemoryRouter>
        <CardList />
      </MemoryRouter>
    )

    // Wait for products to load and check one exists
    await screen.findByText('Lavender Candle')
    expect(screen.getByText('Lavender Candle')).toBeInTheDocument()
  })
})