# Quick Reference: Repository Custom Allowlist

## Quick Setup ⚡

### 1. Access Settings
🔗 **URL**: https://github.com/yukifrog/task-scheduler/settings
🔑 **Required**: Repository admin permissions

### 2. Navigate to Allowlist
📍 **Path**: Settings → Copilot coding agent → Custom allowlist

### 3. Add Required Hosts
```
binaries.prisma.sh
checkpoint.prisma.io
api.github.com
fonts.googleapis.com
```

### 4. Test Configuration
```bash
npm run test:network-connectivity
```

## Expected Results ✅

**Before Configuration**:
- ❌ 4/4 hosts blocked
- ❌ Critical CI failures
- ❌ Performance monitoring disabled

**After Configuration**:
- ✅ 4/4 hosts accessible  
- ✅ CI pipeline stability
- ✅ Performance monitoring active

## Quick Verification

### Test Individual Host
```bash
# Test specific host
node scripts/test-network-connectivity.js --host=api.github.com

# Verbose output
npm run test:network-connectivity -- --verbose
```

### CI Pipeline Test
```bash
# Trigger CI test
git commit --allow-empty -m "Test allowlist configuration"
git push
```

## Troubleshooting 🔧

| Issue | Solution |
|-------|----------|
| "Host not recognized" | Check format: no `https://`, no paths |
| "Changes not applied" | Wait 5-10 minutes, trigger new workflow |
| "Partial access" | Verify all 4 hosts are correctly entered |

## Support 📞

**Documentation**: [CUSTOM_ALLOWLIST_CONFIGURATION.md](CUSTOM_ALLOWLIST_CONFIGURATION.md)
**Network Test**: `npm run test:network-connectivity`
**CI Monitoring**: [CI_PERFORMANCE_MONITORING.md](CI_PERFORMANCE_MONITORING.md)

---
**Impact**: Fixes Issue #34 - Repository Custom Allowlist設定でFirewall制限緩和