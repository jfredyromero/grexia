import { test, expect } from '@playwright/test';
import * as path from 'path';
import { LaboralFormPage, assertValidPDF, artifactDir } from './helpers/LaboralFormPage';
import { contratoTerminoFijo, contratoTerminoFijoTransferencia, contratoObraLabor } from './fixtures/laboralTestData';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Término Fijo — flujo completo
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Laboral — Término Fijo: flujo completo', () => {
    test('completa los 5 pasos y muestra el preview', async ({ page }) => {
        const form = new LaboralFormPage(page);
        const dir = artifactDir('laboral-termino-fijo');

        await form.goto();
        await form.fillAllSteps(contratoTerminoFijo);

        await form.screenshotPreview(path.join(dir, 'preview.png'));
        await form.assertPreviewContains(contratoTerminoFijo.empleador.nombreCompleto);
        await form.assertPreviewContains(contratoTerminoFijo.trabajador.nombreCompleto);
    });

    test('muestra el cargo del trabajador en el preview', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();
        await form.fillAllSteps(contratoTerminoFijo);

        await form.assertPreviewContains(contratoTerminoFijo.condicionesTerminoFijo!.cargo);
    });

    test('muestra la duración en letras', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();
        await form.fillAllSteps(contratoTerminoFijo);

        // "6" meses → "seis (6) meses"
        await form.assertPreviewContains(/seis \(6\) meses/i);
    });

    test('descarga PDF — archivo válido', async ({ page }) => {
        const form = new LaboralFormPage(page);
        const dir = artifactDir('laboral-termino-fijo');
        await form.goto();
        await form.fillAllSteps(contratoTerminoFijo);

        const pdfPath = path.join(dir, 'contrato-termino-fijo.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(1000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Término Fijo — transferencia bancaria
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Laboral — Término Fijo: transferencia bancaria', () => {
    test('muestra la cuenta bancaria en el preview', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();
        await form.fillAllSteps(contratoTerminoFijoTransferencia);

        await form.assertPreviewContains(contratoTerminoFijoTransferencia.condicionesTerminoFijo!.cuentaBancaria!);
    });

    test('muestra la duración en años', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();
        await form.fillAllSteps(contratoTerminoFijoTransferencia);

        // "1" año → "un (1) año"
        await form.assertPreviewContains(/un \(1\) año/i);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Obra o Labor — flujo completo
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Laboral — Obra o Labor: flujo completo', () => {
    test('completa los 5 pasos y muestra el preview', async ({ page }) => {
        const form = new LaboralFormPage(page);
        const dir = artifactDir('laboral-obra-labor');

        await form.goto();
        await form.fillAllSteps(contratoObraLabor);

        await form.screenshotPreview(path.join(dir, 'preview.png'));
        await form.assertPreviewContains(contratoObraLabor.empleador.nombreCompleto);
        await form.assertPreviewContains(contratoObraLabor.trabajador.nombreCompleto);
    });

    test('muestra la descripción de la obra en el preview', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();
        await form.fillAllSteps(contratoObraLabor);

        await form.assertPreviewContains(contratoObraLabor.condicionesObraLabor!.oficio);
    });

    test('muestra las cláusulas Primera a Quinta', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();
        await form.fillAllSteps(contratoObraLabor);

        await form.assertPreviewContains('Primera.');
        await form.assertPreviewContains('Segunda.');
        await form.assertPreviewContains('Quinta.');
    });

    test('descarga PDF — archivo válido', async ({ page }) => {
        const form = new LaboralFormPage(page);
        const dir = artifactDir('laboral-obra-labor');
        await form.goto();
        await form.fillAllSteps(contratoObraLabor);

        const pdfPath = path.join(dir, 'contrato-obra-labor.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(1000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: Jornada "otro" bloquea el avance
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Laboral — Jornada "otro" bloquea avance', () => {
    test('muestra el banner de asesoría al seleccionar "otro"', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();

        // Navegar hasta step 4
        await form.selectTipoContrato('termino-fijo');
        await form.fillEmpleador(contratoTerminoFijo.empleador);
        await form.fillTrabajador(contratoTerminoFijo.trabajador);

        // Step 4: rellenar todo excepto jornada y seleccionar "otro"
        await page.fill('#tf-cargo', 'Analista');
        await page.fill('#tf-salario', '3000000');

        await page.locator('#tf-frecuencia').click();
        await page.getByRole('option', { name: 'Mensual' }).first().click();

        await page.locator('#tf-metodo').click();
        await page.getByRole('option', { name: 'Efectivo' }).first().click();

        await page.locator('#tf-jornada').click();
        await page.getByRole('option', { name: 'Otro (requiere asesoría legal)' }).first().click();

        // Banner de asesoría debe aparecer
        await expect(page.locator('text=Esta jornada requiere asesoría legal')).toBeVisible();
    });

    test('el botón "Ver contrato" está deshabilitado con jornada "otro"', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();

        await form.selectTipoContrato('termino-fijo');
        await form.fillEmpleador(contratoTerminoFijo.empleador);
        await form.fillTrabajador(contratoTerminoFijo.trabajador);

        await page.fill('#tf-cargo', 'Analista');
        await page.fill('#tf-salario', '3000000');

        await page.locator('#tf-frecuencia').click();
        await page.getByRole('option', { name: 'Mensual' }).first().click();

        await page.locator('#tf-metodo').click();
        await page.getByRole('option', { name: 'Efectivo' }).first().click();

        await page.locator('#tf-jornada').click();
        await page.getByRole('option', { name: 'Otro (requiere asesoría legal)' }).first().click();

        await page.fill('#tf-lugar', 'Calle 100');
        await page.fill('#tf-duracion-num', '6');
        await page.locator('#tf-duracion-unidad').click();
        await page.getByRole('option', { name: 'Meses' }).first().click();

        // Botón deshabilitado
        const btn = page.getByRole('button', { name: 'Ver contrato' });
        await expect(btn).toBeDisabled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: Validación de campos requeridos
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Laboral — Validación de formulario', () => {
    test('Step 1: error si no se selecciona tipo de contrato', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.locator('text=Selecciona el tipo de contrato.')).toBeVisible();
    });

    test('Step 2: error si nombre del empleador está vacío', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();

        await form.selectTipoContrato('termino-fijo');
        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.locator('text=El nombre o razón social es requerido.')).toBeVisible();
    });

    test('Step 3: error si nombre del trabajador está vacío', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();

        await form.selectTipoContrato('termino-fijo');
        await form.fillEmpleador(contratoTerminoFijo.empleador);
        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.locator('text=El nombre completo es requerido.')).toBeVisible();
    });

    test('Step 4: error si cargo está vacío (término fijo)', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();

        await form.selectTipoContrato('termino-fijo');
        await form.fillEmpleador(contratoTerminoFijo.empleador);
        await form.fillTrabajador(contratoTerminoFijo.trabajador);

        await page.getByRole('button', { name: 'Ver contrato' }).click();
        await expect(page.locator('text=El cargo es requerido.')).toBeVisible();
    });

    test('Step 4: error si descripción de obra está vacía (obra o labor)', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();

        await form.selectTipoContrato('obra-labor');
        await form.fillEmpleador(contratoObraLabor.empleador);
        await form.fillTrabajador(contratoObraLabor.trabajador);

        await page.getByRole('button', { name: 'Ver contrato' }).click();
        await expect(page.locator('text=La descripción de la obra o labor es requerida.')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: Navegación entre steps
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Laboral — Navegación', () => {
    test('botón Anterior vuelve al step previo', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();

        await form.selectTipoContrato('termino-fijo');
        await form.fillEmpleador(contratoTerminoFijo.empleador);

        // Estamos en step 3 — retroceder
        await page.getByRole('button', { name: 'Anterior' }).click();
        await expect(page.locator('h2:has-text("El empleador")')).toBeVisible();
    });

    test('StepProgress permite navegar a steps ya visitados', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();

        await form.selectTipoContrato('termino-fijo');
        await form.fillEmpleador(contratoTerminoFijo.empleador);

        // Clic en step 1 en el StepProgress
        await page.getByRole('button', { name: 'Ir al paso 1: Tipo' }).click();
        await expect(page.locator('h2:has-text("¿Qué tipo de contrato")')).toBeVisible();
    });

    test('modificar datos vuelve al step anterior desde el preview', async ({ page }) => {
        const form = new LaboralFormPage(page);
        await form.goto();
        await form.fillAllSteps(contratoTerminoFijo);

        await page.getByRole('button', { name: 'Modificar datos' }).click();
        await expect(page.locator('h2:has-text("Condiciones laborales")')).toBeVisible();
    });
});
