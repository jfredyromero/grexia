import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import type {
    LaboralTestData,
    LaboralTestEmpleador,
    LaboralTestTrabajador,
    LaboralTestCondicionesTerminoFijo,
    LaboralTestCondicionesObraLabor,
} from '../fixtures/laboralTestData';

// ── Label helpers ─────────────────────────────────────────────────────────────

function docLabel(tipoDoc: string): string {
    const labels: Record<string, string> = {
        CC: 'Cédula de Ciudadanía',
        CE: 'Cédula de Extranjería',
        NIT: 'NIT',
        Pasaporte: 'Pasaporte',
    };
    return labels[tipoDoc] ?? tipoDoc;
}

// ── Page Object ───────────────────────────────────────────────────────────────

export class LaboralFormPage {
    constructor(private page: Page) {}

    // ── Navigation ────────────────────────────────────────────────────────────

    async goto(plan: 'free' | 'empresarial' = 'free') {
        if (plan === 'empresarial') {
            await this.page.addInitScript(() => {
                localStorage.setItem('grexia_plan', '"empresarial"');
            });
        }
        await this.page.goto('/herramientas/contrato-laboral/generar');
        await this.page.waitForSelector('h2:has-text("¿Qué tipo de contrato")', { timeout: 10_000 });
    }

    // ── Step 1: Tipo de contrato ──────────────────────────────────────────────

    async selectTipoContrato(tipo: 'termino-fijo' | 'obra-labor') {
        const label = tipo === 'termino-fijo' ? 'Contrato a Término Fijo' : 'Contrato por Obra o Labor';
        await this.page.getByRole('button', { name: label }).click();
        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El empleador")', { timeout: 8_000 });
    }

    // ── Step 2: Empleador ─────────────────────────────────────────────────────

    async fillEmpleador(data: LaboralTestEmpleador) {
        await this.page.fill('#empleador-nombre', data.nombreCompleto);

        await this.page.locator('#empleador-tipo-doc').click();
        await this.page
            .getByRole('option', { name: docLabel(data.tipoDocumento) })
            .first()
            .click();

        await this.page.fill('#empleador-num-doc', data.numeroDocumento);
        await this.page.fill('#empleador-ciudad', data.ciudad);
        await this.page.fill('#empleador-direccion', data.direccion);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El trabajador")', { timeout: 8_000 });
    }

    // ── Step 3: Trabajador ────────────────────────────────────────────────────

    async fillTrabajador(data: LaboralTestTrabajador) {
        await this.page.fill('#trabajador-nombre', data.nombreCompleto);

        await this.page.locator('#trabajador-tipo-doc').click();
        await this.page
            .getByRole('option', { name: docLabel(data.tipoDocumento) })
            .first()
            .click();

        await this.page.fill('#trabajador-num-doc', data.numeroDocumento);
        await this.page.fill('#trabajador-ciudad', data.ciudad);
        await this.page.fill('#trabajador-direccion', data.direccion);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("Condiciones laborales")', { timeout: 8_000 });
    }

    // ── Step 4: Condiciones — Término Fijo ───────────────────────────────────

    async fillCondicionesTerminoFijo(data: LaboralTestCondicionesTerminoFijo) {
        await this.page.fill('#tf-cargo', data.cargo);
        await this.page.fill('#tf-salario', data.salario);

        // Frecuencia de pago
        await this.page.locator('#tf-frecuencia').click();
        await this.page.getByRole('option', { name: data.frecuenciaPago }).first().click();

        // Método de pago
        await this.page.locator('#tf-metodo').click();
        await this.page.getByRole('option', { name: data.metodoPago }).first().click();

        // Cuenta bancaria — condicional
        if (data.cuentaBancaria) {
            await this.page.fill('#tf-cuenta', data.cuentaBancaria);
        }

        // Jornada
        await this.page.locator('#tf-jornada').click();
        await this.page.getByRole('option', { name: data.jornada }).first().click();

        // Lugar de prestación
        await this.page.fill('#tf-lugar', data.lugarPrestacion);

        // Duración
        await this.page.fill('#tf-duracion-num', data.duracionNumero);
        await this.page.locator('#tf-duracion-unidad').click();
        await this.page.getByRole('option', { name: data.duracionUnidad }).first().click();

        await this.page.getByRole('button', { name: 'Ver contrato' }).click();
        await this.page.waitForSelector('#laboral-preview', { timeout: 10_000 });
    }

    // ── Step 4: Condiciones — Obra o Labor ───────────────────────────────────

    async fillCondicionesObraLabor(data: LaboralTestCondicionesObraLabor) {
        await this.page.locator('#ol-descripcion').fill(data.descripcionObra);
        await this.page.fill('#ol-oficio', data.oficio);
        await this.page.fill('#ol-salario', data.salario);
        await this.page.fill('#ol-modalidad', data.modalidadPago);
        await this.page.fill('#ol-lugar', data.lugar);

        await this.page.getByRole('button', { name: 'Ver contrato' }).click();
        await this.page.waitForSelector('#laboral-preview', { timeout: 10_000 });
    }

    // ── Full flow ─────────────────────────────────────────────────────────────

    async fillAllSteps(data: LaboralTestData) {
        await this.selectTipoContrato(data.tipoContrato);
        await this.fillEmpleador(data.empleador);
        await this.fillTrabajador(data.trabajador);

        if (data.tipoContrato === 'termino-fijo' && data.condicionesTerminoFijo) {
            await this.fillCondicionesTerminoFijo(data.condicionesTerminoFijo);
        } else if (data.tipoContrato === 'obra-labor' && data.condicionesObraLabor) {
            await this.fillCondicionesObraLabor(data.condicionesObraLabor);
        }
    }

    // ── Navigation helpers ────────────────────────────────────────────────────

    async nextStep() {
        await this.page.getByRole('button', { name: 'Continuar' }).click();
    }

    async prevStep() {
        await this.page.getByRole('button', { name: 'Anterior' }).click();
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

    // ── Preview assertions ────────────────────────────────────────────────────

    async assertPreviewContains(text: string | RegExp) {
        await expect(this.page.locator('#laboral-preview')).toContainText(text);
    }

    async assertPreviewNotContains(text: string | RegExp) {
        await expect(this.page.locator('#laboral-preview')).not.toContainText(text);
    }

    async screenshotPreview(outputPath: string) {
        const el = this.page.locator('#laboral-preview');
        await expect(el).toBeVisible();
        await el.screenshot({ path: outputPath });
    }
}

// ── PDF validation helper ─────────────────────────────────────────────────────

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
