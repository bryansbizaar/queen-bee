// server/routes/shipping.routes.js
import express from 'express';
import { ShippingService } from '../services/shippingService.js';

const router = express.Router();

/**
 * POST /api/shipping/calculate
 * Calculate shipping rates for cart items
 * 
 * Body: {
 *   items: [{ id: number, quantity: number }],
 *   postcode: string (4 digits)
 * }
 */
router.post('/calculate', async (req, res) => {
  try {
    const { items, postcode } = req.body;
    
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        status: 'failure',
        error: 'Items array required',
        message: 'Please provide cart items to calculate shipping'
      });
    }
    
    if (!postcode) {
      return res.status(400).json({ 
        status: 'failure',
        error: 'Postcode required',
        message: 'Please provide a delivery postcode'
      });
    }
    
    // Validate postcode format (4 digits)
    if (!/^\d{4}$/.test(postcode)) {
      return res.status(400).json({ 
        status: 'failure',
        error: 'Invalid postcode format',
        message: 'Postcode must be 4 digits (e.g., 6011)'
      });
    }
    
    // Validate items structure
    const invalidItems = items.filter(item => 
      !item.id || !Number.isInteger(item.id) ||
      !item.quantity || !Number.isInteger(item.quantity) || item.quantity < 1
    );
    
    if (invalidItems.length > 0) {
      return res.status(400).json({
        status: 'failure',
        error: 'Invalid items format',
        message: 'Each item must have id (integer) and quantity (positive integer)'
      });
    }
    
    // Calculate shipping
    const rates = await ShippingService.calculateShipping(items, postcode);
    
    res.json(rates);
    
  } catch (error) {
    console.error('Shipping calculation error:', error);
    res.status(500).json({ 
      status: 'failure',
      error: 'Failed to calculate shipping',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/shipping/test
 * Test endpoint to verify shipping service is working
 */
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Shipping API is operational',
    config: {
      hasApiKey: !!process.env.NZPOST_API_KEY && process.env.NZPOST_API_KEY !== 'test_key_placeholder',
      sourcePostcode: process.env.NZPOST_SOURCE_POSTCODE || '0110',
      packagingWeight: process.env.PACKAGING_WEIGHT_KG || '0.05',
      paddingPerSide: process.env.PADDING_PER_SIDE_MM || '20'
    }
  });
});

export default router;
