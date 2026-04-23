import { describe, it, expect } from 'vitest';
import { formatDuracion, formatJornada, formatCOP, numberToWordsCOP } from '../laboralUtils';

// ── formatDuracion ────────────────────────────────────────────────────────────

describe('formatDuracion', () => {
    it('formatea 1 día (singular)', () => {
        expect(formatDuracion('1', 'dias')).toBe('un (1) día');
    });

    it('formatea 3 días (plural)', () => {
        expect(formatDuracion('3', 'dias')).toBe('tres (3) días');
    });

    it('formatea 30 días', () => {
        expect(formatDuracion('30', 'dias')).toBe('treinta (30) días');
    });

    it('formatea 1 mes (singular)', () => {
        expect(formatDuracion('1', 'meses')).toBe('un (1) mes');
    });

    it('formatea 6 meses (plural)', () => {
        expect(formatDuracion('6', 'meses')).toBe('seis (6) meses');
    });

    it('formatea 12 meses', () => {
        expect(formatDuracion('12', 'meses')).toBe('doce (12) meses');
    });

    it('formatea 1 año (singular)', () => {
        expect(formatDuracion('1', 'anos')).toBe('un (1) año');
    });

    it('formatea 2 años (plural)', () => {
        expect(formatDuracion('2', 'anos')).toBe('dos (2) años');
    });

    it('retorna placeholder para valor inválido', () => {
        expect(formatDuracion('', 'meses')).toContain('___');
        expect(formatDuracion('0', 'meses')).toContain('___');
    });
});

// ── formatJornada ─────────────────────────────────────────────────────────────

describe('formatJornada', () => {
    it('mapea lunes-viernes-8-5', () => {
        expect(formatJornada('lunes-viernes-8-5')).toBe('lunes a viernes de 8:00 a.m. a 5:00 p.m.');
    });

    it('mapea lunes-viernes-7-4', () => {
        expect(formatJornada('lunes-viernes-7-4')).toBe('lunes a viernes de 7:00 a.m. a 4:00 p.m.');
    });

    it('mapea lunes-sabado-8-12', () => {
        expect(formatJornada('lunes-sabado-8-12')).toBe('lunes a sábado de 8:00 a.m. a 12:00 p.m.');
    });

    it('mapea turnos-rotativos', () => {
        expect(formatJornada('turnos-rotativos')).toBe('turnos rotativos según programación del empleador');
    });

    it('retorna string vacío para otro', () => {
        expect(formatJornada('otro')).toBe('');
    });
});

// ── formatCOP — smoke test ────────────────────────────────────────────────────

describe('formatCOP', () => {
    it('formatea 1.000.000', () => {
        expect(formatCOP('1000000')).toContain('1.000.000');
    });

    it('formatea 3.500.000', () => {
        expect(formatCOP('3500000')).toContain('3.500.000');
    });

    it('retorna el valor original si no es numérico', () => {
        expect(formatCOP('abc')).toBe('abc');
    });
});

// ── numberToWordsCOP — smoke test ─────────────────────────────────────────────

describe('numberToWordsCOP', () => {
    it('convierte 2.500.000', () => {
        expect(numberToWordsCOP(2_500_000)).toContain('DOS MILLONES');
    });

    it('convierte 3.500.000', () => {
        expect(numberToWordsCOP(3_500_000)).toContain('TRES MILLONES');
    });

    it('convierte 500.000', () => {
        expect(numberToWordsCOP(500_000)).toContain('QUINIENTOS MIL');
    });
});
