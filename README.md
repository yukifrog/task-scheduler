# タスクスケジューラー

実績ベース動的計画管理を実現する、モダンなフルスタックタスク管理アプリケーションです。日々のスケジュールを精密かつ柔軟に整理し、効率的な時間管理をサポートします。

## 📋 プロジェクト概要

このプロジェクトは、Claude Codeの高度機能（Subagent、Hook、MCP）を学習するための実績ベース動的計画管理システムです。ルーティンタスクの実績データから最適な計画を自動生成し、臨機応変な計画変更をサポートします。

## ✨ 主要機能

### 🎯 タスク管理機能
- **日次タスク管理**: 指定した日のタスクを表示・管理
- **詳細タスク属性**: 優先度、重要度、予想時間などの詳細設定
- **タスクタイマー**: 実際の作業時間を追跡する内蔵タイマー
- **進捗状況管理**: タスクの完了状況とパフォーマンス分析
- **カテゴリー分類**: プロジェクトや分野別のタスク整理

### 🔄 ルーティンシステム
- **繰り返しタスク管理**: 日次、週次、月次の定期的なタスク設定
- **自動タスク生成**: ルーティンからの自動的なタスク作成
- **実績ベース最適化**: 過去の実績データに基づく計画調整
- **柔軟なスケジューリング**: 間隔設定とカスタマイズ可能な繰り返しパターン
- **統計分析**: ルーティンタスクの完了率とパフォーマンス追跡

### 🔐 認証・セキュリティ
- **安全なログインシステム**: NextAuth.jsによる認証
- **デモログイン機能**: JWT戦略を使用した簡単ログイン
- **セッション管理**: 安全で持続的なユーザーセッション
- **日次セキュリティ監査**: 脆弱性の自動スキャンとアラート

### 📊 データ分析・レポート
- **日次統計**: 完了率、時間効率の分析
- **パフォーマンストレンド**: 長期的な生産性の変化追跡
- **時間配分分析**: カテゴリー別の時間使用状況
- **実績データベース**: 将来の計画立案に活用可能なデータ蓄積

## 🛠️ 技術スタック

