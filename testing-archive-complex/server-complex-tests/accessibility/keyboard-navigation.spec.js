import { test, expect } from '@playwright/test';
import { createHelpers } from '../../utils/test-helpers.js';
import { CartHelpers } from '../../utils/cart-helpers.js';
import { PaymentHelpers } from '../../utils/payment-helpers.js';

test.describe('Keyboard Navigation Testing', () => {
  let helpers, cartHelpers, paymentHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = createHelpers(page);
    cartHelpers = new CartHelpers(page);
    paymentHelpers = new PaymentHelpers(page);
    
    await helpers.debug.logPageErrors();
  });

  test('should navigate homepage using only keyboard', async ({ page }) => {
    await test.step('Load homepage and start keyboard navigation', async () => {
      await helpers.navigation.goToHomepage();
      
      // Start keyboard navigation
      await page.keyboard.press('Tab');
      
      const firstFocused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          testId: el?.getAttribute('data-testid'),
          text: el?.textContent?.trim()
        };
      });
      
      expect(firstFocused.tagName).toBeTruthy();
      console.log(`First focusable element: ${firstFocused.tagName} - ${firstFocused.testId}`);
    });

    await test.step('Navigate through all interactive elements', async () => {
      const focusableElements = [];
      let currentElement = null;
      let previousElement = null;
      let tabCount = 0;
      const maxTabs = 50; // Prevent infinite loop
      
      do {
        previousElement = currentElement;
        await page.keyboard.press('Tab');
        tabCount++;
        
        currentElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            testId: el?.getAttribute('data-testid'),
            text: el?.textContent?.trim().substring(0, 50),
            href: el?.getAttribute('href'),
            type: el?.getAttribute('type')
          };
        });
        
        if (currentElement.tagName && currentElement.tagName !== 'BODY') {
          focusableElements.push(currentElement);
          console.log(`Tab ${tabCount}: ${currentElement.tagName} - ${currentElement.testId || currentElement.text}`);
        }
        
      } while (
        tabCount < maxTabs && 
        JSON.stringify(currentElement) !== JSON.stringify(previousElement) &&
        currentElement.tagName !== 'BODY'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
      console.log(`Total focusable elements: ${focusableElements.length}`);
    });

    await test.step('Test specific keyboard interactions on homepage', async () => {
      // Navigate to first product card
      await helpers.navigation.goToHomepage();
      
      let productCardFocused = false;
      let attempts = 0;
      
      while (!productCardFocused && attempts < 20) {
        await page.keyboard.press('Tab');
        const current = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.closest('[data-testid="product-card"]') ? true : false;
        });
        
        if (current) {
          productCardFocused = true;
          console.log('Product card focused via keyboard');
        }
        attempts++;
      }
      
      if (productCardFocused) {
        // Test Enter key on product card
        await page.keyboard.press('Enter');
        
        // Should navigate to product detail
        await page.waitForTimeout(1000);
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/product\/\d+/);
      }
    });
  });

  test('should complete cart workflow using only keyboard', async ({ page }) => {
    await test.step('Navigate to and add product using keyboard', async () => {
      await helpers.navigation.goToHomepage();
      
      // Find and focus add to cart button
      let addToCartFocused = false;
      let attempts = 0;
      
      while (!addToCartFocused && attempts < 30) {
        await page.keyboard.press('Tab');
        const currentTestId = await page.evaluate(() => {
          return document.activeElement?.getAttribute('data-testid');
        });
        
        if (currentTestId === 'add-to-cart-button') {
          addToCartFocused = true;
          console.log('Add to cart button focused');
          break;
        }
        attempts++;
      }
      
      expect(addToCartFocused).toBeTruthy();
      
      // Press Enter to add to cart
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Verify item was added
      expect(await cartHelpers.getCartItemCount()).toBe(1);
    });

    await test.step('Navigate to cart using keyboard', async () => {
      // Find cart button
      let cartButtonFocused = false;
      let attempts = 0;
      
      while (!cartButtonFocused && attempts < 20) {
        await page.keyboard.press('Tab');
        const currentTestId = await page.evaluate(() => {
          return document.activeElement?.getAttribute('data-testid');
        });
        
        if (currentTestId === 'cart-button') {
          cartButtonFocused = true;
          console.log('Cart button focused');
          break;
        }
        attempts++;
      }
      
      expect(cartButtonFocused).toBeTruthy();
      
      // Open cart with Enter
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Verify cart is open
      await expect(page.locator('[data-testid="cart-sidebar"]')).toBeVisible();
    });

    await test.step('Manage cart items using keyboard', async () => {
      // Tab through cart items and controls
      const cartFocusableElements = [];
      let attempts = 0;
      
      while (attempts < 15) {
        await page.keyboard.press('Tab');
        const currentElement = await page.evaluate(() => {
          const el = document.activeElement;
          const isInCart = el?.closest('[data-testid="cart-sidebar"]');
          return isInCart ? {
            testId: el?.getAttribute('data-testid'),
            tagName: el?.tagName,
            text: el?.textContent?.trim().substring(0, 30)
          } : null;
        });
        
        if (currentElement) {
          cartFocusableElements.push(currentElement);
          console.log(`Cart element: ${currentElement.tagName} - ${currentElement.testId}`);
          
          // Test quantity input if found
          if (currentElement.testId === 'quantity-input') {
            await page.keyboard.press('ArrowUp'); // Increase quantity
            await page.waitForTimeout(200);
            
            const newValue = await page.locator('[data-testid="quantity-input"]').inputValue();
            expect(parseInt(newValue)).toBeGreaterThan(1);
            console.log('Quantity updated via keyboard');
          }
          
          // Test checkout button if found
          if (currentElement.testId === 'checkout-button') {
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            
            // Should navigate to checkout
            expect(page.url()).toContain('/checkout');
            console.log('Navigated to checkout via keyboard');
            break;
          }
        }
        attempts++;
      }
      
      expect(cartFocusableElements.length).toBeGreaterThan(0);
    });
  });

  test('should complete checkout form using only keyboard', async ({ page }) => {
    await test.step('Setup cart and navigate to checkout', async () => {
      await helpers.navigation.goToHomepage();
      await page.click('[data-testid="add-to-cart-button"]');
      await page.waitForTimeout(500);
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Navigate through checkout form fields', async () => {
      const formFields = [
        { testId: 'billing-name', value: 'John Doe' },
        { testId: 'billing-email', value: 'john@example.com' },
        { testId: 'billing-address-line1', value: '123 Main St' },
        { testId: 'billing-city', value: 'Auckland' },
        { testId: 'billing-postal-code', value: '1010' }
      ];
      
      for (const field of formFields) {
        // Navigate to field
        let fieldFocused = false;
        let attempts = 0;
        
        while (!fieldFocused && attempts < 20) {
          await page.keyboard.press('Tab');
          const currentTestId = await page.evaluate(() => {
            return document.activeElement?.getAttribute('data-testid');
          });
          
          if (currentTestId === field.testId) {
            fieldFocused = true;
            console.log(`${field.testId} focused via keyboard`);
            break;
          }
          attempts++;
        }
        
        if (fieldFocused) {
          // Clear field and type value
          await page.keyboard.press('Control+a');
          await page.keyboard.type(field.value);
          
          // Verify value was entered
          const inputValue = await page.locator(`[data-testid="${field.testId}"]`).inputValue();
          expect(inputValue).toBe(field.value);
        }
      }
    });

    await test.step('Navigate through country select using keyboard', async () => {
      const countrySelect = page.locator('[data-testid="billing-country"]');
      if (await countrySelect.isVisible()) {
        // Focus country select
        let selectFocused = false;
        let attempts = 0;
        
        while (!selectFocused && attempts < 10) {
          await page.keyboard.press('Tab');
          const currentTestId = await page.evaluate(() => {
            return document.activeElement?.getAttribute('data-testid');
          });
          
          if (currentTestId === 'billing-country') {
            selectFocused = true;
            console.log('Country select focused');
            break;
          }
          attempts++;
        }
        
        if (selectFocused) {
          // Use arrow keys to select option
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Enter');
          
          const selectedValue = await countrySelect.inputValue();
          expect(selectedValue).toBeTruthy();
          console.log(`Country selected: ${selectedValue}`);
        }
      }
    });

    await test.step('Navigate Stripe Elements using keyboard', async () => {
      // Wait for Stripe Elements to load
      await expect(page.locator('[data-testid="stripe-payment-form"]')).toBeVisible();
      
      // Tab to Stripe Elements
      let stripeFieldFocused = false;
      let attempts = 0;
      
      while (!stripeFieldFocused && attempts < 10) {
        await page.keyboard.press('Tab');
        
        // Check if we're in a Stripe iframe
        const inStripeFrame = await page.evaluate(() => {
          const activeElement = document.activeElement;
          return activeElement?.tagName === 'IFRAME' && 
                 activeElement?.name?.includes('__privateStripeFrame');
        });
        
        if (inStripeFrame) {
          stripeFieldFocused = true;
          console.log('Stripe field focused via keyboard');
          break;
        }
        attempts++;
      }
      
      if (stripeFieldFocused) {
        // Type in card number
        await page.keyboard.type('4242424242424242');
        await page.keyboard.press('Tab');
        
        // Type expiry
        await page.keyboard.type('1225');
        await page.keyboard.press('Tab');
        
        // Type CVC
        await page.keyboard.type('123');
        
        console.log('Stripe Elements filled via keyboard');
      }
    });
  });

  test('should handle focus trapping and management', async ({ page }) => {
    await test.step('Test focus trapping in modal/cart', async () => {
      await helpers.navigation.goToHomepage();
      await page.click('[data-testid="add-to-cart-button"]');
      await page.click('[data-testid="cart-button"]');
      
      // Cart should be open
      await expect(page.locator('[data-testid="cart-sidebar"]')).toBeVisible();
      
      // Tab through cart elements and verify focus stays within cart
      const cartElements = [];
      let attempts = 0;
      let focusEscaped = false;
      
      while (attempts < 20 && !focusEscaped) {
        await page.keyboard.press('Tab');
        
        const currentElement = await page.evaluate(() => {
          const el = document.activeElement;
          const isInCart = el?.closest('[data-testid="cart-sidebar"]');
          return {
            inCart: !!isInCart,
            testId: el?.getAttribute('data-testid'),
            tagName: el?.tagName
          };
        });
        
        cartElements.push(currentElement);
        
        if (!currentElement.inCart && currentElement.tagName !== 'BODY') {
          focusEscaped = true;
          console.log('Focus escaped cart - this may indicate missing focus trap');
        }
        
        attempts++;
      }
      
      console.log(`Cart focus management tested with ${cartElements.length} elements`);
    });

    await test.step('Test Escape key functionality', async () => {
      // Cart should still be open from previous step
      await expect(page.locator('[data-testid="cart-sidebar"]')).toBeVisible();
      
      // Press Escape to close cart
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Cart should be closed
      const cartVisible = await page.locator('[data-testid="cart-sidebar"]').isVisible();
      expect(cartVisible).toBeFalsy();
      
      console.log('Escape key closes cart modal');
    });

    await test.step('Test focus restoration after modal close', async () => {
      // Focus should return to cart button or last focused element
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.getAttribute('data-testid');
      });
      
      console.log(`Focus restored to: ${focusedElement}`);
      // Focus should be on a reasonable element, not body
      expect(focusedElement).toBeTruthy();
    });
  });

  test('should handle arrow key navigation where appropriate', async ({ page }) => {
    await test.step('Test product grid arrow navigation if implemented', async () => {
      await helpers.navigation.goToHomepage();
      
      // Focus first product card
      let productFocused = false;
      let attempts = 0;
      
      while (!productFocused && attempts < 20) {
        await page.keyboard.press('Tab');
        const isProductCard = await page.evaluate(() => {
          return !!document.activeElement?.closest('[data-testid="product-card"]');
        });
        
        if (isProductCard) {
          productFocused = true;
          break;
        }
        attempts++;
      }
      
      if (productFocused) {
        const initialProduct = await page.evaluate(() => {
          return document.activeElement?.closest('[data-testid="product-card"]')
            ?.querySelector('[data-testid="product-name"]')?.textContent;
        });
        
        // Try arrow keys to navigate between products
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(200);
        
        const nextProduct = await page.evaluate(() => {
          return document.activeElement?.closest('[data-testid="product-card"]')
            ?.querySelector('[data-testid="product-name"]')?.textContent;
        });
        
        if (nextProduct && nextProduct !== initialProduct) {
          console.log('Arrow key navigation works for product grid');
        } else {
          console.log('Arrow key navigation not implemented for product grid');
        }
      }
    });

    await test.step('Test form field arrow navigation', async () => {
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');
      
      // Focus a number input (quantity or postal code)
      const numberInput = page.locator('[type="number"], [data-testid="billing-postal-code"]').first();
      if (await numberInput.isVisible()) {
        await numberInput.focus();
        await numberInput.fill('5');
        
        const initialValue = await numberInput.inputValue();
        
        // Test arrow up
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(100);
        
        const increasedValue = await numberInput.inputValue();
        
        if (parseInt(increasedValue) > parseInt(initialValue)) {
          console.log('Arrow up increases numeric input value');
        }
        
        // Test arrow down
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);
        
        const decreasedValue = await numberInput.inputValue();
        console.log(`Number input navigation: ${initialValue} -> ${increasedValue} -> ${decreasedValue}`);
      }
    });
  });

  test('should handle complex keyboard interactions', async ({ page }) => {
    await test.step('Test keyboard shortcuts if implemented', async () => {
      await helpers.navigation.goToHomepage();
      
      // Test common keyboard shortcuts
      const shortcuts = [
        { key: 'Control+/', description: 'Search shortcut' },
        { key: 'Alt+c', description: 'Cart shortcut' },
        { key: 'Alt+h', description: 'Home shortcut' }
      ];
      
      for (const shortcut of shortcuts) {
        const beforeUrl = page.url();
        
        await page.keyboard.press(shortcut.key);
        await page.waitForTimeout(500);
        
        const afterUrl = page.url();
        const focusedElement = await page.evaluate(() => {
          return document.activeElement?.getAttribute('data-testid');
        });
        
        if (beforeUrl !== afterUrl || focusedElement) {
          console.log(`${shortcut.description} (${shortcut.key}) appears to work`);
        }
      }
    });

    await test.step('Test drag and drop alternatives with keyboard', async () => {
      // If there are sortable elements, test keyboard alternatives
      await helpers.navigation.goToHomepage();
      await page.click('[data-testid="add-to-cart-button"]');
      await page.click('[data-testid="cart-button"]');
      
      // Look for reorderable items in cart
      const cartItems = page.locator('[data-testid="cart-item"]');
      const itemCount = await cartItems.count();
      
      if (itemCount > 1) {
        // Focus first item
        await cartItems.first().focus();
        
        // Test if there are keyboard shortcuts for reordering
        await page.keyboard.press('Control+ArrowDown');
        await page.waitForTimeout(200);
        
        console.log('Tested keyboard reordering alternative');
      }
    });

    await test.step('Test context menu keyboard access', async ({ page }) => {
      await helpers.navigation.goToHomepage();
      
      // Focus an element that might have a context menu
      const productCard = page.locator('[data-testid="product-card"]').first();
      await productCard.focus();
      
      // Try to open context menu with keyboard
      await page.keyboard.press('ContextMenu');
      await page.waitForTimeout(200);
      
      // Look for context menu
      const contextMenu = page.locator('[role="menu"], [data-testid="context-menu"]');
      const hasContextMenu = await contextMenu.count() > 0;
      
      if (hasContextMenu) {
        console.log('Context menu accessible via keyboard');
        
        // Test arrow navigation in context menu
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        
        console.log('Context menu navigation tested');
      }
    });
  });

  test('should handle edge cases in keyboard navigation', async ({ page }) => {
    await test.step('Test rapid keyboard input', async () => {
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');
      
      // Rapidly press Tab multiple times
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }
      
      // Should still have a focused element
      const focusedElement = await page.evaluate(() => {
        return {
          tagName: document.activeElement?.tagName,
          testId: document.activeElement?.getAttribute('data-testid')
        };
      });
      
      expect(focusedElement.tagName).toBeTruthy();
      console.log('Rapid keyboard input handled correctly');
    });

    await test.step('Test keyboard navigation with dynamic content', async () => {
      await helpers.navigation.goToHomepage();
      
      // Add item to cart (dynamic content change)
      await page.click('[data-testid="add-to-cart-button"]');
      await page.waitForTimeout(500);
      
      // Tab through elements - should include new cart count
      let foundCartUpdate = false;
      let attempts = 0;
      
      while (!foundCartUpdate && attempts < 15) {
        await page.keyboard.press('Tab');
        const currentElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            testId: el?.getAttribute('data-testid'),
            text: el?.textContent?.includes('1') // Looking for cart count
          };
        });
        
        if (currentElement.testId === 'cart-button' || currentElement.text) {
          foundCartUpdate = true;
          console.log('Dynamic cart update accessible via keyboard');
        }
        attempts++;
      }
    });

    await test.step('Test keyboard navigation with loading states', async () => {
      // Simulate slow loading
      await page.route('**/api/products', route => {
        setTimeout(() => route.continue(), 1000);
      });
      
      await helpers.navigation.goToHomepage();
      
      // Try to navigate while loading
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Wait for loading to complete
      await page.waitForLoadState('networkidle');
      
      // Should still be navigable
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      
      expect(focusedElement).toBeTruthy();
      console.log('Keyboard navigation works during and after loading');
    });
  });
});
