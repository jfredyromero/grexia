import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import type { InteresesFixture } from '../fixtures/interesesTestData';

// ── Page Object ───────────────────────────────────────────────────────────────

export class InteresesFormPage {
    constructor(private page: Page) {}

    // ── Navigation ────────────────────────────────────────────────────────────

    async goto() {
        await this.page.goto('/herramientas/liquidacion-de-intereses/generar');
        // client:only="react" — el componente no se SSR, el heading solo existe tras el render de React
        await this.page.waitForSelector('h2:has-text("La obligación")', { timeout: 10_000 });
    }

    // ── Step 1: Obligación ──────────────────────────────────────────────────

    async fillObligacion(data: InteresesFixture) {
        // Capital — input con formateo (digits only en el store)
        await this.page.locator('#int-capital').fill(data.capital);

        // Tipo de interés — botón card (accessible name incluye la descripción, usar regex de inicio)
        const tipoRegex = data.tipoInteres === 'corriente' ? /^Corriente/ : /^Moratorio/;
        await this.page.getByRole('button', { name: tipoRegex }).click();

        // Fecha inicio de mora
        await this.page.fill('#int-fecha-inicio', data.fechaIniciaMora);

        // Fecha de pago
        await this.page.fill('#int-fecha-pago', data.fechaPago);

        // Click "Calcular intereses" para avanzar al Step 2
        await this.page.getByRole('button', { name: /Calcular intereses/ }).click();
        await this.page.waitForSelector('#intereses-preview', { timeout: 15_000 });
    }

    // ── Step 2: Preview assertions ──────────────────────────────────────────

    async assertResultVisible() {
        await expect(this.page.locator('#intereses-preview')).toBeVisible();
    }

    async assertResultContains(text: string | RegExp) {
        await expect(this.page.locator('#intereses-preview')).toContainText(text);
    }

    async assertResultNotContains(text: string | RegExp) {
        await expect(this.page.locator('#intereses-preview')).not.toContainText(text);
    }

    // ── Navigation helpers ──────────────────────────────────────────────────

    async clickModificarDatos() {
        await this.page.getByRole('button', { name: /Modificar datos/ }).click();
        await this.page.waitForSelector('h2:has-text("La obligación")', { timeout: 10_000 });
    }

    // ── PDF download ────────────────────────────────────────────────────────

    async downloadPDF(outputPath: string): Promise<{ path: string; sizeBytes: number; filename: string }> {
        const downloadBtn = this.page.getByRole('button', { name: /Descargar PDF/ }).first();

        const downloadPromise = this.page.waitForEvent('download', { timeout: 60_000 });
        await downloadBtn.click();

        await this.page.waitForSelector('text=Generando...', { timeout: 5_000 }).catch(() => {});

        const download = await downloadPromise;
        const filename = download.suggestedFilename();
        await download.saveAs(outputPath);

        const stats = fs.statSync(outputPath);
        return { path: outputPath, sizeBytes: stats.size, filename };
    }

    // ── Screenshot ──────────────────────────────────────────────────────────

    async screenshotResult(outputPath: string) {
        const el = this.page.locator('#intereses-preview');
        await expect(el).toBeVisible();
        await el.screenshot({ path: outputPath });
    }
}

// ── PDF validation helper ─────────────────────────────────────────────────────

export function assertValidPDF(pdfPath: string) {
    expect(fs.existsSync(pdfPath), `PDF file should exist at ${pdfPath}`).toBe(true);

    const buffer = fs.readFileSync(pdfPath);
    expect(buffer.length, 'PDF should not be empty').toBeGreaterThan(0);

    // Todos los PDFs validos comienzan con el header %PDF-
    const header = buffer.subarray(0, 5).toString('ascii');
    expect(header, 'File should be a valid PDF').toBe('%PDF-');

    return buffer;
}

// ── Output dir helper ─────────────────────────────────────────────────────────

export function artifactsDir(testName: string): string {
    const dir = path.join('e2e', 'artifacts', testName.replace(/[^a-z0-9]/gi, '-').toLowerCase());
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}
