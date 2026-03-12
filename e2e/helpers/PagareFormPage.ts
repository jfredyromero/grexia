import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

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
    departamento: string;
    ciudad: string;
}

interface ObligacionData {
    valor: string;
    fechaSuscripcion: string;
    modalidad: 'unico' | 'cuotas';
    fechaVencimiento?: string;
    numeroCuotas?: string;
    periodoCuotas?: string;
    departamento: string;
    ciudad: string;
    tasaNominal?: string;
    mora?: string;
}

// ── Label helpers (Headless UI Listbox) ──────────────────────────────────────

function docLabel(tipoDoc: string): string {
    const labels: Record<string, string> = {
        CC: 'Cédula de Ciudadanía',
        CE: 'Cédula de Extranjería',
        NIT: 'NIT',
        Pasaporte: 'Pasaporte',
    };
    return labels[tipoDoc] ?? tipoDoc;
}

function periodoLabel(periodo: string): string {
    const labels: Record<string, string> = {
        mensual: 'Mensual',
        bimestral: 'Bimestral',
        trimestral: 'Trimestral',
    };
    return labels[periodo] ?? periodo;
}

export class PagareFormPage {
    constructor(private page: Page) {}

    // ── Navigation ────────────────────────────────────────────────────────────

    async goto() {
        await this.page.goto('/herramientas/pagare/generar');
        await this.page.waitForSelector('h2:has-text("El acreedor")', { timeout: 10_000 });
    }

    // ── Combobox location helper ──────────────────────────────────────────────

    /**
     * Selecciona departamento y ciudad en un ColombiaLocationSelect (Combobox).
     * idPrefix: 'deudor-ciudad' | 'obligacion-ciudad'
     */
    async fillLocationCombobox(idPrefix: string, departamento: string, ciudad: string) {
        // Departamento
        await this.page.waitForSelector(`#${idPrefix}-dept:not([disabled])`, { timeout: 15_000 });
        await this.page.locator(`#${idPrefix}-dept`).click();
        await this.page.locator(`#${idPrefix}-dept`).fill(departamento);
        await this.page.getByRole('option', { name: departamento, exact: true }).first().waitFor({ timeout: 15_000 });
        await this.page.getByRole('option', { name: departamento, exact: true }).first().click();

        // Ciudad
        await this.page.waitForSelector(`#${idPrefix}-city:not([disabled])`, { timeout: 15_000 });
        await this.page.locator(`#${idPrefix}-city`).click();
        await this.page.locator(`#${idPrefix}-city`).fill(ciudad);
        await this.page.getByRole('option', { name: ciudad, exact: true }).first().waitFor({ timeout: 15_000 });
        await this.page.getByRole('option', { name: ciudad, exact: true }).first().click();
    }

    // ── Step 1: Acreedor ──────────────────────────────────────────────────────

    async fillAcreedor(data: AcreedorData) {
        await this.page.fill('#acreedor-nombre', data.nombre);

        // Tipo de documento — Listbox: abrir + seleccionar opción por etiqueta
        await this.page.locator('#acreedor-tipo-doc').click();
        await this.page
            .getByRole('option', { name: docLabel(data.tipoDoc) })
            .first()
            .click();

        await this.page.fill('#acreedor-num-doc', data.numDoc);
        await this.page.fill('#acreedor-tel', data.telefono);
        if (data.email) await this.page.fill('#acreedor-email', data.email);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El deudor")', { timeout: 8_000 });
    }

    // ── Step 2: Deudor ────────────────────────────────────────────────────────

    async fillDeudor(data: DeudorData) {
        await this.page.fill('#deudor-nombre', data.nombre);

        // Tipo de documento — Listbox
        await this.page.locator('#deudor-tipo-doc').click();
        await this.page
            .getByRole('option', { name: docLabel(data.tipoDoc) })
            .first()
            .click();

        await this.page.fill('#deudor-num-doc', data.numDoc);
        await this.page.fill('#deudor-tel', data.telefono);
        if (data.email) await this.page.fill('#deudor-email', data.email);

        // Cascade departamento → ciudad (Combobox)
        await this.fillLocationCombobox('deudor-ciudad', data.departamento, data.ciudad);

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

            // Período — Listbox
            await this.page.locator('#obligacion-periodo').click();
            await this.page
                .getByRole('option', { name: periodoLabel(data.periodoCuotas ?? 'mensual') })
                .first()
                .click();
        }

        // Cascade departamento → ciudad de suscripción (Combobox)
        await this.fillLocationCombobox('obligacion-ciudad', data.departamento, data.ciudad);

        if (data.tasaNominal) {
            await this.page.fill('#obligacion-tasa-nominal', data.tasaNominal);
        }

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
