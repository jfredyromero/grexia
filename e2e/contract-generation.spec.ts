import { test, expect } from '@playwright/test';
import * as path from 'path';
import { ArrendamientoFormPage, assertValidPDF, artifactsDir } from './helpers/ArrendamientoFormPage';
import {
    contratoVivienda,
    contratoApartamentoPH,
    contratoCasa,
    contratoCasaPH,
    contratoLocalComercialSinPH,
    contratoLocalComercial,
    contratoOficinaSinPH,
    contratoOficinaPH,
} from './fixtures/testData';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Vivienda — Apartamento sin PH
// Cubre: template ContractVivienda, Ley 820, sin cláusula PH, plan free (default)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Vivienda — Apartamento sin PH', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        const dir = artifactsDir('vivienda-apartamento');

        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            coarrendatario: contratoVivienda.coarrendatario,
            condiciones: contratoVivienda.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        await form.assertContractContains(/Ley 820 de 2003/i);
        await form.assertContractContains('Juan Carlos Gómez Martínez');
        await form.assertContractContains('María Fernanda López Castro');
        await form.assertContractContains(/Calle 45 # 23-15/i);

        const pdfPath = path.join(dir, 'contrato-vivienda.pdf');
        const { sizeBytes, filename } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
        expect(filename).toBe('contrato-apartamento.pdf');
    });

    test('el contrato expresa el canon en palabras', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            coarrendatario: contratoVivienda.coarrendatario,
            condiciones: contratoVivienda.condiciones,
        });
        // 1.500.000 → UN MILLÓN QUINIENTOS MIL PESOS
        await form.assertContractContains(/UN MILLÓN QUINIENTOS MIL PESOS/i);
    });

    test('no incluye cláusula de propiedad horizontal', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            coarrendatario: contratoVivienda.coarrendatario,
            condiciones: contratoVivienda.condiciones,
        });
        await form.assertContractNotContains(/PROPIEDAD HORIZONTAL/i);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Vivienda — Apartamento con PH
// Cubre: template ContractVivienda + cláusula PH, plan free
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Vivienda — Apartamento con PH', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        const dir = artifactsDir('vivienda-apartamento-ph');

        await form.goto();
        await form.fillAllSteps({
            ...contratoApartamentoPH.inmueble,
            arrendador: contratoApartamentoPH.arrendador,
            arrendatario: contratoApartamentoPH.arrendatario,
            coarrendatario: contratoApartamentoPH.coarrendatario,
            condiciones: contratoApartamentoPH.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        await form.assertContractContains(/Ley 820 de 2003/i);
        await form.assertContractContains('Carlos Eduardo Ramírez Peña');
        await form.assertContractContains('Ana Lucía Torres Vargas');

        const pdfPath = path.join(dir, 'contrato-apartamento-ph.pdf');
        const { sizeBytes, filename } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
        expect(filename).toBe('contrato-apartamento.pdf');
    });

    test('incluye la cláusula de propiedad horizontal', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoApartamentoPH.inmueble,
            arrendador: contratoApartamentoPH.arrendador,
            arrendatario: contratoApartamentoPH.arrendatario,
            coarrendatario: contratoApartamentoPH.coarrendatario,
            condiciones: contratoApartamentoPH.condiciones,
        });
        await form.assertContractContains(/PROPIEDAD HORIZONTAL/i);
    });

    test('el régimen es vivienda urbana (Ley 820), no comercial', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoApartamentoPH.inmueble,
            arrendador: contratoApartamentoPH.arrendador,
            arrendatario: contratoApartamentoPH.arrendatario,
            coarrendatario: contratoApartamentoPH.coarrendatario,
            condiciones: contratoApartamentoPH.condiciones,
        });
        await form.assertContractContains(/Ley 820 de 2003/i);
        await form.assertContractNotContains(/Código de Comercio/i);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Vivienda — Casa sin PH
