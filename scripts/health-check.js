#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-assign-module-variable */

/**
 * Application health check script
 * This script tests basic connectivity and routing without full E2E
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

console.log(`🏥 Health checking application at ${BASE_URL}...\n`);

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const module = url.startsWith('https') ? https : http;
    const request = module.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkEndpoint(path, expectedStatus = 200) {
  const url = `${BASE_URL}${path}`;
  try {
    console.log(`📡 Checking ${path}...`);
    const response = await makeRequest(url);
    
    if (response.status === expectedStatus) {
      console.log(`  ✅ Status ${response.status} (expected ${expectedStatus})`);
      return true;
    } else {
      console.log(`  ❌ Status ${response.status} (expected ${expectedStatus})`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function checkUIElements(path, expectedTexts) {
  const url = `${BASE_URL}${path}`;
  try {
    console.log(`🔍 Checking UI content at ${path}...`);
    const response = await makeRequest(url);
    
    if (response.status !== 200) {
      console.log(`  ❌ Status ${response.status}, cannot check content`);
      return false;
    }
    
    let allFound = true;
    for (const text of expectedTexts) {
      if (response.body.includes(text)) {
        console.log(`  ✅ Found: "${text}"`);
      } else {
        console.log(`  ❌ Missing: "${text}"`);
        allFound = false;
      }
    }
    
    return allFound;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function runHealthCheck() {
  const checks = [];
  
  // Basic connectivity
  checks.push(await checkEndpoint('/'));
  checks.push(await checkEndpoint('/auth/signin'));
  checks.push(await checkEndpoint('/api/tasks', 401)); // Should require auth
  checks.push(await checkEndpoint('/routines'));
  
  console.log('');
  
  // UI content checks
  checks.push(await checkUIElements('/', [
    'タスクスケジューラー',
    'サインインして開始'
  ]));
  
  checks.push(await checkUIElements('/auth/signin', [
    'タスクスケジューラーにサインイン',
    'デモログイン'
  ]));
  
  const passed = checks.filter(Boolean).length;
  const total = checks.length;
  
  console.log('\n📊 Health Check Summary:');
  console.log(`  ✅ Passed: ${passed}/${total}`);
  console.log(`  ❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All health checks passed! Application is ready for E2E testing.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some health checks failed. Please review the application state.');
    process.exit(1);
  }
}

// Handle the case where server isn't running
process.on('uncaughtException', (error) => {
  if (error.code === 'ECONNREFUSED') {
    console.log('\n❌ Cannot connect to application server.');
    console.log(`   Make sure the server is running at ${BASE_URL}`);
    console.log('   Run: npm run dev');
    process.exit(1);
  } else {
    throw error;
  }
});

runHealthCheck();