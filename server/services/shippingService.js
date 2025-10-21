// server/services/shippingService.js
// Handles shipping calculations for multiple products with different dimensions

import axios from 'axios';
import { ProductService } from './productService.js';

export class ShippingService {
  /**
   * Calculate shipping rates for cart items
   * @param {Array} items - Cart items [{id, quantity}, ...]
   * @param {string} destinationPostcode - Customer's postcode
   * @returns {Promise<Object>} Shipping options and rates
   */
  static async calculateShipping(items, destinationPostcode) {
    try {
      // 1. Fetch product dimensions from database
      const productIds = items.map(item => item.id);
      const products = await ProductService.getByIds(productIds);
      
      // 2. Calculate total weight (with packaging)
      const totalWeight = this.calculateTotalWeight(items, products);
      
      // 3. Calculate package dimensions (virtual box fitting all items + packaging)
      const packageDimensions = this.calculatePackageDimensions(items, products);
      
      // 4. Call NZ Post API
      const rates = await this.fetchNZPostRates({
        weight: totalWeight,
        dimensions: packageDimensions,
        postcodeFrom: process.env.NZPOST_SOURCE_POSTCODE || '0110',
        postcodeTo: destinationPostcode
      });
      
      return rates;
    } catch (error) {
      console.error('Shipping calculation error:', error);
      throw new Error('Failed to calculate shipping');
    }
  }
  
