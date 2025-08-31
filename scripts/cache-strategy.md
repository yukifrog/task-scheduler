# Cache Management Strategy

## Overview

GitHub Actions provides 10GB of cache storage per repository with automatic 7-day cleanup for unused caches. This document outlines our strategy for optimal cache management.

## Current Cache Types

### 1. NPM Dependencies Cache
- **Size**: ~100-200MB
- **Key Pattern**: `npm-cache-${{ hashFiles('**/package-lock.json') }}`
- **Frequency**: Changes with dependency updates
- **Strategy**: Keep current, cleanup old versions

### 2. Playwright Browsers Cache  
- **Size**: ~95MB (Chromium only)
- **Key Pattern**: `playwright-browsers-${{ hashFiles('**/package-lock.json') }}`
- **Frequency**: Changes with Playwright version updates
- **Strategy**: Persistent cache, rarely changes

### 3. Next.js Build Cache
- **Size**: ~50-100MB
- **Key Pattern**: `nextjs-build-${{ github.sha }}`
- **Frequency**: Every commit
- **Strategy**: Keep recent builds, cleanup old commits

### 4. Prisma Client Cache
- **Size**: ~20-50MB  
- **Key Pattern**: `prisma-client-${{ hashFiles('**/schema.prisma') }}`
- **Frequency**: Changes with schema updates
- **Strategy**: Keep current schema versions

## Cache Strategy by Branch Type

### Main Branch (`main`)
- **Priority**: High - Keep all current caches
- **Retention**: Full 7-day automatic retention
- **Cleanup**: Manual cleanup only when approaching limits

### Feature Branches (`feature/*`)
- **Priority**: Medium - Keep during development
- **Retention**: Clean up after branch merge
- **Cleanup**: Automatic cleanup of merged branch caches

### Pull Request Branches  
- **Priority**: Low - Temporary caches
- **Retention**: Clean up after PR close/merge
- **Cleanup**: Aggressive cleanup of closed PR caches

## Monitoring and Alerts

### Usage Thresholds
- **Green**: < 5GB (50% of limit) - Normal operation
- **Yellow**: 5-8GB (50-80% of limit) - Monitor closely
- **Red**: > 8GB (80% of limit) - Immediate cleanup required

### Automated Monitoring
- **Weekly Reports**: Every Sunday 2:00 AM UTC
- **Critical Alerts**: When usage exceeds 8GB
- **Cleanup Actions**: Automatic old cache removal

## Cache Optimization Best Practices

### 1. Key Design
- Use content-based hashing for dependency files
- Include version identifiers for tool caches
- Avoid overly specific keys that prevent reuse

### 2. Size Optimization
- Exclude unnecessary files from caches
- Use compression where possible
- Regularly audit cache contents

### 3. Access Patterns
- Frequently accessed caches stay longer
- Optimize for common development workflows
- Consider cache warming for critical paths

## Commands and Scripts

### Manual Cache Monitoring
```bash
# Check current cache usage
./scripts/monitor-cache-usage.sh

# Get detailed cache information
gh api repos/yukifrog/task-scheduler/actions/caches
```

### Manual Cache Cleanup
```bash
# Delete specific cache by ID
gh api repos/yukifrog/task-scheduler/actions/caches/{cache_id} -X DELETE

# Trigger automated cleanup workflow
gh workflow run cache-cleanup.yml
```

### Automated Cleanup Triggers
- **Schedule**: Weekly on Sundays
- **Manual**: On-demand via workflow dispatch
- **Automatic**: When usage exceeds critical threshold

## Performance Impact

### Cache Hit Benefits
- **NPM Install**: 2-3 minutes → 30 seconds (80% faster)
- **Playwright Setup**: 1-2 minutes → 15 seconds (85% faster)  
- **Next.js Build**: 1-2 minutes → 30 seconds (75% faster)
- **Total CI Time**: ~6 minutes → ~2 minutes (65% faster)

### Cache Miss Penalties
- **Storage Overhead**: ~500MB-1GB per active branch
- **Network Transfer**: Additional upload time for cache saves
- **Cleanup Overhead**: Periodic maintenance workflows

## Future Considerations

### Scaling Strategies
- **Multi-repository**: Shared cache strategies across related projects
- **Cache Layers**: Hot/warm/cold cache tiers based on access frequency
- **Compression**: Advanced compression for larger caches

### Tool Evolution
- **Dependency Updates**: Adapt cache keys for new package managers
- **Build Tool Changes**: Update cache strategies for new build systems
- **GitHub Features**: Leverage new GitHub Actions caching features

## Troubleshooting

### Common Issues
1. **Cache Miss**: Check key patterns and file hash stability
2. **Size Limits**: Monitor usage and implement cleanup
3. **Performance**: Validate cache hit rates and access patterns

### Debug Commands
```bash
# Analyze cache effectiveness
./scripts/monitor-cache-usage.sh

# Check workflow run times
gh run list --limit 20

# Verify cache keys in workflow logs  
gh run view {run_id} --log
```

---

*Last Updated: $(date)*
*Next Review: Weekly with cache monitoring report*