// Cubre: tipo Casa en template ContractVivienda, sin cláusula PH
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Vivienda — Casa sin PH', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        const dir = artifactsDir('vivienda-casa');

        await form.goto();
        await form.fillAllSteps({
            ...contratoCasa.inmueble,
            arrendador: contratoCasa.arrendador,
            arrendatario: contratoCasa.arrendatario,
            coarrendatario: contratoCasa.coarrendatario,
            condiciones: contratoCasa.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        await form.assertContractContains(/Ley 820 de 2003/i);
        await form.assertContractContains('Pedro Antonio Sánchez Leal');
        await form.assertContractContains('Luisa Valentina Mora Ruiz');
        await form.assertContractContains(/Calle 134 # 52-18/i);

        const pdfPath = path.join(dir, 'contrato-casa.pdf');
        const { sizeBytes, filename } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
        expect(filename).toBe('contrato-casa.pdf');
    });

    test('no incluye cláusula de propiedad horizontal', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoCasa.inmueble,
            arrendador: contratoCasa.arrendador,
            arrendatario: contratoCasa.arrendatario,
            coarrendatario: contratoCasa.coarrendatario,
            condiciones: contratoCasa.condiciones,
        });
        await form.assertContractNotContains(/PROPIEDAD HORIZONTAL/i);
    });

    test('el régimen es vivienda urbana (Ley 820), no comercial', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoCasa.inmueble,
            arrendador: contratoCasa.arrendador,
            arrendatario: contratoCasa.arrendatario,
            coarrendatario: contratoCasa.coarrendatario,
            condiciones: contratoCasa.condiciones,
        });
        await form.assertContractContains(/Ley 820 de 2003/i);
        await form.assertContractNotContains(/Código de Comercio/i);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: Vivienda — Casa con PH
// Cubre: tipo Casa + cláusula PH en template ContractVivienda
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Vivienda — Casa con PH', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        const dir = artifactsDir('vivienda-casa-ph');

        await form.goto();
        await form.fillAllSteps({
            ...contratoCasaPH.inmueble,
            arrendador: contratoCasaPH.arrendador,
            arrendatario: contratoCasaPH.arrendatario,
            coarrendatario: contratoCasaPH.coarrendatario,
            condiciones: contratoCasaPH.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        await form.assertContractContains(/Ley 820 de 2003/i);
        await form.assertContractContains(/PROPIEDAD HORIZONTAL/i);

        const pdfPath = path.join(dir, 'contrato-casa-ph.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });

    test('incluye la cláusula de propiedad horizontal', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoCasaPH.inmueble,
            arrendador: contratoCasaPH.arrendador,
            arrendatario: contratoCasaPH.arrendatario,
            coarrendatario: contratoCasaPH.coarrendatario,
            condiciones: contratoCasaPH.condiciones,
        });
        await form.assertContractContains(/PROPIEDAD HORIZONTAL/i);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: Comercial — Local Comercial sin PH
// Cubre: template ContractComercial, campo actividadComercial, sin cláusula PH
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Comercial — Local Comercial sin PH', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        const dir = artifactsDir('local-comercial-sin-ph');

        await form.goto();
        await form.fillAllSteps({
            ...contratoLocalComercialSinPH.inmueble,
            arrendador: contratoLocalComercialSinPH.arrendador,
            arrendatario: contratoLocalComercialSinPH.arrendatario,
            coarrendatario: contratoLocalComercialSinPH.coarrendatario,
            condiciones: contratoLocalComercialSinPH.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        await form.assertContractContains(/Código de Comercio/i);
        await form.assertContractContains('Venta de ropa y accesorios');
        await form.assertContractNotContains(/PROPIEDAD HORIZONTAL/i);

        const pdfPath = path.join(dir, 'contrato-local-comercial-sin-ph.pdf');
        const { sizeBytes, filename } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
        expect(filename).toBe('contrato-local-comercial.pdf');
    });

    test('incluye la cláusula de actividad comercial autorizada', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoLocalComercialSinPH.inmueble,
            arrendador: contratoLocalComercialSinPH.arrendador,
            arrendatario: contratoLocalComercialSinPH.arrendatario,
            coarrendatario: contratoLocalComercialSinPH.coarrendatario,
            condiciones: contratoLocalComercialSinPH.condiciones,
        });
        await form.assertContractContains(/Artículo 523 del Código de Comercio/i);
        await form.assertContractContains('Venta de ropa y accesorios');
    });

    test('el régimen es Código de Comercio, no Ley 820', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoLocalComercialSinPH.inmueble,
            arrendador: contratoLocalComercialSinPH.arrendador,
            arrendatario: contratoLocalComercialSinPH.arrendatario,
            coarrendatario: contratoLocalComercialSinPH.coarrendatario,
            condiciones: contratoLocalComercialSinPH.condiciones,
        });
        await form.assertContractContains(/Código de Comercio/i);
        await form.assertContractNotContains(/Ley 820 de 2003/i);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: Comercial — Local Comercial con PH
