#!/bin/bash

# Prisma Telemetry Configuration Script
# This script provides an alternative to modifying CI workflows
# when GitHub tokens lack the 'workflow' scope

set -e

echo "🔧 Prisma Telemetry Configuration Helper"
echo "======================================="

# Check if we're in a CI environment
if [ "${CI}" = "true" ]; then
    echo "📍 Running in CI environment"
    
    # Set Prisma telemetry environment variable if not already set
    if [ -z "${CHECKPOINT_TELEMETRY}" ]; then
        export CHECKPOINT_TELEMETRY=0
        echo "✅ Set CHECKPOINT_TELEMETRY=0 to disable Prisma telemetry"
    else
        echo "ℹ️ CHECKPOINT_TELEMETRY already set to: ${CHECKPOINT_TELEMETRY}"
    fi
    
    # Verify the setting
    echo "🔍 Current Prisma telemetry setting: ${CHECKPOINT_TELEMETRY}"
    
else
    echo "📍 Running in local development environment"
    
    # Check if environment variable is set
    if [ -z "${CHECKPOINT_TELEMETRY}" ]; then
        echo "⚠️ CHECKPOINT_TELEMETRY not set"
        echo "💡 To disable Prisma telemetry, run:"
        echo "   export CHECKPOINT_TELEMETRY=0"
        echo ""
        echo "💡 To make it permanent, add to your shell profile:"
        echo "   echo 'export CHECKPOINT_TELEMETRY=0' >> ~/.bashrc"
        echo "   echo 'export CHECKPOINT_TELEMETRY=0' >> ~/.zshrc"
    else
        echo "✅ CHECKPOINT_TELEMETRY set to: ${CHECKPOINT_TELEMETRY}"
    fi
fi

# Function to check if Prisma generates telemetry
check_prisma_telemetry() {
    echo ""
    echo "🔍 Testing Prisma telemetry behavior..."
    
    # Create a temporary directory for testing
    temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Try to run a simple Prisma command and capture output
    if command -v npx >/dev/null 2>&1; then
        echo "📦 Running Prisma version check..."
        CHECKPOINT_TELEMETRY=0 npx prisma --version 2>&1 | grep -i "telemetry\|analytics\|tracking" || echo "✅ No telemetry output detected"
    else
        echo "⚠️ npx not available, skipping telemetry test"
    fi
    
    # Clean up
    cd - >/dev/null
    rm -rf "$temp_dir"
}

# Run telemetry check if requested
if [ "$1" = "--test" ]; then
    check_prisma_telemetry
fi

echo ""
echo "✨ Prisma telemetry configuration complete!"
echo ""
echo "📚 For more information, see:"
echo "   - .github/WORKFLOW_MODIFICATIONS.md"
echo "   - https://www.prisma.io/docs/reference/environment-variables-reference#checkpoint_telemetry"