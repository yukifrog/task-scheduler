#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * PR Analysis Tool
 * 
 * Analyzes pull request changes to provide automated insights including:
 * - Change complexity scoring
 * - Estimated review time calculation
 * - Review point suggestions
 * - File type and location analysis
 */

const { execSync } = require('child_process');
const path = require('path');

// Configuration
const CONFIG = {
  // Complexity scoring weights
  COMPLEXITY_WEIGHTS: {
    // File type multipliers
    typescript: 1.0,
    javascript: 1.0,
    tsx: 1.2,        // React components are more complex
    jsx: 1.2,
    json: 0.5,       // Configuration files are simpler
    md: 0.3,         // Documentation is easier to review
    yml: 0.6,        // Workflow files need attention but are structured
    yaml: 0.6,
    
    // Location multipliers
    src: 1.2,        // Source code needs careful review
    components: 1.3, // UI components need UX consideration
    pages: 1.2,      // Page components affect user experience
    api: 1.4,        // API changes affect backend logic
    lib: 1.1,        // Utility functions
    tests: 0.8,      // Tests are important but more straightforward
    docs: 0.4,       // Documentation changes
    scripts: 1.0,    // Build/deployment scripts
    config: 0.7,     // Configuration files
  },
  
  // Review time estimation (minutes per line changed)
  REVIEW_TIME_BASE: {
    typescript: 0.5,
    javascript: 0.5, 
    tsx: 0.7,
    jsx: 0.7,
    json: 0.2,
    md: 0.1,
    yml: 0.3,
    yaml: 0.3,
  },
  
  // Thresholds for analysis
  THRESHOLDS: {
    simple: { score: 50, time: 30 },      // Simple changes
    moderate: { score: 150, time: 60 },   // Moderate complexity
    complex: { score: 300, time: 120 },   // Complex changes
    // Above complex is considered very complex
  }
};

/**
 * Gets git diff statistics for the PR
 */
function getGitDiffStats(baseBranch = 'main') {
  try {
    // Get list of changed files with stats
    const diffOutput = execSync(
      `git diff --numstat ${baseBranch}...HEAD`,
      { encoding: 'utf8' }
    ).trim();
    
    if (!diffOutput) {
      return { files: [], totalAdded: 0, totalRemoved: 0 };
    }
    
    const files = diffOutput.split('\n').map(line => {
      const [added, removed, filename] = line.split('\t');
      return {
        filename,
        added: added === '-' ? 0 : parseInt(added, 10),
        removed: removed === '-' ? 0 : parseInt(removed, 10),
        isBinary: added === '-' && removed === '-'
      };
    });
    
    const totalAdded = files.reduce((sum, file) => sum + file.added, 0);
    const totalRemoved = files.reduce((sum, file) => sum + file.removed, 0);
    
    return { files, totalAdded, totalRemoved };
  } catch (error) {
    console.warn('Failed to get git diff stats:', error.message);
    return { files: [], totalAdded: 0, totalRemoved: 0 };
  }
}

/**
 * Analyzes file to determine its type and location characteristics
 */
function analyzeFile(filename) {
  const ext = path.extname(filename).toLowerCase().slice(1);
  const pathParts = filename.split('/');
  
  // Determine file type
  let fileType = ext;
  if (['ts', 'tsx'].includes(ext)) fileType = 'typescript';
  if (['js', 'jsx'].includes(ext)) fileType = 'javascript';
  if (['yml', 'yaml'].includes(ext)) fileType = 'yaml';
  
  // Determine location category
  let locationCategory = 'other';
  if (pathParts.includes('src')) locationCategory = 'src';
  if (pathParts.includes('components')) locationCategory = 'components';
  if (pathParts.includes('pages')) locationCategory = 'pages';
  if (pathParts.includes('api')) locationCategory = 'api';
  if (pathParts.includes('lib')) locationCategory = 'lib';
  if (pathParts.includes('tests') || pathParts.includes('test')) locationCategory = 'tests';
  if (pathParts.includes('docs')) locationCategory = 'docs';
  if (pathParts.includes('scripts')) locationCategory = 'scripts';
  if (pathParts.includes('.github') || filename.includes('config')) locationCategory = 'config';
  
  return { fileType, locationCategory, extension: ext };
}

/**
 * Calculates complexity score for a file change
 */
