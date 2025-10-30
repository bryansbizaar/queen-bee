# Render Database Migration Guide

## 🎯 Goal
Add dimension columns (weight_kg, length_mm, width_mm, height_mm) to your production Render PostgreSQL database so shipping calculations work properly.

## 📋 What This Does

1. **Adds 4 new columns** to the products table:
   - `weight_kg` - Product weight in kilograms
   - `length_mm` - Length in millimeters
   - `width_mm` - Width in millimeters  
   - `height_mm` - Height in millimeters

2. **Updates all 26 products** with their actual dimensions based on your product descriptions

3. **Enables shipping calculations** - These dimensions are used by the ShippingService to calculate accurate NZ Post rates

## ⚡ Quick Start

### Step 1: Get Your Database URL

1. Go to https://dashboard.render.com
2. Click on your PostgreSQL database (likely named `queen-bee-db`)
3. Click **"Connect"** button
4. Copy the **"External Database URL"** - it looks like:
   ```
   postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/database_name
   ```

### Step 2: Run the Migration

```bash
cd /Users/bryanowens/Code/Websites/Candles/queen-bee

# Make the script executable
chmod +x database/run_render_migrations.sh

# Run it with your DATABASE_URL
./database/run_render_migrations.sh 'postgresql://user:pass@host/database'
```

Replace the URL with your actual External Database URL from Step 1.

### Step 3: Verify Success

After the script completes, test your API:

```bash
# Should now return product with dimensions
curl https://queen-bee-candles.onrender.com/api/products/1
```

Look for these fields in the response:
```json
{
  "product": {
    "id": 1,
    "title": "Fern Ball",
    "weight_kg": 0.280,
    "length_mm": 90,
    "width_mm": 90,
    "height_mm": 80,
    ...
  }
}
```

## 📝 Manual Migration (Alternative)

If you prefer to run the migrations manually:

### Using psql Command Line

```bash
# Connect to Render database
psql 'postgresql://user:pass@host/database'

# Run migration 001
\i database/migrations/001_add_product_dimensions.sql

# Run migration 002  
\i database/migrations/002_add_dimensions_to_new_products.sql

# Verify
SELECT COUNT(*), COUNT(weight_kg) FROM products;
```

### Using Render Dashboard SQL Editor

1. Go to https://dashboard.render.com
2. Click on your PostgreSQL database
3. Click **"Query"** tab
4. Copy/paste the contents of:
   - First: `database/migrations/001_add_product_dimensions.sql`
   - Then: `database/migrations/002_add_dimensions_to_new_products.sql`
5. Click **"Run Query"** for each

## 🔍 Verification Queries

After migration, verify the data:

```sql
-- Check all products have dimensions
SELECT 
    COUNT(*) as total,
    COUNT(weight_kg) as with_dimensions
FROM products;
-- Should show: 26 total, 26 with_dimensions

-- View sample products
SELECT 
    id, 
    title, 
    weight_kg,
    length_mm || 'x' || width_mm || 'x' || height_mm || 'mm' as dimensions
FROM products
ORDER BY weight_kg
LIMIT 5;
```

## 🚀 After Migration

Once migration is complete:

1. **Commit and push** the productService.js changes (dimensions restored in queries)
2. **Trigger Render redeploy** (automatic if you have auto-deploy enabled)
3. **Test the site** - product pages should now show correctly
4. **Test shipping calculator** - add products to cart and check shipping rates

## 🛡️ Safety Notes

- ✅ **Non-destructive** - Only adds columns, doesn't modify existing data
- ✅ **Idempotent** - Can be run multiple times safely (uses IF NOT EXISTS)
- ✅ **Reversible** - Can rollback if needed (see below)

## 🔙 Rollback (If Needed)

If you need to remove the dimension columns:

```sql
ALTER TABLE products 
DROP COLUMN IF EXISTS weight_kg,
DROP COLUMN IF EXISTS length_mm,
DROP COLUMN IF EXISTS width_mm,
DROP COLUMN IF EXISTS height_mm;
```

## 📊 What Gets Updated

All 26 products will have dimensions added:

| Product | Weight | Dimensions (L×W×H) |
|---------|--------|-------------------|
| Pinecone (sm) | 25g | 35×35×40mm |
| Beehive Skep (sm) | 30g | 35×35×40mm |
| Snowman | 35g | 40×40×60mm |
| Rose | 40g | 65×65×30mm |
| ... | ... | ... |
| Fern Ball | 280g | 90×90×80mm (largest) |

Full list in `database/migrations/002_add_dimensions_to_new_products.sql`

## 🐛 Troubleshooting

### "psql: command not found"

Install PostgreSQL client:
```bash
brew install postgresql@15
```

### "Connection refused"

- Check your DATABASE_URL is correct
- Ensure you're using the **External** Database URL, not Internal
- Verify your IP isn't blocked (Render allows all IPs by default)

### "Permission denied"

Make script executable:
```bash
chmod +x database/run_render_migrations.sh
```

### "Column already exists"

This is fine! The migrations use `IF NOT EXISTS` so they're safe to re-run. The script will skip adding existing columns.

## ✅ Success Checklist

- [ ] Migration script ran without errors
- [ ] All 26 products have dimensions
- [ ] API returns products with weight_kg, length_mm, width_mm, height_mm
- [ ] Shipping calculator works in the cart
- [ ] No "column does not exist" errors in Render logs

## 📞 Next Steps

After successful migration:

1. **Test thoroughly** - Add products to cart, check shipping rates
2. **Monitor logs** - Watch Render logs for any errors
3. **Update documentation** - Note that dimensions are now in production
4. **Consider adding** a database backup schedule in Render

---

**Questions?** Check the migration SQL files for detailed comments about each product's dimensions.
