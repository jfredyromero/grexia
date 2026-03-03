import { test, expect } from '@playwright/test';
import { ArrendamientoFormPage } from './helpers/ArrendamientoFormPage';
import { PagareFormPage } from './helpers/PagareFormPage';
import { contratoVivienda } from './fixtures/testData';
import { pagareSimple } from './fixtures/pagareTestData';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Arrendamiento — Persistencia en localStorage
//
// Claves observadas:
//   lexia_arr_form_v1  — datos del formulario (JSON)
//   lexia_arr_step_v1  — step actual (número)
//   lexia_arr_max_v1   — step más alto alcanzado (número)
//
// Escenarios:
//   1. Recarga restaura el step guardado
//   2. Recarga restaura los datos del Step 1 (inmueble)
//   3. Recarga restaura los datos del Step 2 (arrendador)
//   4. maxStep persiste → StepProgress habilita navegación directa tras recarga
//   5. Inyección directa de localStorage pre-carga el formulario en el step guardado
//   6. localStorage corrompido → fallback al estado inicial (Step 1 limpio)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Arrendamiento — persistencia en localStorage', () => {
    test('recarga en Step 2 restaura el step guardado', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();

        // Llenar Step 1 → nanostores escribe lexia_arr_step_v1='2'
        await form.fillInmueble(contratoVivienda.inmueble);

        // Recargar la página — nanostores debe leer el step del localStorage
        await page.reload();
        await page.waitForSelector('h2:has-text("El arrendador")', { timeout: 15_000 });

        // Debe seguir en Step 2, no volver al inicio
        await expect(page.getByRole('heading', { name: /El arrendador/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /El arrendatario/i })).not.toBeVisible();
    });

    test('recarga restaura los datos del Step 1 (inmueble)', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();

        // Llenar Step 1 y avanzar a Step 2
        await form.fillInmueble(contratoVivienda.inmueble);

        // Recargar — sigue en Step 2
        await page.reload();
        await page.waitForSelector('h2:has-text("El arrendador")', { timeout: 15_000 });

        // Volver a Step 1 para verificar que los datos del inmueble persisten
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: /Anterior/i }).click();
        await page.waitForSelector('text=¿Está en propiedad horizontal?');

        await expect(page.locator('#direccion')).toHaveValue(contratoVivienda.inmueble.direccion);
    });

    test('recarga restaura los datos del Step 2 (arrendador)', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();

        // Llenar Steps 1 y 2 → llegar a Step 3
        await form.fillInmueble(contratoVivienda.inmueble);
        await form.fillArrendador(contratoVivienda.arrendador);

        // Recargar — nanostores restaura lexia_arr_step_v1='3'
        await page.reload();
        await page.waitForSelector('h2:has-text("El arrendatario")', { timeout: 15_000 });

        // Volver a Step 2 y verificar que el nombre del arrendador persiste
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: /Anterior/i }).click();
        await page.waitForSelector('h2:has-text("El arrendador")');

        await expect(page.locator('#arrendador-nombre')).toHaveValue(contratoVivienda.arrendador.nombre);
    });

    test('maxStep persiste y habilita navegación directa desde StepProgress tras recarga', async ({ page }) => {
        const form = new ArrendamientoFormPage(page);
        await form.goto();

        // Avanzar hasta Step 3 (maxStep se fija en 3)
        await form.fillInmueble(contratoVivienda.inmueble);
        await form.fillArrendador(contratoVivienda.arrendador);

        // Retroceder a Step 2 (currentStep=2, maxStep=3 no cambia)
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: /Anterior/i }).click();
        await page.waitForSelector('h2:has-text("El arrendador")');

        // Recargar — debe restaurar currentStep=2 y maxStep=3
        await page.reload();
        await page.waitForSelector('h2:has-text("El arrendador")', { timeout: 15_000 });

        // Step 3 debe ser clickeable en el StepProgress (maxStep=3 > currentStep=2)
        const step3Btn = page.getByRole('button', { name: 'Ir al paso 3: Arrendatario' });
        await expect(step3Btn).toBeVisible();

        // Navegar directamente a Step 3 sin rellenar el formulario
        await step3Btn.click();
        await expect(page.getByRole('heading', { name: /El arrendatario/i })).toBeVisible();
    });

    test('inyección directa de localStorage pre-carga el formulario en el step guardado', async ({ page }) => {
        // Simular una sesión previa donde el usuario llenó Steps 1 y 2
        await page.addInitScript(() => {
            const formData = {
                inmueble: {
                    tipoInmueble: 'Apartamento',
                    propiedadHorizontal: false,
                    direccion: 'Calle 45 # 23-15, Apto 301',
                    ciudad: 'Bogotá D.C.',
                    departamento: 'Bogotá',
                    estrato: '3',
                    areaMq: '65',
                },
                arrendador: {
                    nombreCompleto: 'Juan Carlos Gómez Martínez',
                    tipoDocumento: 'CC',
                    numeroDocumento: '1234567890',
                    telefono: '300 123 4567',
                    email: 'juan.gomez@lexiatest.co',
                },
                arrendatario: {
                    nombreCompleto: '',
                    tipoDocumento: '',
                    numeroDocumento: '',
                    telefono: '',
                    email: '',
                },
                condiciones: {
                    fechaInicio: '',
                    duracionMeses: 12,
                    canonMensual: '',
                    depositoCOP: '',
                    diaPagoMes: 5,
                    actividadComercial: '',
                },
            };
            localStorage.setItem('lexia_arr_form_v1', JSON.stringify(formData));
            localStorage.setItem('lexia_arr_step_v1', '3');
            localStorage.setItem('lexia_arr_max_v1', '3');
        });

        await page.goto('/herramientas/arrendamiento/generar');
        await page.waitForSelector('h2:has-text("El arrendatario")', { timeout: 15_000 });

        // Debe comenzar directamente en Step 3 (arrendatario)
        await expect(page.getByRole('heading', { name: /El arrendatario/i })).toBeVisible();

        // Step 2 debe ser accesible (maxStep=3 ≥ 2) y clickeable en StepProgress
        const step2Btn = page.getByRole('button', { name: 'Ir al paso 2: Arrendador' });
        await expect(step2Btn).toBeVisible();

        // Al navegar al Step 2, los datos del arrendador deben estar pre-cargados
        await step2Btn.click();
        await page.waitForSelector('h2:has-text("El arrendador")');
        await expect(page.locator('#arrendador-nombre')).toHaveValue('Juan Carlos Gómez Martínez');
    });

    test('localStorage corrompido — fallback al estado inicial en Step 1', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('lexia_arr_form_v1', '{{json inválido}}');
            localStorage.setItem('lexia_arr_step_v1', 'not-a-number');
            localStorage.setItem('lexia_arr_max_v1', '9999');
        });

        await page.goto('/herramientas/arrendamiento/generar');
        await page.waitForSelector('button:has-text("Continuar")', { timeout: 15_000 });

        // Debe mostrar Step 1 limpio (selector de tipo de inmueble)
        await expect(page.getByRole('button', { name: /Apartamento/ })).toBeVisible();

        // No debe mostrar ningún step posterior
        await expect(page.getByRole('heading', { name: /El arrendador/i })).not.toBeVisible();
        await expect(page.getByRole('heading', { name: /El arrendatario/i })).not.toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Pagaré — Persistencia en localStorage
