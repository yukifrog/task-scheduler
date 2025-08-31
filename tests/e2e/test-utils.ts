import { Page, expect } from '@playwright/test'

/**
 * Test utilities for common E2E test operations
 */

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Perform authentication flow
   */
  async signIn(email = 'test@example.com') {
    await this.page.goto('/')
    await this.page.click('button:has-text("サインインして開始")')
    await this.page.waitForURL('**/auth/signin**', { timeout: 20000 })
    await this.page.waitForSelector('input[type="email"]', { timeout: 15000 })
    await this.page.fill('input[type="email"]', email)
    await this.page.click('button:has-text("デモログイン")')
    await this.page.waitForURL('**/', { timeout: 20000 })
    await this.page.waitForSelector('h1:has-text("タスクスケジューラー")', { timeout: 15000 })
    await expect(this.page.locator('h1')).toContainText('タスクスケジューラー')
  }

  /**
   * Wait for element with multiple selector strategies
   */
  async waitForAnySelector(selectors: string[], timeout = 10000) {
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector)
        if (await element.isVisible({ timeout: timeout / selectors.length })) {
          return element
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    throw new Error(`None of the selectors found: ${selectors.join(', ')}`)
  }

  /**
   * Click element with multiple selector strategies
   */
  async clickAnySelector(selectors: string[], timeout = 10000) {
    const element = await this.waitForAnySelector(selectors, timeout)
    await element.click()
    return element
  }

  /**
   * Check if any of the provided text elements are visible
   */
  async checkAnyTextVisible(texts: string[], timeout = 5000) {
    const results = []
    for (const text of texts) {
      const element = this.page.locator(`text=${text}`)
      if (await element.isVisible({ timeout: timeout / texts.length })) {
        results.push({ text, found: true })
      } else {
        results.push({ text, found: false })
      }
    }
    return results
  }

  /**
   * Navigate to routines page with fallback strategies
   */
  async navigateToRoutines() {
    // Try navigation link first
    const routineLink = this.page.locator('a[href="/routines"], a:has-text("ルーティン管理")')
    if (await routineLink.isVisible({ timeout: 5000 })) {
      await routineLink.click()
    } else {
      // Fallback to direct navigation
      await this.page.goto('/routines')
    }
    
    await this.page.waitForURL('**/routines**', { timeout: 15000 })
    await this.page.waitForSelector('h1:has-text("ルーティン管理")', { timeout: 15000 })
  }

  /**
   * Debug helper - log page state
   */
  async debugPageState() {
    console.log(`Current URL: ${this.page.url()}`)
    console.log(`Page title: ${await this.page.title()}`)
    const h1 = await this.page.locator('h1').first().textContent()
    console.log(`Main heading: ${h1}`)
  }
}

/**
 * Common selectors used across tests
 */
export const SELECTORS = {
  auth: {
    signInButton: ['button:has-text("サインインして開始")', '[data-testid="sign-in"]'],
    emailInput: ['input[type="email"]', 'input[name="email"]'],
    demoLoginButton: ['button:has-text("デモログイン")', '[data-testid="demo-login"]'],
    signOutButton: ['button:has-text("サインアウト")', 'button[aria-label*="サインアウト"]', '[data-testid="sign-out"]']
  },
  tasks: {
    newTaskButton: ['button:has-text("新しいタスク")', 'button:has-text("＋ 新しいタスク")', 'button:has-text("タスクを追加")'],
    taskForm: ['[role="dialog"]', '.modal', 'form:has(input[name="title"])'],
    cancelButton: ['button:has-text("キャンセル")', '[data-testid="cancel"]'],
    deleteButton: ['button:has-text("削除")', 'button[aria-label*="削除"]', 'button:has([data-icon="delete"])']
  },
  routines: {
    newRoutineButton: ['button:has-text("新しいルーティン")', '[data-testid="new-routine"]'],
    routineForm: ['form', 'div:has(input[type="text"]):has-text("タイトル")'],
    generateButton: ['button:has-text("タスク生成")', 'button:has-text("生成")']
  },
  stats: {
    dailyStats: ['完了率', '時間効率', '実行時間', '平均中断'],
    routineStats: ['アクティブなルーティン', '今日の生成済み', '完了率']
  }
}

/**
 * Expected timeout values for different operations
 */
export const TIMEOUTS = {
  navigation: 20000,
  elementLoad: 15000,
  elementVisible: 10000,
  quickCheck: 5000,
  buttonClick: 3000
}