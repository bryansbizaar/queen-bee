# Database Setup

This directory contains the database schema and migrations for the e-commerce platform.

## Quick Start

### Initial Setup
```bash
# Create database and run initial schema
psql -h localhost -U your_username -d your_database_name -f init.sql
```

This creates:
- Products table with sample products
- Customers table
- Orders and order_items tables
- Necessary indexes

### Run Migrations (In Order)
```bash
# Add dimension columns for shipping calculator
psql -h localhost -U your_username -d your_database_name -f migrations/001_add_product_dimensions.sql

# Add dimensions to additional products
psql -h localhost -U your_username -d your_database_name -f migrations/002_add_dimensions_to_new_products.sql
```

## Database Configuration

Configure your database connection in `server/.env`:
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=your_database_name
DATABASE_USER=your_username
DATABASE_PASSWORD=your_secure_password
```

> **Security Note**: Never commit your actual `.env` file to version control. Use `.env.example` as a template.

## Schema Overview

### Products Table
- Core product information (title, description, price, image)
- Inventory management (stock_quantity, is_active)
- Display controls (is_featured, display_order)
- Shipping dimensions (weight_kg, length_mm, width_mm, height_mm)

### Customers Table
- Customer contact information
- Email as unique identifier

### Orders Table
- Order tracking and status
- Payment integration (Stripe payment_intent_id)
- Customer relationship

### Order Items Table
- Individual line items per order
- Product snapshot (title, price at time of order)
- Quantity tracking

## Migrations

Migrations are numbered and should be run in order. Each migration is idempotent (safe to run multiple times).

- `001_add_product_dimensions.sql` - Adds weight and dimension columns for shipping calculations
- `002_add_dimensions_to_new_products.sql` - Populates dimensions for products (customize for your products)

## Verification

Check database structure:
```bash
psql -h localhost -U your_username -d your_database_name -c "\d products"
```

Verify products have dimensions:
```bash
psql -h localhost -U your_username -d your_database_name -c "
SELECT title, weight_kg, length_mm, width_mm, height_mm 
FROM products 
LIMIT 5;"
```

## Customization

This schema is designed to be generic and adaptable:

1. **Sample Products**: `init.sql` includes sample products - replace with your own
2. **Migrations**: Adapt migration 002 with your actual product dimensions
3. **Schema**: Extend tables as needed for your specific requirements

## Additional Documentation

For detailed guides and examples, see:
- [`/docs/archive/database/`](../docs/archive/database/) - Migration guides, product management, and troubleshooting tools

## Notes

- Product prices are stored in cents (e.g., 1500 = $15.00)
- Shipping dimensions are for products only (packaging is calculated separately by the system)
- All timestamps use UTC
- Currency handling: Default is NZD but can be configured in the application
