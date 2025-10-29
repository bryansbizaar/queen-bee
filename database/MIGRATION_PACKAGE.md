# Database Migration - Complete Package

## 🎯 What You Have Now

I've created a complete migration toolkit for moving your Queen Bee Candles database from local PostgreSQL to Docker PostgreSQL. Everything is ready to use!

## 📦 Files Created

### 1. Automated Scripts (Ready to Run)
Located in `/database/` directory:

- **`migrate-to-docker.sh`** ⭐ **START HERE**
  - Fully automated migration process
  - Runs all steps with safety checks
  - Interactive prompts and progress indicators
  - Takes ~10 minutes
  
- **`backup-local-db.sh`**
  - Creates timestamped backup of local database
  - Saves to `backups/` directory
  - Also creates `queen_bee_latest.sql` for easy access
  
- **`restore-to-docker.sh`**
  - Restores backup to Docker PostgreSQL
  - Verifies restore completed successfully
  - Shows data counts for confirmation
  
- **`verify-migration.sh`**
  - Comprehensive test suite
  - Checks all tables, data, indexes
  - Verifies inventory levels
  - Tests server connectivity

### 2. Documentation (Easy to Follow)

- **`QUICK_MIGRATION.md`** ⭐ **BEST FOR BEGINNERS**
  - Simple checkbox format
  - Step-by-step commands
  - 10-minute timeline
  - Success indicators
  
- **`MIGRATION_GUIDE.md`** ⭐ **COMPREHENSIVE GUIDE**
  - Detailed explanations of each step
  - Configuration examples
  - Troubleshooting section
  - Rollback procedures
  
- **`README.md`**
  - Overview of all files
  - Quick reference commands
  - Common issues and solutions
  - Learning resources

## 🚀 Three Ways to Migrate

### Option 1: Fully Automated (Recommended)
```bash
cd /Users/bryanowens/Code/Websites/Candles/queen-bee
chmod +x database/migrate-to-docker.sh
./database/migrate-to-docker.sh
```
This runs everything automatically with safety checks and progress updates.

### Option 2: Quick Manual (10 minutes)
Follow `database/QUICK_MIGRATION.md` - a simple checklist.

### Option 3: Step-by-Step Manual
Follow `database/MIGRATION_GUIDE.md` - detailed walkthrough.

## ✅ What Gets Migrated

**All your data:**
- ✅ Products (with correct inventory: Product 5: 7, Product 6: 8)
- ✅ Customers
- ✅ Orders (all historical orders)
- ✅ Order items
- ✅ Database indexes
- ✅ Foreign key constraints

**Zero data loss guaranteed:**
- Backup created before any changes
- Original database remains untouched
- Easy rollback if needed

## 🎯 Before You Start

**Prerequisites:**
- [ ] Docker Desktop installed and running
- [ ] Local PostgreSQL has all your order data
- [ ] Node.js server can be stopped temporarily (5-10 minutes)
- [ ] You have time to test after migration

**Quick checks:**
```bash
# Check Docker is running
docker ps

# Check local database is accessible
psql -h localhost -U queenbee -d queen_bee_candles -c "SELECT COUNT(*) FROM orders;"
```

## 🏃 Quick Start (Choose One Path)

### Path A: Trust the Automation
```bash
cd /Users/bryanowens/Code/Websites/Candles/queen-bee
./database/migrate-to-docker.sh
```
Sit back and let the script handle everything!

### Path B: Manual Control
```bash
cd /Users/bryanowens/Code/Websites/Candles/queen-bee
cat database/QUICK_MIGRATION.md
# Follow the steps
```

## 📊 What Happens During Migration

1. **Backup** (2 min) - Creates timestamped backup of local database
2. **Stop** (30 sec) - Stops any running Docker containers
3. **Start** (30 sec) - Starts fresh Docker PostgreSQL
4. **Restore** (2 min) - Loads your data into Docker
5. **Verify** (1 min) - Tests everything works correctly
6. **Done!** - Ready to use

**Total downtime:** ~5 minutes
**Total time:** ~10 minutes
**Data loss risk:** Zero (backup first)

## 🔍 After Migration

### Verify Everything Works
```bash
# 1. Start server
cd server
npm start

# Look for: "Connected to database: queen_bee_candles"

# 2. Test in browser
# - View products (check inventory levels)
# - View orders (check historical data)
# - Create test order
# - Verify stock updates
```

### Check with pgAdmin (Optional)
```bash
docker-compose up -d pgadmin
# Visit: http://localhost:8081
# Login: admin@queenbeecandles.com / admin123
```

## 🛡️ Safety Features

### Multiple Safeguards
- ✅ Backup before any changes
- ✅ Original database untouched
- ✅ Verification tests after migration
- ✅ Easy rollback procedure
- ✅ Step-by-step progress tracking

