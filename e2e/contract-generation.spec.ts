import { test, expect } from '@playwright/test';
import * as path from 'path';
import { MinutaFormPage, assertValidPDF, artifactsDir } from './helpers/MinutaFormPage';
import { contratoVivienda, contratoLocalComercial, contratoOficinaPH } from './fixtures/testData';

// ── Helper ────────────────────────────────────────────────────────────────────

function outDir(label: string) {
    return artifactsDir(label);
}

// ── Suite 1: Contrato de vivienda — flujo completo + PDF ──────────────────────

test.describe('Contrato de vivienda (Apartamento, no PH)', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new MinutaFormPage(page);
        const dir = outDir('vivienda-apartamento');

        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            condiciones: contratoVivienda.condiciones,
        });

        // Screenshot the rendered contract before downloading
        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        // Verify key contract content
        await form.assertContractContains(/Ley 820 de 2003/i);
        await form.assertContractContains('Juan Carlos Gómez Martínez');
        await form.assertContractContains('María Fernanda López Castro');
        await form.assertContractContains(/Calle 45 # 23-15/i);

        // Free plan watermark must be visible
        await form.assertWatermarkVisible();

        // Download and validate PDF
        const pdfPath = path.join(dir, 'contrato-vivienda.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes, 'PDF should be larger than 10 KB').toBeGreaterThan(10_000);
    });

    test('el contrato contiene el canon en palabras', async ({ page }) => {
        const form = new MinutaFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            condiciones: contratoVivienda.condiciones,
        });
        // 1.500.000 → UN MILLÓN QUINIENTOS MIL PESOS
        await form.assertContractContains(/UN MILLÓN QUINIENTOS MIL PESOS/i);
    });

    test('no incluye cláusula de PH cuando el inmueble no es PH', async ({ page }) => {
        const form = new MinutaFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            condiciones: contratoVivienda.condiciones,
        });
        await expect(page.locator('#contract-content')).not.toContainText(
            /PROPIEDAD HORIZONTAL Y REGLAMENTO/i,
        );
    });
});

// ── Suite 2: Contrato comercial — Local Comercial PH ─────────────────────────

test.describe('Contrato comercial (Local Comercial, PH)', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new MinutaFormPage(page);
        const dir = outDir('local-comercial-ph');

        await form.goto();
        await form.fillAllSteps({
            ...contratoLocalComercial.inmueble,
            arrendador: contratoLocalComercial.arrendador,
            arrendatario: contratoLocalComercial.arrendatario,
            condiciones: contratoLocalComercial.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        // Commercial contract uses Código de Comercio
        await form.assertContractContains(/Código de Comercio/i);
        // Activity clause
        await form.assertContractContains(/Restaurante de comida rápida/i);
        // PH clause
        await form.assertContractContains(/PROPIEDAD HORIZONTAL/i);

        const pdfPath = path.join(dir, 'contrato-local-comercial.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(10_000);
    });

    test('muestra la cláusula de actividad comercial autorizada', async ({ page }) => {
        const form = new MinutaFormPage(page);
        await form.goto();
        await form.fillAllSteps({
            ...contratoLocalComercial.inmueble,
            arrendador: contratoLocalComercial.arrendador,
            arrendatario: contratoLocalComercial.arrendatario,
            condiciones: contratoLocalComercial.condiciones,
        });
        await form.assertContractContains(/ACTIVIDAD COMERCIAL AUTORIZADA/i);
    });
});

// ── Suite 3: Contrato de oficina PH ──────────────────────────────────────────

test.describe('Contrato comercial (Oficina, PH)', () => {
    test('completa el formulario y descarga un PDF válido', async ({ page }) => {
        const form = new MinutaFormPage(page);
        const dir = outDir('oficina-ph');

        await form.goto();
        await form.fillAllSteps({
            ...contratoOficinaPH.inmueble,
            arrendador: contratoOficinaPH.arrendador,
            arrendatario: contratoOficinaPH.arrendatario,
            condiciones: contratoOficinaPH.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview.png'));

        await form.assertContractContains(/Código de Comercio/i);
        await form.assertContractContains(/DESTINACIÓN DEL INMUEBLE/i);
        await form.assertContractContains(/PROPIEDAD HORIZONTAL/i);

        const pdfPath = path.join(dir, 'contrato-oficina.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(10_000);
    });
});

// ── Suite 4: Plan básico — sin marca de agua ──────────────────────────────────

test.describe('Plan básico — sin marca de agua', () => {
    test('no muestra la marca de agua de Lexia', async ({ page }) => {
        const form = new MinutaFormPage(page);
        await form.goto('basico');
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            condiciones: contratoVivienda.condiciones,
        });
        await form.assertWatermarkHidden();
    });

    test('descarga PDF sin marca de agua (plan básico)', async ({ page }) => {
        const form = new MinutaFormPage(page);
        const dir = outDir('plan-basico');

        await form.goto('basico');
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            condiciones: contratoVivienda.condiciones,
        });

        await form.screenshotContract(path.join(dir, 'contract-preview-basico.png'));

        const pdfPath = path.join(dir, 'contrato-basico.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ── Suite 5: Plan pro ─────────────────────────────────────────────────────────

test.describe('Plan pro — sin marca de agua', () => {
    test('no muestra la marca de agua de Lexia', async ({ page }) => {
        const form = new MinutaFormPage(page);
        await form.goto('pro');
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            condiciones: contratoVivienda.condiciones,
        });
        await form.assertWatermarkHidden();
    });
});

// ── Suite 6: Plan gratuito — marca de agua visible ────────────────────────────

test.describe('Plan gratuito — marca de agua', () => {
    test('muestra la marca de agua en el contrato', async ({ page }) => {
        const form = new MinutaFormPage(page);
        await form.goto('free');
        await form.fillAllSteps({
            ...contratoVivienda.inmueble,
            arrendador: contratoVivienda.arrendador,
            arrendatario: contratoVivienda.arrendatario,
            condiciones: contratoVivienda.condiciones,
        });
        await form.assertWatermarkVisible();
    });
});
