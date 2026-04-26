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
        await expect(page.getByText(/Art[ií]culo 789/i).first()).toBeVisible();
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
        const cta = page.getByRole('link', { name: /Ver herramienta\b/i }).first();
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
        await expect(cta).toHaveAttribute('href', /herramientas\/promesa-compraventa\/generar/);
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
        const cta = page.getByRole('link', { name: /Ver herramienta\b/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/promesa-compraventa/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Contrato Laboral
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Guía — Contrato Laboral', () => {
    const URL = '/guias/contrato-laboral';

    test('carga y muestra el hero con H1 correcto', async ({ page }) => {
        await page.goto(URL);
        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();
        await expect(h1).toContainText(/contrato/i);
        await expect(h1).toContainText(/laboral/i);
        await expect(h1).toContainText(/Colombia/i);
    });

    test('tiene CTA primario al generador del contrato laboral', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Generar contrato gratis/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/contrato-laboral\/generar/);
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
            page.getByRole('heading', { name: /Qu[eé] pasa si contratas sin contrato laboral escrito/i })
        ).toBeVisible();
        await expect(page.getByText(/Tu término fijo se vuelve indefinido/i)).toBeVisible();
    });

    test('cita el artículo 22 del Código Sustantivo del Trabajo', async ({ page }) => {
        await page.goto(URL);
        await expect(page.getByText(/Art\.? 22/i).first()).toBeVisible();
    });

    test('FAQ accordion responde a clicks', async ({ page }) => {
        await page.goto(URL);
        const firstQuestion = page.getByRole('button', { name: /contrato laboral debe ser por escrito/i }).first();
        await expect(firstQuestion).toBeVisible();
        await firstQuestion.click();
        await expect(page.getByText(/Art\.? 46 y 47/i).first()).toBeVisible();
    });

    test('breadcrumb muestra "Guías" y "Contrato Laboral"', async ({ page }) => {
        await page.goto(URL);
        const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
        await expect(breadcrumb).toBeVisible();
        await expect(breadcrumb.getByRole('link', { name: /Gu[ií]as/i })).toBeVisible();
        await expect(breadcrumb.getByText('Contrato Laboral')).toBeVisible();
    });

    test('incluye schema JSON-LD de FAQPage', async ({ page }) => {
        await page.goto(URL);
        const schemaScript = page.locator('script[type="application/ld+json"]').first();
        const schemaContent = await schemaScript.textContent();
        expect(schemaContent).toContain('FAQPage');
        expect(schemaContent).toContain('Question');
    });

    test('CTA final "Ver herramienta" apunta al landing de laboral', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Ver herramienta\b/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/contrato-laboral/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Liquidación de Intereses Judiciales
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Guía — Liquidación de Intereses', () => {
    const URL = '/guias/liquidacion-de-intereses';

    test('carga y muestra el hero con H1 correcto', async ({ page }) => {
        await page.goto(URL);
        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();
        await expect(h1).toContainText(/liquidaci[oó]n/i);
        await expect(h1).toContainText(/intereses/i);
        await expect(h1).toContainText(/Colombia/i);
    });

    test('tiene CTA primario al generador de la liquidación', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Liquidar intereses gratis/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/liquidacion-de-intereses\/generar/);
    });

    test('tiene CTA secundario para hablar con un abogado', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Hablar con un abogado/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /asesoria\/checkout/);
    });

    test('muestra la sección de riesgos legales', async ({ page }) => {
        await page.goto(URL);
        await expect(page.getByRole('heading', { name: /Qu[eé] pasa si liquidas mal los intereses/i })).toBeVisible();
        await expect(page.getByText(/Pierdes todos los intereses por usura/i)).toBeVisible();
    });

    test('cita el artículo 884 del Código de Comercio', async ({ page }) => {
        await page.goto(URL);
        await expect(page.getByText(/Art\.? 884/i).first()).toBeVisible();
    });

    test('cita el artículo 886 sobre anatocismo', async ({ page }) => {
        await page.goto(URL);
        await expect(page.getByText(/Art\.? 886/i).first()).toBeVisible();
    });

    test('FAQ accordion responde a clicks', async ({ page }) => {
        await page.goto(URL);
        const firstQuestion = page
            .getByRole('button', { name: /diferencia entre intereses corrientes y moratorios/i })
            .first();
        await expect(firstQuestion).toBeVisible();
        await firstQuestion.click();
        await expect(page.getByText(/art[ií]culo 884/i).first()).toBeVisible();
    });

    test('breadcrumb muestra "Guías" y "Liquidación de Intereses"', async ({ page }) => {
        await page.goto(URL);
        const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
        await expect(breadcrumb).toBeVisible();
        await expect(breadcrumb.getByRole('link', { name: /Gu[ií]as/i })).toBeVisible();
        await expect(breadcrumb.getByText('Liquidación de Intereses')).toBeVisible();
    });

    test('incluye schema JSON-LD de FAQPage', async ({ page }) => {
        await page.goto(URL);
        const schemaScript = page.locator('script[type="application/ld+json"]').first();
        const schemaContent = await schemaScript.textContent();
        expect(schemaContent).toContain('FAQPage');
        expect(schemaContent).toContain('Question');
    });

    test('CTA final "Ver herramienta" apunta al landing de intereses', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Ver herramienta\b/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/liquidacion-de-intereses/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Acción de Tutela
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Guía — Acción de Tutela', () => {
    const URL = '/guias/accion-de-tutela';

    test('carga y muestra el hero con H1 correcto', async ({ page }) => {
        await page.goto(URL);
        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();
        await expect(h1).toContainText(/acci[oó]n de/i);
        await expect(h1).toContainText(/tutela/i);
        await expect(h1).toContainText(/Colombia/i);
    });

    test('tiene CTA primario al generador de la tutela', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Generar tutela gratis/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/accion-de-tutela\/generar/);
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
            page.getByRole('heading', { name: /Qu[eé] pasa si no presentas la tutela a tiempo/i })
        ).toBeVisible();
        await expect(page.getByText(/Tu salud se deteriora sin atenci[oó]n/i)).toBeVisible();
    });

    test('cita el artículo 86 de la Constitución Política', async ({ page }) => {
        await page.goto(URL);
        await expect(page.getByText(/Art\.? 86/i).first()).toBeVisible();
    });

    test('FAQ accordion responde a clicks', async ({ page }) => {
        await page.goto(URL);
        const firstQuestion = page
            .getByRole('button', { name: /Cu[aá]nto tarda un juez en fallar una tutela/i })
            .first();
        await expect(firstQuestion).toBeVisible();
        await firstQuestion.click();
        await expect(page.getByText(/10 d[ií]as/i).first()).toBeVisible();
    });

    test('breadcrumb muestra "Guías" y "Acción de Tutela"', async ({ page }) => {
        await page.goto(URL);
        const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
        await expect(breadcrumb).toBeVisible();
        await expect(breadcrumb.getByRole('link', { name: /Gu[ií]as/i })).toBeVisible();
        await expect(breadcrumb.getByText('Acción de Tutela')).toBeVisible();
    });

    test('incluye schema JSON-LD de FAQPage', async ({ page }) => {
        await page.goto(URL);
        const schemaScript = page.locator('script[type="application/ld+json"]').first();
        const schemaContent = await schemaScript.textContent();
        expect(schemaContent).toContain('FAQPage');
        expect(schemaContent).toContain('Question');
    });

    test('CTA final "Ver herramienta" apunta al landing de tutela', async ({ page }) => {
        await page.goto(URL);
        const cta = page.getByRole('link', { name: /Ver herramienta\b/i }).first();
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute('href', /herramientas\/accion-de-tutela/);
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

    test('muestra las tarjetas de guía con enlaces correctos', async ({ page }) => {
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
        await expect(page.getByRole('link', { name: /Contrato Laboral/i }).first()).toHaveAttribute(
            'href',
            /guias\/contrato-laboral/
        );
        await expect(page.getByRole('link', { name: /Liquidaci[oó]n de Intereses/i }).first()).toHaveAttribute(
            'href',
            /guias\/liquidacion-de-intereses/
        );
    });

    test('cada tarjeta muestra su marco legal', async ({ page }) => {
        await page.goto(URL);
        await expect(page.getByText(/Ley 820 de 2003/).first()).toBeVisible();
        await expect(page.getByText(/C[oó]digo de Comercio/).first()).toBeVisible();
        await expect(page.getByText(/Art\.? 1611/i).first()).toBeVisible();
        await expect(page.getByText(/C[oó]digo Sustantivo del Trabajo/i).first()).toBeVisible();
        await expect(page.getByText(/Art\.? 884/i).first()).toBeVisible();
    });

    test('la tarjeta de Contrato Laboral está visible con su marco legal', async ({ page }) => {
        await page.goto(URL);
        const card = page.getByRole('link', { name: /Contrato Laboral/i }).first();
        await expect(card).toBeVisible();
        await expect(card.getByText(/C[oó]digo Sustantivo del Trabajo/i)).toBeVisible();
        await expect(card.getByText(/Herramienta disponible/i)).toBeVisible();
    });

    test('la tarjeta de Liquidación de Intereses está visible con su marco legal', async ({ page }) => {
        await page.goto(URL);
        const card = page.getByRole('link', { name: /Liquidaci[oó]n de Intereses/i }).first();
        await expect(card).toBeVisible();
        await expect(card.getByText(/Art\.? 884/i).first()).toBeVisible();
        await expect(card.getByText(/Herramienta disponible/i)).toBeVisible();
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
