import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // テストディレクトリ
  testDir: './tests/e2e',
  
  // 並列実行設定
  fullyParallel: true,
  
  // CI環境での設定
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // レポート設定
  reporter: 'html',
  
  use: {
    // ベースURL（実際の開発サーバーポートに合わせる）
    baseURL: 'http://localhost:3001',
    
    // トレース設定
    trace: 'on-first-retry',
    
    // スクリーンショット設定
    screenshot: 'only-on-failure',
    
    // ビデオ設定
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 開発サーバー設定
  webServer: {
    command: 'PORT=3001 npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
})