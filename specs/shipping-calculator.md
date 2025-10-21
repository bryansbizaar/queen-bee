# Shipping Calculator Feature Specification

**Status:** Draft  
**Author:** Development Team  
**Created:** 2025-10-22  
**Last Updated:** 2025-10-22

## Overview

Add real-time shipping calculation to the Queen Bee Candles e-commerce platform using NZ Post's Rate Finder API. This will provide customers with accurate delivery costs based on their location (city vs rural) and allow them to select from available delivery options at checkout.

## Problem Statement

Currently, the Queen Bee Candles checkout does not include shipping costs. Customers don't know:
- How much shipping will cost
- When their order will arrive
- If they're in a rural delivery area (which affects cost and delivery time)

This creates checkout abandonment risk and requires manual shipping calculation post-purchase.

## Goals

### Primary Goals
- Calculate accurate shipping costs in real-time during checkout
- Display multiple delivery options (standard, express, courier)
- Automatically detect and apply rural delivery surcharges
- Integrate seamlessly with existing Stripe payment flow

### Non-Goals (Future Enhancements)
- International shipping (NZ domestic only for v1)
- Shipping label generation
- Parcel tracking integration
- Free shipping thresholds or promotional rates

## User Stories

### Customer Stories
1. **As a customer**, I want to see shipping costs before completing payment, so I can make an informed purchase decision
2. **As a rural customer**, I want to know if I'm in a rural delivery area, so I understand why shipping costs more
3. **As a customer**, I want to choose between delivery speeds, so I can balance cost vs delivery time

### Admin Stories
4. **As a store owner**, I want shipping costs automatically calculated, so I don't need to manually invoice customers
5. **As a store owner**, I want to use my NZ Post account rates, so shipping costs match what I actually pay

## Technical Design

### Architecture Overview

```
┌─────────────────┐
│   Client        │
│  (React App)    │
└────────┬────────┘
         │
         │ 1. Address & Cart Data
         ▼
┌─────────────────┐
│   Server API    │
│  /api/shipping  │
└────────┬────────┘
         │
         │ 2. Calculate Rates
         ▼
┌─────────────────┐
│  NZ Post API    │
│  Rate Finder    │
└─────────────────┘
```

### API Integration

**NZ Post Rate Finder API (Legacy)**
- Endpoint: `api.nzpost.co.nz/ratefinder/rate.json`
- Method: GET
- Authentication: API Key (request via NZ Post)
- Documentation: https://www.nzpost.co.nz/business/developer-centre/nz-post-legacy-apis/rate-finder-api

**Why Legacy API vs Modern ShippingOptions API?**
- Legacy API: Simple GET request, no account number required initially
- Modern API: Requires active NZ Post business account, more complex auth
- Recommendation: Start with Legacy, migrate to Modern API in v2 when production-ready

### Data Models

#### Shipping Request
```javascript
{
  // From cart
  items: [
    { id: string, quantity: number }
  ],
  
  // From checkout form
  address: {
    postcode: string,      // Required: "6011"
    suburb: string,        // Optional: For display
    city: string,          // Optional: For display
  },
  
  // Calculated from products
  parcel: {
    weight: number,        // kg, sum of all items + packaging
    length: number,        // mm
    width: number,         // mm (thickness in API)
    height: number,        // mm
  }
}
```

#### Shipping Response
```javascript
{
  status: "success" | "failure",
  isRural: boolean,
  options: [
    {
      id: string,                    // "PCB5C5"
      service: string,               // "parcel_post_tracked"
      description: string,           // "ParcelPost Tracked"
      cost: number,                  // 6.00 (NZD)
      estimatedDays: string,         // "3-5 business days"
      recommended: boolean           // Highlight default option
    }
  ],
  error?: string
}
```

### Component Design

#### New Components

**1. ShippingCalculator** (`client/src/components/ShippingCalculator.jsx`)
```jsx
// Integrated into checkout flow
// Displays after address entry, before payment
<ShippingCalculator
  cartItems={cartItems}
  deliveryAddress={address}
  onShippingSelected={(option) => void}
  onError={(error) => void}
/>
```

