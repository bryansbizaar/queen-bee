# Quick Migration Checklist

## Pre-Migration
- [ ] All orders and inventory data is in local PostgreSQL
- [ ] Docker Desktop is running
- [ ] Node.js server is stopped
- [ ] You have 5-10 minutes available

## Step-by-Step Commands

### 1. Backup (2 minutes)
```bash
cd /Users/bryanowens/Code/Websites/Candles/queen-bee
chmod +x database/backup-local-db.sh
./database/backup-local-db.sh
```
✅ Look for: "Backup successful!" message

### 2. Prepare Docker (1 minute)
```bash
docker-compose down -v
docker-compose up -d postgres
sleep 5
docker ps | grep ecommerce-postgres
```
✅ Look for: Container status "Up"

### 3. Restore (2 minutes)
```bash
chmod +x database/restore-to-docker.sh
./database/restore-to-docker.sh
```
✅ Look for: Product and order counts matching your data

### 4. Update Config (1 minute)
**Keep server/.env as is:**
```env
DATABASE_HOST=localhost
```
(Already correct for Node.js outside Docker)

### 5. Test (2 minutes)
```bash
cd server
npm start
```
✅ Look for: "Connected to PostgreSQL database"

### 6. Verify in Browser
- [ ] Products show correct stock (e.g., Product 5: 7, Product 6: 8)
- [ ] Can view all historical orders
- [ ] Can create a test order
- [ ] Inventory updates after order

### 7. Optional: Stop Local PostgreSQL
```bash
brew services stop postgresql@15
```

## Quick Rollback (if needed)
```bash
docker-compose down
brew services start postgresql@15
# Server will auto-reconnect to local DB
```

## Expected Timeline
- Total time: ~10 minutes
- Downtime: ~5 minutes (during restore)
- Zero data loss

## Success Indicators
✅ Server log shows "Connected to database: queen_bee_candles"
✅ Product stock matches pre-migration values
✅ All orders are visible
✅ New orders process correctly
✅ pgAdmin can connect at localhost:8081

## If Something Goes Wrong
1. Stop: Press Ctrl+C
2. Check: Read error message carefully
3. Rollback: Use commands above
4. Restore: Your data is safe in backups/
5. Retry: Fix issue and try again

## Support Files Created
- `backup-local-db.sh` - Creates database backup
- `restore-to-docker.sh` - Restores to Docker
- `MIGRATION_GUIDE.md` - Detailed walkthrough
- `backups/` - Your database backups stored here
