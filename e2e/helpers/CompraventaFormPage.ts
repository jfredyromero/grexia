import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface VendedorData {
    nombre: string;
    cc: string;
    ccExpedidaEn: string;
    departamento: string;
    ciudad: string;
}

interface CompradorData {
    nombre: string;
    cc: string;
    ccExpedidaEn: string;
    departamento: string;
    ciudad: string;
}

interface InmuebleData {
    direccion: string;
    departamento: string;
    ciudad: string;
    area: string;
    linderoNorte: string;
    linderoSur: string;
    linderoOriente: string;
    linderoOccidente: string;
    matricula: string;
    cedulaCatastral: string;
}

interface TradicionData {
    tipoActo: string;
    escrituraNro: string;
    notaria: string;
    folioMatricula: string;
    ciudadRegistro: string;
}

interface EconomicoData {
    precioTotal: string;
    precioIncluyeDescripcion: string;
    formaDePago: string;
    arrasValor: string;
    clausulaPenalValor: string;
}

interface EscrituraData {
    notaria: string;
    fecha: string;
    gastosDistribucion: string;
    domicilioDepartamento: string;
    domicilioCiudad: string;
    incluyeTestigo: boolean;
    testigoNombre: string;
    testigoCC: string;
}

// ── Label helpers (Headless UI Listbox) ──────────────────────────────────────

function tipoActoLabel(value: string): string {
    const labels: Record<string, string> = {
        COMPRAVENTA: 'Compraventa',
        SUCESION: 'Sucesión',
        DONACION: 'Donación',
        PRESCRIPCION: 'Prescripción',
        PERMUTA: 'Permuta',
    };
    return labels[value] ?? value;
}

function formaDePagoLabel(value: string): string {
    const labels: Record<string, string> = {
        'Pago de contado al momento de la firma de la escritura publica': 'Contado al momento de la escritura',
        '50% al momento de la firma de la promesa y 50% al momento del otorgamiento de la escritura publica':
            '50% al firmar la promesa — 50% al otorgar la escritura',
        '30% al momento de la firma de la promesa y 70% al momento del otorgamiento de la escritura publica':
            '30% al firmar la promesa — 70% al otorgar la escritura',
        '10% como arras confirmatorias al momento de la firma de la promesa y el saldo restante al momento del otorgamiento de la escritura publica':
            '10% como arras al firmar — saldo restante al otorgar la escritura',
    };
    return labels[value] ?? value;
}

function gastosLabel(value: string): string {
    const labels: Record<string, string> = {
        'por partes iguales entre comprador y vendedor': 'Por partes iguales',
        'a cargo del comprador': 'A cargo del comprador',
        'a cargo del vendedor': 'A cargo del vendedor',
    };
    return labels[value] ?? value;
}

export class CompraventaFormPage {
    constructor(private page: Page) {}

    // ── Navigation ────────────────────────────────────────────────────────────

    async goto() {
        await this.page.goto('/herramientas/promesa-compraventa/generar');
        await this.page.waitForSelector('h2:has-text("El vendedor")', { timeout: 10_000 });
    }

    // ── Combobox location helper ──────────────────────────────────────────────

    async fillLocationCombobox(idPrefix: string, departamento: string, ciudad: string) {
        await this.page.waitForSelector(`#${idPrefix}-dept:not([disabled])`, { timeout: 15_000 });
        await this.page.locator(`#${idPrefix}-dept`).click();
        await this.page.locator(`#${idPrefix}-dept`).fill(departamento);
        await this.page.getByRole('option', { name: departamento, exact: true }).first().waitFor({ timeout: 15_000 });
        await this.page.getByRole('option', { name: departamento, exact: true }).first().click();

        await this.page.waitForSelector(`#${idPrefix}-city:not([disabled])`, { timeout: 15_000 });
        await this.page.locator(`#${idPrefix}-city`).click();
        await this.page.locator(`#${idPrefix}-city`).fill(ciudad);
        await this.page.getByRole('option', { name: ciudad, exact: true }).first().waitFor({ timeout: 15_000 });
        await this.page.getByRole('option', { name: ciudad, exact: true }).first().click();
    }

    // ── Step 1: Vendedor ────────────────────────────────────────────────────

    async fillVendedor(data: VendedorData) {
        await this.page.fill('#vendedor-nombre', data.nombre);
        await this.page.fill('#vendedor-cc', data.cc);
        await this.page.fill('#vendedor-cc-expedida', data.ccExpedidaEn);

        await this.fillLocationCombobox('vendedor-domicilio', data.departamento, data.ciudad);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El comprador")', { timeout: 8_000 });
    }

    // ── Step 2: Comprador ───────────────────────────────────────────────────

    async fillComprador(data: CompradorData) {
        await this.page.fill('#comprador-nombre', data.nombre);
        await this.page.fill('#comprador-cc', data.cc);
        await this.page.fill('#comprador-cc-expedida', data.ccExpedidaEn);

        await this.fillLocationCombobox('comprador-domicilio', data.departamento, data.ciudad);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El inmueble")', { timeout: 8_000 });
    }

