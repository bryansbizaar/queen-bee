# Deployment Guide - Queen Bee Candles

**Version**: 1.0  
**Last Updated**: October 22, 2025  
**Status**: Production Ready

---

## Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Deployment Options](#deployment-options)
- [Production Deployment](#production-deployment)
- [Post-Deployment Tasks](#post-deployment-tasks)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers deploying Queen Bee Candles to a production environment. The application consists of three main components:

1. **React Frontend** (Static files served by CDN or web server)
2. **Express Backend** (Node.js API server)
3. **PostgreSQL Database** (Managed database service)

### Deployment Architecture

```
Internet
    │
    ├─> CDN / Static Host (Frontend)
    │   └─> Compiled React app
    │
    └─> Application Server (Backend)
        ├─> Express API (Port 8080)
        │
        ├─> PostgreSQL Database
        │   └─> Managed service (AWS RDS, Digital Ocean, etc.)
        │
        └─> Stripe Integration
            └─> Webhook endpoint
```

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing locally
- [ ] CI/CD pipeline passing (GitHub Actions)
- [ ] No console errors or warnings
- [ ] Code reviewed and approved
- [ ] Dependencies up to date (security patches)
- [ ] ESLint passing with no errors

### Security

- [ ] All secrets stored in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled on all endpoints
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] Stripe webhook signature verification enabled
- [ ] SSL/TLS certificates ready

### Database

- [ ] Database schema up to date (`init.sql`)
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] Database indexes created
- [ ] Test data removed from production database

### Stripe Configuration

- [ ] Stripe account verified
- [ ] Live API keys obtained
- [ ] Webhook endpoint registered
- [ ] Webhook secret obtained
- [ ] Payment methods configured
- [ ] Business information updated

### Performance

- [ ] Frontend bundle optimized
- [ ] Images compressed and optimized
- [ ] API response times acceptable (< 200ms)
- [ ] Database queries optimized
- [ ] CDN configured for static assets

---

## Environment Configuration

### Production Environment Variables

#### Server Environment (`server/.env`)

```bash
# =============================================================================
# PRODUCTION SERVER ENVIRONMENT VARIABLES
# =============================================================================

# Database Configuration
DATABASE_URL=postgresql://username:password@your-db-host:5432/queenbee_prod
PGUSER=your_production_username
PGPASSWORD=your_secure_production_password
PGDATABASE=queenbee_prod
PGHOST=your-db-host.region.provider.com
PGPORT=5432

# Stripe Configuration (LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

# Server Configuration
PORT=8080
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://queenbeecandles.com,https://www.queenbeecandles.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Security
SESSION_SECRET=your_random_secure_session_secret_here

# Logging
LOG_LEVEL=info
```

#### Client Environment (`client/.env`)

```bash
# =============================================================================
# PRODUCTION CLIENT ENVIRONMENT VARIABLES
# =============================================================================

# Stripe Configuration (LIVE KEY)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY

# API Configuration
VITE_API_URL=https://api.queenbeecandles.com

# Analytics (Optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Feature Flags
VITE_FEATURE_CUSTOMER_ACCOUNTS=false
VITE_FEATURE_PRODUCT_REVIEWS=false
```

### Environment-Specific Settings

**Development**:
- Use Stripe test keys (`sk_test_`, `pk_test_`)
- Enable debug logging
- Use local database
- Allow CORS from localhost

**Staging** (Optional):
- Use Stripe test keys
- Mirror production configuration
- Use separate database
- Test with production-like data

**Production**:
- Use Stripe live keys (`sk_live_`, `pk_live_`)
- Minimize logging
- Use managed database
- Restrict CORS to production domains

---

## Database Setup

### Production Database Options

**Development Setup**:
- **Docker PostgreSQL** - Local development with docker-compose (see `/database/` directory for migration guides)
- **pgAdmin** - Web-based PostgreSQL management at localhost:8081

