# CI Performance Monitoring System

This document describes the comprehensive CI performance monitoring and metrics dashboard implemented to measure the effectiveness of the CI optimizations from PR #19.

## Overview

The CI performance monitoring system tracks GitHub Actions workflow execution times, cache efficiency, and overall pipeline health to ensure optimal CI performance and early detection of degradation.

### Key Features

- **Real-time Performance Metrics**: Track execution times, cache hit rates, and success rates
- **Automated Alerting**: Detect performance degradation and cache failures
- **Interactive Dashboard**: Web UI for monitoring trends and insights
- **Historical Analysis**: Track improvements and regressions over time
- **Automated Reporting**: Generate detailed HTML reports with charts and analysis

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ GitHub Actions  │───▶│ Performance      │───▶│ Analysis &      │
│ API Data        │    │ Monitor Script   │    │ Report Gen      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                 │
                                 ▼
                       ┌──────────────────┐
                       │ Web Dashboard    │
                       │ (React UI)       │
                       └──────────────────┘
```

## Components

### 1. CI Performance Monitor (`scripts/ci-performance-monitor.js`)

**Purpose**: Collects and analyzes GitHub Actions workflow performance data

**Features**:
- Fetches recent workflow runs via GitHub API
- Analyzes cache effectiveness from job steps
- Calculates performance metrics and trends
- Generates alerts for performance issues
- Stores data in JSON format for dashboard consumption

**Usage**:
```bash
# Run with live GitHub API data
npm run ci:monitor

# Run with mock data for testing
npm run ci:monitor:mock

# Help
node scripts/ci-performance-monitor.js --help
```

**Output Data Structure**:
```json
{
  "totalRuns": 20,
  "avgDuration": 141,
  "avgDurationMinutes": 2.35,
  "avgCacheHitRate": 88.4,
  "fastestRun": 90,
  "slowestRun": 204,
  "optimalRuns": 11,
  "optimalRate": 55,
  "trend": "stable",
  "alerts": [],
  "baseline": {
    "expectedDurationRange": [90, 150],
    "expectedImprovement": 60,
    "actualPerformance": "meeting-expectations"
  }
}
```

### 2. Performance Report Generator (`scripts/generate-performance-report.js`)

**Purpose**: Creates comprehensive HTML reports with charts and detailed analysis

**Features**:
- Interactive charts using Chart.js
- Performance trend visualization
- Baseline comparison against PR #19 targets
- Detailed run history tables
- Mobile-responsive design

**Usage**:
```bash
npm run ci:report
```

**Output**: `reports/ci-performance/report.html`

### 3. Web Dashboard (`src/components/CIPerformanceDashboard.tsx`)

**Purpose**: Real-time web interface for monitoring CI performance

**Features**:
- Live performance metrics display
- Alert notifications
- Baseline comparison visualization
- Recent run history
- Manual data refresh

**Access**: `/ci-performance` (requires authentication)

### 4. API Endpoints

**Summary Data**: `GET /api/ci-performance/summary`
**Detailed Data**: `GET /api/ci-performance/detailed`

Returns JSON data for dashboard consumption with fallback to mock data.

### 5. Automated Workflow (`.github/workflows/performance-monitor.yml`)

**Purpose**: Scheduled monitoring and automated alerting

**Features**:
- Runs every 6 hours automatically
- Manual trigger support
- Artifact upload for historical data
- Automatic issue creation for critical alerts
- Performance summary in workflow logs

**Triggers**:
- Scheduled: Every 6 hours
- Manual: Workflow dispatch
- On CI optimization changes

## Performance Thresholds

### Optimal Performance Criteria
- **Duration**: ≤ 2.5 minutes (target: 1.5-2.5 minutes)
- **Cache Hit Rate**: ≥ 85%
- **Success Rate**: ≥ 95%

### Alert Thresholds
- **Warning**: Duration > 5 minutes OR Cache hit rate < 85%
- **Critical**: Duration > 8 minutes OR Cache hit rate < 70% OR 3+ recent failures

### Baseline Comparison (PR #19)
- **Pre-optimization**: 4-6 minutes (expected)
- **Target**: 1.5-2.5 minutes (60% improvement)
- **Current status**: Tracked automatically

## Usage Guide

### For Developers

1. **Monitor Dashboard**: Visit `/ci-performance` to view current metrics
2. **Check Alerts**: Review any performance warnings or degradation notices
3. **Analyze Trends**: Use the dashboard to understand performance patterns

### For DevOps/Maintenance

1. **Run Manual Analysis**:
   ```bash
   npm run ci:monitor
   npm run ci:report
   ```

2. **Check Generated Reports**: 
   - Data: `reports/ci-performance/latest-summary.json`
   - Report: `reports/ci-performance/report.html`

3. **Monitor Workflow**: 
   - Go to Actions → CI Performance Monitor
   - Review automated analysis results
   - Check for performance alerts in Issues

### For CI Optimization

1. **Baseline Measurement**: Run monitoring before making changes
2. **Impact Assessment**: Compare before/after metrics
3. **Regression Detection**: Monitor for performance degradation
4. **Cache Analysis**: Identify cache misses and optimization opportunities

## Implementation Details

### Data Collection
- Uses GitHub Actions API (`/repos/owner/repo/actions/runs`)
- Analyzes job steps to determine cache effectiveness
- Focuses on critical steps: npm, Playwright, Next.js, Prisma caches
- Respects API rate limits with request throttling

### Cache Analysis
Identifies cache-related steps by name patterns:
- npm cache: `Cache npm dependencies`
- Playwright: `Cache Playwright browsers`
- Next.js: `Cache Next.js build`
- Prisma: `Cache Prisma client`

### Performance Calculations
- **Duration**: Total workflow runtime (start to completion)
- **Cache Hit Rate**: Percentage of cache steps that succeeded
- **Optimal Run**: Meets both duration and cache criteria
- **Trend Analysis**: Compares recent vs. historical performance

### Error Handling
- Graceful API failure handling
- Fallback to mock data for development
- Comprehensive error logging
- Retry logic for transient failures

## Configuration

### Environment Variables
```bash
# GitHub API (optional for public repos)
GITHUB_TOKEN=<your_token>

