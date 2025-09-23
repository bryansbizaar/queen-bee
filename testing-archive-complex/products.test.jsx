import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CardList from '../components/CardList'

// Mock fetch for API calls
global.fetch = vi.fn()

describe('Products Display', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('shows loading state initially', () => {
    // Mock a pending fetch
    fetch.mockImplementation(() => new Promise(() => {}))
    
    render(
      <BrowserRouter>
        <CardList />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays products when API call succeeds', async () => {
    // Mock successful API response with 4 candles
    const mockProducts = [
      { id: 1, name: 'Lavender Candle', price: 2500, image: 'lavender.jpg' },
      { id: 2, name: 'Vanilla Candle', price: 2500, image: 'vanilla.jpg' },
      { id: 3, name: 'Eucalyptus Candle', price: 2500, image: 'eucalyptus.jpg' },
      { id: 4, name: 'Rose Candle', price: 2500, image: 'rose.jpg' }
    ]

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { products: mockProducts }
      })
    })

    render(
      <BrowserRouter>
        <CardList />
      </BrowserRouter>
    )

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Lavender Candle')).toBeInTheDocument()
    })

    // Should show all 4 candles
    expect(screen.getByText('Lavender Candle')).toBeInTheDocument()
    expect(screen.getByText('Vanilla Candle')).toBeInTheDocument()
    expect(screen.getByText('Eucalyptus Candle')).toBeInTheDocument()
    expect(screen.getByText('Rose Candle')).toBeInTheDocument()
  })

  it('shows error message when API call fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'))

    render(
      <BrowserRouter>
        <CardList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})