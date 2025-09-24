// Flexible test matchers that handle enhanced accessibility features
// client/src/tests/setup/customMatchers.js

import { expect } from 'vitest';

// Custom matcher for alt text that handles enhanced accessibility
expect.extend({
  toHaveAccessibleAltText(received, expectedText) {
    const pass = received.getAttribute('alt')?.toLowerCase().includes(expectedText.toLowerCase());
    
    if (pass) {
      return {
        message: () => `expected alt text not to include "${expectedText}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected alt text to include "${expectedText}", but received "${received.getAttribute('alt')}"`,
        pass: false,
      };
    }
  },

  // Custom matcher for product images that may have enhanced descriptions
  toHaveProductImageAlt(received, productName) {
    const altText = received.getAttribute('alt');
    const hasProductName = altText?.toLowerCase().includes(productName.toLowerCase());
    const hasAccessibleDescription = altText?.toLowerCase().includes('candle') || 
                                   altText?.toLowerCase().includes('product');
    
    if (hasProductName) {
      return {
        message: () => `expected alt text not to include product name "${productName}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected alt text to include product name "${productName}", but received "${altText}"`,
        pass: false,
      };
    }
  },

  // Flexible price matcher that handles different formats
  toHaveFormattedPrice(received, priceInCents) {
    const expectedPrice = `$${(priceInCents / 100).toFixed(2)}`;
    const text = received.textContent;
    const pass = text.includes(expectedPrice);
    
    if (pass) {
      return {
        message: () => `expected not to display price "${expectedPrice}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected to display price "${expectedPrice}", but received "${text}"`,
        pass: false,
      };
    }
  }
});

// Export custom matchers for easy importing
export const customMatchers = {
  toHaveAccessibleAltText: expect.toHaveAccessibleAltText,
  toHaveProductImageAlt: expect.toHaveProductImageAlt,
  toHaveFormattedPrice: expect.toHaveFormattedPrice
};

export default customMatchers;
