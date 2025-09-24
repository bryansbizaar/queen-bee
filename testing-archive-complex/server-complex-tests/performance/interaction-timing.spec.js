import { test, expect } from '@playwright/test';
import { createHelpers } from '../../utils/test-helpers.js';
import { CartHelpers } from '../../utils/cart-helpers.js';
import { PaymentHelpers } from '../../utils/payment-helpers.js';

test.describe('Interaction Performance Testing', () => {
  let helpers, cartHelpers, paymentHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = createHelpers(page);
    cartHelpers = new CartHelpers(page);
    paymentHelpers = new PaymentHelpers(page);
    
    await helpers.debug.logPageErrors();
    await helpers.navigation.goToHomepage();
  });

  test('should respond quickly to add-to-cart interactions', async ({ page }) => {
    await test.step('Measure single add-to-cart response time', async () => {
      const startTime = Date.now();
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      const responseTime = Date.now() - startTime;
      
      console.log(`Add to cart response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(500); // Under 500ms
      
      // Verify cart count updated
      expect(await cartHelpers.getCartItemCount()).toBe(1);
    });

    await test.step('Measure rapid add-to-cart interactions', async () => {
      const products = ['Lavender Dreams', 'Vanilla Bean Bliss', 'Eucalyptus Fresh'];
      const responseTimes = [];
      
      for (const product of products) {
        const startTime = Date.now();
        await cartHelpers.addProductToCart(product, 1);
        const responseTime = Date.now() - startTime;
        
        responseTimes.push(responseTime);
        console.log(`${product} add time: ${responseTime}ms`);
        
        expect(responseTime).toBeLessThan(600); // Should remain responsive
      }
      
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      console.log(`Average add-to-cart response time: ${avgResponseTime}ms`);
      expect(avgResponseTime).toBeLessThan(500);
    });

    await test.step('Measure add-to-cart with quantity changes', async () => {
      const startTime = Date.now();
      await cartHelpers.addProductToCartFromDetail(1, 5);
      const responseTime = Date.now() - startTime;
      
      console.log(`Add to cart with quantity response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(800);
    });
  });

  test('should handle cart updates efficiently', async ({ page }) => {
    await test.step('Setup cart with multiple items', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 2);
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
      await cartHelpers.addProductToCart('Eucalyptus Fresh', 3);
    });

    await test.step('Measure cart opening response time', async () => {
      const startTime = Date.now();
      await cartHelpers.openCart();
      const responseTime = Date.now() - startTime;
      
      console.log(`Cart open response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(300);
    });

    await test.step('Measure quantity update response time', async () => {
      await cartHelpers.openCart();
      
      const startTime = Date.now();
      await cartHelpers.updateCartItemQuantity('Lavender Dreams', 5);
      const responseTime = Date.now() - startTime;
      
      console.log(`Quantity update response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(300);
    });

    await test.step('Measure item removal response time', async () => {
      const startTime = Date.now();
      await cartHelpers.removeCartItem('Vanilla Bean Bliss');
      const responseTime = Date.now() - startTime;
      
      console.log(`Item removal response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(400);
    });

    await test.step('Measure cart total recalculation time', async () => {
      const startTime = Date.now();
      await cartHelpers.updateCartItemQuantity('Eucalyptus Fresh', 10);
      
      // Wait for total to update
      await page.waitForTimeout(100);
      const responseTime = Date.now() - startTime;
      
      console.log(`Cart total recalculation time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(200);
    });
  });

  test('should handle navigation interactions efficiently', async ({ page }) => {
    await test.step('Measure page navigation response time', async () => {
      const navigationTimes = [];
      
      const routes = [
        { from: '/', to: '/product/1', name: 'Home to Product' },
        { from: '/product/1', to: '/product/2', name: 'Product to Product' },
        { from: '/product/2', to: '/', name: 'Product to Home' }
      ];
      
      for (const route of routes) {
        await page.goto(route.from);
        await page.waitForLoadState('networkidle');
        
        const startTime = Date.now();
        await page.goto(route.to);
        await page.waitForLoadState('domcontentloaded');
        const responseTime = Date.now() - startTime;
        
        navigationTimes.push({ ...route, time: responseTime });
        console.log(`${route.name} navigation time: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(1000);
      }
      
      const avgNavigationTime = navigationTimes.reduce((sum, nav) => sum + nav.time, 0) / navigationTimes.length;
      console.log(`Average navigation time: ${avgNavigationTime}ms`);
      expect(avgNavigationTime).toBeLessThan(800);
    });

    await test.step('Measure browser back/forward performance', async () => {
      await helpers.navigation.goToProduct(1);
      await helpers.navigation.goToProduct(2);
      
      const backStartTime = Date.now();
      await page.goBack();
      await page.waitForLoadState('domcontentloaded');
      const backTime = Date.now() - backStartTime;
      
      console.log(`Browser back time: ${backTime}ms`);
      expect(backTime).toBeLessThan(500);
      
      const forwardStartTime = Date.now();
      await page.goForward();
      await page.waitForLoadState('domcontentloaded');
      const forwardTime = Date.now() - forwardStartTime;
      
      console.log(`Browser forward time: ${forwardTime}ms`);
      expect(forwardTime).toBeLessThan(500);
    });
  });

  test('should handle form interactions efficiently', async ({ page }) => {
    await test.step('Setup checkout form', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.proceedToCheckout();
    });

    await test.step('Measure form field focus response time', async () => {
      const formFields = [
        '[data-testid="billing-name"]',
        '[data-testid="billing-email"]',
        '[data-testid="billing-address-line1"]',
        '[data-testid="billing-city"]'
      ];
      
      for (const fieldSelector of formFields) {
        const field = page.locator(fieldSelector);
        if (await field.isVisible()) {
          const startTime = Date.now();
          await field.focus();
          const responseTime = Date.now() - startTime;
          
          console.log(`${fieldSelector} focus time: ${responseTime}ms`);
          expect(responseTime).toBeLessThan(100);
        }
      }
    });

    await test.step('Measure form typing response time', async () => {
      const nameField = page.locator('[data-testid="billing-name"]');
      const testName = 'John Doe';
      
      const startTime = Date.now();
      await nameField.fill(testName);
      const responseTime = Date.now() - startTime;
      
      console.log(`Form typing response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(200);
      
      // Verify value was set correctly
      await expect(nameField).toHaveValue(testName);
    });

    await test.step('Measure form validation response time', async () => {
      // Clear name field to trigger validation
      await page.locator('[data-testid="billing-name"]').fill('');
      
      const startTime = Date.now();
      await page.click('[data-testid="submit-payment-button"]');
      
      // Wait for validation error to appear
      await expect(page.locator('[data-testid="form-validation-error"]')).toBeVisible();
      const responseTime = Date.now() - startTime;
      
      console.log(`Form validation response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(300);
    });
  });

  test('should handle Stripe Elements interactions efficiently', async ({ page }) => {
    await test.step('Setup payment form', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.proceedToCheckout();
      
      // Wait for Stripe Elements to load
      await expect(page.locator('[data-testid="stripe-payment-form"]')).toBeVisible();
    });

    await test.step('Measure Stripe Elements interaction response time', async () => {
      const stripeFrames = page.frameLocator('iframe[name*="__privateStripeFrame"]');
      const cardFrame = stripeFrames.first();
      
      const startTime = Date.now();
      await cardFrame.locator('[name="cardnumber"]').fill('4242424242424242');
      const responseTime = Date.now() - startTime;
      
      console.log(`Stripe card input response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(500);
    });

    await test.step('Measure payment processing initiation time', async () => {
      await paymentHelpers.fillStripePaymentForm('visa');
      
      const startTime = Date.now();
      await page.click('[data-testid="submit-payment-button"]');
      
      // Wait for processing indicator
      await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible();
      const responseTime = Date.now() - startTime;
      
      console.log(`Payment processing initiation time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(1000);
    });
  });

  test('should handle concurrent interactions efficiently', async ({ page }) => {
    await test.step('Test multiple simultaneous cart operations', async () => {
      // Add multiple products concurrently
      const addOperations = [
        () => cartHelpers.addProductToCart('Lavender Dreams', 1),
        () => cartHelpers.addProductToCart('Vanilla Bean Bliss', 1),
        () => cartHelpers.addProductToCart('Eucalyptus Fresh', 1)
      ];
      
      const startTime = Date.now();
      await Promise.all(addOperations.map(op => op()));
      const responseTime = Date.now() - startTime;
      
      console.log(`Concurrent cart operations time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(1500);
      
      // Verify all items were added
      expect(await cartHelpers.getCartItemCount()).toBe(3);
    });

    await test.step('Test rapid sequential interactions', async () => {
      await cartHelpers.openCart();
      
      const operations = [
        () => cartHelpers.updateCartItemQuantity('Lavender Dreams', 2),
        () => cartHelpers.updateCartItemQuantity('Vanilla Bean Bliss', 3),
        () => cartHelpers.updateCartItemQuantity('Eucalyptus Fresh', 1),
        () => cartHelpers.removeCartItem('Eucalyptus Fresh')
      ];
      
      const startTime = Date.now();
      for (const operation of operations) {
        await operation();
        await page.waitForTimeout(50); // Small delay between operations
      }
      const totalTime = Date.now() - startTime;
      
      console.log(`Rapid sequential operations time: ${totalTime}ms`);
      expect(totalTime).toBeLessThan(2000);
    });
  });

  test('should maintain performance under load simulation', async ({ page }) => {
    await test.step('Simulate high interaction frequency', async () => {
      const interactions = [];
      
      // Perform 20 rapid interactions
      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();
        
        if (i % 3 === 0) {
          await cartHelpers.addProductToCart('Lavender Dreams', 1);
        } else if (i % 3 === 1) {
          await cartHelpers.openCart();
        } else {
          await helpers.navigation.goToProduct((i % 3) + 1);
        }
        
        const responseTime = Date.now() - startTime;
        interactions.push(responseTime);
        
        // Small delay to prevent overwhelming
        await page.waitForTimeout(100);
      }
      
      const avgResponseTime = interactions.reduce((sum, time) => sum + time, 0) / interactions.length;
      const maxResponseTime = Math.max(...interactions);
      
      console.log(`Average response time under load: ${avgResponseTime}ms`);
      console.log(`Maximum response time under load: ${maxResponseTime}ms`);
      
      expect(avgResponseTime).toBeLessThan(800);
      expect(maxResponseTime).toBeLessThan(2000);
    });

    await test.step('Test performance degradation over time', async () => {
      const performanceMetrics = [];
      
      // Measure performance over 10 iterations
      for (let iteration = 0; iteration < 10; iteration++) {
        const startTime = Date.now();
        
        await cartHelpers.addProductToCart('Lavender Dreams', 1);
        await cartHelpers.openCart();
        await cartHelpers.updateCartItemQuantity('Lavender Dreams', iteration + 1);
        
        const iterationTime = Date.now() - startTime;
        performanceMetrics.push({ iteration, time: iterationTime });
        
        console.log(`Iteration ${iteration + 1} time: ${iterationTime}ms`);
      }
      
      // Check if performance degrades significantly
      const firstHalf = performanceMetrics.slice(0, 5);
      const secondHalf = performanceMetrics.slice(5);
      
      const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.time, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.time, 0) / secondHalf.length;
      
      const degradationRatio = secondHalfAvg / firstHalfAvg;
      console.log(`Performance degradation ratio: ${degradationRatio}`);
      
      // Performance should not degrade by more than 50%
      expect(degradationRatio).toBeLessThan(1.5);
    });
  });

  test('should handle scroll and animation performance', async ({ page }) => {
    await test.step('Measure scrolling performance', async () => {
      await helpers.navigation.goToHomepage();
      
      const startTime = Date.now();
      
      // Perform smooth scroll
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      });
      
      // Wait for scroll to complete
      await page.waitForFunction(() => 
        window.scrollY >= document.body.scrollHeight - window.innerHeight - 10
      );
      
      const scrollTime = Date.now() - startTime;
      console.log(`Smooth scroll time: ${scrollTime}ms`);
      expect(scrollTime).toBeLessThan(2000);
    });

    await test.step('Test animation performance', async () => {
      // Test cart opening animation if present
      const animationStart = Date.now();
      await cartHelpers.openCart();
      
      // Check if cart appears smoothly
      await expect(page.locator('[data-testid="cart-sidebar"]')).toBeVisible();
      const animationTime = Date.now() - animationStart;
      
      console.log(`Cart animation time: ${animationTime}ms`);
      expect(animationTime).toBeLessThan(500);
    });

    await test.step('Measure rapid scroll performance', async () => {
      await helpers.navigation.goToHomepage();
      
      const scrollSteps = 10;
      const scrollTimes = [];
      
      for (let i = 0; i < scrollSteps; i++) {
        const startTime = Date.now();
        
        await page.evaluate((step) => {
          const scrollAmount = (document.body.scrollHeight / 10) * step;
          window.scrollTo(0, scrollAmount);
        }, i + 1);
        
        await page.waitForTimeout(50);
        const scrollTime = Date.now() - startTime;
        scrollTimes.push(scrollTime);
      }
      
      const avgScrollTime = scrollTimes.reduce((sum, time) => sum + time, 0) / scrollTimes.length;
      console.log(`Average rapid scroll time: ${avgScrollTime}ms`);
      expect(avgScrollTime).toBeLessThan(100);
    });
  });

  test('should handle database query performance', async ({ page }) => {
    await test.step('Measure API response times', async () => {
      const apiCalls = [];
      
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          apiCalls.push({
            url: response.url(),
            status: response.status(),
            timing: response.timing?.responseEnd || 0
          });
        }
      });
      
      await helpers.navigation.goToHomepage();
      await helpers.navigation.goToProduct(1);
      await cartHelpers.addProductToCartFromDetail(1, 1);
      
      // Wait for all API calls to complete
      await page.waitForTimeout(1000);
      
      const apiResponseTimes = apiCalls.filter(call => call.timing > 0);
      if (apiResponseTimes.length > 0) {
        const avgResponseTime = apiResponseTimes.reduce((sum, call) => sum + call.timing, 0) / apiResponseTimes.length;
        const maxResponseTime = Math.max(...apiResponseTimes.map(call => call.timing));
        
        console.log(`Average API response time: ${avgResponseTime}ms`);
        console.log(`Maximum API response time: ${maxResponseTime}ms`);
        
        expect(avgResponseTime).toBeLessThan(500);
        expect(maxResponseTime).toBeLessThan(2000);
      }
    });

    await test.step('Test search performance', async () => {
      // If search functionality exists
      const searchInput = page.locator('[data-testid="search-input"]');
      if (await searchInput.isVisible()) {
        const startTime = Date.now();
        await searchInput.fill('Lavender');
        await searchInput.press('Enter');
        
        // Wait for results
        await page.waitForLoadState('networkidle');
        const searchTime = Date.now() - startTime;
        
        console.log(`Search response time: ${searchTime}ms`);
        expect(searchTime).toBeLessThan(1000);
      }
    });
  });

  test('should handle mobile interaction performance', async ({ page }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.navigation.goToHomepage();
    });

    await test.step('Measure mobile touch response time', async () => {
      const touchStart = Date.now();
      await page.tap('[data-testid="product-card"]');
      
      await page.waitForLoadState('domcontentloaded');
      const touchTime = Date.now() - touchStart;
      
      console.log(`Mobile touch response time: ${touchTime}ms`);
      expect(touchTime).toBeLessThan(800);
    });

    await test.step('Measure mobile cart interactions', async () => {
      const addStart = Date.now();
      await cartHelpers.addProductToCartFromDetail(1, 1);
      const addTime = Date.now() - addStart;
      
      console.log(`Mobile add to cart time: ${addTime}ms`);
      expect(addTime).toBeLessThan(600);
      
      const cartStart = Date.now();
      await cartHelpers.openCart();
      const cartTime = Date.now() - cartStart;
      
      console.log(`Mobile cart open time: ${cartTime}ms`);
      expect(cartTime).toBeLessThan(400);
    });

    await test.step('Test mobile scroll performance', async () => {
      await helpers.navigation.goToHomepage();
      
      const scrollStart = Date.now();
      await page.evaluate(() => {
        window.scrollTo(0, window.innerHeight * 2);
      });
      
      await page.waitForTimeout(100);
      const scrollTime = Date.now() - scrollStart;
      
      console.log(`Mobile scroll time: ${scrollTime}ms`);
      expect(scrollTime).toBeLessThan(300);
    });
  });
});
