#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Network Connectivity Test Script
 * 
 * Tests connectivity to hosts that should be in the Repository Custom Allowlist.
 * Used to verify allowlist configuration effectiveness and diagnose network issues.
 * 
 * Usage:
 *   npm run test:network-connectivity
 *   node scripts/test-network-connectivity.js [--verbose] [--timeout=30] [--host=example.com]
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const USER_AGENT = 'Task-Scheduler-Connectivity-Test/1.0';

// Hosts that should be allowlisted
const ALLOWLIST_HOSTS = [
  {
    name: 'Prisma Binaries',
    url: 'https://binaries.prisma.sh/',
    description: 'Prisma CLI and engine binary downloads',
    critical: true,
    testPath: '/', // Basic connectivity test
  },
  {
    name: 'Prisma Telemetry',
    url: 'https://checkpoint.prisma.io/',
    description: 'Prisma usage analytics and telemetry',
    critical: false,
    testPath: '/',
  },
  {
    name: 'GitHub API',
    url: 'https://api.github.com/',
    description: 'GitHub API for CI performance monitoring',
    critical: true,
    testPath: '/repos/yukifrog/task-scheduler', // Test actual endpoint
  },
  {
    name: 'Google Fonts',
    url: 'https://fonts.googleapis.com/',
    description: 'Google Fonts for Next.js UI',
    critical: false,
    testPath: '/css2?family=Inter:wght@400;500;600;700', // Test actual font
  }
];

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const timeoutArg = args.find(arg => arg.startsWith('--timeout='));
const hostArg = args.find(arg => arg.startsWith('--host='));

const timeout = timeoutArg ? parseInt(timeoutArg.split('=')[1]) * 1000 : DEFAULT_TIMEOUT;
const specificHost = hostArg ? hostArg.split('=')[1] : null;

// Filter hosts if specific host requested
const hostsToTest = specificHost 
  ? ALLOWLIST_HOSTS.filter(host => host.url.includes(specificHost))
  : ALLOWLIST_HOSTS;

/**
 * Get human-readable status message for HTTP status codes
 */
function getStatusMessage(statusCode) {
  const messages = {
    401: 'Unauthorized (API key may be required)',
    403: 'Forbidden (rate limited or access denied)',
    404: 'Not Found',
    429: 'Too Many Requests (rate limited)',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };
  return messages[statusCode] || `HTTP ${statusCode}`;
}

/**
 * Test connectivity to a specific URL
 */
