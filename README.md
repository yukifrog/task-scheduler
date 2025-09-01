# タスクスケジューラー

日々のスケジュールを精密かつ柔軟に整理するための、モダンなフルスタック・タスク管理アプリケーションです。

## ✨ 主な機能

- **包括的なタスク管理:** 優先度、重要度、見積もり時間などの詳細な属性を持つタスクを作成、管理、追跡します。
- **高度なルーチンシステム:** 定期的なタスク（毎日、毎週、毎月）を定義し、スケジュールを自動化します。
- **インテリジェントなタスク追跡:** 内蔵タイマーが作業、休憩、中断を記録します。気分やエネルギーレベルを記録して、生産性に関する洞察を得ることができます。
- **パーソナライズされたユーザー設定:** タイムゾーンや通知（Discord、Telegram）の設定で、体験をカスタマイズできます。
- **環境要因との相関:** オプションで天気などの環境データを追跡し、集中力にどう影響するかを確認できます。
- **分析と洞察:** 専用の分析キャッシュが、生産性データへの高速なアクセスを提供します。
- **セキュアな認証:** Next-Auth.jsによる堅牢なユーザー認証機能を備えています。
- **コンテナ化された環境:** 簡単な開発とデプロイのための完全なDockerセットアップが付属しています。

## 🛠️ 技術スタック

