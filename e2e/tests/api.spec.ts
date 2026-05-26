import { test, expect } from '@playwright/test';

const API = process.env.API_URL || 'http://localhost:5000/api/v1';
const password = 'password123';

test.describe('FletNix API', () => {
  test('register then login immediately', async ({ request }) => {
    const email = `e2e_${Date.now()}@test.com`;
    const reg = await request.post(`${API}/auth/register`, {
      data: { email, password, age: 25, name: 'E2E User' },
    });
    expect(reg.ok()).toBeTruthy();

    const login = await request.post(`${API}/auth/login`, {
      data: { email, password },
    });
    expect(login.ok()).toBeTruthy();
    const body = await login.json();
    expect(body.data.accessToken).toBeTruthy();
  });

  test('shows require auth', async ({ request }) => {
    const res = await request.get(`${API}/shows`);
    expect(res.status()).toBe(401);
  });

  test('health check', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
  });
});
