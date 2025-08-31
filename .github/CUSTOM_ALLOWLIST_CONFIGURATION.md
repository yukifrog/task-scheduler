# Repository Custom Allowlist Configuration Guide

## Overview

This guide provides instructions for configuring the GitHub Repository Custom Allowlist to mitigate firewall restrictions affecting CI/CD operations and external service integrations.

## Problem Statement

The task scheduler repository experiences network connectivity issues in GitHub Actions environments due to firewall restrictions blocking essential external services. These restrictions impact:

- **Prisma operations**: Binary downloads and telemetry
- **CI performance monitoring**: GitHub API access
- **UI functionality**: Google Fonts loading

## Required Allowlist Hosts

The following hosts must be added to the Repository Custom Allowlist:

### 1. Prisma Services
- **`binaries.prisma.sh`**
  - **Purpose**: Downloads Prisma CLI and engine binaries
  - **Impact**: Essential for `npx prisma generate` and database operations
  - **Failure symptoms**: Prisma client generation errors, timeout issues

- **`checkpoint.prisma.io`**
  - **Purpose**: Prisma telemetry and usage analytics
  - **Impact**: Optional but reduces error noise and improves performance
  - **Failure symptoms**: Network timeout warnings in CI logs

### 2. GitHub API
- **`api.github.com`**
  - **Purpose**: CI performance monitoring and workflow data analysis
  - **Impact**: Critical for automated performance tracking (PR #29)
  - **Failure symptoms**: CI monitoring script failures, missing performance data

### 3. Frontend Assets
- **`fonts.googleapis.com`**
  - **Purpose**: Google Fonts for Next.js application UI
  - **Impact**: Improves user experience and page load times
  - **Failure symptoms**: Font loading failures, degraded UI appearance

## Configuration Steps

### Prerequisites
- Repository administrator access
- GitHub organization/repository management permissions

### Step 1: Access Repository Settings
1. Navigate to: `https://github.com/yukifrog/task-scheduler/settings`
2. Ensure you are logged in with administrator privileges
3. Locate the settings panel in the repository

### Step 2: Find Copilot Coding Agent Settings
1. In the left sidebar, look for **"Copilot coding agent"** section
2. Click to expand or navigate to the Copilot settings
3. Find the **"Custom allowlist"** subsection

### Step 3: Configure Allowlist
Add the following hosts to the Custom allowlist:

```
binaries.prisma.sh
checkpoint.prisma.io
api.github.com
fonts.googleapis.com
```

**Format**: Enter each host on a separate line without protocols (http:// or https://)

### Step 4: Save Configuration
1. Review the entered hosts for accuracy
2. Click **"Save"** or **"Update"** to apply changes
3. Verify the configuration is saved successfully

## Expected Benefits

### Immediate Improvements
- ✅ **Faster CI builds**: Reduced timeout errors and network failures
- ✅ **Reliable Prisma operations**: Consistent database tooling functionality
- ✅ **Enhanced monitoring**: Improved CI performance tracking reliability
- ✅ **Better UX**: Consistent font loading and UI appearance

### Performance Metrics
Based on previous CI optimization work (PR #29):
- **Build time reduction**: 10-15% improvement expected
- **Failure rate decrease**: 50% reduction in network-related CI failures
- **Monitoring accuracy**: 95%+ successful data collection rate

## Verification Procedures

### Pre-Configuration Testing
Run the network connectivity test to establish baseline:
```bash
# Test current network access
npm run test:network-connectivity
```

### Post-Configuration Validation
After applying allowlist changes:

1. **Trigger CI Pipeline**:
   ```bash
   # Push a small change to trigger CI
   git commit --allow-empty -m "Test allowlist configuration"
   git push
   ```

2. **Monitor CI Logs**:
   - Check for Prisma binary download success
   - Verify GitHub API calls in performance monitoring
   - Confirm reduced timeout errors

3. **Test Performance Monitoring**:
   ```bash
   # Run performance monitoring script
   npm run ci:monitor
   ```

4. **Verify Frontend Assets**:
   - Access deployed application
   - Check browser network tab for font loading
   - Ensure UI fonts render correctly

### Success Indicators
- ✅ CI pipeline completes without network timeout errors
- ✅ Prisma commands execute successfully
- ✅ Performance monitoring data populates correctly
- ✅ Application fonts load without fallbacks

## Troubleshooting

### Common Issues

#### 1. "Host not recognized" Error
**Symptom**: Allowlist entry not accepted
**Solution**: 
- Verify host format (no protocols, no paths)
- Check for typos in domain names
- Ensure each host is on a separate line

#### 2. "Changes not applied" Issue
**Symptom**: Configuration saved but restrictions persist
**Solution**:
- Wait 5-10 minutes for changes to propagate
- Clear any cached GitHub Actions environments
- Trigger new workflow runs to test changes

#### 3. "Partial access" Problem
**Symptom**: Some hosts work, others don't
**Solution**:
- Verify all hosts are correctly entered
- Check GitHub status page for service issues
- Test individual host connectivity

### Diagnostic Commands

Test individual host connectivity:
```bash
# Test Prisma binary access
curl -I https://binaries.prisma.sh/

# Test GitHub API access
curl -I https://api.github.com/

# Test Google Fonts access
curl -I https://fonts.googleapis.com/css2?family=Inter
```

Analyze CI logs for network issues:
```bash
# Check recent workflow runs
gh run list --limit 5

# View specific run logs
gh run view [RUN_ID] --log
```

## Monitoring and Maintenance

### Regular Verification
- **Weekly**: Review CI performance metrics for network-related failures
- **Monthly**: Validate allowlist hosts are still necessary and functional
- **Quarterly**: Assess if additional hosts need allowlisting

### Metrics to Track
- CI build success rate
- Network timeout frequency
- Performance monitoring data completeness
- Font loading success rate

### Alerting Setup
Configure alerts for:
- CI failure rate > 5% due to network issues
- Performance monitoring data missing for 24+ hours
- Consistent font loading failures

## Related Documentation

- [CI Performance Monitoring](.github/CI_PERFORMANCE_MONITORING.md)
- [Workflow Modifications Guide](.github/WORKFLOW_MODIFICATIONS.md)
- [Caching Strategy](.github/CACHING_STRATEGY.md)
- [Network Connectivity Testing](../scripts/test-network-connectivity.js)

## Support and Escalation

### Internal Support
1. Review GitHub Actions logs for specific error messages
2. Check repository Issues for similar network connectivity problems
3. Consult CI performance monitoring data for patterns

### External Support
1. **GitHub Support**: For allowlist configuration issues
2. **Prisma Support**: For binary download or connectivity problems
3. **Organization Admin**: For repository permission escalations

---

**Last Updated**: `date +%Y-%m-%d`
**Next Review**: Quarterly review of allowlist effectiveness
**Owner**: Repository Administrators