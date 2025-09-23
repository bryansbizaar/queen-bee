#!/usr/bin/env node

// Simple test runner to check our ProductDetailEnhanced tests
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running ProductDetailEnhanced tests...\n');

const testProcess = spawn('npm', ['test', '--', 'ProductDetailEnhanced.test.jsx'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Tests completed successfully!');
  } else {
    console.log(`\n❌ Tests failed with exit code ${code}`);
  }
  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('❌ Failed to start test process:', error);
  process.exit(1);
});