function calculateFileComplexity(file) {
  const { fileType, locationCategory } = analyzeFile(file.filename);
  
  const totalLines = file.added + file.removed;
  if (totalLines === 0) return 0;
  
  // Base score from line changes
  let score = totalLines;
  
  // Apply file type multiplier
  const fileTypeWeight = CONFIG.COMPLEXITY_WEIGHTS[fileType] || 1.0;
  score *= fileTypeWeight;
  
  // Apply location multiplier
  const locationWeight = CONFIG.COMPLEXITY_WEIGHTS[locationCategory] || 1.0;
  score *= locationWeight;
  
  // Binary files get reduced score (usually images, etc.)
  if (file.isBinary) {
    score *= 0.3;
  }
  
  return Math.round(score);
}

/**
 * Estimates review time for a file change
 */
function estimateFileReviewTime(file) {
  const { fileType } = analyzeFile(file.filename);
  
  const totalLines = file.added + file.removed;
  if (totalLines === 0) return 0;
  
  const baseTime = CONFIG.REVIEW_TIME_BASE[fileType] || 0.4;
  let time = totalLines * baseTime;
  
  // Binary files take less time to review
  if (file.isBinary) {
    time *= 0.2;
  }
  
  // Large files take proportionally longer (diminishing returns)
  if (totalLines > 100) {
    time += (totalLines - 100) * 0.1;
  }
  
  return time;
}

/**
 * Analyzes all changes and generates a comprehensive report
 */
function analyzeChanges(baseBranch = 'main') {
  const { files, totalAdded, totalRemoved } = getGitDiffStats(baseBranch);
  
  if (files.length === 0) {
    return {
      summary: 'No changes detected',
      complexity: 'none',
      files: [],
      stats: { totalFiles: 0, totalAdded: 0, totalRemoved: 0 }
    };
  }
  
  // Analyze each file
  const fileAnalyses = files.map(file => {
    const analysis = analyzeFile(file.filename);
    const complexity = calculateFileComplexity(file);
    const reviewTime = estimateFileReviewTime(file);
    
    return {
      ...file,
      ...analysis,
      complexity,
      reviewTime
    };
  });
  
  // Calculate totals
  const totalComplexity = fileAnalyses.reduce((sum, file) => sum + file.complexity, 0);
  const totalReviewTime = fileAnalyses.reduce((sum, file) => sum + file.reviewTime, 0);
  
  // Determine complexity level
  let complexityLevel = 'simple';
  if (totalComplexity > CONFIG.THRESHOLDS.complex.score) {
    complexityLevel = 'very-complex';
  } else if (totalComplexity > CONFIG.THRESHOLDS.moderate.score) {
    complexityLevel = 'complex';
  } else if (totalComplexity > CONFIG.THRESHOLDS.simple.score) {
    complexityLevel = 'moderate';
  }
  
  // Group files by category for better reporting
  const filesByCategory = fileAnalyses.reduce((groups, file) => {
    const category = file.locationCategory;
    if (!groups[category]) groups[category] = [];
    groups[category].push(file);
    return groups;
  }, {});
  
  return {
    summary: generateSummary(fileAnalyses, totalComplexity, totalReviewTime, complexityLevel),
    complexity: complexityLevel,
    files: fileAnalyses,
    filesByCategory,
    stats: {
      totalFiles: files.length,
      totalAdded,
      totalRemoved,
      totalComplexity: Math.round(totalComplexity),
      totalReviewTime: Math.round(totalReviewTime)
    },
    reviewSuggestions: generateReviewSuggestions(fileAnalyses, complexityLevel)
  };
}

/**
 * Generates a human-readable summary
 */
function generateSummary(files, complexity, reviewTime, complexityLevel) {
  const fileCount = files.length;
  const timeInMinutes = Math.round(reviewTime);
  
  const majorChanges = files.filter(f => f.complexity > 50);
  const srcChanges = files.filter(f => f.locationCategory === 'src');
  const apiChanges = files.filter(f => f.locationCategory === 'api');
  const testChanges = files.filter(f => f.locationCategory === 'tests');
  
  let summary = `📊 **Change Analysis Summary**\n\n`;
  summary += `- **Files changed:** ${fileCount}\n`;
  summary += `- **Complexity level:** ${complexityLevel.replace('-', ' ')}\n`;
  summary += `- **Estimated review time:** ${timeInMinutes} minutes\n\n`;
  
  if (majorChanges.length > 0) {
    summary += `🎯 **Significant changes in:**\n`;
    majorChanges.slice(0, 5).forEach(file => {
      summary += `- \`${file.filename}\` (+${file.added}/-${file.removed} lines)\n`;
    });
    if (majorChanges.length > 5) {
      summary += `- ...and ${majorChanges.length - 5} more files\n`;
    }
    summary += '\n';
  }
  
  if (srcChanges.length > 0) {
    summary += `💻 **Source code changes:** ${srcChanges.length} files\n`;
  }
  if (apiChanges.length > 0) {
    summary += `🔌 **API changes:** ${apiChanges.length} files\n`;
  }
  if (testChanges.length > 0) {
    summary += `🧪 **Test changes:** ${testChanges.length} files\n`;
  }
  
  return summary;
}

