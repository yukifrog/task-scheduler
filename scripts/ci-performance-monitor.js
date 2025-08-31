#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * CI Performance Monitor
 * 
 * Collects and analyzes GitHub Actions workflow performance metrics,
 * tracking the effectiveness of CI caching strategies and overall execution time.
 * 
 * Features:
 * - Workflow execution time analysis
 * - Cache hit/miss rate tracking  
 * - Performance degradation detection
 * - Historical trend analysis
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  OWNER: 'yukifrog',
  REPO: 'task-scheduler', 
  WORKFLOW_ID: 'ci.yml',
  DATA_DIR: path.join(__dirname, '..', 'reports', 'ci-performance'),
  MAX_RUNS: 50, // Number of recent runs to analyze
  PERFORMANCE_THRESHOLDS: {
    totalTime: 300, // 5 minutes warning threshold
    cacheHitRate: 85, // Minimum acceptable cache hit rate (%)
    degradationPercent: 20, // Performance degradation warning threshold (%)
  }
};

/**
 * Makes authenticated GitHub API request
 */
function makeGitHubRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method: 'GET',
      headers: {
        'User-Agent': 'CI-Performance-Monitor',
        'Accept': 'application/vnd.github.v3+json',
        // Note: For public repos, authentication is optional for read operations
        // In production, you might want to add GitHub token for higher rate limits
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Fetches recent workflow runs for analysis
 */
async function fetchWorkflowRuns() {
  console.log('📊 Fetching recent CI workflow runs...');
  
  const endpoint = `/repos/${CONFIG.OWNER}/${CONFIG.REPO}/actions/workflows/${CONFIG.WORKFLOW_ID}/runs?per_page=${CONFIG.MAX_RUNS}&status=completed`;
  const response = await makeGitHubRequest(endpoint);
  
  console.log(`✅ Found ${response.workflow_runs.length} completed workflow runs`);
  return response.workflow_runs;
}

/**
 * Fetches detailed job information for a workflow run
 */
async function fetchWorkflowJobs(runId) {
  const endpoint = `/repos/${CONFIG.OWNER}/${CONFIG.REPO}/actions/runs/${runId}/jobs`;
  const response = await makeGitHubRequest(endpoint);
  return response.jobs;
}

/**
 * Analyzes cache effectiveness from job steps
 */
function analyzeCacheEffectiveness(jobs) {
  const cacheSteps = [];
  
  jobs.forEach(job => {
    job.steps.forEach(step => {
      const stepName = step.name.toLowerCase();
      
      // Identify cache-related steps
      if (stepName.includes('cache') && !stepName.includes('post')) {
        cacheSteps.push({
          name: step.name,
          conclusion: step.conclusion,
          duration: calculateStepDuration(step),
          isHit: step.conclusion === 'success' && 
                 (stepName.includes('npm') || stepName.includes('playwright') || 
                  stepName.includes('next') || stepName.includes('prisma'))
        });
      }
    });
  });

  const totalCacheSteps = cacheSteps.length;
  const cacheHits = cacheSteps.filter(step => step.isHit).length;
  const hitRate = totalCacheSteps > 0 ? (cacheHits / totalCacheSteps) * 100 : 0;

  return {
    totalSteps: totalCacheSteps,
    hits: cacheHits,
    hitRate: Math.round(hitRate * 100) / 100,
    details: cacheSteps
  };
}

/**
 * Calculates step duration in seconds
 */
function calculateStepDuration(step) {
  if (!step.started_at || !step.completed_at) return 0;
  
  const start = new Date(step.started_at);
  const end = new Date(step.completed_at);
  return Math.round((end - start) / 1000);
}

/**
 * Calculates total workflow run duration in seconds
 */
function calculateRunDuration(run) {
  if (!run.run_started_at || !run.updated_at) return 0;
  
  const start = new Date(run.run_started_at);
  const end = new Date(run.updated_at);
  return Math.round((end - start) / 1000);
}

/**
 * Analyzes individual workflow run performance
 */
async function analyzeWorkflowRun(run) {
  console.log(`🔍 Analyzing run #${run.run_number} (${run.created_at})`);
  
  try {
    const jobs = await fetchWorkflowJobs(run.id);
    const duration = calculateRunDuration(run);
    const cacheAnalysis = analyzeCacheEffectiveness(jobs);
    
    // Extract key timing information
    const testJob = jobs.find(job => job.name === 'Test');
    const securityJob = jobs.find(job => job.name === 'Security Scan');
    
    const analysis = {
      runId: run.id,
      runNumber: run.run_number,
      branch: run.head_branch,
      event: run.event,
      conclusion: run.conclusion,
      createdAt: run.created_at,
      duration: duration,
      durationMinutes: Math.round(duration / 60 * 100) / 100,
      
      // Job-specific timings
      testJobDuration: testJob ? calculateStepDuration({
        started_at: testJob.started_at,
        completed_at: testJob.completed_at
      }) : 0,
      securityJobDuration: securityJob ? calculateStepDuration({
        started_at: securityJob.started_at, 
        completed_at: securityJob.completed_at
      }) : 0,
      
      // Cache analysis
      cache: cacheAnalysis,
      
      // Performance indicators
      isOptimal: duration <= CONFIG.PERFORMANCE_THRESHOLDS.totalTime && 
                 cacheAnalysis.hitRate >= CONFIG.PERFORMANCE_THRESHOLDS.cacheHitRate
    };
    
    return analysis;
  } catch (error) {
    console.warn(`⚠️ Failed to analyze run #${run.run_number}: ${error.message}`);
    return null;
  }
}

/**
 * Generates performance summary and trends
 */
function generatePerformanceSummary(analyses) {
  const valid = analyses.filter(a => a !== null);
  
  if (valid.length === 0) {
    return { error: 'No valid analyses available' };
  }

  // Calculate summary statistics
  const durations = valid.map(a => a.duration);
  const cacheHitRates = valid.map(a => a.cache.hitRate);
  
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const avgCacheHitRate = cacheHitRates.reduce((a, b) => a + b, 0) / cacheHitRates.length;
  
  // Trend analysis (comparing recent vs older runs)
  const recent = valid.slice(0, Math.min(10, valid.length));
  const older = valid.slice(10);
  
  let trend = 'stable';
  if (older.length > 0) {
    const recentAvg = recent.reduce((a, b) => a + b.duration, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.duration, 0) / older.length;
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > CONFIG.PERFORMANCE_THRESHOLDS.degradationPercent) {
      trend = 'degrading';
    } else if (change < -CONFIG.PERFORMANCE_THRESHOLDS.degradationPercent) {
      trend = 'improving';
    }
  }

  return {
    totalRuns: valid.length,
    avgDuration: Math.round(avgDuration),
    avgDurationMinutes: Math.round(avgDuration / 60 * 100) / 100,
    avgCacheHitRate: Math.round(avgCacheHitRate * 100) / 100,
    
    // Performance metrics
    fastestRun: Math.min(...durations),
    slowestRun: Math.max(...durations),
    optimalRuns: valid.filter(a => a.isOptimal).length,
    optimalRate: Math.round((valid.filter(a => a.isOptimal).length / valid.length) * 100),
    
    // Trends
    trend: trend,
    recentAvgDuration: recent.length > 0 ? 
      Math.round(recent.reduce((a, b) => a + b.duration, 0) / recent.length) : 0,
    
    // Alerts
    alerts: generateAlerts(valid, avgDuration, avgCacheHitRate),
    
    // Analysis timestamp
    analyzedAt: new Date().toISOString(),
    
    // Baseline comparison (vs expected performance from PR #19)
    baseline: {
      expectedDurationRange: [90, 150], // 1.5-2.5 minutes in seconds
      expectedImprovement: 60, // 60% improvement target
      actualPerformance: avgDuration <= 150 ? 'meeting-expectations' : 'below-expectations'
    }
  };
}

