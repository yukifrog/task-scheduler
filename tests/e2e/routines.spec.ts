import { test, expect } from '@playwright/test'

test.describe('Routine Management', () => {
  // 各テストの前にサインイン
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("サインインして開始")')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button:has-text("デモログイン")')
    await expect(page.locator('h1')).toContainText('タスクスケジューラー')
  })

  test('should navigate to routines page', async ({ page }) => {
    // ルーティンページに移動
    await page.click('a:has-text("ルーティン")')
    
    // ルーティンページが表示されることを確認
    await expect(page.url()).toContain('/routines')
    await expect(page.locator('h1')).toContainText('ルーティン管理')
  })

  test('should be able to create a new routine', async ({ page }) => {
    // ルーティンページに移動
    await page.click('a:has-text("ルーティン")')
    
    // 新しいルーティンボタンをクリック
    await page.click('button:has-text("新しいルーティン")')
    
    // モーダルが開くことを確認
    await expect(page.locator('text=新しいルーティンを追加')).toBeVisible()
    
    // ルーティン情報を入力
    await page.fill('input[name="name"]', 'テストルーティン')
    await page.fill('textarea[name="description"]', 'これはテスト用のルーティンです')
    await page.selectOption('select[name="frequency"]', 'DAILY')
    await page.fill('input[name="estimatedMinutes"]', '45')
    await page.selectOption('select[name="priority"]', 'MEDIUM')
    
    // ルーティンを作成
    await page.click('button:has-text("ルーティンを作成")')
    
    // ルーティンがリストに表示されることを確認
    await expect(page.locator('text=テストルーティン')).toBeVisible()
    await expect(page.locator('text=DAILY')).toBeVisible()
  })

  test('should be able to generate task from routine', async ({ page }) => {
    // ルーティンページに移動
    await page.click('a:has-text("ルーティン")')
    
    // テスト用ルーティンを作成
    await page.click('button:has-text("新しいルーティン")')
    await page.fill('input[name="name"]', 'タスク生成テスト')
    await page.fill('input[name="estimatedMinutes"]', '30')
    await page.selectOption('select[name="frequency"]', 'DAILY')
    await page.click('button:has-text("ルーティンを作成")')
    
    // タスク生成ボタンをクリック
    await page.click('button:has-text("タスクを生成")')
    
    // 成功メッセージが表示されることを確認
    await expect(page.locator('text=タスクが生成されました')).toBeVisible()
    
    // タスクページに移動して確認
    await page.click('a:has-text("ダッシュボード")')
    await expect(page.locator('text=タスク生成テスト')).toBeVisible()
  })

  test('should be able to edit a routine', async ({ page }) => {
    // ルーティンページに移動
    await page.click('a:has-text("ルーティン")')
    
    // テスト用ルーティンを作成
    await page.click('button:has-text("新しいルーティン")')
    await page.fill('input[name="name"]', '編集テストルーティン')
    await page.fill('input[name="estimatedMinutes"]', '20')
    await page.selectOption('select[name="frequency"]', 'WEEKLY')
    await page.click('button:has-text("ルーティンを作成")')
    
    // 編集ボタンをクリック
    await page.click('button:has-text("編集")')
    
    // 編集フォームが表示されることを確認
    await expect(page.locator('text=ルーティンを編集')).toBeVisible()
    
    // 情報を変更
    await page.fill('input[name="name"]', '編集済みルーティン')
    await page.fill('input[name="estimatedMinutes"]', '35')
    
    // 保存
    await page.click('button:has-text("保存")')
    
    // 変更が反映されることを確認
    await expect(page.locator('text=編集済みルーティン')).toBeVisible()
  })

  test('should be able to delete a routine', async ({ page }) => {
    // ルーティンページに移動
    await page.click('a:has-text("ルーティン")')
    
    // テスト用ルーティンを作成
    await page.click('button:has-text("新しいルーティン")')
    await page.fill('input[name="name"]', '削除テストルーティン')
    await page.fill('input[name="estimatedMinutes"]', '15')
    await page.selectOption('select[name="frequency"]', 'DAILY')
    await page.click('button:has-text("ルーティンを作成")')
    
    // ルーティンが表示されることを確認
    await expect(page.locator('text=削除テストルーティン')).toBeVisible()
    
    // 削除ボタンをクリック
    await page.click('button:has-text("削除")')
    
    // ルーティンが削除されることを確認
    await expect(page.locator('text=削除テストルーティン')).not.toBeVisible()
  })

  test('should display routine statistics', async ({ page }) => {
    // ルーティンページに移動
    await page.click('a:has-text("ルーティン")')
    
    // 統計情報が表示されることを確認
    await expect(page.locator('text=アクティブなルーティン')).toBeVisible()
    await expect(page.locator('text=今日の生成済み')).toBeVisible()
    await expect(page.locator('text=完了率')).toBeVisible()
  })

  test('should filter routines by frequency', async ({ page }) => {
    // ルーティンページに移動
    await page.click('a:has-text("ルーティン")')
    
    // 異なる頻度のルーティンを作成
    await page.click('button:has-text("新しいルーティン")')
    await page.fill('input[name="name"]', '日次ルーティン')
    await page.fill('input[name="estimatedMinutes"]', '30')
    await page.selectOption('select[name="frequency"]', 'DAILY')
    await page.click('button:has-text("ルーティンを作成")')
    
    await page.click('button:has-text("新しいルーティン")')
    await page.fill('input[name="name"]', '週次ルーティン')
    await page.fill('input[name="estimatedMinutes"]', '60')
    await page.selectOption('select[name="frequency"]', 'WEEKLY')
    await page.click('button:has-text("ルーティンを作成")')
    
    // フィルターが存在する場合はテスト（実装状況による）
    // TODO: フィルター機能実装後に追加
  })
})