import type { Page, Download } from '@playwright/test';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

type TipoInmueble = 'Apartamento' | 'Casa' | 'Local Comercial' | 'Oficina';

interface InmuebleData {
    tipo: TipoInmueble;
    ph: boolean;
    direccion: string;
    ciudad: string;
    departamento: string;
    estrato: string;
    areaMq: string;
}

interface PersonaData {
    nombre: string;
    tipoDoc: string;
    numDoc: string;
    telefono: string;
    email: string;
}

interface CondicionesData {
    fechaInicio: string;
    duracion: string;
    canon: string;
    deposito: string;
    diaPago: string;
    actividad?: string;
}

export class MinutaFormPage {
    constructor(private page: Page) {}

    // ── Navigation ────────────────────────────────────────────────────────────

    async goto(plan?: 'free' | 'basico' | 'pro') {
        const url = plan && plan !== 'free' ? `/minuta?plan=${plan}` : '/minuta';
        await this.page.goto(url);
        // Wait for React island to hydrate
        await this.page.waitForSelector('button:has-text("Continuar")', { timeout: 10_000 });
    }

    // ── Step 1: Inmueble ──────────────────────────────────────────────────────

    async fillInmueble(data: InmuebleData) {
        // Click property type (accessible name includes icon ligature text, so no exact match)
        await this.page.getByRole('button', { name: data.tipo }).click();

        // PH toggle appears after selecting type
        await this.page.waitForSelector('text=¿Está en propiedad horizontal?');
        if (data.ph) {
            await this.page.getByRole('button', { name: /Sí, es en PH/ }).click();
        } else {
            await this.page.getByRole('button', { name: /No, es independiente/ }).click();
        }

        await this.page.fill('#direccion', data.direccion);
        await this.page.fill('#ciudad', data.ciudad);
        await this.page.selectOption('#departamento', data.departamento);
        // Estrato is already set to 3 by default — only change if different
        if (data.estrato !== '3') {
            await this.page.selectOption('#estrato', `Estrato ${data.estrato}`);
        }
        await this.page.fill('#areaMq', data.areaMq);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El arrendador")');
    }

    // ── Step 2: Arrendador ────────────────────────────────────────────────────

    async fillArrendador(data: PersonaData) {
        await this.page.fill('#arrendador-nombre', data.nombre);
        await this.page.selectOption('#arrendador-tipo-doc', data.tipoDoc);
        await this.page.fill('#arrendador-num-doc', data.numDoc);
        await this.page.fill('#arrendador-tel', data.telefono);
        if (data.email) await this.page.fill('#arrendador-email', data.email);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El arrendatario")');
    }

    // ── Step 3: Arrendatario ──────────────────────────────────────────────────

    async fillArrendatario(data: PersonaData) {
        await this.page.fill('#arrendatario-nombre', data.nombre);
        await this.page.selectOption('#arrendatario-tipo-doc', data.tipoDoc);
        await this.page.fill('#arrendatario-num-doc', data.numDoc);
        await this.page.fill('#arrendatario-tel', data.telefono);
        if (data.email) await this.page.fill('#arrendatario-email', data.email);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("Condiciones del contrato")');
    }

    // ── Step 4: Condiciones ───────────────────────────────────────────────────

    async fillCondiciones(data: CondicionesData, tipo?: TipoInmueble) {
        // Commercial activity field (only for Local Comercial)
        if (tipo === 'Local Comercial' && data.actividad) {
            await this.page.waitForSelector('#actividad');
            await this.page.fill('#actividad', data.actividad);
        }

        await this.page.fill('#fecha-inicio', data.fechaInicio);
        await this.page.fill('#duracion', data.duracion);

        // Money inputs: clear first, then type raw digits
        await this.page.locator('#canon').fill(data.canon);
        await this.page.locator('#deposito').fill(data.deposito);
        await this.page.fill('#dia-pago', data.diaPago);

        await this.page.getByRole('button', { name: 'Ver mi minuta' }).click();
        // Wait for contract preview to render
        await this.page.waitForSelector('#contract-content', { timeout: 10_000 });
    }

    // ── Full form fill (steps 1–4) ────────────────────────────────────────────

    async fillAllSteps(
        data: Parameters<typeof this.fillInmueble>[0] & {
            arrendador: PersonaData;
            arrendatario: PersonaData;
            condiciones: CondicionesData;
        },
    ) {
        await this.fillInmueble(data);
        await this.fillArrendador(data.arrendador);
        await this.fillArrendatario(data.arrendatario);
        await this.fillCondiciones(data.condiciones, data.tipo);
    }

    // ── PDF download ──────────────────────────────────────────────────────────

    async downloadPDF(outputPath: string): Promise<{ path: string; sizeBytes: number }> {
        // Click the first "Descargar PDF" button (top area)
        const downloadBtn = this.page.getByRole('button', { name: /Descargar PDF/ }).first();

        const downloadPromise = this.page.waitForEvent('download', { timeout: 60_000 });
        await downloadBtn.click();

        // Wait for spinner to appear ("Generando...")
        await this.page.waitForSelector('text=Generando...', { timeout: 5_000 }).catch(() => {});

        const download = await downloadPromise;
        await download.saveAs(outputPath);

        const stats = fs.statSync(outputPath);
        return { path: outputPath, sizeBytes: stats.size };
    }

    // ── Contract screenshot ───────────────────────────────────────────────────

    async screenshotContract(outputPath: string) {
        const contractEl = this.page.locator('#contract-content');
        await expect(contractEl).toBeVisible();
        await contractEl.screenshot({ path: outputPath });
    }

    // ── Assertions ────────────────────────────────────────────────────────────

    async assertContractContains(text: string | RegExp) {
        await expect(this.page.locator('#contract-content')).toContainText(text);
    }

    async assertWatermarkVisible() {
        await expect(
            this.page.locator('#contract-content').getByText(/Documento generado por Lexia/i),
        ).toBeVisible();
    }

    async assertWatermarkHidden() {
        await expect(
            this.page.locator('#contract-content').getByText(/Documento generado por Lexia/i),
        ).not.toBeVisible();
    }
}

// ── PDF validation helper ─────────────────────────────────────────────────────

export function assertValidPDF(pdfPath: string) {
    expect(fs.existsSync(pdfPath), `PDF file should exist at ${pdfPath}`).toBe(true);

    const buffer = fs.readFileSync(pdfPath);
    expect(buffer.length, 'PDF should not be empty').toBeGreaterThan(0);

    // All PDFs start with the %PDF- header
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
