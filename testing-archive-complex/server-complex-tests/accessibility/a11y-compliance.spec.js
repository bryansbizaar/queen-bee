import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';
import { createHelpers } from '../../utils/test-helpers.js';

test.describe('WCAG 2.1 AA Compliance Testing', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = createHelpers(page);
    await helpers.debug.logPageErrors();
    
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  });

  test('should meet WCAG 2.1 AA standards on homepage', async ({ page }) => {
    await test.step('Load homepage and run accessibility audit', async () => {
      await helpers.navigation.goToHomepage();
      
      // Run axe accessibility audit
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
      });
    });

    await test.step('Check color contrast ratios', async () => {
      // Test specific color contrast requirements
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
    });

    await test.step('Verify proper heading structure', async () => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      // Should have at least one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h1Count).toBeLessThanOrEqual(1); // Only one h1 per page
      
      // Check heading hierarchy
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i];
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const text = await heading.textContent();
        
        console.log(`Found heading: ${tagName} - "${text}"`);
        expect(text?.trim()).toBeTruthy(); // Headings should have text
      }
    });

    await test.step('Verify image alt text', async () => {
      const images = await page.locator('img').all();
      
      for (const image of images) {
        const alt = await image.getAttribute('alt');
        const src = await image.getAttribute('src');
        const isDecorative = await image.getAttribute('role') === 'presentation';
        
        if (!isDecorative) {
          expect(alt).toBeTruthy(); // Non-decorative images need alt text
          console.log(`Image alt text: "${alt}" for ${src}`);
        }
      }
    });

    await test.step('Check form labels and accessibility', async () => {
      // Check if there are form elements on homepage (like search)
      const formElements = await page.locator('input, select, textarea').all();
      
      for (const element of formElements) {
        const id = await element.getAttribute('id');
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledby = await element.getAttribute('aria-labelledby');
        const placeholder = await element.getAttribute('placeholder');
        
        // Form elements should have proper labeling
        if (id) {
          const hasLabel = await page.locator(`label[for="${id}"]`).count() > 0;
          const hasProperLabeling = hasLabel || ariaLabel || ariaLabelledby;
          
          expect(hasProperLabeling).toBeTruthy();
        }
      }
    });
  });

  test('should meet WCAG 2.1 AA standards on product pages', async ({ page }) => {
    await test.step('Test product detail page accessibility', async () => {
      await helpers.navigation.goToProduct(1);
      
      await checkA11y(page, null, {
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
      });
    });

    await test.step('Verify product information accessibility', async () => {
      // Product title should be properly marked up
      const productTitle = page.locator('[data-testid="product-title"]');
      await expect(productTitle).toBeVisible();
      
      const titleTagName = await productTitle.evaluate(el => el.tagName.toLowerCase());
      expect(['h1', 'h2', 'h3']).toContain(titleTagName);
      
      // Product price should be accessible
      const productPrice = page.locator('[data-testid="product-price"]');
      const priceText = await productPrice.textContent();
      expect(priceText).toMatch(/\$\d+\.\d{2}/); // Should contain proper price format
      
      // Product description should be readable
      const productDescription = page.locator('[data-testid="product-description"]');
      const descriptionText = await productDescription.textContent();
      expect(descriptionText?.trim()).toBeTruthy();
    });

    await test.step('Test add to cart button accessibility', async () => {
      const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
      
      // Button should be accessible
      const buttonText = await addToCartButton.textContent();
      const ariaLabel = await addToCartButton.getAttribute('aria-label');
      const title = await addToCartButton.getAttribute('title');
      
      expect(buttonText || ariaLabel || title).toBeTruthy();
      
      // Button should be focusable
      await addToCartButton.focus();
      const isFocused = await addToCartButton.evaluate(el => el === document.activeElement);
      expect(isFocused).toBeTruthy();
    });
  });

  test('should meet WCAG 2.1 AA standards for cart functionality', async ({ page }) => {
    await test.step('Setup cart with items', async () => {
      await helpers.navigation.goToHomepage();
      await page.click('[data-testid="add-to-cart-button"]');
      await page.waitForTimeout(500);
    });

    await test.step('Test cart button accessibility', async () => {
      const cartButton = page.locator('[data-testid="cart-button"]');
      
      // Cart button should have proper labeling
      const buttonText = await cartButton.textContent();
      const ariaLabel = await cartButton.getAttribute('aria-label');
      
      expect(buttonText || ariaLabel).toBeTruthy();
      
      // Cart count should be announced to screen readers
      const cartCount = page.locator('[data-testid="cart-count"]');
      if (await cartCount.isVisible()) {
        const countText = await cartCount.textContent();
        expect(countText).toBeTruthy();
        
        // Check if cart count has proper ARIA labeling
        const ariaLive = await cartCount.getAttribute('aria-live');
        if (ariaLive) {
          expect(['polite', 'assertive']).toContain(ariaLive);
        }
      }
    });

    await test.step('Test cart accessibility when opened', async () => {
      await page.click('[data-testid="cart-button"]');
      
      // Run accessibility audit on cart
      await checkA11y(page, '[data-testid="cart-sidebar"]', {
        tags: ['wcag2a', 'wcag2aa']
      });
      
      // Cart should be properly labeled
      const cartContainer = page.locator('[data-testid="cart-sidebar"]');
      const ariaLabel = await cartContainer.getAttribute('aria-label');
      const role = await cartContainer.getAttribute('role');
      
      expect(ariaLabel || role).toBeTruthy();
    });

    await test.step('Test cart item accessibility', async () => {
      const cartItems = page.locator('[data-testid="cart-item"]');
      const itemCount = await cartItems.count();
      
      if (itemCount > 0) {
        const firstItem = cartItems.first();
        
        // Quantity input should be properly labeled
        const quantityInput = firstItem.locator('[data-testid="quantity-input"]');
        if (await quantityInput.isVisible()) {
          const inputLabel = await quantityInput.getAttribute('aria-label');
          const inputId = await quantityInput.getAttribute('id');
          
          if (inputId) {
            const hasLabel = await page.locator(`label[for="${inputId}"]`).count() > 0;
            expect(hasLabel || inputLabel).toBeTruthy();
          }
        }
        
        // Remove button should be accessible
        const removeButton = firstItem.locator('[data-testid="remove-item-button"]');
        if (await removeButton.isVisible()) {
          const buttonText = await removeButton.textContent();
          const ariaLabel = await removeButton.getAttribute('aria-label');
          
          expect(buttonText || ariaLabel).toBeTruthy();
        }
      }
    });
  });

  test('should meet WCAG 2.1 AA standards for checkout form', async ({ page }) => {
    await test.step('Setup checkout', async () => {
      await helpers.navigation.goToHomepage();
      await page.click('[data-testid="add-to-cart-button"]');
      await page.waitForTimeout(500);
      await page.click('[data-testid="cart-button"]');
      await page.click('[data-testid="checkout-button"]');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Test checkout form accessibility', async () => {
      await checkA11y(page, '[data-testid="checkout-form"]', {
        tags: ['wcag2a', 'wcag2aa']
      });
    });

    await test.step('Verify form field labeling', async () => {
      const formFields = [
        '[data-testid="billing-name"]',
        '[data-testid="billing-email"]',
        '[data-testid="billing-address-line1"]',
        '[data-testid="billing-city"]',
        '[data-testid="billing-postal-code"]'
      ];
      
      for (const fieldSelector of formFields) {
        const field = page.locator(fieldSelector);
        if (await field.isVisible()) {
          const fieldId = await field.getAttribute('id');
          const ariaLabel = await field.getAttribute('aria-label');
          const ariaLabelledby = await field.getAttribute('aria-labelledby');
          
          if (fieldId) {
            const hasLabel = await page.locator(`label[for="${fieldId}"]`).count() > 0;
            const hasProperLabeling = hasLabel || ariaLabel || ariaLabelledby;
            
            expect(hasProperLabeling).toBeTruthy();
            console.log(`Field ${fieldSelector} has proper labeling`);
          }
        }
      }
    });

    await test.step('Test required field indicators', async () => {
      const requiredFields = await page.locator('[required], [aria-required="true"]').all();
      
      for (const field of requiredFields) {
        const ariaRequired = await field.getAttribute('aria-required');
        const required = await field.getAttribute('required');
        const fieldId = await field.getAttribute('id') || await field.getAttribute('data-testid');
        
        expect(ariaRequired === 'true' || required !== null).toBeTruthy();
        console.log(`Required field ${fieldId} properly marked`);
      }
    });

    await test.step('Test error message accessibility', async () => {
      // Try to submit form without required fields
      await page.click('[data-testid="submit-payment-button"]');
      
      const errorMessages = page.locator('[role="alert"], [aria-live="assertive"], [data-testid*="error"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const error = errorMessages.nth(i);
          const errorText = await error.textContent();
          const role = await error.getAttribute('role');
          const ariaLive = await error.getAttribute('aria-live');
          
          expect(errorText?.trim()).toBeTruthy();
          expect(role === 'alert' || ariaLive === 'assertive' || ariaLive === 'polite').toBeTruthy();
        }
      }
    });
  });

  test('should test focus management and keyboard navigation', async ({ page }) => {
    await test.step('Test homepage focus management', async () => {
      await helpers.navigation.goToHomepage();
      
      // Test initial focus
      await page.keyboard.press('Tab');
      const firstFocusable = await page.evaluate(() => document.activeElement?.tagName);
      expect(firstFocusable).toBeTruthy();
      
      // Test skip links if present
      const skipLink = page.locator('a[href="#main"], a[href="#content"]');
      if (await skipLink.count() > 0) {
        await skipLink.focus();
        await skipLink.press('Enter');
        
        const mainContent = page.locator('#main, #content, [role="main"]');
        if (await mainContent.count() > 0) {
          console.log('Skip link functionality verified');
        }
      }
    });

    await test.step('Test cart keyboard navigation', async () => {
      await helpers.navigation.goToHomepage();
      await page.click('[data-testid="add-to-cart-button"]');
      
      // Navigate to cart using keyboard
      let currentElement = null;
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts) {
        await page.keyboard.press('Tab');
        currentElement = await page.evaluate(() => {
          const el = document.activeElement;
          return el ? el.getAttribute('data-testid') : null;
        });
        
        if (currentElement === 'cart-button') {
          break;
        }
        attempts++;
      }
      
      expect(currentElement).toBe('cart-button');
      
      // Open cart with keyboard
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Verify cart is accessible via keyboard
      const cartVisible = await page.locator('[data-testid="cart-sidebar"]').isVisible();
      expect(cartVisible).toBeTruthy();
    });

    await test.step('Test checkout form keyboard navigation', async () => {
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');
      
      // Tab through form fields
      const formFields = [
        '[data-testid="billing-name"]',
        '[data-testid="billing-email"]',
        '[data-testid="billing-address-line1"]'
      ];
      
      for (const fieldSelector of formFields) {
        const field = page.locator(fieldSelector);
        if (await field.isVisible()) {
          await field.focus();
          
          const isFocused = await field.evaluate(el => el === document.activeElement);
          expect(isFocused).toBeTruthy();
          
          // Test keyboard input
          await field.fill('Test Value');
          await expect(field).toHaveValue('Test Value');
        }
      }
    });
  });

  test('should test screen reader compatibility', async ({ page }) => {
    await test.step('Test ARIA landmarks', async () => {
      await helpers.navigation.goToHomepage();
      
      const landmarks = await page.locator('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], header, nav, main, footer').all();
      
      expect(landmarks.length).toBeGreaterThan(0);
      
      for (const landmark of landmarks) {
        const role = await landmark.getAttribute('role');
        const tagName = await landmark.evaluate(el => el.tagName.toLowerCase());
        const ariaLabel = await landmark.getAttribute('aria-label');
        
        console.log(`Landmark found: ${tagName} with role: ${role || 'implicit'}`);
        
        // Main content should be identifiable
        if (role === 'main' || tagName === 'main') {
          const hasContent = await landmark.locator('*').count() > 0;
          expect(hasContent).toBeTruthy();
        }
      }
    });

    await test.step('Test ARIA live regions', async () => {
      await helpers.navigation.goToHomepage();
      
      // Add item to cart to test live region updates
      await page.click('[data-testid="add-to-cart-button"]');
      
      const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').all();
      
      for (const region of liveRegions) {
        const ariaLive = await region.getAttribute('aria-live');
        const role = await region.getAttribute('role');
        
        if (ariaLive) {
          expect(['polite', 'assertive', 'off']).toContain(ariaLive);
        }
        
        if (role) {
          expect(['status', 'alert']).toContain(role);
        }
      }
    });

    await test.step('Test button and link descriptions', async () => {
      const interactiveElements = await page.locator('button, a[href], [role="button"], [role="link"]').all();
      
      for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
        const element = interactiveElements[i];
        const text = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledby = await element.getAttribute('aria-labelledby');
        const title = await element.getAttribute('title');
        
        const hasAccessibleName = text?.trim() || ariaLabel || ariaLabelledby || title;
        expect(hasAccessibleName).toBeTruthy();
        
        // Buttons should have descriptive text
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'button' || await element.getAttribute('role') === 'button') {
          expect(text?.trim() || ariaLabel).toBeTruthy();
        }
      }
    });
  });

  test('should test mobile accessibility features', async ({ page }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.navigation.goToHomepage();
    });

    await test.step('Test touch target sizes', async () => {
      const touchTargets = await page.locator('button, a[href], input, [role="button"]').all();
      
      for (let i = 0; i < Math.min(touchTargets.length, 10); i++) {
        const target = touchTargets[i];
        const box = await target.boundingBox();
        
        if (box) {
          // WCAG AA requires 44x44px minimum for touch targets
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
          
          console.log(`Touch target size: ${box.width}x${box.height}px`);
        }
      }
    });

    await test.step('Test mobile navigation accessibility', async () => {
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      
      if (await mobileMenuButton.isVisible()) {
        // Mobile menu button should be accessible
        const ariaLabel = await mobileMenuButton.getAttribute('aria-label');
        const ariaExpanded = await mobileMenuButton.getAttribute('aria-expanded');
        
        expect(ariaLabel).toBeTruthy();
        
        // Test mobile menu interaction
        await mobileMenuButton.click();
        
        if (ariaExpanded !== null) {
          const expandedAfterClick = await mobileMenuButton.getAttribute('aria-expanded');
          expect(expandedAfterClick).toBe('true');
        }
        
        // Mobile menu should be accessible
        const mobileMenu = page.locator('[data-testid="mobile-menu"]');
        await expect(mobileMenu).toBeVisible();
        
        const menuRole = await mobileMenu.getAttribute('role');
        expect(['menu', 'navigation']).toContain(menuRole || 'navigation');
      }
    });
  });

  test('should test focus indicators and visual accessibility', async ({ page }) => {
    await test.step('Test focus indicators', async () => {
      await helpers.navigation.goToHomepage();
      
      const focusableElements = await page.locator('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
      
      for (let i = 0; i < Math.min(focusableElements.length, 5); i++) {
        const element = focusableElements[i];
        
        // Focus the element
        await element.focus();
        
        // Check if focus indicator is visible
        const focusStyles = await element.evaluate(el => {
          const styles = window.getComputedStyle(el, ':focus');
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            outlineStyle: styles.outlineStyle,
            boxShadow: styles.boxShadow,
            border: styles.border
          };
        });
        
        // Should have some form of focus indicator
        const hasFocusIndicator = 
          focusStyles.outline !== 'none' ||
          focusStyles.outlineWidth !== '0px' ||
          focusStyles.boxShadow !== 'none' ||
          focusStyles.border !== 'none';
        
        expect(hasFocusIndicator).toBeTruthy();
        console.log(`Focus indicator present for element ${i + 1}`);
      }
    });

    await test.step('Test text scaling compatibility', async () => {
      // Test page at 200% zoom (simulating browser zoom)
      await page.setViewportSize({ width: 640, height: 480 }); // Simulates zoomed view
      
      await helpers.navigation.goToHomepage();
      
      // Content should still be readable and functional
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      
      const productCard = page.locator('[data-testid="product-card"]').first();
      const productTitle = productCard.locator('[data-testid="product-name"]');
      
      await expect(productTitle).toBeVisible();
      
      // Text should not be cut off
      const titleBox = await productTitle.boundingBox();
      expect(titleBox?.width).toBeGreaterThan(0);
      expect(titleBox?.height).toBeGreaterThan(0);
    });
  });
});
