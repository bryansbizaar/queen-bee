# 🚀 Quick Deployment Reference Card

## Your Current Status
- ✅ Application built and tested (356 tests passing)
- ⏳ Need Stripe production keys (after site goes live)
- ⏳ Need to deploy to Render
- ✅ Domain registered: queencandles.co.nz

## Immediate Next Steps

### 1. Commit & Push to GitHub (5 minutes)
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Create Render Account (2 minutes)
- Go to render.com
- Sign up with GitHub
- Connect your repository

### 3. Deploy with TEST Keys (20 minutes)
**Database:**
- New → PostgreSQL → Free tier
- Name: queen-bee-db
- Save credentials

**Web Service:**
- New → Web Service → Connect GitHub repo
- Build: `npm run build`
- Start: `npm start`
- Add environment variables (see below)

### 4. Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=[Link to queen-bee-db]
STRIPE_SECRET_KEY=sk_test_[your_test_key]
STRIPE_PUBLISHABLE_KEY=pk_test_[your_test_key]
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_[your_test_key]
VITE_API_URL=https://[your-app].onrender.com
```

### 5. Initialize Database
Run `server/init.sql` via Render PostgreSQL dashboard

### 6. Test Deployment
- Visit your Render URL
- Test with Stripe test card: 4242 4242 4242 4242
- Place a test order

### 7. Submit to Stripe
- Use your live Render URL
- Submit for business verification
- Wait 1-3 days for approval

### 8. Switch to Production Keys
After Stripe approval, update environment variables:
```bash
STRIPE_SECRET_KEY=sk_live_[your_live_key]
STRIPE_PUBLISHABLE_KEY=pk_live_[your_live_key]
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[your_live_key]
```

### 9. Point Domain
Add DNS records:
```
CNAME: www → [your-app].onrender.com
A: @ → [Render IP]
```

## 📞 Support Resources
- Render Docs: render.com/docs
- Stripe Testing: stripe.com/docs/testing
- Your deployment guide: DEPLOYMENT.md

## 🎯 Success Criteria
- [ ] Site live on Render
- [ ] Test payment works
- [ ] Submitted to Stripe
- [ ] Custom domain configured
- [ ] Live keys active

**Time Estimate:** ~30-60 minutes for initial deployment
**Cost:** Free (or $7/month for no sleeping + custom domain)
