#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🕯️  Queen Bee Candles - Development Environment Validator\n');

// Check if package.json files exist
const packages = [
  { name: 'Root', path: path.join(__dirname, 'package.json') },
  { name: 'Client', path: path.join(__dirname, 'client', 'package.json') },
  { name: 'Server', path: path.join(__dirname, 'server', 'package.json') }
];

packages.forEach(pkg => {
  try {
    const packageJson = JSON.parse(fs.readFileSync(pkg.path, 'utf8'));
    console.log(`✅ ${pkg.name} package.json found`);
    if (pkg.name === 'Root' && packageJson.scripts && packageJson.scripts.dev) {
      console.log(`   - Dev script: ${packageJson.scripts.dev}`);
    }
  } catch (error) {
    console.log(`❌ ${pkg.name} package.json not found or invalid`);
  }
});

console.log('\n📋 Available Scripts:');
console.log('   npm run dev          - Start client (port 3000) and server (port 8080)');
console.log('   npm run dev:test     - Start client, server, and tests');
console.log('   npm run client       - Start client only');
console.log('   npm run server       - Start server only');
console.log('   npm run test         - Run tests once');
console.log('   npm run install:all  - Install all dependencies');

console.log('\n🚀 To start development:');
console.log('   npm run dev');

console.log('\n🌐 URLs when running:');
console.log('   Client: http://localhost:3000');
console.log('   Server: http://localhost:8080');
console.log('   API:    http://localhost:8080/api/');

console.log('\n✨ Setup validation complete!');