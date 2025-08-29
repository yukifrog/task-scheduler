# タスクスケジューラー - Claude Code学習プロジェクト

このプロジェクトは、Claude Codeの高度機能（Subagent、Hook、MCP）を学習するためのタスクシュート方式タスク管理アプリケーションです。

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
2. **認証システム**: NextAuth.jsによるデモログイン
3. **CRUD機能**: タスクの作成・読み取り・更新・削除
4. **UI/UX**: TaskList、TaskForm、TaskTimer、DailyStats
5. **Playwrightテスト**: E2Eテスト環境

### 🔄 進行中
6. **Hook機能**: 
   - コミット時の自動lint/test
   - ビルド時のセキュリティチェック
   - デプロイ前のE2Eテスト

### 📋 予定
7. **Subagent機能**: 
   - ルーティンタスクの設計調査
   - パフォーマンス最適化提案
   - 外部API仕様調査

8. **MCP連携**: 
   - Discord/Telegram通知
   - GitHub Issues連携
   - 外部API統合管理

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
- [ ] Hook機能設定
- [ ] Subagent活用
- [ ] MCP連携実装
- [ ] ルーティンタスク管理
- [ ] 外部サービス連携