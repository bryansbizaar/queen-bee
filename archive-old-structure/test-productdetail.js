#!/usr/bin/env node

// Simple test runner to check if ProductDetail.test.jsx has import issues
const fs = require('fs');
const path = require('path');

console.log('🧪 Checking ProductDetail.test.jsx for import issues...\n');

const testFilePath = path.join(__dirname, 'client/src/components/ProductDetail.test.jsx');

try {
  const content = fs.readFileSync(testFilePath, 'utf8');
  
  // Check for problematic imports
  const lines = content.split('\n');
  let hasIssues = false;
  
  lines.forEach((line, index) => {
    if (line.includes('consolidatedTestSetup')) {
      console.log(`❌ Line ${index + 1}: Still references consolidatedTestSetup`);
      console.log(`   ${line.trim()}`);
      hasIssues = true;
    }
    
    if (line.includes('testUtils.simulate')) {
      console.log(`❌ Line ${index + 1}: Still references testUtils.simulate functions`);
      console.log(`   ${line.trim()}`);
      hasIssues = true;
    }
  });
  
  if (!hasIssues) {
    console.log('✅ No import issues found!');
    console.log('✅ ProductDetail.test.jsx should now run without errors');
    
    // Show current imports
    console.log('\n📋 Current imports:');
    lines.slice(0, 15).forEach((line, index) => {
      if (line.trim().startsWith('import')) {
        console.log(`   ${line.trim()}`);
      }
    });
  }
  
} catch (error) {
  console.log('❌ Error reading test file:', error.message);
}

console.log('\n🏃‍♂️ To run the test:');
console.log('cd client && npm test ProductDetail.test.jsx -- --run');
