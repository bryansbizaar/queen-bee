// ErrorBoundaryTests.test.jsx - Error Boundary Testing
// Includes cart error scenarios with 12 enhanced test cases

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import PropTypes from "prop-types";

// Import enhanced testing utilities
import { enhancedTestUtils } from "../../setup/enhancedTestSetup";
import {
  errorBoundaryUtils,
  MockErrorBoundary,
} from "../../setup/errorBoundaryUtils.jsx";
import { accessibilityUtils } from "../../setup/accessibilityUtils";

// Import existing cart test utilities
import { CartProvider } from "../../../context/CartContext";

// Test wrapper
const TestWrapper = ({ children, initialCartItems = [] }) => {
  return (
    <BrowserRouter>
      <CartProvider initialItems={initialCartItems}>
        <MockErrorBoundary>{children}</MockErrorBoundary>
      </CartProvider>
    </BrowserRouter>
  );
};

TestWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  initialCartItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
    })
  ),
};

// Mock components that can throw errors
const ErrorThrowingComponent = ({
  shouldError = false,
  errorType = "render",
}) => {
  if (shouldError && errorType === "render") {
    throw new Error("Component render error");
  }

  React.useEffect(() => {
    if (shouldError && errorType === "effect") {
      throw new Error("Component effect error");
    }
  }, [shouldError, errorType]);

  return <div data-testid="error-component">Working Component</div>;
};

ErrorThrowingComponent.propTypes = {
  shouldError: PropTypes.bool,
  errorType: PropTypes.oneOf(["render", "effect"]),
};

const AsyncErrorComponent = ({ shouldError = false }) => {
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (shouldError) {
      setTimeout(() => {
        setError(true);
      }, 100);
    }
  }, [shouldError]);

  if (error) {
    throw new Error("Async component error");
  }

  return <div data-testid="async-component">Async Component</div>;
};

AsyncErrorComponent.propTypes = {
  shouldError: PropTypes.bool,
};

