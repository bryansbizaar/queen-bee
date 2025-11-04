# Queen Bee Candles - Fly.io Deployment Guide

**Current Deployment:** https://queen-bee.fly.dev  
**Platform:** Fly.io  
**Database:** PostgreSQL on Fly.io

---

## 🚀 Quick Deployment

```bash
# Build client locally (required due to Docker npm bug)
cd client
npm run build
cd ..

# Deploy to Fly.io
flyctl deploy

# Check status
flyctl status --app queen-bee
```

---

## 📋 Initial Setup (One-Time)

### Prerequisites

- [Fly.io CLI installed](https://fly.io/docs/hands-on/install-flyctl/)
- Fly.io account created and authenticated
- GitHub repository with your code

### 1. Install Fly.io CLI

```bash
# macOS
brew install flyctl

# Login
flyctl auth login
```

### 2. Create PostgreSQL Database

```bash
# Create database cluster
flyctl postgres create --name queen-bee-db

# Save the connection string that appears
# Format: postgres://username:password@hostname/database
```

### 3. Create and Deploy App

```bash
# Initialize Fly.io app (creates fly.toml)
flyctl launch --name queen-bee

# When prompted:
# - Choose region closest to you
# - Do NOT deploy yet (we need to set secrets first)

# Attach database to app
flyctl postgres attach queen-bee-db --app queen-bee
```

### 4. Set Environment Secrets

```bash
# Set Stripe keys
flyctl secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY --app queen-bee
flyctl secrets set STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY --app queen-bee

# Set any other environment variables
flyctl secrets set NODE_ENV=production --app queen-bee

# View all secrets
flyctl secrets list --app queen-bee
```

### 5. Configure for Production

Update `client/vite.config.js` with Fly.io URL:

```javascript
const apiUrl = mode === "production"
  ? "https://queen-bee.fly.dev/api"
  : "http://localhost:8080/api";
```

### 6. First Deployment

```bash
# Build client locally (IMPORTANT: due to Docker npm bug)
cd client
npm run build
cd ..

# Deploy
flyctl deploy --app queen-bee

# Monitor deployment
flyctl logs --app queen-bee
```

---

## 📊 Database Setup

### Connect to Database

```bash
# Connect via psql
flyctl postgres connect -a queen-bee-db

# Inside psql:
\c queen_bee              # Switch to queen_bee database
\dt                       # List tables
```

### Run Migrations

```bash
# SSH into app
flyctl ssh console -a queen-bee

# Inside the container, run migrations if needed
```

### Seed Database

```sql
-- Connect to database
flyctl postgres connect -a queen-bee-db

-- Switch to correct database
\c queen_bee

-- Run your seed SQL files
-- Copy contents from database/init.sql or database/migrations/
```

---

## 🔧 Configuration Files

### fly.toml

Key settings in your `fly.toml`:

```toml
app = "queen-bee"

[build]
  # Using Dockerfile for build

[http_service]
  internal_port = 8080
  auto_stop_machines = false      # Keep running (no cold starts)
  min_machines_running = 1         # Always have 1 instance

[[vm]]
  memory = '256mb'
  cpu_kind = 'shared'
  cpus = 1
```

### Dockerfile

Ensure your Dockerfile:
- Copies pre-built `client/dist` (don't build in Docker)
- Exposes port 8080
- Uses production Node environment

---

## 🛠️ Common Operations

### Deploy Updates

```bash
# Build client first (ALWAYS)
cd client && npm run build && cd ..

# Deploy
flyctl deploy

# Wait ~2-3 minutes for deployment
# Check status
flyctl status --app queen-bee
```

### View Logs

```bash
# Real-time logs
flyctl logs --app queen-bee

# Recent logs
flyctl logs --app queen-bee -n 100
```

### Restart App

```bash
flyctl apps restart queen-bee
```

### Scale App

```bash
# Check current scale
flyctl scale show --app queen-bee

# Scale memory
flyctl scale memory 512 --app queen-bee

# Scale instances
flyctl scale count 2 --app queen-bee
```

### SSH into Container

```bash
flyctl ssh console -a queen-bee

# Useful commands inside:
ls -la /app/server/public/images/   # Check images
cat /app/server/.env                # Check env (won't show secrets)
exit
```

---

## 🔍 Troubleshooting

### Images Not Loading

**Problem:** Product images return 404

**Solution:**
```bash
# Check image files exist
flyctl ssh console -a queen-bee
ls -la /app/server/public/images/

# Verify correct database
flyctl postgres connect -a queen-bee-db
\c queen_bee  # Make sure you're in queen_bee, not postgres database
SELECT image FROM products LIMIT 5;
```

### Database Issues

**Problem:** App can't connect to database

**Solution:**
```bash
# Check database is attached
flyctl postgres list --app queen-bee

# Verify DATABASE_URL secret exists
flyctl secrets list --app queen-bee
```

### Build Failures

**Problem:** Docker build fails with Rollup errors

**Solution:**
```bash
# ALWAYS build client locally first
cd client
npm run build
cd ..

# Then deploy
flyctl deploy
```

### 502 Errors

**Problem:** App returns 502 Bad Gateway

**Common causes:**
- App listening on wrong port (must be 8080)
- App crashed on startup
- Memory exceeded

**Debug:**
```bash
# Check logs for errors
flyctl logs --app queen-bee

# Check app status
flyctl status --app queen-bee

# Restart if needed
flyctl apps restart queen-bee
```

---

## 📦 Database Management

### Backup Database

```bash
# Connect and dump
flyctl postgres connect -a queen-bee-db

# Inside psql:
\! pg_dump -d queen_bee > backup.sql
```

### Restore Database

```bash
# Connect to database
flyctl postgres connect -a queen-bee-db

# Run restore SQL
\i /path/to/backup.sql
```

---

## 🔐 Security Best Practices

- ✅ Never commit secrets to Git
- ✅ Use `flyctl secrets` for sensitive data
- ✅ Keep Stripe test keys for development
- ✅ Rotate keys regularly
- ✅ Use environment-specific keys (test vs live)

---

## 📈 Monitoring

### Check App Health

```bash
# Status
flyctl status --app queen-bee

# Metrics
flyctl metrics --app queen-bee

# View in browser
flyctl dashboard
```

### Database Health

```bash
# Database status
flyctl postgres list

# Connect and check
flyctl postgres connect -a queen-bee-db
\l                    # List databases
\dt                   # List tables in current database
SELECT COUNT(*) FROM products;
```

---

## 🌐 Custom Domain (Optional)

```bash
# Add custom domain
flyctl certs add queencandles.co.nz --app queen-bee

# Check certificate status
flyctl certs show queencandles.co.nz --app queen-bee

# Update DNS records as instructed
```

---

## 💡 Key Differences from Render

| Feature | Render | Fly.io |
|---------|--------|--------|
| **Cold Starts** | Yes (free tier) | No (with min_machines_running = 1) |
| **Build** | Server-side | Docker-based (build client locally) |
| **Database** | Public connection | Private network (more secure) |
| **Deployment Speed** | ~3-5 min | ~2-3 min |
| **CLI** | render.com UI | flyctl commands |

---

## 📚 Additional Resources

- **Fly.io Docs:** https://fly.io/docs/
- **Fly.io PostgreSQL:** https://fly.io/docs/postgres/
- **Project Troubleshooting:** See `docs/deployment/` for specific issues
- **Render Archive:** See `docs/archive/render/` for old Render setup

---

## ✅ Deployment Checklist

**Before Each Deployment:**
- [ ] Code tested locally
- [ ] Database migrations ready (if any)
- [ ] Client built: `cd client && npm run build`
- [ ] Secrets updated (if needed)
- [ ] Git committed and pushed

**After Deployment:**
- [ ] Check status: `flyctl status --app queen-bee`
- [ ] View logs: `flyctl logs --app queen-bee`
- [ ] Test production site: https://queen-bee.fly.dev
- [ ] Verify payment flow
- [ ] Check product images load
- [ ] Test shipping calculator

---

## 🆘 Getting Help

**Fly.io Community:**
- Forum: https://community.fly.io
- Discord: https://fly.io/discord

**Project-Specific Issues:**
- Check `docs/deployment/` for known fixes
- Review troubleshooting summaries in project files
- Test locally first to isolate issues

---

**Last Updated:** November 5, 2025  
**Current App:** https://queen-bee.fly.dev  
**Status:** Production ✅