**Recommended Production Providers**:
1. **AWS RDS** - Reliable, scalable, managed PostgreSQL
2. **Digital Ocean Managed Databases** - Simple, cost-effective
3. **Heroku Postgres** - Easy setup, good for small apps
4. **Google Cloud SQL** - Integrated with GCP
5. **Supabase** - PostgreSQL with additional features

**Note**: For development, this project uses Docker PostgreSQL. See `/database/README.md` for local setup and migration guides.

### Local Development Database (Docker)

For local development, the project uses Docker Compose to run PostgreSQL:

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d postgres pgadmin

# Access pgAdmin at http://localhost:8081
# Email: admin@queenbeecandles.com
# Password: admin123

# Connect to database:
# Host: postgres (from within Docker) or localhost (from host machine)
# Port: 5432
# Database: queen_bee_candles
# Username: queenbee
# Password: development123
```

**Database Management**:
- Initialize schema: `docker exec ecommerce-postgres psql -U queenbee -d queen_bee_candles < database/init.sql`
- View data: `docker exec ecommerce-postgres psql -U queenbee -d queen_bee_candles -c "SELECT * FROM products;"`
- Backup: `./database/backup-local-db.sh`
- Restore: `./database/restore-to-docker.sh`

**Migration from Local PostgreSQL**:
If migrating from local PostgreSQL to Docker, see comprehensive guides in `/database/`:
- `QUICK_MIGRATION.md` - 10-minute migration checklist
- `MIGRATION_GUIDE.md` - Complete step-by-step guide
- `TROUBLESHOOTING.md` - Common issues and solutions

### Database Configuration Steps

#### 1. Create Database Instance

**Example: Digital Ocean**
```bash
# Via Digital Ocean CLI
doctl databases create queenbee-prod \
  --engine postgres \
  --region nyc3 \
  --size db-s-1vcpu-1gb \
  --version 15
```

**Example: AWS RDS**
```bash
# Via AWS CLI
aws rds create-db-instance \
  --db-instance-identifier queenbee-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username admin \
  --master-user-password YourSecurePassword \
  --allocated-storage 20
```

#### 2. Configure Database Security

```bash
# Allow connections from your application server IP
# Configure in database provider's dashboard:
# - Whitelist application server IP addresses
# - Enable SSL/TLS connections
# - Configure firewall rules
# - Set up VPC (if using AWS)
```

#### 3. Initialize Database Schema

```bash
# Connect to production database
psql "postgresql://username:password@host:5432/queenbee_prod?sslmode=require"

# Run schema initialization
\i database/init.sql

# Verify tables created
\dt

# Check data
SELECT * FROM products;

# Exit
\q
```

#### 4. Configure Backups

**Automated Backups**:
- Enable daily automated backups
- Set retention period (7-30 days)
- Configure backup window (low-traffic hours)
- Test restore procedures

**Manual Backup**:
```bash
# Create backup
pg_dump -h your-db-host.com -U username -d queenbee_prod > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h your-db-host.com -U username -d queenbee_prod < backup_20251022.sql
```

---

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, Linode, etc.)

**Best for**: Full control, cost-effective for medium traffic

**Components**:
- VPS server ($10-20/month)
- Managed PostgreSQL ($15-25/month)
- CDN for static assets (optional)

**Pros**:
- Full server control
- Cost-effective at scale
- Flexible configuration

**Cons**:
- More manual setup
- Requires server management
- Manual scaling

### Option 2: Platform as a Service (Heroku, Render, Railway)

**Best for**: Quick deployment, minimal DevOps

**Components**:
- Application hosting (free tier or $7+/month)
- Managed database ($0-15/month)
- Automatic HTTPS

**Pros**:
- Very easy deployment
- Automatic scaling options
- Managed infrastructure
- Built-in CI/CD

**Cons**:
- Higher cost at scale
- Less control
- Platform limitations

### Option 3: Container Platform (Docker + Kubernetes)

**Best for**: High traffic, enterprise scale

**Components**:
- Container orchestration
- Load balancing
- Auto-scaling

**Pros**:
- Highly scalable
- Excellent for microservices
- Industry standard

**Cons**:
- Complex setup
- Higher learning curve
- Overkill for small apps

### Option 4: Serverless (Vercel, Netlify, AWS Lambda)

**Best for**: Frontend + serverless backend

**Components**:
- Frontend on Vercel/Netlify (free tier available)
- Backend as serverless functions
- Managed database

**Pros**:
- Extremely easy frontend deployment
- Automatic scaling
- Pay-per-use pricing

**Cons**:
- Cold start latency
- More complex backend
- Limited to stateless operations

---

## Production Deployment

### Deployment: DigitalOcean (Recommended)

This guide uses DigitalOcean as an example, but principles apply to other providers.

#### Step 1: Create Droplet (VPS)

```bash
# Via DigitalOcean CLI
doctl compute droplet create queenbee-app \
  --image ubuntu-22-04-x64 \
  --size s-1vcpu-1gb \
  --region nyc3 \
  --ssh-keys YOUR_SSH_KEY_ID