    // ── Step 3: Inmueble ────────────────────────────────────────────────────

    async fillInmueble(data: InmuebleData) {
        await this.page.fill('#inmueble-direccion', data.direccion);

        await this.fillLocationCombobox('inmueble-ubicacion', data.departamento, data.ciudad);

        await this.page.fill('#inmueble-area', data.area);
        await this.page.fill('#inmueble-lindero-norte', data.linderoNorte);
        await this.page.fill('#inmueble-lindero-sur', data.linderoSur);
        await this.page.fill('#inmueble-lindero-oriente', data.linderoOriente);
        await this.page.fill('#inmueble-lindero-occidente', data.linderoOccidente);
        await this.page.fill('#inmueble-matricula', data.matricula);
        await this.page.fill('#inmueble-cedula-catastral', data.cedulaCatastral);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("Tradicion del inmueble")', { timeout: 8_000 });
    }

    // ── Step 4: Tradicion ───────────────────────────────────────────────────

    async fillTradicion(data: TradicionData) {
        // Tipo de acto — Listbox: abrir + seleccionar opción por etiqueta
        await this.page.locator('#tradicion-tipo-acto').click();
        await this.page
            .getByRole('option', { name: tipoActoLabel(data.tipoActo) })
            .first()
            .click();

        await this.page.fill('#tradicion-escritura-nro', data.escrituraNro);
        await this.page.fill('#tradicion-notaria', data.notaria);
        await this.page.fill('#tradicion-folio', data.folioMatricula);
        await this.page.fill('#tradicion-ciudad-registro', data.ciudadRegistro);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("Condiciones economicas")', { timeout: 8_000 });
    }

    // ── Step 5: Economico ───────────────────────────────────────────────────

    async fillEconomico(data: EconomicoData) {
        await this.page.locator('#economico-precio').fill(data.precioTotal);
        if (data.precioIncluyeDescripcion) {
            await this.page.fill('#economico-incluye', data.precioIncluyeDescripcion);
        }

        // Forma de pago — Listbox: abrir + seleccionar opción por etiqueta
        await this.page.locator('#economico-forma-pago').click();
        await this.page
            .getByRole('option', { name: formaDePagoLabel(data.formaDePago) })
            .first()
            .click();

        await this.page.locator('#economico-arras').fill(data.arrasValor);
        await this.page.locator('#economico-clausula-penal').fill(data.clausulaPenalValor);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("Escritura publica y gastos")', { timeout: 8_000 });
    }

    // ── Step 6: Escritura ───────────────────────────────────────────────────

    async fillEscritura(data: EscrituraData) {
        await this.page.fill('#escritura-notaria', data.notaria);
        await this.page.fill('#escritura-fecha', data.fecha);

        // Distribucion de gastos — Listbox: abrir + seleccionar opción por etiqueta
        await this.page.locator('#escritura-gastos').click();
        await this.page
            .getByRole('option', { name: gastosLabel(data.gastosDistribucion) })
            .first()
            .click();

        await this.fillLocationCombobox('escritura-domicilio', data.domicilioDepartamento, data.domicilioCiudad);

        if (data.incluyeTestigo) {
            const switchEl = this.page.locator('button[role="switch"]');
            const isChecked = await switchEl.getAttribute('aria-checked');
            if (isChecked !== 'true') {
                await switchEl.click();
            }
            await this.page.fill('#testigo-nombre', data.testigoNombre);
            await this.page.fill('#testigo-cc', data.testigoCC);
        }

        await this.page.getByRole('button', { name: /Ver promesa/ }).click();
        await this.page.waitForSelector('#compraventa-preview', { timeout: 10_000 });
    }

    // ── Full flow ───────────────────────────────────────────────────────────

    async fillAllSteps(data: {
        vendedor: VendedorData;
        comprador: CompradorData;
        inmueble: InmuebleData;
        tradicion: TradicionData;
        economico: EconomicoData;
        escritura: EscrituraData;
    }) {
        await this.fillVendedor(data.vendedor);
        await this.fillComprador(data.comprador);
        await this.fillInmueble(data.inmueble);
        await this.fillTradicion(data.tradicion);
        await this.fillEconomico(data.economico);
        await this.fillEscritura(data.escritura);
    }

    // ── PDF download ────────────────────────────────────────────────────────

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

    // ── Screenshot ──────────────────────────────────────────────────────────

    async screenshotPreview(outputPath: string) {
        const el = this.page.locator('#compraventa-preview');
        await expect(el).toBeVisible();
        await el.screenshot({ path: outputPath });
    }

    // ── Preview content assertions ──────────────────────────────────────────

    async assertPreviewContains(text: string | RegExp) {
        await expect(this.page.locator('#compraventa-preview')).toContainText(text);
    }

    async assertPreviewNotContains(text: string | RegExp) {
        await expect(this.page.locator('#compraventa-preview')).not.toContainText(text);
    }

    async assertClauseVisible(clause: string) {
        await expect(this.page.locator('#compraventa-preview')).toContainText(new RegExp(`${clause}\\.`));
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
