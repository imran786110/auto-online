# Deployment Guide - Linux + Nginx

This guide covers deploying Auto Martines to a Linux server with Nginx.

## Prerequisites

- Linux server (Ubuntu 20.04+ or similar)
- Root or sudo access
- Domain name pointed to your server's IP
- Node.js 16+ installed
- Nginx installed

## Step 1: Server Setup

### Install Node.js

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## Step 2: Prepare Application

### On Your Local Machine

1. **Build the frontend:**
```bash
npm run build
```

2. **Prepare deployment files:**
```bash
# Create a deployment archive excluding node_modules
tar -czf auto-martines.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=server/data \
  server/ \
  dist/ \
  package.json \
  package-lock.json \
  .env.production
```

3. **Copy .env and update for production:**
```bash
# Create .env.production
cp .env .env.production

# Edit .env.production with production values:
# VITE_APP_URL=https://yourdomain.com
# VITE_API_URL=https://yourdomain.com/api
# PORT=5000
# JWT_SECRET=<generate-secure-random-string>
# CLIENT_URL=https://yourdomain.com
# NODE_ENV=production
```

### Transfer to Server

```bash
# Upload to server (replace with your server details)
scp auto-martines.tar.gz user@your-server-ip:/home/user/
```

## Step 3: Deploy on Server

### Extract and Setup

```bash
# SSH into your server
ssh user@your-server-ip

# Create application directory
sudo mkdir -p /var/www/auto-martines
cd /var/www/auto-martines

# Extract files
sudo tar -xzf ~/auto-martines.tar.gz -C /var/www/auto-martines/

# Set ownership
sudo chown -R $USER:$USER /var/www/auto-martines

# Install dependencies (production only)
npm install --production

# Create necessary directories
mkdir -p server/data
mkdir -p server/uploads/listings
chmod 755 server/data
chmod 755 server/uploads
```

### Configure Environment

```bash
# Copy production environment file
cp .env.production .env

# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output and update JWT_SECRET in .env

# Edit .env with nano or vim
nano .env
```

Update these values:
```env
VITE_APP_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
PORT=5000
JWT_SECRET=<your-generated-secret>
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

## Step 4: Configure Nginx

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/auto-martines
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve static files (frontend)
    root /var/www/auto-martines/dist;
    index index.html;

    # Uploaded images
    location /uploads/ {
        alias /var/www/auto-martines/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeout for file uploads
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Frontend routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # File upload size limit (for car images)
    client_max_body_size 50M;
}
```

### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/auto-martines /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 5: Start Backend with PM2

```bash
cd /var/www/auto-martines

# Start the backend server
pm2 start server/index.js --name auto-martines

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
```

### PM2 Useful Commands

```bash
# View logs
pm2 logs auto-martines

# Restart application
pm2 restart auto-martines

# Stop application
pm2 stop auto-martines

# Monitor
pm2 monit

# List all processes
pm2 list
```

## Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Test auto-renewal
sudo certbot renew --dry-run
```

Certbot will automatically update your Nginx configuration to use HTTPS.

## Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

## Step 8: Verify Deployment

1. **Visit your domain:**
   - https://yourdomain.com

2. **Test functionality:**
   - Login with admin credentials
   - Create a test car listing
   - Upload images
   - Test customer registration
   - Test filtering

3. **Check logs:**
```bash
# Backend logs
pm2 logs auto-martines

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Updating the Application

### 1. On Local Machine

```bash
# Make your changes
# Build frontend
npm run build

# Create update archive
tar -czf auto-martines-update.tar.gz dist/ server/
```

### 2. On Server

```bash
# Stop the application
pm2 stop auto-martines

# Backup database
cp /var/www/auto-martines/server/data/automartines.db \
   /var/www/auto-martines/server/data/automartines.db.backup

# Extract update
cd /var/www/auto-martines
tar -xzf ~/auto-martines-update.tar.gz

# Install any new dependencies
npm install --production

# Restart application
pm2 restart auto-martines

# Check logs
pm2 logs auto-martines
```

## Backup Strategy

### Database Backup

Create a backup script:

```bash
sudo nano /usr/local/bin/backup-auto-martines.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/auto-martines"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/auto-martines/server/data/automartines.db \
   $BACKUP_DIR/automartines_$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz \
   /var/www/auto-martines/server/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and add to cron:

```bash
sudo chmod +x /usr/local/bin/backup-auto-martines.sh

# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-auto-martines.sh >> /var/log/auto-martines-backup.log 2>&1
```

## Monitoring

### Log Rotation

```bash
sudo nano /etc/logrotate.d/auto-martines
```

```
/home/pm2/.pm2/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
}
```

### System Resources

```bash
# Check PM2 status
pm2 status

# Monitor resources
pm2 monit

# Check disk usage
df -h

# Check memory
free -h
```

## Troubleshooting

### Backend not starting
```bash
# Check logs
pm2 logs auto-martines

# Check if port 5000 is in use
sudo lsof -i :5000

# Restart
pm2 restart auto-martines
```

### Nginx errors
```bash
# Check configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Database locked
```bash
# Stop application
pm2 stop auto-martines

# Check for zombie processes
ps aux | grep node

# Restart
pm2 restart auto-martines
```

### Images not uploading
```bash
# Check permissions
ls -la /var/www/auto-martines/server/uploads/

# Fix permissions if needed
sudo chown -R $USER:$USER /var/www/auto-martines/server/uploads/
chmod -R 755 /var/www/auto-martines/server/uploads/
```

## Security Checklist

- ✅ Changed default admin password
- ✅ Generated secure JWT_SECRET
- ✅ SSL/HTTPS enabled
- ✅ Firewall configured
- ✅ Regular backups scheduled
- ✅ Nginx security headers added
- ✅ File upload size limits set
- ✅ Updated all dependencies
- ✅ NODE_ENV set to production
- ✅ Log rotation configured

## Performance Optimization

### Enable HTTP/2 in Nginx

Edit `/etc/nginx/sites-available/auto-martines`:

```nginx
listen 443 ssl http2;
```

### Enable Brotli Compression (Optional)

```bash
# Install Brotli module
sudo apt install nginx-module-brotli -y

# Add to nginx.conf
sudo nano /etc/nginx/nginx.conf
```

Add in http block:
```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## Contact

For deployment issues:
- Email: imranhussain.cse@gmail.com

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