# Note the IP address
```

#### Step 2: Initial Server Setup

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx (reverse proxy)
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2

# Install Git
apt install -y git

# Create application user
adduser --disabled-password --gecos "" queenbee
usermod -aG sudo queenbee
```

#### Step 3: Clone and Setup Application

```bash
# Switch to application user
su - queenbee

# Clone repository
git clone https://github.com/yourusername/queen-bee.git
cd queen-bee

# Install dependencies
npm run install:all

# Setup environment variables
cd server
cp .env.example .env
nano .env  # Edit with production values

cd ../client
cp .env.example .env
nano .env  # Edit with production values
```

#### Step 4: Build Application

```bash
# Build frontend
cd client
npm run build
# This creates client/dist/ folder with production build

# Test server
cd ../server
npm start  # Should start without errors
```

#### Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/queenbee

# Add this configuration:
```

```nginx
# Frontend (React app)
server {
    listen 80;
    server_name queenbeecandles.com www.queenbeecandles.com;
    
    root /home/queenbee/queen-bee/client/dist;
    index index.html;
    
    # Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to Express server
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Serve product images
    location /images {
        proxy_pass http://localhost:8080;
        proxy_cache_bypass $http_upgrade;
    }
}

# API server (Express)
server {
    listen 80;
    server_name api.queenbeecandles.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/queenbee /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificates
sudo certbot --nginx -d queenbeecandles.com -d www.queenbeecandles.com -d api.queenbeecandles.com

# Follow prompts to complete setup
# Certbot will automatically configure Nginx for HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

#### Step 7: Start Application with PM2

```bash
# Navigate to server directory
cd /home/queenbee/queen-bee/server

# Start with PM2
pm2 start server.js --name queenbee-api

# Configure PM2 to start on boot
pm2 startup
pm2 save

# Check status
pm2 status

# View logs
pm2 logs queenbee-api
```

#### Step 8: Configure Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

---

### Alternative: Deploy to Heroku

Quick deployment for testing or small-scale production.

#### Step 1: Prepare Application

```bash
# Create Procfile in root directory
echo "web: cd server && npm start" > Procfile

# Ensure package.json has engines
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

#### Step 2: Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create queenbee-candles

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...

# Deploy
git push heroku main

# Run database migrations
heroku run psql $DATABASE_URL < database/init.sql

# Open app
heroku open
```

---

### Alternative: Deploy to Vercel (Frontend) + Railway (Backend)

Modern, developer-friendly deployment.

#### Frontend on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client directory
cd client

# Deploy
vercel

# Follow prompts to:
# - Link to project
# - Configure build settings
# - Set environment variables

# Production deployment
vercel --prod
```

#### Backend on Railway

```bash
# Go to railway.app
# Connect GitHub repository
# Select queen-bee repository
# Configure:
#   - Root directory: server
#   - Start command: npm start
# Add PostgreSQL database
# Set environment variables
# Deploy
```

---

## Post-Deployment Tasks

### 1. Register Stripe Webhook

```bash
# Log into Stripe Dashboard
# Navigate to Developers > Webhooks
# Click "Add endpoint"

# Endpoint URL:
https://api.queenbeecandles.com/api/webhook

# OR (if single domain):
https://queenbeecandles.com/api/webhook

# Select events:
- payment_intent.succeeded
- payment_intent.payment_failed

# Copy webhook signing secret
# Update server .env:
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Test Payment Flow

```bash
# Use Stripe test cards to verify:
# 1. Create payment intent
# 2. Complete payment
# 3. Webhook receives event
# 4. Order created in database

# Monitor:
pm2 logs queenbee-api  # Check for errors
```

### 3. Configure DNS

```bash
# At your domain registrar (Namecheap, GoDaddy, etc.):

# A Records:
queenbeecandles.com      → your-server-ip
www.queenbeecandles.com  → your-server-ip
api.queenbeecandles.com  → your-server-ip

# Wait for DNS propagation (up to 48 hours)
# Test: dig queenbeecandles.com
```

### 4. Setup Monitoring

**PM2 Monitoring** (Built-in):
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor dashboard
pm2 monit
```

**External Monitoring** (Recommended):
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **Application monitoring**: New Relic, DataDog
- **Log management**: Papertrail, Loggly

### 5. Setup Backups

**Database Backups**:
```bash
# Create backup script
nano ~/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/queenbee/backups"
DB_NAME="queenbee_prod"

mkdir -p $BACKUP_DIR

pg_dump -h your-db-host.com -U username -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

```bash
# Make executable
chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/queenbee/backup-db.sh
```

**Application Backups**:
```bash
# Images and uploads
rsync -avz /home/queenbee/queen-bee/server/public/images/ backup-server:/backups/images/
```

---

## Monitoring & Maintenance

### Health Checks

**Server Health**:
```bash
# Check server status
pm2 status

# View logs
pm2 logs queenbee-api

# Check resource usage
htop

# Check disk space
df -h

# Check memory
free -m
```

**Application Health**:
```bash
# Test API endpoint
curl https://api.queenbeecandles.com/api/products

# Test frontend
curl -I https://queenbeecandles.com

# Check SSL certificate
curl -vI https://queenbeecandles.com 2>&1 | grep 'expire date'
```

**Database Health**:
```bash
# Connect to database
psql "postgresql://user:pass@host:5432/queenbee_prod"

# Check connections
SELECT count(*) FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('queenbee_prod'));

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Regular Maintenance Tasks

**Weekly**:
- [ ] Review application logs for errors
- [ ] Check server resource usage
- [ ] Review Stripe dashboard for issues
- [ ] Check SSL certificate expiry (60 days notice)

**Monthly**:
- [ ] Update dependencies (security patches)
- [ ] Review and analyze error logs
- [ ] Database performance review
- [ ] Backup verification (test restore)
- [ ] Review analytics and usage patterns

**Quarterly**:
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Cost optimization review
- [ ] Disaster recovery drill

### Updating the Application

```bash
# SSH into server
ssh queenbee@your-server-ip

# Navigate to application
cd /home/queenbee/queen-bee

# Pull latest changes
git pull origin main

# Install new dependencies
npm run install:all

# Build frontend
cd client
npm run build

# Restart backend
pm2 restart queenbee-api

# Check status
pm2 status
pm2 logs queenbee-api --lines 50
```

---

## Rollback Procedures

### Quick Rollback

```bash
# SSH into server
ssh queenbee@your-server-ip
cd /home/queenbee/queen-bee

# View recent commits
git log --oneline -10

# Rollback to previous commit
git reset --hard <commit-hash>

# Reinstall dependencies (if needed)
npm run install:all

# Rebuild frontend
cd client
npm run build

# Restart backend
cd ../server
pm2 restart queenbee-api

# Verify
curl https://api.queenbeecandles.com/api/products
```

### Database Rollback

```bash
# If database changes were made:

# 1. Stop application
pm2 stop queenbee-api

# 2. Restore from backup
psql "postgresql://user:pass@host:5432/queenbee_prod" < backup_YYYYMMDD.sql

# 3. Restart application
pm2 restart queenbee-api
```

### Rollback Checklist

- [ ] Identify problematic deployment version
- [ ] Notify team of rollback
- [ ] Stop application if necessary
- [ ] Restore code to previous version
- [ ] Restore database if schema changed
- [ ] Restart application
- [ ] Verify functionality
- [ ] Monitor for issues
- [ ] Document incident

---

## Troubleshooting

### Common Issues

#### Application Won't Start

**Symptoms**: PM2 shows app as errored or stopped

**Solutions**:
```bash
# Check logs
pm2 logs queenbee-api

# Common causes:
# 1. Port already in use
sudo lsof -i :8080
# Kill process or change PORT in .env

# 2. Database connection failed
# Verify DATABASE_URL in .env
# Check database is running
# Verify firewall allows connections

# 3. Missing environment variables
# Check all required variables in .env

# 4. Syntax error
cd server && npm start  # Run directly to see error
```

#### Database Connection Issues

**Symptoms**: "connection refused" or timeout errors

**Solutions**:
```bash
# Test connection
psql "postgresql://user:pass@host:5432/database"

# Check:
# 1. Database firewall allows your IP
# 2. Credentials are correct
# 3. Database is running
# 4. SSL settings match (sslmode=require)

# Update connection string in .env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

#### Payment Webhook Not Working

**Symptoms**: Payments succeed but orders not created

**Solutions**:
```bash
# 1. Verify webhook endpoint registered in Stripe
# Dashboard > Developers > Webhooks

# 2. Check webhook secret matches
echo $STRIPE_WEBHOOK_SECRET

# 3. Test webhook locally with Stripe CLI
stripe listen --forward-to https://your-domain.com/api/webhook

# 4. Check logs for webhook errors
pm2 logs queenbee-api | grep webhook

# 5. Verify endpoint is accessible
curl -X POST https://your-domain.com/api/webhook
```

#### SSL Certificate Issues

**Symptoms**: "Your connection is not private" or certificate errors

**Solutions**:
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# If renewal fails, force renewal
sudo certbot renew --force-renewal

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### High Memory Usage

**Symptoms**: Server slow, out of memory errors

**Solutions**:
```bash
# Check memory usage
free -m
pm2 monit

# Check for memory leaks
pm2 logs queenbee-api

# Restart application
pm2 restart queenbee-api

# If persistent:
# 1. Increase server RAM
# 2. Optimize database queries
# 3. Add caching layer (Redis)
# 4. Profile application for memory leaks
```

#### Frontend Not Loading

**Symptoms**: Blank page, 404 errors

**Solutions**:
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify build exists
ls -la /home/queenbee/queen-bee/client/dist/

# Rebuild frontend
cd /home/queenbee/queen-bee/client
npm run build

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check browser console for errors
# Verify API_URL in client .env matches backend
```

---

## Emergency Contacts

**Critical Issues**:
- Database Provider Support
- Hosting Provider Support (DigitalOcean, Heroku, etc.)
- Stripe Support (for payment issues)
- Domain Registrar Support

**Internal**:
- Development Team Lead
- System Administrator
- On-Call Developer

---

## Additional Resources

### Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [API.md](API.md) - API reference
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development workflow

### External Resources
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

---

## Changelog

### Version 1.0 (October 2025)
- Initial deployment guide
- DigitalOcean deployment instructions
- Heroku deployment alternative
- SSL setup with Let's Encrypt
- Monitoring and maintenance procedures
- Troubleshooting guide

---

**Questions or Issues?**  
Open an issue on GitHub or contact the development team.

---

*Last updated: October 22, 2025*
