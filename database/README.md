# Queen Bee Candles - Database

## 📁 Current Structure

```
database/
├── README.md                    # This file
├── init.sql                     # Database schema (used by Docker)
├── migrations/                  # Schema version control
│   ├── 001_add_product_dimensions.sql
│   └── 002_add_dimensions_to_new_products.sql
├── backup-local-db.sh          # Create database backup
├── migrate-to-docker.sh        # Full automated migration (archived use-case)
├── restore-to-docker.sh        # Restore from backup
└── verify-migration.sh         # Verify database integrity
```

## 🗄️ Database Configuration

**Current Setup:** Docker PostgreSQL
- **Container:** `ecommerce-postgres`
- **Database:** `queen_bee_candles`
- **User:** `queenbee`
- **Port:** `5432` (exposed to localhost)
- **Network:** `app-network`

**Connection String:**
```
postgresql://queenbee:development123@localhost:5432/queen_bee_candles
```

## 🚀 Common Operations

### Start Database
```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Verify it's running
docker ps | grep ecommerce-postgres
```

### Stop Database
```bash
# Stop PostgreSQL container
docker-compose stop postgres

# Or stop all services
docker-compose down
```

### View Logs
```bash
# View PostgreSQL logs
docker logs ecommerce-postgres

# Follow logs in real-time
docker logs -f ecommerce-postgres
```

### Connect to Database
```bash
# Using psql from host
psql -h localhost -p 5432 -U queenbee -d queen_bee_candles

# Or connect from within container
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles
```

### Backup Database
```bash
# Create timestamped backup
./database/backup-local-db.sh

# Backups saved to: database/backups/
```

### Restore Database
```bash
# Restore from latest backup
./database/restore-to-docker.sh

# Or restore from specific backup
docker exec -i ecommerce-postgres psql -U queenbee -d queen_bee_candles \
  < database/backups/queen_bee_backup_YYYYMMDD_HHMMSS.sql
```

### Reset Database
```bash
# Complete reset (destroys all data)
docker-compose down -v
docker-compose up -d postgres

# Database will reinitialize from init.sql
```

## 📊 Database Schema

### Tables
- **products** - Product catalog with inventory
- **customers** - Customer records
- **orders** - Order history
- **order_items** - Order line items

### Key Fields
```sql
-- Products
id, title, description, price, image, category, stock_quantity, is_active

-- Orders
id, order_id, customer_email, status, total_amount, payment_intent_id

-- Order Items
id, order_id, product_id, quantity, unit_price, total_price
```

## 🔧 Schema Migrations

### Apply Migration
```bash
# Create new migration file
touch database/migrations/003_your_migration.sql

# Apply migration
docker exec -i ecommerce-postgres psql -U queenbee -d queen_bee_candles \
  < database/migrations/003_your_migration.sql
```

### Migration Best Practices
- Name files with incremental numbers: `001_`, `002_`, etc.
- Include both UP and DOWN migrations
- Test on backup before applying to production
- Document what each migration does

## 🛡️ Backup Strategy

### Automatic Backups
The `backup-local-db.sh` script creates:
- Timestamped backup: `queen_bee_backup_YYYYMMDD_HHMMSS.sql`
- Convenience link: `queen_bee_latest.sql`

### Backup Schedule (Recommended)
```bash
# Add to crontab for daily backups at 2am
0 2 * * * cd /path/to/queen-bee && ./database/backup-local-db.sh
```

### Backup Contents
- Complete schema (tables, indexes, constraints)
- All data (products, orders, customers)
- Settings and sequences

## 🧪 Testing

### Verify Database Health
```bash
# Run verification script
./database/verify-migration.sh

# Manual verification queries
docker exec ecommerce-postgres psql -U queenbee -d queen_bee_candles \
  -c "SELECT COUNT(*) FROM products;"

docker exec ecommerce-postgres psql -U queenbee -d queen_bee_candles \
  -c "SELECT COUNT(*) FROM orders;"
```

## 📞 Quick Troubleshooting

### Container Won't Start
```bash
# Check Docker is running
docker ps

# Check logs for errors
docker logs ecommerce-postgres

# Restart container
docker-compose restart postgres
```

### Connection Refused
```bash
# Verify container is running
docker ps | grep ecommerce-postgres

# Check port mapping
docker port ecommerce-postgres
# Should show: 5432/tcp -> 0.0.0.0:5432

# Verify server config
cat server/.env | grep DATABASE_HOST
# Should be: DATABASE_HOST=localhost
```

### Database Empty After Start
```bash
# Check if init.sql exists and has content
cat database/init.sql

# Restore from backup
./database/restore-to-docker.sh
```

## 📚 Additional Documentation

For historical context and migration details, see:
- **Migration Documentation:** `docs/archive/database/`
- **Product Management:** `docs/archive/database/PRODUCT_MANAGEMENT.md`

## 🔑 Environment Variables

**Docker Compose (.env in root):**
```env
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123
```

**Server (server/.env):**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123
```

## ⚙️ Docker Volume

Data is persisted in Docker volume: `queen-bee_postgres_data`

```bash
# Inspect volume
docker volume inspect queen-bee_postgres_data

# Remove volume (destroys all data)
docker volume rm queen-bee_postgres_data
```

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Start DB | `docker-compose up -d postgres` |
| Stop DB | `docker-compose stop postgres` |
| View logs | `docker logs ecommerce-postgres` |
| Connect | `psql -h localhost -U queenbee -d queen_bee_candles` |
| Backup | `./database/backup-local-db.sh` |
| Restore | `./database/restore-to-docker.sh` |
| Reset | `docker-compose down -v && docker-compose up -d postgres` |

---

**Need help?** Check the troubleshooting section above or review the archived migration docs in `docs/archive/database/`.
