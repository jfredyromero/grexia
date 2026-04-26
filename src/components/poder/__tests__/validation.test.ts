import { describe, it, expect } from 'vitest';
import { validateTipoProceso, validatePoderdante, validateApoderado, validateProceso, hasErrors } from '../validation';
import type { PoderdanteData, ApoderadoData, ProcesoData } from '../types';

// ── Fixtures válidos ──────────────────────────────────────────────────────────

const poderdanteSinInmueble: PoderdanteData = {
    nombreCompleto: 'Andres Ramirez',
    ccPoderdante: '1098765432',
    lugarExpedicionPoderdante: 'Bogota',
    ciudadPoderdante: 'Bogota',
    direccionInmueble: '',
    matriculaInmobiliaria: '',
};

const poderdanteConInmueble: PoderdanteData = {
    ...poderdanteSinInmueble,
    direccionInmueble: 'Calle 100 No. 15-20',
    matriculaInmobiliaria: '050C-1234567',
};

const apoderadoValido: ApoderadoData = {
    nombreCompleto: 'Camila Lopez',
    ccApoderado: '52345678',
    lugarExpedicionApoderado: 'Medellin',
    ciudadApoderado: 'Medellin',
    tarjetaProfesional: '123456',
};

const procesoConDemandados: ProcesoData = {
    demandados: ['Demandado Uno'],
    objetoPoder: '',
};

const procesoConObjeto: ProcesoData = {
    demandados: [''],
    objetoPoder: 'Adelantar la escrituración del inmueble.',
};

// ── validateTipoProceso ───────────────────────────────────────────────────────

describe('validateTipoProceso', () => {
    it('falla si no se seleccionó tipo', () => {
        const e = validateTipoProceso('');
        expect(e.tipoProceso).toBeTruthy();
    });

    it('pasa para declaracion-pertenencia', () => {
        expect(hasErrors(validateTipoProceso('declaracion-pertenencia'))).toBe(false);
    });

    it('pasa para tramites-notariales', () => {
        expect(hasErrors(validateTipoProceso('tramites-notariales'))).toBe(false);
    });
});

// ── validatePoderdante (sin inmueble) ─────────────────────────────────────────

describe('validatePoderdante — sin inmueble', () => {
    it('pasa con datos completos', () => {
        expect(hasErrors(validatePoderdante(poderdanteSinInmueble, false))).toBe(false);
    });

    it('falla si nombreCompleto está vacío', () => {
        const e = validatePoderdante({ ...poderdanteSinInmueble, nombreCompleto: '' }, false);
        expect(e.nombreCompleto).toBeTruthy();
    });

    it('falla si ccPoderdante está vacío', () => {
        const e = validatePoderdante({ ...poderdanteSinInmueble, ccPoderdante: '' }, false);
        expect(e.ccPoderdante).toBeTruthy();
    });

    it('falla si lugarExpedicionPoderdante está vacío', () => {
        const e = validatePoderdante({ ...poderdanteSinInmueble, lugarExpedicionPoderdante: '' }, false);
        expect(e.lugarExpedicionPoderdante).toBeTruthy();
    });

    it('falla si ciudadPoderdante está vacía', () => {
        const e = validatePoderdante({ ...poderdanteSinInmueble, ciudadPoderdante: '' }, false);
        expect(e.ciudadPoderdante).toBeTruthy();
    });

    it('NO requiere direccionInmueble cuando hasInmueble === false', () => {
        const e = validatePoderdante({ ...poderdanteSinInmueble, direccionInmueble: '' }, false);
        expect(e.direccionInmueble).toBeUndefined();
    });
});

// ── validatePoderdante (con inmueble) ─────────────────────────────────────────

describe('validatePoderdante — con inmueble', () => {
    it('pasa con datos completos incluyendo inmueble', () => {
        expect(hasErrors(validatePoderdante(poderdanteConInmueble, true))).toBe(false);
    });

    it('falla si direccionInmueble está vacía', () => {
        const e = validatePoderdante({ ...poderdanteConInmueble, direccionInmueble: '' }, true);
        expect(e.direccionInmueble).toBeTruthy();
    });

    it('falla si matriculaInmobiliaria está vacía', () => {
        const e = validatePoderdante({ ...poderdanteConInmueble, matriculaInmobiliaria: '' }, true);
        expect(e.matriculaInmobiliaria).toBeTruthy();
    });
});

// ── validateApoderado ─────────────────────────────────────────────────────────

describe('validateApoderado', () => {
    it('pasa con datos completos', () => {
        expect(hasErrors(validateApoderado(apoderadoValido))).toBe(false);
    });

    it('falla si nombreCompleto está vacío', () => {
        const e = validateApoderado({ ...apoderadoValido, nombreCompleto: '' });
        expect(e.nombreCompleto).toBeTruthy();
    });

    it('falla si ccApoderado está vacío', () => {
        const e = validateApoderado({ ...apoderadoValido, ccApoderado: '' });
        expect(e.ccApoderado).toBeTruthy();
    });

    it('falla si tarjetaProfesional está vacía', () => {
        const e = validateApoderado({ ...apoderadoValido, tarjetaProfesional: '' });
        expect(e.tarjetaProfesional).toBeTruthy();
    });

    it('falla si lugarExpedicionApoderado está vacío', () => {
        const e = validateApoderado({ ...apoderadoValido, lugarExpedicionApoderado: '' });
        expect(e.lugarExpedicionApoderado).toBeTruthy();
    });

    it('falla si ciudadApoderado está vacía', () => {
        const e = validateApoderado({ ...apoderadoValido, ciudadApoderado: '' });
        expect(e.ciudadApoderado).toBeTruthy();
    });
});

// ── validateProceso (con demandados) ──────────────────────────────────────────

describe('validateProceso — con demandados', () => {
    it('pasa con al menos un demandado válido', () => {
        expect(hasErrors(validateProceso(procesoConDemandados, true))).toBe(false);
    });

    it('pasa con varios demandados', () => {
        const e = validateProceso({ demandados: ['A', 'B', 'C'], objetoPoder: '' }, true);
        expect(hasErrors(e)).toBe(false);
    });

    it('falla si la lista de demandados está vacía', () => {
        const e = validateProceso({ demandados: [], objetoPoder: '' }, true);
        expect(e.demandados).toBeTruthy();
    });

    it('falla si todos los demandados son strings vacíos', () => {
        const e = validateProceso({ demandados: ['', '   '], objetoPoder: '' }, true);
        expect(e.demandados).toBeTruthy();
    });

    it('NO requiere objetoPoder cuando hasDemandados', () => {
        const e = validateProceso({ demandados: ['Uno'], objetoPoder: '' }, true);
        expect(e.objetoPoder).toBeUndefined();
    });
});

// ── validateProceso (sin demandados) ──────────────────────────────────────────

describe('validateProceso — sin demandados', () => {
    it('pasa con objeto del poder no vacío', () => {
        expect(hasErrors(validateProceso(procesoConObjeto, false))).toBe(false);
    });

    it('falla si objetoPoder está vacío', () => {
        const e = validateProceso({ demandados: [''], objetoPoder: '' }, false);
        expect(e.objetoPoder).toBeTruthy();
    });

    it('falla si objetoPoder solo tiene espacios', () => {
        const e = validateProceso({ demandados: [''], objetoPoder: '    ' }, false);
        expect(e.objetoPoder).toBeTruthy();
    });

    it('NO requiere demandados cuando !hasDemandados', () => {
        const e = validateProceso({ demandados: [], objetoPoder: 'Algo' }, false);
        expect(e.demandados).toBeUndefined();
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