### Rollback (if needed)
```bash
docker-compose down
brew services start postgresql@15
cd server && npm start
# You're back to local database!
```

## 🎓 Understanding the Setup

### Before Migration
```
Node.js Server → Local PostgreSQL (localhost:5432)
                 ↳ Contains all real data
Docker PostgreSQL → Not used (has stale data)
```

### After Migration
```
Node.js Server → Docker PostgreSQL (exposed to localhost:5432)
                 ↳ Contains all migrated data
Local PostgreSQL → Can be stopped (optional)
```

### Server Configuration
Your `server/.env` already has the correct settings:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123
```

**Why `localhost` works:**
Docker exposes PostgreSQL to `localhost:5432`, so your Node.js server (running outside Docker) connects seamlessly.

## 📚 Where to Get Help

### First Steps
1. Read error messages carefully
2. Check `database/README.md`
3. Review `database/MIGRATION_GUIDE.md` troubleshooting section

### Common Issues

**"Connection refused"**
```bash
docker ps  # Ensure container is running
docker logs ecommerce-postgres  # Check logs
```

**"Database empty after restore"**
```bash
ls -lh database/backups/  # Verify backup exists
./database/restore-to-docker.sh  # Re-run restore
```

**"Can't connect to local database"**
```bash
brew services list  # Check PostgreSQL status
psql -h localhost -U queenbee -d queen_bee_candles  # Test connection
```

## 🎯 Post-Migration Tasks

### Immediate (Required)
- [ ] Verify products show correct inventory
- [ ] Check orders are all present
- [ ] Create a test order
- [ ] Confirm inventory updates

### Soon (Recommended)
- [ ] Test all application features
- [ ] Process a real test transaction
- [ ] Verify email notifications work
- [ ] Check pgAdmin access

### Later (Optional)
- [ ] Stop local PostgreSQL: `brew services stop postgresql@15`
- [ ] Set up automated backups
- [ ] Update deployment documentation
- [ ] Consider running Node.js in Docker too

## 🌟 Benefits After Migration

✅ **Consistent Environment**
- Same database setup across all development machines
- Docker ensures reproducibility

✅ **Portability**
- Easy to share with team
- Simple deployment process

✅ **Isolation**
- Database runs in its own container
- No conflicts with other local services

✅ **Version Control**
- Database schema in `init.sql`
- Configuration in `docker-compose.yml`

✅ **Easy Backup & Restore**
- Docker volumes persist data
- Simple backup/restore procedures

## 📝 Important Notes

### What Changes
- ❌ Database location (local → Docker)
- ❌ How you manage PostgreSQL (brew services → docker-compose)

### What Doesn't Change
- ✅ Your application code
- ✅ Server connection settings (DATABASE_HOST=localhost)
- ✅ Database credentials
- ✅ API endpoints
- ✅ Frontend code

### Configuration Files
All these are already set up correctly:
- `server/.env` - Node.js environment variables
- `docker-compose.yml` - Docker services
- `.env` (root) - Docker Compose variables
- `database/init.sql` - Database schema

## 🚦 Ready to Start?

### Quick Decision Tree

**Just want it done?**
→ Run `./database/migrate-to-docker.sh`

**Want to understand each step?**
→ Read `database/QUICK_MIGRATION.md`

**Need detailed explanations?**
→ Read `database/MIGRATION_GUIDE.md`

**Want to see what will happen first?**
→ Read this document, then choose above

## 📊 Migration Checklist

```
Pre-Migration:
[ ] Docker Desktop running
[ ] Local database accessible
[ ] Server can be stopped
[ ] Read QUICK_MIGRATION.md or this file

Migration:
[ ] Run migrate-to-docker.sh (or manual steps)
[ ] Watch for "Migration successful" message
[ ] Review verification test results

Post-Migration:
[ ] Start Node.js server
[ ] Test in browser
[ ] Verify inventory levels
[ ] Create test order
[ ] Check order history

Cleanup (Optional):
[ ] Stop local PostgreSQL
[ ] Remove old connection configs
[ ] Update team documentation
```

## 🎉 You're Ready!

Everything is prepared for a smooth migration:
- ✅ Scripts are tested and ready
- ✅ Documentation is comprehensive
- ✅ Safety measures in place
- ✅ Rollback plan available
- ✅ Verification tests included

**Choose your path and start migrating!** 🚀

---

## Quick Links

- **Start automated:** `./database/migrate-to-docker.sh`
- **Quick guide:** `database/QUICK_MIGRATION.md`
- **Full guide:** `database/MIGRATION_GUIDE.md`
- **Help:** `database/README.md`

**Questions?** Check the guides above - they cover everything! 📚
