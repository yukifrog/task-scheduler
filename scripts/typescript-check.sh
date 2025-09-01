#!/bin/bash

# TypeScript Strict Mode Checker Script
# Validates TypeScript code against strict mode compliance

set -e

echo "🔍 TypeScript Strict Mode Check"
echo "==============================="

# Run TypeScript compiler with strict mode and no emit
echo "📝 Running TypeScript compiler with --strict --noEmit..."

# Capture TypeScript output
TS_OUTPUT=$(npx tsc --noEmit --strict 2>&1) || TS_EXIT_CODE=$?

if [ ${TS_EXIT_CODE:-0} -eq 0 ]; then
    echo "✅ TypeScript strict mode check passed!"
    echo "📊 No TypeScript errors found."
    exit 0
else
    echo "❌ TypeScript strict mode violations found!"
    echo ""
    echo "📋 TypeScript Errors:"
    echo "===================="
    echo "$TS_OUTPUT"
    echo ""
    
    # Parse and count errors
    ERROR_COUNT=$(echo "$TS_OUTPUT" | grep -c "error TS" || echo "0")
    FILE_COUNT=$(echo "$TS_OUTPUT" | grep "error TS" | cut -d: -f1 | sort -u | wc -l || echo "0")
    
    echo "📊 Error Summary:"
    echo "================="
    echo "Total TypeScript errors: $ERROR_COUNT"
    echo "Files with errors: $FILE_COUNT"
    echo ""
    
    # GitHub Actions annotations
    if [ "$GITHUB_ACTIONS" = "true" ]; then
        echo "::error::TypeScript strict mode check failed with $ERROR_COUNT errors in $FILE_COUNT files"
        
        # Parse each error for detailed annotations
        while IFS= read -r line; do
            if echo "$line" | grep -q "error TS"; then
                # Extract file, line number, and error message
                FILE=$(echo "$line" | cut -d: -f1)
                LINE_NUM=$(echo "$line" | cut -d: -f2)
                ERROR_MSG=$(echo "$line" | cut -d: -f4- | sed 's/^ *//')
                
                if [ -n "$FILE" ] && [ -n "$LINE_NUM" ] && [ -n "$ERROR_MSG" ]; then
                    echo "::error file=$FILE,line=$LINE_NUM::$ERROR_MSG"
                fi
            fi
        done <<< "$TS_OUTPUT"
    fi
    
    echo "🔧 Suggested Actions:"
    echo "===================="
    echo "1. Fix TypeScript errors listed above"
    echo "2. Ensure all types are properly defined"
    echo "3. Add missing imports or type definitions"
    echo "4. Consider adding // @ts-ignore for intentional violations (discouraged)"
    echo ""
    
    exit 1
fi