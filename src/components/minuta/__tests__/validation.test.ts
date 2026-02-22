import { describe, it, expect } from 'vitest';
import {
    validateArrendador,
    validateArrendatario,
    validateInmueble,
    validateCondiciones,
    hasErrors,
} from '../validation';
import type { ArrendadorData, ArrendatarioData, InmuebleData, CondicionesData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const validArrendador: ArrendadorData = {
    nombreCompleto: 'Juan Carlos Gómez',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567890',
    telefono: '300 123 4567',
    email: '',
};

const validArrendatario: ArrendatarioData = {
    nombreCompleto: 'María Fernanda López',
    tipoDocumento: 'CC',
    numeroDocumento: '9876543210',
    telefono: '310 987 6543',
    email: '',
};

const validInmueble: InmuebleData = {
    tipoInmueble: 'Apartamento',
    propiedadHorizontal: false,
    direccion: 'Calle 45 # 23-15, Apto 301',
    ciudad: 'Bogotá',
    departamento: 'Bogotá D.C.',
    estrato: '3',
    areaMq: '65',
};

const validCondiciones: CondicionesData = {
    fechaInicio: '2026-03-01',
    duracionMeses: 12,
    canonMensual: '1500000',
    depositoCOP: '3000000',
    diaPagoMes: 5,
    actividadComercial: '',
};

// ── hasErrors ─────────────────────────────────────────────────────────────────

describe('hasErrors', () => {
    it('returns false for empty errors object', () => {
        expect(hasErrors({})).toBe(false);
    });

    it('returns true when there are errors', () => {
        expect(hasErrors({ nombre: 'Campo requerido' })).toBe(true);
    });
});

// ── validateArrendador ────────────────────────────────────────────────────────

describe('validateArrendador', () => {
    it('returns no errors for valid data', () => {
        expect(validateArrendador(validArrendador)).toEqual({});
    });

    it('requires nombreCompleto', () => {
        const errors = validateArrendador({ ...validArrendador, nombreCompleto: '' });
        expect(errors.nombreCompleto).toBe('Campo requerido');
    });

    it('rejects whitespace-only nombreCompleto', () => {
        const errors = validateArrendador({ ...validArrendador, nombreCompleto: '   ' });
        expect(errors.nombreCompleto).toBe('Campo requerido');
    });

    it('requires tipoDocumento', () => {
        const errors = validateArrendador({ ...validArrendador, tipoDocumento: '' });
        expect(errors.tipoDocumento).toBeTruthy();
    });

    it('requires numeroDocumento', () => {
        const errors = validateArrendador({ ...validArrendador, numeroDocumento: '' });
        expect(errors.numeroDocumento).toBe('Campo requerido');
    });

    it('requires telefono', () => {
        const errors = validateArrendador({ ...validArrendador, telefono: '' });
        expect(errors.telefono).toBe('Campo requerido');
    });

    it('email is optional — no error when empty', () => {
        const errors = validateArrendador({ ...validArrendador, email: '' });
        expect(errors.email).toBeUndefined();
    });

    it('validates email format when provided', () => {
        const errors = validateArrendador({ ...validArrendador, email: 'invalido' });
        expect(errors.email).toBe('Correo inválido');
    });

    it('accepts valid email formats', () => {
        const validEmails = ['a@b.co', 'user@domain.com', 'name.last+tag@sub.domain.org'];
        validEmails.forEach((email) => {
            expect(validateArrendador({ ...validArrendador, email }).email).toBeUndefined();
        });
    });

    it('rejects emails without @', () => {
        expect(validateArrendador({ ...validArrendador, email: 'userdominio.com' }).email).toBe(
            'Correo inválido',
        );
    });

    it('rejects emails without domain', () => {
        expect(validateArrendador({ ...validArrendador, email: 'user@' }).email).toBe('Correo inválido');
    });

    it('returns multiple errors simultaneously', () => {
        const errors = validateArrendador({
            nombreCompleto: '',
            tipoDocumento: '',
            numeroDocumento: '',
            telefono: '',
            email: '',
        });
        expect(Object.keys(errors).length).toBe(4); // nombre, tipo, numero, telefono
    });
});

// ── validateArrendatario ──────────────────────────────────────────────────────

describe('validateArrendatario', () => {
    it('returns no errors for valid data', () => {
        expect(validateArrendatario(validArrendatario)).toEqual({});
    });

    it('requires all mandatory fields', () => {
        const empty: ArrendatarioData = {
            nombreCompleto: '',
            tipoDocumento: '',
            numeroDocumento: '',
            telefono: '',
            email: '',
        };
        const errors = validateArrendatario(empty);
        expect(errors.nombreCompleto).toBeTruthy();
        expect(errors.tipoDocumento).toBeTruthy();
        expect(errors.numeroDocumento).toBeTruthy();
        expect(errors.telefono).toBeTruthy();
    });

    it('validates email the same way as arrendador', () => {
        expect(validateArrendatario({ ...validArrendatario, email: 'bad' }).email).toBe('Correo inválido');
        expect(validateArrendatario({ ...validArrendatario, email: 'ok@test.co' }).email).toBeUndefined();
    });

    it('accepts Pasaporte as document type without errors', () => {
        const errors = validateArrendatario({ ...validArrendatario, tipoDocumento: 'Pasaporte' });
        expect(errors.tipoDocumento).toBeUndefined();
    });
});

// ── validateInmueble ──────────────────────────────────────────────────────────

describe('validateInmueble', () => {
    it('returns no errors for valid data', () => {
        expect(validateInmueble(validInmueble)).toEqual({});
    });

    it('requires tipoInmueble', () => {
        const errors = validateInmueble({ ...validInmueble, tipoInmueble: '' });
        expect(errors.tipoInmueble).toBeTruthy();
    });

    it('requires direccion', () => {
        const errors = validateInmueble({ ...validInmueble, direccion: '' });
        expect(errors.direccion).toBe('Campo requerido');
    });

    it('requires ciudad', () => {
        const errors = validateInmueble({ ...validInmueble, ciudad: '' });
        expect(errors.ciudad).toBe('Campo requerido');
    });

    it('requires departamento', () => {
        const errors = validateInmueble({ ...validInmueble, departamento: '' });
        expect(errors.departamento).toBeTruthy();
    });

    it('requires areaMq', () => {
        const errors = validateInmueble({ ...validInmueble, areaMq: '' });
        expect(errors.areaMq).toBe('Campo requerido');
    });

    it('accepts all 4 valid types', () => {
        const types = ['Apartamento', 'Casa', 'Local Comercial', 'Oficina'] as const;
        types.forEach((tipoInmueble) => {
            expect(validateInmueble({ ...validInmueble, tipoInmueble }).tipoInmueble).toBeUndefined();
        });
    });

    it('does not require propiedadHorizontal — it is always set', () => {
        const errors = validateInmueble({ ...validInmueble, propiedadHorizontal: false });
        expect(errors.propiedadHorizontal).toBeUndefined();
    });
});

// ── validateCondiciones ───────────────────────────────────────────────────────

describe('validateCondiciones', () => {
    it('returns no errors for valid vivienda data', () => {
        expect(validateCondiciones(validCondiciones, 'Apartamento')).toEqual({});
    });

    it('requires fechaInicio', () => {
        const errors = validateCondiciones({ ...validCondiciones, fechaInicio: '' }, 'Apartamento');
        expect(errors.fechaInicio).toBe('Campo requerido');
    });

    it('requires canonMensual', () => {
        const errors = validateCondiciones({ ...validCondiciones, canonMensual: '' }, 'Apartamento');
        expect(errors.canonMensual).toBe('Campo requerido');
    });

    it('requires depositoCOP', () => {
        const errors = validateCondiciones({ ...validCondiciones, depositoCOP: '' }, 'Apartamento');
        expect(errors.depositoCOP).toBe('Campo requerido');
    });

    describe('actividadComercial — conditional on Local Comercial', () => {
        it('requires actividadComercial for Local Comercial', () => {
            const errors = validateCondiciones(
                { ...validCondiciones, actividadComercial: '' },
                'Local Comercial',
            );
            expect(errors.actividadComercial).toBe('Campo requerido para local comercial');
        });

        it('does NOT require actividadComercial for Apartamento', () => {
            const errors = validateCondiciones(
                { ...validCondiciones, actividadComercial: '' },
                'Apartamento',
            );
            expect(errors.actividadComercial).toBeUndefined();
        });

        it('does NOT require actividadComercial for Casa', () => {
            const errors = validateCondiciones(
                { ...validCondiciones, actividadComercial: '' },
                'Casa',
            );
            expect(errors.actividadComercial).toBeUndefined();
        });

        it('does NOT require actividadComercial for Oficina', () => {
            const errors = validateCondiciones(
                { ...validCondiciones, actividadComercial: '' },
                'Oficina',
            );
            expect(errors.actividadComercial).toBeUndefined();
        });

        it('passes validation for Local Comercial when actividadComercial is provided', () => {
            const errors = validateCondiciones(
                { ...validCondiciones, actividadComercial: 'Restaurante' },
                'Local Comercial',
            );
            expect(errors.actividadComercial).toBeUndefined();
        });

        it('rejects whitespace-only actividadComercial for Local Comercial', () => {
            const errors = validateCondiciones(
                { ...validCondiciones, actividadComercial: '   ' },
                'Local Comercial',
            );
            expect(errors.actividadComercial).toBeTruthy();
        });
    });
});
