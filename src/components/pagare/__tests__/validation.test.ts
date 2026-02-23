import { describe, it, expect } from 'vitest';
import { validateAcreedor, validateDeudor, validateObligacion, hasErrors } from '../validation';
import type { AcreedorData, DeudorData, ObligacionData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const validAcreedor: AcreedorData = {
    nombreCompleto: 'Juan Carlos Gómez Martínez',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567890',
    telefono: '300 123 4567',
    email: '',
};

const validDeudor: DeudorData = {
    nombreCompleto: 'María Fernanda López Castro',
    tipoDocumento: 'CC',
    numeroDocumento: '9876543210',
    telefono: '310 987 6543',
    email: '',
    ciudadResidencia: 'Bogotá D.C.',
};

const validObligacionUnico: ObligacionData = {
    valorPrincipal: '1000000',
    fechaSuscripcion: '2026-02-22',
    modalidadPago: 'unico',
    fechaVencimiento: '2027-02-22',
    numeroCuotas: '',
    periodoCuotas: '',
    ciudadSuscripcion: 'Bogotá D.C.',
    tasaInteresMora: '',
};

const validObligacionCuotas: ObligacionData = {
    ...validObligacionUnico,
    modalidadPago: 'cuotas',
    fechaVencimiento: '',
    numeroCuotas: '12',
    periodoCuotas: 'mensual',
};

// ── hasErrors ─────────────────────────────────────────────────────────────────

describe('hasErrors', () => {
    it('returns false for empty object', () => {
        expect(hasErrors({})).toBe(false);
    });

    it('returns true when there is at least one error', () => {
        expect(hasErrors({ nombreCompleto: 'El nombre es requerido.' })).toBe(true);
    });

    it('returns false when all error values are empty strings', () => {
        expect(hasErrors({ nombreCompleto: '', tipoDocumento: '' })).toBe(false);
    });
});

// ── validateAcreedor ──────────────────────────────────────────────────────────

describe('validateAcreedor', () => {
    it('returns no errors for valid data', () => {
        expect(validateAcreedor(validAcreedor)).toEqual({});
    });

    it('requires nombreCompleto', () => {
        const errors = validateAcreedor({ ...validAcreedor, nombreCompleto: '' });
        expect(errors.nombreCompleto).toBeTruthy();
    });

    it('rejects whitespace-only nombreCompleto', () => {
        const errors = validateAcreedor({ ...validAcreedor, nombreCompleto: '   ' });
        expect(errors.nombreCompleto).toBeTruthy();
    });

    it('requires tipoDocumento', () => {
        const errors = validateAcreedor({ ...validAcreedor, tipoDocumento: '' });
        expect(errors.tipoDocumento).toBeTruthy();
    });

    it('accepts all valid document types', () => {
        const types = ['CC', 'CE', 'NIT', 'Pasaporte'] as const;
        types.forEach((tipoDocumento) => {
            expect(validateAcreedor({ ...validAcreedor, tipoDocumento }).tipoDocumento).toBeUndefined();
        });
    });

    it('requires numeroDocumento', () => {
        const errors = validateAcreedor({ ...validAcreedor, numeroDocumento: '' });
        expect(errors.numeroDocumento).toBeTruthy();
    });

    it('requires telefono', () => {
        const errors = validateAcreedor({ ...validAcreedor, telefono: '' });
        expect(errors.telefono).toBeTruthy();
    });

    it('email is optional — no error when empty', () => {
        const errors = validateAcreedor({ ...validAcreedor, email: '' });
        expect(errors.email).toBeUndefined();
    });

    it('rejects invalid email format', () => {
        const errors = validateAcreedor({ ...validAcreedor, email: 'correo-invalido' });
        expect(errors.email).toBeTruthy();
    });

    it('accepts valid email formats', () => {
        const emails = ['a@b.co', 'user@domain.com', 'name.last+tag@sub.domain.org'];
        emails.forEach((email) => {
            expect(validateAcreedor({ ...validAcreedor, email }).email).toBeUndefined();
        });
    });

    it('returns all 4 errors when every required field is empty', () => {
        const errors = validateAcreedor({
            nombreCompleto: '',
            tipoDocumento: '',
            numeroDocumento: '',
            telefono: '',
            email: '',
        });
        expect(errors.nombreCompleto).toBeTruthy();
        expect(errors.tipoDocumento).toBeTruthy();
        expect(errors.numeroDocumento).toBeTruthy();
        expect(errors.telefono).toBeTruthy();
        expect(errors.email).toBeUndefined(); // email is optional
    });
});

// ── validateDeudor ────────────────────────────────────────────────────────────

describe('validateDeudor', () => {
    it('returns no errors for valid data', () => {
        expect(validateDeudor(validDeudor)).toEqual({});
    });

    it('requires nombreCompleto', () => {
        expect(validateDeudor({ ...validDeudor, nombreCompleto: '' }).nombreCompleto).toBeTruthy();
    });

    it('rejects whitespace-only nombreCompleto', () => {
        expect(validateDeudor({ ...validDeudor, nombreCompleto: '   ' }).nombreCompleto).toBeTruthy();
    });

    it('requires tipoDocumento', () => {
        expect(validateDeudor({ ...validDeudor, tipoDocumento: '' }).tipoDocumento).toBeTruthy();
    });

    it('requires numeroDocumento', () => {
        expect(validateDeudor({ ...validDeudor, numeroDocumento: '' }).numeroDocumento).toBeTruthy();
    });

    it('requires telefono', () => {
        expect(validateDeudor({ ...validDeudor, telefono: '' }).telefono).toBeTruthy();
    });

    it('email is optional — no error when empty', () => {
        expect(validateDeudor({ ...validDeudor, email: '' }).email).toBeUndefined();
    });

    it('rejects invalid email', () => {
        expect(validateDeudor({ ...validDeudor, email: 'bad-email' }).email).toBeTruthy();
    });

    it('requires ciudadResidencia', () => {
        const errors = validateDeudor({ ...validDeudor, ciudadResidencia: '' });
        expect(errors.ciudadResidencia).toBeTruthy();
    });

    it('rejects whitespace-only ciudadResidencia', () => {
        const errors = validateDeudor({ ...validDeudor, ciudadResidencia: '   ' });
        expect(errors.ciudadResidencia).toBeTruthy();
    });

    it('returns 5 errors when all required fields are empty', () => {
        const errors = validateDeudor({
            nombreCompleto: '',
            tipoDocumento: '',
            numeroDocumento: '',
            telefono: '',
            email: '',
            ciudadResidencia: '',
        });
        expect(errors.nombreCompleto).toBeTruthy();
        expect(errors.tipoDocumento).toBeTruthy();
        expect(errors.numeroDocumento).toBeTruthy();
        expect(errors.telefono).toBeTruthy();
        expect(errors.ciudadResidencia).toBeTruthy();
        expect(errors.email).toBeUndefined();
    });

    it('differs from validateAcreedor in that it requires ciudadResidencia', () => {
        // validateAcreedor does NOT have ciudadResidencia
        // validateDeudor DOES have ciudadResidencia
        const errors = validateDeudor({ ...validDeudor, ciudadResidencia: '' });
        expect(errors.ciudadResidencia).toBeTruthy();
    });
});

// ── validateObligacion ────────────────────────────────────────────────────────

describe('validateObligacion', () => {
    describe('pago único', () => {
        it('returns no errors for valid pago único', () => {
            expect(validateObligacion(validObligacionUnico)).toEqual({});
        });

        it('requires valorPrincipal', () => {
            const errors = validateObligacion({ ...validObligacionUnico, valorPrincipal: '' });
            expect(errors.valorPrincipal).toBeTruthy();
        });

        it('requires fechaSuscripcion', () => {
            const errors = validateObligacion({ ...validObligacionUnico, fechaSuscripcion: '' });
            expect(errors.fechaSuscripcion).toBeTruthy();
        });

        it('requires fechaVencimiento for pago único', () => {
            const errors = validateObligacion({ ...validObligacionUnico, fechaVencimiento: '' });
            expect(errors.fechaVencimiento).toBeTruthy();
        });

        it('no error on fechaVencimiento when provided', () => {
            const errors = validateObligacion(validObligacionUnico);
            expect(errors.fechaVencimiento).toBeUndefined();
        });

        it('requires ciudadSuscripcion', () => {
            const errors = validateObligacion({ ...validObligacionUnico, ciudadSuscripcion: '' });
            expect(errors.ciudadSuscripcion).toBeTruthy();
        });

        it('rejects whitespace-only ciudadSuscripcion', () => {
            const errors = validateObligacion({
                ...validObligacionUnico,
                ciudadSuscripcion: '   ',
            });
            expect(errors.ciudadSuscripcion).toBeTruthy();
        });

        it('tasaInteresMora is optional — no error when empty', () => {
            const errors = validateObligacion({ ...validObligacionUnico, tasaInteresMora: '' });
            expect(errors.tasaInteresMora).toBeUndefined();
        });
    });

    describe('pago por cuotas', () => {
        it('returns no errors for valid cuotas data', () => {
            expect(validateObligacion(validObligacionCuotas)).toEqual({});
        });

        it('requires numeroCuotas when modalidad is cuotas', () => {
            const errors = validateObligacion({ ...validObligacionCuotas, numeroCuotas: '' });
            expect(errors.numeroCuotas).toBeTruthy();
        });

        it('requires periodoCuotas when modalidad is cuotas', () => {
            const errors = validateObligacion({ ...validObligacionCuotas, periodoCuotas: '' });
            expect(errors.periodoCuotas).toBeTruthy();
        });

        it('does NOT require fechaVencimiento for cuotas', () => {
            const errors = validateObligacion({ ...validObligacionCuotas, fechaVencimiento: '' });
            expect(errors.fechaVencimiento).toBeUndefined();
        });

        it('accepts all valid periodoCuotas values', () => {
            const periodos = ['mensual', 'bimestral', 'trimestral'] as const;
            periodos.forEach((periodoCuotas) => {
                const errors = validateObligacion({ ...validObligacionCuotas, periodoCuotas });
                expect(errors.periodoCuotas).toBeUndefined();
            });
        });
    });

    describe('modalidad de pago', () => {
        it('requires modalidadPago', () => {
            const errors = validateObligacion({ ...validObligacionUnico, modalidadPago: '' });
            expect(errors.modalidadPago).toBeTruthy();
        });

        it('does NOT require numeroCuotas / periodoCuotas for pago único', () => {
            const errors = validateObligacion({
                ...validObligacionUnico,
                numeroCuotas: '',
                periodoCuotas: '',
            });
            expect(errors.numeroCuotas).toBeUndefined();
            expect(errors.periodoCuotas).toBeUndefined();
        });
    });

    describe('all fields empty', () => {
        it('reports errors for all required fields when everything is empty', () => {
            const errors = validateObligacion({
                valorPrincipal: '',
                fechaSuscripcion: '',
                modalidadPago: '',
                fechaVencimiento: '',
                numeroCuotas: '',
                periodoCuotas: '',
                ciudadSuscripcion: '',
                tasaInteresMora: '',
            });
            expect(errors.valorPrincipal).toBeTruthy();
            expect(errors.fechaSuscripcion).toBeTruthy();
            expect(errors.modalidadPago).toBeTruthy();
            expect(errors.ciudadSuscripcion).toBeTruthy();
        });
    });
});
