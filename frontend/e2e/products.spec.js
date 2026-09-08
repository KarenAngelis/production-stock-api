const { test, expect } = require('@playwright/test');

test('create a product through the UI and persist it after reload', async ({ page, request }, testInfo) => {
  const code = `E2E-${Date.now()}`;
  const name = 'Portfolio demo product';
  await page.goto('/produtos');
  await expect(page.getByRole('heading', { name: 'Produtos', exact: true })).toBeVisible();
  await page.getByLabel('Código do produto').fill(code);
  await page.getByLabel('Nome do produto').fill(name);
  await expect(page.getByRole('button', { name: 'Salvar', exact: true })).toBeDisabled();
  await page.getByLabel('Preço do produto').fill('49.90');
  const saved = page.waitForResponse(response => response.url().endsWith('/products/') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  const response = await saved;
  expect(response.status()).toBe(200);
  const product = await response.json();
  try {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    const persisted = await request.get(`http://127.0.0.1:8000/products/${product.id}`);
    expect(persisted.ok()).toBeTruthy();
    expect((await persisted.json()).code).toBe(code);
    const screenshot = testInfo.outputPath('products.png');
    await page.screenshot({ path: screenshot, fullPage: true });
    await testInfo.attach('Product persisted in real API', { path: screenshot, contentType: 'image/png' });
  } finally {
    await request.delete(`http://127.0.0.1:8000/products/${product.id}`);
  }
});
