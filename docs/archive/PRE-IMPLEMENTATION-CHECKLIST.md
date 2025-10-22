# Shipping Calculator - Pre-Implementation Verification

Run these checks before starting implementation to ensure everything is ready.

## ✅ Files Verification

### Documentation
```bash
# Check all docs exist
ls -la /Users/bryanowens/Code/Websites/Candles/queen-bee/SHIPPING-CALCULATOR.md
ls -la /Users/bryanowens/Code/Websites/Candles/queen-bee/docs/QUICK-START-SHIPPING.md
ls -la /Users/bryanowens/Code/Websites/Candles/queen-bee/docs/IMPLEMENTATION-SUMMARY.md
ls -la /Users/bryanowens/Code/Websites/Candles/queen-bee/specs/README.md
ls -la /Users/bryanowens/Code/Websites/Candles/queen-bee/specs/shipping-calculator.md
```

### Database
```bash
# Check migration exists
ls -la /Users/bryanowens/Code/Websites/Candles/queen-bee/database/migrations/001_add_product_dimensions.sql
```

### Backend Code
```bash
# Check all backend files exist
ls -la /Users/bryanowens/Code/Websites/Candles/queen-bee/server/services/shippingService.js
ls -la /Users/bryanowens/Code/Websites/Candles/queen-bee/server/routes/shipping.routes.js

# Verify app.js has shipping route
grep "shippingRouter" /Users/bryanowens/Code/Websites/Candles/queen-bee/server/app.js

# Check .env.example updated
grep "NZPOST" /Users/bryanowens/Code/Websites/Candles/queen-bee/server/.env.example
```

## ✅ Current Product Check

```sql
-- Verify your 4 test products exist
SELECT id, title, description, price FROM products ORDER BY id;
```

Expected:
1. Dragon - 1500
2. Corn Cob - 1600
3. Bee and Flower - 850
4. Rose - 800

## 📋 Implementation Checklist

### Step 1: Database (5 min)
- [x] PostgreSQL is running
- [x] Know your database credentials (check existing .env)
- [x] Run migration: `psql -d queen_bee_candles -U queenbee -f database/migrations/001_add_product_dimensions.sql`
- [x] Verify: `SELECT title, weight_kg FROM products;` (Press `q` to exit pager)

### Step 2: Environment (5 min)
- [ ] Open `server/.env`
- [ ] Add NZ Post configuration (see QUICK-START-SHIPPING.md)
- [ ] Save file

### Step 3: Dependencies (1 min)
- [ ] Run: `cd server && npm install axios`
- [ ] Verify: `npm list axios` shows installed

### Step 4: Test Backend (5 min)
- [ ] Start server: `cd server && npm run dev`
- [ ] Test health: `curl http://localhost:8080/api/shipping/test`
- [ ] Test calculate: See SHIPPING-CALCULATOR.md for curl command
- [ ] Should return shipping rates (fallback mode)

### Step 5: Frontend (Later)
- [ ] Review component code in QUICK-START-SHIPPING.md
- [ ] Create ShippingCalculator.jsx
- [ ] Test in browser

### Step 6: API Key (Parallel)
- [ ] Apply at NZ Post website (link in docs)
- [ ] Wait 1-2 days for approval
- [ ] Add to .env when received
- [ ] Restart server and get real rates

## 🆘 Common Issues

### Issue: Can't find database credentials
**Where to look:**
```bash
cat /Users/bryanowens/Code/Websites/Candles/queen-bee/server/.env | grep PG
```

### Issue: Port 8080 already in use
```bash
lsof -ti :8080 | xargs kill -9
```

### Issue: axios not installing
```bash
cd server
rm -rf node_modules package-lock.json
npm install
npm install axios
```

## 📚 Documentation Quick Links

- **Start here:** `docs/QUICK-START-SHIPPING.md`
- **Troubleshooting:** `docs/IMPLEMENTATION-SUMMARY.md`
- **Full spec:** `specs/shipping-calculator.md`
- **This file:** `docs/PRE-IMPLEMENTATION-CHECKLIST.md`

## ✨ Ready to Start?

If all checks pass, you're ready! Open:
```
/Users/bryanowens/Code/Websites/Candles/queen-bee/docs/QUICK-START-SHIPPING.md
```

Follow it step-by-step. Good luck! 🐝
