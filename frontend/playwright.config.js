const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    browserName: 'chromium',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'on',
  },
  webServer: [
    { command: 'python ../scripts/run_e2e_api.py', url: 'http://127.0.0.1:8000/', reuseExistingServer: false },
    {
      command: 'npm start', url: 'http://127.0.0.1:3000', timeout: 120000,
      env: { BROWSER: 'none', HOST: '127.0.0.1', PORT: '3000', REACT_APP_API_URL: 'http://127.0.0.1:8000', REACT_APP_DEMO_MODE: 'false' },
      reuseExistingServer: false,
    },
  ],
});
