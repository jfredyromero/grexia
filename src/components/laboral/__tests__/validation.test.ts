import { describe, it, expect } from 'vitest';
import {
    validateTipoContrato,
    validateEmpleador,
    validateTrabajador,
    validateCondicionesTerminoFijo,
    validateCondicionesObraLabor,
    hasErrors,
} from '../validation';
import type { EmpleadorData, TrabajadorData, CondicionesTerminoFijo, CondicionesObraLabor } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const empleadorValido: EmpleadorData = {
    nombreCompleto: 'Carlos García',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567890',
    ciudad: 'Bogotá D.C.',
    direccion: 'Calle 100 No. 15-20',
};

const trabajadorValido: TrabajadorData = {
    nombreCompleto: 'María López',
    tipoDocumento: 'CC',
    numeroDocumento: '9876543210',
    ciudad: 'Bogotá D.C.',
    direccion: 'Carrera 15 No. 80-22',
};

const condicionesTerminoFijoValidas: CondicionesTerminoFijo = {
    cargo: 'Analista de Sistemas',
    salario: '3500000',
    frecuenciaPago: 'mensual',
    metodoPago: 'efectivo',
    cuentaBancaria: '',
    jornada: 'lunes-viernes-8-5',
    lugarPrestacion: 'Calle 100 No. 15-20, Bogotá D.C.',
    duracionNumero: '6',
    duracionUnidad: 'meses',
};

const condicionesObraLaborValidas: CondicionesObraLabor = {
    descripcionObra: 'Construcción de edificio de 5 pisos',
    oficio: 'Maestro de obra',
    salario: '2500000',
    modalidadPago: 'mensual',
    lugar: 'Carrera 70 No. 10-15, Medellín',
};

// ── validateTipoContrato ──────────────────────────────────────────────────────

describe('validateTipoContrato', () => {
    it('falla si no se seleccionó tipo', () => {
        const e = validateTipoContrato('');
        expect(e.tipoContrato).toBeTruthy();
    });

    it('pasa para termino-fijo', () => {
        expect(hasErrors(validateTipoContrato('termino-fijo'))).toBe(false);
    });

    it('pasa para obra-labor', () => {
        expect(hasErrors(validateTipoContrato('obra-labor'))).toBe(false);
    });
});

// ── validateEmpleador ─────────────────────────────────────────────────────────

describe('validateEmpleador', () => {
    it('pasa con datos completos', () => {
        expect(hasErrors(validateEmpleador(empleadorValido))).toBe(false);
    });

    it('falla si nombreCompleto está vacío', () => {
        const e = validateEmpleador({ ...empleadorValido, nombreCompleto: '' });
        expect(e.nombreCompleto).toBeTruthy();
    });

    it('falla si tipoDocumento está vacío', () => {
        const e = validateEmpleador({ ...empleadorValido, tipoDocumento: '' });
        expect(e.tipoDocumento).toBeTruthy();
    });

    it('falla si numeroDocumento está vacío', () => {
        const e = validateEmpleador({ ...empleadorValido, numeroDocumento: '' });
        expect(e.numeroDocumento).toBeTruthy();
    });

    it('falla si ciudad está vacía', () => {
        const e = validateEmpleador({ ...empleadorValido, ciudad: '' });
        expect(e.ciudad).toBeTruthy();
    });

    it('falla si dirección está vacía', () => {
        const e = validateEmpleador({ ...empleadorValido, direccion: '' });
        expect(e.direccion).toBeTruthy();
    });

    it('acepta NIT como tipo de documento', () => {
        const e = validateEmpleador({ ...empleadorValido, tipoDocumento: 'NIT' });
        expect(e.tipoDocumento).toBeUndefined();
    });
});

// ── validateTrabajador ────────────────────────────────────────────────────────

describe('validateTrabajador', () => {
    it('pasa con datos completos', () => {
        expect(hasErrors(validateTrabajador(trabajadorValido))).toBe(false);
    });

    it('falla si nombreCompleto está vacío', () => {
        const e = validateTrabajador({ ...trabajadorValido, nombreCompleto: '' });
        expect(e.nombreCompleto).toBeTruthy();
    });

    it('falla si tipoDocumento está vacío', () => {
        const e = validateTrabajador({ ...trabajadorValido, tipoDocumento: '' });
        expect(e.tipoDocumento).toBeTruthy();
    });

    it('falla si ciudad está vacía', () => {
        const e = validateTrabajador({ ...trabajadorValido, ciudad: '' });
        expect(e.ciudad).toBeTruthy();
    });

    it('falla si dirección está vacía', () => {
        const e = validateTrabajador({ ...trabajadorValido, direccion: '' });
        expect(e.direccion).toBeTruthy();
    });
});

// ── validateCondicionesTerminoFijo ────────────────────────────────────────────

