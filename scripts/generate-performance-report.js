#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Performance Report Generator
 * 
 * Generates comprehensive HTML reports from CI performance data,
 * including charts, trends, and actionable insights.
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  DATA_DIR: path.join(__dirname, '..', 'reports', 'ci-performance'),
  REPORT_FILE: 'report.html'
};

/**
 * Loads performance data from JSON files
 */
function loadPerformanceData() {
  const summaryPath = path.join(CONFIG.DATA_DIR, 'latest-summary.json');
  const detailedPath = path.join(CONFIG.DATA_DIR, 'latest-detailed.json');
  
  if (!fs.existsSync(summaryPath) || !fs.existsSync(detailedPath)) {
    throw new Error('Performance data files not found');
  }
  
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const detailed = JSON.parse(fs.readFileSync(detailedPath, 'utf8'));
  
  return { summary, detailed };
}

/**
 * Generates chart data for visualization
 */
function generateChartData(detailed) {
  const chartData = {
    durations: detailed.map(run => ({
      x: new Date(run.createdAt).toLocaleDateString(),
      y: run.durationMinutes,
      runNumber: run.runNumber,
      conclusion: run.conclusion
    })),
    cacheRates: detailed.map(run => ({
      x: new Date(run.createdAt).toLocaleDateString(),
      y: run.cache.hitRate,
      runNumber: run.runNumber
    }))
  };
  
  return chartData;
}

/**
 * Generates HTML report
 */
