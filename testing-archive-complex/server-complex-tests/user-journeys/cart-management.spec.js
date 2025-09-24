import { test, expect } from '@playwright/test';
import { createHelpers } from '../../utils/test-helpers.js';
import { CartHelpers } from '../../utils/cart-helpers.js';
import testData from '../../fixtures/test-data.json';

test.describe('Cart Management E2E', () => {
  let helpers, cartHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = createHelpers(page);
    cartHelpers = new CartHelpers(page);
    
    await helpers.debug.logPageErrors();
    await helpers.navigation.goToHomepage();
    
    // Ensure cart is empty
    await cartHelpers.clearCart();
  });

  test('should add products from different pages', async ({ page }) => {
    await test.step('Add product from homepage', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      expect(await cartHelpers.getCartItemCount()).toBe(1);
    });

    await test.step('Add product from product detail page', async () => {
      await cartHelpers.addProductToCartFromDetail(2, 2); // Vanilla Bean Bliss, qty 2
      expect(await cartHelpers.getCartItemCount()).toBe(3);
    });

    await test.step('Add another product from homepage', async () => {
      await helpers.navigation.goToHomepage();
      await cartHelpers.addProductToCart('Eucalyptus Fresh', 1);
      expect(await cartHelpers.getCartItemCount()).toBe(4);
    });

    await test.step('Verify all products in cart', async () => {
      await cartHelpers.verifyCartState([
        { name: 'Lavender Dreams', quantity: 1 },
        { name: 'Vanilla Bean Bliss', quantity: 2 },
        { name: 'Eucalyptus Fresh', quantity: 1 }
      ]);
    });
  });

  test('should persist cart across page navigation', async ({ page }) => {
    await test.step('Add products to cart', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 2);
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
      expect(await cartHelpers.getCartItemCount()).toBe(3);
    });

    await test.step('Navigate to different pages and verify persistence', async () => {
      await cartHelpers.verifyCartPersistence(3);
    });

    await test.step('Verify cart contents remain intact', async () => {
      await cartHelpers.verifyCartState([
        { name: 'Lavender Dreams', quantity: 2 },
        { name: 'Vanilla Bean Bliss', quantity: 1 }
      ]);
    });
  });

  test('should handle quantity updates and validation', async ({ page }) => {
    await test.step('Add product to cart', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
    });

    await test.step('Update quantity to valid amount', async () => {
      await cartHelpers.updateCartItemQuantity('Lavender Dreams', 5);
      await cartHelpers.verifyCartState([
        { name: 'Lavender Dreams', quantity: 5 }
      ]);
      expect(await cartHelpers.getCartItemCount()).toBe(5);
    });

    await test.step('Test maximum quantity limits', async () => {
      await cartHelpers.testMaxQuantity('Lavender Dreams', 10);
    });

    await test.step('Test invalid quantity handling', async () => {
      await cartHelpers.testInvalidQuantity('Lavender Dreams');
    });
  });

  test('should handle item removal', async ({ page }) => {
    await test.step('Add multiple products', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 2);
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
      await cartHelpers.addProductToCart('Eucalyptus Fresh', 3);
      expect(await cartHelpers.getCartItemCount()).toBe(6);
    });

    await test.step('Remove middle item', async () => {
      await cartHelpers.removeCartItem('Vanilla Bean Bliss');
      expect(await cartHelpers.getCartItemCount()).toBe(5);
      
      await cartHelpers.verifyCartState([
        { name: 'Lavender Dreams', quantity: 2 },
        { name: 'Eucalyptus Fresh', quantity: 3 }
      ]);
    });

    await test.step('Remove remaining items one by one', async () => {
      await cartHelpers.removeCartItem('Lavender Dreams');
      expect(await cartHelpers.getCartItemCount()).toBe(3);
      
      await cartHelpers.removeCartItem('Eucalyptus Fresh');
      expect(await cartHelpers.getCartItemCount()).toBe(0);
      
      await cartHelpers.verifyCartState([]); // Empty cart
    });
  });

  test('should handle cart total calculations', async ({ page }) => {
    await test.step('Add products with different prices', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 2); // $24.99 * 2 = $49.98
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 3); // $22.99 * 3 = $68.97
      await cartHelpers.addProductToCart('Eucalyptus Fresh', 1); // $26.99 * 1 = $26.99
    });

    await test.step('Verify cart total calculation', async () => {
      const expectedTotal = (24.99 * 2) + (22.99 * 3) + (26.99 * 1);
      await cartHelpers.verifyCartTotal(expectedTotal);
    });

    await test.step('Update quantities and verify total updates', async () => {
      await cartHelpers.updateCartItemQuantity('Lavender Dreams', 1); // Change from 2 to 1
      const newExpectedTotal = (24.99 * 1) + (22.99 * 3) + (26.99 * 1);
      await cartHelpers.verifyCartTotal(newExpectedTotal);
    });
  });

  test('should handle empty cart state', async ({ page }) => {
    await test.step('Verify initial empty cart', async () => {
      await cartHelpers.verifyCartState([]);
      expect(await cartHelpers.getCartItemCount()).toBe(0);
    });

    await test.step('Add and remove item to return to empty state', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      expect(await cartHelpers.getCartItemCount()).toBe(1);
      
      await cartHelpers.removeCartItem('Lavender Dreams');
      await cartHelpers.verifyCartState([]);
      expect(await cartHelpers.getCartItemCount()).toBe(0);
    });

    await test.step('Verify empty cart message and disabled checkout', async () => {
      await cartHelpers.openCart();
      await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
      
      // Checkout button should be disabled or hidden
      const checkoutButton = page.locator('[data-testid="checkout-button"]');
      if (await checkoutButton.isVisible()) {
        await expect(checkoutButton).toBeDisabled();
      }
    });
  });

  test('should handle cart actions during product browsing', async ({ page }) => {
    await test.step('Add product while browsing', async () => {
      // Add product from homepage
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      
      // Navigate to product detail and add more
      await page.click('[data-testid="product-card"]', { hasText: 'Vanilla Bean Bliss' });
      await page.waitForLoadState('networkidle');
      
      const addButton = page.locator('[data-testid="add-to-cart-button"]');
      await addButton.click();
      
      expect(await cartHelpers.getCartItemCount()).toBe(2);
    });

    await test.step('Verify cart accessibility from any page', async () => {
      // Cart should be accessible from product detail page
      await cartHelpers.openCart();
      await cartHelpers.verifyCartState([
        { name: 'Lavender Dreams', quantity: 1 },
        { name: 'Vanilla Bean Bliss', quantity: 1 }
      ]);
    });
  });

  test('should handle rapid cart operations', async ({ page }) => {
    await test.step('Rapidly add multiple products', async () => {
      // Add products quickly without waiting
      const products = ['Lavender Dreams', 'Vanilla Bean Bliss', 'Eucalyptus Fresh'];
      
      for (const product of products) {
        await cartHelpers.addProductToCart(product, 1);
        // Small delay to prevent race conditions
        await page.waitForTimeout(100);
      }
      
      expect(await cartHelpers.getCartItemCount()).toBe(3);
    });

    await test.step('Rapidly update quantities', async () => {
      await cartHelpers.openCart();
      
      // Update multiple quantities quickly
      await cartHelpers.updateCartItemQuantity('Lavender Dreams', 3);
      await cartHelpers.updateCartItemQuantity('Vanilla Bean Bliss', 2);
      await cartHelpers.updateCartItemQuantity('Eucalyptus Fresh', 4);
      
      expect(await cartHelpers.getCartItemCount()).toBe(9);
    });
  });

  test('should handle cart during network issues', async ({ page }) => {
    await test.step('Add products normally', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 2);
      expect(await cartHelpers.getCartItemCount()).toBe(2);
    });

    await test.step('Simulate network failure during cart update', async () => {
      // Mock network failure for cart updates
      await page.route('**/api/cart/**', route => {
        route.abort('failed');
      });
      
      // Try to update quantity - should handle gracefully
      try {
        await cartHelpers.updateCartItemQuantity('Lavender Dreams', 5);
      } catch (error) {
        // Expected to fail gracefully
      }
      
      // Remove route mock
      await page.unroute('**/api/cart/**');
    });

    await test.step('Verify cart recovery after network restored', async () => {
      // Cart should still maintain its state
      await cartHelpers.verifyCartState([
        { name: 'Lavender Dreams', quantity: 2 }
      ]);
    });
  });

  test('should handle concurrent cart modifications', async ({ page }) => {
    await test.step('Simulate concurrent cart updates', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
      
      // Simulate multiple rapid cart operations
      const operations = [
        () => cartHelpers.updateCartItemQuantity('Lavender Dreams', 2),
        () => cartHelpers.addProductToCart('Vanilla Bean Bliss', 1),
        () => cartHelpers.updateCartItemQuantity('Lavender Dreams', 3)
      ];
      
      // Execute operations concurrently
      await Promise.all(operations.map(op => op()));
      
      // Wait for all operations to settle
      await page.waitForTimeout(1000);
      
      // Verify final state is consistent
      const finalCount = await cartHelpers.getCartItemCount();
      expect(finalCount).toBeGreaterThan(0);
    });
  });

  test('should handle cart size limits', async ({ page }) => {
    await test.step('Test cart capacity limits', async () => {
      // Add multiple different products to test cart capacity
      const products = testData.products;
      
      for (const product of products) {
        await cartHelpers.addProductToCart(product.name, 10); // High quantity
      }
      
      const totalItems = await cartHelpers.getCartItemCount();
      expect(totalItems).toBe(products.length * 10);
    });

    await test.step('Verify cart performance with many items', async () => {
      // Cart operations should remain responsive even with many items
      const startTime = Date.now();
      await cartHelpers.openCart();
      const endTime = Date.now();
      
      const openTime = endTime - startTime;
      expect(openTime).toBeLessThan(2000); // Should open within 2 seconds
    });
  });

  test('should maintain cart state during browser refresh', async ({ page }) => {
    await test.step('Add items to cart', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 2);
      await cartHelpers.addProductToCart('Vanilla Bean Bliss', 1);
      expect(await cartHelpers.getCartItemCount()).toBe(3);
    });

    await test.step('Refresh browser and verify cart persistence', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Cart should persist after refresh
      expect(await cartHelpers.getCartItemCount()).toBe(3);
      await cartHelpers.verifyCartState([
        { name: 'Lavender Dreams', quantity: 2 },
        { name: 'Vanilla Bean Bliss', quantity: 1 }
      ]);
    });
  });

  test('should handle cart with out-of-stock items', async ({ page }) => {
    await test.step('Add product to cart', async () => {
      await cartHelpers.addProductToCart('Lavender Dreams', 1);
    });

    await test.step('Simulate product going out of stock', async () => {
      // Mock API to return out of stock for this product
      await page.route('**/api/products/1', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...testData.products[0],
            stock: 0
          })
        });
      });
    });

    await test.step('Verify out-of-stock handling in cart', async () => {
      await page.reload();
      await cartHelpers.openCart();
      
      // Should show out-of-stock indicator
      const cartItem = page.locator('[data-testid="cart-item"]')
        .filter({ hasText: 'Lavender Dreams' });
      await expect(cartItem.locator('[data-testid="out-of-stock-indicator"]')).toBeVisible();
    });
  });
});
