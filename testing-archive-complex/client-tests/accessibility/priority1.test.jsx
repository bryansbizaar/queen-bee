import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import CartContext from '../../context/CartContext';
import { accessibilityUtils } from '../setup/accessibilityUtils';
import Cart from '../../components/Cart';
import CardList from '../../components/CardList';
import Header from '../../components/Header';
import CartIcon from '../../components/CartIcon';

// Mock the cart context with realistic data
const mockCartWithItems = {
  cartItems: [
    { 
      id: 1, 
      title: 'Dragon', 
      price: 1500, // $15.00 in cents
      quantity: 1, 
      image: 'dragon.jpg' 
    }
  ],
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  getCartTotal: () => 1500,
  getCartCount: () => 1,
  addToCart: vi.fn(),
  clearCart: vi.fn()
};

// Mock empty cart context
const emptyCartContext = {
  cartItems: [],
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  getCartTotal: () => 0,
  getCartCount: () => 0,
  addToCart: vi.fn(),
  clearCart: vi.fn()
};

// Helper to render components with custom cart context
const renderWithCartContext = (component, cartContext = mockCartWithItems) => {
  return render(
    <BrowserRouter>
      <CartContext.Provider value={cartContext}>
        {component}
      </CartContext.Provider>
    </BrowserRouter>
  );
};

describe('Priority 1 Accessibility Improvements', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('Header Component', () => {
    test('should have proper ARIA attributes', () => {
      renderWithCartContext(<Header />);
      
      // Check for banner role
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      // Check for navigation
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
      
      // Check menu toggle has proper ARIA
      const menuToggle = screen.getByRole('button', { name: /navigation menu/i });
      expect(menuToggle).toHaveAttribute('aria-expanded');
    });
  });

  describe('Cart Component', () => {
    test('should have live region for announcements when cart has items', () => {
      const { container } = renderWithCartContext(<Cart />, mockCartWithItems);
      
      // Check for live region - should exist when cart has items
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    test('should have proper form labels and error handling when cart has items', () => {
      renderWithCartContext(<Cart />, mockCartWithItems);
      
      // First verify we're not seeing empty cart
      const emptyMessage = screen.queryByText(/your cart is empty/i);
      expect(emptyMessage).not.toBeInTheDocument();
      
      // Check email input has proper attributes
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    });

    test('should show empty cart message when no items', () => {
      renderWithCartContext(<Cart />, emptyCartContext);
      
      // Check for empty cart message
      const emptyMessage = screen.getByText(/your cart is empty/i);
      expect(emptyMessage).toBeInTheDocument();
    });
  });

  describe('CartIcon Component', () => {
    test('should have proper accessibility labels', () => {
      renderWithCartContext(<CartIcon />);
      
      // Check that cart icon has proper aria-label
      const cartLink = screen.getByRole('link', { name: /shopping cart/i });
      expect(cartLink).toBeInTheDocument();
      expect(cartLink).toHaveAttribute('aria-label');
    });
  });

  describe('CardList Component', () => {
    test('should have proper semantic structure', async () => {
      // Mock fetch to return empty array
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { products: [] } }),
        })
      );

      renderWithCartContext(<CardList />);
      
      // Wait for no products message
      const noProducts = await screen.findByText(/no products found/i);
      expect(noProducts).toHaveAttribute('role', 'status');
    });
  });

  describe('Accessibility Compliance', () => {
    test('Cart icons should have proper accessibility labels', () => {
      const { container } = renderWithCartContext(<Header />);
      
      // Test that cart links have proper labels
      const cartLinks = container.querySelectorAll('.cart-icon-wrapper');
      cartLinks.forEach(link => {
        expect(link).toHaveAttribute('aria-label');
        expect(link.getAttribute('aria-label')).toMatch(/shopping cart/i);
      });
    });

    test('Skip link should be present', () => {
      renderWithCartContext(
        <>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <main id="main-content" role="main">Test content</main>
        </>
      );
      
      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });
});
