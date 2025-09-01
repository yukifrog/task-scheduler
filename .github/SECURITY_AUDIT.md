# Security Audit Workflow

This document describes the automated security audit workflow that runs daily to check for vulnerabilities in project dependencies.

## Overview

The Daily Security Audit workflow automatically scans the project dependencies for security vulnerabilities using `npm audit`. It runs daily at 2 AM UTC and provides comprehensive reporting and alerting for any discovered issues.

## Workflow Features

### 🕐 Scheduled Execution
- **Schedule**: Daily at 2 AM UTC (`cron: '0 2 * * *'`)
- **Manual Trigger**: Available via GitHub Actions UI with configurable audit levels

### 🔍 Security Scanning
- **Tool**: npm audit with configurable severity levels
- **Default Level**: moderate (can be overridden for manual runs)
- **Supported Levels**: low, moderate, high, critical

### 📊 Reporting
- **JSON Output**: Machine-readable audit results for automation
- **Human-Readable**: Standard npm audit output for manual review
- **Summary Report**: Markdown summary with vulnerability counts and metadata

### 🚨 Alerting
- **Critical/High Vulnerabilities**: Automatically creates GitHub issues
- **Workflow Failure**: Fails the workflow to ensure visibility
- **Artifact Upload**: Stores audit reports for 30 days

## Workflow Outputs

### Artifacts
- `security-audit-report-{run_number}/audit-report.json` - JSON audit results
- `security-audit-report-{run_number}/audit-report.txt` - Human-readable audit results  
- `security-audit-report-{run_number}/summary.md` - Audit summary report

### GitHub Issues
When critical or high severity vulnerabilities are detected, the workflow automatically creates a GitHub issue with:
- Vulnerability summary by severity level
- Direct links to audit reports
- Recommended remediation steps
- Labels: `security`, `vulnerability`, `critical`, `audit`

## Configuration

### Environment Variables
The workflow uses consistent environment variables with the main CI pipeline:
```yaml
env:
  PRISMA_DISABLE_TELEMETRY: true
  NEXT_TELEMETRY_DISABLED: 1
  CHECKPOINT_DISABLE: 1
```

### Manual Execution
You can manually trigger the workflow with different audit levels:
1. Go to Actions → Daily Security Audit
2. Click "Run workflow"
3. Select desired audit level (low/moderate/high/critical)

## Usage

### Testing the Workflow
```bash
# Test the workflow logic and validation
npm run security:test

# Manually run npm audit
npm audit --audit-level moderate
```

### Responding to Security Alerts
1. **Review the Issue**: Check the automatically created GitHub issue for vulnerability details
2. **Download Reports**: Access detailed audit reports from workflow artifacts
3. **Fix Vulnerabilities**: 
   ```bash
   # Automatic fixes (where possible)
   npm audit fix
   
   # Manual review and updates
   npm audit
   npm update [package-name]
   ```
4. **Verify Fix**: Re-run the workflow manually to confirm vulnerabilities are resolved

## Integration

### CI/CD Pipeline
- The security audit workflow runs independently of the main CI pipeline
- Uses shared caching strategies for faster execution
- Consistent with existing project patterns and environment setup

### Notifications
- Issues are automatically created for critical/high vulnerabilities
- Issue titles include date and vulnerability count for easy tracking
- Labels enable filtering and automated processing

## Performance

### Caching
- npm dependencies cached for faster execution
- Reuses cache keys consistent with main CI workflow
- Minimal impact on GitHub Actions compute minutes

### Execution Time
- Typical runtime: 1-3 minutes (depending on cache state)
- Parallel execution with main CI when triggered by commits

## Troubleshooting

### Common Issues

**Workflow not triggering**
- Check cron syntax in workflow file
- Verify workflow is enabled in repository settings

**False positives**
- Review audit level configuration
- Consider using `npm audit fix` for automatic resolution
- Update dependencies to latest versions

**Missing reports**
- Check workflow logs for execution errors
- Verify artifacts are uploaded correctly
- Ensure sufficient disk space for reports

### Debug Mode
For troubleshooting, manually trigger the workflow with verbose logging enabled.

## Maintenance

### Regular Updates
- Monitor for new npm audit features and CLI changes
- Update Node.js version in workflow as needed
- Review and adjust audit level thresholds based on project needs

### Workflow Improvements
The workflow can be extended with:
- Integration with security scanning tools (CodeQL, Snyk, etc.)
- Slack/Discord notifications
- Custom vulnerability filtering
- Dependency update automation