# Bravilio — Complete Single-Server Deployment Guide (Ubuntu)

> **Everything on one server**: App + PostgreSQL + Redis + Nginx + SSL  
> Tested on Ubuntu 22.04 LTS · Minimum 4 GB RAM, 2 vCPUs, 40 GB disk

---

## Table of Contents

1. [Server Preparation](#1-server-preparation)
2. [Firewall & Security](#2-firewall--security)
3. [Install Docker & Docker Compose](#3-install-docker--docker-compose)
4. [Clone the Repository](#4-clone-the-repository)
5. [Generate Secrets & Create .env.production](#5-generate-secrets--create-envproduction)
6. [Update Nginx Config with Your Domain](#6-update-nginx-config-with-your-domain)
7. [SSL Certificate (Let's Encrypt)](#7-ssl-certificate-lets-encrypt)
8. [Build & Start Everything](#8-build--start-everything)
9. [Initialize Database & Seed](#9-initialize-database--seed)
10. [Verify Deployment](#10-verify-deployment)
11. [Automated Backups](#11-automated-backups)
12. [SSL Auto-Renewal](#12-ssl-auto-renewal)
13. [Updating the Application](#13-updating-the-application)
14. [Monitoring & Logs](#14-monitoring--logs)
15. [Performance Tuning](#15-performance-tuning)
16. [Troubleshooting](#16-troubleshooting)
17. [Security Checklist](#17-security-checklist)

---

## 1. Server Preparation

SSH into your server and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essentials
sudo apt install -y git htop curl wget unzip nano fail2ban ufw \
  apt-transport-https ca-certificates software-properties-common

# Set timezone (adjust to yours)
sudo timedatectl set-timezone UTC

# Enable swap if server has ≤ 4 GB RAM
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 2. Firewall & Security

```bash
# Enable firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# Verify
sudo ufw status verbose

# Fail2ban is auto-started after install — verify
sudo systemctl status fail2ban
```

> **Note**: Do NOT open ports 5432 (Postgres) or 6379 (Redis) externally. They stay internal to Docker.

---

## 3. Install Docker & Docker Compose

```bash
# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose v2 plugin
sudo apt install -y docker-compose-plugin

# Also install standalone docker-compose (used in scripts)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker $USER
```

**Log out and log back in** for the group change to take effect, then verify:

```bash
docker --version
docker-compose --version
docker run hello-world
```

---

## 4. Clone the Repository

```bash
# Create app directory
sudo mkdir -p /opt/bravilio
sudo chown $USER:$USER /opt/bravilio

# Clone
cd /opt/bravilio
git clone https://github.com/your-org/bravilio.git .

# Create required directories
mkdir -p scripts backups nginx/ssl
```

---

## 5. Generate Secrets & Create .env.production

### 5a. Generate all secrets first

Run these and **save the output** — you'll paste them into the env file:

```bash
echo "NEXTAUTH_SECRET = $(openssl rand -base64 32)"
echo "JWT_SECRET       = $(openssl rand -base64 32)"
echo "ENCRYPTION_KEY   = $(openssl rand -hex 16)"
echo "POSTGRES_PASS    = $(openssl rand -base64 24)"
echo "REDIS_PASS       = $(openssl rand -base64 24)"
```

### 5b. Create the production environment file

```bash
cp .env.example .env.production
nano .env.production
```

Fill in **every** variable below. Replace `your-domain.com` and placeholder values:

```env
# ─── Application ────────────────────────────────────────────
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<paste-generated-value>
JWT_SECRET=<paste-generated-value>
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Bravilio

# ─── Database (Postgres inside Docker) ─────────────────────
DATABASE_URL=postgresql://bravilio:<POSTGRES_PASS>@postgres:5432/bravilio?schema=public
POSTGRES_USER=bravilio
POSTGRES_PASSWORD=<POSTGRES_PASS>
POSTGRES_DB=bravilio

# ─── Redis (inside Docker) ─────────────────────────────────
REDIS_URL=redis://default:<REDIS_PASS>@redis:6379
REDIS_PASSWORD=<REDIS_PASS>

# ─── Encryption ────────────────────────────────────────────
ENCRYPTION_KEY=<paste-generated-hex>

# ─── Google OAuth ──────────────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ─── Stripe (leave empty if not using yet) ─────────────────
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# ─── Google Maps API ───────────────────────────────────────
GOOGLE_MAPS_API_KEY=

# ─── Apollo API (optional — users can add their own) ───────
APOLLO_API_KEY=

# ─── SMTP Email (required for system emails) ──────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@your-domain.com

# ─── S3 / Object Storage (optional) ───────────────────────
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=
S3_REGION=
S3_ENDPOINT=

# ─── Error Tracking (optional) ────────────────────────────
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# ─── Feature Flags ────────────────────────────────────────
ENABLE_LINKEDIN_AUTOMATION=false

# ─── Rate Limiting ────────────────────────────────────────
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# ─── Uploads ──────────────────────────────────────────────
MAX_UPLOAD_SIZE_MB=10
```

> **Important**: The `DATABASE_URL` hostname is `postgres` (Docker service name), NOT `localhost`.  
> Same for Redis — hostname is `redis`.

---

## 6. Update Nginx Config with Your Domain

```bash
nano nginx/nginx.conf
```

Find these three lines and replace `your-domain.com` with your actual domain:

```
server_name your-domain.com;
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

---

## 7. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install -y certbot

# Make sure nothing is using port 80
sudo systemctl stop nginx 2>/dev/null || true
sudo lsof -i :80  # should show nothing

# Obtain certificate (replace with your domain)
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --non-interactive --agree-tos \
  -m admin@your-domain.com

# Copy certs where Docker can read them
sudo cp -rL /etc/letsencrypt/live nginx/ssl/
sudo cp -rL /etc/letsencrypt/archive nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
```

Verify cert files exist:
```bash
ls -la nginx/ssl/live/your-domain.com/
# Should show: fullchain.pem  privkey.pem  cert.pem  chain.pem
```

---

## 8. Build & Start Everything

```bash
cd /opt/bravilio

# Load environment into shell
set -a && source .env.production && set +a

# Build all Docker images (takes 3-8 minutes first time)
docker-compose -f docker-compose.prod.yml build

# Start Postgres and Redis first
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for them to be healthy
echo "Waiting for database..."
sleep 15
docker-compose -f docker-compose.prod.yml ps  # both should show "healthy"
```

---

## 9. Initialize Database & Seed

```bash
cd /opt/bravilio
set -a && source .env.production && set +a

# Run Prisma migrations to create all tables
docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# If this is a fresh deploy (no migrations yet), use db push instead:
# docker-compose -f docker-compose.prod.yml run --rm app npx prisma db push

# Seed initial data: Super Admin user, roles, permissions
docker-compose -f docker-compose.prod.yml run --rm app npx prisma db seed
```

> **Seed creates**: A Super Admin user (`admin@bravilio.com` / `Admin123!`), default roles (Super Admin, Support Agent, Billing Admin), and all RBAC permissions. **Change the password immediately after first login.**

Now start all remaining services:

```bash
# Start everything
docker-compose -f docker-compose.prod.yml up -d

# Verify all containers are running
docker-compose -f docker-compose.prod.yml ps
```

Expected output — all 5 services running:

| Container | Status |
|---|---|
| bravilio-app | Up (healthy) |
| bravilio-worker | Up |
| bravilio-postgres | Up (healthy) |
| bravilio-redis | Up (healthy) |
| bravilio-nginx | Up |

---

## 10. Verify Deployment

```bash
# Test from server
curl -s http://localhost:3000/api/health
# Should return: {"status":"ok"} or similar

# Test HTTPS (replace with your domain)
curl -s https://your-domain.com
# Should return HTML

# Check all logs for errors
docker-compose -f docker-compose.prod.yml logs --tail=50
```

Open `https://your-domain.com` in your browser. You should see the Bravilio landing page.

**First login**: Go to `https://your-domain.com/login` and sign in with:
- Email: `admin@bravilio.com`
- Password: `Admin123!`
- **Change this password immediately** in Settings.

---

## 11. Automated Backups

### Create backup script

```bash
cat > /opt/bravilio/scripts/backup.sh << 'EOF'
#!/bin/bash
set -e
BACKUP_DIR="/opt/bravilio/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Load env for passwords
set -a && source /opt/bravilio/.env.production && set +a

# Database backup (compressed)
docker exec bravilio-postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Uploads backup
tar czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /opt/bravilio uploads/ 2>/dev/null || true

# Keep only last 14 days
find "$BACKUP_DIR" -type f -mtime +14 -delete

echo "[$(date)] Backup completed: db_$DATE.sql.gz"
EOF

chmod +x /opt/bravilio/scripts/backup.sh
```

### Schedule daily backup at 2 AM

```bash
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/bravilio/scripts/backup.sh >> /var/log/bravilio-backup.log 2>&1") | crontab -
```

### Restore a backup

```bash
# Restore database
gunzip < /opt/bravilio/backups/db_YYYYMMDD_HHMMSS.sql.gz | docker exec -i bravilio-postgres psql -U bravilio bravilio
```

---

## 12. SSL Auto-Renewal

Let's Encrypt certs expire every 90 days. The certbot container in docker-compose handles renewal automatically, but also add a cron as backup:

```bash
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook 'cd /opt/bravilio && docker-compose -f docker-compose.prod.yml restart nginx' >> /var/log/certbot-renew.log 2>&1") | crontab -
```

---

## 13. Updating the Application

```bash
cd /opt/bravilio

# Pull latest code
git pull origin main

# Load env
set -a && source .env.production && set +a

# Rebuild app image
docker-compose -f docker-compose.prod.yml build app worker

# Run any new migrations
docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# Restart app + worker (zero-downtime: nginx keeps serving while containers restart)
docker-compose -f docker-compose.prod.yml up -d app worker

# Verify
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs --tail=20 app
```

---

## 14. Monitoring & Logs

```bash
# Live logs (all services)
docker-compose -f docker-compose.prod.yml logs -f

# Live logs (specific service)
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f worker

# Container resource usage
docker stats

# Disk usage
df -h
docker system df

# Restart a specific service
docker-compose -f docker-compose.prod.yml restart app

# Restart everything
docker-compose -f docker-compose.prod.yml restart

# Stop everything (data persists in Docker volumes)
docker-compose -f docker-compose.prod.yml down

# Stop AND delete all data (DESTRUCTIVE)
# docker-compose -f docker-compose.prod.yml down -v
```

### Connect to database directly

```bash
docker exec -it bravilio-postgres psql -U bravilio bravilio
```

### Connect to Redis directly

```bash
set -a && source /opt/bravilio/.env.production && set +a
docker exec -it bravilio-redis redis-cli -a "$REDIS_PASSWORD"
```

---

## 15. Performance Tuning

### PostgreSQL (for 4 GB RAM server)

Create a custom Postgres config:

```bash
cat > /opt/bravilio/scripts/postgresql-custom.conf << 'EOF'
# Memory
shared_buffers = 512MB
effective_cache_size = 1536MB
work_mem = 8MB
maintenance_work_mem = 128MB

# Connections
max_connections = 100

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Logging
log_min_duration_statement = 1000
EOF
```

Mount it in `docker-compose.prod.yml` under the postgres service volumes:
```yaml
- ./scripts/postgresql-custom.conf:/etc/postgresql/conf.d/custom.conf:ro
```

### Redis memory limit

Already configured in `docker-compose.prod.yml`. To adjust:
```yaml
command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
```

---

## 16. Troubleshooting

### Container won't start
```bash
docker-compose -f docker-compose.prod.yml logs app
docker inspect bravilio-app | grep -A5 "State"
```

### Database connection refused
```bash
# Is Postgres running?
docker-compose -f docker-compose.prod.yml ps postgres

# Can the app reach it?
docker-compose -f docker-compose.prod.yml exec app sh -c 'nc -zv postgres 5432'

# Check DATABASE_URL is using 'postgres' not 'localhost'
grep DATABASE_URL .env.production
```

### Redis connection issues
```bash
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a "$REDIS_PASSWORD" ping
# Should return: PONG
```

### SSL not working
```bash
# Check cert exists
sudo certbot certificates

# Test SSL handshake
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check nginx logs
docker-compose -f docker-compose.prod.yml logs nginx
```

### Out of disk space
```bash
# Check usage
df -h

# Clean up Docker (removes unused images, containers, networks)
docker system prune -af
docker volume prune -f  # WARNING: removes unused volumes
```

### View Prisma Studio (debug database)
```bash
docker-compose -f docker-compose.prod.yml exec app npx prisma studio
# Access at http://your-server-ip:5555 (temporarily open port if needed)
```

---

## 17. Security Checklist

Before going live, verify:

- [ ] `.env.production` has strong, unique passwords (not defaults)
- [ ] `NEXTAUTH_SECRET` is a random 32+ char string
- [ ] `ENCRYPTION_KEY` is a random 32-byte hex string
- [ ] `POSTGRES_PASSWORD` is strong and unique
- [ ] `REDIS_PASSWORD` is set
- [ ] Firewall only allows ports 22, 80, 443
- [ ] SSL certificate is valid (`curl -I https://your-domain.com`)
- [ ] Fail2ban is running (`sudo systemctl status fail2ban`)
- [ ] Default admin password has been changed
- [ ] Automated backups are scheduled (`crontab -l`)
- [ ] Docker containers run as non-root (`nextjs` user in Dockerfile)
- [ ] `.env.production` is NOT committed to git
- [ ] Ports 5432 (Postgres) and 6379 (Redis) are NOT exposed externally

---

## Quick Reference Commands

| Action | Command |
|---|---|
| Start all | `cd /opt/bravilio && set -a && source .env.production && set +a && docker-compose -f docker-compose.prod.yml up -d` |
| Stop all | `cd /opt/bravilio && docker-compose -f docker-compose.prod.yml down` |
| View logs | `docker-compose -f docker-compose.prod.yml logs -f` |
| Restart app | `docker-compose -f docker-compose.prod.yml restart app` |
| DB backup | `/opt/bravilio/scripts/backup.sh` |
| DB shell | `docker exec -it bravilio-postgres psql -U bravilio bravilio` |
| Run migrations | `docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy` |
| Rebuild + deploy | `git pull && docker-compose -f docker-compose.prod.yml build app && docker-compose -f docker-compose.prod.yml up -d app` |

---

## Architecture Overview

```
Internet
    │
    ▼
┌─────────┐     ┌───────────┐     ┌────────────┐
│  Nginx   │────▶│  Next.js  │────▶│ PostgreSQL │
│ :80/:443 │     │   :3000   │     │   :5432    │
└─────────┘     └───────────┘     └────────────┘
                      │
                      ▼
                ┌───────────┐
                │   Redis   │
                │   :6379   │
                └───────────┘
                      │
                      ▼
                ┌───────────┐
                │  Worker   │
                │ (BullMQ)  │
                └───────────┘
```

All services run in Docker containers on the same server, communicating via the `bravilio-network` bridge network. Only Nginx ports (80/443) are exposed to the internet.

---

## Support

- GitHub Issues: https://github.com/your-org/bravilio/issues
- Email: support@bravilio.com
