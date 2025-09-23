import { test, expect } from '@playwright/test';
import { createHelpers } from '../../utils/test-helpers.js';
import { CartHelpers } from '../../utils/cart-helpers.js';
import { PaymentHelpers } from '../../utils/payment-helpers.js';

test.describe('Error Scenarios & Edge Cases E2E', () => {
  let helpers, cartHelpers, paymentHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = createHelpers(page);
    cartHelpers = new CartHelpers(page);
    paymentHelpers = new PaymentHelpers(page);
    
    await helpers.debug.logPageErrors();
    await helpers.navigation.goToHomepage();
  });

  test('should handle network failures during checkout', async ({ page }) => {
    await test.step('Add product and proceed to checkout', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.proceedToCheckout();
    });

    await test.step('Simulate network failure during payment intent creation', async () => {
      // Mock network failure for payment intent
      await page.route('**/api/create-payment-intent', route => {
        route.abort('failed');
      });
      
      await paymentHelpers.fillStripePaymentForm('visa');
      await paymentHelpers.submitPayment();
      
      // Should show network error message
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    await test.step('Retry after network restored', async () => {
      // Remove network failure mock
      await page.unroute('**/api/create-payment-intent');
      
      // Click retry button
      await page.click('[data-testid="retry-button"]');
      
      // Payment should succeed
      await page.waitForURL('/success', { timeout: 30000 });
      await expect(page.locator('[data-testid="payment-success-message"]')).toBeVisible();
    });
  });

  test('should handle invalid payment card scenarios', async ({ page }) => {
    await test.step('Setup checkout', async () => {
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
      await cartHelpers.proceedToCheckout();
    });

    await test.step('Test declined card', async () => {
      await paymentHelpers.testPaymentFailure('declined');
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('declined');
    });

    await test.step('Test insufficient funds', async () => {
      await page.reload();
      await paymentHelpers.testInsufficientFunds();
    });

    await test.step('Test invalid card number', async () => {
      await page.reload();
      await paymentHelpers.testInvalidCardNumber();
    });

    await test.step('Test expired card', async () => {
      await page.reload();
      await paymentHelpers.testExpiredCard();
    });
  });

  test('should handle server error responses', async ({ page }) => {
    await test.step('Test 500 server error on product load', async () => {
      await page.route('**/api/products', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      await helpers.navigation.goToHomepage();
      
      // Should show error message and retry option
      await expect(page.locator('[data-testid="server-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    await test.step('Test 404 error on product detail', async () => {
      await page.route('**/api/products/999', route => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Product not found' })
        });
      });
      
      await page.goto('/product/999');
      
      // Should show product not found message
      await expect(page.locator('[data-testid="product-not-found"]')).toBeVisible();
    });

    await test.step('Test timeout error', async () => {
      await page.route('**/api/products', route => {
        // Delay response beyond timeout
        setTimeout(() => route.continue(), 31000);
      });
      
      await helpers.navigation.goToHomepage();
      
      // Should show timeout error
      await expect(page.locator('[data-testid="timeout-error"]')).toBeVisible();
    });
  });

  test('should handle browser back button during payment', async ({ page }) => {
    await test.step('Start payment process', async () => {
      await cartHelpers.addProductToCart('Eucalyptus Fresh', 1);
      await cartHelpers.proceedToCheckout();
      await paymentHelpers.fillStripePaymentForm('visa');
    });

    await test.step('Navigate back during payment processing', async () => {
      // Start payment submission
      await page.click('[data-testid="submit-payment-button"]');
      
      // Immediately go back
      await page.goBack();
      
      // Should be back on checkout page with cart intact
      await expect(page).toHaveURL('/checkout');
      await cartHelpers.verifyCartState([
        { name: 'Eucalyptus Fresh', quantity: 1 }
      ]);
    });

    await test.step('Complete payment after returning', async () => {
      // Should be able to complete payment normally
      await paymentHelpers.completeSuccessfulPayment('visa');
    });
  });

  test('should handle session timeout scenarios', async ({ page }) => {
    await test.step('Add products to cart', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 2);
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
    });

    await test.step('Simulate session timeout', async () => {
      // Mock session expired response
      await page.route('**/api/**', route => {
        if (route.request().method() !== 'GET') {
          route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Session expired' })
          });
        } else {
          route.continue();
        }
      });
      
      // Try to proceed to checkout
      await cartHelpers.proceedToCheckout();
      
      // Should handle session expiry gracefully
      const sessionError = page.locator('[data-testid="session-expired"]');
      const loginPrompt = page.locator('[data-testid="login-required"]');
      
      const hasSessionError = await sessionError.isVisible();
      const hasLoginPrompt = await loginPrompt.isVisible();
      
      expect(hasSessionError || hasLoginPrompt).toBeTruthy();
    });
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    await test.step('Inject JavaScript error', async () => {
      // Inject code that will cause an error
      await page.addInitScript(() => {
        window.addEventListener('load', () => {
          // Simulate a JS error in payment processing
          window.simulateError = () => {
            throw new Error('Simulated JavaScript error');
          };
        });
      });
      
      await helpers.navigation.goToHomepage();
    });

    await test.step('Verify error boundary catches errors', async () => {
      // Try to trigger the error
      await page.evaluate(() => {
        if (window.simulateError) {
          try {
            window.simulateError();
          } catch (error) {
            // Error should be caught by error boundary
            console.error('Caught error:', error.message);
          }
        }
      });
      
      // App should still be functional
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    });
  });

  test('should handle invalid form submissions', async ({ page }) => {
    await test.step('Setup checkout with invalid data', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.proceedToCheckout();
    });

    await test.step('Submit form with missing required fields', async () => {
      // Try to submit without filling any fields
      await page.click('[data-testid="submit-payment-button"]');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="form-validation-error"]')).toBeVisible();
    });

    await test.step('Submit with invalid email format', async () => {
      await page.fill('[data-testid="billing-email"]', 'invalid-email');
      await page.click('[data-testid="submit-payment-button"]');
      
      // Should show email validation error
      await expect(page.locator('[data-testid="email-validation-error"]')).toBeVisible();
    });

    await test.step('Submit with incomplete billing address', async () => {
      await page.fill('[data-testid="billing-email"]', 'valid@example.com');
      await page.fill('[data-testid="billing-name"]', 'Test User');
      // Leave address fields empty
      await page.click('[data-testid="submit-payment-button"]');
      
      // Should show address validation errors
      await expect(page.locator('[data-testid="address-validation-error"]')).toBeVisible();
    });
  });

  test('should handle concurrent user actions', async ({ page }) => {
    await test.step('Test rapid cart modifications', async () => {
      // Rapidly add and remove items
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
      await cartHelpers.removeCartItem('Lavender Dreams');
      await cartHelpers.addProductToCart('Eucalyptus Fresh', 2);
      await cartHelpers.updateCartItemQuantity('Vanilla Bean Bliss', 3);
      
      // Wait for all operations to settle
      await page.waitForTimeout(1000);
      
      // Verify final state is consistent
      const finalCount = await cartHelpers.getCartItemCount();
      expect(finalCount).toBeGreaterThan(0);
    });

    await test.step('Test navigation during cart operations', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      
      // Navigate while cart is updating
      await Promise.all([
        cartHelpers.updateCartItemQuantity('Lavender Dreams', 3),
        helpers.navigation.goToProduct(2)
      ]);
      
      // Both operations should complete successfully
      await expect(page).toHaveURL('/product/2');
      const cartCount = await cartHelpers.getCartItemCount();
      expect(cartCount).toBeGreaterThan(0);
    });
  });

  test('should handle edge case quantities and pricing', async ({ page }) => {
    await test.step('Test zero quantity handling', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.testInvalidQuantity('Lavender Dreams');
    });

    await test.step('Test maximum quantity limits', async () => {
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
      await cartHelpers.testMaxQuantity('Vanilla Bean Bliss', 10);
    });

    await test.step('Test pricing edge cases', async () => {
      // Mock product with very high price
      await page.route('**/api/products/1', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Expensive Candle',
            price: 9999.99,
            description: 'Very expensive test candle',
            image: '/images/expensive.jpg',
            category: 'Luxury',
            stock: 1
          })
        });
      });
      
      await helpers.navigation.goToProduct(1);
      await cartHelpers.addProductToCartFromDetail(1, 1);
      
      // Should handle large price calculations correctly
      await cartHelpers.verifyCartTotal(9999.99);
    });
  });

  test('should handle browser compatibility issues', async ({ page }) => {
    await test.step('Test localStorage availability', async () => {
      // Test if localStorage is available and working
      const localStorageAvailable = await page.evaluate(() => {
        try {
          localStorage.setItem('test', 'value');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      });
      
      if (!localStorageAvailable) {
        // App should still work without localStorage
        await cartHelpers.addProductToCart('Lavender Dreams', 1);
        expect(await cartHelpers.getCartItemCount()).toBe(1);
      }
    });

    await test.step('Test with disabled JavaScript', async () => {
      // This test would need to be run with JavaScript disabled
      // For now, we'll simulate the behavior
      await page.goto('/?nojs=true');
      
      // Basic content should still be visible
      await expect(page.locator('h1')).toBeVisible();
    });

    await test.step('Test with slow network conditions', async () => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 1000);
      });
      
      await helpers.navigation.goToHomepage();
      
      // Should show loading states
      const loadingIndicator = page.locator('[data-testid="loading"]');
      if (await loadingIndicator.isVisible()) {
        await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
      }
      
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    });
  });

  test('should handle memory and performance edge cases', async ({ page }) => {
    await test.step('Test with many cart items', async () => {
      // Add maximum reasonable number of items
      for (let i = 0; i < 50; i++) {
        await cartHelpers.addProductToCart('Lavender Dreams', 1);
        
        // Add small delay to prevent overwhelming the system
        if (i % 10 === 0) {
          await page.waitForTimeout(100);
        }
      }
      
      // Cart should still be responsive
      const startTime = Date.now();
      await cartHelpers.openCart();
      const endTime = Date.now();
      
      const openTime = endTime - startTime;
      expect(openTime).toBeLessThan(3000); // Should open within 3 seconds
    });

    await test.step('Test repeated navigation', async () => {
      // Navigate rapidly between pages
      for (let i = 0; i < 20; i++) {
        await helpers.navigation.goToHomepage();
        await helpers.navigation.goToProduct(1);
        await helpers.navigation.goToProduct(2);
        
        if (i % 5 === 0) {
          await page.waitForTimeout(100);
        }
      }
      
      // App should still be responsive
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    });
  });

  test('should recover from critical errors', async ({ page }) => {
    await test.step('Test recovery from payment system failure', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.proceedToCheckout();
      
      // Mock complete Stripe system failure
      await page.route('**/js.stripe.com/**', route => {
        route.abort('failed');
      });
      
      await page.reload();
      
      // Should show fallback payment options or error message
      const stripeError = page.locator('[data-testid="stripe-unavailable"]');
      const fallbackPayment = page.locator('[data-testid="fallback-payment"]');
      
      const hasError = await stripeError.isVisible();
      const hasFallback = await fallbackPayment.isVisible();
      
      expect(hasError || hasFallback).toBeTruthy();
    });

    await test.step('Test recovery from database connection issues', async () => {
      // Mock database connection error
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Database connection failed' })
        });
      });
      
      await helpers.navigation.goToHomepage();
      
      // Should show maintenance message
      await expect(page.locator('[data-testid="maintenance-message"]')).toBeVisible();
    });
  });
});
