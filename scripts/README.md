# Development Scripts

Utility scripts for Queen Bee Candles development and debugging.

## Available Scripts

### 🔑 check-stripe-keys.sh

Validates that your Stripe API keys are properly configured and match between frontend and backend.

**Usage:**
```bash
./scripts/check-stripe-keys.sh
```

**What it checks:**
- ✅ Both `.env` files exist
- ✅ Keys are present in both files
- ✅ Frontend and backend are using the same environment (test vs live)
- ❌ Detects mismatches that cause "No such payment_intent" errors

**Common issues it catches:**
- Frontend using test keys while backend uses live keys (or vice versa)
- Missing environment variables
- Expired or invalid API keys

---

### 📦 test-shipping-api.sh

Tests the shipping calculation API endpoint locally.

**Usage:**
```bash
./scripts/test-shipping-api.sh
```

**Prerequisites:**
- Local server must be running (`cd server && npm run dev`)

**What it tests:**
- ✅ Server health check
- ✅ Shipping calculation with sample data
- ✅ Returns shipping options with costs

**Sample request:**
```json
{
  "items": [{"id": 1, "quantity": 2}],
  "postcode": "0110"
}
```

---

## Adding New Scripts

When adding new development scripts:

1. Create the script in this directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Add documentation to this README
4. Use clear error messages and colored output
5. Include usage examples

## Script Standards

All scripts in this directory should:
- ✅ Have a clear purpose (development, testing, or debugging)
- ✅ Include helpful output messages
- ✅ Exit with appropriate status codes (0 = success, non-zero = error)
- ✅ Check prerequisites before running
- ✅ Be documented in this README

---

## Related Documentation

- **Main docs:** `../docs/`
- **Database scripts:** `../database/`
- **Database tools:** `../database/tools/`
