import { test, expect } from '@playwright/test';
import * as path from 'path';
import { TutelaFormPage, assertValidPDF, artifactDir } from './helpers/TutelaFormPage';
import { tutelaBasica, tutelaSinMedico, tutelaOtraEPS } from './fixtures/tutelaTestData';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Landing y selector de temáticas
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tutela — landing y selector', () => {
    test('landing muestra el selector de temáticas', async ({ page }) => {
        await page.goto('/herramientas/tutela');
        await expect(page.getByRole('heading', { name: /tutela/i }).first()).toBeVisible();
        await expect(page.getByText('Salud', { exact: true })).toBeVisible();
        await expect(page.getByText('Vivienda', { exact: true })).toBeVisible();
        await expect(page.getByText('Educación', { exact: true })).toBeVisible();
    });

    test('las opciones deshabilitadas muestran tooltip en hover', async ({ page }) => {
        await page.goto('/herramientas/tutela');
        const viviendaCard = page.locator('[class*="cursor-not-allowed"]').first();
        await viviendaCard.hover();
        await expect(page.getByText('Asesoría personalizada').first()).toBeVisible();
    });

    test('navega al formulario al seleccionar Salud', async ({ page }) => {
        await page.goto('/herramientas/tutela');
        await page.locator('a[href*="tutela/generar"]').first().click();
        await expect(page).toHaveURL(new RegExp('tutela/generar'));
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Flujo completo — con médico tratante
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tutela — flujo completo con médico tratante', () => {
    test('completa los 7 pasos y muestra el preview', async ({ page }) => {
        const form = new TutelaFormPage(page);
        const dir = artifactDir('tutela-basica');

        await form.goto();
        await form.fillAllSteps(tutelaBasica);

        await form.screenshotPreview(path.join(dir, 'preview.png'));
        await expect(page.locator('#tutela-preview')).toBeVisible();
    });

    test('muestra las secciones del documento', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillAllSteps(tutelaBasica);

        await form.assertPreviewContains('I. HECHOS');
        await form.assertPreviewContains('II. MEDIDA PROVISIONAL');
        await form.assertPreviewContains('III. PRETENSIONES');
        await form.assertPreviewContains('IV. DERECHOS FUNDAMENTALES VULNERADOS');
        await form.assertPreviewContains('IX. JURAMENTO');
        await form.assertPreviewContains('X. NOTIFICACIONES');
    });

    test('muestra datos del accionante en el preview', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillAllSteps(tutelaBasica);

        await form.assertPreviewContains(tutelaBasica.accionante.nombre);
        await form.assertPreviewContains(tutelaBasica.accionante.cedula);
    });

    test('muestra datos de la EPS y diagnóstico', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillAllSteps(tutelaBasica);

        await form.assertPreviewContains('Sura EPS');
        await form.assertPreviewContains('Diabetes tipo 2');
        await form.assertPreviewContains('Insulina Glargina 100 UI/mL');
    });

    test('muestra el nombre del médico tratante', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillAllSteps(tutelaBasica);

        await form.assertPreviewContains('Dr. Carlos Pérez');
    });

    test('descarga un PDF válido', async ({ page }) => {
        const form = new TutelaFormPage(page);
        const dir = artifactDir('tutela-basica');

        await form.goto();
        await form.fillAllSteps(tutelaBasica);

        const pdfPath = path.join(dir, 'tutela-salud.pdf');
        const { sizeBytes, filename } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
        expect(filename).toBe('tutela-salud.pdf');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Sin médico tratante
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tutela — sin médico tratante', () => {
    test('completa el flujo y muestra el preview', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillAllSteps(tutelaSinMedico);

        await expect(page.locator('#tutela-preview')).toBeVisible();
    });

    test('NO muestra el médico tratante en el documento', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillAllSteps(tutelaSinMedico);

        await form.assertPreviewNotContains('médico tratante asignado');
    });

    test('descarga un PDF válido sin médico', async ({ page }) => {
        const form = new TutelaFormPage(page);
        const dir = artifactDir('tutela-sin-medico');

        await form.goto();
        await form.fillAllSteps(tutelaSinMedico);

        const pdfPath = path.join(dir, 'tutela-sin-medico.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: EPS "Otra" — entidad personalizada
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tutela — EPS "Otra"', () => {
    test('muestra el campo de nombre al seleccionar "Otra"', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillStep1(tutelaBasica.accionante);

        await page.locator('[id="nombre-eps"]').click();
        await page.getByRole('option', { name: 'Otra' }).click();

        await expect(page.locator('#otra-eps')).toBeVisible();
    });

    test('muestra el nombre de la entidad personalizada en el preview', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillAllSteps(tutelaOtraEPS);

        await form.assertPreviewContains('Centro de Salud San José');
    });

    test('descarga un PDF válido con EPS personalizada', async ({ page }) => {
        const form = new TutelaFormPage(page);
        const dir = artifactDir('tutela-otra-eps');

        await form.goto();
        await form.fillAllSteps(tutelaOtraEPS);

        const pdfPath = path.join(dir, 'tutela-otra-eps.pdf');
        const { sizeBytes } = await form.downloadPDF(pdfPath);

        assertValidPDF(pdfPath);
        expect(sizeBytes).toBeGreaterThan(5_000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: Validación de formulario
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tutela — validación', () => {
    test('Step 1: no avanza sin nombre', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByText('Tus datos')).toBeVisible();
        await expect(page.getByText(/nombre es requerido/i)).toBeVisible();
    });

    test('Step 1: no avanza sin cédula', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();

        await page.fill('#nombre-completo', 'Test Usuario');
        await page.fill('#ciudad', 'Bogotá');
        await page.fill('#telefono', '3001234567');
        await page.fill('#correo', 'test@test.com');

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByText(/cédula es requerida/i)).toBeVisible();
    });

    test('Step 1: no avanza con correo inválido', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();

        await page.fill('#nombre-completo', 'Test Usuario');
        await page.fill('#cedula', '12345678');
        await page.fill('#ciudad', 'Bogotá');
        await page.fill('#telefono', '3001234567');
        await page.fill('#correo', 'correo-invalido');

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByText(/correo electrónico inválido/i)).toBeVisible();
    });

    test('Step 2: no avanza sin EPS', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillStep1(tutelaBasica.accionante);

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByText('La entidad accionada')).toBeVisible();
        await expect(page.getByText(/selecciona la eps/i)).toBeVisible();
    });

    test('Step 2: no avanza sin régimen', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillStep1(tutelaBasica.accionante);

        await page.locator('[id="nombre-eps"]').click();
        await page.getByRole('option', { name: 'Sura EPS' }).click();
        await page.fill('#sede-eps', 'Bogotá — Calle 100');
        // No seleccionar régimen

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByText(/selecciona el régimen/i)).toBeVisible();
    });

    test('Step 2: no avanza sin sede', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillStep1(tutelaBasica.accionante);

        await page.locator('[id="nombre-eps"]').click();
        await page.getByRole('option', { name: 'Sura EPS' }).click();
        await page.locator('input[name="regimen"][value="contributivo"]').check();
        // No ingresar sede

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByText(/sede es requerida/i)).toBeVisible();
    });

    test('Step 3: no avanza sin diagnóstico', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillStep1(tutelaBasica.accionante);
        await form.fillStep2(tutelaBasica.eps);

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByRole('heading', { name: 'Condición médica' })).toBeVisible();
        await expect(page.getByText(/diagnóstico es requerido/i)).toBeVisible();
    });

    test('Step 3: requiere nombre del médico cuando se indica tener médico tratante', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillStep1(tutelaBasica.accionante);
        await form.fillStep2(tutelaBasica.eps);

        await page.fill('#diagnostico', 'Diabetes tipo 2');
        await page.fill('#servicio-negado', 'Insulina Glargina');
        await page.locator('[id="tipo-negativa"]').click();
        await page.getByRole('option', { name: 'No autorización por la EPS' }).click();
        await page.fill('#fecha-negativa', '2024-03-15');
        await page.fill('#historia-clinica', 'Historia clínica de prueba.');
        await page.locator('input[name="tiene-medico"][value="si"]').check();
        // No rellenar nombre del médico

        await page.getByRole('button', { name: 'Continuar' }).click();

        await expect(page.getByText('Indica el nombre del médico tratante.')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: Navegación entre pasos
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tutela — navegación', () => {
    test('el botón "Anterior" en Step 2 regresa a Step 1', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillStep1(tutelaBasica.accionante);

        await page.getByRole('button', { name: 'Anterior' }).click();

        await expect(page.getByText('Tus datos')).toBeVisible();
    });

    test('el botón "Anterior" en Step 3 regresa a Step 2', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillStep1(tutelaBasica.accionante);
        await form.fillStep2(tutelaBasica.eps);

        await page.getByRole('button', { name: 'Anterior' }).click();

        await expect(page.getByText('La entidad accionada')).toBeVisible();
    });

    test('"Modificar datos" desde el preview regresa al formulario', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillAllSteps(tutelaBasica);

        await page.getByRole('button', { name: /modificar datos/i }).click();

        await expect(page.locator('#tutela-preview')).not.toBeVisible();
    });

    test('volver a Step 1 conserva el nombre del accionante', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.fillStep1(tutelaBasica.accionante);

        await page.getByRole('button', { name: 'Anterior' }).click();
        await page.waitForSelector('h2:has-text("Tus datos")');

        await expect(page.locator('#nombre-completo')).toHaveValue(tutelaBasica.accionante.nombre);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7: Generación de hechos con IA (Gemini)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tutela — generación de hechos con IA', () => {
    test('muestra el badge de carga mientras Gemini genera la respuesta', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        // Configurar mock antes de llegar al preview (respuesta lenta)
        await form.mockGeminiAPI('Texto de prueba con IA.', 3_000);

        await form.fillStep1(tutelaBasica.accionante);
        await form.fillStep2(tutelaBasica.eps);
        await form.fillStep3(tutelaBasica.condicionMedica);
        await form.fillStep4(tutelaBasica.vulnerabilidad.condiciones);
        await form.fillStep5(tutelaBasica.impacto);
        await form.fillStep6(tutelaBasica.pretensiones);

        // Click "Ver tutela" — dispara la llamada a Gemini
        await page.getByRole('button', { name: /ver tutela/i }).click();
        await page.waitForSelector('#tutela-preview', { timeout: 15_000 });

        // El badge de carga debe aparecer mientras el mock tiene delay
        await form.waitForIALoading();
        await expect(page.getByText('Redactando hechos con IA')).toBeVisible();
    });

    test('muestra el badge de éxito cuando Gemini responde correctamente', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.mockGeminiAPI('Me encuentro afiliada a Sura EPS en régimen contributivo. Padezco diabetes tipo 2.');

        await form.fillAllSteps(tutelaBasica);

        await form.waitForIASuccess();
        await expect(page.getByText('Hechos redactados con IA')).toBeVisible();
    });

    test('reemplaza el texto de hechos con el contenido generado por IA', async ({ page }) => {
        const form = new TutelaFormPage(page);
        const tokenUnico = 'HECHOS_IA_TOKEN_GREXIA_QA';
        await form.goto();
        await form.mockGeminiAPI(
            `${tokenUnico}: Me encuentro afiliada a Sura EPS en régimen contributivo. Padezco diabetes tipo 2.`
        );

        await form.fillAllSteps(tutelaBasica);
        await form.waitForIASuccess();

        await form.assertPreviewContains(tokenUnico);
    });

    test('el texto generado por IA no contiene placeholders entre corchetes', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.mockGeminiAPI(
            'La accionante se encuentra afiliada a Sura EPS en régimen contributivo y padece diabetes tipo 2.\n\n' +
                'La EPS ha negado el suministro de insulina Glargina en tres oportunidades.\n\n' +
                'Dicha negativa afecta gravemente su salud e integridad personal.\n\n' +
                'La responsabilidad recae directamente sobre Sura EPS por incumplir sus obligaciones.\n\n' +
                'La única forma de garantizar sus derechos es mediante la entrega inmediata del medicamento.'
        );

        await form.fillAllSteps(tutelaBasica);
        await form.waitForIASuccess();

        // Verificar que no se cuelan placeholders en el documento
        await expect(page.locator('#tutela-preview')).not.toContainText('[');
    });

    test('muestra badge de advertencia cuando la API de Gemini falla', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.mockGeminiAPIError(503);

        await form.fillAllSteps(tutelaBasica);

        await form.waitForIAWarning();
        await expect(page.getByText('No se pudo usar IA')).toBeVisible();
    });

    test('usa el texto estático de fallback cuando la IA falla', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();
        await form.mockGeminiAPIError(503);

        await form.fillAllSteps(tutelaBasica);
        await form.waitForIAWarning();

        // El fallback estático debe contener el diagnóstico del formulario
        await form.assertPreviewContains(tutelaBasica.condicionMedica.diagnostico);
    });

    test('la IA se dispara al navegar al preview via el indicador de pasos', async ({ page }) => {
        const form = new TutelaFormPage(page);
        await form.goto();

        // Primera visita al preview (via "Ver tutela") — respuesta inmediata
        await form.mockGeminiAPI('Primera generación de IA.');
        await form.fillAllSteps(tutelaBasica);
        await form.waitForIASuccess();

        // Volver al paso anterior
        await page.getByRole('button', { name: /modificar datos/i }).click();
        await page.waitForSelector('h2:has-text("Anexos")', { timeout: 8_000 });

        // Re-mockear con delay para verificar que sí se dispara el loading
        await form.mockGeminiAPI('Segunda generación de IA.', 3_000);

        // Navegar al preview via el indicador de pasos (handleStepClick)
        await form.goToPreviewViaStepIndicator();

        // El badge de carga debe aparecer, confirmando que triggerIA() fue llamado
        await form.waitForIALoading();
        await expect(page.getByText('Redactando hechos con IA')).toBeVisible();
    });
});
