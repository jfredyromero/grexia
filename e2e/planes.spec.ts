import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// T11 — Página de Planes
// ─────────────────────────────────────────────────────────────────────────────

test.describe('T11 — Página de Planes', () => {
    test('/planes carga correctamente', async ({ page }) => {
        const response = await page.goto('planes');
        expect(response?.status()).toBe(200);
    });

    test('hero visible con título principal', async ({ page }) => {
        await page.goto('planes');
        const hero = page.locator('h1');
        await expect(hero).toBeVisible();
        await expect(hero).toContainText('Documentos legales para todos');
    });

    test('sección #planes visible con los 3 planes', async ({ page }) => {
        await page.goto('planes');
        const planesSection = page.locator('#planes');
        await expect(planesSection).toBeVisible();
        await expect(planesSection.getByText('Gratis')).toBeVisible();
        await expect(planesSection.getByText('Asesoría')).toBeVisible();
        await expect(planesSection.getByText('Empresarial')).toBeVisible();
    });

    test('sección #como-funciona visible', async ({ page }) => {
        await page.goto('planes');
        const section = page.locator('#como-funciona');
        await expect(section).toBeVisible();
        await expect(section.getByText('Plan Gratis')).toBeVisible();
        await expect(section.getByText('Asesoría Legal')).toBeVisible();
    });

    test('tabla de comparación #comparacion visible', async ({ page }) => {
        await page.goto('planes');
        const section = page.locator('#comparacion');
        await expect(section).toBeVisible();
        await expect(section.locator('table')).toBeVisible();
    });

    test('tabla de comparación contiene los 3 planes en el header', async ({ page }) => {
        await page.goto('planes');
        const table = page.locator('#comparacion table');
        await expect(table.getByText('Gratis').first()).toBeVisible();
        await expect(table.getByText('Asesoría').first()).toBeVisible();
        await expect(table.getByText('Empresarial').first()).toBeVisible();
    });

    test('CTA final visible con ambos botones', async ({ page }) => {
        await page.goto('planes');
        const ctaSection = page.locator('#cta-final');
        await expect(ctaSection).toBeVisible();
        await expect(ctaSection.getByRole('link', { name: /Generar documento gratis/i })).toBeVisible();
        await expect(ctaSection.getByRole('link', { name: /Agendar asesoría/i })).toBeVisible();
    });

    test('pills de navegación rápida visibles en el hero', async ({ page }) => {
        await page.goto('planes');
        await expect(page.getByRole('link', { name: 'Ver planes' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Cómo funciona' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Comparar planes' })).toBeVisible();
    });

    test('link "Planes" en navbar navega a /planes', async ({ page }) => {
        await page.goto();
        const planesLink = page.locator('header').getByRole('link', { name: 'Planes' }).first();
        await expect(planesLink).toBeVisible();
        await planesLink.click();
        await expect(page).toHaveURL(/\/grexia\/planes/);
    });
});
