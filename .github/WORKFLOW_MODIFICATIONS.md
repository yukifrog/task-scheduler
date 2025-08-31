# GitHub Workflow Scope Issue - Manual Modification Guide

## Problem

GitHub tokens require the `workflow` scope to modify files in `.github/workflows/`. This prevents automated modifications to CI workflow files when the token lacks sufficient permissions.

## Error Message
```
! [remote rejected] fix/issue-21-prisma-telemetry -> fix/issue-21-prisma-telemetry 
(refusing to allow an OAuth App to create or update workflow `.github/workflows/ci.yml` without `workflow` scope)
```

## Required Changes for Prisma Telemetry

The CI workflow needs the following environment variable to disable Prisma telemetry:

```yaml
env:
  # Existing environment variables
  DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
  NEXTAUTH_SECRET: test_secret_key_for_ci
  NEXTAUTH_URL: http://localhost:3001
  # Add this line to disable Prisma telemetry
  CHECKPOINT_TELEMETRY: 0
```

## Manual Steps to Apply Changes

### Step 1: Add Prisma Telemetry Environment Variable

Edit `.github/workflows/ci.yml` and add `CHECKPOINT_TELEMETRY: 0` to the `env:` section at the top of the file:

```yaml
env:
  # Shared environment variables
  DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
  NEXTAUTH_SECRET: test_secret_key_for_ci
  NEXTAUTH_URL: http://localhost:3001
  CHECKPOINT_TELEMETRY: 0  # ← Add this line
```

### Step 2: Alternative - Set per Job

If global environment variable doesn't work, add it to specific jobs:

```yaml
jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    env:
      CHECKPOINT_TELEMETRY: 0  # Add this line
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