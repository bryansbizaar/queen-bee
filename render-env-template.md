# Render Deployment Environment Variables Guide

## Required Environment Variables for Render

Copy these variables into your Render Web Service settings:

### Database Configuration
# Get these from your Render PostgreSQL database dashboard
DATABASE_URL=<Your Render PostgreSQL Internal URL>
# Or use individual values:
PGHOST=<database-host>
PGPORT=5432
PGDATABASE=queenbee
PGUSER=<username>
PGPASSWORD=<password>

### Stripe Configuration (TEST MODE FOR NOW)
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
STRIPE_SECRET_KEY=sk_test_your_test_key_here

### Application Configuration
NODE_ENV=production
PORT=10000

### Optional: Contact Form (if using nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_EMAIL=orders@queencandles.co.nz

## Client Environment Variables (Build Time)
# These need to be set in Render's environment variables
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
VITE_API_URL=https://your-app-name.onrender.com

## Notes:
- Use TEST Stripe keys initially
- Switch to LIVE keys after Stripe business verification
- Never commit .env files to git
- Render automatically provides DATABASE_URL for linked databases
