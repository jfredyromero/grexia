import { test, expect } from '@playwright/test';
import * as path from 'path';
import { CompraventaFormPage, assertValidPDF, artifactDir } from './helpers/CompraventaFormPage';
import {
    compraventaBasica,
    compraventaConIncluyeDescripcion,
    compraventaConTestigo,
} from './fixtures/compraventaTestData';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Flujo completo basico
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Compraventa — flujo basico', () => {
    test('completa los 6 pasos y muestra el preview', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        const dir = artifactDir('compraventa-basica');

        await form.goto();
        await form.fillAllSteps(compraventaBasica);

        await form.screenshotPreview(path.join(dir, 'preview.png'));

        await form.assertPreviewContains('Carlos Alberto Ramirez Gutierrez');
        await form.assertPreviewContains('Maria Fernanda Lopez Castro');
        await form.assertPreviewContains('PROMESA DE COMPRAVENTA');
    });

    test('muestra las 18 clausulas en el preview', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillAllSteps(compraventaBasica);

        await form.assertClauseVisible('PRIMERA');
        await form.assertClauseVisible('SEGUNDA');
        await form.assertClauseVisible('TERCERA');
        await form.assertClauseVisible('CUARTA');
        await form.assertClauseVisible('QUINTA');
        await form.assertClauseVisible('SEXTA');
        await form.assertClauseVisible('SEPTIMA');
        await form.assertClauseVisible('OCTAVA');
        await form.assertClauseVisible('NOVENA');
        await form.assertClauseVisible('DECIMA');
        await form.assertClauseVisible('DECIMA PRIMERA');
        await form.assertClauseVisible('DECIMA SEGUNDA');
        await form.assertClauseVisible('DECIMA TERCERA');
        await form.assertClauseVisible('DECIMA CUARTA');
        await form.assertClauseVisible('DECIMA QUINTA');
        await form.assertClauseVisible('DECIMA SEXTA');
        await form.assertClauseVisible('DECIMA SEPTIMA');
        await form.assertClauseVisible('DECIMA OCTAVA');
    });

    test('muestra el precio en letras', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillAllSteps(compraventaBasica);

        // 350.000.000 → TRESCIENTOS CINCUENTA MILLONES
        await form.assertPreviewContains(/TRESCIENTOS CINCUENTA MILLONES/i);
    });

    test('muestra datos del inmueble en el preview', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillAllSteps(compraventaBasica);

        await form.assertPreviewContains('Calle 100 #15-20 Apto 501');
        await form.assertPreviewContains('50N-12345678');
        await form.assertPreviewContains('01-02-0304-0005-000');
        await form.assertPreviewContains('85');
    });

    test('muestra datos de tradicion en el preview', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillAllSteps(compraventaBasica);

        await form.assertPreviewContains('COMPRAVENTA');
        await form.assertPreviewContains('1234');
        await form.assertPreviewContains('Notaria 15 de Bogota');
    });

    test('descarga un PDF valido', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        const dir = artifactDir('compraventa-basica');

        await form.goto();
        await form.fillAllSteps(compraventaBasica);

        const pdfPath = path.join(dir, 'promesa-compraventa.pdf');
        const { sizeBytes, filename } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
        expect(filename).toBe('promesa-compraventa.pdf');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Precio incluye descripcion
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Compraventa — precio incluye descripcion', () => {
    test('muestra la descripcion de lo que incluye el precio', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillAllSteps(compraventaConIncluyeDescripcion);

        await form.assertPreviewContains('parqueadero y deposito');
    });

    test('NO muestra "precio que incluye" cuando el campo esta vacio', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillAllSteps(compraventaBasica);

        await form.assertPreviewNotContains('precio que incluye');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Testigo opcional
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Compraventa — testigo', () => {
    test('muestra el bloque de testigo cuando se incluye', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillAllSteps(compraventaConTestigo);

        await form.assertPreviewContains('Pedro Ramirez Lopez');
        await form.assertPreviewContains('5555666777');
        await form.assertPreviewContains('TESTIGO');
    });

    test('NO muestra bloque de testigo cuando no se incluye', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillAllSteps(compraventaBasica);

        await form.assertPreviewNotContains('TESTIGO');
    });

    test('descarga un PDF valido con testigo', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        const dir = artifactDir('compraventa-testigo');

        await form.goto();
        await form.fillAllSteps(compraventaConTestigo);

        const pdfPath = path.join(dir, 'promesa-compraventa-testigo.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: Validacion de formulario
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Compraventa — validacion', () => {
    test('Step 1: no avanza sin nombre del vendedor', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByRole('heading', { name: 'El vendedor' })).toBeVisible();
        await expect(page.getByText(/requerido/i).first()).toBeVisible();
    });

    test('Step 3: no avanza sin direccion del inmueble', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillVendedor(compraventaBasica.vendedor);
        await form.fillComprador(compraventaBasica.comprador);

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByRole('heading', { name: 'El inmueble' })).toBeVisible();
        await expect(page.getByText(/requerido/i).first()).toBeVisible();
    });

    test('Step 5: no avanza sin precio total', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillVendedor(compraventaBasica.vendedor);
        await form.fillComprador(compraventaBasica.comprador);
        await form.fillInmueble(compraventaBasica.inmueble);
        await form.fillTradicion(compraventaBasica.tradicion);

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByRole('heading', { name: 'Condiciones economicas' })).toBeVisible();
        await expect(page.getByText(/requerido/i).first()).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: Navegacion entre pasos
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Compraventa — navegacion', () => {
    test('el boton "Anterior" en Step 2 regresa a Step 1', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillVendedor(compraventaBasica.vendedor);

        await page.getByRole('button', { name: 'Anterior' }).click();
        await expect(page.getByText('El vendedor')).toBeVisible();
    });

    test('"Modificar datos" desde el preview regresa a Step 6', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillAllSteps(compraventaBasica);

        await page.getByRole('button', { name: /Modificar datos/i }).click();
        await expect(page.getByText('Escritura publica y gastos')).toBeVisible();
    });

    test('volver a Step 1 conserva el nombre del vendedor', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();
        await form.fillVendedor(compraventaBasica.vendedor);

        await page.getByRole('button', { name: 'Anterior' }).click();
        await page.waitForSelector('h2:has-text("El vendedor")');

        await expect(page.locator('#vendedor-nombre')).toHaveValue('Carlos Alberto Ramirez Gutierrez');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: Seleccion departamento/ciudad (API real)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Compraventa — departamento/ciudad', () => {
    test('el selector de ciudad esta deshabilitado hasta seleccionar departamento (vendedor)', async ({ page }) => {
        const form = new CompraventaFormPage(page);
        await form.goto();

        await page.waitForSelector('#vendedor-domicilio-dept:not([disabled])', { timeout: 8_000 });
        await expect(page.locator('#vendedor-domicilio-city')).toBeDisabled();
    });
});
