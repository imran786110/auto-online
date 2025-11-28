# Deployment Guide - Linux + Nginx

This guide covers deploying Auto Martines to a Linux server with Nginx.

## Deployment Methods

This guide covers two deployment approaches:
1. **Git-based deployment** (Recommended) - Clone repo directly on server
2. **Archive-based deployment** - Build locally and upload tar file

Choose the method that works best for your workflow.

## Prerequisites

- Linux server (Ubuntu 20.04+ or similar)
- Root or sudo access
- Domain name pointed to your server's IP
- Node.js 16+ installed
- Nginx installed
- Git installed (for git-based deployment)

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

Choose between Method A (Git-based) or Method B (Archive-based).

---

### Method A: Git-Based Deployment (Recommended)

**On the Server:**

```bash
# SSH into your server
ssh user@your-server-ip

# Navigate to deployment directory
cd /var/www

# Clone the repository
sudo git clone https://github.com/yourusername/auto-online.git
cd auto-online

# Set ownership
sudo chown -R $USER:$USER /var/www/auto-online

# Install ALL dependencies (including dev dependencies for building)
npm install

# Build the frontend on the server
NODE_ENV=production npm run build

# Create necessary directories
mkdir -p server/data
mkdir -p server/uploads/listings
chmod 755 server/data
chmod 755 server/uploads

# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy the output

# Create .env file
nano .env
```

Configure your `.env` file:
```env
VITE_APP_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
PORT=5000
JWT_SECRET=<paste-your-generated-secret>
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

**For future updates:**
```bash
# Stop the application
pm2 stop auto-online

# Backup database
cp server/data/automartines.db server/data/automartines.db.backup

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild frontend
NODE_ENV=production npm run build

# Restart application
pm2 restart auto-online

# Check logs
pm2 logs auto-online
```

---

### Method B: Archive-Based Deployment

**On Your Local Machine:**

1. **Build the frontend:**
```bash
npm install
npm run build
```

2. **Create deployment archive:**
```bash
# Create archive (without .env.production - configure on server instead)
tar -czf auto-online.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=server/data \
  server/ \
  dist/ \
  package.json \
  package-lock.json
```

3. **Upload to server:**
```bash
scp auto-online.tar.gz user@your-server-ip:/home/user/
```

**On the Server:**

```bash
# SSH into your server
ssh user@your-server-ip

# Create application directory
sudo mkdir -p /var/www/auto-online
cd /var/www/auto-online

# Extract files
sudo tar -xzf ~/auto-online.tar.gz -C /var/www/auto-online/

# Set ownership
sudo chown -R $USER:$USER /var/www/auto-online

# Install production dependencies only
npm install --omit=dev

# Create necessary directories
mkdir -p server/data
mkdir -p server/uploads/listings
chmod 755 server/data
chmod 755 server/uploads

# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy the output

# Create .env file
nano .env
```

Configure your `.env` file:
```env
VITE_APP_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
PORT=5000
JWT_SECRET=<paste-your-generated-secret>
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Step 3: Continue with Nginx and PM2 Setup

After completing either Method A or Method B, proceed with the following steps.

## Step 4: Configure Nginx

### Create Nginx Configuration

**Step 1: Create the configuration file**

```bash
sudo nano /etc/nginx/sites-available/auto-online
```

**Step 2: Add the following configuration**

Replace `yourdomain.com` with your actual domain (or use your server's IP address if you don't have a domain yet):

**IMPORTANT:** Before adding this configuration, check what port your backend is actually running on:
```bash
# Check backend logs to see what port it's using
pm2 logs auto-online --lines 5

# Or check .env file
cat /var/www/auto-online/.env | grep PORT
```

