// ── Intereses — Fixtures de prueba ────────────────────────────────────────────
//
// Datos realistas colombianos para la liquidadora de intereses judiciales.
// Las fechas son absolutas (ya pasaron) para evitar dependencia de la fecha actual.
// Los montos están en COP sin separadores (como los almacena el store).
//

export interface InteresesFixture {
    capital: string;
    tipoInteres: 'corriente' | 'moratorio';
    fechaIniciaMora: string;
    fechaPago: string;
}

// ── Período corto: 45 días, interés corriente ────────────────────────────────

export const liquidacionCortaCorriente: InteresesFixture = {
    capital: '5000000',
    tipoInteres: 'corriente',
    fechaIniciaMora: '2024-10-01',
    fechaPago: '2024-11-15',
} as const;

// ── Período largo: ~12 meses, interés moratorio ─────────────────────────────

export const liquidacionLargaMoratoria: InteresesFixture = {
    capital: '25000000',
    tipoInteres: 'moratorio',
    fechaIniciaMora: '2024-01-01',
    fechaPago: '2024-12-31',
} as const;

// ── Período medio: ~3 meses, interés corriente ──────────────────────────────

export const liquidacionMediaCorriente: InteresesFixture = {
    capital: '10000000',
    tipoInteres: 'corriente',
    fechaIniciaMora: '2024-07-01',
    fechaPago: '2024-09-30',
} as const;

// ── Período medio: ~3 meses, interés moratorio ──────────────────────────────

export const liquidacionMediaMoratoria: InteresesFixture = {
    capital: '10000000',
    tipoInteres: 'moratorio',
    fechaIniciaMora: '2024-07-01',
    fechaPago: '2024-09-30',
} as const;
