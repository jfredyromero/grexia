import { describe, it, expect } from 'vitest';
import {
    validateVendedor,
    validateComprador,
    validateInmueble,
    validateTradicion,
    validateEconomico,
    validateEscritura,
    hasErrors,
} from '../validation';
import type { VendedorData, CompradorData, InmuebleData, TradicionData, EconomicoData, EscrituraData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const validVendedor: VendedorData = {
    nombre: 'Juan Carlos Gomez',
    cc: '1234567890',
    ccExpedidaEn: 'Bogota',
    departamento: 'Bogota',
    ciudad: 'Bogota D.C.',
};

const validComprador: CompradorData = {
    nombre: 'Maria Lopez',
    cc: '9876543210',
    ccExpedidaEn: 'Medellin',
    departamento: 'Antioquia',
    ciudad: 'Medellin',
};

const validInmueble: InmuebleData = {
    direccion: 'Calle 100 #15-20 Apto 501',
    departamento: 'Cundinamarca',
    ciudad: 'Bogota',
    area: '85',
    linderoNorte: 'Apto 502',
    linderoSur: 'Zona comun',
    linderoOriente: 'Fachada',
    linderoOccidente: 'Apto 503',
    matricula: '50N-12345678',
    cedulaCatastral: '01-02-0304-0005-000',
};

const validTradicion: TradicionData = {
    tipoActo: 'COMPRAVENTA',
    escrituraNro: '1234',
    notaria: 'Notaria 15 de Bogota',
    folioMatricula: '50N-12345678',
    ciudadRegistro: 'Bogota',
};

const validEconomico: EconomicoData = {
    precioTotal: '350000000',
    precioIncluyeDescripcion: '',
    formaDePago: 'Pago de contado al momento de la firma de escritura publica',
    arrasValor: '35000000',
    clausulaPenalValor: '35000000',
};

const validEscritura: EscrituraData = {
    notaria: 'Notaria 15 de Bogota',
    fecha: '2026-06-15',
    gastosDistribucion: 'por partes iguales entre comprador y vendedor',
    domicilioDepartamento: 'Bogota',
    domicilioCiudad: 'Bogota D.C.',
    incluyeTestigo: false,
    testigoNombre: '',
    testigoCC: '',
};

// ── hasErrors ─────────────────────────────────────────────────────────────────

describe('hasErrors', () => {
    it('returns false for empty object', () => {
        expect(hasErrors({})).toBe(false);
    });

    it('returns true when there is at least one error', () => {
        expect(hasErrors({ nombre: 'El nombre del vendedor es requerido.' })).toBe(true);
    });

    it('returns false when all error values are empty strings', () => {
        expect(hasErrors({ nombre: '', cc: '' })).toBe(false);
    });
});

// ── validateVendedor ──────────────────────────────────────────────────────────

describe('validateVendedor', () => {
    it('retorna {} para datos validos', () => {
        expect(hasErrors(validateVendedor(validVendedor))).toBe(false);
    });

    it('nombre vacio genera error', () => {
        const e = validateVendedor({ ...validVendedor, nombre: '' });
        expect(e.nombre).toBeDefined();
    });

    it('cc vacia genera error', () => {
        const e = validateVendedor({ ...validVendedor, cc: '' });
        expect(e.cc).toBeDefined();
    });

    it('ccExpedidaEn vacia genera error', () => {
        const e = validateVendedor({ ...validVendedor, ccExpedidaEn: '' });
        expect(e.ccExpedidaEn).toBeDefined();
    });

    it('ciudad vacia genera error', () => {
        const e = validateVendedor({ ...validVendedor, ciudad: '' });
        expect(e.ciudad).toBeDefined();
    });

    it('todos los campos vacios generan todos los errores', () => {
        const e = validateVendedor({ nombre: '', cc: '', ccExpedidaEn: '', departamento: '', ciudad: '' });
        expect(Object.keys(e).length).toBe(4);
    });
});

// ── validateComprador ─────────────────────────────────────────────────────────

describe('validateComprador', () => {
    it('retorna {} para datos validos', () => {
        expect(hasErrors(validateComprador(validComprador))).toBe(false);
    });

    it('nombre vacio genera error', () => {
        const e = validateComprador({ ...validComprador, nombre: '' });
        expect(e.nombre).toBeDefined();
    });

    it('cc vacia genera error', () => {
        const e = validateComprador({ ...validComprador, cc: '' });
        expect(e.cc).toBeDefined();
    });

    it('ccExpedidaEn vacia genera error', () => {
        const e = validateComprador({ ...validComprador, ccExpedidaEn: '' });
        expect(e.ccExpedidaEn).toBeDefined();
    });

    it('ciudad vacia genera error', () => {
        const e = validateComprador({ ...validComprador, ciudad: '' });
        expect(e.ciudad).toBeDefined();
    });
});

// ── validateInmueble ──────────────────────────────────────────────────────────

describe('validateInmueble', () => {
    it('retorna {} para datos validos', () => {
        expect(hasErrors(validateInmueble(validInmueble))).toBe(false);
    });

    it('direccion vacia genera error', () => {
        const e = validateInmueble({ ...validInmueble, direccion: '' });
        expect(e.direccion).toBeDefined();
    });

    it('ciudad vacia genera error', () => {
        const e = validateInmueble({ ...validInmueble, ciudad: '' });
        expect(e.ciudad).toBeDefined();
    });

    it('area vacia genera error', () => {
        const e = validateInmueble({ ...validInmueble, area: '' });
        expect(e.area).toBeDefined();
    });

    it('linderoNorte vacio genera error', () => {
        const e = validateInmueble({ ...validInmueble, linderoNorte: '' });
        expect(e.linderoNorte).toBeDefined();
    });

    it('linderoSur vacio genera error', () => {
        const e = validateInmueble({ ...validInmueble, linderoSur: '' });
        expect(e.linderoSur).toBeDefined();
    });

    it('linderoOriente vacio genera error', () => {
        const e = validateInmueble({ ...validInmueble, linderoOriente: '' });
        expect(e.linderoOriente).toBeDefined();
    });

    it('linderoOccidente vacio genera error', () => {
        const e = validateInmueble({ ...validInmueble, linderoOccidente: '' });
        expect(e.linderoOccidente).toBeDefined();
    });

    it('matricula vacia genera error', () => {
        const e = validateInmueble({ ...validInmueble, matricula: '' });
        expect(e.matricula).toBeDefined();
    });

    it('cedulaCatastral vacia genera error', () => {
        const e = validateInmueble({ ...validInmueble, cedulaCatastral: '' });
        expect(e.cedulaCatastral).toBeDefined();
    });

    it('todos los campos vacios generan 9 errores', () => {
        const e = validateInmueble({
            direccion: '',
            departamento: '',
            ciudad: '',
            area: '',
            linderoNorte: '',
            linderoSur: '',
            linderoOriente: '',
            linderoOccidente: '',
            matricula: '',
            cedulaCatastral: '',
        });
        expect(Object.keys(e).length).toBe(9);
    });
});

// ── validateTradicion ─────────────────────────────────────────────────────────

describe('validateTradicion', () => {
    it('retorna {} para datos validos', () => {
        expect(hasErrors(validateTradicion(validTradicion))).toBe(false);
    });

    it('tipoActo vacio genera error', () => {
        const e = validateTradicion({ ...validTradicion, tipoActo: '' });
        expect(e.tipoActo).toBeDefined();
    });

    it('escrituraNro vacia genera error', () => {
        const e = validateTradicion({ ...validTradicion, escrituraNro: '' });
        expect(e.escrituraNro).toBeDefined();
    });

    it('notaria vacia genera error', () => {
        const e = validateTradicion({ ...validTradicion, notaria: '' });
        expect(e.notaria).toBeDefined();
    });

    it('folioMatricula vacio genera error', () => {
        const e = validateTradicion({ ...validTradicion, folioMatricula: '' });
        expect(e.folioMatricula).toBeDefined();
    });

    it('ciudadRegistro vacia genera error', () => {
        const e = validateTradicion({ ...validTradicion, ciudadRegistro: '' });
        expect(e.ciudadRegistro).toBeDefined();
    });
});

// ── validateEconomico ─────────────────────────────────────────────────────────

describe('validateEconomico', () => {
    it('retorna {} para datos validos', () => {
        expect(hasErrors(validateEconomico(validEconomico))).toBe(false);
    });

    it('precioTotal vacio genera error', () => {
        const e = validateEconomico({ ...validEconomico, precioTotal: '' });
        expect(e.precioTotal).toBeDefined();
    });

    it('formaDePago vacia genera error', () => {
        const e = validateEconomico({ ...validEconomico, formaDePago: '' });
        expect(e.formaDePago).toBeDefined();
    });

    it('arrasValor vacio genera error', () => {
        const e = validateEconomico({ ...validEconomico, arrasValor: '' });
        expect(e.arrasValor).toBeDefined();
    });

    it('clausulaPenalValor vacio genera error', () => {
        const e = validateEconomico({ ...validEconomico, clausulaPenalValor: '' });
        expect(e.clausulaPenalValor).toBeDefined();
    });

    it('precioIncluyeDescripcion vacia NO genera error (es opcional)', () => {
        const e = validateEconomico({ ...validEconomico, precioIncluyeDescripcion: '' });
        expect(e.precioIncluyeDescripcion).toBeUndefined();
    });
});

// ── validateEscritura ─────────────────────────────────────────────────────────

describe('validateEscritura', () => {
    it('retorna {} para datos validos sin testigo', () => {
        expect(hasErrors(validateEscritura(validEscritura))).toBe(false);
    });

    it('notaria vacia genera error', () => {
        const e = validateEscritura({ ...validEscritura, notaria: '' });
        expect(e.notaria).toBeDefined();
    });

    it('fecha vacia genera error', () => {
        const e = validateEscritura({ ...validEscritura, fecha: '' });
        expect(e.fecha).toBeDefined();
    });

    it('gastosDistribucion vacia genera error', () => {
        const e = validateEscritura({ ...validEscritura, gastosDistribucion: '' });
        expect(e.gastosDistribucion).toBeDefined();
    });

    it('domicilioCiudad vacia genera error', () => {
        const e = validateEscritura({ ...validEscritura, domicilioCiudad: '' });
        expect(e.domicilioCiudad).toBeDefined();
    });

    it('con testigo activo, nombre vacio genera error', () => {
        const e = validateEscritura({ ...validEscritura, incluyeTestigo: true, testigoNombre: '', testigoCC: '123' });
        expect(e.testigoNombre).toBeDefined();
    });

    it('con testigo activo, cc vacia genera error', () => {
        const e = validateEscritura({ ...validEscritura, incluyeTestigo: true, testigoNombre: 'Pedro', testigoCC: '' });
        expect(e.testigoCC).toBeDefined();
    });

    it('sin testigo, nombre y cc vacios NO generan error', () => {
        const e = validateEscritura({
            ...validEscritura,
            incluyeTestigo: false,
            testigoNombre: '',
            testigoCC: '',
        });
        expect(e.testigoNombre).toBeUndefined();
        expect(e.testigoCC).toBeUndefined();
    });

    it('con testigo completo, retorna {} (sin errores)', () => {
        const e = validateEscritura({
            ...validEscritura,
            incluyeTestigo: true,
            testigoNombre: 'Pedro Perez',
            testigoCC: '1111222333',
        });
        expect(hasErrors(e)).toBe(false);
    });
});
