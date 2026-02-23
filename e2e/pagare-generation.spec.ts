import { test, expect } from '@playwright/test';
import * as path from 'path';
import { PagareFormPage, assertValidPDF, artifactDir } from './helpers/PagareFormPage';
import { pagareSimple, pagareEnCuotas } from './fixtures/pagareTestData';

// ── Suite 1: Pagaré simple (pago único) ───────────────────────────────────────

test.describe('Pagaré — pago único (plan gratuito)', () => {
    test('completa el flujo de 3 pasos y muestra el preview', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');

        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });

        await form.screenshotPreview(
            path.join(artifactDir('pagare-pago-unico'), 'preview.png')
        );

        // Parties visible in preview
        await form.assertPreviewContains('Juan Carlos Gómez Martínez');
        await form.assertPreviewContains('María Fernanda López Castro');
    });

    test('muestra la marca de agua en plan gratuito', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await form.assertWatermarkVisible();
    });

    test('muestra el texto LEXIA como logo en plan gratuito', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await expect(page.locator('#pagare-preview')).toContainText('LEXIA');
        // No custom logo image
        await form.assertLogoImageHidden();
    });

    test('muestra las 4 cláusulas en el preview', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await form.assertClauseVisible('PRIMERA');
        await form.assertClauseVisible('SEGUNDA');
        await form.assertClauseVisible('TERCERA');
        await form.assertClauseVisible('CUARTA');
    });

    test('muestra el valor en letras (CINCO MILLONES)', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        // 5.000.000 → CINCO MILLONES PESOS
        await form.assertPreviewContains(/CINCO MILLONES/i);
    });

    test('muestra la ciudad de suscripción en la caja de monto', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await form.assertPreviewContains('Bogotá D.C.');
    });

    test('descarga un PDF válido', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-pago-unico');
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });

        const pdfPath = path.join(dir, 'pagare.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(10_000);
    });
});

// ── Suite 2: Pago por cuotas ──────────────────────────────────────────────────

test.describe('Pagaré — pago por cuotas', () => {
    test('muestra las cuotas y el período en el preview', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareEnCuotas.acreedor,
            deudor: pagareEnCuotas.deudor,
            obligacion: {
                ...pagareEnCuotas.obligacion,
                modalidad: 'cuotas',
                numeroCuotas: '12',
                periodoCuotas: 'mensual',
            },
        });
        await form.assertPreviewContains(/12/);
        await form.assertPreviewContains(/mensuales/i);
    });

    test('descarga un PDF válido para pago en cuotas', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-cuotas');
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareEnCuotas.acreedor,
            deudor: pagareEnCuotas.deudor,
            obligacion: {
                ...pagareEnCuotas.obligacion,
                modalidad: 'cuotas',
                numeroCuotas: '12',
                periodoCuotas: 'mensual',
            },
        });

        const pdfPath = path.join(dir, 'pagare-cuotas.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(10_000);
    });
});

// ── Suite 3: Plan básico — sin marca de agua ──────────────────────────────────

test.describe('Plan básico — sin marca de agua', () => {
    test('no muestra la marca de agua de Lexia', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('basico');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await form.assertWatermarkHidden();
    });

    test('muestra el panel de subida de logo en plan básico', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('basico');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await expect(page.getByText('Logo personalizado')).toBeVisible();
    });

    test('descarga PDF sin marca de agua (plan básico)', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-plan-basico');
        await form.goto('basico');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });

        await form.screenshotPreview(path.join(dir, 'preview-basico.png'));

        const pdfPath = path.join(dir, 'pagare-basico.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ── Suite 4: Plan pro ─────────────────────────────────────────────────────────

test.describe('Plan pro — sin marca de agua', () => {
    test('no muestra la marca de agua', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('pro');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await form.assertWatermarkHidden();
    });

    test('muestra el panel de logo personalizado en plan pro', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('pro');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await expect(page.getByText('Logo personalizado')).toBeVisible();
    });
});

// ── Suite 5: Validación de formularios ────────────────────────────────────────

