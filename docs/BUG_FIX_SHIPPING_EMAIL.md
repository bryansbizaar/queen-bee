# Fixed: Shipping Cost Bug in Order Confirmation Emails

## Summary
Order confirmation emails were showing **$1691.00 for shipping** instead of **$8.00**. The checkout UI displayed correct amounts, but the emails and database had inflated totals.

## Root Cause
**Double conversion** in `/server/routes/stripe.routes.js`:

The frontend was sending amounts already in cents (e.g., 1700 cents = $17.00), but the server was multiplying by 100 again:

```javascript
// BEFORE (Bug):
const amountInCents = Math.round(parseFloat(amount) * 100);
// Result: 1700 * 100 = 170000 cents = $1700.00 ❌

// AFTER (Fixed):
const amountInCents = Math.round(parseFloat(amount));
// Result: 1700 cents = $17.00 ✓
```

## The Bug in Action
```
Frontend calculates:
  Subtotal: 900 cents ($9.00) ✓
  Shipping: 800 cents ($8.00) ✓
  Total:    1700 cents ($17.00) ✓

Frontend sends to server: amount = 1700

Server (BEFORE fix):
  amountInCents = 1700 * 100 = 170000 ❌
  Creates payment intent for $1700.00 ❌
  Stores in database: 170000 cents ❌

Email service calculates shipping:
  shippingCost = 170000 - 900 = 169100 cents
  Displays: $1691.00 ❌
```

## Files Modified
✅ `/server/routes/stripe.routes.js` (line 105) - Removed `* 100` multiplication

## No Changes Needed
✅ `/server/services/shippingService.js` - Shipping service was working correctly
✅ `/client/src/components/Cart.jsx` - Cart calculations were correct
✅ `/server/services/EmailService.js` - Email formatting was correct

## Testing
1. Add items to cart (e.g., Woodland Bear $9.00)
2. Enter shipping address with postcode 0110
3. Select shipping option (~$8.00)
4. Complete checkout
5. Check order confirmation email:
   - ✅ Subtotal: $9.00
   - ✅ Shipping: $8.00 (previously showed $1691.00)
   - ✅ Total: $17.00 (previously showed $1700.00)

## Why the UI Looked Fine
The checkout UI (`StripeCheckout.jsx`) was displaying the values correctly by doing its own calculations:

```javascript
<span>Subtotal: {formatAmount(amount - (selectedShipping?.cost * 100 || 0))}</span>
<span>Shipping: {formatAmount(selectedShipping.cost * 100)}</span>
```

So even though `amount` was inflated (170000 instead of 1700), the subtotal calculation (`170000 - 800 = 169200`) and formatting made it appear correct in the UI. But the actual payment and database had the wrong amount.

## Prevention
- ✅ Frontend sends amounts in **cents**
- ✅ Backend does NOT multiply by 100
- ✅ Database stores amounts in **cents**
- ✅ Email displays by dividing by 100
- ✅ Stripe receives amounts in **cents**

## Date Fixed
October 29, 2025