### フロントエンド
- **フレームワーク**: [Next.js 15](https://nextjs.org/) (App Router) - 最新のReactフレームワーク
- **言語**: [TypeScript](https://www.typescriptlang.org/) - 型安全性とコード品質の向上
- **UI フレームワーク**: [React 19](https://reactjs.org/) - モダンなユーザーインターフェース
- **スタイリング**: [Tailwind CSS v4](https://tailwindcss.com/) - ユーティリティファーストCSS
- **状態管理**: React Hooks & Context API - 軽量で効率的な状態管理

### バックエンド・データベース
- **API**: Next.js API Routes - サーバーサイドロジック
- **ORM**: [Prisma](https://www.prisma.io/) - 型安全なデータベースアクセス
- **データベース**: PostgreSQL (Docker) - 本格的なリレーショナルデータベース
- **認証**: [NextAuth.js](https://next-auth.js.org/) - 包括的な認証ソリューション
- **セッション管理**: JWT & データベースセッション

### 開発・テスト環境
- **E2Eテスト**: [Playwright](https://playwright.dev/) - 包括的なブラウザテスト
- **単体テスト**: [Jest](https://jestjs.io/) - 単体・統合テスト
- **コード品質**: [ESLint](https://eslint.org/) - コードスタイルと品質管理
- **開発環境**: [Docker Compose](https://docs.docker.com/compose/) - 一貫した開発環境

### CI/CD・運用
- **GitHub Actions**: 自動テスト・ビルド・デプロイ
- **パフォーマンス監視**: リアルタイムCIメトリクス
- **セキュリティ監査**: 日次脆弱性スキャン
- **キャッシュ最適化**: 60%高速化されたビルドパイプライン

## 🚀 セットアップガイド

### 📋 前提条件

- **Node.js**: 18.x 以上
- **Docker**: Docker Compose対応版
- **Git**: バージョン管理とクローン用

### 1. リポジトリのクローン

```bash
git clone https://github.com/yukifrog/task-scheduler.git
cd task-scheduler
```

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の環境変数を設定してください。

```env
# .env

# Prisma - データベース接続
# PostgreSQL例: "postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskscheduler?schema=public"

# NextAuth.js - 認証設定
# トークンの署名・暗号化用シークレット（生成ツール: https://generate-secret.vercel.app/）
NEXTAUTH_SECRET="your_nextauth_secret_key_here"
# サイトのカノニカルURL
NEXTAUTH_URL="http://localhost:3000"

# メール設定（パスワードレスログイン等）
# SMTP接続例: "smtp://user:pass@smtp.example.com:587"
EMAIL_SERVER="your_email_server_connection_string"
EMAIL_FROM="noreply@example.com"

# CI/CD 最適化設定
CHECKPOINT_TELEMETRY=0
NEXT_FONT_GOOGLE_DISABLED=1
```

### 3. Docker環境の起動

データベースとRedisサービスをDocker Composeで起動します。

```bash
# データベースサービスのみ起動
docker compose up -d postgres redis

# 全サービス起動（オプション）
docker compose up -d

# サービス状況確認
docker compose ps

# ログ確認
docker compose logs -f postgres
```

### 4. 依存関係のインストール

```bash
npm install
```

### 5. データベースの初期化

Prismaを使用してデータベーススキーマを適用します。

```bash
# データベースマイグレーション実行
npx prisma migrate dev

# Prismaクライアント生成
npx prisma generate

# データベースの内容確認（オプション）
npx prisma studio
```

### 6. 開発サーバーの起動

```bash
# Turbopack使用の高速開発サーバー
npm run dev

# 通常のNext.js開発サーバー
next dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションにアクセスしてください。

### 7. 初期データのセットアップ（オプション）

```bash
# デモデータの投入
npx prisma db seed

# 管理者ユーザーの作成
npm run setup:admin
```

## 📜 利用可能なスクリプト

### 開発用コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# コード品質チェック
npm run lint
```

### テスト関連コマンド

```bash
# E2Eテスト実行
npm test
npm run test

# インタラクティブテストUI
npm run test:ui

# テストデバッグモード
npm run test:debug

# テストレポート表示
npm run test:report

# 単体テスト実行
npm run test:unit

# 単体テスト（監視モード）
npm run test:unit:watch

# カバレッジレポート生成
npm run test:unit:coverage

# テスト構造検証
npm run test:validate

# アプリケーションヘルスチェック
npm run test:health
```

### データベース管理

```bash
# Prismaクライアント生成
npm run prisma:generate
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev

# マイグレーション状態確認
npx prisma migrate status

# データベースリセット
npx prisma migrate reset

# データベースブラウザ起動
npx prisma studio

# スキーマフォーマット
npx prisma format

# データベースプッシュ（開発用）
npx prisma db push
```

### CI/CD・パフォーマンス監視

```bash
# CI パフォーマンス監視
npm run ci:monitor

# CI パフォーマンス監視（モックデータ）
npm run ci:monitor:mock

# パフォーマンスレポート生成
npm run ci:report

# キャッシュ使用状況監視
npm run cache:monitor

# キャッシュレポート生成
npm run cache:report
```

### セキュリティ・監査

```bash
# セキュリティ監査テスト
npm run security:test

# 手動セキュリティ監査
npm audit --audit-level moderate

# 脆弱性の詳細確認
npm audit --json
```

### プルリクエスト分析

```bash
# PR変更分析
npm run pr:analyze

# PR分析（JSON出力）
npm run pr:analyze:json

# PR分析（GitHub コメント形式）
npm run pr:analyze:comment

# PRサイズチェック
npm run pr:size
npm run pr:check
```

## ⚡ CI/CD 最適化

このプロジェクトでは、GitHub Actionsの包括的キャッシュ戦略により、CIパイプラインの実行時間を大幅に短縮しています。

### 🚀 パフォーマンス改善

#### キャッシュ戦略
- **Playwright ブラウザ**: Chromiumのみインストール（設定準拠）、実行間でキャッシュ
- **依存関係**: `--prefer-offline --no-audit` による積極的npmキャッシュ  
- **ビルドキャッシュ**: Next.jsビルド成果物の増分ビルド用キャッシュ
- **データベース**: スキーマ変更ベースのPrismaクライアント生成キャッシュ

#### 実行時間最適化
- **並列処理**: テストとビルドの並列実行
- **条件付き実行**: 変更ファイルベースの選択的テスト実行
- **リソース効率**: メモリとCPU使用量の最適化

### 📊 期待されるパフォーマンス

| 指標 | 最適化前 | 最適化後 | 改善率 |
|------|----------|----------|--------|
| **パイプライン実行時間** | 4-6分 | 1.5-2.5分 | ~60%短縮 |
| **キャッシュヒット率** | 0% | 85-95% | - |
| **依存関係インストール** | 2-3分 | 30秒-1分 | ~70%短縮 |
| **ビルド時間** | 1-2分 | 30-45秒 | ~50%短縮 |

詳細な実装については [キャッシュ戦略ドキュメント](.github/CACHING_STRATEGY.md) を参照してください。

### 🔍 パフォーマンス監視

#### リアルタイム監視
- **ダッシュボード**: `/ci-performance` でメトリクス表示
- **自動監視**: 6時間ごとの実行とアラート通知
- **パフォーマンスレポート**: チャート付き包括的HTMLレポート
- **アラート機能**: パフォーマンス劣化時の自動Issue作成

#### 監視コマンド
```bash
# CI パフォーマンス監視
npm run ci:monitor

# モックデータでのテスト
npm run ci:monitor:mock

# パフォーマンスレポート生成
npm run ci:report

# GitHub Workflow手動実行
gh workflow run test-cache.yml
```

完全なドキュメントは [CI パフォーマンス監視](.github/CI_PERFORMANCE_MONITORING.md) を参照してください。

### 🧪 キャッシュパフォーマンステスト

```bash
# キャッシュテストワークフロー手動実行
gh workflow run test-cache.yml

# キャッシュ使用状況監視
npm run cache:monitor

# 詳細キャッシュレポート
npm run cache:report

# パフォーマンス検証
./scripts/verify-workflow-fix.sh
```

### 📈 継続的最適化

#### 監視項目
- ビルド時間の傾向分析
- キャッシュヒット率の追跡
- リソース使用率の最適化
- 外部依存関係の影響評価

#### 自動化機能
- パフォーマンス劣化時の自動アラート
- 最適化提案の自動生成
- トレンド分析とレポート作成
- キャッシュ効率の継続監視

## 🔍 PR分析・レビューサポート

プルリクエストの自動分析により、インテリジェントなレビューインサイトを提供します。

### 🤖 主要機能

#### 自動分析機能
- **複雑度スコアリング**: ファイルタイプと変更箇所に基づく自動複雑度算出
- **レビュー時間見積もり**: 確立されたメトリクスを使用したインテリジェントな時間予測
- **変更カテゴリ分析**: ファイルタイプとプロジェクト領域による分類
- **スマート提案**: コンテキストを考慮したレビューフォーカス領域の推奨

#### 追跡メトリクス
- 変更ファイル総数
- ファイル別の追加/削除行数
- 複雑度スコア（ファイルタイプと場所による重み付け）
- 推定レビュー時間
- ソースコード影響度分析

#### レビューインサイト
- 大型PRの破綻的変更警告
- フォーカス領域提案（API、UI、設定変更）
- テストカバレッジリマインダー
- ドキュメント更新提案

### 📊 使用方法

```bash
# 現在のブランチ変更分析
npm run pr:analyze

# GitHub コメント形式生成
npm run pr:analyze:comment

# 自動化用JSON出力
npm run pr:analyze:json

# PRサイズチェック
npm run pr:size
```

### 🔄 自動統合

PR分析システムは以下を自動実行します：
- ✅ PR作成・更新時の全プルリクエスト分析
- 📊 詳細分析コメントの投稿
- 🏷️ 複雑度と領域ラベルの追加
- ⏱️ レビュー時間要件の見積もり

### 📝 出力例

```markdown
## 🤖 自動PR分析

📊 **変更分析サマリー**
- **変更ファイル数:** 5
- **複雑度レベル:** 中程度
- **推定レビュー時間:** 45分

🎯 **重要な変更:**
- `src/components/TaskForm.tsx` (+67/-12行)
- `src/api/tasks.ts` (+23/-5行)

## 💡 レビュー提案
⚛️ UIコンポーネント変更 - ビジュアルレンダリングとアクセシビリティをテスト
🔌 API変更検出 - 後方互換性とドキュメントを確認

## ✅ レビューチェックリスト
- [ ] コードがプロジェクトのコーディング標準に従っている
- [ ] 変更が適切にドキュメント化されている
- [ ] テストが新機能をカバーしている
- [ ] 破綻的変更がないか、適切にドキュメント化されている
- [ ] パフォーマンスへの影響が考慮されている
```

### ⚙️ カスタマイズ

#### 複雑度重み設定
`scripts/pr-analysis.js` の `CONFIG.COMPLEXITY_WEIGHTS` を編集：

```javascript
COMPLEXITY_WEIGHTS: {
  typescript: 1.0,     // TypeScript基本複雑度
  tsx: 1.2,           // Reactコンポーネント
  api: 1.4,           // APIルートファイル
  // 新しいファイルタイプを追加...
}
```

#### 閾値調整
`CONFIG.THRESHOLDS` で複雑度閾値を変更：

```javascript
THRESHOLDS: {
  simple: { score: 50, time: 30 },      // シンプルな変更
  moderate: { score: 150, time: 60 },   // 中程度の複雑度
  complex: { score: 300, time: 120 },   // 複雑な変更
}
```

完全な設定とカスタマイズオプションについては [PR分析システムドキュメント](docs/PR_ANALYSIS_SYSTEM.md) を参照してください。

## 🔒 セキュリティ

### 🛡️ 日次セキュリティ監査

依存関係のセキュリティを確保するため、自動脆弱性スキャンを日次実行しています：

#### 監査スケジュール
- **実行時間**: 毎日午前2時（UTC）GitHub Actions経由
- **ツール**: npm audit（中程度以上の深刻度閾値）
- **アラート**: 重大/高レベル脆弱性の自動GitHub Issue作成
- **レポート**: JSON形式と人間可読形式の出力（30日間保持）

#### セキュリティ監査コマンド
```bash
# セキュリティ監査ワークフローテスト
npm run security:test

# 手動セキュリティ監査
npm audit --audit-level moderate

# 詳細な脆弱性情報
npm audit --json

# 高レベル脆弱性のみ表示
npm audit --audit-level high

# 修正可能な脆弱性の自動修正
npm audit fix
```

### 🔐 セキュリティベストプラクティス

#### 認証・認可
- **NextAuth.js**: 業界標準の認証ライブラリ使用
- **JWT トークン**: 安全なトークンベース認証
- **セッション管理**: 安全で持続的なユーザーセッション
- **CSRF保護**: クロスサイトリクエストフォージェリ対策

#### データ保護
- **環境変数**: 機密情報の安全な管理
- **データベース**: Prisma ORMによるSQLインジェクション対策
- **入力検証**: TypeScriptとZodによる型安全性
- **HTTPS強制**: 本番環境での暗号化通信

#### 依存関係管理
- **定期更新**: 依存関係の定期的なアップデート
- **脆弱性監視**: 既知の脆弱性の継続的な監視
- **最小権限**: 必要最小限の依存関係のみ使用
- **ライセンス管理**: オープンソースライセンスの適切な管理

### 📋 セキュリティチェックリスト

#### 開発時
- [ ] 環境変数に機密情報を適切に保存
- [ ] ユーザー入力の適切な検証とサニタイゼーション
- [ ] 認証・認可の適切な実装
- [ ] エラーハンドリングで機密情報の漏洩防止

#### デプロイ時
- [ ] HTTPS通信の強制
- [ ] セキュリティヘッダーの設定
- [ ] 依存関係の脆弱性チェック
- [ ] 環境固有の設定の分離

#### 運用時
- [ ] ログの定期的な監視
- [ ] アクセスパターンの異常検知
- [ ] セキュリティパッチの迅速な適用
- [ ] バックアップとリカバリ計画の検証

詳細なセキュリティドキュメントは [セキュリティ監査ドキュメント](.github/SECURITY_AUDIT.md) を参照してください。

## 🐳 Docker環境セットアップ

### 📦 Docker Compose構成

このプロジェクトでは、一貫した開発環境を提供するためにDocker Composeを使用しています。

#### サービス構成
```yaml
# docker-compose.yml で定義されているサービス
services:
  postgres:    # PostgreSQLデータベース
  redis:       # セッション・キャッシュストア
  app:         # Next.jsアプリケーション（オプション）
```

### 🚀 環境別セットアップ

#### 開発環境
```bash
# データベースとRedisのみ起動（推奨）
docker compose up -d postgres redis

# 全サービス起動
docker compose up -d

# ログ監視
docker compose logs -f

# 特定サービスのログ
docker compose logs -f postgres
docker compose logs -f redis
```

#### データベース管理
```bash
# データベースコンテナに接続
docker compose exec postgres psql -U postgres -d taskscheduler

# データベースバックアップ
docker compose exec postgres pg_dump -U postgres taskscheduler > backup.sql

# データベースリストア
docker compose exec -T postgres psql -U postgres taskscheduler < backup.sql

# データベースリセット
docker compose down -v
docker compose up -d postgres redis
npx prisma migrate reset
```

#### トラブルシューティング
```bash
# サービス状態確認
docker compose ps

# サービス再起動
docker compose restart postgres

# ボリュームを含む完全削除
docker compose down -v

# イメージの再ビルド
docker compose build --no-cache

# ネットワーク確認
docker network ls
docker network inspect task-scheduler_default
```

### 🔧 本番環境のDocker設定

#### Dockerfile最適化
```dockerfile
# マルチステージビルド使用
FROM node:18-alpine as builder
# 依存関係のインストール
FROM node:18-alpine as runner
# 最小限のプロダクションイメージ
```

#### 環境変数の設定
```bash
# 本番環境用.env.production
DATABASE_URL="postgresql://username:password@db:5432/taskscheduler"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-key"
```

## 🎯 ルーティンシステム詳細

### 📅 ルーティンタスク管理

繰り返しタスクの効率的な管理と自動化システムです。

#### 主要機能
- **柔軟な繰り返しパターン**: 日次、週次、月次、カスタム間隔
- **自動タスク生成**: スケジュールに基づく自動的なタスク作成
- **実績ベース最適化**: 過去のパフォーマンスデータに基づく調整
- **統計分析**: 完了率とパフォーマンストレンド

#### 利用方法
```bash
# ルーティン管理画面へアクセス
http://localhost:3000/routines

# API経由でのルーティン作成
POST /api/routines
{
  "title": "毎日の運動",
  "description": "30分のランニング",
  "repeatType": "DAILY",
  "repeatInterval": 1,
  "estimatedMinutes": 30
}

# ルーティンからタスク生成
POST /api/routines/[id]/generate-task
{
  "plannedDate": "2024-01-01"
}
```

#### データモデル
```typescript
interface Routine {
  id: string
  title: string
  description?: string
  repeatType: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  repeatInterval: number
  estimatedMinutes: number
  isActive: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}
```

### 📊 実績データ分析

#### パフォーマンス追跡
- **完了率統計**: ルーティン別の達成度
- **時間効率分析**: 予想時間 vs 実際時間
- **トレンド分析**: 長期的なパフォーマンス変化
- **最適化提案**: データベースの改善案

#### 統計API
```bash
# 日次統計取得
GET /api/stats/daily?date=2024-01-01

# 月次統計取得
GET /api/stats/monthly?year=2024&month=1

# ルーティン別統計
GET /api/routines/[id]/stats
```

## 🧪 テスト戦略

### 🎭 Playwright E2Eテスト

#### テスト構造
```
tests/e2e/
├── auth.spec.ts          # 認証フロー
├── tasks.spec.ts         # タスク管理機能
├── routines.spec.ts      # ルーティン管理
├── timer.spec.ts         # タスクタイマー
└── test-utils.ts         # 共通ユーティリティ
```

#### テスト実行戦略
- **フレキシブルセレクタ**: UI変更に対応する柔軟な要素選択
- **拡張タイムアウト**: 遅いネットワーク環境への対応
- **エラーハンドリング**: デバッグ情報の充実
- **認証ヘルパー**: 効率的なテスト認証

#### テスト検証ツール
```bash
# テスト構造検証
npm run test:validate

# アプリケーションヘルスチェック
npm run test:health

# テストデバッグ
npm run test:debug

# ビジュアルテスト
npm run test:ui
```

### 🃏 Jest単体テスト

#### テスト範囲
- **ユーティリティ関数**: ピュアファンクションのテスト
- **APIルート**: サーバーサイドロジックの検証
- **コンポーネントロジック**: React hooks とビジネスロジック
- **データ変換**: Prisma モデルとAPI間のデータ変換

#### カバレッジ目標
```bash
# カバレッジレポート生成
npm run test:unit:coverage

# カバレッジ閾値
Statements: 80%+
Branches: 75%+
Functions: 80%+
Lines: 80%+
```

## 🏗️ アーキテクチャ設計

### 📁 プロジェクト構造

```
task-scheduler/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # 認証関連API
│   │   │   ├── tasks/         # タスクAPI
│   │   │   ├── routines/      # ルーティンAPI
│   │   │   └── stats/         # 統計API
│   │   ├── auth/              # 認証ページ
│   │   ├── routines/          # ルーティン管理ページ
│   │   └── ci-performance/    # CI性能ダッシュボード
│   ├── components/            # Reactコンポーネント
│   │   ├── TaskList.tsx      # タスクリスト表示
│   │   ├── TaskForm.tsx      # タスク作成・編集
│   │   ├── TaskTimer.tsx     # タスクタイマー
│   │   ├── RoutineManager.tsx # ルーティン管理
│   │   └── DailyStats.tsx    # 日次統計表示
│   ├── lib/                   # ユーティリティ・ライブラリ
│   │   ├── auth.ts           # 認証設定
│   │   ├── prisma.ts         # Prisma クライアント
│   │   └── utils.ts          # 共通ユーティリティ
│   └── types/                 # TypeScript型定義
├── prisma/                    # データベース設定
│   ├── schema.prisma         # スキーマ定義
│   └── migrations/           # マイグレーションファイル
├── tests/                     # テストファイル
│   ├── e2e/                  # E2Eテスト
│   └── __tests__/            # 単体テスト
├── scripts/                   # 開発・CI/CDスクリプト
├── docs/                      # ドキュメント
└── .github/                   # GitHub設定・ワークフロー
```

### 🔄 データフロー

#### 1. 認証フロー
```
ユーザーログイン → NextAuth.js → JWT生成 → セッション管理
```

#### 2. タスク管理フロー
```
UI操作 → API Route → Prisma ORM → PostgreSQL → レスポンス → UI更新
```

#### 3. ルーティンシステムフロー
```
ルーティン設定 → スケジューラー → 自動タスク生成 → 統計収集 → 最適化提案
```

### 🔗 API設計

#### REST API エンドポイント
```
Authentication:
POST /api/auth/signin          # ログイン
POST /api/auth/signout         # ログアウト

Tasks:
GET    /api/tasks              # タスク一覧取得
POST   /api/tasks              # タスク作成
PUT    /api/tasks/[id]         # タスク更新
DELETE /api/tasks/[id]         # タスク削除

Routines:
GET    /api/routines           # ルーティン一覧
POST   /api/routines           # ルーティン作成
PUT    /api/routines/[id]      # ルーティン更新
DELETE /api/routines/[id]      # ルーティン削除
POST   /api/routines/[id]/generate-task  # タスク生成

Statistics:
GET    /api/stats/daily        # 日次統計
GET    /api/stats/monthly      # 月次統計
GET    /api/stats/routine/[id] # ルーティン統計
```

## 🚀 開発者ガイド

### 🛠️ 開発ワークフロー

#### 1. 機能開発
```bash
# フィーチャーブランチ作成
git checkout -b feature/new-feature

# 開発環境起動
docker compose up -d postgres redis
npm run dev

# テスト実行
npm run test:unit
npm test

# コード品質チェック
npm run lint
```

#### 2. コードレビュー
```bash
# PR分析実行
npm run pr:analyze

# テストカバレッジ確認
npm run test:unit:coverage

# セキュリティチェック
npm run security:test
```

#### 3. デプロイ準備
```bash
# 本番ビルド
npm run build

# E2Eテスト実行
npm test

# パフォーマンス監視
npm run ci:monitor
```

### 📚 学習リソース

#### 技術スタック学習
- [Next.js 15 ドキュメント](https://nextjs.org/docs)
- [Prisma ガイド](https://www.prisma.io/docs)
- [Playwright テスト](https://playwright.dev/docs/intro)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs)

#### プロジェクト特有ガイド
- [E2Eテスト改善ガイド](docs/E2E_TEST_IMPROVEMENTS.md)
- [PR分析システム](docs/PR_ANALYSIS_SYSTEM.md)
- [CI性能監視](.github/CI_PERFORMANCE_MONITORING.md)
- [セキュリティ監査](.github/SECURITY_AUDIT.md)

### 🤝 コントリビューション

#### 貢献方法
1. **Issue確認**: [GitHub Issues](https://github.com/yukifrog/task-scheduler/issues) で課題を確認
2. **フォーク**: リポジトリをフォーク
3. **ブランチ作成**: 機能ブランチを作成
4. **開発**: テスト駆動開発でコード作成
5. **PR作成**: 詳細な説明付きでプルリクエスト作成

#### コード規約
- **TypeScript**: 型安全性を重視
- **ESLint**: コード品質の維持
- **Prettier**: 一貫したコードフォーマット
- **コミットメッセージ**: [Conventional Commits](https://www.conventionalcommits.org/) 準拠

詳細は [コントリビューションガイド](CONTRIBUTING.md) を参照してください。
