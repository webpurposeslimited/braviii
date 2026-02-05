# Bravilio Production Deployment Guide for Ubuntu

This guide covers deploying Bravilio on Ubuntu 22.04 LTS with Docker, Nginx, SSL, and all required services.

## Prerequisites

- Ubuntu 22.04 LTS server (minimum 4GB RAM, 2 vCPUs)
- Domain name pointed to your server's IP address
- SSH access with sudo privileges

## 1. Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Docker
```bash
# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Log out and back in for group changes to take effect.

### Install Additional Tools
```bash
sudo apt install -y git htop ufw fail2ban
```

## 2. Firewall Configuration

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

## 3. Clone Repository

```bash
# Create app directory
sudo mkdir -p /opt/bravilio
sudo chown $USER:$USER /opt/bravilio

# Clone the repository
cd /opt/bravilio
git clone https://github.com/your-org/bravilio.git .
```

## 4. Environment Configuration

### Create Production Environment File
```bash
cp .env.example .env.production
nano .env.production
```

### Required Environment Variables
```env
# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# Database
DATABASE_URL=postgresql://bravilio:your-db-password@postgres:5432/bravilio
POSTGRES_USER=bravilio
POSTGRES_PASSWORD=your-db-password
POSTGRES_DB=bravilio

# Redis
REDIS_URL=redis://:your-redis-password@redis:6379
REDIS_PASSWORD=your-redis-password

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Google Maps API
GOOGLE_MAPS_API_KEY=xxx

# Apollo API (optional)
APOLLO_API_KEY=xxx

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# S3 Storage (optional)
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_BUCKET=bravilio-uploads
S3_REGION=us-east-1
```

### Generate Secure Keys
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 16

# Generate database password
openssl rand -base64 24

# Generate Redis password
openssl rand -base64 24
```

## 5. SSL Certificate Setup

### Install Certbot
```bash
sudo apt install -y certbot
```

### Obtain Certificate (before starting Nginx)
```bash
# Stop any service using port 80
sudo systemctl stop nginx 2>/dev/null || true

# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Certificates will be saved to:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

### Update Nginx Configuration
```bash
# Edit nginx config to use your domain
nano nginx/nginx.conf

# Replace 'your-domain.com' with your actual domain
```

### Copy Certificates for Docker
```bash
mkdir -p nginx/ssl
sudo cp -r /etc/letsencrypt nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
```

## 6. Build and Deploy

### Build Production Images
```bash
# Load environment variables
set -a
source .env.production
set +a

# Build images
docker-compose -f docker-compose.prod.yml build
```

### Initialize Database
```bash
# Start only postgres first
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for postgres to be ready
sleep 10

# Run Prisma migrations
docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# Seed initial data (optional)
docker-compose -f docker-compose.prod.yml run --rm app npx prisma db seed
```

### Start All Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Verify Deployment
```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app

# Test health endpoint
curl http://localhost:3000/api/health
```

## 7. SSL Auto-Renewal

### Create Renewal Script
```bash
sudo nano /etc/cron.d/certbot-renew
```

Add:
```
0 0 * * * root certbot renew --quiet --post-hook "docker-compose -f /opt/bravilio/docker-compose.prod.yml restart nginx"
```

## 8. Monitoring & Maintenance

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f worker
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart app
```

### Update Application
```bash
cd /opt/bravilio

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build app worker
docker-compose -f docker-compose.prod.yml up -d app worker

# Run migrations if needed
docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
```

### Database Backup
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U bravilio bravilio > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U bravilio bravilio < backup.sql
```

### Automated Backups
```bash
# Create backup script
sudo nano /opt/bravilio/scripts/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/bravilio/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
docker-compose -f /opt/bravilio/docker-compose.prod.yml exec -T postgres pg_dump -U bravilio bravilio | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql.gz"
```

```bash
chmod +x /opt/bravilio/scripts/backup.sh

# Add to crontab (daily at 2am)
echo "0 2 * * * /opt/bravilio/scripts/backup.sh >> /var/log/bravilio-backup.log 2>&1" | sudo tee -a /etc/crontab
```

## 9. Scaling

### Horizontal Scaling with Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy as stack
docker stack deploy -c docker-compose.prod.yml bravilio

# Scale app replicas
docker service scale bravilio_app=3
```

### Load Balancing
For multiple app instances, update nginx upstream:

```nginx
upstream nextjs {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
    keepalive 64;
}
```

## 10. Troubleshooting

### Container Won't Start
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs app

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Inspect container
docker inspect bravilio-app
```

### Database Connection Issues
```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec app npx prisma db push --preview-feature

# Check postgres logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### Redis Connection Issues
```bash
# Test redis connection
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD ping
```

### SSL Certificate Issues
```bash
# Test certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check certificate expiry
sudo certbot certificates
```

### Out of Disk Space
```bash
# Clean up Docker
docker system prune -af
docker volume prune -f

# Check disk usage
df -h
```

## 11. Security Checklist

- [ ] All environment variables set securely
- [ ] Database password is strong and unique
- [ ] Redis password is set
- [ ] SSL certificate is valid
- [ ] Firewall is configured
- [ ] Fail2ban is installed and configured
- [ ] Regular backups are scheduled
- [ ] Logs are being monitored
- [ ] Application is running as non-root user

## 12. Performance Optimization

### PostgreSQL Tuning
Add to `postgresql.conf` or environment:
```
POSTGRES_INITDB_ARGS=--data-checksums
```

### Redis Configuration
```bash
# In docker-compose.prod.yml, add to redis command:
command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### Enable Swap (for low-memory servers)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/bravilio/issues
- Documentation: https://docs.bravilio.com
- Email: support@bravilio.com
