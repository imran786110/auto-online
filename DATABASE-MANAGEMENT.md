# Database Management Guide

This guide explains how to manage separate databases for local development and production.

## Overview

**Local and production databases are kept separate** to prevent test data from affecting production and vice versa.

- **Local database**: `server/data/auto-online.db` (on your machine, ignored by git)
- **Production database**: `server/data/auto-online.db` (on your server, ignored by git)
- **Uploaded images**: `server/uploads/` (ignored by git on both local and server)

## How It Works

### Git Configuration

The `.gitignore` file prevents databases and uploads from being tracked:

```gitignore
# Database files (keep local and production databases separate)
server/data/*.db
server/data/*.db-*
server/uploads/
```

This means:
- ✅ Your local test entries stay local
- ✅ Production data stays on the server
- ✅ No accidental overwrites when deploying
- ✅ No large binary files in git history

### Directory Structure

```
server/
├── data/
│   ├── .gitkeep              # Tracked: ensures directory exists
│   └── auto-online.db        # NOT tracked: local/production specific
└── uploads/
    ├── .gitkeep              # Tracked: ensures directory exists
    └── listings/             # NOT tracked: images are local/production specific
        └── *.jpg, *.png      # NOT tracked
```

## Local Development Workflow

### Initial Setup

When you clone the repo on a new machine:

```bash
# Clone the repository
git clone <your-repo-url>
cd auto-online

# Install dependencies
npm install

# Start the server (database will be created automatically)
npm run server
```

The database will be automatically created by [server/database/db.js](server/database/db.js) with:
- Default admin account: `admin@admin.com` / `admin12345`
- Empty listings table
- Required directory structure

### Adding Test Data

```bash
# Start the application
npm run dev:all

# Add test car listings through the UI
# These entries are stored in your LOCAL database only
```

### Resetting Local Database

If you want to start fresh:

```bash
# Windows
del server\data\auto-online.db

# Linux/Mac
rm server/data/auto-online.db

# Restart server - fresh database will be created
npm run server
```

## Production Deployment Workflow

### Initial Deployment

```bash
# On server
cd /var/www/auto-online
git pull origin main
npm install

# Database is created automatically on first run
pm2 start server/index.js --name auto-online
```

### Updating Production Code (WITHOUT affecting data)

```bash
# On server
cd /var/www/auto-online

# Stop application
pm2 stop auto-online

# Backup database (IMPORTANT!)
cp server/data/auto-online.db server/data/auto-online.db.backup-$(date +%Y%m%d)

# Pull latest code changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild frontend
NODE_ENV=production npm run build

# Restart application
pm2 restart auto-online

# Verify database is intact
ls -lh server/data/
```