# Configuration overrides
CI_MONITOR_MAX_RUNS=50
CI_MONITOR_CACHE_THRESHOLD=85
CI_MONITOR_DURATION_THRESHOLD=300
```

### File Locations
- Data: `reports/ci-performance/`
- Scripts: `scripts/ci-performance-*`
- Components: `src/components/CIPerformanceDashboard.tsx`
- Workflows: `.github/workflows/performance-monitor.yml`

## Troubleshooting

### Common Issues

1. **"API rate limit exceeded"**
   - Add `GITHUB_TOKEN` environment variable
   - Reduce `MAX_RUNS` in configuration

2. **"Performance data not found"**
   - Run `npm run ci:monitor:mock` first
   - Check file permissions in `reports/` directory

3. **Dashboard shows "Failed to load"**
   - Verify API endpoints are accessible
   - Check browser console for errors
   - Ensure authentication is working

4. **"Network connectivity issues" / "ENOTFOUND api.github.com"**
   - Configure Repository Custom Allowlist (see below)
   - Test connectivity: `npm run test:network-connectivity`
   - Verify firewall/network restrictions

### Debug Commands
```bash
# Test network connectivity first
npm run test:network-connectivity

# Test with verbose output
node scripts/ci-performance-monitor.js --verbose

# Test API endpoints
curl http://localhost:3001/api/ci-performance/summary

# Validate configuration
npm run ci:monitor -- --help

# Test specific host connectivity
node scripts/test-network-connectivity.js --host=api.github.com --verbose
```

### Network Connectivity Requirements

The CI performance monitoring system requires network access to:
- `api.github.com` - GitHub API for workflow data
- Additional hosts for full functionality (see Custom Allowlist configuration)

**If experiencing network connectivity issues:**
1. Test connectivity: `npm run test:network-connectivity`
2. Configure Repository Custom Allowlist: [CUSTOM_ALLOWLIST_CONFIGURATION.md](CUSTOM_ALLOWLIST_CONFIGURATION.md)
3. Verify all required hosts are allowlisted

## Future Enhancements

- **Historical Trending**: Long-term performance analysis
- **Slack/Discord Integration**: Real-time alert notifications
- **Custom Metrics**: User-defined performance criteria
- **A/B Testing**: Compare different CI configurations
- **Cost Analysis**: Track GitHub Actions minutes usage

## Related Documentation

- [CI Caching Strategy](.github/CACHING_STRATEGY.md)
- [Custom Allowlist Configuration](.github/CUSTOM_ALLOWLIST_CONFIGURATION.md) ⭐ **New**
- [GitHub Actions Optimization](README.md#cicd-optimization)
- [Performance Validation](scripts/validate-ci-cache.sh)
- [Network Connectivity Testing](scripts/test-network-connectivity.js)

## Support

For issues or questions:
1. Check GitHub Issues for known problems
2. Review workflow logs in GitHub Actions
3. Run diagnostic commands listed above
4. Create an issue with relevant logs and configuration