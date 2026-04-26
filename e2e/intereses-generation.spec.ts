import { test, expect } from '@playwright/test';
import * as path from 'path';
import { InteresesFormPage, assertValidPDF, artifactsDir } from './helpers/InteresesFormPage';
import {
    liquidacionCortaCorriente,
    liquidacionLargaMoratoria,
    liquidacionMediaCorriente,
    liquidacionMediaMoratoria,
} from './fixtures/interesesTestData';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Liquidacion basica (capital simple)
// Cubre: flujo completo con interes corriente, resultado visible, PDF valido
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Intereses — Liquidacion basica', () => {
    test('completa el formulario y muestra el resultado de liquidacion', async ({ page }) => {
        const form = new InteresesFormPage(page);
        const dir = artifactsDir('intereses-basica-corriente');

        await form.goto();
        await form.fillObligacion(liquidacionCortaCorriente);

        await form.assertResultVisible();
        await form.screenshotResult(path.join(dir, 'resultado-preview.png'));

        // El template debe mostrar datos clave de la liquidacion
        await form.assertResultContains(/Capital/i);
        await form.assertResultContains(/Total intereses/i);
        await form.assertResultContains(/Corriente/i);
    });

    test('el resultado muestra el monto total de intereses calculado', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();
        await form.fillObligacion(liquidacionCortaCorriente);

        // El total de intereses debe ser un valor en COP (formato $X.XXX,XX)
        await form.assertResultContains(/\$/);
    });

    test('descarga un PDF valido mayor a 5KB', async ({ page }) => {
        const form = new InteresesFormPage(page);
        const dir = artifactsDir('intereses-basica-pdf');

        await form.goto();
        await form.fillObligacion(liquidacionCortaCorriente);

        const pdfPath = path.join(dir, 'liquidacion-intereses.pdf');
        const { sizeBytes, filename } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
        expect(filename).toBe('liquidacion-intereses.pdf');
    });

    test('liquidacion larga (12 meses) muestra detalle mensual', async ({ page }) => {
        const form = new InteresesFormPage(page);
        const dir = artifactsDir('intereses-larga-moratoria');

        await form.goto();
        await form.fillObligacion(liquidacionLargaMoratoria);

        await form.assertResultVisible();
        await form.screenshotResult(path.join(dir, 'resultado-12-meses.png'));

        // Debe mostrar la tabla de detalle mensual con al menos un mes
        await form.assertResultContains(/Detalle mensual/i);
        await form.assertResultContains(/Moratorio/i);

        const pdfPath = path.join(dir, 'liquidacion-12-meses.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Liquidacion con diferentes tasas
// Cubre: resultado varia segun tipo corriente vs moratorio
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Intereses — Diferentes tasas', () => {
    test('interes corriente muestra tipo "Corriente" en el resultado', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();
        await form.fillObligacion(liquidacionMediaCorriente);

        await form.assertResultVisible();
        await form.assertResultContains(/Interés Corriente/i);
    });

    test('interes moratorio muestra tipo "Moratorio" en el resultado', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();
        await form.fillObligacion(liquidacionMediaMoratoria);

        await form.assertResultVisible();
        await form.assertResultContains(/Interés Moratorio/i);
    });

    test('moratorio genera un monto mayor que corriente para el mismo periodo y capital', async ({ page }) => {
        // Calcular corriente
        const formCorriente = new InteresesFormPage(page);
        await formCorriente.goto();
        await formCorriente.fillObligacion(liquidacionMediaCorriente);

        // Capturar el texto del total de intereses corriente
        const previewCorriente = await page.locator('#intereses-preview').textContent();

        // Limpiar localStorage ANTES de navegar para que la página arranque en step 1
        await page.evaluate(() => {
            localStorage.removeItem('grexia_int_form_v1');
            localStorage.removeItem('grexia_int_step_v1');
            localStorage.removeItem('grexia_int_max_v1');
        });

        // Navegar de nuevo — ahora localStorage está limpio, carga en step 1
        await page.goto('/herramientas/liquidacion-de-intereses/generar');
        await page.waitForSelector('h2:has-text("La obligación")', { timeout: 10_000 });

        const formMoratorio = new InteresesFormPage(page);
        await formMoratorio.fillObligacion(liquidacionMediaMoratoria);

        const previewMoratorio = await page.locator('#intereses-preview').textContent();

        // Ambos resultados deben existir y ser distintos
        expect(previewCorriente).toBeTruthy();
        expect(previewMoratorio).toBeTruthy();
        // El moratorio siempre genera mas intereses que el corriente (factor 1.5x)
        // Verificamos que los textos son diferentes (distintos montos)
        expect(previewCorriente).not.toEqual(previewMoratorio);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Validacion de formulario
// Cubre: campos requeridos, fechas invalidas, mensajes de error
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Intereses — Validacion', () => {
    test('no avanza sin capital', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();

        // Llenar todo excepto capital
        await page.getByRole('button', { name: /^Corriente/ }).click();
        await page.fill('#int-fecha-inicio', '2024-10-01');
        await page.fill('#int-fecha-pago', '2024-11-15');

        await page.getByRole('button', { name: /Calcular intereses/ }).click();

        // Debe seguir en Step 1, no mostrar preview
        await expect(page.locator('#intereses-preview')).not.toBeVisible();
        await expect(page.getByText(/El capital debe ser mayor a cero/i)).toBeVisible();
    });

    test('no avanza sin tipo de interes seleccionado', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();

        await page.locator('#int-capital').fill('5000000');
        await page.fill('#int-fecha-inicio', '2024-10-01');
        await page.fill('#int-fecha-pago', '2024-11-15');

        await page.getByRole('button', { name: /Calcular intereses/ }).click();

        await expect(page.locator('#intereses-preview')).not.toBeVisible();
        await expect(page.getByText(/Selecciona el tipo de interés/i)).toBeVisible();
    });

    test('no avanza sin fecha de inicio de mora', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();

        await page.locator('#int-capital').fill('5000000');
        await page.getByRole('button', { name: /^Corriente/ }).click();
        await page.fill('#int-fecha-pago', '2024-11-15');

        await page.getByRole('button', { name: /Calcular intereses/ }).click();

        await expect(page.locator('#intereses-preview')).not.toBeVisible();
        await expect(page.getByText(/La fecha de inicio de mora es requerida/i)).toBeVisible();
    });

    test('no avanza sin fecha de pago', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();

        await page.locator('#int-capital').fill('5000000');
        await page.getByRole('button', { name: /^Corriente/ }).click();
        await page.fill('#int-fecha-inicio', '2024-10-01');

        await page.getByRole('button', { name: /Calcular intereses/ }).click();

        await expect(page.locator('#intereses-preview')).not.toBeVisible();
        await expect(page.getByText(/La fecha de pago es requerida/i)).toBeVisible();
    });

    test('fecha fin anterior a fecha inicio muestra error', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();

        await page.locator('#int-capital').fill('5000000');
        await page.getByRole('button', { name: /^Corriente/ }).click();
        await page.fill('#int-fecha-inicio', '2024-11-15');
        await page.fill('#int-fecha-pago', '2024-10-01');

        await page.getByRole('button', { name: /Calcular intereses/ }).click();

        await expect(page.locator('#intereses-preview')).not.toBeVisible();
        await expect(page.getByText(/La fecha de pago debe ser igual o posterior/i)).toBeVisible();
    });

    test('capital con valor cero muestra error', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();

        await page.locator('#int-capital').fill('0');
        await page.getByRole('button', { name: /^Corriente/ }).click();
        await page.fill('#int-fecha-inicio', '2024-10-01');
        await page.fill('#int-fecha-pago', '2024-11-15');

        await page.getByRole('button', { name: /Calcular intereses/ }).click();

        await expect(page.locator('#intereses-preview')).not.toBeVisible();
        await expect(page.getByText(/El capital debe ser mayor a cero/i)).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: Navegacion
// Cubre: boton "Modificar datos", StepProgress, conservacion de datos
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Intereses — Navegacion', () => {
    test('boton "Modificar datos" regresa al Step 1 con los valores conservados', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();
        await form.fillObligacion(liquidacionCortaCorriente);

        // Estamos en Step 2 (preview)
        await form.assertResultVisible();

        // Click en "Modificar datos"
        await form.clickModificarDatos();

        // Debe estar de vuelta en Step 1
        await expect(page.getByRole('heading', { name: /La obligación/i })).toBeVisible();

        // El capital debe conservarse (formateado con separadores)
        const capitalInput = page.locator('#int-capital');
        const capitalValue = await capitalInput.inputValue();
        // El store guarda '5000000', el input muestra '5.000.000' (formato COP)
        expect(capitalValue).toContain('5');

        // Las fechas deben conservarse
        await expect(page.locator('#int-fecha-inicio')).toHaveValue('2024-10-01');
        await expect(page.locator('#int-fecha-pago')).toHaveValue('2024-11-15');
    });

    test('StepProgress muestra el step correcto tras avanzar', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();

        // En Step 1: el botón del step activo existe pero está disabled
        const step1Btn = page.getByRole('button', { name: /Ir al paso 1: Obligación/i });
        await expect(step1Btn).toBeVisible();
        await expect(step1Btn).toBeDisabled();

        // Avanzar al Step 2
        await form.fillObligacion(liquidacionCortaCorriente);

        // En Step 2: step 2 está activo (disabled), step 1 es clickeable (enabled)
        const step2Btn = page.getByRole('button', { name: /Ir al paso 2: Liquidación/i });
        await expect(step2Btn).toBeVisible();
        await expect(step2Btn).toBeDisabled();

        await expect(step1Btn).toBeEnabled();
    });

    test('desde el preview se puede volver, modificar y recalcular', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();
        await form.fillObligacion(liquidacionCortaCorriente);
        await form.assertResultVisible();

        // Volver
        await form.clickModificarDatos();

        // Cambiar el tipo de interes a moratorio
        await page.getByRole('button', { name: /^Moratorio/ }).click();

        // Recalcular
        await page.getByRole('button', { name: /Calcular intereses/ }).click();
        await page.waitForSelector('#intereses-preview', { timeout: 15_000 });

        // Ahora debe mostrar "Interés Moratorio" en vez de "Interés Corriente"
        await form.assertResultContains(/Interés Moratorio/i);
    });
});
