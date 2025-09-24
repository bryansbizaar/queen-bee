import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('Smoke Tests', () => {
  it('App loads without crashing', () => {
    render(<App />)
    
    // Should render without throwing
    expect(document.body).toBeInTheDocument()
  })

  it('Shows Queen Bee Candles header', () => {
    render(<App />)
    
    // Should show the header text
    expect(screen.getByText('Queen Bee Candles')).toBeInTheDocument()
  })
})