# Test Database Setup - Final Documentation

## Quick Start

You already have everything set up! This is for reference only.

### Files You Need

1. **`server/.env.test`** - Test environment configuration
2. **`server/tests/setup.js`** - Test setup that loads `.env.test`
3. **`server/tests/setup/testDatabase.js`** - Test data seeding functions
4. **`database/init.sql`** - Updated schema with `is_featured` and `display_order` columns

### Running Tests

```bash
cd server
npm test
```

Tests will:
- Use `queen_bee_test` database (not your main database)
- Seed 4 test products automatically
- Leave your `queen_bee_candles` database with 26 products untouched

### Database Structure

- **Main Database:** `queen_bee_candles` - 26 products (for development)
- **Test Database:** `queen_bee_test` - 4 products (seeded during tests)

### Verify Setup

```bash
# Check main database (should have 26 products)
psql -U queenbee queen_bee_candles -c "SELECT COUNT(*) FROM products;"

# Check test database (should have 4 products after running tests)
psql -U queenbee queen_bee_test -c "SELECT COUNT(*) FROM products;"
```

## Scripts Available

### Database Maintenance (if needed)

Located in `/scripts/`:

- **`create-test-db.sh`** - Creates test database with schema
- **`restore-all-26-products.sh`** - Restores all 26 products to main database
- **`update-database-schema.sh`** - Adds missing columns to databases

### When to Use Scripts

**You probably won't need these!** They were used during initial setup. Keep them for:
- Resetting test database if corrupted
- Restoring products if accidentally deleted
- Setting up on a new machine

## Troubleshooting

### Tests fail with "database does not exist"
```bash
./scripts/create-test-db.sh
```

### Lost products from main database
```bash
./scripts/restore-all-26-products.sh
```

### PostgreSQL not running
```bash
brew services start postgresql@14
```

### Red squiggles in VS Code
Tests passing? Reload window: `Cmd+Shift+P` → "Reload Window"

## Architecture

```
Test Run Flow:
1. tests/setup.js loads .env.test (DATABASE_NAME=queen_bee_test)
2. api.test.js calls seedTestData()
3. testDatabase.js truncates and inserts 4 products
4. Tests run against these 4 products
5. Main database (26 products) never touched
```

## What Changed During Setup

1. Added `is_featured` and `display_order` columns to schema
2. Created `.env.test` to force test database usage
3. Updated `tests/setup.js` to load `.env.test` first
4. Created `testDatabase.js` with seed data functions
5. Updated `api.test.js` to validate specific products

---

**Everything is working! This file is just for reference.**
