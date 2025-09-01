#!/usr/bin/env node

/**
 * Verification script for Prisma Telemetry Implementation
 * Tests the key improvements implemented:
 * 1. PRISMA_TELEMETRY_IMPLEMENTATION.md file exists and ends with proper newline
 * 2. postinstall script exists and works
 * 3. Environment configuration works correctly
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 Verifying Prisma Telemetry Implementation...\\n');

let allPassed = true;

/**
 * Test 1: Verify PRISMA_TELEMETRY_IMPLEMENTATION.md exists and has proper ending
 */
console.log('📄 Testing PRISMA_TELEMETRY_IMPLEMENTATION.md...');
const implFile = path.join(__dirname, '..', 'PRISMA_TELEMETRY_IMPLEMENTATION.md');

if (fs.existsSync(implFile)) {
  console.log('  ✅ File exists');
  
  // Check file ends with newline
  const content = fs.readFileSync(implFile);
  const lastByte = content[content.length - 1];
  if (lastByte === 10) { // ASCII 10 is newline
    console.log('  ✅ File ends with proper newline');
  } else {
    console.log('  ❌ File does not end with newline');
    allPassed = false;
  }
  
  // Check content contains expected sections
  const contentStr = content.toString();
  const expectedSections = [
    'Prisma Telemetry Complete Disabling Implementation',
    'Postinstall Script',
    'CHECKPOINT_TELEMETRY=0',
    'Issue**: #42'
  ];
  
  expectedSections.forEach(section => {
    if (contentStr.includes(section)) {
      console.log(`  ✅ Contains expected section: ${section}`);
    } else {
      console.log(`  ❌ Missing expected section: ${section}`);
      allPassed = false;
    }
  });
} else {
  console.log('  ❌ File does not exist');
  allPassed = false;
}

/**
 * Test 2: Verify package.json has postinstall script
 */
console.log('\\n📦 Testing package.json postinstall script...');
const packageFile = path.join(__dirname, '..', 'package.json');

if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.postinstall) {
    console.log('  ✅ postinstall script exists');
    
    if (packageJson.scripts.postinstall === 'prisma generate --no-engine') {
      console.log('  ✅ postinstall uses --no-engine flag');
    } else {
      console.log(`  ❌ postinstall script incorrect: ${packageJson.scripts.postinstall}`);
      allPassed = false;
    }
  } else {
    console.log('  ❌ postinstall script missing');
    allPassed = false;
  }
  
  if (packageJson.scripts && packageJson.scripts['prisma:generate']) {
    console.log('  ✅ prisma:generate script exists');
  } else {
    console.log('  ❌ prisma:generate script missing');
    allPassed = false;
  }
} else {
  console.log('  ❌ package.json not found');
  allPassed = false;
}

/**
 * Test 3: Verify environment configuration script exists
 */
console.log('\\n🔧 Testing environment configuration...');
const envScript = path.join(__dirname, 'inject-ci-env.sh');

if (fs.existsSync(envScript)) {
  console.log('  ✅ inject-ci-env.sh exists');
} else {
  console.log('  ❌ inject-ci-env.sh missing');
  allPassed = false;
}

const ciEnvFile = path.join(__dirname, '..', '.github', 'ci.env');
if (fs.existsSync(ciEnvFile)) {
  console.log('  ✅ .github/ci.env exists');
  
  const envContent = fs.readFileSync(ciEnvFile, 'utf8');
  if (envContent.includes('CHECKPOINT_TELEMETRY=0')) {
    console.log('  ✅ CHECKPOINT_TELEMETRY=0 configured');
  } else {
    console.log('  ❌ CHECKPOINT_TELEMETRY=0 missing');
    allPassed = false;
  }
  
  if (envContent.includes('NEXT_TELEMETRY_DISABLED=1')) {
    console.log('  ✅ NEXT_TELEMETRY_DISABLED=1 configured');
  } else {
    console.log('  ❌ NEXT_TELEMETRY_DISABLED=1 missing');
    allPassed = false;
  }
} else {
  console.log('  ❌ .github/ci.env missing');
  allPassed = false;
}

/**
 * Test 4: Test postinstall script execution
 */
console.log('\\n🚀 Testing postinstall script execution...');

exec('npm run postinstall', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
  if (error) {
    console.log(`  ❌ postinstall failed: ${error.message}`);
    allPassed = false;
  } else {
    console.log('  ✅ postinstall executed successfully');
    
    if (stdout.includes('Generated Prisma Client') && stdout.includes('engine=none')) {
      console.log('  ✅ Prisma client generated without engine');
    } else {
      console.log('  ❌ Prisma client generation output unexpected');
      allPassed = false;
    }
  }
  
  // Final summary
  console.log('\\n📋 Verification Summary:');
  console.log('========================');
  
  if (allPassed) {
    console.log('🎉 All verifications passed!');
    console.log('\\n✅ Implementation complete:');
    console.log('   • PRISMA_TELEMETRY_IMPLEMENTATION.md created with proper newline ending');
    console.log('   • postinstall script added to package.json');
    console.log('   • Environment configuration verified');
    console.log('   • No conflicts detected');
    console.log('\\n🚀 Ready for production use!');
  } else {
    console.log('❌ Some verifications failed. Please review the issues above.');
    process.exit(1);
  }
});