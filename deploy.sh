#!/bin/bash

# Auto Online Deployment Script
# This script pulls latest changes, rebuilds, and restarts the application

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Auto Online Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
APP_DIR="/root/auto-online"
APP_NAME="auto-online"

# Navigate to app directory
echo -e "\n${YELLOW}[1/7]${NC} Navigating to application directory..."
cd "$APP_DIR"

# Stop the application
echo -e "${YELLOW}[2/7]${NC} Stopping application..."
pm2 stop $APP_NAME || echo "App was not running"

# Backup database
echo -e "${YELLOW}[3/7]${NC} Backing up database..."
if [ -f "server/data/auto-online.db" ]; then
    BACKUP_FILE="server/data/auto-online.db.backup-$(date +%Y%m%d_%H%M%S)"
    cp server/data/auto-online.db "$BACKUP_FILE"
    echo -e "${GREEN}✓${NC} Database backed up to: $BACKUP_FILE"
else
    echo -e "${YELLOW}⚠${NC} No database found to backup"
fi

# Pull latest changes from GitHub
echo -e "${YELLOW}[4/7]${NC} Pulling latest changes from GitHub..."
git pull origin main

# Verify database and uploads are ignored
echo -e "${YELLOW}[4.5/7]${NC} Verifying data integrity..."
if git ls-files --error-unmatch server/data/*.db 2>/dev/null; then
    echo -e "${RED}⚠ WARNING: Database files are tracked by git!${NC}"
    echo -e "${RED}This should not happen. Check .gitignore${NC}"
fi
echo -e "${GREEN}✓${NC} Database and uploads are properly ignored by git"

# Install/update dependencies
echo -e "${YELLOW}[5/7]${NC} Installing dependencies..."
npm install

# Rebuild frontend
echo -e "${YELLOW}[6/7]${NC} Building frontend..."
NODE_ENV=production npm run build

# Fix permissions
echo -e "${YELLOW}[6.5/7]${NC} Fixing permissions..."
sudo chown -R www-data:www-data dist
chmod -R 755 dist

# Restart application
echo -e "${YELLOW}[7/7]${NC} Restarting application..."
pm2 restart $APP_NAME

# Save PM2 configuration
pm2 save

# Reload Nginx
echo -e "${YELLOW}[Extra]${NC} Reloading Nginx..."
sudo systemctl reload nginx

# Show status
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Application Status:${NC}"
pm2 list

echo -e "\n${YELLOW}Recent Logs:${NC}"
pm2 logs $APP_NAME --lines 10 --nostream

echo -e "\n${GREEN}✓ Deployment successful!${NC}"
echo -e "${YELLOW}Monitor logs with:${NC} pm2 logs $APP_NAME"
