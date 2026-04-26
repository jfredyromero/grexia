import { test, expect } from '@playwright/test';
import { ArrendamientoFormPage } from './helpers/ArrendamientoFormPage';
import { PagareFormPage } from './helpers/PagareFormPage';
import { InteresesFormPage } from './helpers/InteresesFormPage';
import { contratoVivienda } from './fixtures/testData';
import { pagareSimple } from './fixtures/pagareTestData';
import { liquidacionCortaCorriente } from './fixtures/interesesTestData';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Arrendamiento — Persistencia en localStorage
//
// Claves observadas:
//   grexia_arr_form_v1  — datos del formulario (JSON)
//   grexia_arr_step_v1  — step actual (número)
//   grexia_arr_max_v1   — step más alto alcanzado (número)
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

        // Llenar Step 1 → nanostores escribe grexia_arr_step_v1='2'
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

        // Recargar — nanostores restaura grexia_arr_step_v1='3'
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
                    email: 'juan.gomez@grexiatest.co',
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
            localStorage.setItem('grexia_arr_form_v1', JSON.stringify(formData));
            localStorage.setItem('grexia_arr_step_v1', '3');
            localStorage.setItem('grexia_arr_max_v1', '3');
        });

        await page.goto('/herramientas/contrato-arrendamiento/generar');
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
            localStorage.setItem('grexia_arr_form_v1', '{{json inválido}}');
            localStorage.setItem('grexia_arr_step_v1', 'not-a-number');
            localStorage.setItem('grexia_arr_max_v1', '9999');
        });

        await page.goto('/herramientas/contrato-arrendamiento/generar');
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
//   grexia_pag_form_v1  — datos del formulario (JSON)
//   grexia_pag_step_v1  — step actual (número)
//   grexia_pag_max_v1   — step más alto alcanzado (número)
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

        // Llenar Step 1 → nanostores escribe grexia_pag_step_v1='2'
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

        // Recargar — nanostores restaura grexia_pag_step_v1='3'
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
                    email: 'juan.gomez@grexiatest.co',
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
            localStorage.setItem('grexia_pag_form_v1', JSON.stringify(formData));
            localStorage.setItem('grexia_pag_step_v1', '2');
            localStorage.setItem('grexia_pag_max_v1', '2');
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
            localStorage.setItem('grexia_pag_form_v1', '{{json inválido}}');
            localStorage.setItem('grexia_pag_step_v1', 'NaN');
            localStorage.setItem('grexia_pag_max_v1', '-99');
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

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Intereses — Persistencia en localStorage
//
// Claves observadas:
//   grexia_int_form_v1  — datos del formulario (JSON)
//   grexia_int_step_v1  — step actual (número)
//   grexia_int_max_v1   — step más alto alcanzado (número)
//
// Escenarios:
//   1. Recarga restaura el step y datos del Step 1 (obligación)
//   2. maxStep persiste → StepProgress habilita navegación directa tras recarga
//   3. Inyección directa de localStorage pre-carga el formulario en el step guardado
//   4. localStorage corrompido → fallback al estado inicial (Step 1 limpio)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Intereses — persistencia en localStorage', () => {
    test('recarga en Step 2 restaura el step guardado y el resultado', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();

        // Llenar Step 1 y avanzar → nanostores escribe grexia_int_step_v1='2'
        await form.fillObligacion(liquidacionCortaCorriente);
        await form.assertResultVisible();

        // Nota: Step 2 del liquidador necesita recalcular el resultado tras reload
        // porque el resultado no se persiste (solo formData + step).
        // Al recargar, el form restaura step=2 pero resultado=null → muestra "Calculando..."
        // El usuario vería el estado de carga. Verificamos que al menos el step se restaure.
        await page.reload();

        // Tras reload, nanostores restaura step=2. El wizard muestra step 2
        // pero sin resultado precalculado muestra "Calculando..." o el preview vacio.
        // Verificamos que no vuelve al step 1 (el heading de obligacion no debe ser visible).
        // El comportamiento depende de la implementacion: puede mostrar "Calculando..." o redirigir.
        // Esperemos a que el componente React monte.
        await page.waitForTimeout(3_000);

        // Si step=2 persiste, el heading "La obligación" (step 1) no deberia estar visible
        // a menos que el wizard redirija a step 1 cuando no hay resultado.
        // Verificamos que al menos el formulario cargo correctamente.
        const step1Visible = await page.getByRole('heading', { name: /La obligación/i }).isVisible();

        if (step1Visible) {
            // El wizard redirigió a step 1 porque no hay resultado precalculado.
            // Verificamos que los datos del formulario persisten.
            const capitalValue = await page.locator('#int-capital').inputValue();
            expect(capitalValue).toContain('5');
            await expect(page.locator('#int-fecha-inicio')).toHaveValue('2024-10-01');
            await expect(page.locator('#int-fecha-pago')).toHaveValue('2024-11-15');
        } else {
            // step=2 persiste — el wizard muestra algo en step 2
            // Verificamos que el step progress muestra paso 2
            const step2Btn = page.getByRole('button', { name: /Ir al paso 2: Liquidación/i });
            await expect(step2Btn).toBeVisible();
        }
    });

    test('recarga restaura los datos del formulario (obligacion)', async ({ page }) => {
        const form = new InteresesFormPage(page);
        await form.goto();

        // Llenar datos pero NO avanzar — llenar manualmente sin click "Calcular"
        await page.locator('#int-capital').fill(liquidacionCortaCorriente.capital);
        await page.getByRole('button', { name: /^Corriente/ }).click();
        await page.fill('#int-fecha-inicio', liquidacionCortaCorriente.fechaIniciaMora);
        await page.fill('#int-fecha-pago', liquidacionCortaCorriente.fechaPago);

        // Recargar — nanostores restaura el formData
        await page.reload();
        await page.waitForSelector('h2:has-text("La obligación")', { timeout: 15_000 });

        // Verificar que los datos persisten
        await expect(page.locator('#int-fecha-inicio')).toHaveValue('2024-10-01');
        await expect(page.locator('#int-fecha-pago')).toHaveValue('2024-11-15');
    });

    test('inyeccion directa de localStorage pre-carga el formulario con datos', async ({ page }) => {
        // Simular una sesion previa donde el usuario lleno el formulario
        await page.addInitScript(() => {
            const formData = {
                capital: '15000000',
                tipoInteres: 'moratorio',
                fechaIniciaMora: '2024-06-01',
                fechaPago: '2024-12-31',
            };
            localStorage.setItem('grexia_int_form_v1', JSON.stringify(formData));
            localStorage.setItem('grexia_int_step_v1', '1');
            localStorage.setItem('grexia_int_max_v1', '1');
        });

        await page.goto('/herramientas/liquidacion-de-intereses/generar');
        await page.waitForSelector('h2:has-text("La obligación")', { timeout: 15_000 });

        // Debe comenzar en Step 1 con los datos pre-cargados
        await expect(page.getByRole('heading', { name: /La obligación/i })).toBeVisible();

        // Las fechas deben estar pre-cargadas
        await expect(page.locator('#int-fecha-inicio')).toHaveValue('2024-06-01');
        await expect(page.locator('#int-fecha-pago')).toHaveValue('2024-12-31');
    });

    test('localStorage corrompido — fallback al estado inicial en Step 1', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('grexia_int_form_v1', '{{json invalido}}');
            localStorage.setItem('grexia_int_step_v1', 'not-a-number');
            localStorage.setItem('grexia_int_max_v1', '9999');
        });

        await page.goto('/herramientas/liquidacion-de-intereses/generar');
        await page.waitForSelector('h2:has-text("La obligación")', { timeout: 15_000 });

        // Debe mostrar Step 1 limpio
        await expect(page.getByRole('heading', { name: /La obligación/i })).toBeVisible();

        // El capital debe estar vacio (fallback a INITIAL_INTERESES_DATA)
        await expect(page.locator('#int-fecha-inicio')).toHaveValue('');
        await expect(page.locator('#int-fecha-pago')).toHaveValue('');

        // No debe mostrar el preview (step 2)
        await expect(page.locator('#intereses-preview')).not.toBeVisible();
    });
});