**Important**: The `git pull` will:
- ✅ Update your code files
- ✅ **NOT** affect your database (it's ignored)
- ✅ **NOT** delete uploaded images (they're ignored)

### Database Migrations

When you add new database columns (schema changes), the migration runs automatically via [server/database/db.js](server/database/db.js):

```javascript
// Example from db.js:
db.all('PRAGMA table_info(listings)', (err, columns) => {
  const existingColumns = columns.map(col => col.name);
  const newColumns = [
    { name: 'powerPS', type: 'INTEGER' },
    // ... more columns
  ];

  newColumns.forEach(col => {
    if (!existingColumns.includes(col.name)) {
      db.run(`ALTER TABLE listings ADD COLUMN ${col.name} ${col.type}`);
    }
  });
});
```

This means:
- ✅ Existing data is preserved
- ✅ New columns are added automatically
- ✅ Works on both local and production

## Backing Up Production Database

### Manual Backup

```bash
# On server
cd /var/www/auto-online
cp server/data/auto-online.db \
   server/data/auto-online.db.backup-$(date +%Y%m%d_%H%M%S)
```

### Automated Daily Backups

Create a cron job:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * cp /var/www/auto-online/server/data/auto-online.db \
          /var/backups/auto-online-$(date +\%Y\%m\%d).db

# Keep only last 7 days
0 3 * * * find /var/backups/ -name "auto-online-*.db" -mtime +7 -delete
```

### Download Production Database for Local Testing

If you want to test with production data locally:

```bash
# On your local machine
scp user@your-server:/var/www/auto-online/server/data/auto-online.db \
    server/data/auto-online.db

# Also download images if needed
scp -r user@your-server:/var/www/auto-online/server/uploads/listings/* \
       server/uploads/listings/
```

**Warning**: Be careful with production data! Consider:
- Removing sensitive customer information
- Using a separate test database
- Not committing it to git

## Restoring from Backup

### On Production Server

```bash
# Stop application
pm2 stop auto-online

# Restore from backup
cp server/data/auto-online.db.backup-YYYYMMDD \
   server/data/auto-online.db

# Restart application
pm2 restart auto-online
```

### On Local Machine

```bash
# Simply replace the database file
cp server/data/auto-online.db.backup \
   server/data/auto-online.db

# Restart server
npm run server
```

## Common Scenarios

### Scenario 1: Adding a new feature locally

```bash
# 1. Make code changes
# 2. Test with local database
# 3. Commit code changes (database is NOT committed)
git add .
git commit -m "Add new feature"
git push origin main

# 4. Deploy to production
# On server:
git pull origin main
npm install
NODE_ENV=production npm run build
pm2 restart auto-online
```

### Scenario 2: Database schema change

```bash
# 1. Update server/database/db.js to add new columns
# 2. Test migration locally
npm run server  # See migration run in console

# 3. Commit the migration code
git add server/database/db.js
git commit -m "Add new columns to listings table"
git push origin main

# 4. Deploy to production
# On server:
pm2 stop auto-online
cp server/data/auto-online.db server/data/auto-online.db.backup  # BACKUP FIRST!
git pull origin main
pm2 restart auto-online  # Migration runs automatically
pm2 logs auto-online  # Check migration completed
```

### Scenario 3: Accidentally deleted local database

```bash
# Don't worry! Just restart the server
npm run server

# A fresh database will be created with:
# - Default admin account
# - Empty listings
# - All tables properly structured
```

### Scenario 4: Production database corruption

```bash
# On server
pm2 stop auto-online

# Restore from latest backup
cp server/data/auto-online.db.backup-LATEST \
   server/data/auto-online.db

# Or if you have daily backups
cp /var/backups/auto-online-20250128.db \
   server/data/auto-online.db

pm2 restart auto-online
pm2 logs auto-online  # Verify it's working
```

## Best Practices

### ✅ DO:
- Always backup production database before deploying
- Test database migrations locally first
- Use the automated migration system in db.js
- Keep backups for at least 7 days
- Document schema changes in commit messages

### ❌ DON'T:
- Never commit database files to git
- Never commit uploaded images to git
- Never run `git rm` on `.gitkeep` files
- Don't manually edit production database without backup
- Don't copy production data to git-tracked locations

## Troubleshooting

### "Database is locked" error

```bash
# Someone/something is still using the database
pm2 stop auto-online
lsof server/data/auto-online.db  # See what's using it
pm2 restart auto-online
```

### Database missing after git pull

```bash
# This should never happen (database is ignored)
# But if it does, check:
git status  # Should show database as untracked
ls -la server/data/  # Should see .gitkeep and auto-online.db

# If database is truly missing, it will be recreated on restart
npm run server
```

### Uploads directory missing

```bash
# Check .gitkeep exists
ls -la server/uploads/

# Recreate if needed
mkdir -p server/uploads/listings
chmod 755 server/uploads
```

## Summary

**The key principle**: Code is versioned, data is not.

- 📝 **Code changes** → git commit → git push → deploy
- 💾 **Data** → stays local or on server → never committed
- 🔄 **Schema changes** → via migrations in code → auto-applied on restart
- 💿 **Backups** → manual or automated → stored separately from git

This ensures your local testing never affects production, and deploying code never overwrites production data.
