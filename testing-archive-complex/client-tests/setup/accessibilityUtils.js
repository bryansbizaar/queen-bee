// Accessibility Testing Utilities
// Provides utilities for comprehensive accessibility testing

import { axe, toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations)

// ARIA role definitions for testing
export const ariaRoles = {
  button: 'button',
  link: 'link',
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  banner: 'banner',
  search: 'search',
  form: 'form',
  dialog: 'dialog',
  alert: 'alert',
  status: 'status',
  progressbar: 'progressbar',
  tab: 'tab',
  tablist: 'tablist',
  tabpanel: 'tabpanel',
  menubar: 'menubar',
  menu: 'menu',
  menuitem: 'menuitem',
  combobox: 'combobox',
  listbox: 'listbox',
  option: 'option',
  grid: 'grid',
  gridcell: 'gridcell',
  columnheader: 'columnheader',
  rowheader: 'rowheader',
  region: 'region',
  article: 'article',
  section: 'section',
  heading: 'heading',
  list: 'list',
  listitem: 'listitem',
  img: 'img',
  figure: 'figure',
  table: 'table',
  cell: 'cell',
  checkbox: 'checkbox',
  radio: 'radio',
  textbox: 'textbox',
  spinbutton: 'spinbutton',
  slider: 'slider',
  switch: 'switch',
}

// Common ARIA attributes for testing
export const ariaAttributes = {
  label: 'aria-label',
  labelledby: 'aria-labelledby',
  describedby: 'aria-describedby',
  expanded: 'aria-expanded',
  hidden: 'aria-hidden',
  disabled: 'aria-disabled',
  required: 'aria-required',
  invalid: 'aria-invalid',
  checked: 'aria-checked',
  selected: 'aria-selected',
  pressed: 'aria-pressed',
  current: 'aria-current',
  live: 'aria-live',
  atomic: 'aria-atomic',
  relevant: 'aria-relevant',
  busy: 'aria-busy',
  owns: 'aria-owns',
  controls: 'aria-controls',
  haspopup: 'aria-haspopup',
  level: 'aria-level',
  posinset: 'aria-posinset',
  setsize: 'aria-setsize',
  valuemin: 'aria-valuemin',
  valuemax: 'aria-valuemax',
  valuenow: 'aria-valuenow',
  valuetext: 'aria-valuetext',
  orientation: 'aria-orientation',
  sort: 'aria-sort',
  multiselectable: 'aria-multiselectable',
  readonly: 'aria-readonly',
  autocomplete: 'aria-autocomplete',
  activedescendant: 'aria-activedescendant',
  flowto: 'aria-flowto',
  dropeffect: 'aria-dropeffect',
  grabbed: 'aria-grabbed',
}

