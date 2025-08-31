#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Test validation script
 * This script validates that the E2E tests have been properly structured
 * without actually running them (useful when Playwright installation fails)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating E2E Test Structure...\n');

const testsDir = path.join(__dirname, '..', 'tests', 'e2e');
const testFiles = ['auth.spec.ts', 'tasks.spec.ts', 'routines.spec.ts'];

const validations = [
  {
    name: 'File existence',
    check: (file) => fs.existsSync(path.join(testsDir, file)),
    message: 'All test files exist'
  },
  {
    name: 'Import statements',
    check: (file) => {
      const content = fs.readFileSync(path.join(testsDir, file), 'utf8');
      return content.includes('import { test, expect') && 
             (content.includes('Page') || !content.includes('page: any'));
    },
    message: 'Proper TypeScript imports'
  },
  {
    name: 'Timeout configurations',
    check: (file) => {
      const content = fs.readFileSync(path.join(testsDir, file), 'utf8');
      return content.includes('timeout:') && 
             content.match(/timeout:\s*\d{4,}/); // 4+ digit timeouts
    },
    message: 'Extended timeout configurations'
  },
  {
    name: 'Authentication helpers',
    check: (file) => {
      if (file === 'auth.spec.ts') return true; // Skip for auth file
      const content = fs.readFileSync(path.join(testsDir, file), 'utf8');
      return content.includes('signInUser');
    },
    message: 'Authentication helper functions'
  },
  {
    name: 'Error handling',
    check: (file) => {
      const content = fs.readFileSync(path.join(testsDir, file), 'utf8');
      return content.includes('try') && content.includes('catch') ||
             content.includes('console.log');
    },
    message: 'Error handling and debugging'
  },
  {
    name: 'Flexible selectors',
    check: (file) => {
      const content = fs.readFileSync(path.join(testsDir, file), 'utf8');
      return content.includes('isVisible') && 
             (content.includes('for (') || content.includes('||'));
    },
    message: 'Flexible selector strategies'
  }
];

let allPassed = true;

testFiles.forEach(file => {
  console.log(`📝 Validating ${file}:`);
  
  validations.forEach(validation => {
    const passed = validation.check(file);
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${validation.message}`);
    
    if (!passed) {
      allPassed = false;
    }
  });
  
  console.log('');
});

// Check Playwright config
const playwrightConfig = path.join(__dirname, '..', 'playwright.config.ts');
if (fs.existsSync(playwrightConfig)) {
  const config = fs.readFileSync(playwrightConfig, 'utf8');
  console.log('📋 Playwright Configuration:');
  
  const configChecks = [
    { name: 'Extended action timeout', check: config.includes('actionTimeout') },
    { name: 'Extended navigation timeout', check: config.includes('navigationTimeout') },
    { name: 'Global timeout', check: config.includes('timeout:') },
    { name: 'Expect timeout', check: config.includes('expect:') }
  ];
  
  configChecks.forEach(check => {
    const status = check.check ? '✅' : '❌';
    console.log(`  ${status} ${check.name}`);
    if (!check.check) allPassed = false;
  });
  
  console.log('');
}

if (allPassed) {
  console.log('🎉 All validations passed! Tests are properly structured for timeout and selector improvements.');
  process.exit(0);
} else {
  console.log('⚠️  Some validations failed. Please review the test structure.');
  process.exit(1);
}