// Cubre: template ContractComercial + cláusula PH + actividadComercial
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Comercial — Local Comercial con PH', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        const dir = artifactsDir('local-comercial-ph');

        await form.goto();
        await form.fillAllSteps({
            ...contratoLocalComercial.inmueble,
            arrendador: contratoLocalComercial.arrendador,
            arrendatario: contratoLocalComercial.arrendatario,
            coarrendatario: contratoLocalComercial.coarrendatario,
            condiciones: contratoLocalComercial.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        await form.assertContractContains(/Código de Comercio/i);
        await form.assertContractContains('Restaurante de comida rápida');
        await form.assertContractContains(/PROPIEDAD HORIZONTAL/i);

        const pdfPath = path.join(dir, 'contrato-local-comercial.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });

    test('incluye la cláusula de actividad comercial autorizada', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoLocalComercial.inmueble,
            arrendador: contratoLocalComercial.arrendador,
            arrendatario: contratoLocalComercial.arrendatario,
            coarrendatario: contratoLocalComercial.coarrendatario,
            condiciones: contratoLocalComercial.condiciones,
        });
        await form.assertContractContains(/Artículo 523 del Código de Comercio/i);
        await form.assertContractContains('Restaurante de comida rápida');
    });

    test('incluye ambas cláusulas: PH y actividad comercial', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoLocalComercial.inmueble,
            arrendador: contratoLocalComercial.arrendador,
            arrendatario: contratoLocalComercial.arrendatario,
            coarrendatario: contratoLocalComercial.coarrendatario,
            condiciones: contratoLocalComercial.condiciones,
        });
        await form.assertContractContains(/PROPIEDAD HORIZONTAL/i);
        await form.assertContractContains(/Artículo 523 del Código de Comercio/i);
        await form.assertContractContains('Restaurante de comida rápida');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7: Comercial — Oficina sin PH
// Cubre: template ContractComercial (Oficina), sin actividadComercial, sin PH
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Comercial — Oficina sin PH', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        const dir = artifactsDir('oficina-sin-ph');

        await form.goto();
        await form.fillAllSteps({
            ...contratoOficinaSinPH.inmueble,
            arrendador: contratoOficinaSinPH.arrendador,
            arrendatario: contratoOficinaSinPH.arrendatario,
            coarrendatario: contratoOficinaSinPH.coarrendatario,
            condiciones: contratoOficinaSinPH.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        await form.assertContractContains(/Código de Comercio/i);
        await form.assertContractContains(/DESTINACIÓN DEL INMUEBLE/i);
        await form.assertContractNotContains(/PROPIEDAD HORIZONTAL/i);
        await form.assertContractNotContains(/ACTIVIDAD COMERCIAL AUTORIZADA/i);

        const pdfPath = path.join(dir, 'contrato-oficina-sin-ph.pdf');
        const { sizeBytes, filename } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
        expect(filename).toBe('contrato-oficina.pdf');
    });

    test('no incluye cláusula de actividad comercial autorizada', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoOficinaSinPH.inmueble,
            arrendador: contratoOficinaSinPH.arrendador,
            arrendatario: contratoOficinaSinPH.arrendatario,
            coarrendatario: contratoOficinaSinPH.coarrendatario,
            condiciones: contratoOficinaSinPH.condiciones,
        });
        await form.assertContractNotContains(/ACTIVIDAD COMERCIAL AUTORIZADA/i);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 8: Comercial — Oficina con PH
