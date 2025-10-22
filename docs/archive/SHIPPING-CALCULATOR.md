# Shipping Calculator Feature

**Status:** Ready to implement  
**Last Updated:** 2025-10-22

## Quick Start

👉 **To begin implementation, start here:**  
[`/docs/QUICK-START-SHIPPING.md`](./docs/QUICK-START-SHIPPING.md)

This guide walks you through:
1. Running database migration (5 min)
2. Configuring environment (5 min)
3. Testing backend API (15 min)
4. Creating frontend component (1 hour)

**Estimated time to working prototype:** 2-3 hours

---

## What's Implemented

### Backend ✅ COMPLETE
- `server/services/shippingService.js` - Shipping calculation logic
- `server/routes/shipping.routes.js` - API endpoints
- `server/services/productService.js` - Updated with getByIds()
- `server/app.js` - Routes registered

**API Endpoints:**
- `POST /api/shipping/calculate` - Calculate shipping rates
- `GET /api/shipping/test` - Health check

### Database ✅ READY
- `database/migrations/001_add_product_dimensions.sql` - Ready to run

### Documentation ✅ COMPLETE
- Full specification
- Quick start guide
- Implementation summary
- Troubleshooting guides

---

## Documentation Index

### Getting Started
- **[Quick Start Guide](./docs/QUICK-START-SHIPPING.md)** ⭐ Start here!
- **[Implementation Summary](./docs/IMPLEMENTATION-SUMMARY.md)** - What was added

### Detailed Documentation
- **[Specs Index](./specs/README.md)** - Navigation for all specs
- **[Full Specification](./specs/shipping-calculator.md)** - Complete technical details

### Database
- **[Migration Script](./database/migrations/001_add_product_dimensions.sql)** - Add product dimensions

---

## Key Concepts

### Packaging Buffer System
Product dimensions in database are for the **candle only**.

The system automatically adds:
- **+50g** for box and bubble wrap
- **+40mm** per dimension (20mm padding each side)

Example:
```
Dragon candle: 150g, 80×80×115mm (stored in DB)
Shipped as:    200g, 120×120×155mm (sent to NZ Post API)
```

### Two Operating Modes

**Fallback Mode** (no API key):
- Returns flat rate estimates ($8 urban, $12 rural)
- Good for development/testing
- Set `NZPOST_API_KEY=test_key_placeholder`

**Live Mode** (with API key):
- Returns real NZ Post rates
- Multiple delivery options
- Accurate rural detection
- Apply for key at: https://www.nzpost.co.nz/business/developer-centre/nz-post-legacy-apis/rate-finder-api/get-a-rate-finder-api-key

---

## Implementation Checklist

### Prerequisites
- [ ] PostgreSQL database running
- [ ] Node.js 18+ installed
- [ ] Project dependencies installed

### Backend Setup (30 minutes)
- [x] Run database migration
- [ ] Add environment variables to `server/.env`
- [ ] Install axios: `npm install axios`
- [ ] Start server and test endpoints

### Frontend (1 hour)
- [ ] Create ShippingCalculator component (code in Quick Start guide)
- [ ] Test in browser
- [ ] Integrate into checkout flow (optional)

### API Key (Do in parallel)
- [ ] Apply for NZ Post API key (1-2 day approval)
- [ ] Update .env when received
- [ ] Test with real rates

---

## Environment Variables Needed

Add to `server/.env`:
```bash
NZPOST_API_KEY=test_key_placeholder
NZPOST_SOURCE_POSTCODE=0110
NZPOST_API_URL=https://api.nzpost.co.nz/ratefinder
PACKAGING_WEIGHT_KG=0.05
PADDING_PER_SIDE_MM=20
ENABLE_SHIPPING_CALCULATOR=true
```

---

## Testing Commands

```bash
# Health check
curl http://localhost:8080/api/shipping/test

# Calculate shipping for Dragon (using your database)
curl -X POST http://localhost:8080/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":1,"quantity":1}],"postcode":"6011"}'

# Multiple items
curl -X POST http://localhost:8080/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":1,"quantity":1},{"id":4,"quantity":2}],"postcode":"6011"}'

# Rural postcode
curl -X POST http://localhost:8080/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":1,"quantity":1}],"postcode":"9999"}'
```

**Database Info:**
- Database name: `queen_bee_candles`
- Username: `queenbee`
- Password: `development123`

---

## File Locations

```
queen-bee/
├── SHIPPING-CALCULATOR.md (this file)
├── docs/
│   ├── QUICK-START-SHIPPING.md          ⭐ Start here
│   └── IMPLEMENTATION-SUMMARY.md         📋 What was added
├── specs/
│   ├── README.md                         📚 Navigation
│   └── shipping-calculator.md            📖 Full specification
├── database/
│   └── migrations/
│       └── 001_add_product_dimensions.sql
└── server/
    ├── services/
    │   ├── shippingService.js            ✅ NEW
    │   └── productService.js             ✅ UPDATED
    ├── routes/
    │   └── shipping.routes.js            ✅ NEW
    ├── app.js                            ✅ UPDATED
    └── .env.example                      ✅ UPDATED
```

---

## Troubleshooting

### "Cannot find module 'axios'"
```bash
cd server
npm install axios
```

### "Column weight_kg does not exist"
```bash
psql -d queenbee -U your_username -f database/migrations/001_add_product_dimensions.sql
```

### "API endpoint returns 404"
Verify `server/app.js` has:
```javascript
import shippingRouter from "./routes/shipping.routes.js";
app.use("/api/shipping", shippingRouter);
```

### More Help
See troubleshooting section in:
- `/docs/QUICK-START-SHIPPING.md`
- `/docs/IMPLEMENTATION-SUMMARY.md`

---

## Current Status

✅ **Backend:** Complete and ready to test  
✅ **Database:** Migration script ready  
✅ **Documentation:** Comprehensive guides available  
⏳ **Frontend:** Component code provided (needs creation)  
⏳ **API Key:** Need to apply (can test without)  
⏳ **Integration:** Full checkout flow (future)

---

## Next Steps

1. **Right now:** Read `/docs/QUICK-START-SHIPPING.md`
2. **In 5 min:** Run database migration
3. **In 10 min:** Configure environment variables
4. **In 15 min:** Test backend with curl
5. **In 2 hours:** Have working shipping calculator

---

## Support for Future You (or New Chat)

Everything you need is documented in this repo:

- **Quick question?** Check Quick Start guide
- **Technical details?** Check full specification
- **Troubleshooting?** Check Implementation Summary
- **Code examples?** All files have detailed comments
- **API testing?** curl commands provided above

**All documentation is self-contained - no need to reference this chat.**

---

**Good luck with implementation! 🐝📦**
