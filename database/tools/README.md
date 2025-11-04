# Database Tools

Utility tools for database management and data conversion.

## Available Tools

### convert-csv-to-sql.py

Converts CSV product exports to SQL INSERT statements.

**Usage:**
```bash
python3 database/tools/convert-csv-to-sql.py
```

**Input:** `database/exports/products-export.csv`  
**Output:** SQL INSERT statements

**What it does:**
- Reads CSV product data
- Generates properly formatted SQL INSERT statements
- Handles data types and escaping
- Creates ready-to-execute SQL file

**Example output:**
```sql
INSERT INTO products (name, description, price, stock, weight_kg, length_mm, width_mm, height_mm)
VALUES ('Lavender Dreams', 'Soothing lavender scent', 29.99, 15, 0.280, 90, 90, 80);
```

## Adding New Tools

When adding new database tools:

1. Place the tool in this directory
2. Document its purpose and usage in this README
3. Include example usage
4. Note any dependencies or requirements
5. Test with sample data before using on production

## Tool Standards

All tools in this directory should:
- ✅ Have a clear, single purpose
- ✅ Be safe to run (read-only when possible)
- ✅ Include error handling
- ✅ Provide helpful output/logging
- ✅ Be documented in this README

---

**Related:**
- Main database docs: `../README.md`
- Database exports: `../exports/`
- Migration scripts: `../migrations/`