// Cubre: template ContractComercial (Oficina) + cláusula PH
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Comercial — Oficina con PH', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        const dir = artifactsDir('oficina-ph');

        await form.goto();
        await form.fillAllSteps({
            ...contratoOficinaPH.inmueble,
            arrendador: contratoOficinaPH.arrendador,
            arrendatario: contratoOficinaPH.arrendatario,
            coarrendatario: contratoOficinaPH.coarrendatario,
            condiciones: contratoOficinaPH.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        await form.assertContractContains(/Código de Comercio/i);
        await form.assertContractContains(/DESTINACIÓN DEL INMUEBLE/i);
        await form.assertContractContains(/PROPIEDAD HORIZONTAL/i);

        const pdfPath = path.join(dir, 'contrato-oficina.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });

    test('incluye la cláusula de propiedad horizontal', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoOficinaPH.inmueble,
            arrendador: contratoOficinaPH.arrendador,
            arrendatario: contratoOficinaPH.arrendatario,
            coarrendatario: contratoOficinaPH.coarrendatario,
            condiciones: contratoOficinaPH.condiciones,
        });
        await form.assertContractContains(/PROPIEDAD HORIZONTAL/i);
    });

    test('no incluye la cláusula de actividad comercial', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoOficinaPH.inmueble,
            arrendador: contratoOficinaPH.arrendador,
            arrendatario: contratoOficinaPH.arrendatario,
            coarrendatario: contratoOficinaPH.coarrendatario,
            condiciones: contratoOficinaPH.condiciones,
        });
        await form.assertContractNotContains(/ACTIVIDAD COMERCIAL AUTORIZADA/i);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 9: Validación de formulario
