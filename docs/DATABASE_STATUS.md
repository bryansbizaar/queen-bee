# Queen Bee Candles - Database Status (VERIFIED Nov 4, 2025)

## ✅ ACTUAL CURRENT STATE (Verified)

### Development (Local)
- **Database:** Docker PostgreSQL
- **Container:** `ecommerce-postgres` 
- **Database Name:** `queen_bee_candles`
- **Products:** 26 products with full data
- **Connection:** `localhost:5432` (Docker port mapping)
- **Status:** ✅ ACTIVE & IN USE

### Testing (Local)
- **Database:** Docker PostgreSQL (same container)
- **Database Name:** `queen_bee_test`
- **Status:** Needs to be created

### Production
- **Database:** Fly.io PostgreSQL
- **Cluster:** `queen-bee-db`
- **Database Name:** `queen_bee`
- **URL:** `https://queen-bee.fly.dev`
- **Status:** ✅ ACTIVE & DEPLOYED

---

## ❌ NOT IN USE (Ignore These)

### Local Mac PostgreSQL
- **Service:** `postgresql@14`
- **Status:** ❌ STOPPED - Not being used
- **Note:** Was used initially, but project migrated to Docker
- **Action:** Can be safely stopped: `brew services stop postgresql@14`

### Render PostgreSQL
- **Status:** ❌ DELETED
- **Note:** Migrated to Fly.io due to cold start issues

---

## 🐳 Docker PostgreSQL Details

### Configuration
```yaml
Container: ecommerce-postgres
Image: postgres:15-alpine
Port Mapping: 5432:5432 (host:container)
Volume: postgres_data (persisted)
Network: app-network
```

### Environment Variables (.env files)

**Root .env** (for docker-compose):
```bash
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123
DATABASE_PORT=5432
```

**server/.env** (for Node.js app):
```bash
DATABASE_URL=postgresql://queenbee:development123@localhost:5432/queen_bee_candles
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123
```

Note: `localhost:5432` works because Docker maps the container's port 5432 to the host's port 5432.

---

## 🔧 Common Commands

### Start/Stop Docker Database
```bash
# Start
docker-compose up -d postgres

# Stop
docker-compose down

# Stop and remove volumes (DANGER: deletes data!)
docker-compose down -v
```

### Check Status
```bash
# Is container running?
docker ps | grep ecommerce-postgres

# List databases
docker exec -it ecommerce-postgres psql -U queenbee -d postgres -c "\l"

# Count products
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "SELECT COUNT(*) FROM products;"
```

### Access Database
```bash
# Connect to development database
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles

# Connect to test database
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_test

# Inside psql:
\dt                    # List tables
\d products           # Describe products table
SELECT * FROM products LIMIT 5;
\q                    # Quit
```

### Create Test Database
```bash
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "CREATE DATABASE queen_bee_test;"
```

---

## 🧪 Running Tests

Tests use `queen_bee_test` database on the same Docker PostgreSQL instance.

```bash
# Ensure Docker is running
docker-compose up -d postgres

# Create test database if it doesn't exist
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "CREATE DATABASE queen_bee_test;"

# Run tests
cd server
npm test
```

---

## 🚨 Troubleshooting

### Tests Fail with "ECONNREFUSED"
**Problem:** Docker PostgreSQL is not running

**Solution:**
```bash
docker-compose up -d postgres
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "CREATE DATABASE queen_bee_test;"
```

### "Database does not exist" Error
**Problem:** Trying to connect to wrong database name

**Solution:** Verify you're using `queen_bee_candles` (with underscore and 's'), not `queen_bee`

### Port 5432 Already in Use
**Problem:** Local Mac PostgreSQL is running and blocking Docker

**Solution:**
```bash
brew services stop postgresql@14
docker-compose restart postgres
```

---

## 📊 Database Comparison

| Feature | Development (Docker) | Production (Fly.io) |
|---------|---------------------|---------------------|
| Database Name | `queen_bee_candles` | `queen_bee` |
| Products | 26 | 26 |
| Connection | `localhost:5432` | Fly.io internal |
| Persistent | Yes (Docker volume) | Yes (Fly.io volume) |

---

## 🎯 Key Takeaways

1. **You ARE using Docker PostgreSQL** - not local Mac PostgreSQL
2. **Connection to localhost:5432 works** because Docker maps the port
3. **After computer restart**, you need to start Docker: `docker-compose up -d postgres`
4. **Test database** needs to be created manually: `queen_bee_test`
5. **Production uses different database name**: `queen_bee` (no 's', no 'candles')
