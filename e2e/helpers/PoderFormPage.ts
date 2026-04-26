import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import type {
    PoderTestData,
    PoderTestPoderdante,
    PoderTestApoderado,
    PoderTestProceso,
} from '../fixtures/poderTestData';

// ── Tipo de proceso → label visible ───────────────────────────────────────────

const TIPO_PROCESO_LABELS: Record<PoderTestData['tipoProceso'], string> = {
    'declaracion-pertenencia': 'Declaración de Pertenencia',
    'proceso-civil': 'Proceso Civil General',
    'proceso-laboral': 'Proceso Laboral',
    'proceso-penal': 'Proceso Penal',
    'proceso-familia': 'Proceso de Familia',
    'cobro-juridico': 'Cobro Jurídico',
    'tramites-notariales': 'Trámites Notariales',
    'administracion-bienes': 'Administración de Bienes',
};

// ── Page Object ───────────────────────────────────────────────────────────────

export class PoderFormPage {
    constructor(private page: Page) {}

    // ── Navigation ────────────────────────────────────────────────────────────

    async goto() {
        await this.page.goto('/herramientas/poder-especial/generar');
        await this.page.waitForSelector('h2:has-text("¿Para qué tipo de proceso")', { timeout: 10_000 });
    }

    // ── Step 1: Tipo de proceso ───────────────────────────────────────────────

    async selectTipoProceso(tipo: PoderTestData['tipoProceso']) {
        const label = TIPO_PROCESO_LABELS[tipo];
        await this.page.getByRole('button', { name: label }).click();
        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El poderdante")', { timeout: 8_000 });
    }

    // ── Step 2: Poderdante ────────────────────────────────────────────────────

    async fillPoderdante(data: PoderTestPoderdante) {
        await this.page.fill('#poderdante-nombre', data.nombreCompleto);
        await this.page.fill('#poderdante-cc', data.ccPoderdante);
        await this.page.fill('#poderdante-lugar', data.lugarExpedicionPoderdante);
        await this.page.fill('#poderdante-ciudad', data.ciudadPoderdante);

        if (data.direccionInmueble !== undefined) {
            await this.page.fill('#poderdante-direccion-inmueble', data.direccionInmueble);
        }
        if (data.matriculaInmobiliaria !== undefined) {
            await this.page.fill('#poderdante-matricula', data.matriculaInmobiliaria);
        }

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El apoderado")', { timeout: 8_000 });
    }

    // ── Step 3: Apoderado ─────────────────────────────────────────────────────

    async fillApoderado(data: PoderTestApoderado) {
        await this.page.fill('#apoderado-nombre', data.nombreCompleto);
        await this.page.fill('#apoderado-cc', data.ccApoderado);
        await this.page.fill('#apoderado-lugar', data.lugarExpedicionApoderado);
        await this.page.fill('#apoderado-ciudad', data.ciudadApoderado);
        await this.page.fill('#apoderado-tarjeta', data.tarjetaProfesional);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("Detalles del proceso")', { timeout: 8_000 });
    }

    // ── Step 4: Proceso ───────────────────────────────────────────────────────

    async fillDemandados(demandados: string[]) {
        // El primer demandado siempre existe (input #demandado-0)
        await this.page.fill('#demandado-0', demandados[0]);

        for (let i = 1; i < demandados.length; i++) {
            await this.page.getByRole('button', { name: 'Agregar demandado' }).click();
            await this.page.fill(`#demandado-${i}`, demandados[i]);
        }
    }

    async fillObjetoPoder(objeto: string) {
        await this.page.fill('#objeto-poder', objeto);
    }

    async fillProceso(data: PoderTestProceso) {
        if (data.demandados) {
            await this.fillDemandados(data.demandados);
        }
        if (data.objetoPoder) {
            await this.fillObjetoPoder(data.objetoPoder);
        }

        await this.page.getByRole('button', { name: 'Ver poder' }).click();
        await this.page.waitForSelector('#poder-preview', { timeout: 10_000 });
    }

    // ── Full flow ─────────────────────────────────────────────────────────────

    async fillAllSteps(data: PoderTestData) {
        await this.selectTipoProceso(data.tipoProceso);
        await this.fillPoderdante(data.poderdante);
        await this.fillApoderado(data.apoderado);
        await this.fillProceso(data.proceso);
    }

    // ── Navigation helpers ────────────────────────────────────────────────────

    async nextStep() {
        await this.page.getByRole('button', { name: 'Continuar' }).click();
    }

    async prevStep() {
        await this.page.getByRole('button', { name: 'Anterior' }).click();
    }

    async addDemandado() {
        await this.page.getByRole('button', { name: 'Agregar demandado' }).click();
    }

    async removeDemandado(index: number) {
        await this.page.getByRole('button', { name: `Eliminar demandado ${index + 1}` }).click();
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
        await expect(this.page.locator('#poder-preview')).toContainText(text);
    }

    async assertPreviewNotContains(text: string | RegExp) {
        await expect(this.page.locator('#poder-preview')).not.toContainText(text);
    }

    async screenshotPreview(outputPath: string) {
        const el = this.page.locator('#poder-preview');
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
