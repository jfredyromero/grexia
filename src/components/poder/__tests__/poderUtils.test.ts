import { describe, it, expect } from 'vitest';
import {
    formatLugarYFecha,
    cleanDemandados,
    formatDemandadosLista,
    addDemandado,
    removeDemandado,
    updateDemandado,
} from '../poderUtils';
import { tipoProcesoHasInmueble, tipoProcesoHasDemandados, getTipoProcesoConfig } from '../types';

// ── formatLugarYFecha ─────────────────────────────────────────────────────────

describe('formatLugarYFecha', () => {
    it('formatea ciudad + mes en letras + año', () => {
        const fecha = new Date(2024, 5, 15); // 15 de junio de 2024
        const r = formatLugarYFecha('Bogotá D.C.', fecha);
        expect(r).toContain('Bogotá D.C.');
        expect(r.toLowerCase()).toContain('junio');
        expect(r).toContain('2024');
    });

    it('mes enero', () => {
        const fecha = new Date(2024, 0, 1);
        const r = formatLugarYFecha('Medellin', fecha);
        expect(r.toLowerCase()).toContain('enero');
    });

    it('mes diciembre', () => {
        const fecha = new Date(2024, 11, 31);
        const r = formatLugarYFecha('Cali', fecha);
        expect(r.toLowerCase()).toContain('diciembre');
    });

    it('placeholder si ciudad está vacía', () => {
        const fecha = new Date(2024, 5, 15);
        const r = formatLugarYFecha('', fecha);
        expect(r).toContain('___________________');
    });
});

// ── cleanDemandados ───────────────────────────────────────────────────────────

describe('cleanDemandados', () => {
    it('elimina strings vacíos', () => {
        expect(cleanDemandados(['A', '', 'B'])).toEqual(['A', 'B']);
    });

    it('elimina strings con solo espacios', () => {
        expect(cleanDemandados(['A', '   ', 'B'])).toEqual(['A', 'B']);
    });

    it('hace trim a cada nombre', () => {
        expect(cleanDemandados(['  Carlos  ', 'Ana'])).toEqual(['Carlos', 'Ana']);
    });

    it('retorna [] si todos están vacíos', () => {
        expect(cleanDemandados(['', '   ', ''])).toEqual([]);
    });
});

// ── formatDemandadosLista ─────────────────────────────────────────────────────

describe('formatDemandadosLista', () => {
    it('un demandado', () => {
        expect(formatDemandadosLista(['Pedro'])).toBe('Pedro');
    });

    it('dos demandados', () => {
        expect(formatDemandadosLista(['Pedro', 'Pablo'])).toBe('Pedro y Pablo');
    });

    it('tres demandados separados por coma y "y" final', () => {
        expect(formatDemandadosLista(['A', 'B', 'C'])).toBe('A, B y C');
    });

    it('placeholder si lista vacía', () => {
        expect(formatDemandadosLista([])).toContain('___');
    });

    it('ignora strings vacíos al formatear', () => {
        expect(formatDemandadosLista(['A', '', 'B'])).toBe('A y B');
    });
});

// ── addDemandado ──────────────────────────────────────────────────────────────

describe('addDemandado', () => {
    it('agrega un demandado al final', () => {
        expect(addDemandado(['A', 'B'])).toEqual(['A', 'B', '']);
    });

    it('respeta el límite máximo (no agrega si ya hay 10)', () => {
        const max10 = Array(10).fill('X');
        expect(addDemandado(max10)).toEqual(max10);
    });
});

// ── removeDemandado ───────────────────────────────────────────────────────────

describe('removeDemandado', () => {
    it('elimina el demandado en el índice dado', () => {
        expect(removeDemandado(['A', 'B', 'C'], 1)).toEqual(['A', 'C']);
    });

    it('no permite quedarse con lista vacía: deja [""]', () => {
        expect(removeDemandado(['Solo'], 0)).toEqual(['']);
    });
});

// ── updateDemandado ───────────────────────────────────────────────────────────

describe('updateDemandado', () => {
    it('actualiza el demandado en el índice dado', () => {
        expect(updateDemandado(['A', 'B'], 0, 'Nuevo')).toEqual(['Nuevo', 'B']);
    });

    it('retorna copia inmutable', () => {
        const arr = ['A', 'B'];
        const r = updateDemandado(arr, 1, 'Z');
        expect(r).not.toBe(arr);
        expect(arr).toEqual(['A', 'B']);
    });
});

// ── Helpers de configuración del tipo de proceso ─────────────────────────────

describe('tipoProcesoHasInmueble', () => {
    it('declaracion-pertenencia → true', () => {
        expect(tipoProcesoHasInmueble('declaracion-pertenencia')).toBe(true);
    });

    it('proceso-laboral → false', () => {
        expect(tipoProcesoHasInmueble('proceso-laboral')).toBe(false);
    });

    it('tramites-notariales → true', () => {
        expect(tipoProcesoHasInmueble('tramites-notariales')).toBe(true);
    });

    it('vacío → false', () => {
        expect(tipoProcesoHasInmueble('')).toBe(false);
    });
});

describe('tipoProcesoHasDemandados', () => {
    it('declaracion-pertenencia → true', () => {
        expect(tipoProcesoHasDemandados('declaracion-pertenencia')).toBe(true);
    });

    it('tramites-notariales → false', () => {
        expect(tipoProcesoHasDemandados('tramites-notariales')).toBe(false);
    });

    it('administracion-bienes → false', () => {
        expect(tipoProcesoHasDemandados('administracion-bienes')).toBe(false);
    });

    it('vacío → false', () => {
        expect(tipoProcesoHasDemandados('')).toBe(false);
    });
});

describe('getTipoProcesoConfig', () => {
    it('retorna config completa', () => {
        const cfg = getTipoProcesoConfig('proceso-laboral');
        expect(cfg).not.toBeNull();
        expect(cfg!.label).toBe('Proceso Laboral');
        expect(cfg!.labelDocumento).toBe('PROCESO LABORAL');
    });

    it('retorna null para tipo vacío', () => {
        expect(getTipoProcesoConfig('')).toBeNull();
    });
});
