import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright — Testes Cross-Browser de Compatibilidade
 * Cobre: Chrome, Firefox, Safari/WebKit, iOS, Android e tablet.
 * Roda contra o build de produção via `vite preview`.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  // Tenta novamente em CI para evitar falsos negativos de flakiness
  retries: process.env.CI ? 2 : 0,
  // Relatório nativo do GitHub Actions + lista local
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    // Aponta para o servidor de preview do Vite
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // Sobe o servidor de preview antes dos testes
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    // ── Desktop ──────────────────────────────────────
    {
      name: 'Chrome (Desktop)',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Firefox (Desktop)',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Safari/WebKit (Desktop)',
      use: { ...devices['Desktop Safari'] },
    },
    // ── Mobile ───────────────────────────────────────
    {
      name: 'iPhone 14 (iOS Safari)',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'Samsung Galaxy S9 (Android Chrome)',
      use: { ...devices['Galaxy S9+'] },
    },
    // ── Tablet ───────────────────────────────────────
    {
      name: 'iPad Pro (Tablet)',
      use: { ...devices['iPad Pro 11'] },
    },
  ],
});
