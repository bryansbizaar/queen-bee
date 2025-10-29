# Migration Troubleshooting Guide

## Quick Problem Solver

### 🔍 Find Your Issue Fast

**Choose the symptom that matches your problem:**

1. [Backup fails](#backup-fails)
2. [Docker won't start](#docker-wont-start)
3. [Restore fails](#restore-fails)
4. [Server won't connect](#server-wont-connect)
5. [Wrong data after migration](#wrong-data-after-migration)
6. [Port conflicts](#port-conflicts)
7. [Permission errors](#permission-errors)
8. [Migration script errors](#migration-script-errors)

---

## Common Issues and Solutions

### Backup Fails

#### Problem: "pg_dump: command not found"
```bash
bash: pg_dump: command not found
```

**Solution:**
PostgreSQL client tools not installed. Install them:
```bash
# macOS
brew install postgresql@15

# Verify
pg_dump --version
```

#### Problem: "Connection refused to localhost:5432"
```bash
pg_dump: error: connection to server at "localhost" (::1), port 5432 failed
```

**Solution:**
Local PostgreSQL is not running.
```bash
# Check if running
brew services list | grep postgresql

# Start it
brew services start postgresql@15

# Verify connection
psql -h localhost -U queenbee -d queen_bee_candles -c "SELECT 1;"
```

#### Problem: "Password authentication failed"
```bash
psql: error: password authentication failed for user "queenbee"
```

**Solution:**
Wrong password or user doesn't exist.
```bash
# Verify credentials in backup-local-db.sh match your setup
# Default: queenbee / development123

# Test connection manually
PGPASSWORD=development123 psql -h localhost -U queenbee -d queen_bee_candles
```

#### Problem: "Database does not exist"
```bash
pg_dump: error: database "queen_bee_candles" does not exist
```

**Solution:**
Database name is wrong or database wasn't created.
```bash
# List databases
psql -h localhost -U queenbee -l

# If missing, your data might be in a different database
# Check all databases for your tables
```

---

### Docker Won't Start

#### Problem: "Docker daemon not running"
```bash
Cannot connect to the Docker daemon
```

**Solution:**
Start Docker Desktop.
```bash
# macOS: Open Docker Desktop application
# Wait for whale icon to show in menu bar

# Verify
docker ps
```

#### Problem: "Port 5432 already in use"
```bash
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Solution:**
Local PostgreSQL is still running on port 5432.

**Option A: Stop local PostgreSQL (recommended after migration)**
```bash
brew services stop postgresql@15
docker-compose up -d postgres
```

**Option B: Change Docker port temporarily**
```bash
# Edit docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 externally

# Update server/.env
DATABASE_PORT=5433

# Start Docker
docker-compose up -d postgres
```

#### Problem: "No space left on device"
```bash
Error: No space left on device
```

**Solution:**
Docker out of disk space.
```bash
# Clean up Docker
docker system prune -a --volumes

# Check disk space
docker system df

# Remove old volumes
docker volume ls
docker volume rm <unused-volumes>
```

#### Problem: "Container name already in use"
```bash
Error: Conflict. The container name "/ecommerce-postgres" is already in use
```

**Solution:**
Old container still exists.
```bash
# Remove old container
docker rm -f ecommerce-postgres

# Or use docker-compose
docker-compose down
docker-compose up -d postgres
```

---

### Restore Fails

#### Problem: "Backup file not found"
```bash
❌ Backup file not found: ./backups/queen_bee_latest.sql
```

**Solution:**
Backup wasn't created or wrong path.
```bash
# Check if backup exists
ls -la database/backups/

# Create backup if missing
./database/backup-local-db.sh

# Verify file created
ls -lh database/backups/queen_bee_latest.sql
```

#### Problem: "Container not running"
```bash
❌ Docker container 'ecommerce-postgres' is not running
```

**Solution:**
Start the container.
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Wait a few seconds
sleep 5

# Verify running
docker ps | grep ecommerce-postgres

# Retry restore
./database/restore-to-docker.sh
```

#### Problem: "FATAL: database does not exist"
```bash
psql: FATAL: database "queen_bee_candles" does not exist
```

**Solution:**
Database wasn't created in Docker.
```bash
# Check .env file (root directory)
cat .env
# Should have: DATABASE_NAME=queen_bee_candles

# Recreate container
docker-compose down -v
docker-compose up -d postgres

# Wait for initialization
sleep 10

# Retry restore
./database/restore-to-docker.sh
```

#### Problem: "Relation already exists"
```bash
ERROR: relation "products" already exists
```

**Solution:**
Database already has tables (partial restore).
```bash
# Clean start
docker-compose down -v
docker-compose up -d postgres
sleep 10

# Restore again
./database/restore-to-docker.sh
```

#### Problem: "Out of memory"
```bash
ERROR: out of memory
```

**Solution:**
Docker needs more memory.
```bash
# Increase Docker memory in Docker Desktop:
# Settings → Resources → Memory → Increase to 4GB+

# Restart Docker Desktop
# Retry restore
```

---

### Server Won't Connect

#### Problem: "Connection refused" from Node.js
```bash
❌ PostgreSQL connection error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
Docker PostgreSQL not running or wrong config.

**Check 1: Container running?**
```bash
docker ps | grep ecommerce-postgres
```
If not running: `docker-compose up -d postgres`

**Check 2: Port mapping correct?**
```bash
docker port ecommerce-postgres
# Should show: 5432/tcp -> 0.0.0.0:5432
```

**Check 3: Server config correct?**
```bash
cat server/.env
# Should have:
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
```

**Check 4: Test connection manually**
```bash
psql -h localhost -p 5432 -U queenbee -d queen_bee_candles
```

#### Problem: "Database does not exist" from server
```bash
error: database "queen_bee_candles" does not exist
```

**Solution:**
Wrong database name in server config.
```bash
# Check server/.env
cat server/.env | grep DATABASE_NAME
# Should be: DATABASE_NAME=queen_bee_candles

# Check what databases exist
docker exec -it ecommerce-postgres psql -U queenbee -l

# If different name, update server/.env
```

#### Problem: "Password authentication failed"
```bash
error: password authentication failed for user "queenbee"
```

**Solution:**
Password mismatch between server config and Docker.

**Check server/.env:**
```bash
cat server/.env | grep DATABASE_PASSWORD
# Should be: DATABASE_PASSWORD=development123
```

**Check Docker .env:**
```bash
cat .env | grep DATABASE_PASSWORD
# Should be: DATABASE_PASSWORD=development123
```

If different, make them match and restart:
```bash
docker-compose down
docker-compose up -d postgres
```

#### Problem: "Too many connections"
```bash
error: sorry, too many clients already
```

**Solution:**
Connection pool exhausted.
```bash
# Restart server
# Ctrl+C then npm start

# Or restart Docker container
docker-compose restart postgres
```

---

### Wrong Data After Migration

#### Problem: Products have old stock levels
```
Expected: Product 5 has 7 stock
Actual: Product 5 has 10 stock
```

**Solution:**
Wrong backup was restored or backup was from old state.

**Check 1: Verify backup has correct data**
```bash
# Extract products from backup
grep "INSERT INTO products" database/backups/queen_bee_latest.sql
```

**Check 2: Create fresh backup**
```bash
# Backup again from local database
./database/backup-local-db.sh

# Verify it has current data
grep -A 10 "INSERT INTO products" database/backups/queen_bee_latest.sql
```

**Check 3: Restore fresh backup**
```bash
# Clean Docker database
docker-compose down -v
docker-compose up -d postgres
sleep 10

# Restore fresh backup
./database/restore-to-docker.sh
```

#### Problem: Orders are missing
```bash
Expected: 15 orders
Actual: 0 orders
```

**Solution:**
Backup was created before orders existed, or restore failed.

**Check local database:**
```bash
psql -h localhost -U queenbee -d queen_bee_candles -c "SELECT COUNT(*) FROM orders;"
```

**If local has orders:**
```bash
# Create fresh backup
./database/backup-local-db.sh

# Restore to Docker
docker-compose down -v
docker-compose up -d postgres
./database/restore-to-docker.sh
```

**If local has no orders:**
Your orders might be in a different database or table.

---

### Port Conflicts

#### Problem: Both databases running on 5432
```
Local PostgreSQL: localhost:5432 ✅
Docker PostgreSQL: localhost:5432 ❌ (can't start)
```

**Solution A: Stop local before starting Docker**
```bash
brew services stop postgresql@15
docker-compose up -d postgres
```

**Solution B: Use different port for Docker**
```bash
# Edit docker-compose.yml
ports:
  - "5433:5432"

# Edit server/.env
DATABASE_PORT=5433

# Start Docker
docker-compose up -d postgres
```

---

### Permission Errors

#### Problem: "Permission denied" running scripts
```bash
bash: ./database/backup-local-db.sh: Permission denied
```

**Solution:**
Scripts need execute permission.
```bash
# Make scripts executable
chmod +x database/*.sh

# Or individually
chmod +x database/backup-local-db.sh
chmod +x database/restore-to-docker.sh
chmod +x database/verify-migration.sh
chmod +x database/migrate-to-docker.sh

# Retry
./database/backup-local-db.sh
```

#### Problem: "Cannot write to backups directory"
```bash
mkdir: cannot create directory 'backups': Permission denied
```

**Solution:**
No write permission in database directory.
```bash
# Check permissions
ls -la database/

# Fix permissions
chmod 755 database/
mkdir -p database/backups
chmod 755 database/backups

# Retry backup
./database/backup-local-db.sh
```

---

### Migration Script Errors

#### Problem: "Command not found: docker-compose"
```bash
docker-compose: command not found
```

**Solution:**
Use `docker compose` (new syntax) or install docker-compose.
```bash
# Try new syntax
docker compose up -d postgres

# Or install old version
brew install docker-compose
```

#### Problem: Script fails at specific step
```bash
❌ Backup failed!
```

**Solution:**
Run steps manually to see detailed errors.
```bash
# Instead of automated script, run each step:

# 1. Backup
PGPASSWORD=development123 pg_dump \
  -h localhost \
  -U queenbee \
  -d queen_bee_candles \
  --clean \
  --if-exists \
  --no-owner \
  > database/backups/manual_backup.sql

# 2. Start Docker
docker-compose down -v
docker-compose up -d postgres

# 3. Restore
docker exec -i ecommerce-postgres psql \
  -U queenbee \
  -d queen_bee_candles \
  < database/backups/manual_backup.sql

# 4. Verify
docker exec ecommerce-postgres psql \
  -U queenbee \
  -d queen_bee_candles \
  -c "SELECT COUNT(*) FROM products;"
```

---

## Verification Checklist

After fixing any issue, verify migration:

```bash
# 1. Container running
docker ps | grep ecommerce-postgres
# Expected: Container status "Up"

# 2. Database accessible
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "SELECT 1;"
# Expected: Returns 1

# 3. Tables exist
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "\dt"
# Expected: Shows products, orders, customers, order_items

# 4. Data present
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "SELECT COUNT(*) FROM products;"
# Expected: Your product count

# 5. Inventory correct
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "SELECT id, title, stock_quantity FROM products WHERE id IN (5,6);"
# Expected: Product 5: 7 stock, Product 6: 8 stock

# 6. Server connects
cd server && npm start
# Expected: "Connected to database: queen_bee_candles"

# 7. Run verification script
./database/verify-migration.sh
# Expected: All tests pass
```

---

## Emergency Rollback

If nothing works and you need to get back quickly:

```bash
# 1. Stop Docker completely
docker-compose down -v

# 2. Start local PostgreSQL
brew services start postgresql@15

# 3. Verify local database
psql -h localhost -U queenbee -d queen_bee_candles -c "SELECT COUNT(*) FROM products;"

# 4. Server should auto-connect
cd server && npm start

# Your original data is safe!
```

---

## Getting Detailed Logs

### Docker Container Logs
```bash
# PostgreSQL logs
docker logs ecommerce-postgres

# Follow in real-time
docker logs -f ecommerce-postgres

# Last 100 lines
docker logs --tail 100 ecommerce-postgres

# With timestamps
docker logs --timestamps ecommerce-postgres
```

### Server Logs
```bash
# In server terminal, you'll see:
# ✅ Connection successful
# ❌ Connection errors with details

# Enable verbose logging in server/config/database.js
# (Already included in your setup)
```

### Docker System Info
```bash
# Container status
docker ps -a

# Network info
docker network inspect queen-bee_app-network

# Volume info
docker volume ls
docker volume inspect queen-bee_postgres_data

# Disk usage
docker system df
```

---

## Prevention Tips

### Before Migration
- ✅ Backup multiple times
- ✅ Test backup by examining contents
- ✅ Ensure Docker has enough disk space (5GB+)
- ✅ Close other applications using port 5432
- ✅ Read Quick Migration guide first

### During Migration
- ✅ Follow scripts in order
- ✅ Don't skip verification steps
- ✅ Watch for error messages
- ✅ Don't force-quit processes
- ✅ Wait for containers to fully start

### After Migration
- ✅ Test thoroughly before deleting local database
- ✅ Keep backups for at least a week
- ✅ Document any custom changes
- ✅ Set up regular backup schedule

---

## Still Stuck?

### Information to Gather

1. **System Info**
```bash
sw_vers  # macOS version
docker --version
docker-compose --version
psql --version
```

2. **Container Status**
```bash
docker ps -a
docker logs ecommerce-postgres --tail 50
```

3. **Config Files**
```bash
cat server/.env | grep DATABASE
cat .env | grep DATABASE
```

4. **Error Messages**
- Copy full error message
- Note which step failed
- Include command that was run

### Check Documentation
- `database/MIGRATION_GUIDE.md` - Detailed guide
- `database/QUICK_MIGRATION.md` - Quick steps
- `database/README.md` - Overview
- `database/ARCHITECTURE.md` - How it works

### Common Fixes Summary
| Problem | Quick Fix |
|---------|-----------|
| Backup fails | Check PostgreSQL running: `brew services start postgresql@15` |
| Docker won't start | Stop local PostgreSQL: `brew services stop postgresql@15` |
| Restore fails | Clean start: `docker-compose down -v && docker-compose up -d postgres` |
| Server won't connect | Check `DATABASE_HOST=localhost` in server/.env |
| Wrong data | Fresh backup + restore: `./database/backup-local-db.sh && ./database/restore-to-docker.sh` |
| Permission errors | Make executable: `chmod +x database/*.sh` |

---

**Remember:** Your data is always safe in the backup files. You can always rollback and try again!
