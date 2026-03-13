import { describe, it, expect } from 'vitest';
import { calcularIntereses, formatCOP, formatPct, formatCOPInput } from '../interesesUtils';
import type { TasaEntry } from '../interesesUtils';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const tasasSimples: TasaEntry[] = [
    { desde: '2025-01-01', hasta: '2025-03-31', tea: 0.1729 },
    { desde: '2025-04-01', hasta: '2025-06-30', tea: 0.1705 },
];

// ── calcularIntereses ─────────────────────────────────────────────────────────

describe('calcularIntereses — básico', () => {
    it('devuelve cero días cuando pago < inicio', () => {
        const r = calcularIntereses(1_000_000, 'corriente', '2025-06-01', '2025-01-01', tasasSimples);
        expect(r.diasTotal).toBe(0);
        expect(r.totalIntereses).toBe(0);
    });

    it('calcula diasTotal correctamente para un mes completo', () => {
        const r = calcularIntereses(1_000_000, 'corriente', '2025-01-01', '2025-01-31', tasasSimples);
        expect(r.diasTotal).toBe(31);
    });

    it('totalIntereses es mayor que cero', () => {
        const r = calcularIntereses(5_000_000, 'corriente', '2025-01-01', '2025-03-31', tasasSimples);
        expect(r.totalIntereses).toBeGreaterThan(0);
    });

    it('interés moratorio es mayor que corriente (mismo período)', () => {
        const corriente = calcularIntereses(1_000_000, 'corriente', '2025-01-01', '2025-03-31', tasasSimples);
        const moratorio = calcularIntereses(1_000_000, 'moratorio', '2025-01-01', '2025-03-31', tasasSimples);
        expect(moratorio.totalIntereses).toBeGreaterThan(corriente.totalIntereses);
    });

    it('moratorio aplica TEA × 1.5 en teaAplicada del segmento', () => {
        const corriente = calcularIntereses(1_000_000, 'corriente', '2025-01-01', '2025-01-31', tasasSimples);
        const moratorio = calcularIntereses(1_000_000, 'moratorio', '2025-01-01', '2025-01-31', tasasSimples);
        expect(moratorio.segmentos[0].teaAplicada).toBeCloseTo(corriente.segmentos[0].teaCorriente * 1.5, 10);
    });

    it('genera segmentos cuando el período cruza varios trimestres', () => {
        const r = calcularIntereses(1_000_000, 'corriente', '2025-01-01', '2025-06-30', tasasSimples);
        expect(r.segmentos.length).toBe(2);
    });

    it('usa la última tasa cuando el período supera la tabla', () => {
        const r = calcularIntereses(1_000_000, 'corriente', '2025-06-01', '2026-01-01', tasasSimples);
        const lastSegmento = r.segmentos[r.segmentos.length - 1];
        expect(lastSegmento.periodoLabel).toContain('últ. tasa disponible');
    });

    it('suma de segmentos == totalIntereses', () => {
        const r = calcularIntereses(2_000_000, 'corriente', '2025-01-15', '2025-06-20', tasasSimples);
        const sumaSegmentos = r.segmentos.reduce((acc, s) => acc + s.interesCausado, 0);
        expect(sumaSegmentos).toBeCloseTo(r.totalIntereses, 6);
    });

    it('suma de días de segmentos == diasTotal', () => {
        const r = calcularIntereses(1_000_000, 'corriente', '2025-01-01', '2025-06-30', tasasSimples);
        const sumaSegmentos = r.segmentos.reduce((acc, s) => acc + s.dias, 0);
        expect(sumaSegmentos).toBe(r.diasTotal);
    });

    it('genera detalle mensual para cada mes del período', () => {
        const r = calcularIntereses(1_000_000, 'corriente', '2025-01-01', '2025-03-31', tasasSimples);
        expect(r.meses.length).toBe(3);
        expect(r.meses[0].mes).toBe('enero 2025');
        expect(r.meses[2].mes).toBe('marzo 2025');
    });

    it('acumulado en el último mes ≈ totalIntereses', () => {
        const r = calcularIntereses(1_000_000, 'corriente', '2025-01-01', '2025-03-31', tasasSimples);
        const last = r.meses[r.meses.length - 1];
        expect(last.acumulado).toBeCloseTo(r.totalIntereses, 5);
    });

    it('devuelve los campos de entrada en el resultado', () => {
        const r = calcularIntereses(3_000_000, 'moratorio', '2025-02-01', '2025-05-15', tasasSimples);
        expect(r.capital).toBe(3_000_000);
        expect(r.tipo).toBe('moratorio');
        expect(r.fechaInicio).toBe('2025-02-01');
        expect(r.fechaPago).toBe('2025-05-15');
    });
});

// ── formatCOP ─────────────────────────────────────────────────────────────────

describe('formatCOP', () => {
    it('formatea un millón correctamente', () => {
        expect(formatCOP(1_000_000)).toMatch(/1[.,\s]000[.,\s]000/);
    });

    it('incluye símbolo de moneda', () => {
        expect(formatCOP(500_000)).toContain('$');
    });
});

// ── formatPct ─────────────────────────────────────────────────────────────────

describe('formatPct', () => {
    it('formatea 0.1729 como 17.29% con 2 decimales', () => {
        expect(formatPct(0.1729, 2)).toBe('17.29%');
    });

    it('formatea 0.2 como 20.0000% con 4 decimales por defecto', () => {
        expect(formatPct(0.2)).toBe('20.0000%');
    });
});

// ── formatCOPInput ────────────────────────────────────────────────────────────

describe('formatCOPInput', () => {
    it('formatea 1000000 como string con separadores', () => {
        expect(formatCOPInput('1000000')).toMatch(/1[.,\s]000[.,\s]000/);
    });

    it('devuelve string vacío para entrada vacía', () => {
        expect(formatCOPInput('')).toBe('');
    });

    it('elimina caracteres no numéricos antes de formatear', () => {
        expect(formatCOPInput('1.000.000')).toMatch(/1[.,\s]000[.,\s]000/);
    });
});
