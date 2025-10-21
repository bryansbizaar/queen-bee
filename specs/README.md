# Shipping Calculator Feature - Documentation Index

This directory contains all documentation and resources for implementing the shipping calculator feature for Queen Bee Candles.

## 📁 File Structure

```
queen-bee/
├── specs/
│   ├── README.md (this file)
│   └── shipping-calculator.md          # Complete technical specification
├── docs/
│   ├── QUICK-START-SHIPPING.md         # Quick start guide (START HERE!)
│   └── guides/
│       ├── product-measurement-guide.md    # How to measure products
│       └── packaging-buffer-guide.md       # Packaging buffer system explained
├── database/
│   └── migrations/
│       └── 001_add_product_dimensions.sql  # Database migration
├── server/
│   ├── services/
│   │   ├── shippingService.js          # Shipping calculation logic
│   │   └── productService.js           # Updated with getByIds()
│   └── routes/
│       └── shipping.routes.js          # API endpoints
└── tools/
    └── csv-to-sql-converter.html       # Product data import tool
```

## 🚀 Quick Start

**Want to test the shipping calculator right now with your 4 existing products?**

👉 **Start here:** [`/docs/QUICK-START-SHIPPING.md`](../docs/QUICK-START-SHIPPING.md)

This guide will get you up and running in ~2-3 hours with:
- ✅ Backend API working
- ✅ Dimensions added to 4 products
- ✅ Fallback shipping rates
- ✅ Frontend component displaying options

## 📖 Documentation Overview

### 1. **Specification** (This Directory)

**[shipping-calculator.md](./shipping-calculator.md)** - Complete technical specification
- Problem statement and goals
- Full technical design
- API integration details
- Database schema changes
- UI/UX specifications
- Testing strategy
- Rollout plan (4 weeks)
- Success metrics

**When to read:** When you need comprehensive details about the feature, architecture decisions, or implementation approach.

### 2. **Quick Start Guide** ([docs/QUICK-START-SHIPPING.md](../docs/QUICK-START-SHIPPING.md))

Step-by-step instructions to get testing ASAP with 4 products:
- Run database migration (5 min)
- Configure environment (5 min)
- Test backend API (15 min)
- Add frontend component (1 hour)
- Integration testing (30 min)

**When to read:** When you're ready to start implementing and testing.

### 3. **Measurement Guides** (docs/guides/)

**[product-measurement-guide.md](../docs/guides/product-measurement-guide.md)**
- How to measure candle weight and dimensions
- Product type examples
- Common mistakes to avoid
- Batch measurement workflow
- ~3 hour timeline for 36 products

**When to read:** When you're ready to add more products beyond the initial 4.

**[packaging-buffer-guide.md](../docs/guides/packaging-buffer-guide.md)**
- Visual explanation of packaging buffer system
- Why measure candles, not boxes
- How to adjust buffers
- Testing your buffers

**When to read:** When you want to understand the packaging calculation system or need to adjust buffers.

### 4. **Database Migration** (database/migrations/)

**[001_add_product_dimensions.sql](../database/migrations/001_add_product_dimensions.sql)**
- Adds weight_kg, length_mm, width_mm, height_mm columns
- Backfills 4 test products with dimensions
- Includes verification queries

**When to run:** First step of implementation (see Quick Start guide).

### 5. **Tools** (tools/)

**[csv-to-sql-converter.html](../tools/csv-to-sql-converter.html)**
- Interactive HTML tool
- Size templates (Small, Medium, Large, Tall)
- Paste spreadsheet data → Generate SQL
- Statistics and validation

**When to use:** When adding multiple products at once (beyond the initial 4).

## 🎯 Implementation Paths

### Path 1: Quick Testing (Recommended - Start Here!)

**Goal:** Get shipping calculator working for testing ASAP

1. ✅ Read: [Quick Start Guide](../docs/QUICK-START-SHIPPING.md)
2. ✅ Run: `001_add_product_dimensions.sql`
3. ✅ Configure: Add env variables
4. ✅ Install: `npm install axios`
5. ✅ Test: Backend API endpoints
6. ✅ Add: Frontend ShippingCalculator component
7. ✅ Apply: NZ Post API key (while testing)

**Time:** 2-3 hours
**Result:** Working shipping calculator with 4 products

### Path 2: Full Implementation

**Goal:** Complete production-ready shipping calculator

