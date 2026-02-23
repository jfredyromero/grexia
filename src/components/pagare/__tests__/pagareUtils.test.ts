import { describe, it, expect } from 'vitest';
import { formatCOP, formatDate, numberToWordsCOP, PERIODO_LABELS } from '../pagareUtils';

// ── PERIODO_LABELS ────────────────────────────────────────────────────────────

describe('PERIODO_LABELS', () => {
    it('maps mensual correctly', () => {
        expect(PERIODO_LABELS.mensual).toBe('mensual');
    });

    it('maps bimestral correctly', () => {
        expect(PERIODO_LABELS.bimestral).toBe('bimestral');
    });

    it('maps trimestral correctly', () => {
        expect(PERIODO_LABELS.trimestral).toBe('trimestral');
    });

    it('has exactly 3 keys', () => {
        expect(Object.keys(PERIODO_LABELS)).toHaveLength(3);
    });
});

// ── formatCOP (re-exported — pagare amounts) ──────────────────────────────────

describe('formatCOP — pagare amounts', () => {
    it('formats 1.000.000 (contains numeric separators)', () => {
        expect(formatCOP('1000000')).toMatch(/1[.,\s]000[.,\s]000/);
    });

    it('formats 500.000', () => {
        expect(formatCOP('500000')).toMatch(/500[.,\s]000/);
    });

    it('formats 5.000.000 (five million)', () => {
        expect(formatCOP('5000000')).toMatch(/5[.,\s]000[.,\s]000/);
    });

    it('formats 2.350.000', () => {
        expect(formatCOP('2350000')).toMatch(/2[.,\s]350[.,\s]000/);
    });

    it('strips non-digits before formatting', () => {
        // Input with separators already should still work
        expect(formatCOP('1.000.000')).toMatch(/1[.,\s]000[.,\s]000/);
    });

    it('returns raw value for empty string', () => {
        expect(formatCOP('')).toBe('');
    });
});

// ── formatDate (re-exported — pagare use cases) ───────────────────────────────

describe('formatDate — pagare use cases', () => {
    it('formats suscripcion date correctly', () => {
        expect(formatDate('2026-02-22')).toBe('22 de febrero de 2026');
    });

    it('formats vencimiento date a year ahead', () => {
        expect(formatDate('2027-02-22')).toBe('22 de febrero de 2027');
    });

    it('returns placeholder for empty date', () => {
        expect(formatDate('')).toBe('___________________');
    });

    it('removes leading zero from day', () => {
        expect(formatDate('2026-03-05')).toBe('5 de marzo de 2026');
    });
});

// ── numberToWordsCOP (re-exported — pagare amounts) ───────────────────────────

describe('numberToWordsCOP — pagare amounts', () => {
    it('converts 1.000.000 → UN MILLÓN PESOS', () => {
        expect(numberToWordsCOP(1_000_000)).toBe('UN MILLÓN PESOS');
    });

    it('converts 500.000 → QUINIENTOS MIL PESOS', () => {
        expect(numberToWordsCOP(500_000)).toBe('QUINIENTOS MIL PESOS');
    });

    it('converts 5.000.000 → CINCO MILLONES PESOS', () => {
        expect(numberToWordsCOP(5_000_000)).toBe('CINCO MILLONES PESOS');
    });

    it('converts 750.000 → SETECIENTOS CINCUENTA MIL PESOS', () => {
        expect(numberToWordsCOP(750_000)).toBe('SETECIENTOS CINCUENTA MIL PESOS');
    });

    it('converts 2.500.000 → DOS MILLONES QUINIENTOS MIL PESOS', () => {
        expect(numberToWordsCOP(2_500_000)).toBe('DOS MILLONES QUINIENTOS MIL PESOS');
    });

    it('converts 10.000.000 → DIEZ MILLONES PESOS', () => {
        expect(numberToWordsCOP(10_000_000)).toBe('DIEZ MILLONES PESOS');
    });

    it('converts 1.250.750', () => {
        expect(numberToWordsCOP(1_250_750)).toBe('UN MILLÓN DOSCIENTOS CINCUENTA MIL SETECIENTOS CINCUENTA PESOS');
    });

    it('always ends with PESOS', () => {
        [100_000, 1_000_000, 50_000_000].forEach((n) => {
            expect(numberToWordsCOP(n)).toMatch(/PESOS$/);
        });
    });
});
