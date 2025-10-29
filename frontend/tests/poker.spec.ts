import { test, expect } from '@playwright/test';

test.describe('Poker Game E2E', () => {
  test('should play a simple hand', async ({ page }) => {
    // Load the poker game interface
    await page.goto('/', { timeout: 15000 });
    
    // Verify the interface loads correctly
    await expect(page.getByText('Poker Game')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Game Setup')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Actions')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Play Log')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Hand History')).toBeVisible({ timeout: 5000 });
    
    // Start a new hand
    await page.getByRole('button', { name: 'Start Hand' }).click({ timeout: 10000 });
    
    // Wait for current player to be displayed
    await expect(page.getByText('Current Player:')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Reset Hand' })).toBeVisible({ timeout: 5000 });
    
    // Make a bet action
    await page.getByRole('button', { name: 'Bet' }).click({ timeout: 10000 });
    
    // Check that action appears in play log
    await expect(page.getByText(/bets/)).toBeVisible({ timeout: 10000 });
    
    // Fold remaining players to complete the hand
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: 'Fold' }).click({ timeout: 10000 });
    }
    
    // Check that hand is complete
    await expect(page.getByText('Hand Complete!')).toBeVisible({ timeout: 10000 });
  });
});
