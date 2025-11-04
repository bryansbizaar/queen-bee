# Database Exports

Product data exports in various formats.

## Files

### products-export.csv
CSV export of all products with full details including dimensions, pricing, and descriptions.

**Use cases:**
- Importing into spreadsheet applications
- Data analysis and reporting
- Backup reference

### products-export.sql
PostgreSQL dump of products table with INSERT statements.

**Use cases:**
- Restoring product data to a database
- Seeding new database instances
- Version control of product catalog

### products-insert.sql
Clean INSERT statements for products table.

**Use cases:**
- Adding products to existing database
- Database migrations
- Testing and development seeding

## Generating New Exports

To export the current database state:

```bash
# CSV export (requires psql with copy permissions)
psql -h localhost -U queenbee -d queen_bee_candles \
  -c "\COPY products TO 'database/exports/products-export.csv' CSV HEADER"

# SQL export
pg_dump -h localhost -U queenbee -d queen_bee_candles \
  --table=products --data-only \
  > database/exports/products-export.sql
```

## Converting Between Formats

Use the conversion tool:
```bash
python3 database/tools/convert-csv-to-sql.py
```

See `../tools/README.md` for more details on conversion utilities.

---

**Related:**
- Main database docs: `../README.md`
- Migration scripts: `../migrations/`
- Conversion tools: `../tools/`
