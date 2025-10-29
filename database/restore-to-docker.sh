#!/bin/bash
# Restore script for Docker PostgreSQL
# This restores the backed up database to the Docker container

set -e

echo "🔄 Starting database restore to Docker..."

# Configuration
CONTAINER_NAME="ecommerce-postgres"
DB_NAME="queen_bee_candles"
DB_USER="queenbee"
BACKUP_FILE="./backups/queen_bee_latest.sql"

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Backup file not found: ${BACKUP_FILE}"
  echo "Please run ./database/backup-local-db.sh first"
  exit 1
fi

# Check if Docker container is running
if ! docker ps | grep -q "${CONTAINER_NAME}"; then
  echo "❌ Docker container '${CONTAINER_NAME}' is not running"
  echo "Please run: docker-compose up -d postgres"
  exit 1
fi

echo "📦 Restoring backup to Docker PostgreSQL..."
echo "📄 Using backup: ${BACKUP_FILE}"

# Copy backup file to Docker container
docker cp "${BACKUP_FILE}" "${CONTAINER_NAME}:/tmp/restore.sql"

# Restore the backup
docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  echo "✅ Restore successful!"
  
  # Verify the restore
  echo ""
  echo "🔍 Verifying restore..."
  docker exec -it "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "\dt"
  docker exec -it "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT COUNT(*) as product_count FROM products;"
  docker exec -it "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT COUNT(*) as order_count FROM orders;"
  
  echo ""
  echo "✅ Migration complete!"
  echo ""
  echo "🎯 Next steps:"
  echo "1. Update server/.env to use Docker database"
  echo "2. Restart your Node.js server"
  echo "3. Test the application thoroughly"
else
  echo "❌ Restore failed!"
  exit 1
fi
