# Manual Testing Checklist for Queen Bee Candles

## Quick Smoke Test (2 minutes before any release)

### ✅ App Loads
- [ ] Navigate to http://127.0.0.1:3000
- [ ] Page loads without errors
- [ ] Header shows "Queen Bee Candles"
- [ ] Navigation menu works (Home, About, Contact)

### ✅ Products Display
- [ ] 4 candle products are visible
- [ ] Product images load correctly
- [ ] Product names and prices display
- [ ] "Add to Cart" buttons are present

### ✅ Cart Functionality
- [ ] Click "Add to Cart" on any product
- [ ] Cart icon shows item count
- [ ] Navigate to cart page
- [ ] Items display correctly in cart
- [ ] Can update quantities
- [ ] Can remove items

### ✅ Basic Navigation
- [ ] All navigation links work
- [ ] Back button works
- [ ] Page refreshes don't break the app

### ✅ Responsive Design
- [ ] Test on mobile viewport (Safari responsive mode)
- [ ] Menu toggles work on mobile
- [ ] Content is readable on small screens

## When to Run This Checklist

- ✅ **Before any deployment**
- ✅ **After making changes to core functionality**
- ✅ **Weekly during active development**
- ✅ **When adding new features**

## Payment Testing (when ready)

- [ ] Checkout flow initiates
- [ ] Stripe form appears
- [ ] Test cards work (use Stripe test cards)
- [ ] Success/failure pages display correctly

---

**Philosophy**: For a simple 4-product candle business, this 2-minute manual test is more valuable than 356 automated tests that are hard to maintain.

**Time Investment**: 2 minutes vs. hours maintaining complex test infrastructure.

**Coverage**: Tests real user workflows that actually matter for your business.