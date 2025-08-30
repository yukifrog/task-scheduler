# Coding Standards & Comment Guidelines

## Comment Language Policy

This project supports **bilingual comments** (Japanese and English) to accommodate:
- Japanese UI/UX elements and business logic
- International development collaboration  
- Domain-specific terminology in Japanese

### Accepted Comment Patterns

**Japanese Comments (日本語コメント):**
```typescript
// 開発用の簡単ログイン（本番では使用しない）
/* タスクの所有者確認 */
{/* タイトル */}
```

**English Comments:**
```typescript
// Development-only simple login (not for production)
/* Task ownership verification */
{/* Title */}
```

**Mixed Usage:**
Both languages may coexist in the same file when appropriate for context.

### GitHub Copilot Configuration

Japanese comments are intentionally allowed and should not trigger language consistency warnings. This project configuration:
- Sets locale override to Japanese (`ja`)
- Enables bilingual conversation support
- Maintains Japanese-specific business logic documentation

## Code Quality

- ESLint and TypeScript are configured for code quality
- Prettier for consistent formatting
- Playwright for E2E testing
- Japanese comments are excluded from language consistency checks