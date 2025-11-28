# Fix Image Loading Issue - Server Deployment

## Problem
Car images are not loading because the frontend was built with `localhost:5010` URLs hardcoded.

## Solution
The code has been fixed to use environment variables. You need to:
1. Update `.env` file on the server with your production domain
2. Rebuild the frontend on the server
3. Restart the application

## Step-by-Step Instructions

### Step 1: SSH into your server
```bash
ssh user@your-server-ip
```

### Step 2: Navigate to the application directory
```bash
cd /root/auto-online
```

### Step 3: Pull the latest code changes
```bash
git pull origin main
```

### Step 4: Update your `.env` file

**IMPORTANT:** Replace `yourdomain.com` with your actual domain or server IP.

```bash
nano .env
```

Update the URLs to match your production domain:

```env
# If you have a domain name:
VITE_APP_URL=http://yourdomain.com
VITE_API_URL=http://yourdomain.com/api

# OR if you're using an IP address without SSL:
# VITE_APP_URL=http://123.45.67.89
# VITE_API_URL=http://123.45.67.89/api

# OR if you have SSL/HTTPS setup:
# VITE_APP_URL=https://yourdomain.com
# VITE_API_URL=https://yourdomain.com/api

PORT=5010
JWT_SECRET=<your-existing-secret>
CLIENT_URL=http://yourdomain.com
NODE_ENV=production
```

**Important Notes:**
- Keep `PORT=5010` (or whatever port your backend is using)
- Don't change `JWT_SECRET` (keep your existing secret)
- Make sure to use the same protocol (http/https) everywhere
- If using HTTPS, all URLs must start with `https://`

### Step 5: Rebuild the frontend

This is the critical step - the environment variables are compiled into the frontend during build:

```bash
NODE_ENV=production npm run build
```

### Step 6: Fix permissions

```bash
sudo chown -R www-data:www-data dist
chmod -R 755 dist
```

### Step 7: Restart the application

```bash
pm2 restart auto-online
pm2 save
```

### Step 8: Reload Nginx

```bash
sudo systemctl reload nginx
```

### Step 9: Verify it's working

```bash
# Check backend is running
pm2 list

# Check backend logs
pm2 logs auto-online --lines 20

# Test the API
curl http://localhost:5010/api/listings

# Check dist folder exists and has files
ls -la dist/
```

## Quick Fix Script

You can also use the automated deployment script:

```bash
cd /root/auto-online

# Make sure deploy.sh is executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

**Note:** This assumes you've already updated your `.env` file with the correct domain URLs.

## Testing

After deployment:

1. **Open your website** in a browser
2. **Go to a car listing** page
3. **Check the browser console** (F12 → Console tab)
4. **Images should load** from your domain, not localhost

If images still don't load, check:
- Browser console for errors
- Network tab (F12 → Network) to see what URLs are being requested
- That `.env` has the correct domain
- That you rebuilt after updating `.env`

## Troubleshooting

### Images still showing localhost URLs

This means the frontend wasn't rebuilt after updating `.env`:

```bash
# Delete old build
rm -rf dist

# Rebuild
NODE_ENV=production npm run build

# Fix permissions
sudo chown -R www-data:www-data dist

# Reload Nginx
sudo systemctl reload nginx
```

### 404 errors for images

Check Nginx configuration and permissions:

```bash
# Check Nginx config has correct uploads path
sudo cat /etc/nginx/sites-available/auto-online | grep uploads

# Should show:
# location /uploads/ {
#     alias /root/auto-online/server/uploads/;
# }

# Check uploads directory exists
ls -la server/uploads/listings/

# Fix permissions if needed
chmod -R 755 server/uploads/
```

### Still seeing errors

```bash
# Check what port backend is actually using
pm2 logs auto-online | grep "running on port"

# Verify Nginx proxy_pass matches the port
sudo cat /etc/nginx/sites-available/auto-online | grep proxy_pass

# Should show the correct port (e.g., 5010):
# proxy_pass http://localhost:5010/api/;
```

## What Was Fixed

The following files were updated to use environment variables instead of hardcoded localhost URLs:

1. `src/api/client.js` - Added `getBaseURL()` helper function
2. `src/pages/ListingDetails.jsx` - Image paths now use `getBaseURL()`
3. `src/pages/AdminDashboard.jsx` - Image paths now use `getBaseURL()`
4. `src/pages/EditListing.jsx` - Image paths now use `getBaseURL()`
5. `src/components/listings/ListingItem.jsx` - Image paths now use `getBaseURL()`

All image URLs will now automatically use the domain configured in `VITE_API_URL`.
