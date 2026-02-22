import { describe, it, expect } from 'vitest';
import { formatDate, numberToWordsCOP, threeDigits } from '../contractUtils';

// ── formatDate ────────────────────────────────────────────────────────────────

describe('formatDate', () => {
    it('returns placeholder for empty string', () => {
        expect(formatDate('')).toBe('___________________');
    });

    it('formats a date correctly removing leading zeros from day', () => {
        expect(formatDate('2026-02-05')).toBe('5 de febrero de 2026');
    });

    it('formats day 1 without leading zero', () => {
        expect(formatDate('2026-01-01')).toBe('1 de enero de 2026');
    });

    it('formats all 12 months with correct Spanish names', () => {
        const expected = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
        ];
        expected.forEach((month, i) => {
            const mm = String(i + 1).padStart(2, '0');
            expect(formatDate(`2026-${mm}-15`)).toBe(`15 de ${month} de 2026`);
        });
    });

    it('preserves the year correctly', () => {
        expect(formatDate('2030-06-20')).toBe('20 de junio de 2030');
    });
});

// ── threeDigits ───────────────────────────────────────────────────────────────

describe('threeDigits', () => {
    it('returns empty string for 0', () => {
        expect(threeDigits(0)).toBe('');
    });

    it('returns CIEN for exactly 100', () => {
        expect(threeDigits(100)).toBe('CIEN');
    });

    it('returns CIENTO UN for 101', () => {
        expect(threeDigits(101)).toBe('CIENTO UN');
    });

    it('handles tens without units (e.g. 30)', () => {
        expect(threeDigits(30)).toBe('TREINTA');
    });

    it('handles tens with units using Y (e.g. 35)', () => {
        expect(threeDigits(35)).toBe('TREINTA Y CINCO');
    });

    it('handles VEINTI prefix for 21-29', () => {
        expect(threeDigits(21)).toBe('VEINTIUN');
        expect(threeDigits(25)).toBe('VEINTICINCO');
    });

    it('handles numbers under 20 (teens)', () => {
        expect(threeDigits(15)).toBe('QUINCE');
        expect(threeDigits(19)).toBe('DIECINUEVE');
    });

    it('handles hundreds without remainder', () => {
        expect(threeDigits(200)).toBe('DOSCIENTOS');
        expect(threeDigits(500)).toBe('QUINIENTOS');
        expect(threeDigits(900)).toBe('NOVECIENTOS');
    });

    it('handles hundreds with tens and units', () => {
        expect(threeDigits(999)).toBe('NOVECIENTOS NOVENTA Y NUEVE');
        expect(threeDigits(119)).toBe('CIENTO DIECINUEVE');
    });
});

// ── numberToWordsCOP ─────────────────────────────────────────────────────────

describe('numberToWordsCOP', () => {
    it('returns CERO PESOS for 0', () => {
        expect(numberToWordsCOP(0)).toBe('CERO PESOS');
    });

    it('converts single digits', () => {
        expect(numberToWordsCOP(1)).toBe('UN PESOS');
        expect(numberToWordsCOP(9)).toBe('NUEVE PESOS');
    });

    it('converts teens', () => {
        expect(numberToWordsCOP(15)).toBe('QUINCE PESOS');
        expect(numberToWordsCOP(19)).toBe('DIECINUEVE PESOS');
    });

    it('converts exact hundred — CIEN not CIENTO', () => {
        expect(numberToWordsCOP(100)).toBe('CIEN PESOS');
    });

    it('converts 101 as CIENTO UN', () => {
        expect(numberToWordsCOP(101)).toBe('CIENTO UN PESOS');
    });

    it('converts exact thousand — MIL (no UN MIL)', () => {
        expect(numberToWordsCOP(1000)).toBe('MIL PESOS');
    });

    it('converts two thousand', () => {
        expect(numberToWordsCOP(2000)).toBe('DOS MIL PESOS');
    });

    it('converts price 59.900 (Plan Básico)', () => {
        expect(numberToWordsCOP(59900)).toBe('CINCUENTA Y NUEVE MIL NOVECIENTOS PESOS');
    });

    it('converts price 119.900 (Plan Pro)', () => {
        expect(numberToWordsCOP(119900)).toBe('CIENTO DIECINUEVE MIL NOVECIENTOS PESOS');
    });

    it('converts 1 million — UN MILLÓN', () => {
        expect(numberToWordsCOP(1_000_000)).toBe('UN MILLÓN PESOS');
    });

    it('converts 2 million — DOS MILLONES', () => {
        expect(numberToWordsCOP(2_000_000)).toBe('DOS MILLONES PESOS');
    });

    it('converts a typical canon — 1.500.000', () => {
        expect(numberToWordsCOP(1_500_000)).toBe('UN MILLÓN QUINIENTOS MIL PESOS');
    });

    it('converts a typical canon — 800.000', () => {
        expect(numberToWordsCOP(800_000)).toBe('OCHOCIENTOS MIL PESOS');
    });

    it('converts a complex amount — 2.350.750', () => {
        expect(numberToWordsCOP(2_350_750)).toBe(
            'DOS MILLONES TRESCIENTOS CINCUENTA MIL SETECIENTOS CINCUENTA PESOS',
        );
    });

    it('includes PESOS suffix always', () => {
        expect(numberToWordsCOP(500)).toMatch(/PESOS$/);
        expect(numberToWordsCOP(50000)).toMatch(/PESOS$/);
        expect(numberToWordsCOP(5000000)).toMatch(/PESOS$/);
    });
});