  /**
   * Calculate total weight including packaging
   * IMPORTANT: Products store CANDLE weight only
   * This adds packaging automatically: +50g for box + bubble wrap
   * 
   * Example: Dragon (150g) + 2× Rose (40g) + packaging (50g) = 280g
   */
  static calculateTotalWeight(items, products) {
    // Packaging weight: box + bubble wrap/padding
    const PACKAGING_WEIGHT_KG = parseFloat(process.env.PACKAGING_WEIGHT_KG || '0.05'); // 50g default
    
    const itemsWeight = items.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      if (!product || !product.weight_kg) {
        console.warn(`Product ${item.id} missing weight, using default 0.1kg`);
        return total + (0.1 * item.quantity);
      }
      return total + (product.weight_kg * item.quantity);
    }, 0);
    
    // Add packaging weight once (not per item)
    return itemsWeight + PACKAGING_WEIGHT_KG;
  }
  
  /**
   * Calculate virtual box dimensions that fits all items + PACKAGING
   * 
   * IMPORTANT: Product dimensions in DB are for the CANDLE only.
   * This function adds padding for box walls and cushioning material.
   * 
   * Packaging buffers:
   * - 20mm added to each dimension for box walls + bubble wrap (40mm total)
   * - Protects delicate/unique shaped candles during shipping
   * - Adjustable via environment variable PADDING_PER_SIDE_MM
   */
  static calculatePackageDimensions(items, products) {
    // Padding per side: box wall (5mm) + bubble wrap (15mm) = 20mm default
    const PADDING_PER_SIDE_MM = parseInt(process.env.PADDING_PER_SIDE_MM || '20');
    const TOTAL_PADDING_MM = PADDING_PER_SIDE_MM * 2; // Both sides
    
    // Get all item dimensions with quantities
    const allItems = [];
    items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return;
      
      // Add each item separately (for quantity > 1)
      for (let i = 0; i < item.quantity; i++) {
        allItems.push({
          // These are the CANDLE dimensions from database
          length: product.length_mm || 80,
          width: product.width_mm || 80,
          height: product.height_mm || 100,
          title: product.title // For debugging
        });
      }
    });
    
    if (allItems.length === 0) {
      // Fallback dimensions if no products found
      console.warn('No products found, using default package dimensions');
      return { 
        length: 150 + TOTAL_PADDING_MM, 
        width: 100 + TOTAL_PADDING_MM, 
        height: 100 + TOTAL_PADDING_MM 
      };
    }
    
    // Simple packing: arrange items side-by-side
    // More sophisticated algorithms possible in future (3D bin packing)
    // For delicate candles, side-by-side is safest
    const totalLength = allItems.reduce((sum, item) => sum + item.length, 0);
    const maxWidth = Math.max(...allItems.map(item => item.width));
    const maxHeight = Math.max(...allItems.map(item => item.height));
    
    // Add packaging padding to final box dimensions
    const packagedDimensions = {
      length: totalLength + TOTAL_PADDING_MM,
      width: maxWidth + TOTAL_PADDING_MM,
      height: maxHeight + TOTAL_PADDING_MM
    };
    
    // Log for debugging (helpful during development)
    console.log('Package calculation:', {
      items: allItems.map(i => i.title),
      candle_dimensions: { totalLength, maxWidth, maxHeight },
      with_packaging: packagedDimensions,
      padding_added: `${TOTAL_PADDING_MM}mm per dimension`
    });
    
    return packagedDimensions;
  }
  
  /**
   * Fetch rates from NZ Post Rate Finder API
   */
  static async fetchNZPostRates({ weight, dimensions, postcodeFrom, postcodeTo }) {
    const apiKey = process.env.NZPOST_API_KEY;
    const apiUrl = process.env.NZPOST_API_URL || 'https://api.nzpost.co.nz/ratefinder';
    
    // If no API key, use fallback rates immediately
    if (!apiKey || apiKey === 'test_key_placeholder') {
      console.log('No NZ Post API key configured, using fallback rates');
      return this.getFallbackRates(postcodeTo);
    }
    
    try {
      const response = await axios.get(`${apiUrl}/rate.json`, {
        params: {
          api_key: apiKey,
          weight: weight,
          length: dimensions.length,
          width: dimensions.width,
          thickness: dimensions.width, // NZ Post API uses 'thickness' instead of 'width'
          height: dimensions.height,
          postcode_src: postcodeFrom,
          postcode_dest: postcodeTo,
          format: 'json'
        },
        timeout: 5000
      });
      
      if (response.data.status === 'success') {
        return this.formatNZPostResponse(response.data);
      } else {
        console.error('NZ Post API returned failure status:', response.data);
        throw new Error('NZ Post API returned failure status');
      }
    } catch (error) {
      console.error('NZ Post API error:', error.message);
      // Return fallback rates on any error
      return this.getFallbackRates(postcodeTo);
    }
  }
  
  /**
   * Format NZ Post API response to our standard format
   */
  static formatNZPostResponse(nzPostData) {
    const isRural = nzPostData.products.some(p => 
      p.description?.toLowerCase().includes('rural')
    );
    
    const options = nzPostData.products.map((product, index) => ({
      id: product.code,
      service: product.service,
      description: product.description || product.service_group_description,
      cost: parseFloat(product.cost),
      estimatedDays: this.getEstimatedDays(product.speed_description),
      recommended: index === 0 // First option is usually best value
    }));
    
    return {
      status: 'success',
      isRural: isRural,
      options: options
    };
  }
  
  /**
   * Convert NZ Post speed description to user-friendly text
   */
  static getEstimatedDays(speedDescription) {
    const speedMap = {
      'Next Working Day': '1 business day',
      'parcel_post_tracked': '3-5 business days',
      'parcel_post_tracked_zonal': '1-2 business days',
      'courier': 'Same/next business day',
      'express': 'Overnight'
    };
    
    return speedMap[speedDescription] || '3-5 business days';
  }
  
  /**
   * Fallback rates when API unavailable
   * Based on postcode ranges (urban vs rural approximation)
   */
  static getFallbackRates(postcode) {
    // Simple rural detection: postcodes starting with certain digits
    // This is approximate - proper detection requires NZ Post API
    const ruralPrefixes = ['7', '8', '9'];
    const isLikelyRural = ruralPrefixes.some(prefix => 
      postcode.startsWith(prefix)
    );
    
    const baseRate = isLikelyRural ? 12.00 : 8.00;
    
    console.log(`Using fallback rates: ${isLikelyRural ? 'Rural' : 'Urban'} - $${baseRate}`);
    
    return {
      status: 'success',
      isRural: isLikelyRural,
      isFallback: true, // Flag that these are fallback rates
      options: [
        {
          id: 'FALLBACK_STANDARD',
          service: 'standard',
          description: 'Standard Delivery (Estimated)',
          cost: baseRate,
          estimatedDays: '3-5 business days',
          recommended: true
        }
      ]
    };
  }
}
