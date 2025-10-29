# Migration Guide: Local PostgreSQL to Docker PostgreSQL

## Overview
This guide walks through migrating the Queen Bee Candles database from local Mac PostgreSQL to Docker PostgreSQL, preserving all real order data and inventory.

## Prerequisites
- Docker and Docker Compose installed
- Local PostgreSQL with `queen_bee_candles` database
- Node.js server currently connected to local database

## Migration Steps

### Step 1: Backup Local Database
```bash
# Navigate to project root
cd /Users/bryanowens/Code/Websites/Candles/queen-bee

# Make backup script executable
chmod +x database/backup-local-db.sh

# Run backup
./database/backup-local-db.sh
```

**What this does:**
- Creates timestamped backup in `database/backups/`
- Also saves as `queen_bee_latest.sql` for easy access
- Includes all tables, data, and schema

### Step 2: Stop Current Services
```bash
# Stop Node.js server
# Press Ctrl+C in the terminal running the server

# Stop any Docker containers (if running)
docker-compose down
```

### Step 3: Clean Docker PostgreSQL Volume (Optional but Recommended)
```bash
# Remove old Docker volume to start fresh
docker volume rm queen-bee_postgres_data

# Or remove all volumes
docker-compose down -v
```

### Step 4: Start Docker PostgreSQL
```bash
# Start only the PostgreSQL container
docker-compose up -d postgres

# Wait a few seconds for it to initialize
sleep 5

# Check it's running
docker ps | grep ecommerce-postgres
```

### Step 5: Restore Database to Docker
```bash
# Make restore script executable
chmod +x database/restore-to-docker.sh

# Run restore
./database/restore-to-docker.sh
```

**What this does:**
- Copies backup file into Docker container
- Restores all tables and data
- Verifies the restore completed successfully
- Shows table counts for verification

### Step 6: Update Server Configuration

**Option A: Update server/.env (Recommended for Docker setup)**

Edit `server/.env` and change:
```env
# Old (Local PostgreSQL)
DATABASE_HOST=localhost

# New (Docker PostgreSQL)
DATABASE_HOST=postgres
```

**Note:** When Node.js runs OUTSIDE Docker but connects to Docker PostgreSQL:
- Use `DATABASE_HOST=localhost` (keeps current setup)
- Docker exposes port 5432 to localhost

**Option B: Run Node.js in Docker (Future enhancement)**

If you later want to run Node.js inside Docker:
1. Add Node.js service to docker-compose.yml
2. Use `DATABASE_HOST=postgres` (internal Docker network name)
3. Both services communicate via `app-network`

### Step 7: Verify Migration

```bash
# Start the Node.js server
cd server
npm start
```

**Check server logs for:**
```
✅ Connected to PostgreSQL database
🔌 Database connection test successful
Connected to database: queen_bee_candles
```

**Test these operations:**
1. Browse products - verify correct stock levels (Product 5: 7, Product 6: 8)
2. View orders - verify all historical orders are present
3. Create a test order - verify it completes successfully
4. Check inventory updates - verify stock decreases correctly

### Step 8: Verify with pgAdmin

```bash
# Start pgAdmin
docker-compose up -d pgadmin

# Access at: http://localhost:8081
# Email: admin@queenbeecandles.com
# Password: admin123
```

**In pgAdmin:**
1. Add server connection:
   - Host: `postgres` (or `host.docker.internal` if needed)
   - Port: 5432
   - Database: queen_bee_candles
   - Username: queenbee
   - Password: development123

2. Verify tables and data match backup

### Step 9: Stop Local PostgreSQL (Optional)

Once migration is verified successful:

```bash
# Stop local PostgreSQL to prevent confusion
brew services stop postgresql@15

# Or stop specific version
brew services stop postgresql
```

**Benefits:**
- Only Docker PostgreSQL runs
- No port conflicts
- Consistent development environment

## Rollback Plan

If something goes wrong:

```bash
# Stop Docker
docker-compose down

# Start local PostgreSQL
brew services start postgresql@15

# Update server/.env back to localhost
DATABASE_HOST=localhost

# Restart Node.js server
cd server
npm start
```

## Configuration Files Reference

### Current Setup (Local PostgreSQL)
**server/.env:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123
```

### Docker Setup (Node.js outside Docker)
**server/.env:**
```env
DATABASE_HOST=localhost  # Docker exposes to localhost
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123
```

### Full Docker Setup (Future - Node.js in Docker)
**server/.env:**
```env
DATABASE_HOST=postgres  # Use Docker service name
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123
```

## Troubleshooting

### Issue: "Connection refused" after migration
**Solution:** 
- Verify Docker container is running: `docker ps`
- Check port mapping: `docker port ecommerce-postgres`
- Ensure server/.env has correct DATABASE_HOST

### Issue: "Database does not exist"
**Solution:**
- Check Docker .env has correct DATABASE_NAME
- Recreate container: `docker-compose down -v && docker-compose up -d postgres`

### Issue: Empty database after restore
**Solution:**
- Verify backup file exists: `ls -lh database/backups/`
- Check backup file size (should be > 0 bytes)
- Re-run restore script with verbose output

### Issue: Old data in Docker PostgreSQL
**Solution:**
- Remove volume: `docker volume rm queen-bee_postgres_data`
- Start fresh: `docker-compose up -d postgres`
- Re-run restore

## Post-Migration Checklist

- [ ] Backup created successfully
- [ ] Docker PostgreSQL running
- [ ] Database restored with correct data
- [ ] Server connects to Docker database
- [ ] All products show correct stock levels
- [ ] Historical orders are present
- [ ] New orders can be created
- [ ] Inventory updates work correctly
- [ ] pgAdmin can connect
- [ ] Local PostgreSQL stopped (optional)
- [ ] Backup files stored safely

## Maintenance

### Regular Backups
Create a cron job or scheduled task:
```bash
# Run daily backup at 2 AM
0 2 * * * cd /Users/bryanowens/Code/Websites/Candles/queen-bee && ./database/backup-local-db.sh
```

### Backup Docker Database
```bash
# Export from Docker
docker exec ecommerce-postgres pg_dump -U queenbee queen_bee_candles > backup.sql

# Or use the existing script (modify to point to Docker)
```

## Additional Resources

- Docker Compose documentation: https://docs.docker.com/compose/
- PostgreSQL backup/restore: https://www.postgresql.org/docs/current/backup.html
- Node.js pg module: https://node-postgres.com/

## Notes

- **Important:** After migration, local PostgreSQL can be stopped but keep it installed as backup
- Docker volumes persist data even when containers are removed
- Always test in development before deploying to production
- Keep multiple backup copies in different locations
