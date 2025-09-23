// Error Boundary Testing Utilities
// Provides utilities for testing error boundary scenarios

import React from 'react'
import PropTypes from 'prop-types'
import { vi } from 'vitest'
import { logError } from '../../context/ErrorLogger'
import { http, HttpResponse } from 'msw'

// Mock console methods to suppress error logging during tests
const suppressConsoleErrors = () => {
  const originalError = console.error
  const originalWarn = console.warn
  
  console.error = vi.fn()
  console.warn = vi.fn()
  
  return () => {
    console.error = originalError
    console.warn = originalWarn
  }
}

// Error types for testing
export const errorTypes = {
  COMPONENT_ERROR: 'ComponentError',
  ASYNC_ERROR: 'AsyncError',
  NETWORK_ERROR: 'NetworkError',
  VALIDATION_ERROR: 'ValidationError',
  TIMEOUT_ERROR: 'TimeoutError',
  PERMISSION_ERROR: 'PermissionError',
  NOT_FOUND_ERROR: 'NotFoundError',
  SERVER_ERROR: 'ServerError',
  CART_ERROR: 'CartError',
  PAYMENT_ERROR: 'PaymentError',
}

// Mock error scenarios
export const mockErrors = {
  componentRenderError: new Error('Component failed to render'),
  asyncOperationError: new Error('Async operation failed'),
  networkError: new Error('Network request failed'),
  validationError: new Error('Validation failed'),
  timeoutError: new Error('Request timeout'),
  permissionError: new Error('Permission denied'),
  notFoundError: new Error('Resource not found'),
  serverError: new Error('Internal server error'),
  cartError: new Error('Cart operation failed'),
  paymentError: new Error('Payment processing failed'),
}