function testConnectivity(testConfig) {
  return new Promise((resolve) => {
    const fullUrl = testConfig.url + testConfig.testPath.replace(/^\//, '');
    const urlObj = new URL(fullUrl);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    if (verbose) {
      console.log(`🔍 Testing: ${fullUrl}`);
    }
    
    const startTime = Date.now();
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD', // Use HEAD to minimize data transfer
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': '*/*',
      },
      timeout: timeout,
    };
    
    const req = httpModule.request(options, (res) => {
      const duration = Date.now() - startTime;
      
      // Consider 2xx and 3xx as successful for connectivity testing
      // 401/403 might indicate API limits but connection is working
      const isConnected = res.statusCode >= 200 && res.statusCode < 500;
      const isSuccessful = res.statusCode >= 200 && res.statusCode < 400;
      
      const result = {
        name: testConfig.name,
        url: fullUrl,
        success: isConnected, // Connection successful even with auth errors
        statusCode: res.statusCode,
        duration: duration,
        error: isSuccessful ? null : `HTTP ${res.statusCode} - ${getStatusMessage(res.statusCode)}`,
        critical: testConfig.critical,
        description: testConfig.description,
      };
      
      if (verbose) {
        const status = isConnected ? '✓' : '✗';
        console.log(`  ${status} Response: ${res.statusCode} (${duration}ms)${isSuccessful ? '' : ' - ' + getStatusMessage(res.statusCode)}`);
      }
      
      resolve(result);
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      const result = {
        name: testConfig.name,
        url: fullUrl,
        success: false,
        statusCode: null,
        duration: duration,
        error: error.message,
        critical: testConfig.critical,
        description: testConfig.description,
      };
      
      if (verbose) {
        console.log(`  ✗ Error: ${error.message} (${duration}ms)`);
      }
      
      resolve(result);
    });
    
    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      const result = {
        name: testConfig.name,
        url: fullUrl,
        success: false,
        statusCode: null,
        duration: duration,
        error: `Timeout after ${timeout}ms`,
        critical: testConfig.critical,
        description: testConfig.description,
      };
      
      if (verbose) {
        console.log(`  ✗ Timeout after ${timeout}ms`);
      }
      
      resolve(result);
    });
    
    req.end();
  });
}

/**
 * Format duration for display
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Generate connectivity report
 */
function generateReport(results) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const criticalFailed = failed.filter(r => r.critical);
  
  console.log('\\n📊 Network Connectivity Test Results');
  console.log('=====================================\\n');
  
  // Summary
  console.log(`📈 Summary:`);
  console.log(`  Total hosts tested: ${results.length}`);
  console.log(`  Successful: ${successful.length}/${results.length} (${Math.round(successful.length / results.length * 100)}%)`);
  console.log(`  Failed: ${failed.length}/${results.length}`);
  console.log(`  Critical failures: ${criticalFailed.length}`);
  console.log('');
  
  // Successful connections
  if (successful.length > 0) {
    console.log('✅ Accessible Hosts:');
    successful.forEach(result => {
      const status = result.statusCode ? `HTTP ${result.statusCode}` : 'Connected';
      const note = result.error ? ` (${result.error})` : '';
      console.log(`  ✓ ${result.name}: ${status} (${formatDuration(result.duration)})${note}`);
      if (verbose) {
        console.log(`    URL: ${result.url}`);
        console.log(`    Purpose: ${result.description}`);
      }
    });
    console.log('');
  }
  
  // Failed connections
  if (failed.length > 0) {
    console.log('❌ Failed Connections:');
    failed.forEach(result => {
      const criticality = result.critical ? '[CRITICAL]' : '[OPTIONAL]';
      console.log(`  ✗ ${result.name} ${criticality}: ${result.error || 'Unknown error'}`);
      if (verbose) {
        console.log(`    URL: ${result.url}`);
        console.log(`    Purpose: ${result.description}`);
        console.log(`    Duration: ${formatDuration(result.duration)}`);
      }
    });
    console.log('');
  }
  
  // Recommendations
  console.log('🔧 Recommendations:');
  
  if (criticalFailed.length > 0) {
    console.log('  ⚠️  CRITICAL: Some essential services are not accessible');
    console.log('     → Configure Repository Custom Allowlist immediately');
    console.log('     → See: .github/CUSTOM_ALLOWLIST_CONFIGURATION.md');
  } else if (failed.length > 0) {
    console.log('  ⚠️  OPTIONAL: Some non-critical services are blocked');
    console.log('     → Consider adding these hosts to allowlist for better experience');
  } else {
    console.log('  ✅ All services are accessible - allowlist configuration is working');
  }
  
  console.log('');
  
  // Allowlist configuration
  if (failed.length > 0) {
    console.log('📝 Required Allowlist Hosts:');
    failed.forEach(result => {
      const hostname = new URL(result.url).hostname;
      console.log(`  - ${hostname}`);
    });
    console.log('');
    console.log('💡 How to configure:');
    console.log('  1. Go to: https://github.com/yukifrog/task-scheduler/settings');
    console.log('  2. Navigate to: Copilot coding agent → Custom allowlist');
    console.log('  3. Add the hosts listed above (one per line)');
    console.log('  4. Save configuration and test again');
    console.log('');
  }
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    criticalFailed: criticalFailed.length,
    allCriticalPassed: criticalFailed.length === 0,
  };
}

/**
 * Main test execution
 */
async function runConnectivityTest() {
  console.log(`🌐 Network Connectivity Test`);
  console.log(`Timeout: ${timeout / 1000}s | Hosts: ${hostsToTest.length}`);
  
  if (specificHost) {
    console.log(`Filtering for host: ${specificHost}`);
  }
  
  console.log('');
  
  const results = [];
  
  for (const host of hostsToTest) {
    console.log(`📡 Testing ${host.name}...`);
    const result = await testConnectivity(host);
    results.push(result);
    
    // Show immediate result
    const status = result.success ? '✅' : '❌';
    const detail = result.success 
      ? `${result.statusCode} (${formatDuration(result.duration)})`
      : result.error;
    console.log(`  ${status} ${detail}`);
  }
  
  const summary = generateReport(results);
  
  // Exit code based on critical failures
  const exitCode = summary.criticalFailed > 0 ? 1 : 0;
  
  if (exitCode === 0) {
    console.log('🎉 All critical services are accessible!');
  } else {
    console.log('⚠️  Critical connectivity issues detected. Check allowlist configuration.');
  }
  
  process.exit(exitCode);
}

// Handle help command
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Network Connectivity Test Script

Usage:
  node scripts/test-network-connectivity.js [options]

Options:
  --verbose, -v           Show detailed output
  --timeout=<seconds>     Set request timeout (default: 30)
  --host=<hostname>       Test only specific host
  --help, -h              Show this help

Examples:
  node scripts/test-network-connectivity.js
  node scripts/test-network-connectivity.js --verbose --timeout=60
  node scripts/test-network-connectivity.js --host=api.github.com
`);
  process.exit(0);
}

// Run the test
if (require.main === module) {
  runConnectivityTest().catch(error => {
    console.error('💥 Test execution failed:', error.message);
    if (verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  });
}

module.exports = {
  testConnectivity,
  ALLOWLIST_HOSTS,
  runConnectivityTest,
};