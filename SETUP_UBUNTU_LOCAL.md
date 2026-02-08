# Complete Ubuntu Setup Guide with Local Storage

This guide covers setting up Bravilio on Ubuntu 22.04 with all services and **local file storage** instead of S3.

## Prerequisites

- Ubuntu 22.04 LTS (minimum 4GB RAM, 2 vCPUs, 40GB storage)
- Domain name (optional for development)
- Root or sudo access

---

## 1. System Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl git
```

### Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be v20.x
npm --version
```

---

## 2. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE USER bravilio WITH PASSWORD 'your-secure-password';
CREATE DATABASE bravilio OWNER bravilio;
GRANT ALL PRIVILEGES ON DATABASE bravilio TO bravilio;
\q
EOF

# Test connection
psql -U bravilio -h localhost -d bravilio -c "SELECT version();"
```

---

## 3. Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

Update these settings:
```conf
supervised systemd
requirepass your-redis-password
maxmemory 256mb
maxmemory-policy allkeys-lru
```

```bash
# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis

# Test connection
redis-cli -a your-redis-password ping
```

---

## 4. Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /opt/bravilio
sudo chown $USER:$USER /opt/bravilio
cd /opt/bravilio

# Clone repository
git clone https://github.com/your-org/bravilio.git .

# Install dependencies
npm install
```

---

## 5. Configure Local File Storage

### Create Upload Directory
```bash
# Create storage directory
sudo mkdir -p /var/bravilio/uploads
sudo chown -R $USER:www-data /var/bravilio/uploads
sudo chmod -R 775 /var/bravilio/uploads

# Create subdirectories
mkdir -p /var/bravilio/uploads/{avatars,documents,exports,temp}
```

### Update Environment Variables
```bash
cp .env.example .env
nano .env
```

Configure `.env`:
```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bravilio.com
NEXT_PUBLIC_APP_NAME=Bravilio
NEXTAUTH_URL=https://bravilio.com

# Database
DATABASE_URL=postgresql://bravilio:your-secure-password@localhost:5432/bravilio?schema=public

# Redis
REDIS_URL=redis://:your-redis-password@localhost:6379

# Auth Secrets (Generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
JWT_SECRET=your-jwt-secret-min-32-chars

# LOCAL FILE STORAGE (instead of S3)
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=/var/bravilio/uploads
STORAGE_PUBLIC_URL=https://bravilio.com/uploads

# Stripe (Get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Microsoft OAuth (portal.azure.com)
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx

# Email - Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@bravilio.com

# Apollo API (apollo.io)
APOLLO_API_KEY=your-apollo-api-key

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Sentry Error Tracking (sentry.io)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Encryption Key (Generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your-64-char-hex-encryption-key

# Feature Flags
ENABLE_LINKEDIN_AUTOMATION=false

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

---

## 6. Generate Required Secrets

```bash
# Generate NEXTAUTH_SECRET
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"

# Generate JWT_SECRET
echo "JWT_SECRET=$(openssl rand -base64 32)"

# Generate ENCRYPTION_KEY (64 chars hex)
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"

# Generate Redis password
echo "REDIS_PASSWORD=$(openssl rand -base64 24)"

# Generate Database password
echo "DATABASE_PASSWORD=$(openssl rand -base64 24)"
```

---

## 7. Setup OAuth Providers

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized redirect: `https://bravilio.com/api/auth/callback/google`
5. Copy Client ID and Secret to `.env`

### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com)
2. Azure AD → App registrations → New registration
3. Add redirect URI: `https://bravilio.com/api/auth/callback/microsoft`
4. Certificates & secrets → New client secret
5. Copy Application ID and Secret to `.env`

---

## 8. Setup Email (Gmail Example)

### Enable 2FA and Generate App Password
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Generate password for "Mail"
5. Use this password in `SMTP_PASS`

### Alternative: Use Resend (Recommended)
```bash
# Sign up at resend.com
# Get API key from dashboard

# Update .env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_your_api_key_here
```

---

## 9. Setup Stripe

```bash
# Install Stripe CLI for webhooks
curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 10. Initialize Database

```bash
cd /opt/bravilio

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

---

## 11. Build Application

```bash
# Build Next.js app
npm run build

# Test production build locally
npm start
```

---

## 12. Install and Configure PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start npm --name "bravilio" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs

# Monitor application
pm2 monit

# View logs
pm2 logs bravilio
```

---

## 13. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/bravilio
```

Add configuration:
```nginx
# Upstream to Next.js app
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name bravilio.com www.bravilio.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name bravilio.com www.bravilio.com;

    # SSL Configuration (will be added after certbot)
    ssl_certificate /etc/letsencrypt/live/bravilio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bravilio.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client body size (for file uploads)
    client_max_body_size 100M;

    # Serve uploaded files
    location /uploads/ {
        alias /var/bravilio/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Next.js
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bravilio /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Don't start yet (need SSL first)
```

