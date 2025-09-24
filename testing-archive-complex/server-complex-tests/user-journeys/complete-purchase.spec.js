import { test, expect } from '@playwright/test';
import { createHelpers } from '../../utils/test-helpers.js';
import { CartHelpers } from '../../utils/cart-helpers.js';
import { PaymentHelpers } from '../../utils/payment-helpers.js';
import testData from '../../fixtures/test-data.json';

test.describe('Complete Purchase Journey', () => {
  let helpers, cartHelpers, paymentHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = createHelpers(page);
    cartHelpers = new CartHelpers(page);
    paymentHelpers = new PaymentHelpers(page);
    
    // Enable error logging
    await helpers.debug.logPageErrors();
    
    // Start at homepage
    await helpers.navigation.goToHomepage();
  });

  test('should complete full purchase flow: Browse → Add to Cart → Checkout → Pay → Success', async ({ page }) => {
    // 1. Browse and select products
    await test.step('Browse products on homepage', async () => {
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-card"]')).toHaveCount(testData.products.length);
    });

    // 2. Add product to cart
    await test.step('Add Lavender Dreams to cart', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      
      // Verify cart count updated
      const cartCount = await cartHelpers.getCartItemCount();
      expect(cartCount).toBe(1);
    });

    // 3. Verify cart contents
    await test.step('Verify cart contents', async () => {
      await cartHelpers.verifyCartState([
        { name: 'Lavender Dreams', quantity: 1, price: 24.99 }
      ]);
      await cartHelpers.verifyCartTotal(24.99);
    });

    // 4. Proceed to checkout
    await test.step('Proceed to checkout', async () => {
      await cartHelpers.proceedToCheckout();
      await expect(page).toHaveURL('/checkout');
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
    });

    // 5. Complete payment
    await test.step('Complete payment with Stripe', async () => {
      await paymentHelpers.completeSuccessfulPayment('visa');
    });

    // 6. Verify order confirmation
    await test.step('Verify order confirmation', async () => {
      await paymentHelpers.verifyOrderCreation({
        customerEmail: 'test@example.com',
        total: 24.99,
        items: [{ name: 'Lavender Dreams', quantity: 1 }]
      });
    });

    // 7. Verify cart is cleared after successful purchase
    await test.step('Verify cart cleared after purchase', async () => {
      await helpers.navigation.goToHomepage();
      const cartCount = await cartHelpers.getCartItemCount();
      expect(cartCount).toBe(0);
    });
  });

  test('should handle multiple products purchase', async ({ page }) => {
    // Add multiple products to cart
    await test.step('Add multiple products to cart', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 2);
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
      await cartHelpers.addProductToCart('Eucalyptus Fresh', 3);
      
      const cartCount = await cartHelpers.getCartItemCount();
      expect(cartCount).toBe(6); // 2 + 1 + 3
    });

    // Verify cart total
    await test.step('Verify cart total calculation', async () => {
      const expectedTotal = (24.99 * 2) + (22.99 * 1) + (26.99 * 3);
      await cartHelpers.verifyCartTotal(expectedTotal);
    });

    // Complete checkout
    await test.step('Complete multi-item checkout', async () => {
      await cartHelpers.proceedToCheckout();
      await paymentHelpers.completeSuccessfulPayment('mastercard');
      
      // Verify all items in order confirmation
      await paymentHelpers.verifyOrderCreation({
        total: (24.99 * 2) + (22.99 * 1) + (26.99 * 3),
        items: [
          { name: 'Lavender Dreams', quantity: 2 },
          { name: 'Vanilla Bean Bliss', quantity: 1 },
          { name: 'Eucalyptus Fresh', quantity: 3 }
        ]
      });
    });
  });

  test('should handle quantity adjustments during checkout', async ({ page }) => {
    // Add product and go to checkout
    await cartHelpers.addProductToCart('Lavender Dreams', 1);
    await cartHelpers.proceedToCheckout();
    
    // Adjust quantity in checkout
    await test.step('Adjust quantity in checkout', async () => {
      await cartHelpers.updateCartItemQuantity('Lavender Dreams', 3);
      await cartHelpers.verifyCartTotal(24.99 * 3);
    });

    // Complete purchase with adjusted quantity
    await test.step('Complete purchase with adjusted quantity', async () => {
      await paymentHelpers.completeSuccessfulPayment();
      await paymentHelpers.verifyOrderCreation({
        total: 24.99 * 3,
        items: [{ name: 'Lavender Dreams', quantity: 3 }]
      });
    });
  });

  test('should handle guest checkout flow', async ({ page }) => {
    await test.step('Add product and proceed as guest', async () => {
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
      await cartHelpers.proceedToCheckout();
    });

    await test.step('Complete guest checkout', async () => {
      await paymentHelpers.testGuestCheckout('guest@example.com');
    });
  });

  test('should handle payment with different card types', async ({ page }) => {
    const cardTypes = ['visa', 'mastercard', 'visaDebit'];
    
    for (const cardType of cardTypes) {
      await test.step(`Test payment with ${cardType}`, async () => {
        // Clear cart and add fresh product
        await cartHelpers.clearCart();
        await helpers.navigation.goToHomepage();
        await cartHelpers.addProductToCart('Eucalyptus Fresh', 1);
        await cartHelpers.proceedToCheckout();
        
        // Complete payment with specific card type
        await paymentHelpers.completeSuccessfulPayment(cardType);
        
        // Return to homepage for next iteration
        await helpers.navigation.goToHomepage();
      });
    }
  });

  test('should measure end-to-end performance', async ({ page }) => {
    const startTime = Date.now();
    
    // Complete full purchase flow
    await cartHelpers.addProductToCart('Lavender Dreams', 1);
    await cartHelpers.proceedToCheckout();
    const processingTime = await paymentHelpers.measurePaymentProcessingTime();
    
    const totalTime = Date.now() - startTime;
    
    console.log(`Total E2E time: ${totalTime}ms`);
    console.log(`Payment processing time: ${processingTime}ms`);
    
    // Performance assertions
    expect(totalTime).toBeLessThan(30000); // Total flow under 30 seconds
    expect(processingTime).toBeLessThan(10000); // Payment under 10 seconds
  });

  test('should handle browser back button during purchase', async ({ page }) => {
    // Add product and go to checkout
    await cartHelpers.addProductToCart('Lavender Dreams', 1);
    await cartHelpers.proceedToCheckout();
    
    // Go back to cart
    await test.step('Navigate back to cart', async () => {
      await page.goBack();
      await cartHelpers.verifyCartState([
        { name: 'Lavender Dreams', quantity: 1 }
      ]);
    });

    // Return to checkout and complete
    await test.step('Return to checkout and complete', async () => {
      await cartHelpers.proceedToCheckout();
      await paymentHelpers.completeSuccessfulPayment();
    });
  });

  test('should validate order persistence in database', async ({ page }) => {
    await test.step('Complete purchase', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 2);
      await cartHelpers.proceedToCheckout();
      await paymentHelpers.completeSuccessfulPayment();
    });

    await test.step('Verify order exists via API', async () => {
      // Make API request to verify order was saved
      const response = await page.request.get('/api/orders/recent');
      expect(response.ok()).toBeTruthy();
      
      const orders = await response.json();
      expect(orders.length).toBeGreaterThan(0);
      
      const latestOrder = orders[0];
      expect(latestOrder.customer_email).toBe('test@example.com');
      expect(latestOrder.total).toBe(49.98); // 24.99 * 2
    });
  });
});
