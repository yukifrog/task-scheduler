import { test, expect } from '@playwright/test'

test.describe('Task Management', () => {
  // 各テストの前にサインイン
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("サインインして開始")')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button:has-text("デモログイン")')
    await expect(page.locator('h1')).toContainText('タスクスケジューラー')
  })

  test('should be able to create a new task', async ({ page }) => {
    // 新しいタスクボタンをクリック
    await page.click('button:has-text("新しいタスク")')
    
    // モーダルが開くことを確認
    await expect(page.locator('text=新しいタスクを追加')).toBeVisible()
    
    // タスク情報を入力
    await page.fill('input[name="title"]', 'テストタスク')
    await page.fill('textarea[name="description"]', 'これはテスト用のタスクです')
    await page.fill('input[name="estimatedMinutes"]', '60')
    await page.selectOption('select[name="priority"]', 'HIGH')
    
    // タスクを作成
    await page.click('button:has-text("タスクを作成")')
    
    // タスクがリストに表示されることを確認
    await expect(page.locator('text=テストタスク')).toBeVisible()
  })

  test('should be able to start and pause a task', async ({ page }) => {
    // まずタスクを作成
    await page.click('button:has-text("新しいタスク")')
    await page.fill('input[name="title"]', 'タイマーテストタスク')
    await page.fill('input[name="estimatedMinutes"]', '30')
    await page.click('button:has-text("タスクを作成")')
    
    // タスクを開始
    await page.click('button:has-text("開始")')
    
    // タイマーが表示されることを確認
    await expect(page.locator('text=実行中のタスク')).toBeVisible()
    await expect(page.locator('text=タイマーテストタスク')).toBeVisible()
    
    // 一時停止
    await page.click('button:has-text("一時停止")')
    
    // タスクのステータスが変更されることを確認
    await expect(page.locator('text=PAUSED')).toBeVisible()
  })

  test('should display daily stats', async ({ page }) => {
    // デイリー統計が表示されることを確認
    await expect(page.locator('text=完了率')).toBeVisible()
    await expect(page.locator('text=時間効率')).toBeVisible()
    await expect(page.locator('text=実行時間')).toBeVisible()
    await expect(page.locator('text=平均中断')).toBeVisible()
  })

  test('should be able to delete a task', async ({ page }) => {
    // タスクを作成
    await page.click('button:has-text("新しいタスク")')
    await page.fill('input[name="title"]', '削除テストタスク')
    await page.fill('input[name="estimatedMinutes"]', '15')
    await page.click('button:has-text("タスクを作成")')
    
    // タスクが表示されることを確認
    await expect(page.locator('text=削除テストタスク')).toBeVisible()
    
    // 削除ボタンをクリック
    await page.click('button:has-text("削除")')
    
    // タスクが削除されることを確認
    await expect(page.locator('text=削除テストタスク')).not.toBeVisible()
  })
})