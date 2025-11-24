#!/bin/bash
# Restore production database dump to local Docker database

set -e  # Exit on error

DUMP_FILE="/home/nashon/Work/MyCode/allbounds/allbounds_20251117.dump"
DB_CONTAINER="backend-db-1"  # Updated container name format
DB_NAME="allbounds"
DB_USER="allbounds"
DOCKER="sudo docker"  # Use sudo for docker commands

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== Restoring Production Database ==="
echo ""

# Check if dump file exists
if [ ! -f "$DUMP_FILE" ]; then
    echo -e "${RED}✗ Dump file not found: $DUMP_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found dump file: $DUMP_FILE ($(du -h $DUMP_FILE | cut -f1))${NC}"
echo ""

# Check if Docker container is running
if ! $DOCKER ps | grep -q "$DB_CONTAINER"; then
    echo -e "${RED}✗ Database container not running${NC}"
    echo "Starting services..."
    cd /home/nashon/Work/MyCode/allbounds/backend
    sudo docker compose up -d db
    sleep 5
fi

echo -e "${GREEN}✓ Database container is running${NC}"
echo ""

# Backup current database (optional)
echo "1. Creating backup of current database..."
BACKUP_FILE="/tmp/allbounds_backup_$(date +%Y%m%d_%H%M%S).sql"
docker exec -i "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null || true
if [ -f "$BACKUP_FILE" ]; then
    echo -e "${GREEN}✓ Backup saved to: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ No existing data to backup${NC}"
fi
echo ""

# Drop and recreate database
echo "2. Dropping and recreating database..."
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d postgres << EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF
echo -e "${GREEN}✓ Database recreated${NC}"
echo ""

# Restore dump
echo "3. Restoring production dump..."
echo "   This may take a minute..."

# Check if it's a custom format dump or SQL dump
if file "$DUMP_FILE" | grep -q "PostgreSQL custom database dump"; then
    echo "   Detected: Custom format dump"
    # Copy dump to container
    $DOCKER cp "$DUMP_FILE" "$DB_CONTAINER:/tmp/dump.dump"
    # Restore using pg_restore
    $DOCKER exec -i "$DB_CONTAINER" pg_restore -U "$DB_USER" -d "$DB_NAME" -v /tmp/dump.dump 2>&1 | grep -v "WARNING" || true
    # Clean up
    $DOCKER exec -i "$DB_CONTAINER" rm /tmp/dump.dump
else
    echo "   Detected: SQL format dump"
    # Restore using psql
    $DOCKER exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$DUMP_FILE"
fi

echo -e "${GREEN}✓ Database restored${NC}"
echo ""

# Verify restoration
echo "4. Verifying restoration..."
TABLE_COUNT=$($DOCKER exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo -e "${GREEN}✓ Found $TABLE_COUNT tables${NC}"

# Show some stats
echo ""
echo "5. Database statistics:"
$DOCKER exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" << 'EOF'
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_live_tup AS rows
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
EOF

echo ""
echo -e "${GREEN}✓✓✓ Production database restored successfully! ✓✓✓${NC}"
echo ""
echo "Next steps:"
echo "1. Restart API: sudo docker compose restart api"
echo "2. Test with real data"
echo "3. Monitor memory: watch -n 2 'ps aux --sort=-%mem | grep python | head -3'"
echo ""