**Features:**
- Debounced API calls (wait for user to finish typing postcode)
- Loading states during calculation
- Error handling for invalid postcodes
- Radio button selection for delivery options
- Rural delivery indicator/badge

**2. RuralDeliveryBadge** (`client/src/components/RuralDeliveryBadge.jsx`)
```jsx
// Visual indicator for rural addresses
<RuralDeliveryBadge isRural={true} />
// Shows: "🚜 Rural Delivery" with tooltip
```

#### Modified Components

**CheckoutForm** (`client/src/components/CheckoutForm.jsx`)
- Add address fields (postcode required, suburb/city optional)
- Integrate ShippingCalculator after address entry
- Pass selected shipping cost to Stripe payment intent
- Update total calculation: `subtotal + shipping = total`

**Cart** (`client/src/components/Cart.jsx`)
- Add "Shipping calculated at checkout" message
- No changes to cart logic

### API Endpoints

#### GET /api/products/:id
**Enhancement:** Add product dimensions to response
```javascript
{
  id: 1,
  name: "Dragon",
  price: 15.00,
  // NEW: Shipping dimensions (CANDLE dimensions only, packaging added by system)
  dimensions: {
    weight: 0.15,     // kg
    length: 80,       // mm
    width: 80,        // mm
    height: 115,      // mm
  }
}
```

**Why individual dimensions matter:**
Each Queen Bee product has unique dimensions:
- Dragon (150g, tall) vs Rose (40g, flat) = very different
- NZ Post charges by both weight AND size
- Accurate per-product dimensions = accurate shipping costs

#### POST /api/shipping/calculate
**New endpoint**

Request:
```javascript
{
  items: [
    { id: 1, quantity: 1 },  // Dragon: 150g, 80×80×115mm
    { id: 4, quantity: 2 }   // Rose: 40g each, 65×65×30mm
  ],
  postcode: "6011",
  sourcePostcode: "0110"  // Your business postcode (Whangarei)
}
```

**Server-side calculation logic:**
```javascript
// 1. Fetch each product with dimensions from database
const products = await ProductService.getByIds([1, 4]);

// 2. Calculate total weight
// IMPORTANT: Products store CANDLE weight only
// System adds packaging automatically
const totalWeight = items.reduce((sum, item) => {
  const product = products.find(p => p.id === item.id);
  return sum + (product.weight_kg * item.quantity);
}, 0) + 0.05; // Add 50g for box + bubble wrap
// Result: 0.15 + (0.04 * 2) + 0.05 = 0.28kg

// 3. Calculate virtual box dimensions (fits all items)
// IMPORTANT: Products store CANDLE dimensions only
// System adds +40mm per dimension for packaging
const virtualBox = calculatePackageDimensions(items, products);
// Simple algorithm: Find bounding box that fits all items
// Could arrange side-by-side, stacked, etc.
// Result: 230×100×135mm (with padding)

// 4. Call NZ Post API with combined dimensions
const rates = await nzPostAPI.getRates({
  weight: 0.28,
  length: 230,
  width: 100,
  height: 135,
  postcodeFrom: "0110",
  postcodeTo: "6011"
});
```

Response:
```javascript
{
  status: "success",
  isRural: false,
  options: [
    {
      id: "PCBXT",
      service: "parcel_post_tracked_zonal",
      description: "ParcelPost Tracked (Across Town)",
      cost: 5.50,
      estimatedDays: "1-2 business days",
      recommended: true
    },
    {
      id: "PCB5C5",
      service: "parcel_post_tracked",
      description: "ParcelPost Tracked (Standard)",
      cost: 6.00,
      estimatedDays: "3-5 business days",
      recommended: false
    }
  ]
}
```

Error Response:
```javascript
{
  status: "failure",
  error: "Invalid postcode",
  message: "Please enter a valid NZ postcode"
}
```

#### POST /api/create-payment-intent
**Enhancement:** Include shipping in payment calculation
```javascript
// Request body adds:
{
  shippingCost: 5.50,
  shippingMethod: "parcel_post_tracked_zonal"
}

// Response includes:
{
  clientSecret: "pi_xxx",
  amount: 3550  // (subtotal + shipping) * 100
}
```

