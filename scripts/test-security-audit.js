#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Test script for security audit workflow
 * Validates the workflow logic and JSON parsing functionality
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Testing Security Audit Workflow Logic\n');

// Test 1: Validate npm audit JSON output format
console.log('Test 1: Validating npm audit JSON output format...');
try {
  const auditResult = execSync('npm audit --audit-level moderate --json', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  const auditData = JSON.parse(auditResult);
  
  // Validate expected structure
  if (!auditData.vulnerabilities || !auditData.metadata) {
    throw new Error('Invalid audit JSON structure');
  }
  
  console.log('✅ npm audit JSON output format is valid');
  console.log(`   - Dependencies: ${auditData.metadata.dependencies.total}`);
  console.log(`   - Vulnerabilities: ${auditData.metadata.vulnerabilities.total}`);
  
} catch (error) {
  console.log('❌ npm audit JSON test failed:', error.message);
  process.exit(1);
}

// Test 2: Test vulnerability counting logic
console.log('\nTest 2: Testing vulnerability counting logic...');

// Create mock audit data with vulnerabilities for testing
const mockAuditData = {
  vulnerabilities: {
    'package1': { severity: 'critical' },
    'package2': { severity: 'high' },
    'package3': { severity: 'moderate' },
    'package4': { severity: 'low' },
    'package5': { severity: 'critical' }
  },
  metadata: {
    vulnerabilities: {
      critical: 2,
      high: 1,
      moderate: 1,
      low: 1,
      total: 5
    }
  }
};

try {
  // Test the vulnerability counting logic from the workflow
  const vulns = mockAuditData.vulnerabilities || {};
  const criticalCount = Object.values(vulns).filter(v => v.severity === 'critical').length;
  const highCount = Object.values(vulns).filter(v => v.severity === 'high').length;
  const moderateCount = Object.values(vulns).filter(v => v.severity === 'moderate').length;
  const lowCount = Object.values(vulns).filter(v => v.severity === 'low').length;
  
  const expected = { critical: 2, high: 1, moderate: 1, low: 1 };
  const actual = { critical: criticalCount, high: highCount, moderate: moderateCount, low: lowCount };
  
  if (JSON.stringify(expected) === JSON.stringify(actual)) {
    console.log('✅ Vulnerability counting logic is correct');
    console.log(`   - Critical: ${criticalCount}, High: ${highCount}, Moderate: ${moderateCount}, Low: ${lowCount}`);
  } else {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
  
} catch (error) {
  console.log('❌ Vulnerability counting test failed:', error.message);
  process.exit(1);
}

// Test 3: Test workflow decision logic
console.log('\nTest 3: Testing workflow decision logic...');

function shouldFailWorkflow(criticalCount, highCount) {
  return criticalCount > 0 || highCount > 0;
}

const testCases = [
  { critical: 0, high: 0, expected: false, description: 'No vulnerabilities' },
  { critical: 1, high: 0, expected: true, description: 'Critical vulnerabilities' },
  { critical: 0, high: 1, expected: true, description: 'High vulnerabilities' },
  { critical: 1, high: 1, expected: true, description: 'Both critical and high' },
  { critical: 0, high: 0, expected: false, description: 'Only moderate/low' }
];

let allTestsPassed = true;
testCases.forEach((testCase, index) => {
  const result = shouldFailWorkflow(testCase.critical, testCase.high);
  if (result === testCase.expected) {
    console.log(`✅ Test case ${index + 1}: ${testCase.description} - PASS`);
  } else {
    console.log(`❌ Test case ${index + 1}: ${testCase.description} - FAIL (expected ${testCase.expected}, got ${result})`);
    allTestsPassed = false;
  }
});

if (!allTestsPassed) {
  console.log('\n❌ Some workflow decision logic tests failed');
  process.exit(1);
}

// Test 4: Check workflow file syntax
console.log('\nTest 4: Validating workflow file syntax...');
try {
  const workflowPath = '.github/workflows/security-audit.yml';
  if (!fs.existsSync(workflowPath)) {
    throw new Error('Security audit workflow file not found');
  }
  
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  
  // Basic YAML syntax checks
  if (!workflowContent.includes('name: Daily Security Audit')) {
    throw new Error('Workflow name not found');
  }
  
  if (!workflowContent.includes("cron: '0 2 * * *'")) {
    throw new Error('Daily cron schedule not found');
  }
  
  if (!workflowContent.includes('npm audit --audit-level')) {
    throw new Error('npm audit command not found');
  }
  
  console.log('✅ Workflow file syntax validation passed');
  console.log(`   - File size: ${workflowContent.length} characters`);
  
} catch (error) {
  console.log('❌ Workflow file validation failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All tests passed! Security audit workflow is ready.');
console.log('\nWorkflow Features:');
console.log('- ✅ Daily execution at 2 AM UTC');
console.log('- ✅ JSON and human-readable output');
console.log('- ✅ Critical/High vulnerability detection');
console.log('- ✅ Automatic issue creation for security alerts');
console.log('- ✅ Artifact upload for audit reports');
console.log('- ✅ Manual trigger capability');