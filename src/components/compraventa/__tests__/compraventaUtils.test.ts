import { describe, it, expect } from 'vitest';
import { formatCOPInput } from '../compraventaUtils';
import { formatCOP, formatDate, numberToWordsCOP } from '../../arrendamiento/contractUtils';

describe('formatCOPInput', () => {
    it('formatea digitos con separadores de miles', () => {
        expect(formatCOPInput('5000000')).toBe('5.000.000');
    });

    it('retorna string vacio para string vacio', () => {
        expect(formatCOPInput('')).toBe('');
    });

    it('elimina caracteres no numericos antes de formatear', () => {
        expect(formatCOPInput('$5.000.000')).toBe('5.000.000');
    });

    it('formatea valores pequenos', () => {
        expect(formatCOPInput('100')).toBe('100');
    });

    it('formatea valores grandes', () => {
        expect(formatCOPInput('999999999')).toBe('999.999.999');
    });
});

describe('formatCOP (re-exported)', () => {
    it('formatea un monto como moneda COP', () => {
        const result = formatCOP('350000000');
        expect(result).toContain('350');
    });

    it('retorna el valor original si no es un numero', () => {
        expect(formatCOP('abc')).toBe('abc');
    });
});

describe('formatDate (re-exported)', () => {
    it('formatea una fecha ISO como "D de Mes de YYYY"', () => {
        expect(formatDate('2026-06-15')).toBe('15 de junio de 2026');
    });

    it('retorna placeholder si la fecha esta vacia', () => {
        expect(formatDate('')).toBe('___________________');
    });

    it('formatea enero correctamente', () => {
        expect(formatDate('2026-01-01')).toBe('1 de enero de 2026');
    });

    it('formatea diciembre correctamente', () => {
        expect(formatDate('2026-12-31')).toBe('31 de diciembre de 2026');
    });
});

describe('numberToWordsCOP (re-exported)', () => {
    it('convierte 350000000 a palabras', () => {
        const result = numberToWordsCOP(350000000);
        expect(result).toContain('TRESCIENTOS CINCUENTA MILLONES');
    });

    it('convierte 35000000 a palabras', () => {
        const result = numberToWordsCOP(35000000);
        expect(result).toContain('TREINTA Y CINCO MILLONES');
    });

    it('retorna CERO para 0', () => {
        expect(numberToWordsCOP(0)).toBe('CERO PESOS');
    });
});
