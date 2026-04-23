import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// T09 — Footer y navbar
// ─────────────────────────────────────────────────────────────────────────────

test.describe('T09 — Footer y Navbar', () => {
    test('footer visible en home', async ({ page }) => {
        await page.goto();
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
    });

    test('footer contiene copyright con año actual', async ({ page }) => {
        await page.goto();
        const currentYear = new Date().getFullYear().toString();
        const footer = page.locator('footer');
        await expect(footer).toContainText(currentYear);
    });

    test('link "Ayuda" visible en navbar desktop', async ({ page }) => {
        await page.goto();
        const ayudaLink = page.locator('header').getByRole('link', { name: 'Ayuda' }).first();
        await expect(ayudaLink).toBeVisible();
    });

    test('clic en "Ayuda" navega a /ayuda', async ({ page }) => {
        await page.goto();
        const ayudaLink = page.locator('header').getByRole('link', { name: 'Ayuda' }).first();
        await ayudaLink.click();
        await expect(page).toHaveURL(/ayuda/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// T10 — Página de Ayuda
// ─────────────────────────────────────────────────────────────────────────────

test.describe('T10 — Página de Ayuda', () => {
    test('/ayuda carga y muestra el hero', async ({ page }) => {
        await page.goto('ayuda');
        const hero = page.locator('h1');
        await expect(hero).toBeVisible();
    });

    test('las pills de navegación son visibles', async ({ page }) => {
        await page.goto('ayuda');
        await expect(page.getByRole('link', { name: /Preguntas Frecuentes/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Términos y Condiciones/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Política de Privacidad/i })).toBeVisible();
    });

    test('el accordion muestra todas las preguntas (12 botones)', async ({ page }) => {
        await page.goto('ayuda');
        const faqSection = page.locator('#faqs');
        const buttons = faqSection.getByRole('button');
        await expect(buttons).toHaveCount(12);
    });

    test('click en primera pregunta la expande (aria-expanded="true")', async ({ page }) => {
        await page.goto('ayuda');
        const faqSection = page.locator('#faqs');
        const firstButton = faqSection.getByRole('button').first();
        await expect(firstButton).toHaveAttribute('aria-expanded', 'false');
        await firstButton.click();
        await expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('navegar a #terminos — sección visible', async ({ page }) => {
        await page.goto('ayuda#terminos');
        const section = page.locator('#terminos');
        await expect(section).toBeVisible();
    });

    test('navegar a #privacidad — sección visible', async ({ page }) => {
        await page.goto('ayuda#privacidad');
        const section = page.locator('#privacidad');
        await expect(section).toBeVisible();
    });
});