### Database Changes

#### Products Table Enhancement
```sql
-- Add dimensions columns
ALTER TABLE products ADD COLUMN weight_kg DECIMAL(10,3);
ALTER TABLE products ADD COLUMN length_mm INTEGER;
ALTER TABLE products ADD COLUMN width_mm INTEGER;
ALTER TABLE products ADD COLUMN height_mm INTEGER;

-- IMPORTANT: These store CANDLE dimensions only
-- Packaging buffers added automatically by ShippingService:
--   Weight: +50g for box and bubble wrap
--   Dimensions: +40mm per dimension (20mm padding each side)

-- Backfill with ACTUAL Queen Bee product dimensions (CANDLE only)
UPDATE products SET weight_kg = 0.150, length_mm = 80, width_mm = 80, height_mm = 115 WHERE title = 'Dragon';
UPDATE products SET weight_kg = 0.160, length_mm = 45, width_mm = 45, height_mm = 155 WHERE title = 'Corn Cob';
UPDATE products SET weight_kg = 0.045, length_mm = 65, width_mm = 65, height_mm = 30 WHERE title = 'Bee and Flower';
UPDATE products SET weight_kg = 0.040, length_mm = 65, width_mm = 65, height_mm = 30 WHERE title = 'Rose';
```

#### Orders Table Enhancement
```sql
-- Add shipping details
ALTER TABLE orders ADD COLUMN shipping_cost DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN shipping_method VARCHAR(100);
ALTER TABLE orders ADD COLUMN shipping_postcode VARCHAR(10);
ALTER TABLE orders ADD COLUMN is_rural_delivery BOOLEAN DEFAULT FALSE;

-- Index for reporting
CREATE INDEX idx_orders_shipping ON orders(shipping_method, is_rural_delivery);
```

### Configuration

#### Environment Variables

**Server (.env)**
```bash
# NZ Post API Configuration
NZPOST_API_KEY=your_api_key_here
NZPOST_SOURCE_POSTCODE=0110  # Your business postcode (Whangarei)
NZPOST_API_URL=https://api.nzpost.co.nz/ratefinder

# Shipping Defaults
SHIPPING_DEFAULT_WEIGHT=0.1  # kg (if product missing weight)
SHIPPING_DEFAULT_DIMENSIONS=80,80,100  # L,W,H in mm
SHIPPING_CACHE_TTL=3600  # Cache rates for 1 hour

# Packaging Buffers (adjustable)
PACKAGING_WEIGHT_KG=0.05  # 50g for box + bubble wrap
PADDING_PER_SIDE_MM=20  # 20mm padding each side (40mm total per dimension)
```

**Client (.env)**
```bash
# No client-side shipping config needed
# All API calls go through server proxy
```

### Packaging Buffer System

**Concept:** Measure CANDLE dimensions only, system adds standardized packaging

**Benefits:**
- Consistent measurement process
- Easy to adjust packaging assumptions
- No need to guess box sizes
- Update buffers without changing product data

**Example: Dragon Candle**
```
What you measure (CANDLE):
Weight: 150g
Dimensions: 80×80×115mm

What gets sent to NZ Post (PACKAGED):
Weight: 200g (150g + 50g packaging)
Dimensions: 120×120×155mm (80+40, 80+40, 115+40)
```

**Current Buffer Settings (Conservative for Delicate Candles):**
- Weight: +50g per order (box + bubble wrap)
- Dimensions: +40mm per dimension (20mm padding each side)

**To Adjust Buffers:** Edit `server/services/shippingService.js`:
```javascript
const PADDING_PER_SIDE_MM = 20;  // Increase if using more bubble wrap
const PACKAGING_WEIGHT_KG = 0.05; // Increase if using heavier boxes
```

See `docs/guides/packaging-buffer-guide.md` for detailed visual explanation.

### Error Handling

#### Client-Side Errors
1. **Invalid Postcode**: Show inline validation, suggest format
2. **Network Timeout**: Retry with exponential backoff (3 attempts)
3. **No Rates Available**: Display error + customer service contact
4. **API Down**: Fallback to flat rate ($8 urban, $12 rural based on postcode ranges)

