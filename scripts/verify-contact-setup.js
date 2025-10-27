#!/usr/bin/env node

/**
 * Simple Contact Form Setup Verification
 */

const fs = require('fs');
const path = require('path');

console.log('🐝 Queen Bee Candles - Contact Form Setup Verification\n');

async function verifySetup() {
  const errors = [];
  const warnings = [];

  // Check if .env file exists
  const envPath = path.join(__dirname, 'server', '.env');
  console.log('📋 Checking environment setup...');
  
  if (!fs.existsSync(envPath)) {
    errors.push('.env file not found in server directory');
    console.log('❌ .env file not found');
  } else {
    console.log('✅ .env file found');
    
    // Read and check .env contents
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      if (!envContent.includes('EMAIL_USER=')) {
        errors.push('EMAIL_USER not found in .env file');
      } else if (envContent.includes('EMAIL_USER=queenbcandlesnz@gmail.com')) {
        console.log('✅ EMAIL_USER is properly set');
      } else {
        warnings.push('EMAIL_USER may not be set to the correct email');
      }
      
      if (!envContent.includes('EMAIL_PASSWORD=')) {
        errors.push('EMAIL_PASSWORD not found in .env file');
      } else if (envContent.includes('EMAIL_PASSWORD=your_gmail_app_password_here')) {
        errors.push('EMAIL_PASSWORD is still set to the example value');
      } else {
        console.log('✅ EMAIL_PASSWORD is set');
      }
    } catch (error) {
      errors.push(`Could not read .env file: ${error.message}`);
    }
  }

  // Check if required npm packages are installed
  const serverPackageJsonPath = path.join(__dirname, 'server', 'package.json');
  if (fs.existsSync(serverPackageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(serverPackageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.nodemailer) {
        console.log('✅ nodemailer package is installed');
      } else {
        errors.push('nodemailer package is not installed');
      }
      
      if (deps['express-rate-limit']) {
        console.log('✅ express-rate-limit package is installed');
      } else {
        errors.push('express-rate-limit package is not installed');
      }
    } catch (error) {
      warnings.push(`Could not verify package.json: ${error.message}`);
    }
  }

  // Display results
  console.log('\n' + '='.repeat(60));
  console.log('📊 SETUP VERIFICATION RESULTS');
  console.log('='.repeat(60));

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(error => console.log(`   • ${error}`));
    console.log('\n🔧 NEXT STEPS:');
    console.log('   1. Make sure you have created your .env file: cp server/.env.example server/.env');
    console.log('   2. Add your Gmail app password to the .env file');
    console.log('   3. Install dependencies: cd server && npm install');
    console.log('   4. Check the docs/CONTACT_FORM_SETUP.md file for detailed instructions');
  } else {
    console.log('\n🎉 BASIC SETUP LOOKS GOOD!');
    console.log('\n✨ Next steps:');
    console.log('   • Start your server: cd server && npm run dev');
    console.log('   • Test the email service: curl -X GET http://localhost:8080/api/contact/health');
    console.log('   • Start your client: cd client && npm run dev');  
    console.log('   • Visit http://localhost:5173/contact to test the form');
  }
}

// Run verification
verifySetup().catch(error => {
  console.error('\n💥 Verification script error:', error.message);
  process.exit(1);
});