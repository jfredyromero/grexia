import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

type TipoInmueble = 'Apartamento' | 'Casa' | 'Local Comercial' | 'Oficina';
type PlanTier = 'free' | 'empresarial';

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

interface CoarrendatarioData {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Mapea el valor interno del tipo de documento a la etiqueta visible en el Listbox. */
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

export class ArrendamientoFormPage {
    constructor(private page: Page) {}

    // ── Navigation ────────────────────────────────────────────────────────────

    /**
     * Navega al formulario con el plan indicado.
     * El plan se inyecta en localStorage antes de cargar la página
     * (nanostores persistentAtom clave: 'lexia_plan').
     */
    async goto(plan?: PlanTier) {
        if (plan === 'empresarial') {
            await this.page.addInitScript(() => {
                localStorage.setItem('lexia_plan', 'empresarial');
            });
        }
        await this.page.goto('/herramientas/arrendamiento/generar');
        // client:only="react" — el componente no se SSR, el botón sólo existe tras el render de React
        await this.page.waitForSelector('button:has-text("Continuar")', { timeout: 10_000 });
    }

    // ── Step 1: Inmueble ──────────────────────────────────────────────────────

    async fillInmueble(data: InmuebleData) {
        // Tipo de inmueble (botones)
        await this.page.getByRole('button', { name: data.tipo }).click();

        // Propiedad Horizontal (botones condicionales)
        await this.page.waitForSelector('text=¿Está en propiedad horizontal?');
        if (data.ph) {
            await this.page.getByRole('button', { name: /Sí, es en PH/ }).click();
        } else {
            await this.page.getByRole('button', { name: /No, es independiente/ }).click();
        }

        // Dirección
        await this.page.fill('#direccion', data.direccion);

        // Departamento — Combobox (ColombiaLocationSelect)
        // Hace click para abrir y luego filtra escribiendo
        await this.page.locator('#inmueble-ciudad-dept').click();
        await this.page.locator('#inmueble-ciudad-dept').fill(data.departamento);
        await this.page
            .getByRole('option', { name: data.departamento, exact: true })
            .first()
            .waitFor({ timeout: 15_000 });
        await this.page.getByRole('option', { name: data.departamento, exact: true }).first().click();

        // Ciudad — Combobox (esperar a que carguen las ciudades del departamento)
        await this.page.locator('#inmueble-ciudad-city:not([disabled])').waitFor({ timeout: 15_000 });
        await this.page.locator('#inmueble-ciudad-city').click();
        await this.page.locator('#inmueble-ciudad-city').fill(data.ciudad);
        await this.page.getByRole('option', { name: data.ciudad, exact: true }).first().waitFor({ timeout: 15_000 });
        await this.page.getByRole('option', { name: data.ciudad, exact: true }).first().click();

        // Estrato — Listbox (solo si difiere del default '3')
        if (data.estrato !== '3') {
            await this.page.locator('#estrato').click();
            await this.page.getByRole('option', { name: `Estrato ${data.estrato}` }).click();
        }

        // Área
        await this.page.fill('#areaMq', data.areaMq);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El arrendador")');
    }

    // ── Step 2: Arrendador ────────────────────────────────────────────────────

    async fillArrendador(data: PersonaData) {
        await this.page.evaluate(() => window.scrollTo(0, 0));
        await this.page.fill('#arrendador-nombre', data.nombre);

        // Tipo de documento — Listbox: abrir + seleccionar opción por etiqueta
        await this.page.locator('#arrendador-tipo-doc').click();
        await this.page
            .getByRole('option', { name: docLabel(data.tipoDoc) })
            .first()
            .click();

        await this.page.fill('#arrendador-num-doc', data.numDoc);
        await this.page.fill('#arrendador-tel', data.telefono);
        if (data.email) await this.page.fill('#arrendador-email', data.email);

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("El arrendatario")');
    }

    // ── Step 3: Arrendatario ──────────────────────────────────────────────────

