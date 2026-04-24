import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Smoke tests para las guías legales
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Guía — Pagaré', () => {
    const URL = '/guias/pagare';

    test('carga y muestra el hero con H1 correcto', async ({ page }) => {
        await page.goto(URL);
        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();
        await expect(h1).toContainText(/pagar[eé]/i);
        await expect(h1).toContainText(/Colombia/i);
    });

    test('tiene CTA primario al generador del pagaré', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Generar pagar[eé] gratis/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/pagare\/generar/);
    });

    test('tiene CTA secundario para hablar con un abogado', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Hablar con un abogado/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /asesoria\/checkout/);
    });

    test('muestra la sección de riesgos legales', async ({ page }) => {
        await page.goto(URL);
        await expect(
            page.getByRole('heading', { name: /Qu[eé] pasa si firmas o cobras un pagar[eé] mal hecho/i })
        ).toBeVisible();
        await expect(page.getByText(/Art[ií]culo 789/i)).toBeVisible();
    });

    test('cita el artículo 709 del Código de Comercio', async ({ page }) => {
        await page.goto(URL);
        await expect(page.getByText(/Art\. 709/i).first()).toBeVisible();
    });

    test('FAQ accordion responde a clicks', async ({ page }) => {
        await page.goto(URL);
        const firstQuestion = page.getByRole('button', { name: /pagar[eé] escrito en una servilleta/i }).first();
        await expect(firstQuestion).toBeVisible();
        await firstQuestion.click();
        await expect(page.getByText(/art[ií]culo 621 y 709/i).first()).toBeVisible();
    });

    test('breadcrumb muestra "Guías" y "Pagaré"', async ({ page }) => {
        await page.goto(URL);
        const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
        await expect(breadcrumb).toBeVisible();
        await expect(breadcrumb.getByRole('link', { name: /Gu[ií]as/i })).toBeVisible();
        await expect(breadcrumb.getByText('Pagaré')).toBeVisible();
    });

    test('incluye schema JSON-LD de FAQPage', async ({ page }) => {
        await page.goto(URL);
        const schemaScript = page.locator('script[type="application/ld+json"]').first();
        const schemaContent = await schemaScript.textContent();
        expect(schemaContent).toContain('FAQPage');
        expect(schemaContent).toContain('Question');
    });

    test('CTA final "Ver herramienta" apunta al landing de pagaré', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Ver herramienta/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/pagare/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Promesa de Compraventa
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Guía — Promesa de Compraventa', () => {
    const URL = '/guias/promesa-compraventa';

    test('carga y muestra el hero con H1 correcto', async ({ page }) => {
        await page.goto(URL);
        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();
        await expect(h1).toContainText(/promesa de/i);
        await expect(h1).toContainText(/compraventa/i);
        await expect(h1).toContainText(/Colombia/i);
    });

    test('tiene CTA primario al generador de la promesa', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Generar promesa gratis/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/compraventa\/generar/);
    });

    test('tiene CTA secundario para hablar con un abogado', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Hablar con un abogado/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /asesoria\/checkout/);
    });

    test('muestra la sección de riesgos legales', async ({ page }) => {
        await page.goto(URL);
        await expect(
            page.getByRole('heading', { name: /Qu[eé] pasa si firmas una promesa mal redactada/i })
        ).toBeVisible();
        await expect(page.getByText(/Nulidad absoluta del documento/i)).toBeVisible();
    });

    test('cita el artículo 1611 del Código Civil', async ({ page }) => {
        await page.goto(URL);
        await expect(page.getByText(/Art\.? 1611/i).first()).toBeVisible();
    });

    test('FAQ accordion responde a clicks', async ({ page }) => {
        await page.goto(URL);
        const firstQuestion = page
            .getByRole('button', { name: /promesa de compraventa debe ser por escrito/i })
            .first();
        await expect(firstQuestion).toBeVisible();
        await firstQuestion.click();
        await expect(page.getByText(/art[ií]culo 1611/i).first()).toBeVisible();
    });

    test('breadcrumb muestra "Guías" y "Promesa de Compraventa"', async ({ page }) => {
        await page.goto(URL);
        const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
        await expect(breadcrumb).toBeVisible();
        await expect(breadcrumb.getByRole('link', { name: /Gu[ií]as/i })).toBeVisible();
        await expect(breadcrumb.getByText('Promesa de Compraventa')).toBeVisible();
    });

    test('incluye schema JSON-LD de FAQPage', async ({ page }) => {
        await page.goto(URL);
        const schemaScript = page.locator('script[type="application/ld+json"]').first();
        const schemaContent = await schemaScript.textContent();
        expect(schemaContent).toContain('FAQPage');
        expect(schemaContent).toContain('Question');
    });

    test('CTA final "Ver herramienta" apunta al landing de compraventa', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Ver herramienta/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/compraventa/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Índice de Guías
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Guía — Index', () => {
    const URL = '/guias';

    test('carga y muestra el hero con H1 sobre firmar', async ({ page }) => {
        await page.goto(URL);
        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();
        await expect(h1).toContainText(/firmando/i);
    });

    test('muestra 3 tarjetas de guía con enlaces correctos', async ({ page }) => {
        await page.goto(URL);
        await expect(page.getByRole('link', { name: /Contrato de Arrendamiento/i }).first()).toHaveAttribute(
            'href',
            /guias\/contrato-arrendamiento/
        );
        await expect(page.getByRole('link', { name: /Pagar[eé]/i }).first()).toHaveAttribute('href', /guias\/pagare/);
        await expect(page.getByRole('link', { name: /Promesa de Compraventa/i }).first()).toHaveAttribute(
            'href',
            /guias\/promesa-compraventa/
        );
    });

    test('cada tarjeta muestra su marco legal', async ({ page }) => {
        await page.goto(URL);
        await expect(page.getByText(/Ley 820 de 2003/).first()).toBeVisible();
        await expect(page.getByText(/C[oó]digo de Comercio/).first()).toBeVisible();
        await expect(page.getByText(/Art\.? 1611/i).first()).toBeVisible();
    });

    test('cada tarjeta muestra la badge "Herramienta disponible"', async ({ page }) => {
        await page.goto(URL);
        const badges = page.getByText(/Herramienta disponible/i);
        await expect(badges).toHaveCount(3);
    });

    test('clic en tarjeta Pagaré navega a la guía del pagaré', async ({ page }) => {
        await page.goto(URL);
        await page
            .getByRole('link', { name: /Pagar[eé]/i })
            .first()
            .click();
        await expect(page).toHaveURL(/guias\/pagare/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('página tiene title, meta description y canonical correctos', async ({ page }) => {
        await page.goto(URL);
        await expect(page).toHaveTitle(/Guías/i);
        await expect(page).toHaveTitle(/Grexia/i);
        const description = page.locator('meta[name="description"]');
        await expect(description).toHaveAttribute('content', /.{50,}/);
        const canonical = page.locator('link[rel="canonical"]');
        await expect(canonical).toHaveAttribute('href', /grexia\.co\/guias/);
    });
});