/**
 * Generates specific review suggestions based on changes
 */
function generateReviewSuggestions(files, complexityLevel) {
  const suggestions = [];
  
  // General suggestions based on complexity
  if (complexityLevel === 'very-complex') {
    suggestions.push('⚠️ This is a large change. Consider breaking it into smaller PRs for easier review.');
    suggestions.push('🔍 Pay special attention to potential breaking changes.');
  } else if (complexityLevel === 'complex') {
    suggestions.push('🎯 Focus review on the most significant file changes.');
  }
  
  // File-specific suggestions
  const apiChanges = files.filter(f => f.locationCategory === 'api');
  const componentChanges = files.filter(f => f.locationCategory === 'components');
  const configChanges = files.filter(f => f.locationCategory === 'config');
  const testChanges = files.filter(f => f.locationCategory === 'tests');
  
  if (apiChanges.length > 0) {
    suggestions.push('🔌 API changes detected - verify backward compatibility and documentation.');
  }
  
  if (componentChanges.length > 0) {
    suggestions.push('⚛️ UI component changes - test visual rendering and accessibility.');
  }
  
  if (configChanges.length > 0) {
    suggestions.push('⚙️ Configuration changes - verify environment compatibility.');
  }
  
  if (testChanges.length === 0 && files.some(f => f.locationCategory === 'src')) {
    suggestions.push('🧪 Consider adding tests for new source code changes.');
  }
  
  // Large file suggestions
  const largeFiles = files.filter(f => (f.added + f.removed) > 100);
  if (largeFiles.length > 0) {
    suggestions.push(`📄 Large file changes detected (${largeFiles.length} files) - verify code organization.`);
  }
  
  return suggestions;
}

/**
 * Formats the analysis as a GitHub comment
 */
function formatAsComment(analysis) {
  let comment = `## 🤖 Automated PR Analysis\n\n`;
  comment += analysis.summary;
  
  if (analysis.reviewSuggestions.length > 0) {
    comment += `\n## 💡 Review Suggestions\n\n`;
    analysis.reviewSuggestions.forEach(suggestion => {
      comment += `${suggestion}\n`;
    });
  }
  
  comment += `\n---\n`;
  comment += `*Analysis generated automatically. Complexity score: ${analysis.stats.totalComplexity}*`;
  
  return comment;
}

/**
 * Main function for CLI usage
 */
function main() {
  const args = process.argv.slice(2);
  const baseBranch = args[0] || 'main';
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
PR Analysis Tool

Usage: node pr-analysis.js [base-branch] [options]

Options:
  --help, -h     Show this help message
  --json         Output as JSON
  --comment      Format as GitHub comment

Examples:
  node pr-analysis.js main
  node pr-analysis.js main --json
  node pr-analysis.js main --comment
    `);
    process.exit(0);
  }
  
  try {
    const analysis = analyzeChanges(baseBranch);
    
    if (args.includes('--json')) {
      console.log(JSON.stringify(analysis, null, 2));
    } else if (args.includes('--comment')) {
      console.log(formatAsComment(analysis));
    } else {
      // Human-readable format
      console.log('🔍 PR Analysis Results');
      console.log('======================');
      console.log(analysis.summary);
      
      if (analysis.reviewSuggestions.length > 0) {
        console.log('💡 Review Suggestions:');
        analysis.reviewSuggestions.forEach(suggestion => {
          console.log(`  ${suggestion}`);
        });
      }
      
      console.log(`\n📈 Detailed Stats:`);
      console.log(`  Complexity Score: ${analysis.stats.totalComplexity}`);
      console.log(`  Estimated Review Time: ${analysis.stats.totalReviewTime} minutes`);
    }
  } catch (error) {
    console.error('Error analyzing PR:', error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  analyzeChanges,
  calculateFileComplexity,
  estimateFileReviewTime,
  formatAsComment,
  CONFIG
};

// Run if called directly
if (require.main === module) {
  main();
}