/**
 * Generates performance alerts based on thresholds
 */
function generateAlerts(analyses, avgDuration, avgCacheHitRate) {
  const alerts = [];
  
  // Duration alerts
  if (avgDuration > CONFIG.PERFORMANCE_THRESHOLDS.totalTime) {
    alerts.push({
      type: 'warning',
      category: 'performance',
      message: `Average CI duration (${Math.round(avgDuration/60)} min) exceeds threshold (${CONFIG.PERFORMANCE_THRESHOLDS.totalTime/60} min)`,
      severity: 'medium'
    });
  }
  
  // Cache hit rate alerts
  if (avgCacheHitRate < CONFIG.PERFORMANCE_THRESHOLDS.cacheHitRate) {
    alerts.push({
      type: 'warning', 
      category: 'cache',
      message: `Cache hit rate (${avgCacheHitRate}%) below optimal threshold (${CONFIG.PERFORMANCE_THRESHOLDS.cacheHitRate}%)`,
      severity: 'high'
    });
  }
  
  // Recent failure patterns
  const recentFailures = analyses.slice(0, 5).filter(a => a.conclusion !== 'success');
  if (recentFailures.length >= 3) {
    alerts.push({
      type: 'error',
      category: 'reliability', 
      message: `High failure rate in recent runs (${recentFailures.length}/5)`,
      severity: 'high'
    });
  }
  
  return alerts;
}

/**
 * Ensures data directory exists
 */
function ensureDataDirectory() {
  if (!fs.existsSync(CONFIG.DATA_DIR)) {
    fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
    console.log(`📁 Created data directory: ${CONFIG.DATA_DIR}`);
  }
}

/**
 * Saves performance data to JSON files
 */
