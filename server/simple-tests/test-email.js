import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmailConnection() {
  console.log('🧪 Testing Gmail connection...');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    console.log('📧 Email credentials:');
    console.log('  USER:', process.env.EMAIL_USER);
    console.log('  PASS:', process.env.EMAIL_PASSWORD ? `${process.env.EMAIL_PASSWORD.substring(0, 4)}****` : 'NOT SET');

    // Test connection
    const isConnected = await transporter.verify();
    console.log('✅ Gmail connection successful:', isConnected);
    
    // Send test email
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'Test Email from Queen Bee Candles',
      text: 'This is a test email to verify the connection is working.',
      html: '<p>This is a test email to verify the connection is working.</p>'
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check your Gmail app password');
    } else if (error.code === 'ESOCKET') {
      console.error('Network connection failed');
    }
  }
}

testEmailConnection();