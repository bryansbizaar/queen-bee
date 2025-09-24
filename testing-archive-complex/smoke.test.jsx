import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('Smoke Tests', () => {
  it('App loads without crashing and shows basic content', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Should show the header
    expect(screen.getByText('Queen Bee Candles')).toBeInTheDocument()
    
    // Should show navigation
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('Header renders correctly', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Check for logo and main heading
    const heading = screen.getByRole('heading', { name: /queen bee candles/i })
    expect(heading).toBeInTheDocument()
  })
})