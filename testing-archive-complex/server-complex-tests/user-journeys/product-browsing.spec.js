import { test, expect } from '@playwright/test';
import { createHelpers } from '../../utils/test-helpers.js';
import testData from '../../fixtures/test-data.json';

test.describe('Product Browsing & Navigation E2E', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = createHelpers(page);
    await helpers.debug.logPageErrors();
    await helpers.navigation.goToHomepage();
  });

  test('should display products on homepage', async ({ page }) => {
    await test.step('Verify homepage loads with product grid', async () => {
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-card"]')).toHaveCount(testData.products.length);
    });

    await test.step('Verify each product card displays correctly', async () => {
      for (const product of testData.products) {
        const productCard = page.locator('[data-testid="product-card"]')
          .filter({ hasText: product.name });
        
        await expect(productCard).toBeVisible();
        await expect(productCard.locator('[data-testid="product-name"]')).toContainText(product.name);
        await expect(productCard.locator('[data-testid="product-price"]')).toContainText(`$${product.price}`);
        await expect(productCard.locator('[data-testid="product-image"]')).toBeVisible();
        await expect(productCard.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
      }
    });

    await test.step('Verify product categories are displayed', async () => {
      const categories = [...new Set(testData.products.map(p => p.category))];
      for (const category of categories) {
        await expect(page.locator(`text=${category}`)).toBeVisible();
      }
    });
  });

  test('should navigate to product detail pages', async ({ page }) => {
    await test.step('Click on first product card', async () => {
      const firstProduct = testData.products[0];
      const productCard = page.locator('[data-testid="product-card"]')
        .filter({ hasText: firstProduct.name });
      
      await productCard.click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify product detail page loads', async () => {
      const firstProduct = testData.products[0];
      await expect(page).toHaveURL(`/product/${firstProduct.id}`);
      
      // Verify product details are displayed
      await expect(page.locator('[data-testid="product-title"]')).toContainText(firstProduct.name);
      await expect(page.locator('[data-testid="product-price"]')).toContainText(`$${firstProduct.price}`);
      await expect(page.locator('[data-testid="product-description"]')).toContainText(firstProduct.description);
      await expect(page.locator('[data-testid="product-image"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="quantity-input"]')).toBeVisible();
    });

    await test.step('Verify stock information is displayed', async () => {
      const firstProduct = testData.products[0];
      await expect(page.locator('[data-testid="stock-info"]')).toContainText(`${firstProduct.stock} in stock`);
    });
  });

  test('should handle browser navigation', async ({ page }) => {
    const firstProduct = testData.products[0];
    const secondProduct = testData.products[1];

    await test.step('Navigate to product detail page', async () => {
      await helpers.navigation.goToProduct(firstProduct.id);
      await expect(page).toHaveURL(`/product/${firstProduct.id}`);
    });

    await test.step('Navigate to another product', async () => {
      await helpers.navigation.goToProduct(secondProduct.id);
      await expect(page).toHaveURL(`/product/${secondProduct.id}`);
      await expect(page.locator('[data-testid="product-title"]')).toContainText(secondProduct.name);
    });

    await test.step('Use browser back button', async () => {
      await page.goBack();
      await expect(page).toHaveURL(`/product/${firstProduct.id}`);
      await expect(page.locator('[data-testid="product-title"]')).toContainText(firstProduct.name);
    });

    await test.step('Use browser forward button', async () => {
      await page.goForward();
      await expect(page).toHaveURL(`/product/${secondProduct.id}`);
      await expect(page.locator('[data-testid="product-title"]')).toContainText(secondProduct.name);
    });

    await test.step('Navigate back to homepage', async () => {
      await helpers.navigation.goToHomepage();
      await expect(page).toHaveURL('/');
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    });
  });

  test('should handle direct URL access to products', async ({ page }) => {
    await test.step('Access product directly via URL', async () => {
      const product = testData.products[1]; // Vanilla Bean Bliss
      await page.goto(`/product/${product.id}`);
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('[data-testid="product-title"]')).toContainText(product.name);
      await expect(page.locator('[data-testid="product-price"]')).toContainText(`$${product.price}`);
    });

    await test.step('Access invalid product ID', async () => {
      await page.goto('/product/999');
      await page.waitForLoadState('networkidle');
      
      // Should show error page or redirect to homepage
      const currentUrl = page.url();
      const hasErrorMessage = await page.locator('[data-testid="product-not-found"]').isVisible();
      
      expect(hasErrorMessage || currentUrl.endsWith('/')).toBeTruthy();
    });
  });

  test('should display and load product images correctly', async ({ page }) => {
    await test.step('Verify product images load on homepage', async () => {
      const productImages = page.locator('[data-testid="product-image"]');
      const imageCount = await productImages.count();
      
      expect(imageCount).toBe(testData.products.length);
      
      // Verify each image loads
      for (let i = 0; i < imageCount; i++) {
        const image = productImages.nth(i);
        await expect(image).toBeVisible();
        
        // Check if image has loaded by verifying naturalWidth > 0
        const isLoaded = await image.evaluate(img => img.naturalWidth > 0);
        expect(isLoaded).toBeTruthy();
      }
    });

    await test.step('Verify product image loads on detail page', async () => {
      await helpers.navigation.goToProduct(1);
      
      const productImage = page.locator('[data-testid="product-image"]');
      await expect(productImage).toBeVisible();
      
      const isLoaded = await productImage.evaluate(img => img.naturalWidth > 0);
      expect(isLoaded).toBeTruthy();
    });

    await test.step('Handle missing product images gracefully', async () => {
      // Mock a product with missing image
      await page.route('**/images/missing-image.jpg', route => {
        route.abort('failed');
      });
      
      // Product cards should still display with placeholder or alt text
      const productCards = page.locator('[data-testid="product-card"]');
      await expect(productCards.first()).toBeVisible();
    });
  });

  test('should handle product search and filtering', async ({ page }) => {
    await test.step('Search for specific product', async () => {
      // If search functionality exists
      const searchInput = page.locator('[data-testid="search-input"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Lavender');
        await page.keyboard.press('Enter');
        
        // Should show only Lavender products
        const visibleProducts = page.locator('[data-testid="product-card"]:visible');
        const count = await visibleProducts.count();
        expect(count).toBeGreaterThan(0);
        
        // All visible products should contain "Lavender"
        for (let i = 0; i < count; i++) {
          await expect(visibleProducts.nth(i)).toContainText('Lavender');
        }
      }
    });

    await test.step('Filter by category', async () => {
      // If category filtering exists
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption('Essential Oils');
        
        // Should show only Essential Oils products
        const essentialOilProducts = testData.products.filter(p => p.category === 'Essential Oils');
        const visibleProducts = page.locator('[data-testid="product-card"]:visible');
        
        await expect(visibleProducts).toHaveCount(essentialOilProducts.length);
      }
    });
  });

  test('should handle responsive navigation on different screen sizes', async ({ page }) => {
    await test.step('Test mobile navigation', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.navigation.goToHomepage();
      
      // Product grid should be responsive
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      
      // Mobile navigation menu should work
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      }
    });

    await test.step('Test tablet navigation', async () => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await helpers.navigation.goToHomepage();
      
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      
      // Navigation should be accessible
      const navigationMenu = page.locator('[data-testid="navigation-menu"]');
      await expect(navigationMenu).toBeVisible();
    });

    await test.step('Test desktop navigation', async () => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1200, height: 800 });
      await helpers.navigation.goToHomepage();
      
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      
      // Full navigation should be visible
      const navigationMenu = page.locator('[data-testid="navigation-menu"]');
      await expect(navigationMenu).toBeVisible();
    });
  });

  test('should measure page load performance', async ({ page }) => {
    await test.step('Measure homepage load time', async () => {
      const startTime = Date.now();
      await helpers.navigation.goToHomepage();
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      console.log(`Homepage load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000); // Under 3 seconds
    });

    await test.step('Measure product detail page load time', async () => {
      const startTime = Date.now();
      await helpers.navigation.goToProduct(1);
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      console.log(`Product detail load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(2000); // Under 2 seconds
    });

    await test.step('Measure image loading performance', async () => {
      await helpers.navigation.goToHomepage();
      
      const startTime = Date.now();
      await page.waitForLoadState('networkidle');
      const endTime = Date.now();
      
      const imageLoadTime = endTime - startTime;
      console.log(`Image loading time: ${imageLoadTime}ms`);
      expect(imageLoadTime).toBeLessThan(2000); // Images should load within 2 seconds
    });
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    await test.step('Handle server errors during navigation', async () => {
      // Mock server error for product API
      await page.route('**/api/products', route => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });
      
      await helpers.navigation.goToHomepage();
      
      // Should show error message or fallback UI
      const errorMessage = page.locator('[data-testid="error-message"]');
      const fallbackUI = page.locator('[data-testid="fallback-ui"]');
      
      const hasError = await errorMessage.isVisible();
      const hasFallback = await fallbackUI.isVisible();
      
      expect(hasError || hasFallback).toBeTruthy();
    });

    await test.step('Handle network timeout', async () => {
      // Mock slow network response
      await page.route('**/api/products', route => {
        setTimeout(() => route.continue(), 31000); // Longer than timeout
      });
      
      await helpers.navigation.goToHomepage();
      
      // Should handle timeout gracefully
      const timeoutMessage = page.locator('[data-testid="timeout-message"]');
      const retryButton = page.locator('[data-testid="retry-button"]');
      
      if (await timeoutMessage.isVisible()) {
        expect(await retryButton.isVisible()).toBeTruthy();
      }
    });
  });

  test('should maintain navigation state during user interactions', async ({ page }) => {
    await test.step('Navigate through multiple products', async () => {
      const products = testData.products;
      
      for (const product of products) {
        await helpers.navigation.goToProduct(product.id);
        await expect(page.locator('[data-testid="product-title"]')).toContainText(product.name);
        
        // Verify URL updates correctly
        await expect(page).toHaveURL(`/product/${product.id}`);
      }
    });

    await test.step('Verify breadcrumb navigation if present', async () => {
      await helpers.navigation.goToProduct(1);
      
      const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
      if (await breadcrumbs.isVisible()) {
        await expect(breadcrumbs).toContainText('Home');
        await expect(breadcrumbs).toContainText('Products');
        
        // Click home breadcrumb
        await breadcrumbs.locator('a:has-text("Home")').click();
        await expect(page).toHaveURL('/');
      }
    });
  });
});