---

## 14. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Stop Nginx temporarily
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d bravilio.com -d www.bravilio.com

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test SSL renewal
sudo certbot renew --dry-run

# Setup auto-renewal (already configured by certbot)
```

---

## 15. Setup Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## 16. Monitoring and Logs

### View PM2 Logs
```bash
# Real-time logs
pm2 logs bravilio

# Last 100 lines
pm2 logs bravilio --lines 100

# Error logs only
pm2 logs bravilio --err
```

### View Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop

# Monitor resources
htop

# Check disk usage
df -h

# Check memory
free -h
```

---

## 17. Automated Backups

### Create Backup Script
```bash
sudo mkdir -p /opt/bravilio/backups
sudo nano /opt/bravilio/scripts/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/bravilio/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PASSWORD="your-secure-password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
PGPASSWORD=$DB_PASSWORD pg_dump -U bravilio -h localhost bravilio | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# File storage backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/bravilio/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /opt/bravilio/scripts/backup.sh

# Test backup
/opt/bravilio/scripts/backup.sh

# Schedule daily backups (2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/bravilio/scripts/backup.sh >> /var/log/bravilio-backup.log 2>&1") | crontab -
```

---

## 18. Update Application

```bash
cd /opt/bravilio

# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Rebuild application
npm run build

# Restart with PM2
pm2 restart bravilio

# Check status
pm2 status
```

---

## 19. Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs bravilio --err

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart application
pm2 restart bravilio
```

### Database connection issues
```bash
# Test database connection
psql -U bravilio -h localhost -d bravilio

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Redis connection issues
```bash
# Test Redis
redis-cli -a your-redis-password ping

# Check Redis status
sudo systemctl status redis

# View Redis logs
sudo journalctl -u redis -f
```

### File upload issues
```bash
# Check directory permissions
ls -la /var/bravilio/uploads

# Fix permissions
sudo chown -R $USER:www-data /var/bravilio/uploads
sudo chmod -R 775 /var/bravilio/uploads
```

### Nginx issues
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 20. Performance Optimization

### Enable Swap (for low-memory servers)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### PostgreSQL Tuning
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Add:

```conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

```bash
sudo systemctl restart postgresql
```

### Redis Tuning
```bash
sudo nano /etc/redis/redis.conf
```

Add:
```conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

```bash
sudo systemctl restart redis
```

---

## Quick Reference Commands

```bash
# Application
pm2 restart bravilio     # Restart app
pm2 logs bravilio        # View logs
pm2 monit                # Monitor resources

# Database
psql -U bravilio -d bravilio                    # Connect to DB
pg_dump -U bravilio bravilio > backup.sql       # Backup
psql -U bravilio -d bravilio < backup.sql       # Restore

# Nginx
sudo nginx -t                    # Test config
sudo systemctl restart nginx     # Restart
sudo tail -f /var/log/nginx/error.log  # Logs

# SSL
sudo certbot renew               # Renew certificates
sudo certbot certificates        # Check expiry

# System
htop                            # Monitor resources
df -h                           # Disk usage
free -h                         # Memory usage
sudo ufw status                 # Firewall status
```

---

## Security Checklist

- [ ] All secrets generated and stored securely
- [ ] Database password is strong (24+ characters)
- [ ] Redis password is set
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall enabled (UFW)
- [ ] SSH key authentication enabled (disable password auth)
- [ ] Fail2ban installed for brute force protection
- [ ] Regular backups scheduled
- [ ] File upload directory has correct permissions
- [ ] Environment file (.env) is not committed to git
- [ ] Sentry or error tracking configured
- [ ] Application running as non-root user

---

## Complete Setup Checklist

- [ ] Ubuntu server updated
- [ ] Node.js 20 installed
- [ ] PostgreSQL installed and configured
- [ ] Redis installed and configured
- [ ] Application cloned and dependencies installed
- [ ] Local storage directory created with proper permissions
- [ ] .env file configured with all secrets
- [ ] OAuth providers configured (Google, Microsoft)
- [ ] Email SMTP configured
- [ ] Stripe configured with webhooks
- [ ] Database migrated and seeded
- [ ] Application built for production
- [ ] PM2 installed and configured
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained and installed
- [ ] Firewall configured
- [ ] Automated backups scheduled
- [ ] Monitoring tools installed

---

## Need Help?

- **Logs:** Check PM2, Nginx, PostgreSQL logs
- **GitHub Issues:** Report bugs and issues
- **Documentation:** Read the full docs
- **Community:** Join Discord/Slack community
