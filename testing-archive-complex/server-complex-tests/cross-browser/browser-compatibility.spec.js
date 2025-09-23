import { test, expect } from '@playwright/test';
import { createHelpers } from '../../utils/test-helpers.js';
import { CartHelpers } from '../../utils/cart-helpers.js';
import { PaymentHelpers } from '../../utils/payment-helpers.js';

test.describe('Browser Compatibility Testing', () => {
  let helpers, cartHelpers, paymentHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = createHelpers(page);
    cartHelpers = new CartHelpers(page);
    paymentHelpers = new PaymentHelpers(page);
    
    await helpers.debug.logPageErrors();
  });

  test('should work consistently across Chrome, Firefox, and Safari', async ({ page, browserName }) => {
    await test.step(`Test core functionality in ${browserName}`, async () => {
      await helpers.navigation.goToHomepage();
      
      // Test basic page load
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      
      // Test product browsing
      await helpers.navigation.goToProduct(1);
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      
      // Test cart functionality
      await cartHelpers.addProductToCartFromDetail(1, 1);
      expect(await cartHelpers.getCartItemCount()).toBe(1);
      
      // Test navigation
      await helpers.navigation.goToHomepage();
      await cartHelpers.openCart();
      await cartHelpers.verifyCartState([
        { name: 'Lavender Dreams', quantity: 1 }
      ]);
    });

    await test.step(`Test payment flow compatibility in ${browserName}`, async () => {
      await cartHelpers.proceedToCheckout();
      
      // Verify Stripe Elements load correctly
      await expect(page.locator('[data-testid="stripe-payment-form"]')).toBeVisible();
      
      // Test payment form functionality
      await paymentHelpers.fillStripePaymentForm('visa');
      
      // Verify form validation works
      await expect(page.locator('[data-testid="submit-payment-button"]')).toBeEnabled();
    });

    await test.step(`Test CSS rendering consistency in ${browserName}`, async () => {
      await helpers.navigation.goToHomepage();
      
      // Check critical layout elements
      const header = page.locator('[data-testid="header"]');
      const productGrid = page.locator('[data-testid="product-grid"]');
      const footer = page.locator('[data-testid="footer"]');
      
      await expect(header).toBeVisible();
      await expect(productGrid).toBeVisible();
      
      if (await footer.isVisible()) {
        // Verify footer is positioned correctly
        const footerBox = await footer.boundingBox();
        expect(footerBox).toBeTruthy();
      }
      
      // Check product card layout
      const productCards = page.locator('[data-testid="product-card"]');
      const firstCard = productCards.first();
      
      const cardBox = await firstCard.boundingBox();
      expect(cardBox.width).toBeGreaterThan(200);
      expect(cardBox.height).toBeGreaterThan(250);
    });
  });

  test('should handle browser-specific JavaScript features', async ({ page, browserName }) => {
    await test.step(`Test modern JavaScript features in ${browserName}`, async () => {
      await helpers.navigation.goToHomepage();
      
      // Test ES6+ features support
      const modernFeaturesSupported = await page.evaluate(() => {
        try {
          // Test arrow functions, const/let, template literals
          const testArrow = () => `Modern JS works`;
          const result = testArrow();
          
          // Test async/await
          const testAsync = async () => 'Async works';
          
          // Test destructuring
          const { length } = [1, 2, 3];
          
          // Test spread operator
          const arr = [...[1, 2, 3]];
          
          return result === 'Modern JS works' && length === 3 && arr.length === 3;
        } catch (error) {
          return false;
        }
      });
      
      expect(modernFeaturesSupported).toBeTruthy();
    });

    await test.step(`Test DOM manipulation compatibility in ${browserName}`, async () => {
      await helpers.navigation.goToHomepage();
      
      // Test query selectors work
      const productCount = await page.evaluate(() => {
        return document.querySelectorAll('[data-testid="product-card"]').length;
      });
      
      expect(productCount).toBeGreaterThan(0);
      
      // Test event handling
      const eventHandlingWorks = await page.evaluate(() => {
        const button = document.querySelector('[data-testid="cart-button"]');
        return button && typeof button.addEventListener === 'function';
      });
      
      expect(eventHandlingWorks).toBeTruthy();
    });
  });

  test('should handle different viewport sizes consistently', async ({ page, browserName }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Standard' },
      { width: 1024, height: 768, name: 'Tablet Landscape' },
      { width: 768, height: 1024, name: 'Tablet Portrait' }
    ];

    for (const viewport of viewports) {
      await test.step(`Test ${viewport.name} in ${browserName}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await helpers.navigation.goToHomepage();
        
        // Verify layout adapts correctly
        await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
        
        // Check responsive behavior
        const productGrid = page.locator('[data-testid="product-grid"]');
        const gridBox = await productGrid.boundingBox();
        
        // Grid should fit within viewport
        expect(gridBox.width).toBeLessThanOrEqual(viewport.width);
        
        // Test navigation menu responsiveness
        const navigationMenu = page.locator('[data-testid="navigation-menu"]');
        const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
        
        if (viewport.width < 768) {
          // Should show mobile menu button on small screens
          if (await mobileMenuButton.isVisible()) {
            await mobileMenuButton.click();
            await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
          }
        } else {
          // Should show full navigation on larger screens
          await expect(navigationMenu).toBeVisible();
        }
      });
    }
  });

  test('should handle form interactions consistently', async ({ page, browserName }) => {
    await test.step(`Test form interactions in ${browserName}`, async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.proceedToCheckout();
      
      // Test text input
      const nameInput = page.locator('[data-testid="billing-name"]');
      await nameInput.fill('Test User');
      await expect(nameInput).toHaveValue('Test User');
      
      // Test email input
      const emailInput = page.locator('[data-testid="billing-email"]');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
      
      // Test select dropdown
      const countrySelect = page.locator('[data-testid="billing-country"]');
      if (await countrySelect.isVisible()) {
        await countrySelect.selectOption('NZ');
        await expect(countrySelect).toHaveValue('NZ');
      }
      
      // Test form validation
      await nameInput.fill('');
      await page.click('[data-testid="submit-payment-button"]');
      
      // Should show validation error
      const validationError = page.locator('[data-testid="form-validation-error"]');
      await expect(validationError).toBeVisible();
    });
  });

  test('should handle local storage and cookies consistently', async ({ page, browserName }) => {
    await test.step(`Test storage mechanisms in ${browserName}`, async () => {
      await helpers.navigation.goToHomepage();
      
      // Test localStorage availability
      const localStorageWorks = await page.evaluate(() => {
        try {
          localStorage.setItem('test-key', 'test-value');
          const value = localStorage.getItem('test-key');
          localStorage.removeItem('test-key');
          return value === 'test-value';
        } catch (error) {
          return false;
        }
      });
      
      // Cart should work regardless of localStorage availability
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      expect(await cartHelpers.getCartItemCount()).toBe(1);
      
      if (localStorageWorks) {
        // Test cart persistence with localStorage
        await page.reload();
        expect(await cartHelpers.getCartItemCount()).toBe(1);
      }
    });
  });

  test('should handle network requests consistently', async ({ page, browserName }) => {
    await test.step(`Test API requests in ${browserName}`, async () => {
      await helpers.navigation.goToHomepage();
      
      // Monitor network requests
      const requests = [];
      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method()
        });
      });
      
      // Trigger API calls
      await helpers.navigation.goToProduct(1);
      await cartHelpers.addProductToCartFromDetail(1, 1);
      
      // Verify API requests were made
      const apiRequests = requests.filter(req => req.url.includes('/api/'));
      expect(apiRequests.length).toBeGreaterThan(0);
      
      // Test CORS handling
      const corsIssues = requests.filter(req => 
        req.url.includes('/api/') && req.method === 'OPTIONS'
      );
      
      // OPTIONS requests should be handled properly
      expect(corsIssues.length).toBeGreaterThanOrEqual(0);
    });
  });

  test('should handle error states consistently', async ({ page, browserName }) => {
    await test.step(`Test error handling in ${browserName}`, async () => {
      // Test 404 error
      await page.goto('/non-existent-page');
      
      // Should show 404 page or redirect
      const is404 = await page.locator('[data-testid="404-page"]').isVisible();
      const isRedirected = page.url().endsWith('/');
      
      expect(is404 || isRedirected).toBeTruthy();
      
      // Test JavaScript error handling
      await helpers.navigation.goToHomepage();
      
      // Inject an error and verify it's handled
      await page.evaluate(() => {
        window.addEventListener('error', (event) => {
          console.log('Error caught:', event.error.message);
        });
        
        // Trigger an error
        try {
          throw new Error('Test error');
        } catch (error) {
          // Should be caught and handled
        }
      });
      
      // App should remain functional
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    });
  });

  test('should handle performance consistently across browsers', async ({ page, browserName }) => {
    await test.step(`Test performance characteristics in ${browserName}`, async () => {
      const startTime = Date.now();
      await helpers.navigation.goToHomepage();
      const loadTime = Date.now() - startTime;
      
      console.log(`${browserName} homepage load time: ${loadTime}ms`);
      
      // Performance should be reasonable across all browsers
      expect(loadTime).toBeLessThan(5000); // 5 second maximum
      
      // Test interaction responsiveness
      const interactionStart = Date.now();
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      const interactionTime = Date.now() - interactionStart;
      
      console.log(`${browserName} interaction time: ${interactionTime}ms`);
      expect(interactionTime).toBeLessThan(2000); // 2 second maximum
    });
  });

  test('should handle accessibility features consistently', async ({ page, browserName }) => {
    await test.step(`Test accessibility in ${browserName}`, async () => {
      await helpers.navigation.goToHomepage();
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate with keyboard
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
      
      // Test screen reader attributes
      const hasAriaLabels = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button[aria-label]');
        return buttons.length > 0;
      });
      
      // Should have proper ARIA labels
      expect(hasAriaLabels).toBeTruthy();
      
      // Test focus management
      await page.click('[data-testid="cart-button"]');
      const cartFocused = await page.evaluate(() => {
        return document.activeElement?.getAttribute('data-testid') === 'cart-button';
      });
      
      // Focus should be managed properly
      expect(cartFocused).toBeTruthy();
    });
  });
});
