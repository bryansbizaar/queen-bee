// Enhanced Component Testing Setup
// Builds on existing cart test infrastructure

import { afterEach, beforeAll, beforeEach, expect, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { toHaveNoViolations } from 'jest-axe'
import 'jest-axe/extend-expect'

// Import existing cart test infrastructure (for utilities, not handlers)
// import { cartTestUtils } from './cartTestUtils.jsx'
import { handlers as mockApiHandlers } from './mockApiHandlers'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Enhanced test server with existing handlers
const enhancedHandlers = [
  ...mockApiHandlers,
  // Add additional enhanced handlers here as needed
]

export const server = setupServer(...enhancedHandlers)

// Mock ResizeObserver for responsive testing
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock

// Mock IntersectionObserver for lazy loading tests
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = IntersectionObserverMock

// Mock matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage for persistent state testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

global.sessionStorage = sessionStorageMock

// Setup before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Setup before each test
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks()
  localStorageMock.clear.mockClear()
  sessionStorageMock.clear.mockClear()
  
  // Reset DOM
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  
  // Reset window location
  delete window.location
  window.location = { href: 'http://localhost:5173/' }
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Enhanced test utilities
export const enhancedTestUtils = {
  // Simulate mobile viewport
  simulateMobile: () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    })
    window.dispatchEvent(new Event('resize'))
  },
  
  // Simulate tablet viewport
  simulateTablet: () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    window.dispatchEvent(new Event('resize'))
  },
  
  // Simulate desktop viewport
  simulateDesktop: () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    })
    window.dispatchEvent(new Event('resize'))
  },
  
  // Wait for animations to complete
  waitForAnimations: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
  },
  
  // Mock focus management
  mockFocusManagement: () => {
    const mockFocus = vi.fn()
    const mockBlur = vi.fn()
    
    Element.prototype.focus = mockFocus
    Element.prototype.blur = mockBlur
    
    return { mockFocus, mockBlur }
  },
  
  // Simulate keyboard navigation
  simulateKeyboardNavigation: async (user, keys) => {
    for (const key of keys) {
      await user.keyboard(key)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  },
  
  // Mock image loading
  mockImageLoading: () => {
    const mockLoad = vi.fn()
    const mockError = vi.fn()
    
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      set() {
        setTimeout(() => mockLoad(), 100)
      },
    })
    
    return { mockLoad, mockError }
  },
  
  // Simulate network conditions
  simulateSlowNetwork: () => {
    server.use(
      ...enhancedHandlers.map(handler => {
        return handler.clone().mockImplementation(async (req, res, ctx) => {
          await new Promise(resolve => setTimeout(resolve, 2000))
          return handler(req, res, ctx)
        })
      })
    )
  },
  
  // Reset network conditions
  resetNetworkConditions: () => {
    server.resetHandlers()
  },
}

export default enhancedTestUtils
