#!/usr/bin/env node

import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking Environment Variables...\n');

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

console.log('EMAIL_USER:', emailUser);
console.log('EMAIL_USER length:', emailUser ? emailUser.length : 0);
console.log('EMAIL_USER has leading/trailing spaces:', emailUser !== emailUser?.trim());

console.log('\nEMAIL_PASSWORD present:', !!emailPassword);
console.log('EMAIL_PASSWORD length:', emailPassword ? emailPassword.length : 0);
console.log('EMAIL_PASSWORD (with visible spaces):', emailPassword ? `"${emailPassword}"` : 'NOT SET');
console.log('EMAIL_PASSWORD without spaces:', emailPassword ? emailPassword.replace(/\s/g, '') : 'NOT SET');
console.log('EMAIL_PASSWORD without spaces length:', emailPassword ? emailPassword.replace(/\s/g, '').length : 0);
console.log('EMAIL_PASSWORD has spaces:', emailPassword ? /\s/.test(emailPassword) : false);

console.log('\n💡 Gmail App Passwords should be:');
console.log('   - Exactly 16 characters');
console.log('   - No spaces');
console.log('   - Generated from: https://myaccount.google.com/apppasswords');
