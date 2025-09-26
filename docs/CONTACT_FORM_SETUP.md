# Contact Form Email Setup Guide

## Overview
The contact form sends emails to `queenbcandlesnz@gmail.com` and sends an auto-reply confirmation to the customer.

## Gmail App Password Setup

Since you're using Gmail for sending emails, you'll need to set up an App Password (not your regular Gmail password). Here's how:

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Click "Security" in the left sidebar
3. Under "Signing in to Google", make sure "2-Step Verification" is ON
   - If it's not enabled, click it and follow the setup process

### 2. Generate App Password
1. In the same Security section, look for "App passwords"
2. Click "App passwords" (you may need to sign in again)
3. Select "Mail" from the "Select app" dropdown
4. Select "Other (Custom name)" from "Select device" dropdown
5. Enter "Queen Bee Candles Website" as the custom name
6. Click "Generate"
7. Google will show you a 16-character password (like: `abcd efgh ijkl mnop`)
8. Copy this password - you'll use it in your .env file

### 3. Update Environment Variables
1. Copy the `.env.example` file to create your `.env` file:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit the `.env` file and add your email credentials:
   ```env
   EMAIL_USER=queenbcandlesnz@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```
   (Replace `abcd efgh ijkl mnop` with the actual app password from step 2.7)

## Installation

1. Install the new dependencies:
   ```bash
   cd server
   npm install
   ```

2. The new packages added are:
   - `nodemailer@^6.9.7` - For sending emails
   - `express-rate-limit@^7.1.5` - To prevent spam on the contact form

## Testing the Contact Form

### Option 1: Use the Website
1. Start both server and client:
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client  
   cd client
   npm run dev
   ```

2. Navigate to http://localhost:5173/contact
3. Fill out and submit the contact form
4. Check the Gmail inbox for queenbcandlesnz@gmail.com

### Option 2: Test API Directly
```bash
# Test the API endpoint directly
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-test-email@example.com",
    "subject": "Test from Contact Form",
    "message": "This is a test message to verify the contact form is working."
  }'
```

### Option 3: Run Automated Tests
```bash
cd server
npm test simple-tests/contact.test.js
```

## Email Service Health Check

You can check if the email service is properly configured:
- Visit: http://localhost:8080/api/contact/health
- Should return: `{"emailService": "connected", "timestamp": "..."}`

## Features

### Security Features
- **Rate Limiting**: Maximum 3 contact form submissions per IP address every 15 minutes
- **Input Validation**: All fields are validated for length and format
- **Email Validation**: Proper email format checking
- **Input Sanitization**: Fields are trimmed and limited in length

### Email Features
- **Business Email**: Sends formatted email to `queenbcandlesnz@gmail.com`
- **Auto-Reply**: Sends confirmation email to the customer
- **HTML & Text**: Both HTML and plain text versions of emails
- **Professional Styling**: Branded email templates with Queen Bee Candles styling

### Form Validation
- **Name**: Required, 2-100 characters
- **Email**: Required, valid email format
- **Subject**: Required, 5-200 characters
- **Message**: Required, 10-2000 characters

## Troubleshooting

### "Authentication failed" Error
- Double-check your Gmail app password is correct
- Make sure you're using the app password, not your regular Gmail password
- Verify 2-factor authentication is enabled on your Google account

### "Too many requests" Error
- This is the rate limiting working correctly
- Wait 15 minutes and try again, or test from a different IP address

### Emails Not Receiving
- Check Gmail spam folder
- Verify the `EMAIL_USER` environment variable is set to `queenbcandlesnz@gmail.com`
- Test the health endpoint: http://localhost:8080/api/contact/health

### Development Testing
For development/testing, you might want to:
1. Temporarily change `EMAIL_USER` to your own Gmail for testing
2. Set up a test Gmail account specifically for development
3. Use a service like Mailtrap for email testing without sending real emails

## Production Considerations

Before going live:
1. Consider using a more robust email service (SendGrid, AWS SES, etc.)
2. Set up email monitoring and delivery tracking
3. Implement honeypot fields for additional spam protection
4. Consider adding CAPTCHA for high-traffic sites
5. Set up error alerting for failed email deliveries