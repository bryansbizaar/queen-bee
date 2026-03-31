// server/services/shippingService.js
// Enhanced with THREE MODES: Live API, Custom Rate Tables, and Fallback
// Handles shipping calculations for multiple products with different dimensions

import { ProductService } from './productService.js';
import pkg from 'pg';
const { Pool } = pkg;

// Database pool for custom rate table queries
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'queen_bee_candles',
  user: process.env.DATABASE_USER || 'queenbee',
  password: process.env.DATABASE_PASSWORD || 'development123',
});

export class ShippingService {
  /**
   * Calculate shipping rates for cart items
   * 
   * THREE CALCULATION MODES:
   * 1. LIVE API MODE: Real NZ Post API (requires valid API key, 10k+ parcels/month)
   * 2. CUSTOM TABLE MODE: Your own rate tables (recommended for small business)
   * 3. FALLBACK MODE: Simple flat rates (emergency backup)
   * 
   * Priority: Live API > Custom Tables > Fallback
   * 
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
      
      // 4. Determine which calculation mode to use
      const calculationMode = this.determineCalculationMode();
      
      console.log(`Using ${calculationMode} mode for shipping calculation`);
      
      // 5. Calculate rates based on mode
      let rates;
      switch (calculationMode) {
        case 'LIVE_API':
          rates = await this.fetchNZPostRates({
            weight: totalWeight,
            dimensions: packageDimensions,
            postcodeFrom: process.env.NZPOST_SOURCE_POSTCODE || '0110',
            postcodeTo: destinationPostcode
          });
          break;
          
        case 'CUSTOM_TABLES':
          rates = await this.calculateFromCustomTables({
            weight: totalWeight,
            dimensions: packageDimensions,
            postcodeFrom: process.env.NZPOST_SOURCE_POSTCODE || '0110',
            postcodeTo: destinationPostcode
          });
          break;
          
        case 'FALLBACK':
        default:
          rates = this.getFallbackRates(destinationPostcode);
          break;
      }
      
      return rates;
    } catch (error) {
      console.error('Shipping calculation error:', error);
      // On any error, fall back to simple flat rates
      return this.getFallbackRates(destinationPostcode);
    }
  }
  
  /**
   * Determine which calculation mode to use based on configuration
   * Priority: Live API > Custom Tables > Fallback
   */
  static determineCalculationMode() {
    const apiKey = process.env.NZPOST_API_KEY;
    const useCustomTables = process.env.ENABLE_CUSTOM_RATE_TABLES === 'true';
    
    // Check for valid live API key
    if (apiKey && apiKey !== 'test_key_placeholder' && !useCustomTables) {
      return 'LIVE_API';
    }
    
    // Check if custom tables are enabled and available
    if (useCustomTables) {
      return 'CUSTOM_TABLES';
    }
    
    // Default to fallback
    return 'FALLBACK';
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
   * ========================================================================
   * MODE 1: LIVE NZ POST API
   * ========================================================================
   * Fetch rates from NZ Post Rate Finder API
   * Requires valid API key and 10,000+ parcels/month account
   */
  static async fetchNZPostRates({ weight, dimensions, postcodeFrom, postcodeTo }) {
    const apiKey = process.env.NZPOST_API_KEY;
    const apiUrl = process.env.NZPOST_API_URL || 'https://api.nzpost.co.nz/ratefinder';
    
    try {
      const params = new URLSearchParams({
        api_key: apiKey,
        weight: weight,
        length: dimensions.length,
        width: dimensions.width,
        thickness: dimensions.width, // NZ Post API uses 'thickness' instead of 'width'
        height: dimensions.height,
        postcode_src: postcodeFrom,
        postcode_dest: postcodeTo,
        format: 'json'
      });
      const response = await fetch(`${apiUrl}/rate.json?${params}`, {
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`NZ Post API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        return this.formatNZPostResponse(data);
      } else {
        console.error('NZ Post API returned failure status:', data);
        throw new Error('NZ Post API returned failure status');
      }
    } catch (error) {
      console.error('NZ Post API error:', error.message);
      // Fall back to custom tables if available, otherwise fallback rates
      if (process.env.ENABLE_CUSTOM_RATE_TABLES === 'true') {
        console.log('Falling back to custom rate tables');
        return this.calculateFromCustomTables({ weight, dimensions, postcodeFrom, postcodeTo });
      }
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
      calculationMode: 'LIVE_API',
      options: options
    };
  }
  
  /**
   * ========================================================================
   * MODE 2: CUSTOM RATE TABLES
   * ========================================================================
   * Calculate rates from local database tables
   * Uses your own rate data (from NZ Post contact)
   * No API dependency, full control
   */
  static async calculateFromCustomTables({ weight, dimensions, postcodeFrom, postcodeTo }) {
    try {
      // 1. Look up destination zone
      const zone = await this.lookupPostcodeZone(postcodeTo);
      
      if (!zone) {
        console.warn(`Postcode ${postcodeTo} not in zone database, using fallback`);
        return this.getFallbackRates(postcodeTo);
      }
      
      // 2. Determine zone type for rate lookup
      const zoneKey = this.getZoneKey(zone);
      
      // 3. Query rates for this zone and weight
      const query = `
        SELECT 
          service_code,
          service_name,
          price_nzd,
          estimated_days,
          zone
        FROM shipping_rates
        WHERE zone = $1
          AND min_weight_kg <= $2
          AND max_weight_kg > $2
          AND active = true
        ORDER BY price_nzd ASC
      `;
      
      const result = await pool.query(query, [zoneKey, weight]);
      
      if (result.rows.length === 0) {
        console.warn(`No rates found for zone ${zoneKey}, weight ${weight}kg`);
        return this.getFallbackRates(postcodeTo);
      }
      
      // 4. Format results
      const options = result.rows.map((row, index) => ({
        id: row.service_code,
        service: row.service_code.toLowerCase(),
        description: row.service_name,
        cost: parseFloat(row.price_nzd),
        estimatedDays: row.estimated_days,
        recommended: index === 0 // Cheapest option first
      }));
      
      return {
        status: 'success',
        isRural: zone.is_rural,
        calculationMode: 'CUSTOM_TABLES',
        zone: zoneKey,
        options: options
      };
      
    } catch (error) {
      console.error('Custom table calculation error:', error);
      return this.getFallbackRates(postcodeTo);
    }
  }
  
  /**
   * Look up postcode in zones database
   */
  static async lookupPostcodeZone(postcode) {
    try {
      const query = 'SELECT * FROM postcode_zones WHERE postcode = $1';
      const result = await pool.query(query, [postcode]);
      
      if (result.rows.length > 0) {
        return result.rows[0];
      }
      
      // If exact postcode not found, try to infer from prefix
      return this.inferZoneFromPostcode(postcode);
      
    } catch (error) {
      console.error('Zone lookup error:', error);
      return null;
    }
  }
  
  /**
   * Infer zone from postcode when not in database
   * Based on NZ postcode structure
   */
  static inferZoneFromPostcode(postcode) {
    const prefix = postcode.charAt(0);
    
    // Basic NZ postcode structure:
    // 0-4: North Island
    // 5-6: Lower North Island
    // 7-9: South Island
    
    const ruralPrefixes = ['7', '8', '9']; // Rough approximation
    const isLikelyRural = ruralPrefixes.includes(prefix);
    
    let island, zoneType;
    
    if (['0', '1', '2', '3', '4', '5', '6'].includes(prefix)) {
      island = 'north';
      zoneType = isLikelyRural ? 'rural' : 'urban';
    } else {
      island = 'south';
      zoneType = isLikelyRural ? 'rural' : 'urban';
    }
    
    console.log(`Inferred zone for ${postcode}: ${island} island, ${zoneType}`);
    
    return {
      postcode: postcode,
      island: island,
      zone_type: zoneType,
      is_rural: isLikelyRural,
      inferred: true
    };
  }
  
  /**
   * Convert zone data to zone key for rate lookup
   */
  static getZoneKey(zone) {
    // Format: {island}_{zone_type}
    // Examples: 'north_island_urban', 'south_island_rural'
    return `${zone.island}_island_${zone.zone_type}`;
  }
  
  /**
   * ========================================================================
   * MODE 3: FALLBACK RATES
   * ========================================================================
   * Simple flat rates when API unavailable and custom tables not configured
   * Based on postcode ranges (urban vs rural approximation)
   */
  static getFallbackRates(postcode) {
    // Simple rural detection: postcodes starting with certain digits
    // This is approximate - proper detection requires NZ Post API or custom tables
    const ruralPrefixes = ['7', '8', '9'];
    const isLikelyRural = ruralPrefixes.some(prefix => 
      postcode.startsWith(prefix)
    );
    
    const baseRate = isLikelyRural ? 12.00 : 8.00;
    
    console.log(`Using fallback rates: ${isLikelyRural ? 'Rural' : 'Urban'} - $${baseRate}`);
    
    return {
      status: 'success',
      isRural: isLikelyRural,
      calculationMode: 'FALLBACK',
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
}
