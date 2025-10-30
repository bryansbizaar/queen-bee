# Stripe Key Mismatch Issue - Troubleshooting Guide

## Problem
Getting error: `No such payment_intent: 'pi_...'` when trying to complete payment.

## Root Cause
Your **frontend** and **backend** are using **different Stripe environments** (test vs live mode).

A payment intent created with **test keys** (sk_test_...) cannot be confirmed with **live keys** (pk_live_...), and vice versa.

## Solution

### Step 1: Check Your Current Keys

**Frontend** (Client):
```bash
cd client
cat .env | grep VITE_STRIPE_PUBLISHABLE_KEY
```

**Backend** (Server):
```bash
cd server
cat .env | grep STRIPE_SECRET_KEY
```

**Production** (Render):
```bash
# Go to Render dashboard → Your service → Environment
# Check STRIPE_SECRET_KEY
```

### Step 2: Identify the Mismatch

Keys must match environments:
- ✅ **Test Mode**: `pk_test_...` + `sk_test_...`
- ✅ **Live Mode**: `pk_live_...` + `sk_live_...`
- ❌ **WRONG**: `pk_test_...` + `sk_live_...`
- ❌ **WRONG**: `pk_live_...` + `sk_test_...`

### Step 3: Fix the Mismatch

Choose ONE environment and ensure all keys match:

#### Option A: Use Test Mode (Recommended for Development)

**Local Client (.env)**:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY_HERE
```

**Local Server (.env)**:
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
```

**Production (Render Environment Variables)**:
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
```

**Production Client (client/.env.production or vite.config.js)**:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY_HERE
```

#### Option B: Use Live Mode (Only for Production)

⚠️ **Warning**: Only use live keys when ready for real payments!

**Production (Render Environment Variables)**:
```bash
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
```

**Production Client Build**:
```bash
# Update client/.env.production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY_HERE

# Rebuild frontend
npm run build
```

### Step 4: Clear & Restart

After changing keys:

1. **Clear browser cache** or open incognito/private window
2. **Restart local dev server**:
   ```bash
   # Kill and restart
   npm run dev
   ```
3. **Redeploy to Render** if you changed production keys
4. **Try a fresh payment** (old payment intents won't work with new keys)

### Step 5: Verify the Fix

1. Start a new order with fresh cart
2. Click "Continue to Payment"
3. Check browser console - should see no errors
4. Complete test payment:
   - Use test card: `4242 4242 4242 4242`
   - Any future date
   - Any 3-digit CVC
5. Should succeed without "No such payment_intent" error

## How to Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Toggle between **Test mode** and **Live mode** in top-right
3. Copy the keys:
   - **Publishable key** → Frontend (VITE_STRIPE_PUBLISHABLE_KEY)
   - **Secret key** → Backend (STRIPE_SECRET_KEY)

## Environment Variable Locations

| Location | File | Variable |
|----------|------|----------|
| Local Frontend | `client/.env` | `VITE_STRIPE_PUBLISHABLE_KEY` |
| Local Backend | `server/.env` | `STRIPE_SECRET_KEY` |
| Production Backend | Render Dashboard → Environment | `STRIPE_SECRET_KEY` |
| Production Frontend | `client/.env.production` or build env | `VITE_STRIPE_PUBLISHABLE_KEY` |

## Quick Test Script

Run this to check if your keys match:

```bash
#!/bin/bash
echo "=== Checking Stripe Key Consistency ==="
echo ""

CLIENT_KEY=$(grep VITE_STRIPE_PUBLISHABLE_KEY client/.env | cut -d '=' -f2)
SERVER_KEY=$(grep STRIPE_SECRET_KEY server/.env | cut -d '=' -f2)

echo "Frontend Key: ${CLIENT_KEY:0:20}..."
echo "Backend Key: ${SERVER_KEY:0:20}..."

if [[ $CLIENT_KEY == pk_test_* ]] && [[ $SERVER_KEY == sk_test_* ]]; then
    echo "✅ Both using TEST mode"
elif [[ $CLIENT_KEY == pk_live_* ]] && [[ $SERVER_KEY == sk_live_* ]]; then
    echo "✅ Both using LIVE mode"
else
    echo "❌ MISMATCH! Frontend and backend using different Stripe environments!"
fi
```

Save as `check-stripe-keys.sh`, make executable with `chmod +x check-stripe-keys.sh`, and run it.

## Common Mistakes

1. ❌ Copying live keys to test environment
2. ❌ Not restarting dev server after changing .env
3. ❌ Forgetting to rebuild frontend after changing production keys
4. ❌ Testing old payment intents created with different keys
5. ❌ Having different keys in Render vs local environment

## Debugging Tips

If still getting errors:

1. **Check browser console** for the exact error
2. **Check Render logs** for backend errors
3. **Look at Stripe Dashboard logs** to see if requests are hitting test or live mode
4. **Use Stripe CLI** to listen to webhooks:
   ```bash
   stripe listen --forward-to localhost:8080/api/stripe/webhook
   ```
5. **Verify environment**:
   ```bash
   # In browser console:
   console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
   ```

## Reference

- [Stripe API Keys](https://stripe.com/docs/keys)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
