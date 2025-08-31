# GitHub Workflow Scope Issue - Manual Modification Guide

## Problem

GitHub tokens require the `workflow` scope to modify files in `.github/workflows/`. This prevents automated modifications to CI workflow files when the token lacks sufficient permissions.

## Error Message
```
! [remote rejected] fix/issue-21-prisma-telemetry -> fix/issue-21-prisma-telemetry 
(refusing to allow an OAuth App to create or update workflow `.github/workflows/ci.yml` without `workflow` scope)
```

## Complete Prisma Telemetry Disabling Implementation

The CI workflow needs the following environment variables for complete Prisma telemetry and binary cache optimization:

```yaml
env:
  # Shared environment variables
  DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
  NEXTAUTH_SECRET: test_secret_key_for_ci
  NEXTAUTH_URL: http://localhost:3001
  
  # Prisma完全無効化設定
  PRISMA_DISABLE_TELEMETRY: true
  PRISMA_SKIP_POSTINSTALL_GENERATE: true
  PRISMA_QUERY_ENGINE_BINARY_CACHE_DIR: ./prisma-cache
  PRISMA_HIDE_HINTS: true
  CHECKPOINT_DISABLE: 1
  CHECKPOINT_TELEMETRY: 0
  
  # Next.js telemetry disable
  NEXT_TELEMETRY_DISABLED: 1
```

## Required Changes for Complete Implementation

### Step 1: Update CI Workflow Environment Variables

Edit `.github/workflows/ci.yml` and update the `env:` section to include all Prisma telemetry disabling variables as shown above.

### Step 2: Update Prisma Binary Caching

Replace the existing Prisma cache configuration with optimized binary caching:

```yaml
      # Cache Prisma binaries and client 
      - name: Cache Prisma binaries
        uses: actions/cache@v4
        with:
          path: |
            ./prisma-cache
            node_modules/.prisma
            node_modules/@prisma/client
          key: prisma-binaries-${{ runner.os }}-${{ hashFiles('prisma/schema.prisma') }}
          restore-keys: |
            prisma-binaries-${{ runner.os }}-

      - name: Generate Prisma client (offline)
        run: |
          export PRISMA_DISABLE_TELEMETRY=true
          export CHECKPOINT_DISABLE=1
          export CHECKPOINT_TELEMETRY=0
          npx prisma generate --no-engine
        env:
          DATABASE_URL: ${{ env.DATABASE_URL }}
```

### Step 3: Update package.json Scripts

Add optimized Prisma scripts to `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate --no-engine",
    "prisma:generate": "prisma generate --no-engine"
  }
}
```

## Solutions for GitHub Token Scope

### Option 1: Update GitHub Token (Recommended)
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Edit the existing token or create a new one
3. Enable the `workflow` scope
4. Update the token in your CI/CD configuration

### Option 2: Use GitHub CLI with Workflow Scope
```bash
gh auth login --scopes "repo,workflow"
```

### Option 3: Use GitHub App with Workflow Permissions
Create a GitHub App with the following permissions:
- Contents: Read & Write
- Actions: Write
- Workflows: Write

## Testing the Changes

After applying the manual changes:

1. **Test locally:**
   ```bash
   export CHECKPOINT_TELEMETRY=0
   npm run test
   ```

2. **Verify in CI:**
   - Push the modified workflow file
   - Check CI logs for Prisma telemetry messages
   - Should see reduced or no telemetry output

## Prevention

To avoid this issue in the future:
1. Ensure tokens have appropriate scopes before workflow modifications
2. Consider using environment-based configuration instead of workflow modifications
3. Document required scopes in project documentation

## Related Files

- `.github/workflows/ci.yml` - Main CI workflow
- `.github/workflows/test-cache.yml` - Cache testing workflow
- `package.json` - Project dependencies and scripts
- `prisma/schema.prisma` - Database schema