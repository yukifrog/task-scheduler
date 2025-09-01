#!/bin/bash

# Test Coverage Validation Script  
# Validates that test coverage meets the minimum 80% threshold

set -e

echo "🔍 Test Coverage Validation"
echo "===========================" 

# Minimum coverage threshold
MIN_COVERAGE=80

echo "📊 Running test coverage analysis..."
echo "Minimum required coverage: ${MIN_COVERAGE}%"
echo ""

# Run tests with coverage and capture output
COVERAGE_OUTPUT=$(npm run test:unit:coverage 2>&1) || COVERAGE_EXIT_CODE=$?

if [ ${COVERAGE_EXIT_CODE:-0} -ne 0 ]; then
    echo "❌ Test execution failed!"
    echo "$COVERAGE_OUTPUT"
    
    if [ "$GITHUB_ACTIONS" = "true" ]; then
        echo "::error::Test coverage check failed - tests could not run"
    fi
    
    exit 1
fi

echo "✅ Tests executed successfully"
echo ""

# Extract coverage percentages from Jest output
# Look for the coverage summary table
COVERAGE_LINES=$(echo "$COVERAGE_OUTPUT" | grep "All files" || echo "")

if [ -z "$COVERAGE_LINES" ]; then
    echo "❌ Could not parse coverage information from test output"
    echo "📋 Test Output:"
    echo "$COVERAGE_OUTPUT"
    
    if [ "$GITHUB_ACTIONS" = "true" ]; then
        echo "::error::Could not parse test coverage information"
    fi
    
    exit 1
fi

# Extract coverage percentages (Statements, Branches, Functions, Lines)
# Jest output format: "All files | 29.64 | 50.68 | 25 | 29.64 |"
STMT_COVERAGE=$(echo "$COVERAGE_LINES" | awk -F'|' '{print $2}' | xargs)
BRANCH_COVERAGE=$(echo "$COVERAGE_LINES" | awk -F'|' '{print $3}' | xargs)  
FUNC_COVERAGE=$(echo "$COVERAGE_LINES" | awk -F'|' '{print $4}' | xargs)
LINE_COVERAGE=$(echo "$COVERAGE_LINES" | awk -F'|' '{print $5}' | xargs)

echo "📊 Coverage Results:"
echo "==================="
echo "Statements: ${STMT_COVERAGE}%"
echo "Branches:   ${BRANCH_COVERAGE}%"
echo "Functions:  ${FUNC_COVERAGE}%"
echo "Lines:      ${LINE_COVERAGE}%"
echo ""

# Check if any coverage metric is below threshold
COVERAGE_FAILED=0

check_coverage() {
    local metric_name="$1"
    local coverage_value="$2"
    
    # Handle empty or non-numeric values
    if [ -z "$coverage_value" ] || ! [[ "$coverage_value" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
        echo "⚠️ Could not parse $metric_name coverage value: '$coverage_value'"
        return 1
    fi
    
    # Use bc for floating point comparison
    if [ "$(echo "$coverage_value < $MIN_COVERAGE" | bc -l 2>/dev/null || echo "1")" = "1" ]; then
        echo "❌ $metric_name coverage ${coverage_value}% is below threshold ${MIN_COVERAGE}%"
        
        if [ "$GITHUB_ACTIONS" = "true" ]; then
            echo "::error::$metric_name coverage ${coverage_value}% below required ${MIN_COVERAGE}%"
        fi
        
        return 1
    else
        echo "✅ $metric_name coverage ${coverage_value}% meets threshold"
        return 0
    fi
}

# Check each coverage metric
echo "🎯 Coverage Threshold Validation:"
echo "================================="

check_coverage "Statement" "$STMT_COVERAGE" || COVERAGE_FAILED=1
check_coverage "Branch" "$BRANCH_COVERAGE" || COVERAGE_FAILED=1  
check_coverage "Function" "$FUNC_COVERAGE" || COVERAGE_FAILED=1
check_coverage "Line" "$LINE_COVERAGE" || COVERAGE_FAILED=1

echo ""

# Generate summary and recommendations
if [ $COVERAGE_FAILED -eq 1 ]; then
    echo "❌ Test Coverage Validation Failed!"
    echo "=================================="
    echo ""
    echo "🔧 Recommendations:"
    echo "1. Add more unit tests to increase coverage"
    echo "2. Focus on untested code paths and edge cases"
    echo "3. Consider testing error handling scenarios" 
    echo "4. Review the coverage report for specific files to target"
    echo ""
    echo "💡 To see detailed coverage report:"
    echo "   npm run test:unit:coverage"
    echo "   Open coverage/lcov-report/index.html in browser"
    echo ""
    
    if [ "$GITHUB_ACTIONS" = "true" ]; then
        echo "::error::Test coverage validation failed - coverage below ${MIN_COVERAGE}% threshold"
        echo "::warning::Consider adding more comprehensive unit tests to improve coverage"
    fi
    
    exit 1
else
    echo "✅ Test Coverage Validation Passed!"
    echo "=================================="
    echo "All coverage metrics meet the ${MIN_COVERAGE}% threshold."
    echo ""
    exit 0
fi