//
// Claves observadas:
//   lexia_pag_form_v1  — datos del formulario (JSON)
//   lexia_pag_step_v1  — step actual (número)
//   lexia_pag_max_v1   — step más alto alcanzado (número)
//
// Escenarios:
//   1. Recarga restaura el step guardado
//   2. Recarga restaura los datos del Step 1 (acreedor)
//   3. Recarga restaura los datos del Step 2 (deudor)
//   4. maxStep persiste → StepProgress habilita navegación directa tras recarga
//   5. Inyección directa de localStorage pre-carga el formulario en el step guardado
//   6. localStorage corrompido → fallback al estado inicial (Step 1 limpio)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Pagaré — persistencia en localStorage', () => {
    test('recarga en Step 2 restaura el step guardado', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();

        // Llenar Step 1 → nanostores escribe lexia_pag_step_v1='2'
        await form.fillAcreedor(pagareSimple.acreedor);

        await page.reload();
        await page.waitForSelector('h2:has-text("El deudor")', { timeout: 15_000 });

        // Debe seguir en Step 2, no volver al inicio
        await expect(page.getByRole('heading', { name: /El deudor/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /El acreedor/i })).not.toBeVisible();
    });

    test('recarga restaura los datos del Step 1 (acreedor)', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();

        // Llenar Step 1 y avanzar a Step 2
        await form.fillAcreedor(pagareSimple.acreedor);

        await page.reload();
        await page.waitForSelector('h2:has-text("El deudor")', { timeout: 15_000 });

        // Volver a Step 1 y verificar que el nombre del acreedor persiste
        await page.getByRole('button', { name: /Anterior/i }).click();
        await page.waitForSelector('h2:has-text("El acreedor")');

        await expect(page.locator('#acreedor-nombre')).toHaveValue(pagareSimple.acreedor.nombre);
    });

    test('recarga restaura los datos del Step 2 (deudor)', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();

        // Llenar Steps 1 y 2 → llegar a Step 3
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        // Recargar — nanostores restaura lexia_pag_step_v1='3'
        await page.reload();
        await page.waitForSelector('h2:has-text("La obligación")', { timeout: 15_000 });

        // Volver a Step 2 y verificar que el nombre del deudor persiste
        await page.getByRole('button', { name: /Anterior/i }).click();
        await page.waitForSelector('h2:has-text("El deudor")');

        await expect(page.locator('#deudor-nombre')).toHaveValue(pagareSimple.deudor.nombre);
    });

    test('maxStep persiste y habilita navegación directa desde StepProgress tras recarga', async ({ page }) => {
        const form = new PagareFormPage(page);
        await form.goto();

        // Avanzar hasta Step 3 (maxStep se fija en 3)
        await form.fillAcreedor(pagareSimple.acreedor);
        await form.fillDeudor(pagareSimple.deudor);

        // Retroceder a Step 2 (currentStep=2, maxStep=3 no cambia)
        await page.getByRole('button', { name: /Anterior/i }).click();
        await page.waitForSelector('h2:has-text("El deudor")');

        // Recargar — debe restaurar currentStep=2 y maxStep=3
        await page.reload();
        await page.waitForSelector('h2:has-text("El deudor")', { timeout: 15_000 });

        // Step 3 debe ser clickeable en el StepProgress (maxStep=3 > currentStep=2)
        const step3Btn = page.getByRole('button', { name: 'Ir al paso 3: Obligación' });
        await expect(step3Btn).toBeVisible();

        // Navegar directamente a Step 3 sin rellenar el formulario
        await step3Btn.click();
        await expect(page.getByRole('heading', { name: /La obligación/i })).toBeVisible();
    });

    test('inyección directa de localStorage pre-carga el formulario en el step guardado', async ({ page }) => {
        // Simular una sesión previa donde el usuario llenó Step 1
        await page.addInitScript(() => {
            const formData = {
                acreedor: {
                    nombreCompleto: 'Juan Carlos Gómez Martínez',
                    tipoDocumento: 'CC',
                    numeroDocumento: '1234567890',
                    telefono: '300 123 4567',
                    email: 'juan.gomez@lexiatest.co',
                },
                deudor: {
                    nombreCompleto: '',
                    tipoDocumento: '',
                    numeroDocumento: '',
                    telefono: '',
                    email: '',
                    ciudadResidencia: '',
                },
                obligacion: {
                    valorPrincipal: '',
                    fechaSuscripcion: '',
                    modalidadPago: '',
                    fechaVencimiento: '',
                    numeroCuotas: '',
                    periodoCuotas: '',
                    ciudadSuscripcion: '',
                    tasaInteresMora: '',
                },
            };
            localStorage.setItem('lexia_pag_form_v1', JSON.stringify(formData));
            localStorage.setItem('lexia_pag_step_v1', '2');
            localStorage.setItem('lexia_pag_max_v1', '2');
        });

        await page.goto('/herramientas/pagare/generar');
        await page.waitForSelector('h2:has-text("El deudor")', { timeout: 15_000 });

        // Debe comenzar directamente en Step 2 (deudor)
        await expect(page.getByRole('heading', { name: /El deudor/i })).toBeVisible();

        // Step 1 debe ser accesible y clickeable en StepProgress
        const step1Btn = page.getByRole('button', { name: 'Ir al paso 1: Acreedor' });
        await expect(step1Btn).toBeVisible();

        // Al navegar al Step 1, los datos del acreedor deben estar pre-cargados
        await step1Btn.click();
        await page.waitForSelector('h2:has-text("El acreedor")');
        await expect(page.locator('#acreedor-nombre')).toHaveValue('Juan Carlos Gómez Martínez');
    });

    test('localStorage corrompido — fallback al estado inicial en Step 1', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('lexia_pag_form_v1', '{{json inválido}}');
            localStorage.setItem('lexia_pag_step_v1', 'NaN');
            localStorage.setItem('lexia_pag_max_v1', '-99');
        });

        await page.goto('/herramientas/pagare/generar');
        await page.waitForSelector('h2:has-text("El acreedor")', { timeout: 15_000 });

        // Debe mostrar Step 1 limpio
        await expect(page.getByRole('heading', { name: /El acreedor/i })).toBeVisible();

        // El campo nombre debe estar vacío (no hay datos previos)
        await expect(page.locator('#acreedor-nombre')).toHaveValue('');

        // No debe mostrar ningún step posterior
        await expect(page.getByRole('heading', { name: /El deudor/i })).not.toBeVisible();
    });
});
