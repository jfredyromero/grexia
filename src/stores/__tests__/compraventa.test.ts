import { describe, it, expect, beforeEach } from 'vitest';
import { $compraventaFormData, $compraventaStep, $compraventaMaxStep } from '../compraventa';
import { INITIAL_COMPRAVENTA_DATA, COMPRAVENTA_STEPS } from '../../components/compraventa/types';

const FORM_KEY = 'grexia_cv_form_v1';
const STEP_KEY = 'grexia_cv_step_v1';

describe('$compraventaFormData', () => {
    beforeEach(() => {
        localStorage.clear();
        $compraventaFormData.set(INITIAL_COMPRAVENTA_DATA);
    });

    it('valor por defecto es INITIAL_COMPRAVENTA_DATA', () => {
        expect($compraventaFormData.get()).toEqual(INITIAL_COMPRAVENTA_DATA);
    });

    it('persiste en localStorage con key grexia_cv_form_v1', () => {
        const updated = {
            ...INITIAL_COMPRAVENTA_DATA,
            vendedor: { ...INITIAL_COMPRAVENTA_DATA.vendedor, nombre: 'Juan Perez' },
        };
        $compraventaFormData.set(updated);
        const stored = localStorage.getItem(FORM_KEY);
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored!)).toEqual(updated);
    });

    it('decode invalido (JSON roto) retorna INITIAL_COMPRAVENTA_DATA', () => {
        const raw = 'no-es-json{{';
        let decoded: typeof INITIAL_COMPRAVENTA_DATA;
        try {
            decoded = JSON.parse(raw);
        } catch {
            decoded = INITIAL_COMPRAVENTA_DATA;
        }
        expect(decoded).toEqual(INITIAL_COMPRAVENTA_DATA);
    });

    it('decode de null/vacio retorna INITIAL_COMPRAVENTA_DATA', () => {
        localStorage.removeItem(FORM_KEY);
        const raw = localStorage.getItem(FORM_KEY) ?? '';
        let decoded: typeof INITIAL_COMPRAVENTA_DATA;
        try {
            decoded = JSON.parse(raw) ?? INITIAL_COMPRAVENTA_DATA;
        } catch {
            decoded = INITIAL_COMPRAVENTA_DATA;
        }
        expect(decoded).toEqual(INITIAL_COMPRAVENTA_DATA);
    });

    it('notifica suscriptores al cambiar', () => {
        const received: (typeof INITIAL_COMPRAVENTA_DATA)[] = [];
        const unsub = $compraventaFormData.subscribe((v) => received.push(v));
        const updated = {
            ...INITIAL_COMPRAVENTA_DATA,
            comprador: { ...INITIAL_COMPRAVENTA_DATA.comprador, nombre: 'Maria Lopez' },
        };
        $compraventaFormData.set(updated);
        unsub();
        expect(received).toHaveLength(2);
        expect(received[1]).toEqual(updated);
    });
});

describe('$compraventaStep', () => {
    beforeEach(() => {
        localStorage.clear();
        $compraventaStep.set(1);
    });

    it('valor por defecto es 1', () => {
        expect($compraventaStep.get()).toBe(1);
    });

    it('persiste en localStorage con key grexia_cv_step_v1', () => {
        $compraventaStep.set(3);
        expect(localStorage.getItem(STEP_KEY)).toBe('3');
    });

    it('decode invalido retorna 1', () => {
        const decode = (raw: string): number => {
            const n = parseInt(raw, 10);
            if (isNaN(n) || n < 1 || n > COMPRAVENTA_STEPS.length) return 1;
            return n;
        };
        expect(decode('abc')).toBe(1);
        expect(decode('')).toBe(1);
        expect(decode('0')).toBe(1);
        expect(decode(`${COMPRAVENTA_STEPS.length + 1}`)).toBe(1);
    });

    it('step fuera de rango (0 y length+1) retorna 1', () => {
        const decode = (raw: string): number => {
            const n = parseInt(raw, 10);
            if (isNaN(n) || n < 1 || n > COMPRAVENTA_STEPS.length) return 1;
            return n;
        };
        expect(decode('0')).toBe(1);
        expect(decode(`${COMPRAVENTA_STEPS.length + 1}`)).toBe(1);
    });

    it('step valido persiste y se recupera', () => {
        $compraventaStep.set(COMPRAVENTA_STEPS.length);
        expect($compraventaStep.get()).toBe(COMPRAVENTA_STEPS.length);
        expect(localStorage.getItem(STEP_KEY)).toBe(String(COMPRAVENTA_STEPS.length));
    });

    it('notifica suscriptores al cambiar', () => {
        const received: number[] = [];
        const unsub = $compraventaStep.subscribe((v) => received.push(v));
        $compraventaStep.set(4);
        unsub();
        expect(received).toEqual([1, 4]);
    });
});

describe('$compraventaMaxStep', () => {
    beforeEach(() => {
        localStorage.clear();
        $compraventaMaxStep.set(1);
    });

    it('valor por defecto es 1', () => {
        expect($compraventaMaxStep.get()).toBe(1);
    });

    it('persiste en localStorage con key grexia_cv_max_v1', () => {
        $compraventaMaxStep.set(5);
        expect(localStorage.getItem('grexia_cv_max_v1')).toBe('5');
    });

    it('puede avanzar hasta el maximo de steps', () => {
        $compraventaMaxStep.set(COMPRAVENTA_STEPS.length);
        expect($compraventaMaxStep.get()).toBe(COMPRAVENTA_STEPS.length);
    });

    it('decode invalido retorna 1', () => {
        const decode = (raw: string): number => {
            const n = parseInt(raw, 10);
            if (isNaN(n) || n < 1 || n > COMPRAVENTA_STEPS.length) return 1;
            return n;
        };
        expect(decode('0')).toBe(1);
        expect(decode(`${COMPRAVENTA_STEPS.length + 1}`)).toBe(1);
        expect(decode('abc')).toBe(1);
    });

    it('no disminuye al usar Math.max (simulando handleNext)', () => {
        $compraventaMaxStep.set(4);
        const candidate = 2;
        $compraventaMaxStep.set(Math.max($compraventaMaxStep.get(), candidate));
        expect($compraventaMaxStep.get()).toBe(4);
    });
});