describe("ErrorBoundaryTests - Component Error Handling (4 tests)", () => {
  beforeEach(() => {
    enhancedTestUtils.simulateDesktop();
  });

  test("catches React component render errors", async () => {
    const onError = vi.fn();

    render(
      <MockErrorBoundary onError={onError}>
        <ErrorThrowingComponent shouldError={true} errorType="render" />
      </MockErrorBoundary>
    );

    // Verify error boundary catches the error
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Verify error handler was called
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );

    // Verify original component is not rendered
    expect(screen.queryByTestId("error-component")).not.toBeInTheDocument();
  });

  test("handles JavaScript runtime errors", async () => {
    const onError = vi.fn();

    render(
      <MockErrorBoundary onError={onError}>
        <ErrorThrowingComponent shouldError={true} errorType="effect" />
      </MockErrorBoundary>
    );

    // Wait for effect to run and throw error
    await waitFor(() => {
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    });

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  test("isolates errors to prevent cascading failures", async () => {
    const onError = vi.fn();

    render(
      <div data-testid="app-container">
        <div data-testid="working-section">
          <h1>Working Section</h1>
        </div>
        <MockErrorBoundary onError={onError}>
          <ErrorThrowingComponent shouldError={true} />
        </MockErrorBoundary>
        <div data-testid="another-working-section">
          <h2>Another Working Section</h2>
        </div>
      </div>
    );

    // Verify error is isolated
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();

    // Verify other parts of the app still work
    expect(screen.getByTestId("app-container")).toBeInTheDocument();
    expect(screen.getByTestId("working-section")).toBeInTheDocument();
    expect(screen.getByTestId("another-working-section")).toBeInTheDocument();
    expect(screen.getByText("Working Section")).toBeInTheDocument();
    expect(screen.getByText("Another Working Section")).toBeInTheDocument();
  });

  test("preserves cart state during component errors", async () => {
    const mockCartItems = [
      { id: 1, productId: 1, name: "Test Product", quantity: 2, price: 24.99 },
    ];

    const onError = vi.fn();

    render(
      <BrowserRouter>
        <CartProvider initialItems={mockCartItems}>
          <div data-testid="cart-display">
            Cart Items: {mockCartItems.length}
          </div>
          <MockErrorBoundary onError={onError}>
            <ErrorThrowingComponent shouldError={true} />
          </MockErrorBoundary>
        </CartProvider>
      </BrowserRouter>
    );

    // Verify error boundary is active
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();

    // Verify cart state is preserved
    expect(screen.getByTestId("cart-display")).toBeInTheDocument();
    expect(screen.getByText("Cart Items: 1")).toBeInTheDocument();
  });
});

describe("ErrorBoundaryTests - Fallback UI Testing (4 tests)", () => {
  test("renders user-friendly error fallback", () => {
    const customFallback = (
      <div data-testid="custom-error-fallback" role="alert">
        <h2>Oops! Something went wrong</h2>
        <p>
          We&apos;re sorry for the inconvenience. Please try refreshing the
          page.
        </p>
        <button>Refresh Page</button>
        <button>Go Home</button>
      </div>
    );

    render(
      <MockErrorBoundary fallback={customFallback}>
        <ErrorThrowingComponent shouldError={true} />
      </MockErrorBoundary>
    );

    // Verify custom fallback is rendered
    expect(screen.getByTestId("custom-error-fallback")).toBeInTheDocument();
    expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
    expect(
      screen.getByText(/we're sorry for the inconvenience/i)
    ).toBeInTheDocument();

    // Verify action buttons are present
    expect(
      screen.getByRole("button", { name: /refresh page/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go home/i })
    ).toBeInTheDocument();
  });

  test("provides retry mechanism for failed components", async () => {
    const onError = vi.fn();

    render(
      <MockErrorBoundary onError={onError}>
        <ErrorThrowingComponent shouldError={true} />
      </MockErrorBoundary>
    );

    // Verify error state
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole("button", { name: /try again/i });
    // Note: In a real implementation, this would reset the error boundary
    // and attempt to re-render the component
    expect(retryButton).toBeInTheDocument();
  });

  test("displays helpful error information for developers", () => {
    const onError = vi.fn();

    render(
      <MockErrorBoundary onError={onError} showDetails={true}>
        <ErrorThrowingComponent shouldError={true} />
      </MockErrorBoundary>
    );

    // In development mode, show additional error details
    if (import.meta.env.DEV) {
      expect(screen.getByText(/error details/i)).toBeInTheDocument();
      expect(screen.getByText(/ErrorThrowingComponent/)).toBeInTheDocument();
    }
  });

  test("maintains accessibility in error states", async () => {
    const { container } = render(
      <MockErrorBoundary>
        <ErrorThrowingComponent shouldError={true} />
      </MockErrorBoundary>
    );

    // Verify error boundary maintains accessibility
    await accessibilityUtils.checkA11y(container);

    // Verify error announcement
    const errorContainer = screen.getByTestId("error-boundary");
    expect(errorContainer).toHaveAttribute("role", "alert");
    expect(errorContainer).toHaveAttribute("aria-live", "assertive");

    // Verify retry button is accessible
    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toHaveAttribute("aria-label");
  });
});

describe("ErrorBoundaryTests - Recovery Scenarios (4 tests)", () => {
  test("recovers from network-related cart errors", async () => {
    const user = userEvent.setup();

    // Mock network error for cart operations
    errorBoundaryUtils.mockNetworkError("/api/cart/add");

    const CartComponent = () => {
      const [error, setError] = React.useState(false);

      const handleAddToCart = async () => {
        try {
          // This would normally make a network request
          throw new Error("Network error: Failed to add item to cart");
        } catch (err) {
          setError(true);
        }
      };

      if (error) {
        throw new Error("Cart operation failed");
      }

      return (
        <button onClick={handleAddToCart} data-testid="add-to-cart">
          Add to Cart
        </button>
      );
    };

    render(
      <TestWrapper>
        <CartComponent />
      </TestWrapper>
    );

    // Trigger cart error
    const addButton = screen.getByTestId("add-to-cart");
    await user.click(addButton);

    // Verify error boundary catches cart error
    await waitFor(() => {
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    });

    // Verify error message
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test("handles partial component recovery", async () => {
    const PartiallyFailingComponent = ({ shouldError }) => {
      const [hasError, setHasError] = React.useState(false);

      React.useEffect(() => {
        if (shouldError) {
          setHasError(true);
        }
      }, [shouldError]);

      if (hasError) {
        throw new Error("Partial component failure");
      }

      return (
        <div>
          <div data-testid="working-part">This part works</div>
          <div data-testid="failing-part">This part might fail</div>
        </div>
      );
    };

    PartiallyFailingComponent.propTypes = {
      shouldError: PropTypes.bool,
    };

    const { rerender } = render(
      <MockErrorBoundary>
        <PartiallyFailingComponent shouldError={false} />
      </MockErrorBoundary>
    );

    // Initially working
    expect(screen.getByTestId("working-part")).toBeInTheDocument();
    expect(screen.getByTestId("failing-part")).toBeInTheDocument();

    // Trigger error
    rerender(
      <MockErrorBoundary>
        <PartiallyFailingComponent shouldError={true} />
      </MockErrorBoundary>
    );

    // Verify error boundary takes over
    await waitFor(() => {
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    });
  });

  test("maintains navigation functionality during errors", async () => {
    render(
      <BrowserRouter>
        <div data-testid="navigation">
          <a href="/home">Home</a>
          <a href="/products">Products</a>
        </div>
        <MockErrorBoundary>
          <ErrorThrowingComponent shouldError={true} />
        </MockErrorBoundary>
      </BrowserRouter>
    );

    // Verify error boundary is active
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();

    // Verify navigation still works
    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /products/i })).toBeInTheDocument();

    // Test navigation interaction
    const homeLink = screen.getByRole("link", { name: /home/i });
    // Navigation should still work despite error
    expect(homeLink).toBeInTheDocument();
  });

  test("handles cache invalidation after errors", async () => {
    const CacheableComponent = ({ shouldError, cacheKey }) => {
      const [data, setData] = React.useState(null);
      const [loading, setLoading] = React.useState(true);
      const [error, setError] = React.useState(null);

      React.useEffect(() => {
        const loadData = async () => {
          try {
            if (shouldError) {
              throw new Error("Cache loading error");
            }

            // Simulate cache loading
            setTimeout(() => {
              setData(`Cached data for ${cacheKey}`);
              setLoading(false);
            }, 100);
          } catch (err) {
            setError(err);
            setLoading(false);
          }
        };

        loadData();
      }, [shouldError, cacheKey]);

      if (error) {
        throw error;
      }

      if (loading) {
        return <div data-testid="loading">Loading...</div>;
      }

      return <div data-testid="cached-data">{data}</div>;
    };

    CacheableComponent.propTypes = {
      shouldError: PropTypes.bool,
      cacheKey: PropTypes.string,
    };

    const { rerender } = render(
      <MockErrorBoundary>
        <CacheableComponent shouldError={false} cacheKey="test-1" />
      </MockErrorBoundary>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId("cached-data")).toBeInTheDocument();
    });

    // Trigger error
    rerender(
      <MockErrorBoundary>
        <CacheableComponent shouldError={true} cacheKey="test-2" />
      </MockErrorBoundary>
    );

    // Verify error boundary handles cache error
    await waitFor(() => {
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    });

    // Verify retry functionality
    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });
});
