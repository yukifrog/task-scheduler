#!/usr/bin/env node

/**
 * PR Size Checker
 * Checks if the current PR size is within recommended guidelines
 */

const { execSync } = require('child_process');
const path = require('path');

// Size thresholds based on pr-guidelines.md
const THRESHOLDS = {
  SMALL: 200,
  MEDIUM: 500,
  LARGE: 800
};

function getPRStats() {
  try {
    // Try multiple git diff strategies to get changes
    let output;
    try {
      // Try against main branch first
      output = execSync('git diff --stat origin/main...HEAD', { encoding: 'utf-8' });
    } catch {
      try {
        // Try staged changes
        output = execSync('git diff --stat --staged', { encoding: 'utf-8' });
      } catch {
        try {
          // Try recent commits
          output = execSync('git diff --stat HEAD~1...HEAD', { encoding: 'utf-8' });
        } catch {
          return { insertions: 0, deletions: 0, total: 0, files: 0 };
        }
      }
    }
    
    const lines = output.trim().split('\n');
    
    if (lines.length === 0) {
      return { insertions: 0, deletions: 0, total: 0, files: 0 };
    }
    
    const lastLine = lines[lines.length - 1];
    const match = lastLine.match(/(\d+)\s+files?\s+changed(?:,\s+(\d+)\s+insertions?\(\+\))?(?:,\s+(\d+)\s+deletions?\(-\))?/);
    
    if (!match) {
      return { insertions: 0, deletions: 0, total: 0, files: 0 };
    }
    
    const files = parseInt(match[1] || '0');
    const insertions = parseInt(match[2] || '0');
    const deletions = parseInt(match[3] || '0');
    const total = insertions + deletions;
    
    return { insertions, deletions, total, files };
  } catch (error) {
    console.error('Error getting git diff stats:', error.message);
    return { insertions: 0, deletions: 0, total: 0, files: 0 };
  }
}

function categorizeSize(total) {
  if (total <= THRESHOLDS.SMALL) {
    return { category: 'Small', icon: '✅', color: 'green' };
  } else if (total <= THRESHOLDS.MEDIUM) {
    return { category: 'Medium', icon: '⚠️', color: 'yellow' };
  } else if (total <= THRESHOLDS.LARGE) {
    return { category: 'Large', icon: '🔍', color: 'orange' };
  } else {
    return { category: 'Extra Large', icon: '❌', color: 'red' };
  }
}

function printRecommendations(category, total) {
  console.log('\n📋 Recommendations:');
  
  switch (category) {
    case 'Small':
      console.log('✅ Perfect size for quick review and easy testing');
      console.log('✅ Ideal for hotfixes and small improvements');
      break;
      
    case 'Medium':
      console.log('⚠️ Good size, but consider if it can be split logically');
      console.log('⚠️ Ensure all changes are related to a single feature/fix');
      break;
      
    case 'Large':
      console.log('🔍 Large PR - requires careful review');
      console.log('🔍 Consider splitting by feature, stage, or dependency');
      console.log('🔍 Ensure thorough testing and documentation');
      break;
      
    case 'Extra Large':
      console.log('❌ PR is too large - splitting is highly recommended');
      console.log('❌ Consider these splitting strategies:');
      console.log('   • Feature-based: Split by independent features');
      console.log('   • Stage-based: Implement incrementally');
      console.log('   • Dependency-based: Split by technical layers');
      console.log('📚 See docs/pr-guidelines.md for detailed guidance');
      break;
  }
}

function main() {
  console.log('🔍 PR Size Analysis');
  console.log('===================');
  
  const stats = getPRStats();
  const { category, icon, color } = categorizeSize(stats.total);
  
  console.log(`\n📊 Current PR Statistics:`);
  console.log(`   Files changed: ${stats.files}`);
  console.log(`   Lines added: ${stats.insertions}`);
  console.log(`   Lines removed: ${stats.deletions}`);
  console.log(`   Total changes: ${stats.total} lines`);
  
  console.log(`\n${icon} Size Category: ${category}`);
  console.log(`   Threshold: ${stats.total} / ${THRESHOLDS.LARGE} lines`);
  
  printRecommendations(category, stats.total);
  
  // Exit with appropriate code
  if (stats.total > THRESHOLDS.LARGE) {
    console.log('\n💡 Consider running: npm run pr:split-help');
    process.exit(1);
  } else if (stats.total > THRESHOLDS.MEDIUM) {
    console.log('\n💡 Review splitting options if complexity is high');
    process.exit(0);
  } else {
    console.log('\n🎉 PR size looks good!');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getPRStats, categorizeSize, THRESHOLDS };