- **フレームワーク:** [Next.js](https://nextjs.org/) (App Router)
- **言語:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://reactjs.org/) & [Tailwind CSS](https://tailwindcss.com/)
- **データベース:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **キャッシング:** [Redis](https://redis.io/)
- **認証:** [Next-Auth.js](https://next-auth.js.org/)
- **コンテナ化:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **テスト:** [Playwright](https://playwright.dev/) (E2E) & [Jest](https://jestjs.io/) (ユニット/インテグレーション)
- **リンティング:** [ESLint](https://eslint.org/)

## 🚀 はじめに

### 1. Dockerでの起動（推奨）

このプロジェクトは完全にコンテナ化されています。最適な開発体験のために、Dockerを使用して開発環境をセットアップすることをお勧めします。

**前提条件:**
- [Docker](https://www.docker.com/get-started) がインストールされ、実行中であること。
- [Docker Compose](https://docs.docker.com/compose/install/) がインストールされていること。

**手順:**

1.  **リポジトリをクローン:**
    ```bash
    git clone <repository-url>
    cd task-scheduler
    ```

2.  **環境ファイルを作成:**
    環境ファイルの例をコピーします。デフォルト値はDockerセットアップ用に設定されています。
    ```bash
    cp .env.local .env
    ```

3.  **サービスを開始:**
    このコマンドは、イメージをビルドし、Next.jsアプリケーション、PostgreSQLデータベース、Redisキャッシュを開始し、データベースのマイグレーションを適用します。
    ```bash
    docker-compose up --build
    ```

4.  **アプリケーションにアクセス:**
    ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。データベースはポート `5432` でアクセス可能で、[Adminer](http://localhost:8080)（Dockerセットアップに含まれています）のようなツールで管理できます。

### 2. 手動セットアップ

Dockerを使用したくない場合は、手動でプロジェクトをセットアップすることもできます。

**前提条件:**
- [Node.js](https://nodejs.org/) (バージョン20以降)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Redis](https://redis.io/docs/getting-started/installation/)

**手順:**

1.  **依存関係をインストール:**
    ```bash
    npm install
    ```

2.  **環境変数を設定:**
    `.env` ファイルを作成し、ローカル設定用の変数（データベース接続、NextAuthシークレットなど）を構成します。
    ```env
    # .env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    NEXTAUTH_SECRET="your_nextauth_secret"
    NEXTAUTH_URL="http://localhost:3000"
    # ... その他の変数
    ```

3.  **データベースマイグレーション:**
    Prismaを使用してデータベーススキーマをデータベースに適用します。
    ```bash
    npx prisma migrate dev
    ```

4.  **開発サーバーを実行:**
    ```bash
    npm run dev
    ```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認します。

## 📜 利用可能なスクリプト

- `npm run dev`: Turbopackで開発サーバーを起動します。
- `npm run build`: Turbopackを使用して本番用にアプリケーションをビルドします。
- `npm run start`: 本番サーバーを起動します。
- `npm run lint`: ESLintを実行してコード品質の問題をチェックします。
- `npm run test`: Playwright E2Eテストを実行します。
- `npm run test:ui`: インタラクティブUIモードでPlaywright E2Eテストを実行します。
- `npm run test:debug`: デバッグモードでPlaywright E2Eテストを実行します。
- `npm run test:report`: 最新のPlaywrightテストレポートを表示します。
- `npm run test:unit`: Jestユニットテストを実行します。
- `npm run test:unit:watch`: ウォッチモードでJestユニットテストを実行します。
- `npm run test:unit:coverage`: Jestを実行し、テストカバレッジレポートを生成します。
- `npm run test:validate`: テストを検証します。
- `npm run test:health`: ヘルスチェックを実行します。
- `npm run ci:monitor`: CIのパフォーマンスを監視します。
- `npm run ci:report`: パフォーマンスレポートを生成します。
- `npm run security:test`: セキュリティ監査ワークフローのロジックと検証をテストします。

## ⚡ CI/CDの最適化

このプロジェクトは、CIパイプラインの実行時間を大幅に短縮するために、包括的なGitHub Actionsキャッシングを実装しています。

### パフォーマンス改善
- **Playwrightブラウザ**: 設定に従いchromiumのみをインストールし、実行間でキャッシュします。
- **依存関係**: `--prefer-offline --no-audit` を使用した積極的なnpmキャッシング。
- **ビルドキャッシュ**: Next.jsのビルド成果物をキャッシュし、インクリメンタルビルドを高速化します。
- **データベース**: スキーマの変更に基づいてPrismaクライアントの生成をキャッシュします。

### 期待されるパフォーマンス
- **改善前**: パイプライン実行時間 4〜6分
- **改善後**: パイプライン実行時間 1.5〜2.5分（約60%高速化）
- **キャッシュヒット率**: 依存関係の変更がない再ビルドで85〜95%

詳細は [Caching Strategy](.github/CACHING_STRATEGY.md) を参照してください。

### パフォーマンス監視
リアルタイムのCIパフォーマンス監視とメトリクスダッシュボード：
- **ダッシュボード**: `/ci-performance` にアクセスして現在のメトリクスを表示
- **自動監視**: 6時間ごとにアラート付きで実行
- **パフォーマンスレポート**: チャート付きの包括的なHTMLレポート
- **アラート**: パフォーマンス低下時に自動でIssueを作成

詳細は [CI Performance Monitoring](.github/CI_PERFORMANCE_MONITORING.md) を参照してください。

### キャッシュパフォーマンスのテスト
```bash
# キャッシュテストワークフローを手動でトリガー
gh workflow run test-cache.yml

# CIのパフォーマンスを監視
npm run ci:monitor

# パフォーマンスレポートを生成
npm run ci:report
```

## 🔒 セキュリティ

### 毎日のセキュリティ監査
依存関係のセキュリティを確保するために、自動化された脆弱性スキャンが毎日実行されます。
- **スケジュール**: 毎日午前2時（UTC）にGitHub Actions経由で実行
- **ツール**: `npm audit`（中程度以上の深刻度を閾値とする）
- **アラート**: 重大/高リスクの脆弱性に対して自動でGitHub Issueを作成
- **レポート**: JSONおよび人間が読める形式の出力（30日間保持）

```bash
# セキュリティ監査ワークフローをテスト
npm run security:test

# 手動でセキュリティ監査を実行
npm audit --audit-level moderate
```

詳細は [Security Audit Documentation](.github/SECURITY_AUDIT.md) を参照してください。