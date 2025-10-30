# Queen Bee Candles - Render Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] Code committed to GitHub
- [ ] Stripe TEST keys ready (pk_test_... and sk_test_...)
- [ ] Render account created
- [ ] Domain ready (queencandles.co.nz)

## 🚀 Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
cd /Users/bryanowens/Code/Websites/Candles/queen-bee
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Create Render Services

#### A. Create PostgreSQL Database

1. Log into [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. **Configuration:**
   - Name: `queen-bee-db`
   - Database: `queenbee`
   - User: (auto-generated)
   - Region: Choose closest to NZ (Singapore or Oregon)
   - Plan: **Free**
4. Click **"Create Database"**
5. **Save these credentials:**
   - Internal Database URL (starts with `postgresql://`)
   - You'll need this for the web service

#### B. Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select `queen-bee-candles` repo
4. **Configuration:**

```
Name: queen-bee-candles
Region: Same as database
Branch: main
Root Directory: (leave blank)
Runtime: Node
Build Command: npm run build
Start Command: npm start
Plan: Free (or Starter for custom domain)
```

### Step 3: Configure Environment Variables

In your Render Web Service dashboard, go to **"Environment"** tab and add:

#### Required Variables:

```bash
NODE_ENV=production
PORT=10000

# Database (automatically from linked database)
DATABASE_URL=<Link to queen-bee-db>

# Stripe TEST Keys (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Client-side Stripe key (for Vite build)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API URL (use your Render URL)
VITE_API_URL=https://queen-bee-candles.onrender.com
```

### Step 4: Link Database to Web Service

1. In Web Service dashboard, go to **"Environment"** tab
2. Find **"DATABASE_URL"**
3. Click **"Add from database"**
4. Select `queen-bee-db`
5. Choose "Internal Database URL"

### Step 5: Deploy

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Watch the build logs
3. Wait for deployment to complete (~5-10 minutes)

### Step 6: Initialize Database

After first deployment, you need to set up the database schema:

1. Go to your PostgreSQL database in Render
2. Click **"Connect"** → **"External Connection"**
3. Use a PostgreSQL client or run SQL directly:

```sql
-- Run your init.sql file here
-- Or connect via psql:
psql -h <hostname> -U <user> -d queenbee < server/init.sql
```

### Step 7: Test Your Deployment

Visit your Render URL: `https://queen-bee-candles.onrender.com`

Test these endpoints:
- `https://queen-bee-candles.onrender.com/` (React app)
- `https://queen-bee-candles.onrender.com/api/health` (API health)
- `https://queen-bee-candles.onrender.com/api/products` (Products API)

### Step 8: Configure Custom Domain

1. In Render dashboard, go to **"Settings"**
2. Find **"Custom Domain"** section
3. Click **"Add Custom Domain"**
4. Enter: `queencandles.co.nz`
5. Render will provide DNS records

#### Update Your Domain DNS:

Add these records to your domain registrar:

```
Type: CNAME
Name: www
Value: queen-bee-candles.onrender.com

Type: A
Name: @
Value: <Render provides this IP>
```

### Step 9: Enable HTTPS

Render automatically provides free SSL certificates. Just wait a few minutes after DNS propagation.

## 🔧 Post-Deployment

### Update Environment Variables for Custom Domain

After custom domain is active, update:

```bash
VITE_API_URL=https://queencandles.co.nz
```

Then trigger a new deployment.

### Switch to Stripe Live Keys (After Business Verification)

Once Stripe approves your business:

1. Go to Render dashboard → Environment
2. Update these variables:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
3. Click **"Save Changes"**
4. Render will automatically redeploy

## ⚡ Render Free Tier Limitations

**Important:** Free tier services:
- Sleep after 15 minutes of inactivity
- Take ~30 seconds to wake up
- 750 hours/month (enough for one service)
- **Consider upgrading to Starter ($7/month) for:**
  - No sleeping
  - Custom domain support
  - Better performance

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify all dependencies in package.json
- Ensure Node version matches (18+)

### Database Connection Errors
- Verify DATABASE_URL is set correctly
- Check database is in same region as web service
- Ensure init.sql has run successfully

### Site Shows "Service Unavailable"
- Free tier may be sleeping - wait 30 seconds
- Check deployment logs for errors
- Verify PORT environment variable is set

### Stripe Payments Don't Work
- Confirm you're using TEST keys initially
- Check browser console for errors
- Verify VITE_STRIPE_PUBLISHABLE_KEY matches STRIPE_PUBLISHABLE_KEY

## 📱 Monitoring

Monitor your app:
- **Render Dashboard:** Real-time logs and metrics
- **Stripe Dashboard:** Payment activity
- **Browser DevTools:** Client-side errors

## 🎉 Success Checklist

- [ ] Site loads at Render URL
- [ ] Products display correctly
- [ ] Cart functionality works
- [ ] Test payment completes successfully
- [ ] Custom domain points to site
- [ ] HTTPS is working
- [ ] Database contains test order
- [ ] Submitted site URL to Stripe for verification

## 🚀 Next Steps

1. **Test thoroughly** with Stripe test cards
2. **Submit to Stripe** for business verification (use your Render URL)
3. **Monitor** for any errors in first few days
4. **Switch to live keys** after Stripe approval
5. **Consider upgrading** to paid Render plan if needed

## 💡 Tips

- **Keep test mode active** until fully tested
- **Use Stripe test cards** for development:
  - Success: 4242 4242 4242 4242
  - Decline: 4000 0000 0000 0002
- **Monitor Render logs** for first few days
- **Set up error tracking** (like Sentry) for production

---

Need help? Check:
- [Render Docs](https://render.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
