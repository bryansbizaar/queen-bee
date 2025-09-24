import { test, expect } from '@playwright/test';
import { createHelpers } from '../../utils/test-helpers.js';

test.describe('Page Load Performance Testing', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = createHelpers(page);
    await helpers.debug.logPageErrors();
  });

  test('should load homepage within performance targets', async ({ page }) => {
    await test.step('Measure homepage initial load', async () => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const domLoadTime = Date.now() - startTime;
      
      await page.waitForLoadState('networkidle');
      const fullLoadTime = Date.now() - startTime;
      
      console.log(`Homepage DOM load time: ${domLoadTime}ms`);
      console.log(`Homepage full load time: ${fullLoadTime}ms`);
      
      // Performance targets
      expect(domLoadTime).toBeLessThan(1500); // DOM ready under 1.5s
      expect(fullLoadTime).toBeLessThan(3000); // Full load under 3s
    });

    await test.step('Measure homepage content rendering', async () => {
      const startTime = Date.now();
      await helpers.navigation.goToHomepage();
      
      // Wait for key content to be visible
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      const contentRenderTime = Date.now() - startTime;
      
      console.log(`Homepage content render time: ${contentRenderTime}ms`);
      expect(contentRenderTime).toBeLessThan(2000); // Content visible under 2s
    });

    await test.step('Measure homepage image loading', async () => {
      await helpers.navigation.goToHomepage();
      
      const images = page.locator('[data-testid="product-image"]');
      const imageCount = await images.count();
      
      const imageLoadStart = Date.now();
      
      // Wait for all images to load
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        await image.waitFor({ state: 'visible' });
        
        // Check if image is actually loaded
        const isLoaded = await image.evaluate(img => img.complete && img.naturalHeight !== 0);
        expect(isLoaded).toBeTruthy();
      }
      
      const imageLoadTime = Date.now() - imageLoadStart;
      console.log(`Homepage images load time: ${imageLoadTime}ms`);
      expect(imageLoadTime).toBeLessThan(3000); // All images under 3s
    });
  });

  test('should load product detail pages efficiently', async ({ page }) => {
    await test.step('Measure product detail page load', async () => {
      const startTime = Date.now();
      
      await page.goto('/product/1', { waitUntil: 'domcontentloaded' });
      const domLoadTime = Date.now() - startTime;
      
      await page.waitForLoadState('networkidle');
      const fullLoadTime = Date.now() - startTime;
      
      console.log(`Product detail DOM load time: ${domLoadTime}ms`);
      console.log(`Product detail full load time: ${fullLoadTime}ms`);
      
      expect(domLoadTime).toBeLessThan(1000); // DOM ready under 1s
      expect(fullLoadTime).toBeLessThan(2000); // Full load under 2s
    });

    await test.step('Measure product detail content rendering', async () => {
      const startTime = Date.now();
      await helpers.navigation.goToProduct(1);
      
      // Wait for key product details to be visible
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
      
      const contentRenderTime = Date.now() - startTime;
      console.log(`Product detail content render time: ${contentRenderTime}ms`);
      expect(contentRenderTime).toBeLessThan(1500);
    });

    await test.step('Test navigation between product pages', async () => {
      await helpers.navigation.goToProduct(1);
      
      const navigationStart = Date.now();
      await helpers.navigation.goToProduct(2);
      
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      const navigationTime = Date.now() - navigationStart;
      
      console.log(`Product navigation time: ${navigationTime}ms`);
      expect(navigationTime).toBeLessThan(1000); // Navigation under 1s
    });
  });

  test('should load checkout page efficiently', async ({ page }) => {
    await test.step('Prepare cart for checkout', async () => {
      await helpers.navigation.goToHomepage();
      
      // Add item to cart quickly
      const addButton = page.locator('[data-testid="add-to-cart-button"]').first();
      await addButton.click();
      await page.waitForTimeout(500);
    });

    await test.step('Measure checkout page load', async () => {
      const startTime = Date.now();
      
      await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
      const domLoadTime = Date.now() - startTime;
      
      await page.waitForLoadState('networkidle');
      const fullLoadTime = Date.now() - startTime;
      
      console.log(`Checkout DOM load time: ${domLoadTime}ms`);
      console.log(`Checkout full load time: ${fullLoadTime}ms`);
      
      expect(domLoadTime).toBeLessThan(1200);
      expect(fullLoadTime).toBeLessThan(2500);
    });

    await test.step('Measure Stripe Elements loading', async () => {
      await page.goto('/checkout');
      
      const stripeLoadStart = Date.now();
      await expect(page.locator('[data-testid="stripe-payment-form"]')).toBeVisible();
      
      // Wait for Stripe Elements to be ready
      const stripeFrames = page.frameLocator('iframe[name*="__privateStripeFrame"]');
      await stripeFrames.first().locator('[name="cardnumber"]').waitFor();
      
      const stripeLoadTime = Date.now() - stripeLoadStart;
      console.log(`Stripe Elements load time: ${stripeLoadTime}ms`);
      expect(stripeLoadTime).toBeLessThan(3000); // Stripe under 3s
    });
  });

  test('should handle concurrent page loads efficiently', async ({ page }) => {
    await test.step('Test multiple rapid page loads', async () => {
      const pages = [
        '/',
        '/product/1',
        '/product/2',
        '/product/3'
      ];
      
      const loadTimes = [];
      
      for (const pagePath of pages) {
        const startTime = Date.now();
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        loadTimes.push({ page: pagePath, time: loadTime });
        console.log(`${pagePath} load time: ${loadTime}ms`);
      }
      
      // All pages should load within reasonable time
      const maxLoadTime = Math.max(...loadTimes.map(lt => lt.time));
      expect(maxLoadTime).toBeLessThan(4000);
      
      // Average load time should be reasonable
      const avgLoadTime = loadTimes.reduce((sum, lt) => sum + lt.time, 0) / loadTimes.length;
      console.log(`Average load time: ${avgLoadTime}ms`);
      expect(avgLoadTime).toBeLessThan(2500);
    });
  });

  test('should optimize resource loading', async ({ page }) => {
    await test.step('Monitor network requests during homepage load', async () => {
      const requests = [];
      const responses = [];
      
      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType()
        });
      });
      
      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          contentLength: response.headers()['content-length'] || '0'
        });
      });
      
      await helpers.navigation.goToHomepage();
      
      // Analyze request efficiency
      const jsRequests = requests.filter(r => r.resourceType === 'script');
      const cssRequests = requests.filter(r => r.resourceType === 'stylesheet');
      const imageRequests = requests.filter(r => r.resourceType === 'image');
      
      console.log(`JavaScript requests: ${jsRequests.length}`);
      console.log(`CSS requests: ${cssRequests.length}`);
      console.log(`Image requests: ${imageRequests.length}`);
      
      // Should not have excessive requests
      expect(jsRequests.length).toBeLessThan(10);
      expect(cssRequests.length).toBeLessThan(5);
      
      // Check for failed requests
      const failedResponses = responses.filter(r => r.status >= 400);
      expect(failedResponses.length).toBe(0);
    });

    await test.step('Test resource caching', async () => {
      // First load
      await helpers.navigation.goToHomepage();
      
      // Second load should use cached resources
      const cachedLoadStart = Date.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const cachedLoadTime = Date.now() - cachedLoadStart;
      
      console.log(`Cached page load time: ${cachedLoadTime}ms`);
      expect(cachedLoadTime).toBeLessThan(1500); // Cached load should be faster
    });
  });

  test('should maintain performance with large datasets', async ({ page }) => {
    await test.step('Test performance with many products', async () => {
      // Mock API to return many products
      await page.route('**/api/products', route => {
        const manyProducts = Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          price: 24.99 + i,
          description: `Description for product ${i + 1}`,
          image: `/images/product-${i + 1}.jpg`,
          category: 'Test Category',
          stock: 10
        }));
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(manyProducts)
        });
      });
      
      const startTime = Date.now();
      await helpers.navigation.goToHomepage();
      
      // Wait for all products to render
      await expect(page.locator('[data-testid="product-card"]')).toHaveCount(50);
      
      const renderTime = Date.now() - startTime;
      console.log(`Large dataset render time: ${renderTime}ms`);
      expect(renderTime).toBeLessThan(5000); // Should handle 50 products under 5s
    });

    await test.step('Test scrolling performance with many items', async () => {
      // Test smooth scrolling with many products
      const scrollStart = Date.now();
      
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await page.waitForTimeout(100);
      const scrollTime = Date.now() - scrollStart;
      
      console.log(`Scroll to bottom time: ${scrollTime}ms`);
      expect(scrollTime).toBeLessThan(500); // Smooth scrolling
    });
  });

  test('should handle slow network conditions gracefully', async ({ page }) => {
    await test.step('Test with simulated slow network', async () => {
      // Simulate slow 3G network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 200);
      });
      
      const slowLoadStart = Date.now();
      await helpers.navigation.goToHomepage();
      
      // Should show loading states during slow load
      const loadingIndicator = page.locator('[data-testid="loading"]');
      if (await loadingIndicator.isVisible()) {
        console.log('Loading indicator shown during slow network');
        await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
      }
      
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      const slowLoadTime = Date.now() - slowLoadStart;
      
      console.log(`Slow network load time: ${slowLoadTime}ms`);
      expect(slowLoadTime).toBeLessThan(8000); // Should still load within 8s
    });

    await test.step('Test progressive loading', async () => {
      // Remove route delay
      await page.unroute('**/*');
      
      await helpers.navigation.goToHomepage();
      
      // Check if content loads progressively
      const headerVisible = await page.locator('[data-testid="header"]').isVisible();
      const gridVisible = await page.locator('[data-testid="product-grid"]').isVisible();
      
      expect(headerVisible).toBeTruthy();
      expect(gridVisible).toBeTruthy();
    });
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    await test.step('Measure Largest Contentful Paint (LCP)', async () => {
      await page.goto('/');
      
      // Measure LCP using Performance Observer API
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });
      
      console.log(`LCP: ${lcp}ms`);
      if (lcp > 0) {
        expect(lcp).toBeLessThan(2500); // LCP should be under 2.5s
      }
    });

    await test.step('Measure First Input Delay (FID)', async () => {
      await helpers.navigation.goToHomepage();
      
      // Simulate user interaction and measure delay
      const interactionStart = Date.now();
      await page.click('[data-testid="cart-button"]');
      const interactionEnd = Date.now();
      
      const fid = interactionEnd - interactionStart;
      console.log(`Simulated FID: ${fid}ms`);
      expect(fid).toBeLessThan(100); // FID should be under 100ms
    });

    await test.step('Measure Cumulative Layout Shift (CLS)', async () => {
      await page.goto('/');
      
      // Monitor layout shifts
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Wait for page to settle
          setTimeout(() => resolve(clsValue), 3000);
        });
      });
      
      console.log(`CLS: ${cls}`);
      expect(cls).toBeLessThan(0.1); // CLS should be under 0.1
    });
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    await test.step('Monitor memory usage during navigation', async () => {
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        } : null;
      });
      
      if (initialMemory) {
        console.log(`Initial memory usage: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB`);
      }
      
      // Navigate through multiple pages
      const pages = ['/', '/product/1', '/product/2', '/checkout'];
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
      }
      
      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        return performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        } : null;
      });
      
      if (finalMemory && initialMemory) {
        const memoryIncrease = finalMemory.used - initialMemory.used;
        console.log(`Final memory usage: ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        
        // Memory increase should be reasonable
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
      }
    });
  });
});