test.describe('Validación — no avanza con campos vacíos', () => {
    test('Step 1 no avanza sin nombre del acreedor', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');

        // Click Continuar without filling anything
        await page.getByRole('button', { name: 'Continuar' }).click();

        // Should still be on step 1
        await expect(page.getByText('El acreedor')).toBeVisible();
        // Error message appears
        await expect(page.getByText(/requerido/i).first()).toBeVisible();
    });

    test('Step 2 no avanza sin ciudad del deudor', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAcreedor(pagareSimple.acreedor);

        // Fill deudor without city
        await page.fill('#deudor-nombre', 'Test Deudor');
        await page.selectOption('#deudor-tipo-doc', 'CC');
        await page.fill('#deudor-num-doc', '12345678');
        await page.fill('#deudor-tel', '300 000 0000');

        // Don't select city — try to continue
        await page.getByRole('button', { name: 'Continuar' }).click();

        // Should still be on step 2
        await expect(page.getByText('El deudor')).toBeVisible();
        await expect(page.getByText(/ciudad de residencia.*requerida/i)).toBeVisible();
    });
});

// ── Suite 6: Dropdowns de departamento/ciudad ─────────────────────────────────

test.describe('Selección departamento/ciudad (API mocked)', () => {
    test('el selector de ciudad está deshabilitado hasta seleccionar departamento (deudor)', async ({
        page,
    }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAcreedor(pagareSimple.acreedor);

        await page.waitForSelector('#deudor-ciudad-dept:not([disabled])', { timeout: 8_000 });
        const citySelect = page.locator('#deudor-ciudad-city');
        await expect(citySelect).toBeDisabled();
    });

    test('las ciudades se cargan al seleccionar departamento (deudor)', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAcreedor(pagareSimple.acreedor);

        await page.waitForSelector('#deudor-ciudad-dept:not([disabled])', { timeout: 8_000 });
        await page.selectOption('#deudor-ciudad-dept', pagareSimple.deudor.departamentoId);

        await page.waitForSelector('#deudor-ciudad-city:not([disabled])', { timeout: 8_000 });
        await expect(
            page.locator('#deudor-ciudad-city option', { hasText: 'Bogotá D.C.' })
        ).toBeAttached();
    });

    test('las ciudades se cargan al seleccionar departamento (obligación)', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        await page.waitForSelector('#obligacion-ciudad-dept:not([disabled])', { timeout: 8_000 });
        await page.selectOption('#obligacion-ciudad-dept', pagareSimple.obligacion.departamentoId);

        await page.waitForSelector('#obligacion-ciudad-city:not([disabled])', { timeout: 8_000 });
        await expect(
            page.locator('#obligacion-ciudad-city option', { hasText: 'Bogotá D.C.' })
        ).toBeAttached();
    });
});

// ── Suite 7: Navegación (Volver a modificar datos) ────────────────────────────

test.describe('Navegación entre pasos', () => {
    test('el botón "Anterior" regresa al paso anterior', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAcreedor(pagareSimple.acreedor);

        // We are on step 2 — click Anterior
        await page.getByRole('button', { name: 'Anterior' }).click();
        await expect(page.getByText('El acreedor')).toBeVisible();
    });

    test('"Modificar datos" desde el preview regresa al paso anterior', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });

        await page.getByRole('button', { name: /Modificar datos/i }).click();
        await expect(page.getByText('La obligación')).toBeVisible();
    });
});

// ── Suite 8: Tasa de mora personalizada ───────────────────────────────────────

test.describe('Tasa de mora', () => {
    test('muestra la tasa personalizada cuando se ingresa', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: { ...pagareSimple.obligacion, mora: '2.5' },
        });
        await form.assertPreviewContains(/2\.5% mensual/);
    });

    test('muestra "tasa máxima legal" cuando no se ingresa mora', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('free');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: { ...pagareSimple.obligacion, mora: '' },
        });
        await form.assertPreviewContains(/tasa máxima legal vigente/i);
    });
});
