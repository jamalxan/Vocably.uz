// E2E (TZ §58): vocab o'yin oqimi haqiqiy brauzerda. Alohida (bo'sh) MongoDB bazasi kerak:
//   E2E_MONGODB_URI=mongodb://127.0.0.1:27017/vocably_e2e npm run test:e2e
// Test foydalanuvchi va so'zlar global-setup'da shu bazaga yoziladi — ishlab chiqarish bazasiga ISHLATMANG.
import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const uri = process.env.E2E_MONGODB_URI || '';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 60_000,
  retries: 0,
  // Testlar bitta test foydalanuvchi (faol sessiya, kunlik limit) holatini bo'lishadi — ketma-ket yuradi.
  workers: 1,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { MONGODB_URI: uri, JWT_SECRET: process.env.JWT_SECRET || 'e2e-secret' },
  },
});
