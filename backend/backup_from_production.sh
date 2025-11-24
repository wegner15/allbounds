#!/bin/bash
# Backup database from production server and restore locally

set -e

PROD_SERVER="allbound@allbounds"
PROD_DB_CONTAINER="backend-db-1"
PROD_DB_NAME="allbounds"
PROD_DB_USER="allbounds"
LOCAL_BACKUP_DIR="/home/nashon/Work/MyCode/allbounds"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="allbounds_backup_${TIMESTAMP}.dump"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== Backing Up Production Database ==="
echo ""

# Step 1: Create backup on production server
echo "1. Creating backup on production server..."
ssh $PROD_SERVER << EOF
    echo "Creating database dump..."
    sudo docker exec $PROD_DB_CONTAINER pg_dump -U $PROD_DB_USER -Fc $PROD_DB_NAME > /tmp/$BACKUP_FILE
    echo "Backup created: /tmp/$BACKUP_FILE"
    ls -lh /tmp/$BACKUP_FILE
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup created on production${NC}"
else
    echo -e "${RED}✗ Failed to create backup${NC}"
    exit 1
fi
echo ""

# Step 2: Download backup from production
echo "2. Downloading backup from production..."
scp $PROD_SERVER:/tmp/$BACKUP_FILE $LOCAL_BACKUP_DIR/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup downloaded to: $LOCAL_BACKUP_DIR/$BACKUP_FILE${NC}"
    echo "   Size: $(du -h $LOCAL_BACKUP_DIR/$BACKUP_FILE | cut -f1)"
else
    echo -e "${RED}✗ Failed to download backup${NC}"
    exit 1
fi
echo ""

# Step 3: Clean up production server
echo "3. Cleaning up production server..."
ssh $PROD_SERVER "rm /tmp/$BACKUP_FILE"
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Step 4: Restore to local database
echo "4. Restoring to local database..."
echo "   This will replace your current local database!"
read -p "   Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled. Backup saved at: $LOCAL_BACKUP_DIR/$BACKUP_FILE"
    exit 0
fi

# Backup current local database
echo "   Backing up current local database..."
LOCAL_DB_CONTAINER="backend-db-1"
LOCAL_BACKUP="/tmp/local_backup_${TIMESTAMP}.sql"
sudo docker exec -i $LOCAL_DB_CONTAINER pg_dump -U $PROD_DB_USER $PROD_DB_NAME > $LOCAL_BACKUP 2>/dev/null || true
echo -e "${GREEN}   ✓ Local backup saved: $LOCAL_BACKUP${NC}"

# Drop and recreate database
echo "   Dropping and recreating database..."
sudo docker exec -i $LOCAL_DB_CONTAINER psql -U $PROD_DB_USER -d postgres << EOSQL
DROP DATABASE IF EXISTS $PROD_DB_NAME;
CREATE DATABASE $PROD_DB_NAME;
EOSQL

# Copy dump to container and restore
echo "   Restoring production dump..."
sudo docker cp "$LOCAL_BACKUP_DIR/$BACKUP_FILE" "$LOCAL_DB_CONTAINER:/tmp/restore.dump"
sudo docker exec -i $LOCAL_DB_CONTAINER pg_restore -U $PROD_DB_USER -d $PROD_DB_NAME -v /tmp/restore.dump 2>&1 | grep -v "WARNING" || true
sudo docker exec -i $LOCAL_DB_CONTAINER rm /tmp/restore.dump

echo -e "${GREEN}✓ Database restored${NC}"
echo ""

# Step 5: Verify restoration
echo "5. Verifying restoration..."
TABLE_COUNT=$(sudo docker exec -i $LOCAL_DB_CONTAINER psql -U $PROD_DB_USER -d $PROD_DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo -e "${GREEN}✓ Found $TABLE_COUNT tables${NC}"

# Show record counts
echo ""
echo "6. Database statistics:"
sudo docker exec -i $LOCAL_DB_CONTAINER psql -U $PROD_DB_USER -d $PROD_DB_NAME << 'EOSQL'
SELECT 'packages' as table_name, COUNT(*) as count FROM packages
UNION ALL
SELECT 'countries', COUNT(*) FROM countries
UNION ALL
SELECT 'hotels', COUNT(*) FROM hotels
UNION ALL
SELECT 'attractions', COUNT(*) FROM attractions
UNION ALL
SELECT 'activities', COUNT(*) FROM activities
UNION ALL
SELECT 'group_trips', COUNT(*) FROM group_trips
ORDER BY table_name;
EOSQL

echo ""
echo -e "${GREEN}✓✓✓ Production database backed up and restored successfully! ✓✓✓${NC}"
echo ""
echo "Backup file: $LOCAL_BACKUP_DIR/$BACKUP_FILE"
echo "Local backup: $LOCAL_BACKUP"
echo ""
echo "Next steps:"
echo "1. Restart API: sudo docker compose restart api"
echo "2. Test with production data"
echo "3. Monitor memory: watch -n 2 'ps aux --sort=-%mem | grep python | head -3'"
