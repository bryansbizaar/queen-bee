import { test, expect } from '@playwright/test';
import { createHelpers } from '../../utils/test-helpers.js';
import { CartHelpers } from '../../utils/cart-helpers.js';
import { PaymentHelpers } from '../../utils/payment-helpers.js';

test.describe('Mobile Responsiveness Testing', () => {
  let helpers, cartHelpers, paymentHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = createHelpers(page);
    cartHelpers = new CartHelpers(page);
    paymentHelpers = new PaymentHelpers(page);
    
    await helpers.debug.logPageErrors();
  });

  test('should work correctly on mobile phones', async ({ page }) => {
    // Test various mobile devices
    const mobileDevices = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone 11 Pro' },
      { width: 360, height: 640, name: 'Galaxy S5' },
      { width: 412, height: 915, name: 'Pixel 5' }
    ];

    for (const device of mobileDevices) {
      await test.step(`Test on ${device.name} (${device.width}x${device.height})`, async () => {
        await page.setViewportSize({ width: device.width, height: device.height });
        await helpers.navigation.goToHomepage();
        
        // Test mobile layout
        await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
        
        // Check mobile navigation
        const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
        if (await mobileMenuButton.isVisible()) {
          await mobileMenuButton.click();
          await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
          
          // Close mobile menu
          await page.click('[data-testid="mobile-menu-close"]');
          await expect(page.locator('[data-testid="mobile-menu"]')).toBeHidden();
        }
        
        // Test product cards fit properly
        const productCard = page.locator('[data-testid="product-card"]').first();
        const cardBox = await productCard.boundingBox();
        expect(cardBox.width).toBeLessThanOrEqual(device.width - 40); // Account for padding
        
        // Test cart button is accessible
        const cartButton = page.locator('[data-testid="cart-button"]');
        await expect(cartButton).toBeVisible();
        const cartBox = await cartButton.boundingBox();
        expect(cartBox.width).toBeGreaterThan(40); // Minimum touch target
        expect(cartBox.height).toBeGreaterThan(40);
      });
    }
  });

  test('should handle touch interactions correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await helpers.navigation.goToHomepage();

    await test.step('Test touch scrolling', async () => {
      // Test vertical scroll
      await page.evaluate(() => {
        window.scrollTo(0, 100);
      });
      
      const scrollPosition = await page.evaluate(() => window.scrollY);
      expect(scrollPosition).toBeGreaterThan(0);
    });

    await test.step('Test touch tap interactions', async () => {
      // Test tapping product card
      const productCard = page.locator('[data-testid="product-card"]').first();
      await productCard.tap();
      
      // Should navigate to product detail
      await expect(page).toHaveURL(/\/product\/\d+/);
      
      // Test add to cart tap
      const addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
      await addToCartButton.tap();
      
      // Cart count should update
      expect(await cartHelpers.getCartItemCount()).toBe(1);
    });

    await test.step('Test swipe gestures if implemented', async () => {
      await helpers.navigation.goToHomepage();
      
      // Test horizontal swipe on product images if carousel exists
      const productImage = page.locator('[data-testid="product-image"]').first();
      const imageBox = await productImage.boundingBox();
      
      if (imageBox) {
        // Simulate swipe left
        await page.mouse.move(imageBox.x + imageBox.width - 10, imageBox.y + imageBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(imageBox.x + 10, imageBox.y + imageBox.height / 2);
        await page.mouse.up();
        
        // If carousel implemented, should change image
        await page.waitForTimeout(500);
      }
    });

    await test.step('Test pinch-to-zoom prevention on form elements', async () => {
      await cartHelpers.proceedToCheckout();
      
      // Check if viewport meta tag prevents zoom on form inputs
      const viewportMeta = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta ? meta.getAttribute('content') : null;
      });
      
      // Should have proper viewport settings for mobile
      expect(viewportMeta).toContain('width=device-width');
    });
  });

  test('should display mobile-optimized checkout flow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Add product and go to mobile checkout', async () => {
      await helpers.navigation.goToHomepage();
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.proceedToCheckout();
    });

    await test.step('Test mobile checkout form layout', async () => {
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
      
      // Form should stack vertically on mobile
      const formElements = [
        '[data-testid="billing-name"]',
        '[data-testid="billing-email"]',
        '[data-testid="billing-address-line1"]',
        '[data-testid="billing-city"]'
      ];
      
      for (const element of formElements) {
        const input = page.locator(element);
        if (await input.isVisible()) {
          const inputBox = await input.boundingBox();
          expect(inputBox.width).toBeGreaterThan(200); // Should be wide enough for mobile
          expect(inputBox.height).toBeGreaterThan(40); // Touch-friendly height
        }
      }
    });

    await test.step('Test mobile payment form interactions', async () => {
      // Test form field focus
      const nameInput = page.locator('[data-testid="billing-name"]');
      await nameInput.tap();
      
      // Should focus and potentially show keyboard
      const isFocused = await nameInput.evaluate(el => el === document.activeElement);
      expect(isFocused).toBeTruthy();
      
      // Test Stripe Elements on mobile
      await expect(page.locator('[data-testid="stripe-payment-form"]')).toBeVisible();
      
      // Stripe iframes should be responsive
      const stripeFrames = page.frameLocator('iframe[name*="__privateStripeFrame"]');
      const cardFrame = stripeFrames.first();
      
      // Should be able to interact with Stripe elements
      await cardFrame.locator('[name="cardnumber"]').tap();
    });

    await test.step('Test mobile payment completion', async () => {
      await paymentHelpers.fillStripePaymentForm('visa');
      
      // Submit button should be touch-friendly
      const submitButton = page.locator('[data-testid="submit-payment-button"]');
      const buttonBox = await submitButton.boundingBox();
      expect(buttonBox.height).toBeGreaterThan(44); // iOS minimum touch target
      
      await submitButton.tap();
      
      // Should navigate to success page
      await page.waitForURL('/success', { timeout: 30000 });
      await expect(page.locator('[data-testid="payment-success-message"]')).toBeVisible();
    });
  });

  test('should handle mobile cart interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Test mobile cart access', async () => {
      await helpers.navigation.goToHomepage();
      
      // Cart button should be easily accessible
      const cartButton = page.locator('[data-testid="cart-button"]');
      await expect(cartButton).toBeVisible();
      
      const cartBox = await cartButton.boundingBox();
      expect(cartBox.width).toBeGreaterThan(44);
      expect(cartBox.height).toBeGreaterThan(44);
      
      await cartButton.tap();
    });

    await test.step('Test mobile cart management', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
      
      await cartHelpers.openCart();
      
      // Cart items should be readable on mobile
      const cartItems = page.locator('[data-testid="cart-item"]');
      const itemCount = await cartItems.count();
      expect(itemCount).toBe(2);
      
      // Test quantity adjustment on mobile
      const quantityInput = cartItems.first().locator('[data-testid="quantity-input"]');
      await quantityInput.tap();
      await quantityInput.fill('3');
      
      // Test remove item on mobile
      const removeButton = cartItems.first().locator('[data-testid="remove-item-button"]');
      const removeBox = await removeButton.boundingBox();
      expect(removeBox.width).toBeGreaterThan(30); // Touch-friendly
      expect(removeBox.height).toBeGreaterThan(30);
      
      await removeButton.tap();
      
      // Item should be removed
      await page.waitForTimeout(500);
      const remainingItems = await page.locator('[data-testid="cart-item"]').count();
      expect(remainingItems).toBe(1);
    });
  });

  test('should handle different mobile orientations', async ({ page }) => {
    await test.step('Test portrait orientation', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.navigation.goToHomepage();
      
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      
      // Products should stack vertically or in narrow grid
      const productCards = page.locator('[data-testid="product-card"]');
      const firstCard = productCards.first();
      const secondCard = productCards.nth(1);
      
      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();
      
      // In portrait, cards should be in column layout or narrow grid
      expect(firstBox.width).toBeLessThan(300);
    });

    await test.step('Test landscape orientation', async () => {
      await page.setViewportSize({ width: 667, height: 375 });
      await helpers.navigation.goToHomepage();
      
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      
      // Should adapt to landscape layout
      const productGrid = page.locator('[data-testid="product-grid"]');
      const gridBox = await productGrid.boundingBox();
      expect(gridBox.width).toBeGreaterThan(500);
      
      // Test navigation in landscape
      const cartButton = page.locator('[data-testid="cart-button"]');
      await expect(cartButton).toBeVisible();
    });
  });

  test('should handle mobile-specific performance requirements', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Test mobile load performance', async () => {
      const startTime = Date.now();
      await helpers.navigation.goToHomepage();
      const loadTime = Date.now() - startTime;
      
      console.log(`Mobile homepage load time: ${loadTime}ms`);
      
      // Mobile should load reasonably fast
      expect(loadTime).toBeLessThan(4000); // 4 seconds for mobile
    });

    await test.step('Test mobile image optimization', async () => {
      await helpers.navigation.goToHomepage();
      
      // Check if images are optimized for mobile
      const images = page.locator('[data-testid="product-image"]');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const image = images.nth(i);
        const imageSrc = await image.getAttribute('src');
        
        // Images should load efficiently
        const imageLoadStart = Date.now();
        await image.waitFor({ state: 'visible' });
        const imageLoadTime = Date.now() - imageLoadStart;
        
        expect(imageLoadTime).toBeLessThan(2000);
      }
    });

    await test.step('Test mobile interaction responsiveness', async () => {
      // Test rapid taps
      const productCard = page.locator('[data-testid="product-card"]').first();
      
      const tapStart = Date.now();
      await productCard.tap();
      
      // Should respond quickly to touch
      await page.waitForLoadState('networkidle');
      const tapResponseTime = Date.now() - tapStart;
      
      console.log(`Mobile tap response time: ${tapResponseTime}ms`);
      expect(tapResponseTime).toBeLessThan(1500);
    });
  });

  test('should handle mobile accessibility features', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Test mobile screen reader compatibility', async () => {
      await helpers.navigation.goToHomepage();
      
      // Check for proper ARIA labels on touch targets
      const touchTargets = page.locator('button, a, [role="button"]');
      const targetCount = await touchTargets.count();
      
      for (let i = 0; i < Math.min(targetCount, 5); i++) {
        const target = touchTargets.nth(i);
        
        // Should have accessible text or label
        const hasText = await target.textContent();
        const hasAriaLabel = await target.getAttribute('aria-label');
        const hasTitle = await target.getAttribute('title');
        
        expect(hasText || hasAriaLabel || hasTitle).toBeTruthy();
      }
    });

    await test.step('Test mobile keyboard navigation', async () => {
      // Test virtual keyboard navigation
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.proceedToCheckout();
      
      // Test tab navigation on mobile form
      const nameInput = page.locator('[data-testid="billing-name"]');
      await nameInput.focus();
      
      // Should be able to navigate between form fields
      await page.keyboard.press('Tab');
      const nextElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(nextElement).toBeTruthy();
    });

    await test.step('Test mobile contrast and readability', async () => {
      await helpers.navigation.goToHomepage();
      
      // Text should be readable on mobile
      const productTitles = page.locator('[data-testid="product-name"]');
      const firstTitle = productTitles.first();
      
      const titleStyles = await firstTitle.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          fontSize: styles.fontSize,
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      // Font size should be reasonable for mobile
      const fontSize = parseInt(titleStyles.fontSize);
      expect(fontSize).toBeGreaterThan(14); // Minimum readable size
    });
  });

  test('should handle mobile network conditions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Test with slow 3G simulation', async () => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 300);
      });
      
      await helpers.navigation.goToHomepage();
      
      // Should show loading states
      const loadingIndicator = page.locator('[data-testid="loading"]');
      if (await loadingIndicator.isVisible()) {
        await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
      }
      
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    });

    await test.step('Test offline behavior', async () => {
      // Go offline
      await page.context().setOffline(true);
      
      // Should handle offline gracefully
      await page.reload();
      
      const offlineMessage = page.locator('[data-testid="offline-message"]');
      const cachedContent = page.locator('[data-testid="product-grid"]');
      
      // Should show offline message or cached content
      const hasOfflineMessage = await offlineMessage.isVisible();
      const hasCachedContent = await cachedContent.isVisible();
      
      expect(hasOfflineMessage || hasCachedContent).toBeTruthy();
      
      // Go back online
      await page.context().setOffline(false);
    });
  });

  test('should handle mobile form validation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Test mobile form error display', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      await cartHelpers.proceedToCheckout();
      
      // Submit form with errors
      await page.tap('[data-testid="submit-payment-button"]');
      
      // Error messages should be visible and properly positioned
      const errorMessages = page.locator('[data-testid*="error"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        const firstError = errorMessages.first();
        const errorBox = await firstError.boundingBox();
        
        // Error should be visible and readable
        expect(errorBox.width).toBeGreaterThan(100);
        expect(errorBox.height).toBeGreaterThan(20);
      }
    });

    await test.step('Test mobile input focus and keyboard', async () => {
      const emailInput = page.locator('[data-testid="billing-email"]');
      await emailInput.tap();
      
      // Should trigger appropriate mobile keyboard
      const inputType = await emailInput.getAttribute('type');
      expect(inputType).toBe('email'); // Should trigger email keyboard
      
      // Test input with mobile keyboard simulation
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
    });
  });
});