// Cubre: bloqueo de avance con campos vacíos, errores por campo, campos condicionales
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Validación de formulario', () => {
    test('Step 1: no avanza si no se selecciona tipo de inmueble', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();

        // Intentar continuar sin seleccionar tipo
        await page.getByRole('button', { name: 'Continuar' }).click();

        // Debe seguir en Step 1 (el heading del arrendador NO debe aparecer)
        await expect(page.getByRole('heading', { name: /El arrendador/i })).not.toBeVisible();
        // Debe mostrar un error
        await expect(page.getByText(/Selecciona el tipo de inmueble/i)).toBeVisible();
    });

    test('Step 2: no avanza si el email del arrendador tiene formato inválido', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillInmueble(contratoVivienda.inmueble);

        // Llenar campos requeridos pero con email inválido
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.fill('#arrendador-nombre', 'Juan Prueba');
        await page.locator('#arrendador-tipo-doc').click();
        await page.getByRole('option', { name: 'Cédula de Ciudadanía' }).first().click();
        await page.fill('#arrendador-num-doc', '12345678');
        await page.fill('#arrendador-tel', '300 000 0000');
        await page.fill('#arrendador-email', 'email-invalido');

        await page.getByRole('button', { name: 'Continuar' }).click();

        // Debe seguir en Step 2
        await expect(page.getByRole('heading', { name: /El arrendatario/i })).not.toBeVisible();
        await expect(page.getByText(/Correo inválido/i)).toBeVisible();
    });

    test('Step 4: no avanza si el canon mensual está vacío', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillInmueble(contratoVivienda.inmueble);
        await form.fillArrendador(contratoVivienda.arrendador);
        await form.fillArrendatario(contratoVivienda.arrendatario);

        // Llenar fecha inicio y depósito pero no el canon
        await page.fill('#fecha-inicio', '2026-03-01');
        await page.locator('#deposito').fill('3000000');
        await page.fill('#dia-pago', '5');

        await page.getByRole('button', { name: 'Ver mi contrato' }).click();

        // Debe seguir en Step 4
        await expect(page.locator('#contract-content')).not.toBeVisible();
        await expect(page.getByText(/Campo requerido/i).first()).toBeVisible();
    });

    test('Step 4: Local Comercial requiere el campo de actividad comercial', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillInmueble(contratoLocalComercial.inmueble);
        await form.fillArrendador(contratoLocalComercial.arrendador);
        await form.fillArrendatario(contratoLocalComercial.arrendatario);

        // Llenar todos los campos EXCEPTO actividad comercial
        await page.fill('#fecha-inicio', '2026-03-01');
        await page.fill('#duracion', '12');
        await page.locator('#canon').fill('4500000');
        await page.locator('#deposito').fill('9000000');
        await page.fill('#dia-pago', '5');

        await page.getByRole('button', { name: 'Ver mi contrato' }).click();

        // Debe seguir en Step 4 y mostrar error de actividad
        await expect(page.locator('#contract-content')).not.toBeVisible();
        await expect(page.getByText(/Campo requerido para local comercial/i)).toBeVisible();
    });

    test('Step 4: campo de actividad comercial NO aparece para tipo Oficina', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillInmueble(contratoOficinaSinPH.inmueble);
        await form.fillArrendador(contratoOficinaSinPH.arrendador);
        await form.fillArrendatario(contratoOficinaSinPH.arrendatario);

        // Verificar que el campo de actividad comercial no existe en el DOM
        await expect(page.locator('#actividad')).not.toBeVisible();
    });

    test('Step 4: campo de actividad comercial NO aparece para tipo Apartamento', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillInmueble(contratoVivienda.inmueble);
        await form.fillArrendador(contratoVivienda.arrendador);
        await form.fillArrendatario(contratoVivienda.arrendatario);

        await expect(page.locator('#actividad')).not.toBeVisible();
    });

    test('navegar atrás desde Step 2 conserva los datos del Step 1', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillInmueble(contratoVivienda.inmueble);
        // fillInmueble termina en Step 2 — click Anterior lleva de vuelta a Step 1

        // Volver al Step 1
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: /Anterior/i }).click();
        await page.waitForSelector('text=¿Está en propiedad horizontal?');

        // La dirección debe conservarse
        await expect(page.locator('#direccion')).toHaveValue('Calle 45 # 23-15, Apto 301');
    });

    test('navegar atrás desde Step 3 conserva los datos del Step 2', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillInmueble(contratoVivienda.inmueble);
        await form.fillArrendador(contratoVivienda.arrendador);
        // fillArrendador termina en Step 3 — click Anterior lleva de vuelta a Step 2

        // Volver al Step 2
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: /Anterior/i }).click();
        await page.waitForSelector('h2:has-text("El arrendador")');

        // El nombre del arrendador debe conservarse
        await expect(page.locator('#arrendador-nombre')).toHaveValue('Juan Carlos Gómez Martínez');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 12: Coarrendatario
