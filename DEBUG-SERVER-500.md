# Debugging Server 500 Error

## Problem
- Local: Creating listings works ✅
- Server: Getting 500 error when creating listings ❌
- Error: `Failed to load resource: the server responded with a status of 500 () api/listings/1`

## Step 1: Check Server Logs

SSH into your server and run:

```bash
# View live logs from the backend
pm2 logs auto-online --lines 50

# Or if you're already seeing errors, check the full log
pm2 logs auto-online --lines 100
```

**Look for:**
- ❌ Database insert error
- ❌ Validation errors
- ❌ File permission errors
- ❌ Missing columns in database

## Step 2: Common Causes & Fixes

### Cause 1: Database Schema Mismatch

The server database might not have the new columns we added.

**Fix:**
```bash
# On server
cd /var/www/auto-online  # or /root/auto-online

# Stop the app
pm2 stop auto-online

# Backup database
cp server/data/auto-online.db server/data/auto-online.db.backup

# Restart (this will trigger migrations)
pm2 restart auto-online

# Watch logs for migration messages
pm2 logs auto-online --lines 30
```

**You should see:**
```
✅ Connected to SQLite database
✅ Database tables initialized
⚙️  Adding column powerPS to listings table...
⚙️  Adding column powerKW to listings table...
✅ Listings table migration completed
```

### Cause 2: Missing Columns - "features" Field

The error might be: `table listings has no column named features`

**Fix:**
```bash
# On server
cd /var/www/auto-online

# Check current database schema
sqlite3 server/data/auto-online.db "PRAGMA table_info(listings);"

# Look for these columns:
# - features
# - safetyFeatures
# - comfortFeatures
# - entertainmentFeatures
# - extrasFeatures

# If missing, the migration didn't run. Restart to trigger it:
pm2 restart auto-online
pm2 logs auto-online
```

### Cause 3: Old Code on Server

The server might have old code from before our fix.

**Fix:**
```bash
# On server
cd /var/www/auto-online

# Check current git status
git log --oneline -5

# Pull latest changes
pm2 stop auto-online
cp server/data/auto-online.db server/data/auto-online.db.backup
git pull origin main
npm install
NODE_ENV=production npm run build
pm2 restart auto-online
pm2 logs auto-online
```

### Cause 4: File Upload Permissions

The server might not have permission to write to uploads directory.

**Fix:**
```bash
# On server
cd /var/www/auto-online

# Check uploads directory exists and is writable
ls -la server/uploads/
ls -la server/uploads/listings/

# Fix permissions
mkdir -p server/uploads/listings
chmod -R 755 server/uploads
chown -R $USER:$USER server/uploads

# If using www-data (common with nginx)
sudo chown -R www-data:www-data server/uploads
# OR
sudo chown -R $(whoami):$(whoami) server/uploads

# Restart
pm2 restart auto-online
```

### Cause 5: Database File Permissions

**Fix:**
```bash
# On server
cd /var/www/auto-online

# Check database file permissions
ls -la server/data/

# Fix permissions
chmod 644 server/data/auto-online.db
chown $USER:$USER server/data/auto-online.db

# Restart
pm2 restart auto-online
```

## Step 3: Enable Detailed Logging

The logging we added should show the exact error. Check the logs:

```bash
# On server
pm2 logs auto-online --lines 100

# Try creating a listing, then immediately check:
pm2 logs auto-online --lines 20
```

**Look for these log messages:**

**If you see:**
```
📝 POST /listings - Creating new listing...
👤 User ID: 1
📸 Files uploaded: 3
❌ Validation errors: [...]
```
→ **Problem:** Frontend sending invalid data. Check the validation errors.

**If you see:**
```
📝 POST /listings - Creating new listing...
✅ Validation passed, proceeding with database insert...
❌ Database insert error: SQLITE_ERROR: table listings has no column named features
```
→ **Problem:** Database schema outdated. Run migrations (see Cause 1).

**If you see:**
```
📝 POST /listings - Creating new listing...
✅ Validation passed, proceeding with database insert...
❌ Database insert error: SQLITE_ERROR: attempt to write a readonly database
```
→ **Problem:** File permissions (see Cause 5).

**If you DON'T see any logs:**
→ **Problem:** Request not reaching the server. Check nginx configuration.

## Step 4: Compare Local vs Server

### Check Local (Working)
```bash
# On your local machine
npm run server

# Look for:
✅ Connected to SQLite database
✅ Database tables initialized
🚗 Auto Online Server running on port 5010
```

### Check Server (Not Working)
```bash
# On server
pm2 logs auto-online

# Should show same messages
```

## Step 5: Test Database Directly

```bash
# On server
cd /var/www/auto-online

# Check if database is accessible
sqlite3 server/data/auto-online.db "SELECT COUNT(*) FROM listings;"

# Check if columns exist
sqlite3 server/data/auto-online.db "PRAGMA table_info(listings);" | grep -E "features|safety|comfort"

# Should show:
# | features | TEXT |
# | safetyFeatures | TEXT |
# | comfortFeatures | TEXT |
# | entertainmentFeatures | TEXT |
# | extrasFeatures | TEXT |
```

## Step 6: Nuclear Option - Fresh Database

**WARNING:** This will delete all production data!

```bash
# On server - ONLY if you have no important data
cd /var/www/auto-online

pm2 stop auto-online

# Backup first!
cp server/data/auto-online.db server/data/auto-online.db.OLD

# Delete database
rm server/data/auto-online.db

# Restart - fresh database will be created
pm2 restart auto-online
pm2 logs auto-online

# Should see:
# ✅ Connected to SQLite database
# ✅ Database tables initialized
# ✅ Admin account created (admin@admin.com / admin12345)
```

## Quick Diagnostic Script

Run this on the server to gather all info:

```bash
#!/bin/bash
echo "=== Auto Online Diagnostics ==="
echo ""
echo "1. Git Status:"
cd /var/www/auto-online
git log --oneline -3
echo ""
echo "2. PM2 Status:"
pm2 list
echo ""
echo "3. Database File:"
ls -lh server/data/auto-online.db
echo ""
echo "4. Database Tables:"
sqlite3 server/data/auto-online.db "SELECT name FROM sqlite_master WHERE type='table';"
echo ""
echo "5. Listings Table Schema:"
sqlite3 server/data/auto-online.db "PRAGMA table_info(listings);" | grep -E "features|safety"
echo ""
echo "6. Uploads Directory:"
ls -la server/uploads/
echo ""
echo "7. Recent Logs (last 20 lines):"
pm2 logs auto-online --lines 20 --nostream
```

Save this as `diagnose.sh`, make it executable (`chmod +x diagnose.sh`), and run it (`./diagnose.sh`).

## What to Send Back

After running the diagnostics, send me:

1. **The PM2 logs** (from `pm2 logs auto-online --lines 50`)
2. **Database schema** (from `sqlite3 server/data/auto-online.db "PRAGMA table_info(listings);"`)
3. **Git log** (from `git log --oneline -3`)
4. **The exact error from browser console** (F12 → Network tab → Click the failed request → Response tab)

This will tell us exactly what's wrong!
