#!/usr/bin/env node

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

console.log('🧪 Testing Direct Nodemailer Connection...\n');

console.log('📧 Configuration:');
console.log('  USER:', process.env.EMAIL_USER);
console.log('  PASS length:', process.env.EMAIL_PASSWORD?.length, 'chars');
console.log('');

async function testDirectConnection() {
  try {
    console.log('Creating transporter...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    console.log('Verifying connection...');
    await transporter.verify();
    
    console.log('✅ Connection successful!\n');
    
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from Queen Bee Candles',
      text: 'This is a test email to verify nodemailer is working.',
      html: '<p>This is a test email to verify nodemailer is working.</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('📬 Check your inbox at:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. Possible issues:');
      console.error('   1. App Password might be incorrect');
      console.error('   2. 2-Step Verification might not be enabled');
      console.error('   3. App Password might have been revoked');
      console.error('\n   Generate a new one at: https://myaccount.google.com/apppasswords');
    }
  }
}

testDirectConnection();
