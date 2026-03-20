import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ── Artifact helpers ──────────────────────────────────────────────────────────

export function artifactDir(label: string): string {
    const dir = path.join('e2e', 'artifacts', label.replace(/[^a-z0-9]/gi, '-').toLowerCase());
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

export function assertValidPDF(pdfPath: string): void {
    const buf = fs.readFileSync(pdfPath);
    if (!buf.slice(0, 5).toString().startsWith('%PDF-')) {
        throw new Error(`Invalid PDF: ${pdfPath}`);
    }
}

// ── Data interfaces ───────────────────────────────────────────────────────────

interface Step1Data {
    nombre: string;
    cedula: string;
    ciudad: string;
    telefono: string;
    correo: string;
}

interface Step2Data {
    nombreEPS: string;
    otraEPS?: string;
    regimen: 'contributivo' | 'subsidiado';
    sede: string;
    correo?: string;
}

interface Step3Data {
    diagnostico: string;
    servicioNegado: string;
    tipoNegativa: string;
    fechaNegativa: string;
    historiaClinica: string;
    tieneMedico: 'si' | 'no';
    nombreMedico?: string;
}

interface Step5Data {
    saludVida: string;
    afectaTrabajo: 'si' | 'no';
    impactoTrabajo?: string;
    afectaFamilia: 'si' | 'no';
    impactoFamilia?: string;
}

interface Step6Data {
    tipo: string;
    detalle: string;
    solicitudes: number;
}

export interface TutelaAllStepsData {
    accionante: Step1Data;
    eps: Step2Data;
    condicionMedica: Step3Data;
    vulnerabilidad: { condiciones: readonly string[] | string[] };
    impacto: Step5Data;
    pretensiones: Step6Data;
}

// ── Page Object ───────────────────────────────────────────────────────────────

export class TutelaFormPage {
    constructor(private page: Page) {}

    // ── Navigation ─────────────────────────────────────────────────────────────

    async goto() {
        await this.page.goto('/herramientas/tutela/generar');
        await this.page.waitForSelector('h2:has-text("Tus datos")', { timeout: 10_000 });
    }

    // ── Steps ──────────────────────────────────────────────────────────────────

    async fillStep1(data: Step1Data) {
        await this.page.fill('#nombre-completo', data.nombre);
        await this.page.fill('#cedula', data.cedula);
        await this.page.fill('#ciudad', data.ciudad);
        await this.page.fill('#telefono', data.telefono);
        await this.page.fill('#correo', data.correo);
        await this.clickContinuar();
        await this.page.waitForSelector('h2:has-text("La entidad accionada")', { timeout: 8_000 });
    }

    async fillStep2(data: Step2Data) {
        await this.page.locator('[id="nombre-eps"]').click();
        await this.page.getByRole('option', { name: data.nombreEPS }).click();
        if (data.nombreEPS === 'Otra' && data.otraEPS) {
            await this.page.fill('#otra-eps', data.otraEPS);
        }
        await this.page.locator(`input[name="regimen"][value="${data.regimen}"]`).check();
        await this.page.fill('#sede-eps', data.sede);
        if (data.correo) await this.page.fill('#correo-eps', data.correo);
        await this.clickContinuar();
        await this.page.waitForSelector('h2:has-text("Condición médica")', { timeout: 8_000 });
    }

    async fillStep3(data: Step3Data) {
        await this.page.fill('#diagnostico', data.diagnostico);
        await this.page.fill('#servicio-negado', data.servicioNegado);
        await this.page.locator('[id="tipo-negativa"]').click();
        await this.page.getByRole('option', { name: data.tipoNegativa }).click();
        await this.page.fill('#fecha-negativa', data.fechaNegativa);
        await this.page.fill('#historia-clinica', data.historiaClinica);
        await this.page.locator(`input[name="tiene-medico"][value="${data.tieneMedico}"]`).check();
        if (data.tieneMedico === 'si' && data.nombreMedico) {
            await this.page.fill('#nombre-medico', data.nombreMedico);
        }
        await this.clickContinuar();
        await this.page.waitForSelector('h2:has-text("Condición de vulnerabilidad")', { timeout: 8_000 });
    }

    async fillStep4(condiciones: readonly string[] | string[]) {
        for (const condicion of condiciones) {
            const label = this.page.locator('label').filter({ hasText: condicion });
            await label.locator('input[type="checkbox"]').check();
        }
        await this.clickContinuar();
        await this.page.waitForSelector('h2:has-text("Impacto en tu vida")', { timeout: 8_000 });
    }

    async fillStep5(data: Step5Data) {
        await this.page.fill('#impacto-salud', data.saludVida);
        await this.page.locator(`input[name="afecta-trabajo"][value="${data.afectaTrabajo}"]`).check();
        if (data.afectaTrabajo === 'si' && data.impactoTrabajo) {
            await this.page.fill('textarea[placeholder*="conductor"]', data.impactoTrabajo);
        }
        await this.page.locator(`input[name="afecta-familia"][value="${data.afectaFamilia}"]`).check();
        if (data.afectaFamilia === 'si' && data.impactoFamilia) {
            await this.page.fill('textarea[placeholder*="hogar"]', data.impactoFamilia);
        }
        await this.clickContinuar();
        await this.page.waitForSelector('h2:has-text("Lo que solicitas")', { timeout: 8_000 });
    }

    async fillStep6(data: Step6Data) {
        await this.page.locator('[id="tipo-pretension"]').click();
        await this.page.getByRole('option', { name: data.tipo }).click();
        await this.page.fill('#detalle-especifico', data.detalle);
        await this.page.fill('#num-solicitudes', String(data.solicitudes));
        await this.clickContinuar();
        await this.page.waitForSelector('h2:has-text("Anexos y pruebas")', { timeout: 8_000 });
    }

    async fillStep7() {
        await this.page.getByRole('button', { name: /ver tutela/i }).click();
        await this.page.waitForSelector('#tutela-preview', { timeout: 15_000 });
    }

    async fillAllSteps(data: TutelaAllStepsData) {
        await this.fillStep1(data.accionante);
        await this.fillStep2(data.eps);
        await this.fillStep3(data.condicionMedica);
        await this.fillStep4(data.vulnerabilidad.condiciones);
        await this.fillStep5(data.impacto);
        await this.fillStep6(data.pretensiones);
        await this.fillStep7();
    }

    // ── Assertions ─────────────────────────────────────────────────────────────

    async assertPreviewContains(text: string | RegExp) {
        await expect(this.page.locator('#tutela-preview')).toContainText(text);
    }

    async assertPreviewNotContains(text: string | RegExp) {
        await expect(this.page.locator('#tutela-preview')).not.toContainText(text);
    }

    async screenshotPreview(screenshotPath: string) {
        await this.page.locator('#tutela-preview').screenshot({ path: screenshotPath });
    }

    async downloadPDF(pdfPath: string): Promise<{ sizeBytes: number; filename: string }> {
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.page
                .getByRole('button', { name: /descargar pdf/i })
                .first()
                .click(),
        ]);
        await download.saveAs(pdfPath);
        const stat = fs.statSync(pdfPath);
        return { sizeBytes: stat.size, filename: download.suggestedFilename() };
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    async clickContinuar() {
        await this.page.getByRole('button', { name: /continuar/i }).click();
    }

    async isOnStep(n: number) {
        return this.page.locator(`[data-step="${n}"]`).isVisible();
    }

    async isPreviewVisible() {
        return this.page.locator('#tutela-preview').isVisible();
    }

    async getDownloadButton() {
        return this.page.getByRole('button', { name: /descargar pdf/i }).first();
    }

    // ── IA Gemini helpers ───────────────────────────────────────────────────────

    /** Intercepta todas las llamadas a la API de Gemini y retorna una respuesta controlada. */
    async mockGeminiAPI(text: string, delayMs = 0): Promise<void> {
        await this.page.route('**/generativelanguage.googleapis.com/**', async (route) => {
            if (delayMs > 0) {
                await new Promise((r) => setTimeout(r, delayMs));
            }
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    candidates: [{ content: { parts: [{ text }] } }],
                }),
            });
        });
    }

    /** Intercepta todas las llamadas a Gemini y retorna un error HTTP. */
    async mockGeminiAPIError(status = 503): Promise<void> {
        await this.page.route('**/generativelanguage.googleapis.com/**', (route) =>
            route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify({ error: { code: status, message: 'Service unavailable' } }),
            })
        );
    }

    /** Espera a que aparezca el badge de carga de IA. */
    async waitForIALoading(timeout = 15_000): Promise<void> {
        await this.page.getByText('Redactando hechos con IA').waitFor({ state: 'visible', timeout });
    }

    /** Espera a que aparezca el badge de éxito de IA. */
    async waitForIASuccess(timeout = 40_000): Promise<void> {
        await this.page.getByText('Hechos redactados con IA').waitFor({ state: 'visible', timeout });
    }

    /** Espera a que aparezca el badge de advertencia (error de IA). */
    async waitForIAWarning(timeout = 30_000): Promise<void> {
        await this.page.getByText('No se pudo usar IA').waitFor({ state: 'visible', timeout });
    }

    /** Navega al preview clickeando el paso 8 en el indicador de pasos (stepper). */
    async goToPreviewViaStepIndicator(): Promise<void> {
        await this.page.getByRole('button', { name: 'Ir al paso 8: Preview' }).click();
        await this.page.waitForSelector('#tutela-preview', { timeout: 15_000 });
    }
}
