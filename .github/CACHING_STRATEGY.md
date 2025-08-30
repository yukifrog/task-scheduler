# GitHub Actions CI Optimization

This document explains the caching optimizations implemented to reduce CI pipeline execution time, particularly focusing on Playwright browser installation and dependency management.

## 🚀 Performance Improvements

### Before Optimization
- **Playwright Installation**: Downloaded all browsers (chromium, firefox, webkit, ffmpeg) every run (~200-500MB)
- **npm ci**: Downloaded all dependencies from scratch every run 
- **Build Time**: Next.js built from scratch every run
- **Prisma**: Generated client from scratch every run
- **Duplicate Work**: Both test and security jobs ran `npm ci` independently

### After Optimization
- **Playwright**: Only installs chromium (as per config), caches browsers between runs
- **npm Dependencies**: Aggressive caching with fallback keys
- **Next.js Build**: Caches build artifacts and intermediate files
- **Prisma Client**: Caches generated client based on schema changes
- **Shared Caching**: Cache is shared between jobs where possible

## 🔧 Caching Strategies Implemented

### 1. Playwright Browser Caching
```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-browsers-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}
```

**Key Features:**
- Only installs chromium browser (saves ~70% download time)
- Caches based on Playwright version (automatic cache invalidation on updates)
- Separates browser download from system dependencies installation
- Cache hit: ~5 seconds vs Cache miss: ~60-120 seconds

### 2. Enhanced npm Caching
```yaml
- name: Cache npm dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```

**Key Features:**
- Caches both npm cache and node_modules
- Uses `--prefer-offline --no-audit` for faster installs
- Multiple restore keys for better cache hit rates
- Cache hit: ~10 seconds vs Cache miss: ~30-60 seconds

### 3. Next.js Build Caching
```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: ${{ github.workspace }}/.next/cache
    key: nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.[jt]s?(x)', '**/*.css', '**/*.scss') }}
```

**Key Features:**
- Caches Next.js build artifacts
- Invalidates cache when source files change
- Significantly faster incremental builds
- Cache hit: ~20 seconds vs Cache miss: ~60-90 seconds

### 4. Prisma Client Caching
```yaml
- name: Cache Prisma client
  uses: actions/cache@v4
  with:
    path: |
      node_modules/.prisma
      node_modules/@prisma/client
    key: prisma-${{ runner.os }}-${{ hashFiles('prisma/schema.prisma') }}-${{ hashFiles('**/package-lock.json') }}
```

**Key Features:**
- Caches generated Prisma client
- Invalidates when schema.prisma changes
- Reduces generation time on cache hits
- Cache hit: ~2 seconds vs Cache miss: ~10-15 seconds

## 📊 Expected Performance Gains

| Component | Before (Cache Miss) | After (Cache Hit) | Time Saved |
|-----------|-------------------|------------------|------------|
| Playwright Install | 60-120s | 5-10s | ~85% faster |
| npm Dependencies | 30-60s | 10-15s | ~70% faster |
| Next.js Build | 60-90s | 20-30s | ~65% faster |
| Prisma Generation | 10-15s | 2-5s | ~70% faster |
| **Total Pipeline** | **4-6 minutes** | **1.5-2.5 minutes** | **~60% faster** |

## 🎯 Optimization Details

### Browser-Specific Optimizations
The original configuration used `npx playwright install --with-deps` which downloads all browsers:
- chromium (~95MB)
- firefox (~85MB) 
- webkit (~75MB)
- ffmpeg (~15MB)

**Total: ~270MB**

Since `playwright.config.ts` only configures chromium:
```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
],
```

We optimized to only install chromium: **~95MB (65% reduction)**

### Cache Key Strategy
Cache keys are carefully designed to balance hit rate with freshness:

1. **Playwright**: Version-based (perfect invalidation)
2. **npm**: package-lock.json hash (dependency changes)
3. **Next.js**: Source code hash (code changes)
4. **Prisma**: Schema hash (database schema changes)

### Fallback Strategy
Multi-level restore keys ensure maximum cache utilization:
```yaml
restore-keys: |
  npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
  npm-${{ runner.os }}-
```

## 🔍 Testing the Optimizations

### Manual Testing Workflow
A test workflow (`test-cache.yml`) is provided for validation:
```bash
# Trigger manual test
gh workflow run test-cache.yml
```

### Monitoring Cache Effectiveness
Check workflow logs for cache hit/miss indicators:
- ✅ "NPM cache hit! 🎉"
- ✅ "Playwright cache hit! 🎉" 
- ❌ "NPM cache miss 😢"
- ❌ "Playwright cache miss 😢"

## 🚨 Considerations

### Cache Storage Limits
- GitHub Actions provides 10GB cache storage per repository
- Caches are evicted after 7 days of no access
- Total cache size for this project: ~500MB-1GB

### Cache Invalidation
Caches automatically invalidate when:
- Dependencies change (package-lock.json)
- Source code changes (for build cache)
- Playwright version updates
- Database schema changes

### Fallback Behavior
If caches are unavailable:
- Workflow falls back to full installation
- Performance degrades gracefully
- No functionality is lost

## 📈 Monitoring

To monitor cache effectiveness:
1. Check workflow execution times in GitHub Actions
2. Look for cache hit/miss messages in logs
3. Monitor overall pipeline duration trends
4. Watch for any test failures that might indicate cache issues