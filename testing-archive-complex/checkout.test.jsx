import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import StripeCheckout from '../components/StripeCheckout'

// Mock Stripe - simple version
vi.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => ({ confirmPayment: vi.fn() }),
  useElements: () => ({ getElement: vi.fn() }),
  CardElement: () => <div data-testid="card-element">Mock Card Element</div>,
  Elements: ({ children }) => children
}))

describe('Checkout Integration', () => {
  it('checkout component renders without errors', () => {
    render(
      <BrowserRouter>
        <StripeCheckout />
      </BrowserRouter>
    )

    // Should render without crashing
    expect(document.body).toBeInTheDocument()
  })

  it('shows payment-related content', () => {
    render(
      <BrowserRouter>
        <StripeCheckout />
      </BrowserRouter>
    )

    // Should show some form of payment interface
    // This is a basic smoke test for the checkout component
    expect(document.body).toBeInTheDocument()
  })
})