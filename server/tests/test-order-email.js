#!/usr/bin/env node

import EmailService from '../services/EmailService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Order Confirmation Email...\n');

// Check if credentials are set
console.log('📧 Email Configuration:');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET (' + process.env.EMAIL_PASSWORD.replace(/\s/g, '').length + ' characters without spaces)' : 'NOT SET');
console.log('  Note: Gmail App Passwords should be 16 characters\n');

// Test order data
const testOrderData = {
  customerEmail: process.env.EMAIL_USER || 'test@example.com', // Send to yourself for testing
  customerName: 'Test Customer',
  orderId: 'QBC-TEST-' + Date.now(),
  orderItems: [
    {
      title: 'Dragon Candle',
      quantity: 2,
      price: 1500 // $15.00 in cents
    },
    {
      title: 'Rose Candle',
      quantity: 1,
      price: 800 // $8.00 in cents
    }
  ],
  totalAmount: 3800, // $38.00 in cents
  shippingOption: 'ship',
  shippingAddress: {
    line1: '123 Test Street',
    line2: 'Apartment 4B',
    city: 'Auckland',
    postal_code: '1010',
    country: 'NZ'
  }
};

async function testEmail() {
  try {
    // First verify connection
    console.log('1️⃣ Verifying email service connection...');
    const isReady = await EmailService.verifyConnection();
    
    if (!isReady) {
      console.error('❌ Email service is not ready. Check your credentials.');
      return;
    }
    
    console.log('✅ Connection verified\n');
    
    // Send test email
    console.log('2️⃣ Sending test order confirmation email...');
    const result = await EmailService.sendOrderConfirmation(testOrderData);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check your inbox at:', testOrderData.customerEmail);
    } else {
      console.error('❌ Failed to send email:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.error('\n💡 Tip: Make sure you\'re using a Gmail App Password, not your regular password.');
      console.error('   Generate one at: https://myaccount.google.com/apppasswords');
    }
  }
}

testEmail();
