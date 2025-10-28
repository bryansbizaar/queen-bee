# Testing Setup & Troubleshooting Guide

## Quick Reference

### Running Tests
```bash
cd server
npm test
```

### Database Check
```bash
# Main database - should have 26 products
psql -U queenbee queen_bee_candles -c "SELECT COUNT(*) FROM products;"

# Test database - should have 4 products (after tests run)
psql -U queenbee queen_bee_test -c "SELECT COUNT(*) FROM products;"
```

---

## Test Database Architecture

### Two Separate Databases

1. **`queen_bee_candles`** - Your development/production database
   - Contains all 26 products
   - Never touched by tests
   - Used when running the application normally

2. **`queen_bee_test`** - Test database  
   - Contains 4 seed products during tests
   - Isolated from main database
   - Automatically seeded before each test run

### How It Works

```
npm test runs
  ↓
tests/setup.js loads .env.test
  ↓
Database connects to queen_bee_test
  ↓
seedTestData() inserts 4 products
  ↓
Tests run with predictable data
  ↓
Main database remains untouched ✅
```

---

## Initial Setup (One Time)

### 1. Create Test Database

```bash
# Create the database
createdb -U queenbee -O queenbee queen_bee_test

# Load schema
psql -U queenbee queen_bee_test < database/init.sql
```

**Or use the script:**
```bash
chmod +x scripts/create-test-db.sh
./scripts/create-test-db.sh
```

### 2. Verify Setup

```bash
# Check both databases exist
psql -U queenbee -l | grep queen_bee

# Should show:
# queen_bee_candles  - Main database
# queen_bee_test     - Test database
```

---

## Test Data

### Main Database (26 Products)
- Dragon, Corn Cob, Bee and Flower, Rose (original 4)
- Plus 22 additional products
- **Total: 26 products**

### Test Database (4 Products)
Seeds these products before each test run:
1. Dragon - $15.00
2. Corn Cob - $16.00  
3. Bee and Flower - $8.50
4. Rose - $8.00

**Location:** `server/tests/setup/testDatabase.js`

---

## Configuration Files

### `.env` - Development/Production
- `DATABASE_NAME=queen_bee_candles`
- Used when running the application normally

### `.env.test` - Testing
- `DATABASE_NAME=queen_bee_test`
- Loaded automatically during tests
- **Location:** `server/.env.test`

### Test Setup
- **Location:** `server/tests/setup.js`
- Loads `.env.test` before anything else
- Verifies correct database is being used
- Closes database connections after tests

---

## Common Issues & Solutions

### Issue: "database queen_bee_test does not exist"

**Solution:**
```bash
createdb -U queenbee -O queenbee queen_bee_test
psql -U queenbee queen_bee_test < database/init.sql
```

### Issue: "column is_featured does not exist"

**Solution:** Update schema
```bash
chmod +x scripts/update-database-schema.sh
./scripts/update-database-schema.sh
```

### Issue: PostgreSQL not running

**Solution:**
```bash
# Start PostgreSQL (Homebrew)
brew services start postgresql@14

# Or double-click Postgres.app if using that
```

### Issue: Tests modify main database

**Solution:** Verify `.env.test` is being loaded
```bash
cd server
cat .env.test | grep DATABASE_NAME
# Should show: DATABASE_NAME=queen_bee_test
```

### Issue: Open handle warning (Jest won't exit)

**Solution:** Already fixed in `tests/setup.js` - closes database pool in `afterAll()`

### Issue: Red squiggles in VS Code

**Solutions:**
1. Reload VS Code window (Cmd+Shift+P → "Reload Window")
2. Clear Jest cache: `npm test -- --clearCache`
3. If tests pass, ignore the squiggles (VS Code being overly cautious)

---

## Maintenance Scripts

All scripts located in `/scripts` directory:

### create-test-db.sh
Creates test database and loads schema
```bash
./scripts/create-test-db.sh
```

### restore-all-26-products.sh
Restores all 26 products to main database
```bash
./scripts/restore-all-26-products.sh
```

### update-database-schema.sh
Adds missing columns to both databases
```bash
./scripts/update-database-schema.sh
```

---

## Test Structure

```
server/tests/
├── setup.js                    # Global test configuration
├── setup/
│   └── testDatabase.js        # Test data seeding functions
├── api.test.js                # API health tests (5 tests)
├── contact.test.js            # Contact form tests (5 tests)
└── README_TEST_DATA.md        # This file
```

### Test Files

**api.test.js**
- Tests product API endpoints
- Validates response structure
- Checks CORS headers
- Tests 404 handling

**contact.test.js**
- Tests contact form validation
- Tests email service integration
- Tests health check endpoint

---

## Best Practices

### ✅ Do
- Run tests frequently during development
- Keep test database separate from main database
- Use descriptive test names
- Test both success and failure scenarios

### ❌ Don't
- Run tests against production database
- Hardcode database credentials in tests
- Modify test seed data without updating tests
- Skip tests before committing code

---

## Verification Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test api.test.js

# Run with coverage
npm test -- --coverage

# Clear Jest cache
npm test -- --clearCache

# Watch mode (re-runs on file changes)
npm test -- --watch
```

---

## CI/CD Integration

Tests are configured to run in GitHub Actions. The pipeline:
1. Sets up PostgreSQL
2. Creates test database
3. Runs migrations
4. Executes test suite
5. Reports results

**Configuration:** `.github/workflows/test.yml`

---

## Troubleshooting Checklist

When tests fail, check:

- [ ] PostgreSQL is running
- [ ] Both databases exist
- [ ] Test database has correct schema
- [ ] `.env.test` exists and has correct settings
- [ ] No stale database connections
- [ ] Jest cache is clear

Run this diagnostic:
```bash
# Check databases
psql -U queenbee -l | grep queen_bee

# Check schema
psql -U queenbee queen_bee_test -c "\d products"

# Check test environment
cat server/.env.test | grep DATABASE_NAME

# Run tests
cd server && npm test
```

---

## Getting Help

If you encounter issues not covered here:

1. Check test output for specific error messages
2. Verify database connections manually
3. Review recent changes to test files
4. Check GitHub Actions logs for CI failures
5. Refer to archived troubleshooting docs in `/docs/archive/testing/`

---

*Last updated: October 28, 2025*