Then use that port number in the `proxy_pass` line below (default is 5000, but it might be different like 5010):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve static files (frontend)
    # IMPORTANT: Update this path to match your actual location!
    root /root/auto-online/dist;
    index index.html;

    # Uploaded images
    # IMPORTANT: Update this path to match your actual location!
    location /uploads/ {
        alias /root/auto-online/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to Node.js backend
    # IMPORTANT: Change 5000 to match your actual backend port!
    location /api/ {
        proxy_pass http://localhost:5010/api/;
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

**Important Configuration Notes:**

1. **Port Configuration:**
   - The `proxy_pass` port MUST match your backend's actual port
   - Check with: `pm2 logs auto-online | grep "running on port"`
   - Common ports: 5000, 5010, or whatever is in your `.env` file

2. **Domain/IP Configuration:**
   - If you don't have a domain, replace `server_name yourdomain.com www.yourdomain.com;` with your server's IP:
     ```nginx
     server_name 123.45.67.89;
     ```
   - Make sure your domain's DNS A record points to your server's IP address

3. **Path Configuration:**
   - Ensure `root /var/www/auto-online/dist;` points to your actual dist folder location
   - If you cloned to a different location (e.g., `/root/auto-online`), update this path

4. **Verify Prerequisites:**
   - Backend is running: `pm2 list`
   - Dist folder exists: `ls -la /var/www/auto-online/dist/`
   - Permissions are correct: `dist` folder should be readable by www-data

### Enable Site

**Step 3: Create symbolic link to enable the site**

```bash
sudo ln -s /etc/nginx/sites-available/auto-online /etc/nginx/sites-enabled/
```

**Step 4: Test Nginx configuration for syntax errors**

```bash
sudo nginx -t
```

You should see:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Step 5: Reload Nginx**

```bash
sudo systemctl reload nginx
```

**Step 6: Verify Nginx is running**

```bash
sudo systemctl status nginx
```

### Troubleshooting Nginx Issues

**500 Internal Server Error:**

This usually means the backend has an issue. Run these diagnostic commands:

```bash
# 1. Check if PM2 is running your application
pm2 list

# 2. Check backend logs for errors
pm2 logs auto-online --lines 50

# 3. Check if backend is listening on port 5000
sudo lsof -i :5000

# 4. Check Nginx error logs
sudo tail -n 50 /var/log/nginx/error.log

# 5. Verify .env file exists
cat /var/www/auto-online/.env
```

**Common fixes for 500 error:**

```bash
# If backend isn't running
cd /var/www/auto-online
pm2 start server/index.js --name auto-online
pm2 save

# If .env is missing, create it
nano /var/www/auto-online/.env
# Then add your configuration (see Step 2)

# If dependencies are missing
cd /var/www/auto-online
npm install
pm2 restart auto-online

# Check database directory exists
ls -la /var/www/auto-online/server/data/

# Fix file permissions
sudo chown -R $USER:$USER /var/www/auto-online
mkdir -p /var/www/auto-online/server/uploads/listings
chmod -R 755 /var/www/auto-online/server/uploads
```

**502 Bad Gateway Error:**
- Backend isn't running - check with `pm2 list`
- Wrong port in proxy_pass - verify backend is on port 5000
- Check backend logs: `pm2 logs auto-online`

**Port 80 already in use:**
```bash
# Check what's using port 80
sudo lsof -i :80

# Or check with netstat
sudo netstat -tlnp | grep :80
```

**Permission denied errors:**
```bash
# Fix permissions for dist and uploads directories
sudo chown -R www-data:www-data /var/www/auto-online/dist
sudo chown -R $USER:$USER /var/www/auto-online/server/uploads
chmod -R 755 /var/www/auto-online/server/uploads
```

## Step 5: Start Backend with PM2

```bash
cd /var/www/auto-online

# Start the backend server
pm2 start server/index.js --name auto-online

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
```

### PM2 Useful Commands

```bash
# View logs
pm2 logs auto-online

# Restart application
pm2 restart auto-online

# Stop application
pm2 stop auto-online

# Monitor
pm2 monit

# List all processes
pm2 list
```

## Step 6: Setup SSL Certificate with Let's Encrypt

**Important:** You MUST have a domain name pointed to your server's IP address. Let's Encrypt cannot issue certificates for IP addresses.

### Prerequisites

```bash
# 1. Verify your domain points to your server
nslookup yourdomain.com

# 2. Ensure Nginx is running and serving HTTP
curl http://yourdomain.com

# 3. Make sure ports 80 and 443 are open
sudo ufw status
```

### Install Certbot

```bash
# Install Certbot and the Nginx plugin
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Verify installation
certbot --version
```

### Obtain SSL Certificate

**Step 1: Run Certbot with Nginx plugin**

Replace `yourdomain.com` with your actual domain:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Step 2: Follow the interactive prompts:**

1. **Enter email address** - For renewal and security notifications
   ```
   Enter email address (used for urgent renewal and security notices)
   ```

2. **Agree to Terms of Service**
   ```
   Please read the Terms of Service at https://letsencrypt.org/documents/LE-SA-v1.3-September-21-2022.pdf
   (A)gree/(C)ancel: A
   ```

3. **Share email (optional)**
   ```
   Would you be willing to share your email address with EFF?
   (Y)es/(N)o: N
   ```

4. **Choose redirect option (Recommended: Yes)**
   ```
   Please choose whether or not to redirect HTTP traffic to HTTPS
   1: No redirect - Make no further changes to the webserver configuration
   2: Redirect - Make all requests redirect to secure HTTPS access
   Select the appropriate number [1-2] then [enter]: 2
   ```

**Step 3: Verify certificate was obtained**

You should see:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/yourdomain.com/privkey.pem
This certificate expires on YYYY-MM-DD.
```

### Update .env File for HTTPS

After obtaining the SSL certificate, update your `.env` file to use HTTPS:

```bash
nano /var/www/auto-online/.env
```

Change HTTP to HTTPS:
```env
VITE_APP_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
PORT=5000
JWT_SECRET=<your-secret>
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

**Restart the backend:**
```bash
pm2 restart auto-online
```

### Verify SSL Configuration

```bash
# Check Nginx configuration
sudo nginx -t

# View the updated Nginx config (Certbot modified it)
sudo cat /etc/nginx/sites-available/auto-online

# Reload Nginx
sudo systemctl reload nginx
```

### Test Auto-Renewal

Let's Encrypt certificates expire after 90 days. Certbot automatically sets up renewal. Test it:

```bash
# Dry run to test renewal process
sudo certbot renew --dry-run
```

You should see:
```
Congratulations, all simulated renewals succeeded
```

### Check Certificate Status

```bash
# List all certificates
sudo certbot certificates

# Check certificate expiry
sudo certbot certificates | grep Expiry
```

### Manual Renewal (if needed)

```bash
# Renew all certificates
sudo certbot renew

# Renew specific certificate
sudo certbot renew --cert-name yourdomain.com

# Force renewal (even if not expiring soon)
sudo certbot renew --force-renewal
```

### Verify HTTPS is Working

1. **Visit your domain:**
   ```
   https://yourdomain.com
   ```

2. **Check SSL with browser:**
   - Click the padlock icon in your browser
   - Verify certificate is valid and issued by Let's Encrypt

3. **Test with curl:**
   ```bash
   curl -I https://yourdomain.com
   ```

4. **Check SSL Labs rating (optional):**
   - Visit: https://www.ssllabs.com/ssltest/
   - Enter your domain for a comprehensive SSL test

### Troubleshooting SSL Issues

**Certificate request failed:**
```bash
# Check if domain resolves to your server
dig yourdomain.com

# Ensure port 80 is accessible
sudo netstat -tlnp | grep :80

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

**Certificate renewal fails:**
```bash
# Check Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Manually renew with verbose output
sudo certbot renew --dry-run --verbose
```

**Mixed content warnings (HTTP resources on HTTPS page):**
- Update your `.env` to use HTTPS URLs
- Check that API calls use `https://` not `http://`
- Restart PM2: `pm2 restart auto-online`

### Auto-Renewal is Automatic

Certbot automatically creates a systemd timer for renewal. Verify it:

```bash
# Check renewal timer status
sudo systemctl status certbot.timer

# List all timers
sudo systemctl list-timers | grep certbot
```

The certificate will auto-renew when it's within 30 days of expiration.

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
pm2 logs auto-online

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Updating the Application

### Git-Based Method (Recommended)

See the "For future updates" section in Method A above, or use these commands:

```bash
pm2 stop auto-online
cp server/data/automartines.db server/data/automartines.db.backup
git pull origin main
npm install
NODE_ENV=production npm run build
pm2 restart auto-online
pm2 logs auto-online
```

### Archive-Based Method

**On Local Machine:**

```bash
# Make your changes
# Build frontend
npm run build

# Create update archive
tar -czf auto-online-update.tar.gz dist/ server/
```

**On Server:**

```bash
# Stop the application
pm2 stop auto-online

# Backup database
cp /var/www/auto-online/server/data/automartines.db \
   /var/www/auto-online/server/data/automartines.db.backup

# Extract update
cd /var/www/auto-online
tar -xzf ~/auto-online-update.tar.gz

# Install any new dependencies
npm install --omit=dev

# Restart application
pm2 restart auto-online

# Check logs
pm2 logs auto-online
```

## Backup Strategy

### Database Backup

Create a backup script:

```bash
sudo nano /usr/local/bin/backup-auto-online.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/auto-online"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/auto-online/server/data/automartines.db \
   $BACKUP_DIR/automartines_$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz \
   /var/www/auto-online/server/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and add to cron:

```bash
sudo chmod +x /usr/local/bin/backup-auto-online.sh

# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-auto-online.sh >> /var/log/auto-online-backup.log 2>&1
```

## Monitoring

### Log Rotation

```bash
sudo nano /etc/logrotate.d/auto-online
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
pm2 logs auto-online

# Check if port 5000 is in use
sudo lsof -i :5000

# Restart
pm2 restart auto-online
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
pm2 stop auto-online

# Check for zombie processes
ps aux | grep node

# Restart
pm2 restart auto-online
```

### Images not uploading
```bash
# Check permissions
ls -la /var/www/auto-online/server/uploads/

# Fix permissions if needed
sudo chown -R $USER:$USER /var/www/auto-online/server/uploads/
chmod -R 755 /var/www/auto-online/server/uploads/
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

Edit `/etc/nginx/sites-available/auto-online`:

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
