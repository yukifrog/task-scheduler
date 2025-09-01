# GitHub Actions Firewall Allowlist Configuration

## Overview

This document provides instructions for configuring allowlists in GitHub Actions environments to resolve firewall restrictions that block external resource access.

## Blocked Resources

The following external resources are commonly blocked by firewall restrictions in GitHub Actions:

### Prisma Related
- `binaries.prisma.sh` (DNS block) - Prisma binary downloads
- `checkpoint.prisma.io` (DNS block) - Prisma telemetry and update checks

### GitHub API  
- `api.github.com` (HTTP block) - API calls for CI monitoring and automation

### External Assets
- `fonts.googleapis.com` (DNS block) - Google Fonts CDN used by Next.js
- `cdn.jsdelivr.net` (DNS block) - JavaScript CDN for various libraries
- `unpkg.com` (DNS block) - npm package CDN

## Solution 1: Repository Settings Allowlist (Recommended)

### Prerequisites
- Repository admin or organization owner permissions
- GitHub Copilot Enterprise or GitHub Actions advanced security features enabled

### Configuration Steps

1. **Navigate to Repository Settings**
   ```
   GitHub Repository → Settings → Actions → General
   ```

2. **Configure Network Access**
   ```
   GitHub Repository → Settings → Copilot → Coding agent settings
   ```

3. **Add Allowlist Entries**
   Add the following domains to the allowlist:
   ```
   # Prisma Infrastructure
   binaries.prisma.sh
   checkpoint.prisma.io
   
   # GitHub API
   api.github.com
   
   # External CDNs and Assets  
   fonts.googleapis.com
   fonts.gstatic.com
   cdn.jsdelivr.net
   unpkg.com
   
   # npm Registry (if needed)
   registry.npmjs.org
   ```

4. **Configure IP Ranges (if applicable)**
   ```
   # GitHub API IP ranges
   140.82.112.0/20
   185.199.108.0/22
   192.30.252.0/22
   
   # Google Fonts IP ranges
   172.217.0.0/16
   216.58.192.0/19
   ```

## Solution 2: Organization-Level Settings

### For GitHub Organizations

1. **Navigate to Organization Settings**
   ```
   GitHub Organization → Settings → Actions → General
   ```

2. **Configure Network Policies**
   ```
   Security → Network policies → Allowlist
   ```

3. **Apply to All Repositories**
   Enable organization-wide allowlist for consistent configuration across all repositories.

## Solution 3: Environment Variables (Current Implementation)

Our current implementation uses environment variables to disable external calls entirely:

```yaml
env:
  # Prisma telemetry disabling
  PRISMA_DISABLE_TELEMETRY: true
  CHECKPOINT_DISABLE: 1
  CHECKPOINT_TELEMETRY: 0
  
  # Next.js font optimization disabling  
  NEXT_FONT_GOOGLE_DISABLED: 1
  NEXT_OPTIMIZE_FONTS: false
  
  # General external call disabling
  NO_UPDATE_NOTIFIER: 1
  NPM_CONFIG_AUDIT: false
```

### Advantages
- ✅ Works without admin permissions
- ✅ No allowlist configuration required
- ✅ Faster builds (no external calls)
- ✅ More reliable in restricted environments

### Disadvantages
- ❌ Disables some optimization features
- ❌ May miss some updates and improvements
- ❌ Requires fallback implementations

## Solution 4: Self-Hosted Runners

### When to Use
- Maximum control over network access
- Persistent caching across builds
- Custom firewall/proxy configurations needed

### Configuration
```yaml
jobs:
  test:
    runs-on: self-hosted
    # Custom network configuration
```

## Testing Configuration

### Verification Commands

```bash
# Test environment variable configuration
./scripts/verify-workflow-fix.sh

# Test CI performance monitoring with mock data
npm run ci:monitor:mock

# Test build without external calls
NEXT_FONT_GOOGLE_DISABLED=1 npm run build

# Test Prisma generation offline
PRISMA_DISABLE_TELEMETRY=true npx prisma generate --no-engine
```

### Expected Results
- ✅ No DNS resolution errors for blocked domains
- ✅ Build completes without external calls
- ✅ Mock data is used for blocked API calls
- ✅ All tests pass with firewall restrictions

## Troubleshooting

### Common Issues

1. **DNS Resolution Failures**
   ```
   Error: getaddrinfo ENOTFOUND fonts.googleapis.com
   ```
   **Solution**: Enable `NEXT_FONT_GOOGLE_DISABLED=1`

2. **Prisma Binary Download Failures**
   ```
   Error: Could not download binaries from binaries.prisma.sh
   ```
   **Solution**: Use offline generation with `--no-engine` flag

3. **GitHub API Rate Limiting**
   ```
   Error: API rate limit exceeded for xxx.xxx.xxx.xxx
   ```
   **Solution**: Use mock data fallback or authenticated requests

### Debug Commands

```bash
# Check DNS resolution
nslookup fonts.googleapis.com
nslookup binaries.prisma.sh

# Test HTTP connectivity
curl -I https://api.github.com/

# Verify environment variables
env | grep -E "(PRISMA|NEXT|CHECKPOINT)"
```

## Related Files

- `.github/workflows/ci.yml` - Main CI configuration
- `.github/ci.env` - Environment variable configuration  
- `next.config.ts` - Next.js font optimization disabling
- `scripts/ci-performance-monitor.js` - Mock data fallback
- `PRISMA_TELEMETRY_IMPLEMENTATION.md` - Prisma telemetry details

## Security Considerations

### Allowlist Best Practices
- ✅ Use domain names instead of IP addresses when possible
- ✅ Regularly review and audit allowlist entries
- ✅ Apply principle of least privilege
- ✅ Document the purpose of each allowlist entry
- ✅ Use organization-level settings for consistency

### Risk Assessment
- **Low Risk**: CDN domains (fonts.googleapis.com, cdn.jsdelivr.net)
- **Medium Risk**: Package registries (registry.npmjs.org)
- **Low Risk**: GitHub API (api.github.com) for public repositories
- **Low Risk**: Tool telemetry endpoints (checkpoint.prisma.io)

## Performance Impact

### With Allowlist
- ✅ Full functionality enabled
- ✅ Font optimization works
- ✅ Real-time API data
- ❌ Potential network latency
- ❌ External dependencies

### Without Allowlist (Current Implementation)
- ✅ Faster builds (offline)
- ✅ No external dependencies
- ✅ Consistent performance
- ❌ Some features disabled
- ❌ Mock data only

## Recommendations

1. **For Production**: Use allowlist configuration for full functionality
2. **For CI/CD**: Current environment variable approach is sufficient
3. **For Development**: Use allowlist for optimal developer experience
4. **For Security-Critical**: Consider self-hosted runners with custom network policies

---

**Last Updated**: 2024-01-01  
**Maintainer**: Task Scheduler Team  
**Related Issue**: #31 - GitHub Actions Firewall Restrictions