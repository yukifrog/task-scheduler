#!/bin/bash

# GitHub Actions Cache Usage Monitor
# Monitors and reports cache usage statistics for CI optimization

set -e

echo "🔍 GitHub Actions Cache Usage Monitor"
echo "====================================="

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI not authenticated. Please run:"
    echo "   gh auth login"
    exit 1
fi

# Allow repository to be set via first argument, default to yukifrog/task-scheduler
REPO="${1:-yukifrog/task-scheduler}"

if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo "Usage: $0 [owner/repo]"
    echo "  owner/repo: GitHub repository (default: yukifrog/task-scheduler)"
    exit 0
fi
echo "📊 Fetching cache data for ${REPO}..."
echo ""

# Get cache list in JSON format
cache_data=$(gh api repos/${REPO}/actions/caches 2>/dev/null || echo '{"actions_caches":[]}')

# Parse and display cache information
total_caches=$(echo "$cache_data" | jq '.actions_caches | length')
total_size=0

if [ "$total_caches" -eq 0 ]; then
    echo "ℹ️  No caches found in repository"
else
    echo "📋 Cache Summary:"
    echo "  Total caches: $total_caches"
    echo ""
    
    echo "💾 Cache Details:"
    echo "$cache_data" | jq -r '.actions_caches[] | 
        "  🗂️  Key: \(.key)
        📏 Size: \(.size_in_bytes | . / 1024 / 1024 | floor)MB
        📅 Created: \(.created_at[:10])
        🔄 Last accessed: \(.last_accessed_at[:10])
        🏷️  Ref: \(.ref)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"'
    
    # Calculate total size
    total_size=$(echo "$cache_data" | jq '[.actions_caches[].size_in_bytes] | add // 0')
    total_size_mb=$((total_size / 1024 / 1024))
    
    echo ""
    echo "📊 Usage Statistics:"
    echo "  Total size: ${total_size_mb}MB"
    echo "  GitHub limit: 10GB per repository"
    echo "  Usage: $(echo "scale=1; $total_size_mb * 100 / 10240" | bc -l)%"
    
    # Warnings
    if [ "$total_size_mb" -gt 8192 ]; then
        echo "  ⚠️  WARNING: Cache usage over 8GB (80% of limit)"
    elif [ "$total_size_mb" -gt 5120 ]; then
        echo "  🟡 CAUTION: Cache usage over 5GB (50% of limit)"
    else
        echo "  ✅ Cache usage within acceptable limits"
    fi
fi

echo ""
echo "🔧 Cache Management Commands:"
echo "  List caches:   gh api repos/${REPO}/actions/caches"
echo "  Delete cache:  gh api repos/${REPO}/actions/caches/{cache_id} -X DELETE"
echo ""
echo "📝 Notes:"
echo "  - Caches are automatically deleted after 7 days of no access"
echo "  - Each repository has a 10GB cache limit"
echo "  - Caches are shared across branches but isolated by key"

# Generate cleanup script if caches exist
if [ "$total_caches" -gt 0 ]; then
    echo ""
    echo "🛠️  Generating cleanup commands..."
    
    # Get old caches (older than 7 days)
    # Portable "7 days ago" calculation for GNU and BSD date
    if date --version >/dev/null 2>&1; then
        # GNU date
        seven_days_ago=$(date -d '7 days ago' -u +%Y-%m-%dT%H:%M:%SZ)
    else
        # BSD date (macOS)
        seven_days_ago=$(date -u -v-7d +%Y-%m-%dT%H:%M:%SZ)
    fi
    old_caches=$(echo "$cache_data" | jq -r --arg cutoff "$seven_days_ago" '
        .actions_caches[] | 
        select(.last_accessed_at < $cutoff) | 
        "gh api repos/'${REPO}'/actions/caches/\(.id) -X DELETE  # \(.key) - Last accessed: \(.last_accessed_at[:10])"')
    
    if [ -n "$old_caches" ]; then
        echo "🗑️  Old caches (>7 days since last access):"
        echo "$old_caches"
        echo ""
        echo "💡 Run these commands to clean up old caches manually"
    else
        echo "✅ No old caches found - automatic cleanup is working"
    fi
fi

echo ""
echo "✨ Cache monitoring completed!"