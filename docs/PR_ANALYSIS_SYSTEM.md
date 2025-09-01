# PR Review Support System

This repository includes an automated PR analysis and review support system that provides intelligent insights for code reviews.

## Features

### 🤖 Automated Analysis
- **Complexity scoring** based on file types and change locations
- **Review time estimation** using established metrics
- **Change categorization** by file type and project area
- **Intelligent suggestions** for review focus areas

### 📊 Metrics Tracked
- Total files changed
- Lines added/removed per file
- Complexity score (weighted by file type and location)
- Estimated review time
- Source code impact analysis

### 🎯 Review Insights
- Breaking change warnings for large PRs
- Focus area suggestions (API, UI, config changes)
- Test coverage reminders
- Documentation update suggestions

## Usage

### Automatic Analysis
The PR analysis runs automatically on:
- New PR creation
- PR updates (new commits)
- PR reopening

Results are posted as a comment on the PR.

### Manual Analysis
You can run analysis locally using npm scripts:

```bash
# Basic analysis
npm run pr:analyze

# JSON output for programmatic use
npm run pr:analyze:json

# GitHub comment format
npm run pr:analyze:comment

# Custom base branch
node scripts/pr-analysis.js develop --comment
```

## Configuration

### Complexity Weights
File types have different complexity multipliers:
- **TypeScript/JavaScript**: 1.0x base complexity
- **React components (.tsx/.jsx)**: 1.2x (UI considerations)
- **JSON/Config files**: 0.5x (structured data)
- **Documentation (.md)**: 0.3x (easier to review)
- **YAML workflows**: 0.6x (structured but important)

### Location Multipliers
Code location affects review complexity:
- **src/ folder**: 1.2x (core source code)
- **components/**: 1.3x (UI components need UX review)
- **api/**: 1.4x (backend logic requires careful review)
- **tests/**: 0.8x (important but straightforward)
- **docs/**: 0.4x (documentation changes)

### Review Time Base
Review time estimation (minutes per line):
- **TypeScript/JavaScript**: 0.5 min/line
- **React components**: 0.7 min/line
- **JSON files**: 0.2 min/line
- **Documentation**: 0.1 min/line

## Example Output

```markdown
## 🤖 Automated PR Analysis

📊 **Change Analysis Summary**
- **Files changed:** 5
- **Complexity level:** moderate
- **Estimated review time:** 45 minutes

🎯 **Significant changes in:**
- `src/components/TaskForm.tsx` (+67/-12 lines)
- `src/api/tasks.ts` (+23/-5 lines)

## 💡 Review Suggestions
⚛️ UI component changes - test visual rendering and accessibility.
🔌 API changes detected - verify backward compatibility and documentation.

## ✅ Review Checklist
- [ ] Code follows project coding standards
- [ ] Changes are well-documented
- [ ] Tests cover new functionality
- [ ] No breaking changes or properly documented
- [ ] Performance impact considered
```

## Workflow Integration

The PR analysis is integrated into the GitHub Actions workflow:

1. **Triggers**: PR opened/updated/reopened
2. **Analysis**: Git diff analysis and complexity calculation
3. **Labeling**: Automatic complexity and area labels
4. **Commenting**: Detailed analysis posted to PR
5. **Artifacts**: Analysis results saved for reference

## Customization

### Modifying Complexity Weights
Edit `CONFIG.COMPLEXITY_WEIGHTS` in `scripts/pr-analysis.js`:

```javascript
COMPLEXITY_WEIGHTS: {
  typescript: 1.0,     // Base TypeScript complexity
  tsx: 1.2,           // React components
  api: 1.4,           // API route files
  // Add new file types...
}
```

### Adjusting Thresholds
Modify complexity thresholds in `CONFIG.THRESHOLDS`:

```javascript
THRESHOLDS: {
  simple: { score: 50, time: 30 },      // Simple changes
  moderate: { score: 150, time: 60 },   // Moderate complexity
  complex: { score: 300, time: 120 },   // Complex changes
}
```

### Adding Review Suggestions
Extend the `generateReviewSuggestions()` function to add custom rules based on your project needs.

## Benefits

- **Consistent review standards** across all PRs
- **Time estimation** helps with sprint planning
- **Focus guidance** for reviewers on critical areas
- **Quality assurance** through automated checks
- **Documentation** of change impact and complexity

The system learns from your project structure and adapts suggestions to your codebase patterns.