describe('validateCondicionesTerminoFijo', () => {
    it('pasa con datos completos (efectivo)', () => {
        expect(hasErrors(validateCondicionesTerminoFijo(condicionesTerminoFijoValidas))).toBe(false);
    });

    it('falla si cargo está vacío', () => {
        const e = validateCondicionesTerminoFijo({ ...condicionesTerminoFijoValidas, cargo: '' });
        expect(e.cargo).toBeTruthy();
    });

    it('falla si salario está vacío', () => {
        const e = validateCondicionesTerminoFijo({ ...condicionesTerminoFijoValidas, salario: '' });
        expect(e.salario).toBeTruthy();
    });

    it('falla si frecuenciaPago no está seleccionado', () => {
        const e = validateCondicionesTerminoFijo({ ...condicionesTerminoFijoValidas, frecuenciaPago: '' });
        expect(e.frecuenciaPago).toBeTruthy();
    });

    it('falla si metodoPago no está seleccionado', () => {
        const e = validateCondicionesTerminoFijo({ ...condicionesTerminoFijoValidas, metodoPago: '' });
        expect(e.metodoPago).toBeTruthy();
    });

    it('falla si metodoPago es transferencia y cuentaBancaria está vacía', () => {
        const e = validateCondicionesTerminoFijo({
            ...condicionesTerminoFijoValidas,
            metodoPago: 'transferencia',
            cuentaBancaria: '',
        });
        expect(e.cuentaBancaria).toBeTruthy();
    });

    it('pasa si metodoPago es transferencia y cuentaBancaria está completa', () => {
        const e = validateCondicionesTerminoFijo({
            ...condicionesTerminoFijoValidas,
            metodoPago: 'transferencia',
            cuentaBancaria: '1234567890',
        });
        expect(e.cuentaBancaria).toBeUndefined();
    });

    it('no requiere cuentaBancaria si metodoPago es efectivo', () => {
        const e = validateCondicionesTerminoFijo({
            ...condicionesTerminoFijoValidas,
            metodoPago: 'efectivo',
            cuentaBancaria: '',
        });
        expect(e.cuentaBancaria).toBeUndefined();
    });

    it('genera error especial para jornada "otro"', () => {
        const e = validateCondicionesTerminoFijo({ ...condicionesTerminoFijoValidas, jornada: 'otro' });
        expect(e.jornada).toContain('asesoría');
    });

    it('falla si jornada no está seleccionada', () => {
        const e = validateCondicionesTerminoFijo({ ...condicionesTerminoFijoValidas, jornada: '' });
        expect(e.jornada).toBeTruthy();
    });

    it('falla si lugarPrestacion está vacío', () => {
        const e = validateCondicionesTerminoFijo({ ...condicionesTerminoFijoValidas, lugarPrestacion: '' });
        expect(e.lugarPrestacion).toBeTruthy();
    });

    it('falla si duracionNumero está vacío', () => {
        const e = validateCondicionesTerminoFijo({ ...condicionesTerminoFijoValidas, duracionNumero: '' });
        expect(e.duracionNumero).toBeTruthy();
    });

    it('falla si duracionUnidad no está seleccionada', () => {
        const e = validateCondicionesTerminoFijo({ ...condicionesTerminoFijoValidas, duracionUnidad: '' });
        expect(e.duracionUnidad).toBeTruthy();
    });
});

// ── validateCondicionesObraLabor ──────────────────────────────────────────────

describe('validateCondicionesObraLabor', () => {
    it('pasa con datos completos', () => {
        expect(hasErrors(validateCondicionesObraLabor(condicionesObraLaborValidas))).toBe(false);
    });

    it('falla si descripcionObra está vacía', () => {
        const e = validateCondicionesObraLabor({ ...condicionesObraLaborValidas, descripcionObra: '' });
        expect(e.descripcionObra).toBeTruthy();
    });

    it('falla si oficio está vacío', () => {
        const e = validateCondicionesObraLabor({ ...condicionesObraLaborValidas, oficio: '' });
        expect(e.oficio).toBeTruthy();
    });

    it('falla si salario está vacío', () => {
        const e = validateCondicionesObraLabor({ ...condicionesObraLaborValidas, salario: '' });
        expect(e.salario).toBeTruthy();
    });

    it('falla si modalidadPago está vacía', () => {
        const e = validateCondicionesObraLabor({ ...condicionesObraLaborValidas, modalidadPago: '' });
        expect(e.modalidadPago).toBeTruthy();
    });

    it('falla si lugar está vacío', () => {
        const e = validateCondicionesObraLabor({ ...condicionesObraLaborValidas, lugar: '' });
        expect(e.lugar).toBeTruthy();
    });
});

// ── hasErrors ─────────────────────────────────────────────────────────────────

describe('hasErrors', () => {
    it('retorna false para objeto vacío', () => {
        expect(hasErrors({})).toBe(false);
    });

    it('retorna true si hay al menos un error', () => {
        expect(hasErrors({ campo: 'Requerido' })).toBe(true);
    });

    it('retorna false si todos los valores son string vacío', () => {
        expect(hasErrors({ campo: '' })).toBe(false);
    });
});
