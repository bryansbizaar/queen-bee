# 🚀 Quick Start: Shipping Calculator Testing (4 Products)

## Goal
Get the shipping calculator working ASAP with your 4 existing products for testing.

**Time estimate:** 2-3 hours to have a working prototype

---

## ✅ Step 1: Add Dimensions (5 minutes)

### Run the Migration

```bash
# From your project root
cd /Users/bryanowens/Code/Websites/Candles/queen-bee

# Run the migration using your database credentials
psql -d queen_bee_candles -U queenbee -f database/migrations/001_add_product_dimensions.sql

# Or if you've added PGPASSWORD to .env, use:
PGPASSWORD=development123 psql -d queen_bee_candles -U queenbee -f database/migrations/001_add_product_dimensions.sql
```

**Note:** If you see `(END)` after the output, press **`q`** to exit the pager.

**What this does:**
- Adds dimension columns to products table
- Populates your 4 products with estimated dimensions from their descriptions
  - Dragon: 150g, 80×80×115mm
  - Corn Cob: 160g, 45×45×155mm  
  - Bee and Flower: 45g, 65×65×30mm
  - Rose: 40g, 65×65×30mm

**Verify it worked:**
```sql
SELECT title, weight_kg, length_mm, width_mm, height_mm FROM products;
```

You should see all 4 products with dimensions!

✅ **Checkpoint:** All 4 products have dimensions

---

## 🔑 Step 2: Configure Environment (5 minutes)

### Update server/.env

The shipping route and service are already added to your code. Now just add the environment variables:

```bash
cd server

# Add these to your .env file:
cat >> .env << 'EOF'

# NZ Post Shipping API Configuration
NZPOST_API_KEY=test_key_placeholder
NZPOST_SOURCE_POSTCODE=0110
NZPOST_API_URL=https://api.nzpost.co.nz/ratefinder
PACKAGING_WEIGHT_KG=0.05
PADDING_PER_SIDE_MM=20
ENABLE_SHIPPING_CALCULATOR=true
EOF
```

Or manually add these lines to `server/.env`:
```bash
# NZ Post Shipping API Configuration
NZPOST_API_KEY=test_key_placeholder
NZPOST_SOURCE_POSTCODE=0110
NZPOST_API_URL=https://api.nzpost.co.nz/ratefinder
PACKAGING_WEIGHT_KG=0.05
PADDING_PER_SIDE_MM=20
ENABLE_SHIPPING_CALCULATOR=true
```

### Install axios

```bash
cd server
npm install axios
```

✅ **Checkpoint:** Environment configured, axios installed

---

## 🧪 Step 3: Test the Backend (15 minutes)

### Start the Server

```bash
cd server
npm run dev
```

### Test the Shipping Endpoint

**Test 1: Basic health check**
```bash
curl http://localhost:8080/api/shipping/test
```

Expected response:
```json
{
  "status": "success",
  "message": "Shipping API is operational",
  "config": {
    "hasApiKey": false,
    "sourcePostcode": "0110",
    "packagingWeight": "0.05",
    "paddingPerSide": "20"
  }
}
```

**Test 2: Calculate shipping for Dragon**
```bash
curl -X POST http://localhost:8080/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": 1, "quantity": 1}],
    "postcode": "6011"
  }'
```

Expected response (fallback rates until you have API key):
```json
{
  "status": "success",
  "isRural": false,
  "isFallback": true,
  "options": [{
    "id": "FALLBACK_STANDARD",
    "service": "standard",
    "description": "Standard Delivery (Estimated)",
    "cost": 8.00,
    "estimatedDays": "3-5 business days",
    "recommended": true
  }]
}
```

**Test 3: Small item (Rose)**
```bash
curl -X POST http://localhost:8080/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": 4, "quantity": 1}],
    "postcode": "6011"
  }'
```

**Test 4: Multiple items**
```bash
curl -X POST http://localhost:8080/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": 1, "quantity": 1}, {"id": 4, "quantity": 2}],
    "postcode": "6011"
  }'
```

**Test 5: Rural postcode (starts with 7, 8, or 9)**
```bash
curl -X POST http://localhost:8080/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": 1, "quantity": 1}],
    "postcode": "9999"
  }'
```

Expected: `"isRural": true` and higher cost (~$12)

✅ **Checkpoint:** Backend returns shipping rates successfully!

---

## 🎨 Step 4: Frontend Component (1 hour)

### Create ShippingCalculator Component

```bash
cd client/src/components
touch ShippingCalculator.jsx
```

Copy this code into `client/src/components/ShippingCalculator.jsx`:

```jsx
import { useState, useEffect } from 'react';

export default function ShippingCalculator({ cartItems, onShippingSelected, onError }) {
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRural, setIsRural] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-calculate when postcode is valid
    if (postcode.length === 4 && /^\d{4}$/.test(postcode)) {
      calculateShipping();
    } else {
      setOptions([]);
      setSelectedOption(null);
    }
  }, [postcode, cartItems]);

  const calculateShipping = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
          postcode: postcode
        })
      });

      if (!response.ok) throw new Error('Failed to calculate shipping');

      const data = await response.json();
      setOptions(data.options || []);
      setIsRural(data.isRural || false);
      
      // Auto-select recommended option
      const recommended = data.options?.find(opt => opt.recommended) || data.options?.[0];
      if (recommended) {
        setSelectedOption(recommended);
        onShippingSelected(recommended);
      }
      
    } catch (err) {
      setError('Unable to calculate shipping. Please try again.');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onShippingSelected(option);
  };

  return (
    <div style={{
      margin: '20px 0',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h3>Shipping Address</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="postcode" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
          Postcode *
        </label>
        <input
          id="postcode"
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.slice(0, 4))}
          placeholder="e.g., 6011"
          maxLength={4}
          pattern="\d{4}"
          required
          style={{
            width: '200px',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
        <small style={{ display: 'block', color: '#666', fontSize: '12px', marginTop: '4px' }}>
          4-digit NZ postcode
        </small>
      </div>

      {loading && (
        <div style={{ padding: '10px', background: '#f0f8ff', borderRadius: '4px', color: '#0066cc' }}>
          Calculating shipping...
        </div>
      )}
      
      {error && (
        <div style={{ padding: '10px', background: '#fee', borderRadius: '4px', color: '#c00' }}>
          {error}
        </div>
      )}

      {isRural && (
        <div style={{ padding: '8px 12px', background: '#fff3cd', borderRadius: '4px', margin: '10px 0' }}>
          🚜 Rural Delivery Area
        </div>
      )}

      {options.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Delivery Options</h4>
          {options.map((option) => (
            <label
              key={option.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                marginBottom: '10px',
                cursor: 'pointer'
              }}
            >
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={selectedOption?.id === option.id}
                onChange={() => handleOptionSelect(option)}
                style={{ marginRight: '12px', marginTop: '4px' }}
              />
              <div style={{ flex: 1 }}>
                <strong>{option.description}</strong>
                {option.recommended && (
                  <span style={{
                    background: '#0066cc',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    marginLeft: '8px'
                  }}>
                    Recommended
                  </span>
                )}
                <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                  ${option.cost.toFixed(2)} • {option.estimatedDays}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Test the Component

Create a simple test page or integrate into your existing checkout. For quick testing, you can add it to your Cart component temporarily:

```jsx
// In client/src/components/Cart.jsx (temporary for testing)
import ShippingCalculator from './ShippingCalculator';

// Add inside your Cart component:
<ShippingCalculator
  cartItems={cartItems}
  onShippingSelected={(option) => console.log('Shipping selected:', option)}
  onError={(err) => console.error('Shipping error:', err)}
/>
```

✅ **Checkpoint:** Shipping calculator displays and calculates rates!

---

## 🎯 Step 5: Quick Integration Test (30 minutes)

### Test Different Scenarios

1. **Add Dragon to cart** → See shipping calculator → Enter "6011"
   - Should show options
   - Fallback rate ~$8

2. **Add 2x Rose** → Enter "0110" (Whangarei)
   - Lighter package
   - Similar rate

3. **Add Dragon + 2x Rose** → Enter "9999" (rural)
   - Should show rural badge
   - Higher rate ~$12

4. **Test validation**
   - Type "abc" → No calculation
   - Type "123" → No calculation (needs 4 digits)
   - Type "" → No calculation

✅ **Checkpoint:** Everything working end-to-end!

---

## 🚀 Step 6: Apply for NZ Post API Key (Do This Now!)

While everything is working with fallback rates, apply for the real API key:

1. **Visit:** https://www.nzpost.co.nz/business/developer-centre/nz-post-legacy-apis/rate-finder-api/get-a-rate-finder-api-key
2. **Fill out form** with your business details
3. **Wait 1-2 business days** for approval

### When You Get Your API Key

Update `server/.env`:
```bash
NZPOST_API_KEY=your_actual_api_key_here
```

Restart server:
```bash
cd server
npm run dev
```

Now test again - you'll get **real NZ Post rates** instead of fallback estimates!

---

## 📊 What's Next?

**You now have:**
- ✅ Working shipping calculator
- ✅ 4 products with dimensions
- ✅ Backend API calculating rates
- ✅ Frontend component displaying options
- ✅ Fallback rates for testing

**Next steps (optional):**
1. Integrate into actual checkout flow
2. Add shipping to Stripe payment intent
3. Save shipping details to orders
4. Add remaining ~32 products when ready
5. Refine packaging buffers based on actual shipments

**For now, you can test the full user experience and refine the UX!**

---

## 🆘 Troubleshooting

### "Cannot find module 'axios'"
```bash
cd server
npm install axios
```

### "Column weight_kg does not exist"
Run the migration:
```bash
psql -d queenbee -U your_username -f database/migrations/001_add_product_dimensions.sql
```

### "Failed to calculate shipping"
Check server logs:
```bash
cd server
npm run dev
# Look for errors in console
```

### API endpoint not found (404)
Make sure you:
1. Added the import in `server/app.js`
2. Registered the route: `app.use("/api/shipping", shippingRouter);`
3. Restarted the server

### Frontend not connecting to backend
Check:
1. Server is running on `localhost:8080`
2. CORS is enabled (should be by default)
3. Network tab in browser dev tools for errors

---

## 📚 Related Documentation

- **Full Specification:** `/specs/shipping-calculator.md`
- **Packaging Buffer Guide:** `/docs/guides/packaging-buffer-guide.md`
- **Product Measurement Guide:** `/docs/guides/product-measurement-guide.md`
- **CSV to SQL Converter:** `/tools/csv-to-sql-converter.html`

---

## 🎉 Success!

You're now testing the shipping calculator with real products! 

**Questions or issues?** Check the troubleshooting section above or review the full specification in `/specs/shipping-calculator.md`.
