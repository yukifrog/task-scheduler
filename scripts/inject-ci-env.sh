#!/bin/bash

# GitHub Workflow Environment Injector
# This script injects environment variables for CI without modifying workflow files
# Useful when GitHub tokens lack 'workflow' scope

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 GitHub Workflow Environment Injector"
echo "======================================="

# Check if we have the required environment file
ENV_FILE="$PROJECT_ROOT/.github/ci.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file not found: $ENV_FILE"
    exit 1
fi

echo "📄 Found environment file: $ENV_FILE"

# Function to export environment variables from file
load_env_file() {
    echo "📥 Loading environment variables..."
    
    # Read the file and export variables (skip comments and empty lines)
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*$ ]]; then
            continue
        fi
        
        # Skip section headers (lines starting with # =)
        if [[ "$line" =~ ^#[[:space:]]*= ]]; then
            continue
        fi
        
        # Extract variable assignments
        if [[ "$line" =~ ^[[:space:]]*([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
            var_name="${BASH_REMATCH[1]}"
            var_value="${BASH_REMATCH[2]}"
            
            # Export the variable if not already set
            if [ -z "${!var_name}" ]; then
                export "$var_name=$var_value"
                echo "✅ Set $var_name=$var_value"
            else
                echo "ℹ️ $var_name already set (current: ${!var_name})"
            fi
        fi
    done < "$ENV_FILE"
}

# Function to validate critical environment variables
validate_environment() {
    echo ""
    echo "🔍 Validating critical environment variables..."
    
    critical_vars=(
        "CHECKPOINT_TELEMETRY"
        "NEXT_TELEMETRY_DISABLED"
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
        "NEXT_FONT_GOOGLE_DISABLED"
        "NO_UPDATE_NOTIFIER"
    )
    
    missing_vars=()
    
    for var in "${critical_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
            echo "❌ Missing: $var"
        else
            echo "✅ Set: $var=${!var}"
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo ""
        echo "⚠️ Warning: ${#missing_vars[@]} critical variables are missing"
        return 1
    else
        echo ""
        echo "✅ All critical environment variables are set"
        return 0
    fi
}

# Function to show current Prisma telemetry status
check_prisma_telemetry() {
    echo ""
    echo "🔍 Checking Prisma telemetry status..."
    
    if [ "$CHECKPOINT_TELEMETRY" = "0" ]; then
        echo "✅ Prisma telemetry is DISABLED (CHECKPOINT_TELEMETRY=0)"
    elif [ -n "$CHECKPOINT_TELEMETRY" ]; then
        echo "⚠️ Prisma telemetry setting: CHECKPOINT_TELEMETRY=$CHECKPOINT_TELEMETRY"
    else
        echo "❌ Prisma telemetry is NOT configured (CHECKPOINT_TELEMETRY not set)"
    fi
    
    if [ "$NEXT_TELEMETRY_DISABLED" = "1" ]; then
        echo "✅ Next.js telemetry is DISABLED (NEXT_TELEMETRY_DISABLED=1)"
    else
        echo "❌ Next.js telemetry is NOT disabled"
    fi
}

# Main execution
main() {
    echo "📍 Working directory: $PROJECT_ROOT"
    echo ""
    
    # Load environment variables
    load_env_file
    
    # Validate environment
    validate_environment
    validation_result=$?
    
    # Check telemetry settings
    check_prisma_telemetry
    
    echo ""
    if [ $validation_result -eq 0 ]; then
        echo "🎉 Environment configuration complete!"
        echo ""
        echo "💡 You can now run your CI commands with these variables set:"
        echo "   npm run lint"
        echo "   npm run build"
        echo "   npm run test"
        echo ""
        echo "🔧 To persist these settings, add them to your CI system's environment configuration"
    else
        echo "⚠️ Environment configuration completed with warnings"
        echo "   Some variables may need manual configuration"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [--help|--test|--export]"
        echo ""
        echo "Options:"
        echo "  --help    Show this help message"
        echo "  --test    Test environment without setting variables"
        echo "  --export  Generate export commands for manual use"
        echo ""
        echo "Example:"
        echo "  source $0        # Load variables into current shell"
        echo "  $0 --export      # Show export commands"
        exit 0
        ;;
    --test)
        echo "🧪 Testing mode - variables will not be exported"
        load_env_file() {
            echo "📥 Would load environment variables..."
            while IFS= read -r line; do
                if [[ "$line" =~ ^[[:space:]]*([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
                    var_name="${BASH_REMATCH[1]}"
                    var_value="${BASH_REMATCH[2]}"
                    echo "   Would set: $var_name=$var_value"
                fi
            done < "$ENV_FILE"
        }
        main
        ;;
    --export)
        echo "# Export commands for manual use:"
        echo "# Copy and paste these commands into your shell"
        echo ""
        while IFS= read -r line; do
            if [[ "$line" =~ ^[[:space:]]*([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
                var_name="${BASH_REMATCH[1]}"
                var_value="${BASH_REMATCH[2]}"
                echo "export $var_name='$var_value'"
            fi
        done < "$ENV_FILE"
        ;;
    *)
        main
        ;;
esac