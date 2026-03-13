import { describe, it, expect } from 'vitest';
import { validateObligacion, hasErrors } from '../validation';
import type { InteresesFormData } from '../types';

const valid: InteresesFormData = {
    capital: '1000000',
    tipoInteres: 'corriente',
    fechaIniciaMora: '2025-01-01',
    fechaPago: '2025-06-30',
};

describe('validateObligacion', () => {
    it('no hay errores con datos válidos', () => {
        expect(hasErrors(validateObligacion(valid))).toBe(false);
    });

    it('capital vacío genera error', () => {
        const e = validateObligacion({ ...valid, capital: '' });
        expect(e.capital).toBeTruthy();
    });

    it('capital cero genera error', () => {
        const e = validateObligacion({ ...valid, capital: '0' });
        expect(e.capital).toBeTruthy();
    });

    it('tipo de interés vacío genera error', () => {
        const e = validateObligacion({ ...valid, tipoInteres: '' });
        expect(e.tipoInteres).toBeTruthy();
    });

    it('fecha inicio mora vacía genera error', () => {
        const e = validateObligacion({ ...valid, fechaIniciaMora: '' });
        expect(e.fechaIniciaMora).toBeTruthy();
    });

    it('fecha pago vacía genera error', () => {
        const e = validateObligacion({ ...valid, fechaPago: '' });
        expect(e.fechaPago).toBeTruthy();
    });

    it('fecha pago anterior a inicio genera error', () => {
        const e = validateObligacion({ ...valid, fechaIniciaMora: '2025-06-01', fechaPago: '2025-01-01' });
        expect(e.fechaPago).toBeTruthy();
    });

    it('misma fecha inicio y pago no genera error', () => {
        const e = validateObligacion({ ...valid, fechaIniciaMora: '2025-01-01', fechaPago: '2025-01-01' });
        expect(hasErrors(e)).toBe(false);
    });
});

describe('hasErrors', () => {
    it('devuelve false con objeto vacío', () => {
        expect(hasErrors({})).toBe(false);
    });

    it('devuelve true cuando hay al menos un error', () => {
        expect(hasErrors({ campo: 'requerido' })).toBe(true);
    });

    it('devuelve false cuando todos los valores son cadenas vacías', () => {
        expect(hasErrors({ campo: '' })).toBe(false);
    });
});
