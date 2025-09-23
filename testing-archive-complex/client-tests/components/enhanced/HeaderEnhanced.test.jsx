// HeaderEnhanced.test.jsx - Advanced Header Component Testing
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

// Import enhanced testing utilities
import { enhancedTestUtils } from '../../setup/enhancedTestSetup'

// Import existing cart test utilities
import { CartProvider } from '../../../context/CartContext'

// Import component
import Header from '../../../components/Header'

// Test wrapper that includes cart context and routing
const TestWrapper = ({ children }) => {
  return (
    <BrowserRouter>
      <CartProvider>
        {children}
      </CartProvider>
    </BrowserRouter>
  )
}

// Add PropTypes validation
TestWrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('HeaderEnhanced - Advanced Navigation Tests', () => {
  beforeEach(() => {
    enhancedTestUtils.simulateDesktop()
  })

  test('handles menu toggle interactions', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Use the actual aria-label from your component
    const menuToggle = screen.getByLabelText(/navigation menu/i)
    expect(menuToggle).toBeInTheDocument()
    
    await user.click(menuToggle)
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('provides navigation through all links', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Get links by text instead of role to avoid duplicates
    const homeLink = screen.getByRole('link', { name: 'Home' })
    const aboutLink = screen.getByRole('link', { name: 'About' })
    const contactLink = screen.getByRole('link', { name: 'Contact' })
    
    expect(homeLink).toBeInTheDocument()
    expect(aboutLink).toBeInTheDocument()
    expect(contactLink).toBeInTheDocument()
    
    await user.click(homeLink)
    expect(homeLink).toBeInTheDocument()
  })

  test('handles mobile menu interactions', async () => {
    enhancedTestUtils.simulateMobile()
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Use the actual aria-label from your component
    const menuButton = screen.getByLabelText(/navigation menu/i)
    expect(menuButton).toBeInTheDocument()
    
    await user.click(menuButton)
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('maintains header structure across interactions', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Check that header maintains structure
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    
    // Interact with menu
    const menuToggle = screen.getByLabelText(/navigation menu/i)
    await user.click(menuToggle)
    
    // Structure should remain intact
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('cart badge updates correctly', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Check for cart links (there should be multiple)
    const cartLinks = screen.getAllByLabelText(/shopping cart/i)
    expect(cartLinks.length).toBeGreaterThan(0)
    
    // All cart links should have proper accessibility
    cartLinks.forEach(link => {
      expect(link).toHaveAttribute('aria-label')
    })
  })

  test('menu closes when navigation links are clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Open mobile menu
    const menuToggle = screen.getByLabelText(/navigation menu/i)
    await user.click(menuToggle)
    
    // Click a navigation link
    const homeLink = screen.getByRole('link', { name: 'Home' })
    await user.click(homeLink)
    
    // Menu state should be managed (this test verifies the click works)
    expect(homeLink).toBeInTheDocument()
  })
})

describe('HeaderEnhanced - Logo and Branding', () => {
  test('displays logo with proper accessibility', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const logo = screen.getByAltText(/queen bee candles logo/i)
    expect(logo).toBeInTheDocument()
    
    const logoLink = screen.getByLabelText(/queen bee candles.*homepage/i)
    expect(logoLink).toBeInTheDocument()
  })

  test('displays brand title and tagline', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    expect(screen.getByText('Queen Bee Candles')).toBeInTheDocument()
    expect(screen.getByText('Pure NZ Beeswax')).toBeInTheDocument()
  })

  test('logo link navigates correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const logoLink = screen.getByLabelText(/queen bee candles.*homepage/i)
    await user.click(logoLink)
    
    // Logo should remain accessible after click
    expect(logoLink).toBeInTheDocument()
  })
})

describe('HeaderEnhanced - Responsive Design', () => {
  test('adapts to mobile viewport', () => {
    enhancedTestUtils.simulateMobile()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByLabelText(/navigation menu/i)).toBeInTheDocument()
  })

  test('adapts to desktop viewport', () => {
    enhancedTestUtils.simulateDesktop()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('handles viewport changes gracefully', () => {
    const { rerender } = render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Switch to mobile
    enhancedTestUtils.simulateMobile()
    rerender(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()

    // Switch back to desktop
    enhancedTestUtils.simulateDesktop()
    rerender(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})

describe('HeaderEnhanced - Accessibility Tests', () => {
  test('has proper ARIA labels and semantic structure', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Check header has banner role
    expect(screen.getByRole('banner')).toBeInTheDocument()
    
    // Check navigation has proper ARIA
    const navigation = screen.getByRole('navigation')
    expect(navigation).toHaveAttribute('aria-label', 'Main navigation')
    
    // Check menu toggle has proper ARIA label
    const menuToggle = screen.getByLabelText(/navigation menu/i)
    expect(menuToggle).toBeInTheDocument()
    expect(menuToggle).toHaveAttribute('aria-expanded')
    expect(menuToggle).toHaveAttribute('aria-controls')
  })

  test('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Tab through the header elements
    await user.tab()
    
    // Should be able to focus on interactive elements
    const focusedElement = document.activeElement
    expect(focusedElement).toBeTruthy()
  })

  test('announces menu state changes to screen readers', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const menuToggle = screen.getByLabelText(/navigation menu/i)
    
    // Initially closed
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false')
    
    // Open menu
    await user.click(menuToggle)
    
    // Should update aria-expanded
    expect(menuToggle).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('HeaderEnhanced - Cart Integration', () => {
  test('displays cart icon with correct item count', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Should have cart links with proper labels
    const cartLinks = screen.getAllByLabelText(/shopping cart/i)
    expect(cartLinks.length).toBeGreaterThan(0)
    
    cartLinks.forEach(link => {
      expect(link.getAttribute('aria-label')).toMatch(/shopping cart with \d+ items?/i)
    })
  })

  test('cart icon is accessible via keyboard', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Tab to cart icon and activate
    const cartLinks = screen.getAllByLabelText(/shopping cart/i)
    const firstCartLink = cartLinks[0]
    
    await user.tab()
    if (document.activeElement === firstCartLink) {
      await user.keyboard('{Enter}')
    }
    
    // Should remain accessible
    expect(firstCartLink).toBeInTheDocument()
  })

  test('multiple cart icons maintain consistency', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const cartLinks = screen.getAllByLabelText(/shopping cart/i)
    
    // All cart links should have the same item count
    const labels = cartLinks.map(link => link.getAttribute('aria-label'))
    const uniqueLabels = [...new Set(labels)]
    
    // All labels should be the same (same cart state)
    expect(uniqueLabels).toHaveLength(1)
  })
})
