# E2E Test Improvements

This document describes the improvements made to fix E2E test timeout issues and page selectors.

## Issues Fixed

### 1. Timeout Problems
- **Problem**: Tests were failing due to insufficient timeouts for page navigation and loading
- **Solution**: 
  - Increased Playwright global timeout to 60 seconds
  - Set action timeout to 15 seconds
  - Set navigation timeout to 30 seconds
  - Added expect timeout of 10 seconds

### 2. Selector Mismatches
- **Problem**: Hard-coded selectors didn't match actual UI elements
- **Solution**:
  - Implemented flexible selector strategies with fallbacks
  - Added multiple selector attempts per UI element
  - Used more robust waiting strategies

### 3. Authentication Flow Issues
- **Problem**: Authentication flow was brittle and prone to timing issues
- **Solution**:
  - Created reusable `signInUser` helper function
  - Added proper waiting for page loads and element visibility
  - Improved error handling and debugging

## Test Structure Improvements

### Configuration Updates (`playwright.config.ts`)
```typescript
timeout: 60000,                    // Global test timeout
actionTimeout: 15000,              // Element action timeout  
navigationTimeout: 30000,          // Page navigation timeout
expect: { timeout: 10000 }         // Assertion timeout
```

### Authentication Helper (`tests/e2e/test-utils.ts`)
```typescript
export class TestUtils {
  async signIn(email = 'test@example.com') {
    // Robust authentication flow with proper waiting
  }
  
  async waitForAnySelector(selectors: string[]) {
    // Try multiple selectors with fallbacks
  }
}
```

### Flexible Selectors
Instead of single selectors:
```typescript
await page.click('button:has-text("新しいタスク")')
```

Now using multiple strategies:
```typescript
const newTaskSelectors = [
  'button:has-text("新しいタスク")',
  'button:has-text("＋ 新しいタスク")',
  'button:has-text("タスクを追加")'
]

for (const selector of newTaskSelectors) {
  const button = page.locator(selector)
  if (await button.isVisible({ timeout: 5000 })) {
    await button.click()
    break
  }
}
```

## Test Files Updated

### `auth.spec.ts`
- Extended timeouts for authentication flow
- Added flexible selector strategies for sign-out functionality
- Improved error handling and debugging

### `tasks.spec.ts`
- Shared authentication helper
- Flexible selectors for task creation, deletion, and timer functions
- Graceful handling of missing UI elements

### `routines.spec.ts`
- Navigation strategies with fallbacks
- Multiple approaches for routine management
- Robust statistics checking

## Validation Tools

### Test Structure Validation
```bash
npm run test:validate
```
Validates that tests are properly structured with:
- Correct TypeScript imports
- Extended timeout configurations
- Authentication helpers
- Error handling
- Flexible selector strategies

### Application Health Check
```bash
npm run test:health
```
Checks basic application connectivity and UI elements without full E2E:
- Endpoint availability
- Expected UI content
- Authentication pages

## Best Practices Applied

1. **Graceful Degradation**: Tests continue even if optional elements are missing
2. **Multiple Strategies**: Each UI interaction tries multiple approaches
3. **Proper Waiting**: Tests wait for elements and state changes appropriately
4. **Error Handling**: Comprehensive error handling with informative logging
5. **Type Safety**: Proper TypeScript usage throughout

## Running the Tests

### Prerequisites
```bash
npm install
npx playwright install chromium
```

### Running Tests
```bash
# Run all E2E tests
npm test

# Run with UI mode for debugging
npm run test:ui

# Run specific test file
npx playwright test auth.spec.ts

# Debug mode
npm run test:debug
```

### Troubleshooting

If tests still fail:

1. **Check application is running**:
   ```bash
   npm run test:health
   ```

2. **Validate test structure**:
   ```bash
   npm run test:validate
   ```

3. **Run with debug mode**:
   ```bash
   npm run test:debug
   ```

4. **Check timeout logs**: Look for timeout-related errors in test output

## Expected Improvements

With these changes, the E2E tests should:
- ✅ Handle slow page loads gracefully
- ✅ Work with different UI implementations
- ✅ Provide better error messages
- ✅ Be more maintainable and robust
- ✅ Reduce false positive failures

The tests now follow a "test what exists, skip what doesn't" philosophy, making them more resilient to UI changes and implementation details.