// Cubre: toggle activación, datos en contrato, cláusula Vigésima Primera,
//        validación de campos requeridos, bloque de firma, desactivar toggle
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coarrendatario', () => {
    test('el toggle activa y muestra el formulario de coarrendatario', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillInmueble(contratoVivienda.inmueble);
        await form.fillArrendador(contratoVivienda.arrendador);

        // El formulario de coarrendatario no debe existir antes de activar el toggle
        await expect(page.locator('#coarrendatario-nombre')).not.toBeVisible();

        await page.getByRole('button', { name: /Agregar coarrendatario/i }).click();
        await expect(page.locator('#coarrendatario-nombre')).toBeVisible();
    });

    test('desactivar el toggle oculta el formulario de coarrendatario', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillInmueble(contratoVivienda.inmueble);
        await form.fillArrendador(contratoVivienda.arrendador);

        // Activar y luego desactivar
        await page.getByRole('button', { name: /Agregar coarrendatario/i }).click();
        await expect(page.locator('#coarrendatario-nombre')).toBeVisible();

        await page.getByRole('button', { name: /Agregar coarrendatario/i }).click();
        await expect(page.locator('#coarrendatario-nombre')).not.toBeVisible();
    });

    test('el contrato incluye el nombre del coarrendatario', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            coarrendatario: contratoVivienda.coarrendatario,
            condiciones: contratoVivienda.condiciones,
        });
        await form.assertContractContains('Carlos Arturo Ruiz Gómez');
    });

    test('el contrato incluye la cláusula Vigésima Primera de coarrendatarios', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            coarrendatario: contratoVivienda.coarrendatario,
            condiciones: contratoVivienda.condiciones,
        });
        await form.assertContractContains(/Vigésima Primera/i);
        await form.assertContractContains(/Coarrendatarios/i);
    });

    test('el contrato incluye el bloque de firma del coarrendatario', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            coarrendatario: contratoVivienda.coarrendatario,
            condiciones: contratoVivienda.condiciones,
        });
        await form.assertContractContains(/EL COARRENDATARIO/i);
    });

    test('sin coarrendatario el contrato NO incluye el bloque de firma', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            // sin coarrendatario
            condiciones: contratoVivienda.condiciones,
        });
        await form.assertContractNotContains(/EL COARRENDATARIO/i);
    });

    test('el contrato con coarrendatario y PH incluye ambas cláusulas', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoApartamentoPH.inmueble,
            arrendador: contratoApartamentoPH.arrendador,
            arrendatario: contratoApartamentoPH.arrendatario,
            coarrendatario: contratoApartamentoPH.coarrendatario,
            condiciones: contratoApartamentoPH.condiciones,
        });
        await form.assertContractContains(/PROPIEDAD HORIZONTAL/i);
        await form.assertContractContains(/EL COARRENDATARIO/i);
        await form.assertContractContains('Carlos Arturo Ruiz Gómez');
    });

    test('Step 3: no avanza si el coarrendatario está activado pero sin nombre', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();
        await form.fillInmueble(contratoVivienda.inmueble);
        await form.fillArrendador(contratoVivienda.arrendador);

        // Rellenar arrendatario manualmente
        await page.fill('#arrendatario-nombre', 'María Fernanda López Castro');
        await page.locator('#arrendatario-tipo-doc').click();
        await page.getByRole('option', { name: 'Cédula de Ciudadanía' }).first().click();
        await page.fill('#arrendatario-num-doc', '9876543210');
        await page.fill('#arrendatario-tel', '310 987 6543');

        // Activar toggle pero NO llenar el nombre del coarrendatario
        await page.getByRole('button', { name: /Agregar coarrendatario/i }).click();
        await page.locator('#coarrendatario-tipo-doc').click();
        await page.getByRole('option', { name: 'Cédula de Ciudadanía' }).first().click();
        await page.fill('#coarrendatario-num-doc', '1098765432');
        await page.fill('#coarrendatario-tel', '320 555 1234');

        await page.getByRole('button', { name: 'Continuar' }).click();

        // Debe seguir en Step 3
        await expect(page.getByRole('heading', { name: /Condiciones del contrato/i })).not.toBeVisible();
        await expect(page.getByText(/requerido/i).first()).toBeVisible();
    });

    test('descarga un PDF válido con coarrendatario', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        const dir = artifactsDir('coarrendatario');

        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            coarrendatario: contratoVivienda.coarrendatario,
            condiciones: contratoVivienda.condiciones,
        });

        const pdfPath = path.join(dir, 'contrato-con-coarrendatario.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});
