# PR Size Guidelines & Splitting Patterns / PRサイズガイドライン・分割パターン

## Overview / 概要

This document provides guidelines for managing Pull Request size and effective splitting patterns to improve code review quality and maintainability.

このドキュメントは、プルリクエストのサイズ管理と効果的な分割パターンのガイドラインを提供し、コードレビューの品質と保守性を向上させることを目的としています。

## PR Size Classification / PRサイズ分類

### Size Thresholds / サイズ基準

| Size / サイズ | Line Count / 行数 | Review Time / レビュー時間 | Complexity / 複雑さ |
|---------------|-------------------|----------------------------|---------------------|
| **Small / 小** | ≤ 200 lines | 15-30 minutes | Low risk, fast review |
| **Medium / 中** | 201-500 lines | 30-60 minutes | Moderate complexity |
| **Large / 大** | 501-800 lines | 1-2 hours | High complexity, careful review needed |
| **Extra Large / 特大** | > 800 lines | **Should be split** / **分割が必要** |

### Line Count Calculation / 行数の計算

```bash
# Check PR size before submitting
git diff --stat origin/main...HEAD | tail -1

# Example output:
# 15 files changed, 347 insertions(+), 123 deletions(-)
# Total: 347 + 123 = 470 lines (Medium PR)
```

**Count includes / カウントに含まれるもの:**
- Code additions and deletions / コードの追加と削除
- Test file changes / テストファイルの変更
- Configuration file updates / 設定ファイルの更新

**Exclude from count / カウントから除外:**
- Auto-generated files / 自動生成ファイル
- Package lock files (`package-lock.json`, `yarn.lock`)
- Build artifacts / ビルド成果物

## Three Splitting Patterns / 3つの分割パターン

### 1. Feature-Based Splitting / 機能別分割

Split large features into independent, deployable units.

大きな機能を独立してデプロイ可能な単位に分割します。

```
Original Large PR (800+ lines):
┌─────────────────────────────────────┐
│ Add Task Management System          │
│ ├── API endpoints                   │
│ ├── Database models                 │
│ ├── UI components                   │
│ ├── Tests                          │
│ └── Documentation                   │
└─────────────────────────────────────┘

Split into Feature PRs:
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ PR1: Database  │ │ PR2: API       │ │ PR3: Frontend  │
│ - Models       │ │ - Endpoints    │ │ - Components   │
│ - Migrations   │ │ - Validation   │ │ - Pages        │
│ - Basic tests  │ │ - API tests    │ │ - E2E tests    │
│ (150 lines)    │ │ (200 lines)    │ │ (180 lines)    │
└────────────────┘ └────────────────┘ └────────────────┘
```

**Example from codebase:**
```
# Instead of one large "Add Routine Management" PR:

# PR 1: feat: Add routine database models and migrations
src/lib/prisma/schema.prisma
src/types/routine.ts
prisma/migrations/

# PR 2: feat: Add routine API endpoints  
src/app/api/routines/
src/lib/routines/

# PR 3: feat: Add routine management UI
src/components/routine/
src/app/routines/
```

### 2. Stage-Based Splitting / 段階別分割

Implement features incrementally through logical development stages.

論理的な開発段階を通じて機能を段階的に実装します。

```
Stage 1: Foundation (Basic functionality)
┌──────────────────────────────────────┐
│ PR1: Core Task CRUD                  │
│ ├── Basic models                     │
│ ├── Simple API                       │
│ ├── Minimal UI                       │
│ └── Essential tests                  │
└──────────────────────────────────────┘

Stage 2: Enhancement (Advanced features)
┌──────────────────────────────────────┐
│ PR2: Task Categories & Filters       │
│ ├── Category system                  │
│ ├── Filter API                       │
│ ├── Filter UI                        │
│ └── Integration tests                │
└──────────────────────────────────────┘

Stage 3: Polish (User experience)
┌──────────────────────────────────────┐
│ PR3: Task Analytics & Reports        │
│ ├── Analytics engine                 │
│ ├── Report generation                │
│ ├── Dashboard UI                     │
│ └── E2E tests                        │
└──────────────────────────────────────┘
```

