#!/bin/bash

# Verification script for GitHub Workflow Scope Fix
# This script validates that the solution works correctly

set -e

echo "🔍 GitHub Workflow Scope Fix - Verification"
echo "==========================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📍 Working in: $PROJECT_ROOT"

# Step 1: Verify required files exist
echo ""
echo "📁 Checking solution files..."
required_files=(
    ".github/WORKFLOW_MODIFICATIONS.md"
    ".github/ci.env"
    "scripts/inject-ci-env.sh"
    "scripts/configure-prisma-telemetry.sh"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Step 2: Test environment injection
echo ""
echo "🧪 Testing environment injection..."
if ./scripts/inject-ci-env.sh --test >/dev/null 2>&1; then
    echo "✅ Environment injection script works"
else
    echo "❌ Environment injection script failed"
    exit 1
fi

# Step 3: Test Prisma telemetry configuration
echo ""
echo "🔧 Testing Prisma telemetry configuration..."
if ./scripts/configure-prisma-telemetry.sh >/dev/null 2>&1; then
    echo "✅ Prisma telemetry configuration script works"
else
    echo "❌ Prisma telemetry configuration script failed"
    exit 1
fi

# Step 4: Verify environment loading
echo ""
echo "🔄 Testing actual environment loading..."
source ./scripts/inject-ci-env.sh >/dev/null 2>&1

# Check if critical variables are set
if [ "$CHECKPOINT_TELEMETRY" = "0" ] && [ "$NEXT_TELEMETRY_DISABLED" = "1" ]; then
    echo "✅ Environment variables loaded correctly"
    echo "   CHECKPOINT_TELEMETRY=$CHECKPOINT_TELEMETRY"
    echo "   NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED"
else
    echo "❌ Environment variables not loaded correctly"
    exit 1
fi

# Step 5: Test linting with environment
echo ""
echo "🔍 Testing lint with configured environment..."
if npm run lint >/dev/null 2>&1; then
    echo "✅ Lint passes with configured environment"
else
    echo "❌ Lint failed with configured environment"
    exit 1
fi

# Step 6: Show summary
echo ""
echo "📋 Solution Summary:"
echo "==================="
echo "✅ GitHub token workflow scope issue documented"
echo "✅ Alternative environment-based solution implemented"
echo "✅ Manual workflow modification guide created"
echo "✅ Automated scripts for CI environment setup"
echo "✅ Prisma telemetry successfully disabled"
echo "✅ Next.js telemetry successfully disabled"
echo ""
echo "📚 Documentation files:"
echo "   - .github/WORKFLOW_MODIFICATIONS.md - Manual workflow modification guide"
echo "   - .github/ci.env - Environment variable configuration"
echo ""
echo "🔧 Script files:"
echo "   - scripts/inject-ci-env.sh - Automated environment setup"
echo "   - scripts/configure-prisma-telemetry.sh - Prisma telemetry helper"
echo ""
echo "🎯 Usage:"
echo "   Local: source ./scripts/inject-ci-env.sh"
echo "   CI: Add variables from .github/ci.env to your CI system"
echo ""
echo "🎉 Verification complete! Solution is ready to use."