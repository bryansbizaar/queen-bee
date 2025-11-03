#!/bin/bash
# Automated migration script - runs entire migration process
# This script coordinates all migration steps with safety checks

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_ROOT/server"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║     Queen Bee Candles - Database Migration Tool           ║${NC}"
echo -e "${BLUE}║     Local PostgreSQL → Docker PostgreSQL                  ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to prompt user
prompt_continue() {
  echo -e "${YELLOW}$1${NC}"
  read -p "Continue? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Migration cancelled by user${NC}"
    exit 1
  fi
}

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Pre-flight checks
echo -e "${BLUE}🔍 Running pre-flight checks...${NC}"
echo ""

# Check Docker
if ! command_exists docker; then
  echo -e "${RED}❌ Docker not found. Please install Docker Desktop.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Docker installed${NC}"

# Check Docker is running
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Check docker-compose
if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker Compose not found.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Docker Compose available${NC}"

# Check pg_dump
if ! command_exists pg_dump; then
  echo -e "${RED}❌ pg_dump not found. Please install PostgreSQL client tools.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ PostgreSQL client tools installed${NC}"

# Check if local database is accessible
if PGPASSWORD=development123 psql -h localhost -p 5432 -U queenbee -d queen_bee_candles -c "SELECT 1;" >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Local PostgreSQL database accessible${NC}"
else
  echo -e "${RED}❌ Cannot connect to local PostgreSQL database${NC}"
  echo "Please ensure PostgreSQL is running and database exists"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ All pre-flight checks passed!${NC}"
echo ""

# Show what will happen
echo -e "${BLUE}📋 Migration Plan:${NC}"
echo "1. Backup local PostgreSQL database"
echo "2. Stop any running Docker containers"
echo "3. Start fresh Docker PostgreSQL"
echo "4. Restore backup to Docker"
echo "5. Verify migration"
echo "6. Update server configuration"
echo ""
echo -e "${YELLOW}⏱️  Estimated time: 10 minutes${NC}"
echo -e "${YELLOW}⚠️  Your server will be stopped during migration${NC}"
echo ""

prompt_continue "Ready to start migration?"

# Step 1: Backup
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 1/6: Creating backup of local database${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

chmod +x "$SCRIPT_DIR/backup-local-db.sh"
"$SCRIPT_DIR/backup-local-db.sh"

if [ ! -f "$SCRIPT_DIR/backups/queen_bee_latest.sql" ]; then
  echo -e "${RED}❌ Backup failed - file not found${NC}"
  exit 1
fi

BACKUP_SIZE=$(du -h "$SCRIPT_DIR/backups/queen_bee_latest.sql" | cut -f1)
echo -e "${GREEN}✅ Backup complete (Size: $BACKUP_SIZE)${NC}"
sleep 2

# Step 2: Stop containers
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 2/6: Stopping existing Docker containers${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_ROOT"
docker-compose down -v

echo -e "${GREEN}✅ Containers stopped and volumes removed${NC}"
sleep 2

# Step 3: Start PostgreSQL
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 3/6: Starting Docker PostgreSQL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

docker-compose up -d postgres

echo "Waiting for PostgreSQL to initialize..."
sleep 5

# Wait for PostgreSQL to be ready
MAX_TRIES=30
TRIES=0
while ! docker exec ecommerce-postgres pg_isready -U queenbee >/dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ $TRIES -ge $MAX_TRIES ]; then
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    docker logs ecommerce-postgres
    exit 1
  fi
  echo "Still waiting... ($TRIES/$MAX_TRIES)"
  sleep 1
done

echo -e "${GREEN}✅ Docker PostgreSQL is ready${NC}"
sleep 2

# Step 4: Restore
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 4/6: Restoring backup to Docker PostgreSQL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

chmod +x "$SCRIPT_DIR/restore-to-docker.sh"
"$SCRIPT_DIR/restore-to-docker.sh"

echo -e "${GREEN}✅ Restore complete${NC}"
sleep 2

# Step 5: Verify
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 5/6: Verifying migration${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

chmod +x "$SCRIPT_DIR/verify-migration.sh"
"$SCRIPT_DIR/verify-migration.sh"

# Step 6: Instructions
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 6/6: Final configuration${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}✅ Migration completed successfully!${NC}"
echo ""
echo -e "${BLUE}📝 Server Configuration:${NC}"
echo "Your server/.env is already configured correctly:"
echo "  DATABASE_HOST=localhost"
echo "  (Docker exposes PostgreSQL to localhost:5432)"
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "1. Start your Node.js server:"
echo "   ${YELLOW}cd server && npm start${NC}"
echo ""
echo "2. Verify in browser:"
echo "   - Products show correct stock levels"
echo "   - Orders are visible"
echo "   - Can create test orders"
echo ""
echo "3. Optional - Stop local PostgreSQL:"
echo "   ${YELLOW}brew services stop postgresql@15${NC}"
echo ""
echo "4. Access pgAdmin (if needed):"
echo "   ${YELLOW}docker-compose up -d pgadmin${NC}"
echo "   http://localhost:8081"
echo ""
echo -e "${GREEN}🎉 Your database is now running in Docker!${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "- Full guide: database/MIGRATION_GUIDE.md"
echo "- Quick reference: database/QUICK_MIGRATION.md"
echo "- This directory: database/README.md"
echo ""

# Offer to start server
echo -e "${YELLOW}Would you like to start the Node.js server now?${NC}"
read -p "Start server? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "${BLUE}Starting server...${NC}"
  cd "$SERVER_DIR"
  npm start
fi