#### Server-Side Errors
1. **NZ Post API Error**: Log error, return fallback rates
2. **Invalid API Key**: Log critical error, alert admin, use fallback
3. **Rate Calculation Fails**: Return standard rates + warning flag
4. **Database Error**: Product dimensions missing → use defaults

### Caching Strategy

**Rate Caching**
- Cache key: `shipping:${postcode}:${weight}:${dimensions}`
- TTL: 1 hour (rates don't change frequently)
- Use Redis or in-memory cache (node-cache)
- Invalidate on product dimension updates

**Why Cache?**
- NZ Post API rate limits (avoid throttling)
- Faster checkout experience
- Reduce API costs
- Still fresh enough (rates change monthly at most)

## User Experience

### Checkout Flow

```
1. Customer adds items to cart
   └─> Cart shows: "Shipping calculated at checkout"

2. Customer clicks "Proceed to Checkout"
   └─> CheckoutForm renders

3. Customer enters email & name (existing)

4. **NEW:** Customer enters shipping address
   └─> Postcode field with validation
   └─> Suburb/City (optional, for display)
   └─> Real-time validation on blur

5. **NEW:** ShippingCalculator auto-triggers
   └─> Shows loading spinner
   └─> Displays available options
   └─> Rural badge if applicable
   └─> Default option pre-selected

6. Customer selects shipping method
   └─> Order total updates immediately
   └─> Stripe amount reflects total + shipping

7. Customer enters payment details (existing)
   └─> Completes purchase with shipping included
```

### UI/UX Specifications

#### Address Input Section
```
┌─────────────────────────────────────┐
│ Delivery Address                    │
├─────────────────────────────────────┤
│ Postcode: [____] (Required)         │
│ Suburb:   [____] (Optional)         │
│ City:     [____] (Optional)         │
└─────────────────────────────────────┘
```

#### Shipping Options Display
```
┌─────────────────────────────────────┐
│ Shipping Options                    │
├─────────────────────────────────────┤
│ ⦿ Across Town - $5.50 ⭐RECOMMENDED │
│   Next business day                 │
│                                     │
│ ○ Standard Delivery - $6.00         │
│   3-5 business days                 │
│                                     │
│ 🚜 This is a rural delivery address │
└─────────────────────────────────────┘
```

#### Order Summary
```
┌─────────────────────────────────────┐
│ Order Summary                       │
├─────────────────────────────────────┤
│ Subtotal:        $75.00             │
│ Shipping:        $5.50              │
│ ────────────────────────             │
│ Total:           $80.50 NZD         │
└─────────────────────────────────────┘
```

### Mobile Responsive
- Stack shipping options vertically
- Full-width radio buttons
- Larger touch targets (44x44px minimum)
- Collapse detailed descriptions on mobile

## Testing Strategy

### Unit Tests

**ShippingCalculator.test.jsx**
- Renders loading state
- Displays multiple shipping options
- Handles option selection
- Shows rural delivery badge
- Handles API errors gracefully
- Validates postcode format

**server/services/shippingService.test.js**
- Calculates correct parcel dimensions (with packaging buffers)
- Calls NZ Post API with correct params
- Handles rural postcode detection
- Returns formatted shipping options
- Handles API failures with fallback
- Caches rates correctly

### Integration Tests

**Checkout Workflow**
1. Add items to cart
2. Enter delivery address (urban postcode)
3. Verify shipping options appear
4. Select shipping option
5. Verify total updates
6. Complete payment
7. Verify order includes shipping details

**Rural Delivery Test**
1. Use known rural postcode
2. Verify rural badge displays
3. Verify rural rates applied
4. Complete order
5. Verify `is_rural_delivery` flag set in DB

### Manual Testing Checklist

- [ ] Test with Auckland postcode (urban): 1010
- [ ] Test with Wellington postcode (urban): 6011
- [ ] Test with Whangarei postcode (your area): 0110
- [ ] Test with known rural postcode
- [ ] Test with invalid postcode (error handling)
- [ ] Test with empty postcode (validation)
- [ ] Test mobile responsive layout
- [ ] Test with slow network (loading states)
- [ ] Test with NZ Post API unavailable (fallback)
- [ ] Verify shipping amount in Stripe dashboard
- [ ] Verify shipping details saved to database

## Security Considerations

### API Key Protection
- Store NZ Post API key in server environment variables
- Never expose API key to client-side code
- Rotate API key quarterly
- Use different keys for dev/staging/production

### Input Validation
- Sanitize postcode input (strip whitespace, validate format)
- Validate weight/dimensions are positive numbers
- Rate limit shipping calculation endpoint (10 requests/minute per IP)
- Validate cart items exist and match database

### Data Privacy
- Don't store full addresses (only postcode for shipping calculation)
- Log shipping calculations without PII
- GDPR compliance: Document data retention policy

## Performance Considerations

### Optimization Targets
- Shipping calculation: < 2 seconds
- Postcode validation: < 500ms
- Cache hit rate: > 80%
- API error rate: < 1%

### Monitoring
- Log NZ Post API response times
- Track cache hit/miss ratio
- Alert on API failures (> 5% error rate)
- Monitor shipping calculation errors

## Rollout Plan

### Phase 0: Product Dimensions Setup (Week 1)
**Goal:** Add dimensions to all ~40 products

- [ ] Add dimension columns to products table
- [ ] Measure existing 4 products (Dragon, Corn Cob, Bee and Flower, Rose)
- [ ] Create size templates for common categories
- [ ] Measure remaining ~32 products using measurement guide
- [ ] Use CSV to SQL converter tool to generate INSERT statements
- [ ] Backfill all product dimensions in database
- [ ] Verify all products have valid dimensions

**Tools Available:**
- Product Measurement Guide (see `docs/guides/product-measurement-guide.md`)
- CSV to SQL Converter Tool (see `tools/csv-to-sql-converter.html`)
- Size templates for quick data entry

**Validation:**
```sql
-- Check all products have dimensions
SELECT title, weight_kg, length_mm, width_mm, height_mm 
FROM products 
WHERE weight_kg IS NULL OR length_mm IS NULL;
-- Should return 0 rows
```

### Phase 1: Development (Week 2)
- [ ] Register for NZ Post API key (1-2 days approval)
- [ ] Create `/api/shipping/calculate` endpoint
- [ ] Implement ShippingService with multi-product support
- [ ] Build ShippingCalculator component
- [ ] Integrate into CheckoutForm
- [ ] Write unit tests

### Phase 2: Testing (Week 3)
- [ ] Internal testing with real API
- [ ] Test with different product combinations
- [ ] Verify rural detection works
- [ ] Fix bugs and edge cases
- [ ] Add error handling and fallbacks
- [ ] User acceptance testing
- [ ] Performance testing

### Phase 3: Deployment (Week 4)
- [ ] Deploy to staging environment
- [ ] Final testing with real postcodes
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Gather user feedback

### Feature Flag
```javascript
// server/config.js
const SHIPPING_CALCULATOR_ENABLED = process.env.ENABLE_SHIPPING_CALCULATOR === 'true';

// Gradual rollout
if (SHIPPING_CALCULATOR_ENABLED) {
  // Show new shipping calculator
} else {
  // Show "Shipping calculated after checkout" message
}
```

## Success Metrics

### Key Performance Indicators
- **Checkout completion rate**: Target +15% (from reducing abandonment)
- **Customer support tickets**: Target -30% (fewer shipping cost questions)
- **Average order value**: Monitor for changes (shipping cost impact)
- **Rural delivery accuracy**: Target 100% (correct surcharges applied)

### Analytics Events
```javascript
// Track shipping interactions
analytics.track('Shipping Calculated', {
  postcode: postcode,
  isRural: isRural,
  optionsReturned: options.length,
  selectedOption: selectedOption.service,
  shippingCost: selectedOption.cost
});

analytics.track('Checkout Completed', {
  // existing fields...
  shippingMethod: order.shipping_method,
  shippingCost: order.shipping_cost,
  isRuralDelivery: order.is_rural_delivery
});
```

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| NZ Post API unavailable | High | Low | Implement fallback flat rates |
| API key approval delay | Medium | Medium | Apply early, use test key for dev |
| Incorrect product dimensions | Medium | Medium | Manual audit + customer feedback loop |
| Rural postcode detection fails | High | Low | Maintain manual rural postcode list |
| Increased checkout friction | High | Low | Make postcode entry easy, show value |
| API rate limiting | Medium | Low | Implement caching + rate limit monitoring |

## Future Enhancements (V2+)

### Short Term (Next Quarter)
- Free shipping threshold ($100+ orders)
- Signature required option
- Saturday delivery option
- Real-time delivery estimates (not just "3-5 days")

### Medium Term (6-12 Months)
- International shipping (Australia first)
- Shipping insurance option
- Parcel tracking integration
- Click & Collect option
- Express courier options

### Long Term (12+ Months)
- Multiple parcel consolidation
- Subscription shipping rates
- Carbon offset option
- Smart packaging recommendations (based on dimensions)

## Documentation

### Developer Documentation
- API endpoint documentation (OpenAPI spec)
- NZ Post API integration guide
- Caching strategy documentation
- Error handling procedures

### User Documentation
- Help article: "How is shipping calculated?"
- Help article: "What is rural delivery?"
- FAQ: "Can I change shipping method after checkout?"
- FAQ: "How do I track my order?" (Future)

## Open Questions

1. **Q:** Should we show estimated delivery dates or just "3-5 business days"?
   - **A:** Start with generic ranges, add specific dates in V2 with NZ Post Tracking API

2. **Q:** How do we handle packaging materials weight?
   - **A:** Add 50g buffer to total weight calculation for box + padding

3. **Q:** Should rural customers be able to choose "standard" rates if they prefer?
   - **A:** No - NZ Post determines rural automatically, we must honor their rates

4. **Q:** What happens if someone changes their address after selecting shipping?
   - **A:** Reset shipping selection, recalculate rates, show warning message

5. **Q:** Do we need to support PO Box addresses?
   - **A:** V2 feature - PO Boxes have different restrictions and rates

## Appendix

### NZ Postcode Ranges
- **Urban examples**: 6011 (Wellington), 1010 (Auckland), 8011 (Christchurch), 0110 (Whangarei)
- **Rural examples**: Varies by region, detected via API `rural_options` response
- **Format**: 4 digits, range 0001-9999

### Product Dimension Reference (CANDLE dimensions - packaging added by system)

**ACTUAL Queen Bee Products:**

| Product | Weight | Candle Dimensions (L×W×H mm) | Packaged Estimate* |
|---------|--------|------------------------------|-------------------|
| Dragon | 150g | 80×80×115 | 120×120×155mm, 200g |
| Corn Cob | 160g | 45×45×155 | 85×85×195mm, 210g |
| Bee and Flower | 45g | 65×65×30 | 105×105×70mm, 95g |
| Rose | 40g | 65×65×30 | 105×105×70mm, 90g |

**\*Packaged estimate includes:**
- **+20mm per dimension** for box walls and bubble wrap (40mm total per dimension)
- **+50g** for small box and padding materials
- These buffers are added automatically by the shipping calculator

### NZ Post Services Reference
| Service Code | Name | Speed | Rural Support |
|--------------|------|-------|---------------|
| PCBXT | Tracked Zonal | Next day (same city) | Yes |
| PCB5C5 | Tracked Standard | 3-5 days | Yes |
| PCBCX | Courier | Same/next day | Yes |
| PCBEXP | Express | Overnight | No (urban only) |

### Useful Resources
- [NZ Post Rate Finder API Docs](https://www.nzpost.co.nz/business/developer-centre/nz-post-legacy-apis/rate-finder-api)
- [NZ Post Developer Centre](https://www.nzpost.co.nz/business/ecommerce/developer-resource-centre)
- [Get API Key Form](https://www.nzpost.co.nz/business/developer-centre/nz-post-legacy-apis/rate-finder-api/get-a-rate-finder-api-key)

---

**Next Steps:**
1. Review and provide feedback on this specification
2. Apply for NZ Post API key (2 day approval)
3. Run database migration to add dimensions
4. Begin Phase 1 development

**Questions or Concerns?**
Please comment on this spec document or contact the development team.
