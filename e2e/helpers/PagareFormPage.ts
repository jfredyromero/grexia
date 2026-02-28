import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { mockColombiaApi } from '../fixtures/pagareTestData';

type PlanTier = 'free' | 'empresarial';

interface AcreedorData {
    nombre: string;
    tipoDoc: string;
    numDoc: string;
    telefono: string;
    email: string;
}

interface DeudorData {
    nombre: string;
    tipoDoc: string;
    numDoc: string;
    telefono: string;
    email: string;
    departamentoId: string;
    ciudad: string;
}

interface ObligacionData {
    valor: string;
    fechaSuscripcion: string;
    modalidad: 'unico' | 'cuotas';
    fechaVencimiento?: string;
    numeroCuotas?: string;
    periodoCuotas?: string;
    departamentoId: string;
    ciudad: string;
    mora?: string;
}

export class PagareFormPage {
    constructor(private page: Page) {}

    // ── API mocking ───────────────────────────────────────────────────────────

    /**
     * Intercepta las peticiones a api-colombia.com y retorna datos mock.
     * Llamar ANTES de page.goto() para que los mocks estén listos.
     */
    async mockColombiaApiRoutes() {
        await this.page.route('**/api-colombia.com/api/v1/Department', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockColombiaApi.departments),
            });
        });

        await this.page.route('**/api-colombia.com/api/v1/Department/*/cities', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockColombiaApi.citiesBogota),
            });
        });
    }

    // ── Navigation ────────────────────────────────────────────────────────────

    /**
     * Navega al formulario con el plan indicado.
     * El plan se inyecta en localStorage antes de cargar la página
     * (nanostores persistentAtom clave: 'lexia_plan').
     */
    async goto(plan: PlanTier = 'free') {
        if (plan === 'empresarial') {
            await this.page.addInitScript(() => {
                localStorage.setItem('lexia_plan', 'empresarial');
            });
        }
        await this.mockColombiaApiRoutes();
        await this.page.goto('/herramientas/pagare/generar');
        await this.page.waitForSelector('h2:has-text("El acreedor")', { timeout: 10_000 });
    }

    // ── Step 1: Acreedor ──────────────────────────────────────────────────────

    async fillAcreedor(data: AcreedorData) {
        await this.page.fill('#acreedor-nombre', data.nombre);
        await this.page.selectOption('#acreedor-tipo-doc', data.tipoDoc);
        await this.page.fill('#acreedor-num-doc', data.numDoc);
        await this.page.fill('#acreedor-tel', data.telefono);
        if (data.email) await this.page.fill('#acreedor-email', data.email);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El deudor")', { timeout: 8_000 });
    }

    // ── Step 2: Deudor ────────────────────────────────────────────────────────

    async fillDeudor(data: DeudorData) {
        await this.page.fill('#deudor-nombre', data.nombre);
        await this.page.selectOption('#deudor-tipo-doc', data.tipoDoc);
        await this.page.fill('#deudor-num-doc', data.numDoc);
        await this.page.fill('#deudor-tel', data.telefono);
        if (data.email) await this.page.fill('#deudor-email', data.email);

        // Cascade departamento → ciudad
        await this.page.waitForSelector('#deudor-ciudad-dept:not([disabled])', { timeout: 8_000 });
        await this.page.selectOption('#deudor-ciudad-dept', data.departamentoId);
        await this.page.waitForSelector('#deudor-ciudad-city:not([disabled])', { timeout: 8_000 });
        await this.page.selectOption('#deudor-ciudad-city', data.ciudad);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("La obligación")', { timeout: 8_000 });
    }

    // ── Step 3: Obligación ────────────────────────────────────────────────────

    async fillObligacion(data: ObligacionData) {
        await this.page.locator('#obligacion-valor').fill(data.valor);
        await this.page.fill('#obligacion-fecha-suscripcion', data.fechaSuscripcion);

        if (data.modalidad === 'unico') {
            await this.page.getByRole('button', { name: /Pago único/ }).click();
            await this.page.fill('#obligacion-fecha-vencimiento', data.fechaVencimiento ?? '');
        } else {
            await this.page.getByRole('button', { name: /Por cuotas/ }).click();
            await this.page.fill('#obligacion-num-cuotas', data.numeroCuotas ?? '12');
            await this.page.selectOption('#obligacion-periodo', data.periodoCuotas ?? 'mensual');
        }

        // Cascade departamento → ciudad para ciudad de suscripción
        await this.page.waitForSelector('#obligacion-ciudad-dept:not([disabled])', { timeout: 8_000 });
        await this.page.selectOption('#obligacion-ciudad-dept', data.departamentoId);
        await this.page.waitForSelector('#obligacion-ciudad-city:not([disabled])', { timeout: 8_000 });
        await this.page.selectOption('#obligacion-ciudad-city', data.ciudad);

        if (data.mora) {
            await this.page.fill('#obligacion-mora', data.mora);
        }

        await this.page.getByRole('button', { name: /Ver pagaré/ }).click();
        await this.page.waitForSelector('#pagare-preview', { timeout: 10_000 });
    }

    // ── Full flow ─────────────────────────────────────────────────────────────

    async fillAllSteps(data: { acreedor: AcreedorData; deudor: DeudorData; obligacion: ObligacionData }) {
        await this.fillAcreedor(data.acreedor);
        await this.fillDeudor(data.deudor);
        await this.fillObligacion(data.obligacion);
    }

    // ── PDF download ──────────────────────────────────────────────────────────

    async downloadPDF(outputPath: string): Promise<{ sizeBytes: number; filename: string }> {
        const downloadBtn = this.page.getByRole('button', { name: /Descargar PDF/ }).first();

        const downloadPromise = this.page.waitForEvent('download', { timeout: 60_000 });
        await downloadBtn.click();

        await this.page.waitForSelector('text=Generando...', { timeout: 5_000 }).catch(() => {});

        const download = await downloadPromise;
        const filename = download.suggestedFilename();
        await download.saveAs(outputPath);

        const stats = fs.statSync(outputPath);
        return { sizeBytes: stats.size, filename };
    }

    // ── Screenshot ────────────────────────────────────────────────────────────

    async screenshotPreview(outputPath: string) {
        const el = this.page.locator('#pagare-preview');
        await expect(el).toBeVisible();
        await el.screenshot({ path: outputPath });
    }

    // ── Preview content assertions ────────────────────────────────────────────

    async assertPreviewContains(text: string | RegExp) {
        await expect(this.page.locator('#pagare-preview')).toContainText(text);
    }

    async assertPreviewNotContains(text: string | RegExp) {
        await expect(this.page.locator('#pagare-preview')).not.toContainText(text);
    }

    async assertClauseVisible(clause: 'PRIMERA' | 'SEGUNDA' | 'TERCERA' | 'CUARTA') {
        await expect(this.page.locator('#pagare-preview')).toContainText(new RegExp(`${clause}\\.`));
    }

    // ── Plan UI assertions (Step 4 — preview) ────────────────────────────────

    /** Verifica el badge de plan visible en el encabezado del Step 4. */
    async assertPlanBadge(plan: PlanTier) {
        const label = plan === 'free' ? 'Plan Gratuito' : 'Plan Empresarial';
        await expect(this.page.getByText(label).first()).toBeVisible();
    }

    /** Verifica que el banner de upgrade del plan gratuito es visible. */
    async assertUpgradeBannerVisible() {
        await expect(this.page.getByText(/Plan Gratuito:/).first()).toBeVisible();
    }

    /** Verifica que el banner de upgrade NO es visible (plan empresarial). */
    async assertUpgradeBannerHidden() {
        await expect(this.page.getByText(/Plan Gratuito:/).first()).not.toBeVisible();
    }

    /** Verifica que la sección de logo personalizado es visible (solo plan empresarial). */
    async assertLogoUploadVisible() {
        await expect(this.page.getByText('Logo personalizado')).toBeVisible();
    }

    /** Verifica que la sección de logo personalizado NO es visible (plan gratuito). */
    async assertLogoUploadHidden() {
        await expect(this.page.getByText('Logo personalizado')).not.toBeVisible();
    }

    /** Verifica que el botón de subir logo está disponible y es clickeable. */
    async assertLogoUploadButtonVisible() {
        await expect(this.page.getByRole('button', { name: /Subir logo/i })).toBeVisible();
    }

    /** Simula la carga de una imagen de logo desde disco. */
    async uploadLogo(imagePath: string) {
        const input = this.page.locator('input[type="file"]');
        await input.setInputFiles(imagePath);
    }
}

// ── PDF validation helper ─────────────────────────────────────────────────────

export function assertValidPDF(pdfPath: string) {
    expect(fs.existsSync(pdfPath), `PDF should exist at ${pdfPath}`).toBe(true);
    const buffer = fs.readFileSync(pdfPath);
    expect(buffer.length).toBeGreaterThan(0);
    // Todos los PDFs válidos comienzan con el header %PDF-
    expect(buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    return buffer;
}

export function artifactDir(label: string): string {
    const dir = path.join('e2e', 'artifacts', label.replace(/[^a-z0-9]/gi, '-').toLowerCase());
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}