**Example progression:**
```
# Stage 1: MVP - Basic task functionality
- Create task
- Edit task  
- Delete task
- List tasks

# Stage 2: Enhanced - Advanced features
- Task categories
- Due dates
- Priority levels
- Search & filters

# Stage 3: Advanced - User experience
- Task analytics
- Performance metrics
- Export capabilities
- Advanced UI
```

### 3. Dependency-Based Splitting / 依存関係順分割

Split based on technical dependencies, building from foundation to features.

技術的依存関係に基づいて、基盤から機能へと構築する形で分割します。

```
Dependency Chain:
Database → API → Frontend → Tests → Documentation

PR1: Database Foundation
┌─────────────────────────┐
│ Database Layer          │
│ ├── Schema definition   │
│ ├── Migrations         │
│ ├── Base models        │ 
│ └── Connection setup   │
└─────────────────────────┘
         ↓ (depends on)

PR2: API Layer  
┌─────────────────────────┐
│ Backend Services        │
│ ├── Route handlers     │
│ ├── Business logic     │
│ ├── Validation         │
│ └── API tests          │
└─────────────────────────┘
         ↓ (depends on)

PR3: Frontend Integration
┌─────────────────────────┐
│ User Interface          │
│ ├── Components         │
│ ├── Pages              │
│ ├── State management   │
│ └── UI tests           │
└─────────────────────────┘
```

**Real dependency example:**
```
# PR 1: Database models (no dependencies)
prisma/schema.prisma
src/types/task.ts

# PR 2: API routes (depends on models)  
src/app/api/tasks/
src/lib/tasks/

# PR 3: Frontend components (depends on API)
src/components/task/
src/app/tasks/

# PR 4: E2E tests (depends on full stack)
tests/e2e/task-management.spec.ts
```

## Practical Examples / 実践例

### Example 1: Large Feature Implementation

**Scenario:** Adding a new "Routine Management" system (estimated 1,200 lines)

**Original approach (❌):**
```
feat: Add complete routine management system
├── Database schema changes (200 lines)
├── API endpoints (300 lines)  
├── Frontend components (400 lines)
├── Integration logic (200 lines)
└── Tests and docs (100 lines)
Total: 1,200 lines - TOO LARGE
```

**Recommended splitting (✅):**
```
PR1: feat: Add routine database models
├── prisma/schema.prisma
├── src/types/routine.ts  
├── Basic migration
└── Model tests
Total: ~180 lines

PR2: feat: Add routine API endpoints
├── src/app/api/routines/
├── src/lib/routines/
├── Validation schemas
└── API tests  
Total: ~220 lines

PR3: feat: Add routine management UI
├── src/components/routine/
├── src/app/routines/
├── UI components
└── Component tests
Total: ~250 lines

PR4: feat: Add routine-task integration
├── Task generation logic
├── Schedule management
├── Integration tests
└── E2E tests
Total: ~180 lines
```

### Example 2: Bug Fix with Multiple Components

**Scenario:** Fix authentication bug affecting multiple areas (estimated 400 lines)

**Feature-based splitting:**
```
PR1: fix: Authentication service bug fixes
├── src/lib/auth/
├── API middleware updates
└── Unit tests
Total: ~150 lines

PR2: fix: Frontend auth state management  
├── src/components/auth/
├── State management fixes
└── UI tests
Total: ~120 lines

PR3: fix: Authentication E2E test coverage
├── tests/e2e/auth.spec.ts
├── Test utilities
└── Documentation updates
Total: ~130 lines
```

## Best Practices / ベストプラクティス

### 1. Pre-submission Checklist / 提出前チェックリスト

Before creating a PR, evaluate:

- [ ] **Size check:** `git diff --stat origin/main...HEAD`
- [ ] **Single responsibility:** Does this PR do one thing well?
- [ ] **Deployability:** Can this be safely deployed independently?
- [ ] **Testability:** Are changes easily testable?
- [ ] **Reviewability:** Can a reviewer understand this in < 1 hour?

### 2. When to Split / 分割のタイミング

**Always split when:**
- PR exceeds 800 lines
- Multiple unrelated changes are mixed
- Review feedback becomes overwhelming
- CI/CD pipeline consistently fails

**Consider splitting when:**
- PR exceeds 500 lines
- Multiple developers are working on related features
- Changes affect multiple architectural layers
- Review is taking longer than expected

### 3. Splitting Strategies by Context / 文脈別分割戦略