// Error boundary testing utilities
export const errorBoundaryUtils = {
  // Create a component that throws an error
  createErrorComponent: (errorType = 'render', message = 'Test error') => {
    return function ErrorComponent({ shouldError = true, errorOn = 'render' }) {
      if (shouldError && errorOn === 'render') {
        throw new Error(message)
      }
      
      if (shouldError && errorOn === 'effect') {
        React.useEffect(() => {
          throw new Error(message)
        }, [])
      }
      
      if (shouldError && errorOn === 'async') {
        React.useEffect(() => {
          setTimeout(() => {
            throw new Error(message)
          }, 100)
        }, [])
      }
      
      return <div data-testid="error-component">Error Component</div>
    }
  },

  // Suppress console errors during error boundary tests
  suppressConsoleErrors,

  // Test error boundary with different error scenarios
  testErrorScenario: async (renderFunction, errorScenario) => {
    const restoreConsole = suppressConsoleErrors()
    
    try {
      const result = await renderFunction(errorScenario)
      return result
    } finally {
      restoreConsole()
    }
  },

  // Mock network errors for API calls
  mockNetworkError: (endpoint, errorType = 'NETWORK_ERROR') => {
    global.server.use(
      http.get(endpoint, () => {
        return HttpResponse.json({ error: errorType, message: 'Network error occurred' }, { status: 500 })
      })
    )
  },

  // Mock cart-specific errors
  mockCartError: (server, operation = 'add') => {
    const endpoints = {
      add: '/api/cart/add',
      remove: '/api/cart/remove',
      update: '/api/cart/update',
      clear: '/api/cart/clear',
      checkout: '/api/cart/checkout',
    }
    
    const endpoint = endpoints[operation] || endpoints.add
    
    global.server.use(
      http.post(endpoint, () => {
        return HttpResponse.json({
            error: 'CART_ERROR',
            message: `Cart ${operation} operation failed`,
            details: 'Mock cart error for testing'
          }, { status: 400 })
      })
    )
  },

  // Mock payment errors
  mockPaymentError: (server, errorType = 'PAYMENT_DECLINED') => {
    global.server.use(
      http.post('/api/payment/process', (req, res, ctx) => {
        return res(
          ctx.status(402),
          ctx.json({ 
            error: errorType, 
            message: 'Payment processing failed',
            details: 'Mock payment error for testing'
          })
        )
      })
    )
  },

  // Mock async operation timeout
  mockAsyncTimeout: (server, endpoint, delay = 5000) => {
    server.use(
      http.get(endpoint, async () => {
        await new Promise(resolve => setTimeout(resolve, delay))
        return HttpResponse.json({ data: 'response' })
      })
    )
  },

  // Test error recovery scenarios
  testErrorRecovery: async (component, recoveryAction) => {
    const restoreConsole = suppressConsoleErrors()
    
    try {
      // Trigger error
      await recoveryAction.triggerError()
      
      // Verify error state
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      
      // Attempt recovery
      if (recoveryAction.recoveryButton) {
        await userEvent.click(screen.getByText(recoveryAction.recoveryButton))
      }
      
      // Verify recovery
      if (recoveryAction.expectedRecovery) {
        await waitFor(() => {
          expect(screen.getByText(recoveryAction.expectedRecovery)).toBeInTheDocument()
        })
      }
      
    } finally {
      restoreConsole()
    }
  },

  // Test error boundary fallback UI
  testFallbackUI: (container, expectedElements) => {
    expectedElements.forEach(element => {
      if (element.type === 'text') {
        expect(screen.getByText(element.content)).toBeInTheDocument()
      } else if (element.type === 'button') {
        expect(screen.getByRole('button', { name: element.content })).toBeInTheDocument()
      } else if (element.type === 'link') {
        expect(screen.getByRole('link', { name: element.content })).toBeInTheDocument()
      } else if (element.type === 'image') {
        expect(screen.getByAltText(element.content)).toBeInTheDocument()
      }
    })
  },

  // Test error logging and reporting
  testErrorReporting: (errorHandler, expectedCalls) => {
    expectedCalls.forEach(call => {
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          errorInfo: expect.objectContaining({
            componentStack: expect.any(String)
          }),
          ...call.additionalData
        })
      )
    })
  },

  // Test error boundary with cart integration
  testCartErrorBoundary: async (cartOperation, expectedError) => {
    const restoreConsole = suppressConsoleErrors()
    
    try {
      // Mock cart error
      errorBoundaryUtils.mockCartError(server, cartOperation)
      
      // Trigger cart operation that should fail
      const addButton = screen.getByRole('button', { name: /add to cart/i })
      await userEvent.click(addButton)
      
      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(expectedError)).toBeInTheDocument()
      })
      
      // Verify cart state preservation
      const cartItems = screen.queryAllByTestId('cart-item')
      expect(cartItems).toHaveLength(0) // Cart should remain empty after error
      
    } finally {
      restoreConsole()
    }
  },

  // Test component error isolation
  testErrorIsolation: async (errorComponent, siblingComponent) => {
    const restoreConsole = suppressConsoleErrors()
    
    try {
      // Verify sibling component still renders when error component fails
      expect(screen.getByTestId(siblingComponent)).toBeInTheDocument()
      
      // Verify error boundary caught the error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      
      // Verify error didn't propagate to parent
      expect(screen.getByTestId('app-container')).toBeInTheDocument()
      
    } finally {
      restoreConsole()
    }
  },

  // Test async error handling
  testAsyncError: async (asyncOperation, errorHandler) => {
    const restoreConsole = suppressConsoleErrors()
    
    try {
      // Trigger async operation that should fail
      await asyncOperation()
      
      // Wait for error to be caught and handled
      await waitFor(() => {
        expect(errorHandler).toHaveBeenCalled()
      })
      
      // Verify UI shows appropriate error state
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
      
    } finally {
      restoreConsole()
    }
  },

  // Test error boundary reset functionality
  testErrorReset: async (resetAction) => {
    const restoreConsole = suppressConsoleErrors()
    
    try {
      // Verify error state
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      
      // Trigger reset
      const resetButton = screen.getByRole('button', { name: /try again/i })
      await userEvent.click(resetButton)
      
      // Verify component resets to normal state
      await waitFor(() => {
        expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
      })
      
      if (resetAction.expectedContent) {
        expect(screen.getByText(resetAction.expectedContent)).toBeInTheDocument()
      }
      
    } finally {
      restoreConsole()
    }
  },

  // Test error boundary with navigation
  testErrorWithNavigation: async (navigationAction, expectedRoute) => {
    const restoreConsole = suppressConsoleErrors()
    
    try {
      // Trigger navigation during error state
      await navigationAction()
      
      // Verify navigation occurred despite error
      expect(window.location.pathname).toBe(expectedRoute)
      
      // Verify error boundary reset on navigation
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
      
    } finally {
      restoreConsole()
    }
  },

  // Test performance during error scenarios
  testErrorPerformance: async (errorScenario, performanceThreshold = 1000) => {
    const restoreConsole = suppressConsoleErrors()
    
    try {
      const startTime = performance.now()
      
      // Trigger error scenario
      await errorScenario()
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Verify error handling doesn't cause performance issues
      expect(duration).toBeLessThan(performanceThreshold)
      
    } finally {
      restoreConsole()
    }
  },

  // Test error boundary accessibility
  testErrorAccessibility: async (container) => {
    // Verify error boundary maintains accessibility
    const errorContainer = container.querySelector('[data-testid="error-boundary"]')
    
    if (errorContainer) {
      // Should have appropriate ARIA attributes
      expect(errorContainer).toHaveAttribute('role', 'alert')
      
      // Should be announced to screen readers
      expect(errorContainer).toHaveAttribute('aria-live', 'assertive')
      
      // Should have accessible error message
      const errorMessage = errorContainer.querySelector('[role="alert"]')
      expect(errorMessage).toBeInTheDocument()
      
      // Action buttons should be accessible
      const actionButtons = errorContainer.querySelectorAll('button')
      actionButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    }
  },
}

// Export individual utilities
export const {
  createErrorComponent,
  testErrorScenario,
  mockNetworkError,
  mockCartError,
  mockPaymentError,
  mockAsyncTimeout,
  testErrorRecovery,
  testFallbackUI,
  testErrorReporting,
  testCartErrorBoundary,
  testErrorIsolation,
  testAsyncError,
  testErrorReset,
  testErrorWithNavigation,
  testErrorPerformance,
  testErrorAccessibility,
} = errorBoundaryUtils

// Create mock error boundary component for testing
export class MockErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    logError(error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div data-testid="error-boundary" role="alert" aria-live="assertive">
          <h2>Something went wrong</h2>
          <p>An error occurred while rendering this component.</p>
          {this.props.showDetails && this.state.error && this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error Details</summary>
              {this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </details>
          )}
          <button onClick={this.handleReset} aria-label="Try again">
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

MockErrorBoundary.propTypes = {
  children: PropTypes.node,
  onError: PropTypes.func,
  fallback: PropTypes.node,
  showDetails: PropTypes.bool,
};

export default errorBoundaryUtils
