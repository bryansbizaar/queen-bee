# Queen Bee Candles - Database Migration Scripts

This directory contains all scripts and documentation needed to migrate from local PostgreSQL to Docker PostgreSQL.

## 📁 Files Overview

### Migration Scripts
- **`backup-local-db.sh`** - Backs up local PostgreSQL database
- **`restore-to-docker.sh`** - Restores backup to Docker PostgreSQL
- **`verify-migration.sh`** - Tests migration success

### Documentation
- **`QUICK_MIGRATION.md`** - Fast-track migration checklist (⏱️ 10 minutes)
- **`MIGRATION_GUIDE.md`** - Comprehensive step-by-step guide
- **`init.sql`** - Database schema and initial seed data

### Generated Files
- **`backups/`** - Database backup files (created automatically)
  - `queen_bee_backup_YYYYMMDD_HHMMSS.sql` - Timestamped backups
  - `queen_bee_latest.sql` - Most recent backup (for easy access)

## 🚀 Quick Start

If you're ready to migrate right now:

```bash
# 1. Navigate to project root
cd /Users/bryanowens/Code/Websites/Candles/queen-bee

# 2. Follow the quick guide
cat database/QUICK_MIGRATION.md

# 3. Run migration (takes ~10 minutes)
./database/backup-local-db.sh
docker-compose down -v
docker-compose up -d postgres
./database/restore-to-docker.sh
./database/verify-migration.sh
```

## 📖 Detailed Guides

### For First-Time Migration
Read `QUICK_MIGRATION.md` first - it's a simple checklist format.

### For Understanding the Process
Read `MIGRATION_GUIDE.md` for comprehensive explanations.

### For Troubleshooting
Check the "Troubleshooting" section in `MIGRATION_GUIDE.md`.

## 🎯 Migration Goals

**Before Migration:**
- Local Mac PostgreSQL at `localhost:5432`
- Real order data and correct inventory
- Node.js connects to local database

**After Migration:**
- Docker PostgreSQL at `localhost:5432` (exposed from container)
- All data preserved and verified
- Node.js connects to Docker database
- Consistent, portable development environment

## ⚙️ Current Configuration

### Database Credentials (Both Local & Docker)
- **Database:** `queen_bee_candles`
- **User:** `queenbee`
- **Password:** `development123`
- **Port:** 5432

### Docker Container
- **Container Name:** `ecommerce-postgres`
- **Image:** `postgres:15-alpine`
- **Network:** `app-network`

## 🔍 Pre-Migration Checklist

- [ ] Docker Desktop installed and running
- [ ] Local PostgreSQL has all your data
- [ ] Node.js server can be stopped temporarily
- [ ] You have ~10 minutes available
- [ ] You've read `QUICK_MIGRATION.md`

## ⚡ Common Commands

### Backup Commands
```bash
# Create backup
./database/backup-local-db.sh

# List backups
ls -lh database/backups/

# View backup size
du -h database/backups/queen_bee_latest.sql
```

### Docker Commands
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Check status
docker ps | grep ecommerce-postgres

# View logs
docker logs ecommerce-postgres

# Connect to database
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles
```

### Restore Commands
```bash
# Restore to Docker
./database/restore-to-docker.sh

# Verify migration
./database/verify-migration.sh

# Manual verification
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "SELECT * FROM products;"
```

## 🛡️ Safety Features

### Backup Strategy
- Timestamped backups prevent overwriting
- `queen_bee_latest.sql` always points to newest backup
- Backups stored locally before any changes
- Easy rollback to local PostgreSQL if needed

### Zero Data Loss
- Backup created before any Docker operations
- Verification tests confirm data integrity
- Original local database remains untouched
- Multiple restore attempts possible

## 🔄 Rollback Process

If migration fails or you need to revert:

```bash
# 1. Stop Docker
docker-compose down

# 2. Restart local PostgreSQL
brew services start postgresql@15

# 3. Server auto-reconnects (DATABASE_HOST=localhost)
cd server && npm start

# Your data is safe!
```

## 📊 What Gets Migrated

✅ **Database Schema:**
- `products` table
- `customers` table
- `orders` table
- `order_items` table
- All indexes
- All foreign key constraints

✅ **Data:**
- All product information and inventory
- All customer records
- All order history
- All order items

✅ **Preserved Values:**
- Product IDs and SKUs
- Stock quantities
- Order totals and status
- Timestamps and metadata

## 🧪 Testing After Migration

The verification script tests:
1. Docker container is running
2. Database tables exist
3. Product data is present
4. Order data is preserved
5. Specific inventory levels match (Product 5: 7, Product 6: 8)
6. Server connectivity
7. Database indexes
8. Foreign key constraints

Run it with:
```bash
./database/verify-migration.sh
```

## 📞 Getting Help

### Check These First
1. Read error messages carefully
2. Check Docker is running: `docker ps`
3. Verify backup exists: `ls database/backups/`
4. Check server logs for connection errors

### Troubleshooting Resources
- `MIGRATION_GUIDE.md` - Has troubleshooting section
- Docker logs: `docker logs ecommerce-postgres`
- Server logs: Check terminal where server runs

### Common Issues

**"Connection refused"**
- Ensure Docker container is running
- Check port mapping: `docker port ecommerce-postgres`

**"Database does not exist"**
- Verify Docker .env has correct DATABASE_NAME
- Restart container: `docker-compose up -d postgres`

**"Empty database"**
- Re-run restore: `./database/restore-to-docker.sh`
- Check backup file size: `ls -lh database/backups/`

## 🎓 Learning Resources

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [PostgreSQL Backup/Restore](https://www.postgresql.org/docs/current/backup.html)
- [Node.js pg Module](https://node-postgres.com/)

## 📝 Notes

- Migration typically takes 5-10 minutes
- Zero downtime if you keep local PostgreSQL running during test
- Can switch between Docker and local by changing `DATABASE_HOST`
- Docker volumes persist data even when containers stop
- Always test thoroughly before going to production

## ✅ Post-Migration

After successful migration:
1. Test all application features
2. Verify inventory updates work
3. Process a test order
4. Optionally stop local PostgreSQL
5. Update your deployment documentation
6. Consider setting up automated backups

---

**Ready to migrate?** Start with `QUICK_MIGRATION.md`! 🚀
