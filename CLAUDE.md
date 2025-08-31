# タスクスケジューラー - Claude Code学習プロジェクト

このプロジェクトは、Claude Codeの高度機能（Subagent、Hook、MCP）を学習するための実績ベース動的計画管理システムです。

## プロジェクト概要

実績ベース動的計画管理システム：
- ルーティンタスクの実績データから最適な計画を自動生成
- 臨機応変な計画変更をサポート
- 外部サービス（Discord, Telegram等）との連携

## 技術スタック

- **フロントエンド**: Next.js 15 + TypeScript + Tailwind CSS
- **バックエンド**: Next.js API Routes + Prisma ORM
- **データベース**: PostgreSQL (Docker)
- **認証**: NextAuth.js
- **テスト**: Playwright (E2E)
- **開発環境**: Docker Compose

## Claude Code学習要素

### ✅ 完了した機能
1. **基盤構築**: Docker環境、Next.js、Prisma
2. **認証システム**: NextAuth.jsによるデモログイン（JWT戦略）
3. **CRUD機能**: タスクの作成・読み取り・更新・削除
4. **UI/UX**: TaskList、TaskForm、TaskTimer、DailyStats
5. **Playwrightテスト**: E2Eテスト環境
6. **MCP連携**: GitHub MCPサーバーとの接続確立
7. **ルーティン機能**: 繰り返しタスクの管理と自動タスク生成

### 🔄 進行中
8. **Hook機能**: 
   - ✅ コマンド不足時の自動インストール提案機能を実装
   - ✅ 既存のpreToolUse, postToolUse, userPromptSubmitフックを設定
   - 🔄 新セッションでのHook機能テスト待ち（現セッションで出力が見えない問題）

9. **GitHub ワークフロースコープ問題解決**:
   - ✅ GitHub token workflow スコープ不足問題の分析完了
   - ✅ Prisma telemetry 無効化の代替ソリューション実装
   - ✅ CI環境変数自動注入スクリプト作成
   - ✅ 手動ワークフロー修正ガイド作成

### 📋 予定
8. **Subagent機能**: 
   - ルーティンタスクの設計調査
   - パフォーマンス最適化提案
   - 外部API仕様調査

9. **GitHub MCP活用**: 
   - リポジトリ操作の自動化
   - Issue/PR管理
   - コミット・プッシュの自動化

## コマンド集

### 開発用コマンド
```bash
# 開発サーバー起動
npm run dev

# データベースリセット
npx prisma migrate reset

# Prismaクライアント生成
npx prisma generate

# データベース閲覧
npx prisma studio
```

### テスト用コマンド
```bash
# E2Eテスト実行
npm test

# テストUI起動
npm run test:ui

# テストデバッグ
npm run test:debug

# テストレポート表示
npm run test:report
```

### Docker用コマンド
```bash
# データベース起動
docker compose up -d postgres redis

# 全サービス起動
docker compose up -d

# ログ確認
docker compose logs -f

# 停止
docker compose down
```

### GitHub Workflow & CI用コマンド
```bash
# CI環境変数自動設定
source ./scripts/inject-ci-env.sh

# Prisma telemetry 設定確認
./scripts/configure-prisma-telemetry.sh

# 環境変数テスト（設定はしない）
./scripts/inject-ci-env.sh --test

# 手動用export コマンド生成
./scripts/inject-ci-env.sh --export

# ワークフロー修正ソリューション検証
./scripts/verify-workflow-fix.sh
```
```bash
# MCP接続確認
claude mcp list

# GitHub MCP詳細確認
claude mcp get github

# GitHub認証確認
gh auth status
```

### Claude Code MCP用コマンド
```bash
# 新機能追加
- ルーティン管理API (/api/routines)
- ルーティンからタスク生成API (/api/routines/[id]/generate-task)  
- ルーティン管理UI (/routines)
- ナビゲーション追加
- 認証システム修正（JWT戦略）

# Hook機能実装
- suggest-missing-commands: コマンド不足時自動提案
- 既存のlint-check, backup-important-files, log-user-request保持
- 新セッションでのテスト必要

# GitHub ワークフロースコープ問題解決
- workflow スコープ不足でCI修正ができない問題に対処
- Prisma telemetry無効化の代替ソリューション実装
- CI環境変数自動注入システム構築
- 手動ワークフロー修正ガイド完備

# 開発サーバー状況
- localhost:3001で正常稼働中
- ポート3000/3001の重複問題あり（要調査）
```

## Claude Code Hook設定例

以下は学習予定のHook設定です：

### コミット前フック
- ESLint実行
- TypeScriptコンパイルチェック
- Playwrightテスト実行
- Prismaマイグレーションチェック

### プッシュ前フック
- セキュリティスキャン
- ビルドテスト
- E2Eテスト完全実行

### デプロイフック
- 本番ビルド
- 外部サービス通知（Discord/Telegram）
- ヘルスチェック

## ディレクトリ構造

```
task-scheduler/
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # Reactコンポーネント  
│   ├── lib/               # ユーティリティ
│   └── types/             # 型定義
├── tests/
│   └── e2e/               # Playwrightテスト
├── prisma/                # データベース設定
├── docker-compose.yml     # Docker環境
└── playwright.config.ts   # テスト設定
```

## 学習進捗

- [x] プロジェクト基盤構築
- [x] 基本CRUD機能
- [x] 認証システム
- [x] E2Eテスト環境
- [x] GitHub MCP連携基盤
- [x] ルーティンタスク管理機能
- [x] Subagent活用（専門エージェント活用）
- [ ] Hook機能設定
- [ ] GitHub MCP活用実装