#### New Feature Development / 新機能開発
1. **Database first:** Models, migrations, basic operations
2. **API second:** Endpoints, business logic, validation
3. **Frontend third:** Components, pages, user interactions
4. **Testing last:** Integration tests, E2E tests

#### Bug Fixes / バグ修正
1. **Root cause:** Core issue fix
2. **Symptoms:** Related issue fixes  
3. **Prevention:** Tests and safeguards

#### Refactoring / リファクタリング
1. **Foundation:** Core structure changes
2. **Migration:** Move code to new structure
3. **Cleanup:** Remove old code and dependencies

### 4. Communication Guidelines / コミュニケーションガイドライン

#### For Split PRs / 分割PRの場合

**Link related PRs:**
```markdown
## Related PRs / 関連PR
- Part 1: #123 (Database models) ✅ Merged
- Part 2: #124 (API endpoints) ← Current PR  
- Part 3: #125 (Frontend UI) - Pending
```

**Clear dependencies:**
```markdown
## Dependencies / 依存関係
- ⚠️ **Requires:** PR #123 to be merged first
- 📋 **Blocks:** PR #125 cannot start until this is merged
- 🔄 **Related:** Works with PR #126 but no dependency
```

### 5. Tools and Automation / ツールと自動化

#### Size Monitoring / サイズ監視
```bash
# Add to package.json scripts:
"pr:size": "git diff --stat origin/main...HEAD | tail -1",
"pr:check": "node scripts/check-pr-size.js"
```

#### Example automation script:
```javascript
// scripts/check-pr-size.js
const { execSync } = require('child_process');

const output = execSync('git diff --stat origin/main...HEAD').toString();
const lastLine = output.trim().split('\n').pop();
const changes = lastLine.match(/(\d+) insertions.*?(\d+) deletions/) || [];

const insertions = parseInt(changes[1] || '0');
const deletions = parseInt(changes[2] || '0');
const total = insertions + deletions;

console.log(`PR Size: ${total} lines (${insertions}+ / ${deletions}-)`);

if (total > 800) {
  console.log('❌ PR is too large! Consider splitting.');
  process.exit(1);
} else if (total > 500) {
  console.log('⚠️ PR is large. Review splitting options.');
} else {
  console.log('✅ PR size is good!');
}
```

## Integration with Existing Workflow / 既存ワークフローとの統合

### Updated PR Process / 更新されたPRプロセス

Based on our existing [CONTRIBUTING.md](../CONTRIBUTING.md):

1. **Size evaluation** before creating PR
2. **Conventional commits** with scope awareness
3. **Clear description** with splitting context if applicable  
4. **Self-review** including size consideration
5. **Team review** with size-appropriate expectations

### PR Template Updates / PRテンプレート更新

Consider adding to [PR template](../.github/PULL_REQUEST_TEMPLATE.md):

```markdown
## サイズ評価 / Size Evaluation
- [ ] Checked PR size: `git diff --stat origin/main...HEAD`
- [ ] Size is appropriate (≤ 500 lines preferred, ≤ 800 lines maximum)
- [ ] If large, splitting strategy is documented
```

## Common Anti-patterns / よくあるアンチパターン

### ❌ What NOT to do

1. **Kitchen sink PRs:** Mixing unrelated changes
2. **God PRs:** Implementing entire features in one PR
3. **Dependent splitting:** Creating artificial dependencies
4. **Incomplete splitting:** Splitting but leaving broken intermediate states

### ✅ What TO do

1. **Logical coherence:** Each PR should be logically complete
2. **Independent deployment:** Each PR should be deployable
3. **Clear progression:** Splitting should follow logical development flow
4. **Minimal viable changes:** Each PR should be the smallest complete unit

## Conclusion / まとめ

Effective PR size management improves:
- **Review quality:** Smaller PRs get better reviews
- **Development velocity:** Faster review cycles
- **Code stability:** Reduced risk of introducing bugs
- **Team collaboration:** Clearer communication and handoffs

Remember: **The goal is not just smaller PRs, but better PRs.**

目標は単に小さなPRを作ることではなく、より良いPRを作ることです。

---

For questions or suggestions about these guidelines, please open an issue or discussion.

ガイドラインに関する質問や提案がある場合は、issueまたはdiscussionを開いてください。