#!/bin/bash
# Simple wrapper to restore production database with proper permissions

echo "This script will restore the production database dump."
echo "You will be prompted for sudo password."
echo ""

sudo bash restore_production_db.sh
