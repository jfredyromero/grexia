import { test, expect } from '@playwright/test';
import * as path from 'path';
import { PagareFormPage, assertValidPDF, artifactDir } from './helpers/PagareFormPage';
import {
    pagareSimple,
    pagareEnCuotas,
    pagareEnCuotasBimestral,
    pagareEnCuotasTrimestral,
    pagareNIT,
} from './fixtures/pagareTestData';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Pago único — flujo completo
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Pagaré — pago único', () => {
    test('completa el flujo de 3 pasos y muestra el preview', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-pago-unico');

        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });

        await form.screenshotPreview(path.join(dir, 'preview.png'));

        await form.assertPreviewContains('Juan Carlos Gómez Martínez');
        await form.assertPreviewContains('María Fernanda López Castro');
        await form.assertPreviewContains('Bogotá D.C.');
    });

    test('muestra las 4 cláusulas en el preview', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
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
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        // 5.000.000 → CINCO MILLONES
        await form.assertPreviewContains(/CINCO MILLONES/i);
    });

    test('muestra la condición de pago único con fecha de vencimiento', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await form.assertPreviewContains(/Pago único/i);
        // La fecha de vencimiento debe aparecer en el preview
        await form.assertPreviewContains(/22 de febrero de 2027/i);
    });

    test('descarga un PDF válido', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-pago-unico');

        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });

        const pdfPath = path.join(dir, 'pagare.pdf');
        const { sizeBytes, filename } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
        expect(filename).toBe('pagare.pdf');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Pago en cuotas mensuales
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Pagaré — cuotas mensuales', () => {
    test('muestra número de cuotas y período mensual en el preview', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareEnCuotas.acreedor,
            deudor: pagareEnCuotas.deudor,
            obligacion: pagareEnCuotas.obligacion,
        });
        await form.assertPreviewContains(/12/);
        await form.assertPreviewContains(/mensuales/i);
    });

    test('no muestra fecha de vencimiento (pago por cuotas)', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareEnCuotas.acreedor,
            deudor: pagareEnCuotas.deudor,
            obligacion: pagareEnCuotas.obligacion,
        });
        // El bloque de condiciones de pago no debe mostrar "Pago único"
        await form.assertPreviewNotContains(/Pago único/i);
    });

    test('descarga un PDF válido', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-cuotas-mensuales');

        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareEnCuotas.acreedor,
            deudor: pagareEnCuotas.deudor,
            obligacion: pagareEnCuotas.obligacion,
        });

        const pdfPath = path.join(dir, 'pagare-cuotas-mensuales.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Pago en cuotas bimestrales
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Pagaré — cuotas bimestrales', () => {
    test('muestra número de cuotas y período bimestral en el preview', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareEnCuotasBimestral.acreedor,
            deudor: pagareEnCuotasBimestral.deudor,
            obligacion: pagareEnCuotasBimestral.obligacion,
        });
        await form.assertPreviewContains(/6/);
        await form.assertPreviewContains(/bimestrales/i);
    });

    test('descarga un PDF válido', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-cuotas-bimestral');

        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareEnCuotasBimestral.acreedor,
            deudor: pagareEnCuotasBimestral.deudor,
            obligacion: pagareEnCuotasBimestral.obligacion,
        });

        const pdfPath = path.join(dir, 'pagare-bimestral.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: Pago en cuotas trimestrales
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Pagaré — cuotas trimestrales', () => {
    test('muestra número de cuotas y período trimestral en el preview', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareEnCuotasTrimestral.acreedor,
            deudor: pagareEnCuotasTrimestral.deudor,
            obligacion: pagareEnCuotasTrimestral.obligacion,
        });
        await form.assertPreviewContains(/4/);
        await form.assertPreviewContains(/trimestrales/i);
    });

    test('descarga un PDF válido', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-cuotas-trimestral');

        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareEnCuotasTrimestral.acreedor,
            deudor: pagareEnCuotasTrimestral.deudor,
            obligacion: pagareEnCuotasTrimestral.obligacion,
        });

        const pdfPath = path.join(dir, 'pagare-trimestral.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: Acreedor empresa con NIT
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Pagaré — acreedor con NIT', () => {
    test('muestra el nombre y NIT del acreedor empresa en el preview', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareNIT.acreedor,
            deudor: pagareNIT.deudor,
            obligacion: pagareNIT.obligacion,
        });
        await form.assertPreviewContains('Inversiones Lexia S.A.S.');
        await form.assertPreviewContains('900123456-1');
    });

    test('muestra el documento CE del deudor extranjero', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareNIT.acreedor,
            deudor: pagareNIT.deudor,
            obligacion: pagareNIT.obligacion,
        });
        await form.assertPreviewContains('Roberto Andrés Silva Ríos');
        await form.assertPreviewContains('E-456789');
    });

    test('descarga un PDF válido con acreedor NIT', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-nit');

        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareNIT.acreedor,
            deudor: pagareNIT.deudor,
            obligacion: pagareNIT.obligacion,
        });

        const pdfPath = path.join(dir, 'pagare-nit.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: Tasa de mora
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tasa de mora', () => {
    test('muestra la tasa personalizada cuando se ingresa', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: { ...pagareSimple.obligacion, mora: '2.5' },
        });
        await form.assertPreviewContains(/2\.5% mensual/);
    });

    test('muestra "tasa máxima legal vigente" cuando no se ingresa mora', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: { ...pagareSimple.obligacion, mora: '' },
        });
        await form.assertPreviewContains(/tasa máxima legal vigente/i);
    });

    test('la cláusula SEGUNDA refleja la tasa de mora personalizada', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareNIT.acreedor,
            deudor: pagareNIT.deudor,
            obligacion: pagareNIT.obligacion, // mora: '1.5'
        });
        // La cláusula SEGUNDA menciona la tasa de mora
        await form.assertClauseVisible('SEGUNDA');
        await form.assertPreviewContains(/1\.5% mensual/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7: Tasa de interés nominal
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tasa de interés nominal', () => {
    test('muestra la tasa nominal personalizada en la cláusula SEGUNDA', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: { ...pagareSimple.obligacion, tasaNominal: '1.2' },
        });
        await form.assertClauseVisible('SEGUNDA');
        await form.assertPreviewContains(/1\.2%/);
    });

    test('muestra blank cuando no se ingresa tasa nominal', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: { ...pagareSimple.obligacion, tasaNominal: '' },
        });
        await form.assertClauseVisible('SEGUNDA');
        await form.assertPreviewNotContains(/intereses corrientes a una tasa nominal mensual del\s+\d/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 8: Plan Gratuito — UI en Step 4 (preview)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Plan Gratuito — UI en Step 4', () => {
    test('muestra el badge "Plan Gratuito"', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await form.assertPlanBadge('free');
    });

    test('muestra el banner de upgrade al plan de asesoría', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await form.assertUpgradeBannerVisible();
    });

    test('el botón "Descargar PDF" genera un PDF válido', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-plan-free');

        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });

        const pdfPath = path.join(dir, 'pagare-free.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 9: Plan Empresarial — UI en Step 4 (preview)
// El plan se inyecta en localStorage antes de cargar la página
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Plan Empresarial — UI en Step 4', () => {
    test('muestra el badge "Plan Empresarial"', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('empresarial');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await form.assertPlanBadge('empresarial');
    });

    test('no muestra el banner de upgrade del plan gratuito', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto('empresarial');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });
        await form.assertUpgradeBannerHidden();
    });

    test('el botón "Descargar PDF" genera un PDF válido', async ({ page }) => {
        const form = new PagareFormPage(page);
        const dir = artifactDir('pagare-plan-empresarial');

        await form.goto('empresarial');
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });

        await form.screenshotPreview(path.join(dir, 'preview-empresarial.png'));

        const pdfPath = path.join(dir, 'pagare-empresarial.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 9: Validación de formulario
// Cubre: bloqueo por campos vacíos, campos condicionales de modalidad
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Validación de formulario', () => {
    test('Step 1: no avanza sin nombre del acreedor', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByText('El acreedor')).toBeVisible();
        await expect(page.getByText(/requerido/i).first()).toBeVisible();
    });

    test('Step 1: no avanza sin número de documento', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();

        await page.fill('#acreedor-nombre', 'Test Acreedor');
        await page.locator('#acreedor-tipo-doc').click();
        await page.getByRole('option', { name: 'Cédula de Ciudadanía' }).first().click();
        await page.fill('#acreedor-tel', '300 000 0000');
        // Omitir número de documento

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByText('El acreedor')).toBeVisible();
        await expect(page.getByText(/número de documento.*requerido/i)).toBeVisible();
    });

    test('Step 2: no avanza sin ciudad de residencia del deudor', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);

        await page.fill('#deudor-nombre', 'Test Deudor');
        await page.locator('#deudor-tipo-doc').click();
        await page.getByRole('option', { name: 'Cédula de Ciudadanía' }).first().click();
        await page.fill('#deudor-num-doc', '12345678');
        await page.fill('#deudor-tel', '300 000 0000');
        // No seleccionar ciudad

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByText('El deudor')).toBeVisible();
        await expect(page.getByText(/ciudad de residencia.*requerida/i)).toBeVisible();
    });

    test('Step 3: no avanza sin valor principal', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        // Seleccionar modalidad pero no ingresar valor
        await page.getByRole('button', { name: /Pago único/ }).click();
        await page.fill('#obligacion-fecha-suscripcion', '2026-03-01');
        await page.fill('#obligacion-fecha-vencimiento', '2027-03-01');
        await page.waitForSelector('#obligacion-ciudad-dept:not([disabled])', { timeout: 15_000 });
        await page.locator('#obligacion-ciudad-dept').click();
        await page.locator('#obligacion-ciudad-dept').fill('Bogotá');
        await page.getByRole('option', { name: 'Bogotá', exact: true }).first().waitFor({ timeout: 15_000 });
        await page.getByRole('option', { name: 'Bogotá', exact: true }).first().click();
        await page.waitForSelector('#obligacion-ciudad-city:not([disabled])', { timeout: 15_000 });
        await page.locator('#obligacion-ciudad-city').click();
        await page.locator('#obligacion-ciudad-city').fill('Bogotá D.C.');
        await page.getByRole('option', { name: 'Bogotá D.C.', exact: true }).first().waitFor({ timeout: 15_000 });
        await page.getByRole('option', { name: 'Bogotá D.C.', exact: true }).first().click();

        await page.getByRole('button', { name: /Ver pagaré/ }).click();

        await expect(page.locator('#pagare-preview')).not.toBeVisible();
        await expect(page.getByText(/valor.*requerido/i)).toBeVisible();
    });

    test('Step 3: pago único requiere fecha de vencimiento', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        await page.locator('#obligacion-valor').fill('5000000');
        await page.fill('#obligacion-fecha-suscripcion', '2026-03-01');
        await page.getByRole('button', { name: /Pago único/ }).click();
        // No llenar fecha de vencimiento
        await page.waitForSelector('#obligacion-ciudad-dept:not([disabled])', { timeout: 15_000 });
        await page.locator('#obligacion-ciudad-dept').click();
        await page.locator('#obligacion-ciudad-dept').fill('Bogotá');
        await page.getByRole('option', { name: 'Bogotá', exact: true }).first().waitFor({ timeout: 15_000 });
        await page.getByRole('option', { name: 'Bogotá', exact: true }).first().click();
        await page.waitForSelector('#obligacion-ciudad-city:not([disabled])', { timeout: 15_000 });
        await page.locator('#obligacion-ciudad-city').click();
        await page.locator('#obligacion-ciudad-city').fill('Bogotá D.C.');
        await page.getByRole('option', { name: 'Bogotá D.C.', exact: true }).first().waitFor({ timeout: 15_000 });
        await page.getByRole('option', { name: 'Bogotá D.C.', exact: true }).first().click();

        await page.getByRole('button', { name: /Ver pagaré/ }).click();

        await expect(page.locator('#pagare-preview')).not.toBeVisible();
        await expect(page.getByText(/fecha de vencimiento.*requerida/i)).toBeVisible();
    });

    test('Step 3: pago en cuotas requiere número de cuotas', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        await page.locator('#obligacion-valor').fill('5000000');
        await page.fill('#obligacion-fecha-suscripcion', '2026-03-01');
        await page.getByRole('button', { name: /Por cuotas/ }).click();
        // Seleccionar período pero NO número de cuotas
        await page.locator('#obligacion-periodo').click();
        await page.getByRole('option', { name: 'Mensual' }).first().click();
        await page.locator('#obligacion-num-cuotas').clear();
        await page.waitForSelector('#obligacion-ciudad-dept:not([disabled])', { timeout: 15_000 });
        await page.locator('#obligacion-ciudad-dept').click();
        await page.locator('#obligacion-ciudad-dept').fill('Bogotá');
        await page.getByRole('option', { name: 'Bogotá', exact: true }).first().waitFor({ timeout: 15_000 });
        await page.getByRole('option', { name: 'Bogotá', exact: true }).first().click();
        await page.waitForSelector('#obligacion-ciudad-city:not([disabled])', { timeout: 15_000 });
        await page.locator('#obligacion-ciudad-city').click();
        await page.locator('#obligacion-ciudad-city').fill('Bogotá D.C.');
        await page.getByRole('option', { name: 'Bogotá D.C.', exact: true }).first().waitFor({ timeout: 15_000 });
        await page.getByRole('option', { name: 'Bogotá D.C.', exact: true }).first().click();

        await page.getByRole('button', { name: /Ver pagaré/ }).click();

        await expect(page.locator('#pagare-preview')).not.toBeVisible();
        await expect(page.getByText(/número de cuotas.*requerido/i)).toBeVisible();
    });

    test('Step 3: no avanza sin ciudad de suscripción', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        await page.locator('#obligacion-valor').fill('5000000');
        await page.fill('#obligacion-fecha-suscripcion', '2026-03-01');
        await page.getByRole('button', { name: /Pago único/ }).click();
        await page.fill('#obligacion-fecha-vencimiento', '2027-03-01');
        // No seleccionar ciudad de suscripción

        await page.getByRole('button', { name: /Ver pagaré/ }).click();

        await expect(page.locator('#pagare-preview')).not.toBeVisible();
        await expect(page.getByText(/ciudad de suscripción.*requerida/i)).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 10: Dropdowns departamento/ciudad (API real)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Selección departamento/ciudad (API real)', () => {
    test('el selector de ciudad está deshabilitado hasta seleccionar departamento (deudor)', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);

        await page.waitForSelector('#deudor-ciudad-dept:not([disabled])', { timeout: 8_000 });
        await expect(page.locator('#deudor-ciudad-city')).toBeDisabled();
    });

    test('las ciudades del deudor se cargan al seleccionar departamento', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);

        await page.waitForSelector('#deudor-ciudad-dept:not([disabled])', { timeout: 15_000 });
        await page.locator('#deudor-ciudad-dept').click();
        await page.locator('#deudor-ciudad-dept').fill(pagareSimple.deudor.departamento);
        await page
            .getByRole('option', { name: pagareSimple.deudor.departamento, exact: true })
            .first()
            .waitFor({ timeout: 15_000 });
        await page.getByRole('option', { name: pagareSimple.deudor.departamento, exact: true }).first().click();

        await page.waitForSelector('#deudor-ciudad-city:not([disabled])', { timeout: 15_000 });
        await page.locator('#deudor-ciudad-city').click();
        await page.locator('#deudor-ciudad-city').fill('Bogotá D.C.');
        await expect(page.getByRole('option', { name: 'Bogotá D.C.', exact: true }).first()).toBeVisible({
            timeout: 10_000,
        });
    });

    test('el selector de ciudad de obligación está deshabilitado hasta seleccionar departamento', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        await page.waitForSelector('#obligacion-ciudad-dept:not([disabled])', { timeout: 8_000 });
        await expect(page.locator('#obligacion-ciudad-city')).toBeDisabled();
    });

    test('las ciudades de obligación se cargan al seleccionar departamento', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        await page.waitForSelector('#obligacion-ciudad-dept:not([disabled])', { timeout: 15_000 });
        await page.locator('#obligacion-ciudad-dept').click();
        await page.locator('#obligacion-ciudad-dept').fill(pagareSimple.obligacion.departamento);
        await page
            .getByRole('option', { name: pagareSimple.obligacion.departamento, exact: true })
            .first()
            .waitFor({ timeout: 15_000 });
        await page.getByRole('option', { name: pagareSimple.obligacion.departamento, exact: true }).first().click();

        await page.waitForSelector('#obligacion-ciudad-city:not([disabled])', { timeout: 15_000 });
        await page.locator('#obligacion-ciudad-city').click();
        await page.locator('#obligacion-ciudad-city').fill('Bogotá D.C.');
        await expect(page.getByRole('option', { name: 'Bogotá D.C.', exact: true }).first()).toBeVisible({
            timeout: 10_000,
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 11: Navegación entre pasos
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Navegación entre pasos', () => {
    test('el botón "Anterior" en Step 2 regresa a Step 1', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);

        await page.getByRole('button', { name: 'Anterior' }).click();
        await expect(page.getByText('El acreedor')).toBeVisible();
    });

    test('el botón "Anterior" en Step 3 regresa a Step 2', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        await page.getByRole('button', { name: 'Anterior' }).click();
        await expect(page.getByText('El deudor')).toBeVisible();
    });

    test('"Modificar datos" desde el preview regresa a Step 3', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            acreedor: pagareSimple.acreedor,
            deudor: pagareSimple.deudor,
            obligacion: pagareSimple.obligacion,
        });

        await page.getByRole('button', { name: /Modificar datos/i }).click();
        await expect(page.getByText('La obligación')).toBeVisible();
    });

    test('volver a Step 2 conserva el nombre del deudor', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        await page.getByRole('button', { name: 'Anterior' }).click();
        await page.waitForSelector('h2:has-text("El deudor")');

        await expect(page.locator('#deudor-nombre')).toHaveValue('María Fernanda López Castro');
    });

    test('volver a Step 1 conserva el nombre del acreedor', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();
        await form.fillAcreedor(pagareSimple.acreedor);

        await page.getByRole('button', { name: 'Anterior' }).click();
        await page.waitForSelector('h2:has-text("El acreedor")');

        await expect(page.locator('#acreedor-nombre')).toHaveValue('Juan Carlos Gómez Martínez');
    });
});
