# Database Setup Summary - CORRECTED (Nov 4, 2025)

## Current Reality (Verified)

### Development Environment
**✅ USING: Docker PostgreSQL**
- Container: `ecommerce-postgres`
- Database: `queen_bee_candles`
- Host: `localhost:5432` (Docker port mapping)
- Products: 26 (verified)
- Status: ACTIVE

**❌ NOT USING: Local Mac PostgreSQL**
- Service: `postgresql@14`
- Status: STOPPED
- Note: Initially installed but project migrated to Docker
- Can be safely ignored/stopped

### Test Environment
**⚠️ NEEDS SETUP: Docker PostgreSQL Test Database**
- Container: Same `ecommerce-postgres` 
- Database: `queen_bee_test` (needs to be created)
- Command to create:
  ```bash
  docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "CREATE DATABASE queen_bee_test;"
  ```

### Production Environment
**✅ DEPLOYED: Fly.io PostgreSQL**
- Cluster: `queen-bee-db`
- Database: `queen_bee` (note: different name than local)
- URL: https://queen-bee.fly.dev
- Products: 26
- Status: ACTIVE

## What Happened (Timeline)

1. **Initial Setup**: Used local Mac PostgreSQL with `queen_bee_candles` database
2. **Docker Migration**: Moved to Docker PostgreSQL, migrated data
3. **Render Deployment**: Deployed to Render (had cold start issues)
4. **Fly.io Migration**: Moved to Fly.io, created `queen_bee` database
5. **Current**: Local development uses Docker, production uses Fly.io

## The Confusion

The document "Summary: Converting Queen Bee Candles Database from Local to Docker PostgreSQL" was written BEFORE the migration was completed. It described a plan, not the current state.

**That document is now OUTDATED.** The migration to Docker was successfully completed.

## How to Verify Current State

```bash
# Check Docker is running
docker ps | grep ecommerce-postgres

# Check local PostgreSQL is NOT running
brew services list | grep postgres
# Should show: postgresql@14  none

# Verify data in Docker
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "SELECT COUNT(*) FROM products;"
# Should show: 26 products

# Check what's on port 5432
lsof -i :5432
# Should show Docker process
```

## After Computer Restart

Docker containers don't auto-start by default. After restart:

```bash
# Start Docker database
cd /path/to/queen-bee
docker-compose up -d postgres

# Create test database if needed
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "CREATE DATABASE queen_bee_test;"

# Verify
docker ps | grep ecommerce-postgres
```

## Configuration Files

### Root .env (for docker-compose)
```bash
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123
DATABASE_PORT=5432
```

### server/.env (for Node.js)
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123
```

## Key Differences: Local vs Production

| Aspect | Local (Docker) | Production (Fly.io) |
|--------|---------------|---------------------|
| Database Name | `queen_bee_candles` | `queen_bee` |
| Connection | `localhost:5432` | Internal Fly.io |
| Container | `ecommerce-postgres` | `queen-bee-db` |
| URL Config | `vite.config.js` localhost | `vite.config.js` fly.dev |

## Test Failures After Restart

**Symptom**: `ECONNREFUSED 127.0.0.1:5432`

**Cause**: Docker PostgreSQL not running

**Fix**:
```bash
docker-compose up -d postgres
docker exec -it ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "CREATE DATABASE queen_bee_test;"
cd server && npm test
```

## Bottom Line

- ✅ Local development uses Docker PostgreSQL (`queen_bee_candles`)
- ✅ Production uses Fly.io PostgreSQL (`queen_bee`)
- ❌ Local Mac PostgreSQL is NOT being used
- ⚠️ Docker must be running for tests to pass