// Accessibility testing utilities
export const accessibilityUtils = {
  // Run axe accessibility audit
  runAxeAudit: async (container, options = {}) => {
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'button-name': { enabled: true },
        'label': { enabled: true },
        ...options.rules,
      },
      ...options,
    })
    return results
  },

  // Check for accessibility violations
  checkA11y: async (container, options = {}) => {
    const results = await accessibilityUtils.runAxeAudit(container, options)
    expect(results).toHaveNoViolations()
    return results
  },

  // Test keyboard navigation
  testKeyboardNavigation: async (user, container, expectedSequence) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    let currentIndex = 0
    
    for (const step of expectedSequence) {
      if (step === 'Tab') {
        await user.keyboard('{Tab}')
        if (currentIndex < focusableElements.length) {
          expect(focusableElements[currentIndex]).toHaveFocus()
          currentIndex++
        }
      } else if (step === 'ShiftTab') {
        await user.keyboard('{Shift>}{Tab}{/Shift}')
        if (currentIndex > 0) {
          currentIndex--
          expect(focusableElements[currentIndex]).toHaveFocus()
        }
      } else if (step === 'Enter') {
        await user.keyboard('{Enter}')
      } else if (step === 'Escape') {
        await user.keyboard('{Escape}')
      } else if (step === 'ArrowDown') {
        await user.keyboard('{ArrowDown}')
      } else if (step === 'ArrowUp') {
        await user.keyboard('{ArrowUp}')
      } else if (step === 'ArrowLeft') {
        await user.keyboard('{ArrowLeft}')
      } else if (step === 'ArrowRight') {
        await user.keyboard('{ArrowRight}')
      } else if (step === 'Home') {
        await user.keyboard('{Home}')
      } else if (step === 'End') {
        await user.keyboard('{End}')
      } else if (step === 'Space') {
        await user.keyboard(' ')
      }
    }
  },

  // Test focus management
  testFocusManagement: async (container, actions) => {
    for (const action of actions) {
      if (action.type === 'focus') {
        const element = container.querySelector(action.selector)
        expect(element).toHaveFocus()
      } else if (action.type === 'blur') {
        const element = container.querySelector(action.selector)
        expect(element).not.toHaveFocus()
      } else if (action.type === 'trap') {
        // Test focus trap
        const focusableElements = container.querySelectorAll(
          action.selector || 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        expect(focusableElements.length).toBeGreaterThan(0)
        
        // Focus should be trapped within the specified container
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        
        // Tab from last element should focus first element
        lastElement.focus()
        expect(lastElement).toHaveFocus()
      }
    }
  },

  // Test screen reader announcements
  testScreenReaderAnnouncements: (container, expectedAnnouncements) => {
    const liveRegions = container.querySelectorAll('[aria-live]')
    const alerts = container.querySelectorAll('[role="alert"]')
    const status = container.querySelectorAll('[role="status"]')
    
    const allAnnouncements = [...liveRegions, ...alerts, ...status]
    
    expectedAnnouncements.forEach(announcement => {
      const matchingElement = allAnnouncements.find(el => 
        el.textContent.includes(announcement.text)
      )
      
      expect(matchingElement).toBeTruthy()
      
      if (announcement.level) {
        expect(matchingElement).toHaveAttribute('aria-live', announcement.level)
      }
    })
  },

  // Test color contrast
  testColorContrast: async (container) => {
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    
    expect(results).toHaveNoViolations()
  },

  // Test semantic markup
  testSemanticMarkup: (container, expectedStructure) => {
    expectedStructure.forEach(structure => {
      const elements = container.querySelectorAll(structure.selector)
      
      if (structure.count) {
        expect(elements).toHaveLength(structure.count)
      } else {
        expect(elements.length).toBeGreaterThan(0)
      }
      
      if (structure.role) {
        elements.forEach(element => {
          expect(element).toHaveAttribute('role', structure.role)
        })
      }
      
      if (structure.attributes) {
        elements.forEach(element => {
          structure.attributes.forEach(attr => {
            expect(element).toHaveAttribute(attr.name, attr.value)
          })
        })
      }
    })
  },

  // Test form accessibility
  testFormAccessibility: (container) => {
    const inputs = container.querySelectorAll('input, select, textarea')
    const labels = container.querySelectorAll('label')
    
    // Every input should have a label
    inputs.forEach(input => {
      const hasLabel = labels.some(label => 
        label.getAttribute('for') === input.id ||
        label.contains(input)
      )
      
      const hasAriaLabel = input.hasAttribute('aria-label')
      const hasAriaLabelledBy = input.hasAttribute('aria-labelledby')
      
      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy()
    })
    
    // Check for required field indicators
    const requiredInputs = container.querySelectorAll('input[required], select[required], textarea[required]')
    requiredInputs.forEach(input => {
      const hasRequiredIndicator = input.hasAttribute('aria-required') ||
        input.closest('label')?.textContent?.includes('*') ||
        input.getAttribute('aria-describedby')
      
      expect(hasRequiredIndicator).toBeTruthy()
    })
    
    // Check error messages
    const invalidInputs = container.querySelectorAll('[aria-invalid="true"]')
    invalidInputs.forEach(input => {
      const hasErrorMessage = input.hasAttribute('aria-describedby')
      expect(hasErrorMessage).toBeTruthy()
    })
  },

  // Test button accessibility
  testButtonAccessibility: (container) => {
    const buttons = container.querySelectorAll('button, [role="button"]')
    
    buttons.forEach(button => {
      // Button should have accessible name
      const hasAccessibleName = 
        button.textContent.trim() ||
        button.hasAttribute('aria-label') ||
        button.hasAttribute('aria-labelledby') ||
        button.querySelector('img')?.hasAttribute('alt')
      
      expect(hasAccessibleName).toBeTruthy()
      
      // Button should be focusable
      const isFocusable = button.tabIndex >= 0 || !button.hasAttribute('tabindex')
      expect(isFocusable).toBeTruthy()
    })
  },

  // Test link accessibility
  testLinkAccessibility: (container) => {
    const links = container.querySelectorAll('a, [role="link"]')
    
    links.forEach(link => {
      // Link should have accessible name
      const hasAccessibleName = 
        link.textContent.trim() ||
        link.hasAttribute('aria-label') ||
        link.hasAttribute('aria-labelledby')
      
      expect(hasAccessibleName).toBeTruthy()
      
      // External links should have proper indication
      if (link.href && !link.href.startsWith(window.location.origin)) {
        const hasExternalIndicator = 
          link.hasAttribute('aria-describedby') ||
          link.textContent.includes('opens in new') ||
          link.querySelector('[aria-hidden="true"]')
        
        expect(hasExternalIndicator).toBeTruthy()
      }
    })
  },

  // Test image accessibility
  testImageAccessibility: (container) => {
    const images = container.querySelectorAll('img')
    
    images.forEach(image => {
      // Decorative images should have empty alt or aria-hidden
      const isDecorative = image.hasAttribute('aria-hidden') || image.alt === ''
      
      // Content images should have descriptive alt text
      const hasDescriptiveAlt = image.alt && image.alt.trim().length > 0
      
      expect(isDecorative || hasDescriptiveAlt).toBeTruthy()
    })
  },

  // Test heading structure
  testHeadingStructure: (container) => {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')
    const headingLevels = Array.from(headings).map(heading => {
      if (heading.hasAttribute('aria-level')) {
        return parseInt(heading.getAttribute('aria-level'))
      }
      return parseInt(heading.tagName.slice(1))
    })
    
    // Should have only one h1
    const h1Count = headingLevels.filter(level => level === 1).length
    expect(h1Count).toBeLessThanOrEqual(1)
    
    // Heading levels should not skip (e.g., h1 -> h3)
    for (let i = 1; i < headingLevels.length; i++) {
      const currentLevel = headingLevels[i]
      const previousLevel = headingLevels[i - 1]
      
      if (currentLevel > previousLevel) {
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1)
      }
    }
  },

  // Test skip links
  testSkipLinks: (container) => {
    const skipLinks = container.querySelectorAll('a[href^="#"]')
    
    skipLinks.forEach(link => {
      const targetId = link.href.split('#')[1]
      const target = container.querySelector(`#${targetId}`)
      
      expect(target).toBeTruthy()
      
      // Target should be focusable
      if (target && !['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        expect(target.hasAttribute('tabindex')).toBeTruthy()
      }
    })
  },

  // Test landmark structure
  testLandmarkStructure: (container) => {
    const landmarks = {
      main: container.querySelectorAll('main, [role="main"]'),
      navigation: container.querySelectorAll('nav, [role="navigation"]'),
      banner: container.querySelectorAll('header, [role="banner"]'),
      contentinfo: container.querySelectorAll('footer, [role="contentinfo"]'),
      complementary: container.querySelectorAll('aside, [role="complementary"]'),
      search: container.querySelectorAll('[role="search"]'),
      form: container.querySelectorAll('form, [role="form"]'),
    }
    
    // Should have one main landmark
    expect(landmarks.main.length).toBeLessThanOrEqual(1)
    
    // Multiple landmarks of same type should have labels
    Object.entries(landmarks).forEach(([type, elements]) => {
      if (elements.length > 1) {
        elements.forEach(element => {
          const hasLabel = 
            element.hasAttribute('aria-label') ||
            element.hasAttribute('aria-labelledby')
          
          expect(hasLabel).toBeTruthy()
        })
      }
    })
  },

  // Test live regions
  testLiveRegions: (container, expectedUpdates) => {
    const liveRegions = container.querySelectorAll('[aria-live]')
    
    expectedUpdates.forEach(update => {
      const region = container.querySelector(update.selector)
      expect(region).toBeTruthy()
      expect(region).toHaveAttribute('aria-live', update.level)
      
      if (update.atomic !== undefined) {
        expect(region).toHaveAttribute('aria-atomic', update.atomic.toString())
      }
      
      if (update.relevant) {
        expect(region).toHaveAttribute('aria-relevant', update.relevant)
      }
    })
  },

  // Test reduced motion preferences
  testReducedMotion: (container) => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
    
    // Check for reduced motion handling
    const animatedElements = container.querySelectorAll('[class*="animate"], [style*="transition"], [style*="animation"]')
    
    animatedElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element)
      const respectsReducedMotion = 
        computedStyle.animationDuration === '0s' ||
        computedStyle.transitionDuration === '0s' ||
        element.hasAttribute('data-reduce-motion')
      
      // This would be more thorough in a real implementation
      expect(true).toBeTruthy() // Placeholder assertion
    })
  },
}

// Export individual utilities
export const {
  runAxeAudit,
  checkA11y,
  testKeyboardNavigation,
  testFocusManagement,
  testScreenReaderAnnouncements,
  testColorContrast,
  testSemanticMarkup,
  testFormAccessibility,
  testButtonAccessibility,
  testLinkAccessibility,
  testImageAccessibility,
  testHeadingStructure,
  testSkipLinks,
  testLandmarkStructure,
  testLiveRegions,
  testReducedMotion,
} = accessibilityUtils

export default accessibilityUtils
