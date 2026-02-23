import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { mockColombiaApi } from '../fixtures/pagareTestData';

type PlanTier = 'free' | 'basico' | 'pro';

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
     * Intercepts requests to api-colombia.com and returns mock data.
     * Call BEFORE page.goto() so mocks are in place before any fetch.
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

    async goto(plan: PlanTier = 'free') {
        await this.mockColombiaApiRoutes();
        const url = plan !== 'free' ? `/herramientas/pagare/generar?plan=${plan}` : '/herramientas/pagare/generar';
        await this.page.goto(url);
        // Wait for React island to hydrate
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

        // Department → city cascade
        await this.page.waitForSelector('#deudor-ciudad-dept:not([disabled])', {
            timeout: 8_000,
        });
        await this.page.selectOption('#deudor-ciudad-dept', data.departamentoId);
        await this.page.waitForSelector('#deudor-ciudad-city:not([disabled])', {
            timeout: 8_000,
        });
        await this.page.selectOption('#deudor-ciudad-city', data.ciudad);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("La obligación")', { timeout: 8_000 });
    }

    // ── Step 3: Obligación ────────────────────────────────────────────────────

    async fillObligacion(data: ObligacionData) {
        // Amount
        await this.page.locator('#obligacion-valor').fill(data.valor);

        // Subscription date
        await this.page.fill('#obligacion-fecha-suscripcion', data.fechaSuscripcion);

        // Payment mode
        if (data.modalidad === 'unico') {
            await this.page.getByRole('button', { name: /Pago único/ }).click();
            await this.page.fill('#obligacion-fecha-vencimiento', data.fechaVencimiento ?? '');
        } else {
            await this.page.getByRole('button', { name: /Por cuotas/ }).click();
            await this.page.fill('#obligacion-num-cuotas', data.numeroCuotas ?? '12');
            await this.page.selectOption('#obligacion-periodo', data.periodoCuotas ?? 'mensual');
        }

        // Department → city cascade for subscription city
        await this.page.waitForSelector('#obligacion-ciudad-dept:not([disabled])', {
            timeout: 8_000,
        });
        await this.page.selectOption('#obligacion-ciudad-dept', data.departamentoId);
        await this.page.waitForSelector('#obligacion-ciudad-city:not([disabled])', {
            timeout: 8_000,
        });
        await this.page.selectOption('#obligacion-ciudad-city', data.ciudad);

        // Optional mora rate
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

    async downloadPDF(outputPath: string): Promise<{ sizeBytes: number }> {
        const downloadBtn = this.page.getByRole('button', { name: /Descargar PDF/ }).first();

        const downloadPromise = this.page.waitForEvent('download', { timeout: 60_000 });
        await downloadBtn.click();

        await this.page.waitForSelector('text=Generando...', { timeout: 5_000 }).catch(() => {});

        const download = await downloadPromise;
        await download.saveAs(outputPath);

        const stats = fs.statSync(outputPath);
        return { sizeBytes: stats.size };
    }

    // ── Screenshot ────────────────────────────────────────────────────────────

    async screenshotPreview(outputPath: string) {
        const el = this.page.locator('#pagare-preview');
        await expect(el).toBeVisible();
        await el.screenshot({ path: outputPath });
    }

    // ── Assertions ────────────────────────────────────────────────────────────

    async assertPreviewContains(text: string | RegExp) {
        await expect(this.page.locator('#pagare-preview')).toContainText(text);
    }

    async assertWatermarkVisible() {
        await expect(this.page.locator('#pagare-preview').getByText(/plan gratuito/i)).toBeVisible();
    }

    async assertWatermarkHidden() {
        await expect(this.page.locator('#pagare-preview').getByText(/plan gratuito/i)).not.toBeVisible();
    }

    async assertLogoImageVisible() {
        await expect(this.page.locator('#pagare-preview img')).toBeVisible();
    }

    async assertLogoImageHidden() {
        await expect(this.page.locator('#pagare-preview img')).not.toBeVisible();
    }

    async assertClauseVisible(clause: 'PRIMERA' | 'SEGUNDA' | 'TERCERA' | 'CUARTA') {
        await expect(this.page.locator('#pagare-preview')).toContainText(new RegExp(`${clause}\\.`));
    }

    async uploadLogo(imagePath: string) {
        const input = this.page.locator('input[type="file"]');
        await input.setInputFiles(imagePath);
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function assertValidPDF(pdfPath: string) {
    expect(fs.existsSync(pdfPath), `PDF should exist at ${pdfPath}`).toBe(true);
    const buffer = fs.readFileSync(pdfPath);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    return buffer;
}

export function artifactDir(label: string): string {
    const dir = path.join('e2e', 'artifacts', label.replace(/[^a-z0-9]/gi, '-').toLowerCase());
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}
