import { defineConfig } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
const WEB_URL = process.env.WEB_URL || 'http://localhost:4200';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: WEB_URL,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: `${API_URL.replace('/api/v1', '')}/api/v1/health`,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npx ng serve --port 4200',
      cwd: '../frontend',
      url: WEB_URL,
      reuseExistingServer: true,
      timeout: 180000,
    },
  ],
});