    async fillArrendatario(data: PersonaData, coarrendatario?: CoarrendatarioData) {
        await this.page.evaluate(() => window.scrollTo(0, 0));
        await this.page.fill('#arrendatario-nombre', data.nombre);

        // Tipo de documento — Listbox: abrir + seleccionar opción por etiqueta
        await this.page.locator('#arrendatario-tipo-doc').click();
        await this.page
            .getByRole('option', { name: docLabel(data.tipoDoc) })
            .first()
            .click();

        await this.page.fill('#arrendatario-num-doc', data.numDoc);
        await this.page.fill('#arrendatario-tel', data.telefono);
        if (data.email) await this.page.fill('#arrendatario-email', data.email);

        if (coarrendatario) {
            await this.fillCoarrendatario(coarrendatario);
        }

        await this.page.getByRole('button', { name: 'Continuar' }).click();
        await this.page.waitForSelector('h2:has-text("Condiciones del contrato")');
    }

    // ── Step 3: Coarrendatario (toggle + campos) ──────────────────────────────

    async fillCoarrendatario(data: CoarrendatarioData) {
        // Activar el toggle de coarrendatario
        await this.page.getByRole('button', { name: /Agregar coarrendatario/i }).click();
        await this.page.waitForSelector('#coarrendatario-nombre');

        await this.page.fill('#coarrendatario-nombre', data.nombre);

        await this.page.locator('#coarrendatario-tipo-doc').click();
        await this.page
            .getByRole('option', { name: docLabel(data.tipoDoc) })
            .first()
            .click();

        await this.page.fill('#coarrendatario-num-doc', data.numDoc);
        await this.page.fill('#coarrendatario-tel', data.telefono);
        if (data.email) await this.page.fill('#coarrendatario-email', data.email);
    }

    // ── Step 4: Condiciones ───────────────────────────────────────────────────

    async fillCondiciones(data: CondicionesData, tipo?: TipoInmueble) {
        await this.page.evaluate(() => window.scrollTo(0, 0));
        if (tipo === 'Local Comercial' && data.actividad) {
            await this.page.waitForSelector('#actividad');
            await this.page.fill('#actividad', data.actividad);
        }

        await this.page.fill('#fecha-inicio', data.fechaInicio);
        await this.page.fill('#duracion', data.duracion);
        await this.page.locator('#canon').fill(data.canon);
        await this.page.locator('#deposito').fill(data.deposito);

        // Día de pago — range slider: fill() dispara el evento input que React captura
        await this.page.fill('#dia-pago', data.diaPago);

        await this.page.getByRole('button', { name: 'Ver mi contrato' }).click();
        await this.page.waitForSelector('#contract-content', { timeout: 10_000 });
    }

    // ── Full form fill (steps 1–4) ────────────────────────────────────────────

    async fillAllSteps(
        data: Parameters<typeof this.fillInmueble>[0] & {
            arrendador: PersonaData;
            arrendatario: PersonaData;
            coarrendatario?: CoarrendatarioData;
            condiciones: CondicionesData;
        }
    ) {
        await this.fillInmueble(data);
        await this.fillArrendador(data.arrendador);
        await this.fillArrendatario(data.arrendatario, data.coarrendatario);
        await this.fillCondiciones(data.condiciones, data.tipo);
    }

    // ── PDF download ──────────────────────────────────────────────────────────

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

    // ── Contract screenshot ───────────────────────────────────────────────────

    async screenshotContract(outputPath: string) {
        const contractEl = this.page.locator('#contract-content');
        await expect(contractEl).toBeVisible();
        await contractEl.screenshot({ path: outputPath });
    }

    // ── Contract content assertions ───────────────────────────────────────────

    async assertContractContains(text: string | RegExp) {
        await expect(this.page.locator('#contract-content')).toContainText(text);
    }

    async assertContractNotContains(text: string | RegExp) {
        await expect(this.page.locator('#contract-content')).not.toContainText(text);
    }

    // ── Plan UI assertions (Step 5) ───────────────────────────────────────────

    /** Verifica el badge de plan visible en el encabezado del Step 5. */
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
}

// ── PDF validation helper ─────────────────────────────────────────────────────

export function assertValidPDF(pdfPath: string) {
    expect(fs.existsSync(pdfPath), `PDF file should exist at ${pdfPath}`).toBe(true);

    const buffer = fs.readFileSync(pdfPath);
    expect(buffer.length, 'PDF should not be empty').toBeGreaterThan(0);

    // Todos los PDFs válidos comienzan con el header %PDF-
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
