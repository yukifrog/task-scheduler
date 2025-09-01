#!/bin/bash

# Security Pattern Detection Script
# Checks for hardcoded secrets, passwords, and keys in source code

set -e

echo "🔍 Security Pattern Detection"
echo "============================="

# Exit codes
SECURITY_ISSUES_FOUND=0

# Directory to scan (exclude node_modules, build artifacts, tests)
SCAN_DIRS="src/"

# Security patterns to detect - basic grep patterns
PATTERNS=(
    "password.*="
    "secret.*="
    "key.*="
    "token.*="
    "apiKey.*="
    "api_key.*="
    "apikey.*="
    "auth_token.*="
    "access_token.*="
)

# File extensions to scan
FILE_EXTENSIONS="-name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx'"

echo "📁 Scanning directories: $SCAN_DIRS"
echo "🎯 File types: TypeScript, JavaScript, TSX, JSX"
echo ""

# Function to check if a line contains environment variable usage (allowed)
is_env_usage() {
    local line="$1"
    # Allow process.env.*, environment variable references
    if echo "$line" | grep -q "process\.env\." || echo "$line" | grep -q "env\." || echo "$line" | grep -q "process\.env\["; then
        return 0  # Is environment usage (allowed)
    fi
    return 1  # Not environment usage
}

# Function to check if a line is a false positive
is_false_positive() {
    local line="$1"
    # React key props
    if echo "$line" | grep -q "key={" || echo "$line" | grep -q "key=" | grep -q "className"; then
        return 0  # Is false positive
    fi
    # NextAuth token handling (allowed)
    if echo "$line" | grep -q "token\." || echo "$line" | grep -q "session" | grep -q "token"; then
        return 0  # Is false positive 
    fi
    return 1  # Not false positive
}

# Scan for each pattern
for pattern in "${PATTERNS[@]}"; do
    echo "🔍 Checking pattern: $pattern"
    
    # Find files and search for pattern using a direct approach
    MATCHES=""
    for ext in "*.ts" "*.tsx" "*.js" "*.jsx"; do
        matches_for_ext=$(find $SCAN_DIRS -name "$ext" -type f 2>/dev/null | xargs grep -Hn -i "$pattern" 2>/dev/null || true)
        if [ -n "$matches_for_ext" ]; then
            MATCHES="$MATCHES$matches_for_ext\n"
        fi
    done
    
    if [ -n "$MATCHES" ]; then
        # Check each match to see if it's environment variable usage or false positive
        REAL_ISSUES=""
        while IFS= read -r match; do
            if [ -n "$match" ] && ! is_env_usage "$match" && ! is_false_positive "$match"; then
                REAL_ISSUES="$REAL_ISSUES$match\n"
            fi
        done <<< "$MATCHES"
        
        if [ -n "$REAL_ISSUES" ]; then
            echo "❌ Security issue found:"
            echo -e "$REAL_ISSUES"
            SECURITY_ISSUES_FOUND=1
            
            # GitHub Actions annotation for error
            if [ "$GITHUB_ACTIONS" = "true" ]; then
                echo "::error::Security pattern detected: $pattern"
                while IFS= read -r match; do
                    if [ -n "$match" ]; then
                        FILE=$(echo "$match" | cut -d: -f1)
                        LINE=$(echo "$match" | cut -d: -f2)
                        CONTENT=$(echo "$match" | cut -d: -f3-)
                        echo "::error file=$FILE,line=$LINE::Potential security issue: $CONTENT"
                    fi
                done <<< "$REAL_ISSUES"
            fi
        else
            echo "✅ Pattern found but using environment variables (allowed)"
        fi
    else
        echo "✅ No issues found"
    fi
    echo ""
done

# Additional security checks
echo "🔍 Additional Security Checks"
echo "=============================="

# Check for TODO/FIXME with security implications
echo "🔍 Checking for security-related TODOs..."
TODO_SECURITY=$(find $SCAN_DIRS \( $FILE_EXTENSIONS \) -type f -exec grep -Hn -i "TODO.*\(security\|auth\|password\|token\|key\)" {} \; 2>/dev/null || true)
if [ -n "$TODO_SECURITY" ]; then
    echo "⚠️ Security-related TODOs found:"
    echo "$TODO_SECURITY"
    if [ "$GITHUB_ACTIONS" = "true" ]; then
        echo "::warning::Security-related TODOs found in code"
    fi
else
    echo "✅ No security TODOs found"
fi

echo ""

# Check for console.log that might leak sensitive data
echo "🔍 Checking for potential data leaks in console.log..."
CONSOLE_LEAKS=$(find $SCAN_DIRS \( $FILE_EXTENSIONS \) -type f -exec grep -Hn "console\.log.*\(password\|secret\|token\|key\)" {} \; 2>/dev/null || true)
if [ -n "$CONSOLE_LEAKS" ]; then
    echo "⚠️ Potential sensitive data in console.log:"
    echo "$CONSOLE_LEAKS"
    if [ "$GITHUB_ACTIONS" = "true" ]; then
        echo "::warning::Potential sensitive data in console.log statements"
    fi
else
    echo "✅ No sensitive console.log found"
fi

echo ""
echo "📊 Security Scan Summary"
echo "========================"

if [ $SECURITY_ISSUES_FOUND -eq 1 ]; then
    echo "❌ Security issues detected! Please review and fix the identified problems."
    exit 1
else
    echo "✅ No security issues found. Code appears secure."
    exit 0
fi