function savePerformanceData(summary, analyses) {
  ensureDataDirectory();
  
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Save summary
  const summaryFile = path.join(CONFIG.DATA_DIR, `summary-${timestamp}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  // Save detailed analyses
  const detailFile = path.join(CONFIG.DATA_DIR, `detailed-${timestamp}.json`);
  fs.writeFileSync(detailFile, JSON.stringify(analyses, null, 2));
  
  // Update latest files
  fs.writeFileSync(path.join(CONFIG.DATA_DIR, 'latest-summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(CONFIG.DATA_DIR, 'latest-detailed.json'), JSON.stringify(analyses, null, 2));
  
  console.log(`💾 Performance data saved to ${CONFIG.DATA_DIR}`);
}

/**
 * Creates mock data for testing when API is unavailable
 */
function createMockData() {
  console.log('📝 Using mock data for testing...');
  
  const mockRuns = [];
  const now = new Date();
  
  for (let i = 0; i < 20; i++) {
    const date = new Date(now - (i * 24 * 60 * 60 * 1000)); // Daily runs
    const duration = Math.floor(Math.random() * 120) + 90; // 90-210 seconds
    const cacheHitRate = Math.floor(Math.random() * 20) + 80; // 80-100%
    
    mockRuns.push({
      runId: 1000000 + i,
      runNumber: 50 - i,
      branch: i % 5 === 0 ? 'feature/test' : 'main',
      event: 'push',
      conclusion: i % 10 === 0 ? 'failure' : 'success',
      createdAt: date.toISOString(),
      duration: duration,
      durationMinutes: Math.round(duration / 60 * 100) / 100,
      testJobDuration: duration - 30,
      securityJobDuration: 45,
      cache: {
        totalSteps: 4,
        hits: Math.floor(cacheHitRate * 4 / 100),
        hitRate: cacheHitRate,
        details: []
      },
      isOptimal: duration <= 150 && cacheHitRate >= 85
    });
  }
  
  return mockRuns;
}

/**
 * Main monitoring function
 */
async function runPerformanceAnalysis(useMockData = false) {
  console.log('🚀 Starting CI Performance Analysis');
  console.log('===================================');
  
  try {
    let analyses;
    
    if (useMockData) {
      // Use mock data for testing
      analyses = createMockData();
    } else {
      // Fetch and analyze workflow runs
      const runs = await fetchWorkflowRuns();
      
      console.log('\n🔍 Analyzing workflow runs...');
      const analyses = [];
      
      for (const run of runs) {
        const analysis = await analyzeWorkflowRun(run);
        if (analysis) {
          analyses.push(analysis);
        }
        
        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Generate summary
    console.log('\n📈 Generating performance summary...');
    const summary = generatePerformanceSummary(analyses);
    
    // Save data
    savePerformanceData(summary, analyses);
    
    // Display results
    console.log('\n📊 PERFORMANCE SUMMARY');
    console.log('=====================');
    console.log(`Total runs analyzed: ${summary.totalRuns}`);
    console.log(`Average duration: ${summary.avgDurationMinutes} minutes`);
    console.log(`Cache hit rate: ${summary.avgCacheHitRate}%`);
    console.log(`Optimal runs: ${summary.optimalRuns}/${summary.totalRuns} (${summary.optimalRate}%)`);
    console.log(`Performance trend: ${summary.trend}`);
    
    if (summary.baseline) {
      console.log(`\n🎯 BASELINE COMPARISON (PR #19 targets)`);
      console.log(`Expected: 1.5-2.5 minutes (90-150 seconds)`);
      console.log(`Actual: ${summary.avgDurationMinutes} minutes`);
      console.log(`Status: ${summary.baseline.actualPerformance.replace('-', ' ')}`);
    }
    
    // Display alerts
    if (summary.alerts && summary.alerts.length > 0) {
      console.log('\n⚠️ ALERTS');
      summary.alerts.forEach(alert => {
        const icon = alert.type === 'error' ? '❌' : '⚠️';
        console.log(`${icon} [${alert.severity.toUpperCase()}] ${alert.message}`);
      });
    } else {
      console.log('\n✅ No performance alerts');
    }
    
    console.log('\n✨ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Performance analysis failed:', error.message);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
CI Performance Monitor

Usage: node scripts/ci-performance-monitor.js [options]

Options:
  --help, -h     Show this help message
  --quiet, -q    Minimal output
  --verbose, -v  Verbose output with detailed analysis
  --mock         Use mock data for testing (offline mode)

Examples:
  node scripts/ci-performance-monitor.js              # Run full analysis
  node scripts/ci-performance-monitor.js --quiet      # Run with minimal output
  node scripts/ci-performance-monitor.js --mock       # Use mock data for testing
  
Performance data is saved to: ${CONFIG.DATA_DIR}
    `);
    process.exit(0);
  }
  
  const useMockData = args.includes('--mock');
  
  runPerformanceAnalysis(useMockData).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  runPerformanceAnalysis,
  analyzeCacheEffectiveness,
  generatePerformanceSummary,
  createMockData,
  CONFIG
};