#!/bin/bash
# Backup script for local PostgreSQL database
# This backs up the queen_bee_candles database before migration

set -e

echo "🔄 Starting database backup..."

# Configuration
DB_NAME="queen_bee_candles"
DB_USER="queenbee"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/queen_bee_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "📦 Creating backup of ${DB_NAME}..."

# Create the backup
PGPASSWORD=development123 pg_dump \
  -h localhost \
  -p 5432 \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --file="${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  echo "✅ Backup successful!"
  echo "📄 Backup file: ${BACKUP_FILE}"
  echo "📊 File size: $(du -h "${BACKUP_FILE}" | cut -f1)"
  
  # Create a copy as "latest" for easy reference
  cp "${BACKUP_FILE}" "${BACKUP_DIR}/queen_bee_latest.sql"
  echo "📋 Latest backup also saved as: ${BACKUP_DIR}/queen_bee_latest.sql"
else
  echo "❌ Backup failed!"
  exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "1. Stop your Node.js server"
echo "2. Run: docker-compose down"
echo "3. Run: docker-compose up -d postgres"
echo "4. Run: ./database/restore-to-docker.sh"
