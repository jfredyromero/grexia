import { test, expect } from '@playwright/test';
import * as path from 'path';
import { PoderFormPage, assertValidPDF, artifactDir } from './helpers/PoderFormPage';
import {
    declaracionPertenencia,
    procesoLaboral,
    tramitesNotariales,
    administracionBienes,
    procesoFamiliaMultiplesDemandados,
} from './fixtures/poderTestData';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Declaración de Pertenencia (inmueble + demandados)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Poder — Declaración de Pertenencia: flujo completo', () => {
    test('completa los 5 pasos y muestra el preview', async ({ page }) => {
        const form = new PoderFormPage(page);
        const dir = artifactDir('poder-declaracion-pertenencia');

        await form.goto();
        await form.fillAllSteps(declaracionPertenencia);

        await form.screenshotPreview(path.join(dir, 'preview.png'));
        await form.assertPreviewContains(declaracionPertenencia.poderdante.nombreCompleto);
        await form.assertPreviewContains(declaracionPertenencia.apoderado.nombreCompleto);
    });

    test('muestra la dirección del inmueble en el preview', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();
        await form.fillAllSteps(declaracionPertenencia);

        await form.assertPreviewContains(declaracionPertenencia.poderdante.direccionInmueble!);
        await form.assertPreviewContains(declaracionPertenencia.poderdante.matriculaInmobiliaria!);
    });

    test('muestra la lista de demandados separados por coma', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();
        await form.fillAllSteps(declaracionPertenencia);

        // demandados: ['Personas Indeterminadas', 'Herederos de Juan Perez Gomez']
        await form.assertPreviewContains('Personas Indeterminadas');
        await form.assertPreviewContains('Herederos de Juan Perez Gomez');
    });

    test('muestra la tarjeta profesional del apoderado', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();
        await form.fillAllSteps(declaracionPertenencia);

        await form.assertPreviewContains(declaracionPertenencia.apoderado.tarjetaProfesional);
    });

    test('descarga PDF — archivo válido', async ({ page }) => {
        const form = new PoderFormPage(page);
        const dir = artifactDir('poder-declaracion-pertenencia');
        await form.goto();
        await form.fillAllSteps(declaracionPertenencia);

        const pdfPath = path.join(dir, 'poder-declaracion-pertenencia.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(1000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Proceso Laboral (solo demandados, sin inmueble)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Poder — Proceso Laboral: solo demandados', () => {
    test('completa el flujo y NO pide datos de inmueble', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();
        await form.selectTipoProceso('proceso-laboral');

        // En Step 2 los campos de inmueble no deben existir
        await expect(page.locator('#poderdante-direccion-inmueble')).not.toBeVisible();
        await expect(page.locator('#poderdante-matricula')).not.toBeVisible();

        await form.fillPoderdante(procesoLaboral.poderdante);
        await form.fillApoderado(procesoLaboral.apoderado);
        await form.fillProceso(procesoLaboral.proceso);

        await form.assertPreviewContains(procesoLaboral.proceso.demandados![0]);
    });

    test('preview NO muestra texto de inmueble', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();
        await form.fillAllSteps(procesoLaboral);

        await form.assertPreviewNotContains('matrícula inmobiliaria');
        await form.assertPreviewNotContains('matricula inmobiliaria');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Trámites Notariales (solo inmueble, sin demandados)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Poder — Trámites Notariales: solo inmueble', () => {
    test('completa el flujo y NO pide demandados', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();
        await form.selectTipoProceso('tramites-notariales');

        // En Step 2 los campos de inmueble SI deben existir
        await form.fillPoderdante(tramitesNotariales.poderdante);
        await form.fillApoderado(tramitesNotariales.apoderado);

        // En Step 4 NO deben existir los campos de demandados
        await expect(page.locator('#demandado-0')).not.toBeVisible();
        // Pero SI debe existir el campo de objeto del poder
        await expect(page.locator('#objeto-poder')).toBeVisible();

        await form.fillProceso(tramitesNotariales.proceso);

        await form.assertPreviewContains(tramitesNotariales.poderdante.direccionInmueble!);
        await form.assertPreviewContains(tramitesNotariales.poderdante.matriculaInmobiliaria!);
    });

    test('preview NO muestra texto de demandados', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();
        await form.fillAllSteps(tramitesNotariales);

        await form.assertPreviewNotContains('en contra de');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: Administración de Bienes (inmueble + objeto libre)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Poder — Administración de Bienes', () => {
    test('completa el flujo con objeto del poder libre', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();
        await form.fillAllSteps(administracionBienes);

        await form.assertPreviewContains(administracionBienes.poderdante.direccionInmueble!);
    });

    test('descarga PDF — archivo válido', async ({ page }) => {
        const form = new PoderFormPage(page);
        const dir = artifactDir('poder-administracion-bienes');
        await form.goto();
        await form.fillAllSteps(administracionBienes);

        const pdfPath = path.join(dir, 'poder-administracion-bienes.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(1000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: Demandados dinámicos
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Poder — Demandados dinámicos', () => {
    test('agrega y elimina demandados correctamente', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();

        await form.selectTipoProceso('proceso-civil');
        await form.fillPoderdante({
            nombreCompleto: 'Test',
            ccPoderdante: '123',
            lugarExpedicionPoderdante: 'Bogota',
            ciudadPoderdante: 'Bogota',
        });
        await form.fillApoderado({
            nombreCompleto: 'Apoderado',
            ccApoderado: '456',
            lugarExpedicionApoderado: 'Bogota',
            ciudadApoderado: 'Bogota',
            tarjetaProfesional: '999',
        });

        // Llenar primer demandado
        await page.fill('#demandado-0', 'Demandado Uno');

        // Agregar segundo demandado
        await form.addDemandado();
        await page.fill('#demandado-1', 'Demandado Dos');

        // Agregar tercer demandado
        await form.addDemandado();
        await page.fill('#demandado-2', 'Demandado Tres');

        // Verificar que existan los 3 inputs
        await expect(page.locator('#demandado-0')).toHaveValue('Demandado Uno');
        await expect(page.locator('#demandado-1')).toHaveValue('Demandado Dos');
        await expect(page.locator('#demandado-2')).toHaveValue('Demandado Tres');

        // Eliminar el segundo demandado
        await form.removeDemandado(1);

        // Quedan 2 demandados (los que eran 0 y 2)
        await expect(page.locator('#demandado-0')).toHaveValue('Demandado Uno');
        await expect(page.locator('#demandado-1')).toHaveValue('Demandado Tres');
        await expect(page.locator('#demandado-2')).not.toBeVisible();
    });

    test('soporta múltiples demandados en el preview', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();
        await form.fillAllSteps(procesoFamiliaMultiplesDemandados);

        for (const demandado of procesoFamiliaMultiplesDemandados.proceso.demandados!) {
            await form.assertPreviewContains(demandado);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: Validación de campos requeridos
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Poder — Validación de formulario', () => {
    test('Step 1: error si no se selecciona tipo de proceso', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();

        await page.getByRole('button', { name: 'Continuar' }).click();
        await expect(page.locator('text=Selecciona el tipo de proceso.')).toBeVisible();
    });

    test('Step 2: error si nombre del poderdante está vacío', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();

        await form.selectTipoProceso('proceso-civil');
        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.locator('text=El nombre completo es requerido.')).toBeVisible();
    });

    test('Step 2: error si dirección del inmueble está vacía cuando aplica', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();

        await form.selectTipoProceso('declaracion-pertenencia');
        await page.fill('#poderdante-nombre', 'Test');
        await page.fill('#poderdante-cc', '123');
        await page.fill('#poderdante-lugar', 'Bogota');
        await page.fill('#poderdante-ciudad', 'Bogota');
        // No llenar direccion ni matricula

        await page.getByRole('button', { name: 'Continuar' }).click();
        await expect(page.locator('text=La dirección del inmueble es requerida.')).toBeVisible();
    });

    test('Step 3: error si nombre del apoderado está vacío', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();

        await form.selectTipoProceso('proceso-civil');
        await form.fillPoderdante({
            nombreCompleto: 'Test',
            ccPoderdante: '123',
            lugarExpedicionPoderdante: 'Bogota',
            ciudadPoderdante: 'Bogota',
        });
        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.locator('text=El nombre completo del apoderado es requerido.')).toBeVisible();
    });

    test('Step 3: error si tarjeta profesional está vacía', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();

        await form.selectTipoProceso('proceso-civil');
        await form.fillPoderdante({
            nombreCompleto: 'Test',
            ccPoderdante: '123',
            lugarExpedicionPoderdante: 'Bogota',
            ciudadPoderdante: 'Bogota',
        });
        await page.fill('#apoderado-nombre', 'Apoderado Test');
        await page.fill('#apoderado-cc', '456');
        await page.fill('#apoderado-lugar', 'Bogota');
        await page.fill('#apoderado-ciudad', 'Bogota');
        // No llenar tarjeta

        await page.getByRole('button', { name: 'Continuar' }).click();
        await expect(page.locator('text=El número de Tarjeta Profesional es requerido.')).toBeVisible();
    });

    test('Step 4: error si no hay al menos un demandado cuando aplica', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();

        await form.selectTipoProceso('proceso-civil');
        await form.fillPoderdante({
            nombreCompleto: 'Test',
            ccPoderdante: '123',
            lugarExpedicionPoderdante: 'Bogota',
            ciudadPoderdante: 'Bogota',
        });
        await form.fillApoderado({
            nombreCompleto: 'Apoderado',
            ccApoderado: '456',
            lugarExpedicionApoderado: 'Bogota',
            ciudadApoderado: 'Bogota',
            tarjetaProfesional: '999',
        });

        // No llenar demandado-0
        await page.getByRole('button', { name: 'Ver poder' }).click();
        await expect(page.locator('text=Indica al menos un demandado.')).toBeVisible();
    });

    test('Step 4: error si objeto del poder está vacío en trámites notariales', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();

        await form.selectTipoProceso('tramites-notariales');
        await form.fillPoderdante({
            nombreCompleto: 'Test',
            ccPoderdante: '123',
            lugarExpedicionPoderdante: 'Bogota',
            ciudadPoderdante: 'Bogota',
            direccionInmueble: 'Calle 1',
            matriculaInmobiliaria: '123',
        });
        await form.fillApoderado({
            nombreCompleto: 'Apoderado',
            ccApoderado: '456',
            lugarExpedicionApoderado: 'Bogota',
            ciudadApoderado: 'Bogota',
            tarjetaProfesional: '999',
        });

        await page.getByRole('button', { name: 'Ver poder' }).click();
        await expect(page.locator('text=Describe el objeto del poder.')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7: Navegación
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Poder — Navegación', () => {
    test('botón Anterior vuelve al step previo', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();

        await form.selectTipoProceso('proceso-civil');
        await form.fillPoderdante({
            nombreCompleto: 'Test',
            ccPoderdante: '123',
            lugarExpedicionPoderdante: 'Bogota',
            ciudadPoderdante: 'Bogota',
        });

        // Estamos en step 3 — retroceder
        await page.getByRole('button', { name: 'Anterior' }).click();
        await expect(page.locator('h2:has-text("El poderdante")')).toBeVisible();
    });

    test('modificar datos vuelve al step anterior desde el preview', async ({ page }) => {
        const form = new PoderFormPage(page);
        await form.goto();
        await form.fillAllSteps(declaracionPertenencia);

        await page.getByRole('button', { name: 'Modificar datos' }).click();
        await expect(page.locator('h2:has-text("Detalles del proceso")')).toBeVisible();
    });
});
