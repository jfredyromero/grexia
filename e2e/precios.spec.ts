import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// T11 — Página de Precios
// ─────────────────────────────────────────────────────────────────────────────

test.describe('T11 — Página de Precios', () => {
    test('/precios carga correctamente', async ({ page }) => {
        const response = await page.goto('precios');
        expect(response?.status()).toBe(200);
    });

    test('hero visible con título principal', async ({ page }) => {
        await page.goto('precios');
        const hero = page.locator('h1').first();
        await expect(hero).toBeVisible();
        await expect(hero).toContainText('Elige el plan ideal');
    });

    test('sección #precios visible con los 3 planes', async ({ page }) => {
        await page.goto('precios');
        const preciosSection = page.locator('#precios');
        await expect(preciosSection).toBeVisible();
        await expect(preciosSection.getByText('Gratis').first()).toBeVisible();
        await expect(preciosSection.getByText('Asesoría').first()).toBeVisible();
        await expect(preciosSection.getByText('Empresarial').first()).toBeVisible();
    });

    test('sección #como-funciona visible', async ({ page }) => {
        await page.goto('precios');
        const section = page.locator('#como-funciona');
        await expect(section).toBeVisible();
        await expect(section.getByText('Plan Gratis')).toBeVisible();
        await expect(section.getByText('Asesoría Legal')).toBeVisible();
    });

    test('tabla de comparación #comparacion visible', async ({ page }) => {
        await page.goto('precios');
        const section = page.locator('#comparacion');
        await expect(section).toBeVisible();
        await expect(section.locator('table')).toBeVisible();
    });

    test('tabla de comparación contiene los 3 planes en el header', async ({ page }) => {
        await page.goto('precios');
        const table = page.locator('#comparacion table');
        await expect(table.getByText('Gratis').first()).toBeVisible();
        await expect(table.getByText('Asesoría').first()).toBeVisible();
        await expect(table.getByText('Empresarial').first()).toBeVisible();
    });

    test('CTA final visible con ambos botones', async ({ page }) => {
        await page.goto('precios');
        const ctaSection = page.locator('#cta-final');
        await expect(ctaSection).toBeVisible();
        await expect(ctaSection.getByRole('link', { name: /Generar documento gratis/i })).toBeVisible();
        await expect(ctaSection.getByRole('link', { name: /Agendar asesoría/i })).toBeVisible();
    });

    test('secciones principales visibles por id', async ({ page }) => {
        await page.goto('precios');
        await expect(page.locator('#precios')).toBeVisible();
        await expect(page.locator('#como-funciona')).toBeVisible();
        await expect(page.locator('#comparacion')).toBeVisible();
    });

    test('link "Precios" en navbar navega a /precios', async ({ page }) => {
        await page.goto('');
        const preciosLink = page.locator('header').getByRole('link', { name: 'Precios' }).first();
        await expect(preciosLink).toBeVisible();
        await preciosLink.click();
        await expect(page).toHaveURL(/\/precios/);
    });
});