1. ✅ Complete Path 1 (Quick Testing)
2. ✅ Read: [Full Specification](./shipping-calculator.md)
3. ✅ Measure: All ~36 products (see [Measurement Guide](../docs/guides/product-measurement-guide.md))
4. ✅ Import: Use CSV Converter tool
5. ✅ Integrate: Add to checkout flow
6. ✅ Update: Stripe payment intent with shipping
7. ✅ Enhance: Save shipping to orders table
8. ✅ Test: Comprehensive testing (unit, integration, manual)
9. ✅ Deploy: Staging → Production
10. ✅ Monitor: Track metrics and gather feedback

**Time:** 4 weeks (per rollout plan)
**Result:** Production-ready feature with all products

## 🔑 Key Concepts

### Packaging Buffer System

**Important:** Product dimensions in database are for the CANDLE only.

The system automatically adds:
- **Weight:** +50g for box and bubble wrap
- **Dimensions:** +40mm per dimension (20mm padding each side)

This approach:
- ✅ Makes measurement consistent
- ✅ Easy to adjust buffers
- ✅ No need to guess box sizes
- ✅ Update packaging assumptions without changing product data

See [Packaging Buffer Guide](../docs/guides/packaging-buffer-guide.md) for visual explanation.

### NZ Post API Integration

**Two modes:**

1. **Fallback Mode** (API key = "test_key_placeholder")
   - Returns estimated flat rates ($8 urban, $12 rural)
   - Good for development and testing
   - No API key required

2. **Live Mode** (Real API key)
   - Returns actual NZ Post rates
   - Multiple service options
   - Accurate rural detection
   - Requires API key (1-2 day approval)

## 📊 Current Status

**What's Complete:**
- ✅ Full specification document
- ✅ Database migration script
- ✅ ShippingService implementation
- ✅ API routes (POST /api/shipping/calculate)
- ✅ Product measurement guide
- ✅ Packaging buffer guide
- ✅ CSV to SQL converter tool
- ✅ Quick start testing guide
- ✅ All backend code added to project

**What's Next:**
- ⏳ Run database migration
- ⏳ Configure environment variables
- ⏳ Test backend API
- ⏳ Build frontend component
- ⏳ Apply for NZ Post API key
- ⏳ Add remaining ~32 products

## 🆘 Getting Help

### Common Questions

**Q: Where do I start?**
A: Follow the [Quick Start Guide](../docs/QUICK-START-SHIPPING.md) - gets you testing in 2-3 hours.

**Q: Do I need to measure all 36 products now?**
A: No! Start with the 4 test products. Add more later.

**Q: What if I don't have an NZ Post API key?**
A: The system works in fallback mode with estimated rates. Apply for key while testing.

**Q: How accurate are the packaging buffers?**
A: Conservative defaults (+50g, +40mm). Adjust after shipping a few real orders.

**Q: Can I use different buffers per product?**
A: Yes! See the specification for advanced options. Start simple though.

### Troubleshooting

Check these locations for solutions:
1. Quick Start Guide - Troubleshooting section
2. Specification - Error Handling section
3. Server logs when running `npm run dev`

### Questions Not Covered?

- Review the [Full Specification](./shipping-calculator.md)
- Check server logs for errors
- Test API endpoints with curl
- Verify database migration completed

## 📚 External Resources

### NZ Post API Documentation
- Rate Finder API: https://www.nzpost.co.nz/business/developer-centre/nz-post-legacy-apis/rate-finder-api
- Get API Key: https://www.nzpost.co.nz/business/developer-centre/nz-post-legacy-apis/rate-finder-api/get-a-rate-finder-api-key
- Developer Centre: https://www.nzpost.co.nz/business/ecommerce/developer-resource-centre

### Helpful Tools
- Postman: Test API endpoints
- PostgreSQL CLI: Run migrations and queries
- Browser DevTools: Debug frontend component

## 🎉 Let's Get Started!

Ready to implement? Here's your path:

1. **Right now:** Read the [Quick Start Guide](../docs/QUICK-START-SHIPPING.md)
2. **In 5 minutes:** Run the database migration
3. **In 15 minutes:** Test the backend API
4. **In 2 hours:** See shipping calculator working in browser
5. **Tomorrow:** Have your NZ Post API key approved
6. **Next week:** Add remaining products and refine

**Happy coding! 🐝📦**
