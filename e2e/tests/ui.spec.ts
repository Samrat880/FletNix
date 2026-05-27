import { test, expect } from '@playwright/test';

const password = 'password123';

test.describe('FletNix UI', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-title')).toBeVisible();
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('site-footer')).toBeVisible();
  });

  test('register page renders', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByTestId('register-title')).toBeVisible();
    await expect(page.getByTestId('register-age')).toBeVisible();
  });

  test('browse requires auth redirect', async ({ page }) => {
    await page.goto('/browse');
    await expect(page).toHaveURL(/login/);
  });

  test('preferences requires auth redirect', async ({ page }) => {
    await page.goto('/preferences');
    await expect(page).toHaveURL(/login/);
  });

  test('register form validation', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByTestId('register-submit')).toBeDisabled();
    await page.getByTestId('register-email').fill('test@example.com');
    await page.getByTestId('register-password').fill('password123');
    await expect(page.getByTestId('register-submit')).toBeEnabled();
  });
});