function generateHTMLReport(summary, detailed) {
  const chartData = generateChartData(detailed);
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CI Performance Report - ${new Date().toLocaleDateString('ja-JP')}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-value {
      font-size: 2em;
      font-weight: bold;
      margin: 10px 0;
    }
    .metric-label {
      color: #666;
      font-size: 0.9em;
    }
    .metric-target {
      color: #888;
      font-size: 0.8em;
    }
    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .status-optimal { color: #10b981; }
    .status-warning { color: #f59e0b; }
    .status-critical { color: #ef4444; }
    .trend-improving { color: #10b981; }
    .trend-stable { color: #6b7280; }
    .trend-degrading { color: #ef4444; }
    .alert {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .alert.warning {
      background: #fffbeb;
      border-color: #fed7aa;
      color: #d97706;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
    }
    .run-success { color: #10b981; }
    .run-failure { color: #ef4444; }
    .footer {
      text-align: center;
      color: #666;
      margin-top: 40px;
      padding: 20px;
      background: white;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 CI Performance Report</h1>
    <p>Generated on ${new Date().toLocaleString('ja-JP')}</p>
    <p>Analysis Period: ${summary.totalRuns} recent workflow runs</p>
  </div>

  ${summary.alerts && summary.alerts.length > 0 ? `
  <div class="alert ${summary.alerts.some(a => a.severity === 'high') ? '' : 'warning'}">
    <h3>⚠️ Performance Alerts</h3>
    <ul>
      ${summary.alerts.map(alert => `
        <li><strong>[${alert.severity.toUpperCase()}]</strong> ${alert.message}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-label">Average Duration</div>
      <div class="metric-value ${summary.avgDurationMinutes <= 2.5 ? 'status-optimal' : summary.avgDurationMinutes <= 3.5 ? 'status-warning' : 'status-critical'}">
        ${summary.avgDurationMinutes} min
      </div>
      <div class="metric-target">Target: 1.5-2.5 minutes</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-label">Cache Hit Rate</div>
      <div class="metric-value ${summary.avgCacheHitRate >= 85 ? 'status-optimal' : summary.avgCacheHitRate >= 70 ? 'status-warning' : 'status-critical'}">
        ${summary.avgCacheHitRate}%
      </div>
      <div class="metric-target">Target: >85%</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-label">Optimal Runs</div>
      <div class="metric-value ${summary.optimalRate >= 80 ? 'status-optimal' : summary.optimalRate >= 60 ? 'status-warning' : 'status-critical'}">
        ${summary.optimalRate}%
      </div>
      <div class="metric-target">${summary.optimalRuns}/${summary.totalRuns} runs</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-label">Performance Trend</div>
      <div class="metric-value trend-${summary.trend}">
        ${summary.trend === 'improving' ? '📈' : summary.trend === 'degrading' ? '📉' : '📊'} ${summary.trend}
      </div>
      <div class="metric-target">Recent avg: ${Math.round(summary.recentAvgDuration / 60 * 100) / 100} min</div>
    </div>
  </div>

  <div class="chart-container">
    <h3>📊 Execution Time Trend</h3>
    <canvas id="durationChart" width="400" height="200"></canvas>
  </div>

  <div class="chart-container">
    <h3>🎯 Cache Hit Rate Trend</h3>
    <canvas id="cacheChart" width="400" height="200"></canvas>
  </div>

  <div class="chart-container">
    <h3>🏆 Baseline Comparison (PR #19 Optimization)</h3>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Pre-optimization (Expected)</div>
        <div class="metric-value">4-6 min</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Target Performance</div>
        <div class="metric-value">1.5-2.5 min</div>
        <div class="metric-target">${summary.baseline.expectedImprovement}% improvement</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Actual Performance</div>
        <div class="metric-value ${summary.baseline.actualPerformance === 'meeting-expectations' ? 'status-optimal' : 'status-warning'}">
          ${summary.avgDurationMinutes} min
        </div>
        <div class="metric-target">${summary.baseline.actualPerformance.replace('-', ' ')}</div>
      </div>
    </div>
  </div>

  <div class="chart-container">
    <h3>📋 Recent Workflow Runs</h3>
    <table>
      <thead>
        <tr>
          <th>Run #</th>
          <th>Branch</th>
          <th>Duration</th>
          <th>Cache Rate</th>
          <th>Status</th>
          <th>Optimal</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${detailed.slice(0, 15).map(run => `
          <tr>
            <td>#${run.runNumber}</td>
            <td>${run.branch}</td>
            <td>${run.durationMinutes} min</td>
            <td>${run.cache.hitRate}%</td>
            <td class="${run.conclusion === 'success' ? 'run-success' : 'run-failure'}">
              ${run.conclusion === 'success' ? '✅ Success' : '❌ Failed'}
            </td>
            <td>${run.isOptimal ? '🎯 Yes' : '❌ No'}</td>
            <td>${new Date(run.createdAt).toLocaleDateString('ja-JP')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Report generated by CI Performance Monitor</p>
    <p>For more details, check the GitHub Actions workflow logs</p>
  </div>

  <script>
    // Duration Chart
    const durationCtx = document.getElementById('durationChart').getContext('2d');
    new Chart(durationCtx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Duration (minutes)',
          data: ${JSON.stringify(chartData.durations)},
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }, {
          label: 'Target Max',
          data: Array(${chartData.durations.length}).fill().map((_, i) => ({
            x: ${JSON.stringify(chartData.durations)}[i].x,
            y: 2.5
          })),
          borderColor: 'rgb(34, 197, 94)',
          borderDash: [5, 5],
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Duration (minutes)'
            }
          }
        }
      }
    });

    // Cache Hit Rate Chart
    const cacheCtx = document.getElementById('cacheChart').getContext('2d');
    new Chart(cacheCtx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Cache Hit Rate (%)',
          data: ${JSON.stringify(chartData.cacheRates)},
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4
        }, {
          label: 'Target Min',
          data: Array(${chartData.cacheRates.length}).fill().map((_, i) => ({
            x: ${JSON.stringify(chartData.cacheRates)}[i].x,
            y: 85
          })),
          borderColor: 'rgb(251, 146, 60)',
          borderDash: [5, 5],
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Cache Hit Rate (%)'
            }
          }
        }
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Main report generation function
 */
function generateReport() {
  console.log('📈 Generating CI Performance Report');
  
  try {
    const { summary, detailed } = loadPerformanceData();
    
    const htmlReport = generateHTMLReport(summary, detailed);
    const reportPath = path.join(CONFIG.DATA_DIR, CONFIG.REPORT_FILE);
    
    fs.writeFileSync(reportPath, htmlReport);
    
    console.log(`✅ Report generated: ${reportPath}`);
    console.log('📊 Report Summary:');
    console.log(`   - Analyzed Runs: ${summary.totalRuns}`);
    console.log(`   - Average Duration: ${summary.avgDurationMinutes} minutes`);
    console.log(`   - Cache Hit Rate: ${summary.avgCacheHitRate}%`);
    console.log(`   - Performance Status: ${summary.baseline?.actualPerformance || 'unknown'}`);
    
  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Performance Report Generator

Usage: node scripts/generate-performance-report.js

Generates an HTML report from CI performance data.
The report includes charts, metrics, and analysis.

Output: reports/ci-performance/report.html
    `);
    process.exit(0);
  }
  
  generateReport();
}

module.exports = { generateReport, loadPerformanceData };