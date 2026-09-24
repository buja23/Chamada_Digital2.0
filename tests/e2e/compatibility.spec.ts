import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/** Coleta erros JavaScript da página durante o teste */
async function collectJsErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

// ─────────────────────────────────────────────────────────
// Testes
// ─────────────────────────────────────────────────────────

test.describe('🌐 Compatibilidade Cross-Browser', () => {

  test('Login: carrega sem tela branca', async ({ page }) => {
    const errors = await collectJsErrors(page);

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // #root não deve estar vazio (tela branca = root vazio)
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();

    // Formulário de login deve estar visível
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Nenhum erro JS crítico (ResizeObserver é ignorado — falso positivo comum)
    const criticalErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('Login: sem tela branca após 3 segundos', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);
  });

  test('Login: navegar para chamada após login', async ({ page }) => {
    await page.goto('/login');

    // Preenche e submete o formulário
    await page.fill('input[type="email"]', 'teste@chamada.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // Deve redirecionar para /students
    await expect(page).toHaveURL(/students/);

    // Página não deve estar branca
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });

  test('Attendance: página carrega corretamente', async ({ page }) => {
    const errors = await collectJsErrors(page);

    // Acessa diretamente (sem auth real ainda)
    await page.goto('/attendance');
    await page.waitForLoadState('networkidle');

    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();

    // Sem erros críticos de JS
    const criticalErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('Students: página carrega corretamente', async ({ page }) => {
    await page.goto('/students');
    await page.waitForLoadState('networkidle');

    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });

  test('History: página carrega corretamente', async ({ page }) => {
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });

  test('404: rota inexistente exibe página de não encontrado', async ({ page }) => {
    await page.goto('/rota-que-nao-existe');
    await page.waitForLoadState('networkidle');

    // Deve renderizar algo (a página 404), não uma tela branca
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });

  test('Layout responsivo: mobile — login visível', async ({ page }) => {
    // Emula viewport de celular (caso não venha de um device profile)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');

    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('Bundle legado: arquivo dist/index.html contém script nomodule', async ({ page: _page }) => {
    // O plugin-legacy injeta <script nomodule> no HTML de produção (dist/index.html).
    // O servidor de preview do Vite serve esse arquivo, mas page.content() retorna
    // o HTML re-parseado pelo browser sem o nomodule. Verificamos o arquivo diretamente.
    const fs = await import('fs');
    const path = await import('path');
    const distHtml = fs.readFileSync(path.resolve('dist/index.html'), 'utf-8');

    // Deve conter o bundle de polyfills legado
    expect(distHtml).toContain('nomodule');
    expect(distHtml).toContain('polyfills-legacy');
    expect(distHtml).toContain('vite-legacy-entry');
  });

});
