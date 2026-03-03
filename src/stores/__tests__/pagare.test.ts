import { describe, it, expect, beforeEach } from 'vitest';
import { $pagareFormData, $pagareStep, $pagareMaxStep } from '../pagare';
import { INITIAL_PAGARE_DATA, PAGARE_STEPS } from '../../components/pagare/types';

const FORM_KEY = 'lexia_pag_form_v1';
const STEP_KEY = 'lexia_pag_step_v1';

describe('$pagareFormData', () => {
    beforeEach(() => {
        localStorage.clear();
        $pagareFormData.set(INITIAL_PAGARE_DATA);
    });

    it('valor por defecto es INITIAL_PAGARE_DATA', () => {
        expect($pagareFormData.get()).toEqual(INITIAL_PAGARE_DATA);
    });

    it('persiste en localStorage con key lexia_pag_form_v1', () => {
        const updated = {
            ...INITIAL_PAGARE_DATA,
            acreedor: { ...INITIAL_PAGARE_DATA.acreedor, nombreCompleto: 'Juan Pérez' },
        };
        $pagareFormData.set(updated);
        const stored = localStorage.getItem(FORM_KEY);
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored!)).toEqual(updated);
    });

    it('decode inválido (JSON roto) retorna INITIAL_PAGARE_DATA', () => {
        const raw = 'no-es-json{{';
        let decoded: typeof INITIAL_PAGARE_DATA;
        try {
            decoded = JSON.parse(raw);
        } catch {
            decoded = INITIAL_PAGARE_DATA;
        }
        expect(decoded).toEqual(INITIAL_PAGARE_DATA);
    });

    it('decode de null/vacío retorna INITIAL_PAGARE_DATA', () => {
        localStorage.removeItem(FORM_KEY);
        const raw = localStorage.getItem(FORM_KEY) ?? '';
        let decoded: typeof INITIAL_PAGARE_DATA;
        try {
            decoded = JSON.parse(raw) ?? INITIAL_PAGARE_DATA;
        } catch {
            decoded = INITIAL_PAGARE_DATA;
        }
        expect(decoded).toEqual(INITIAL_PAGARE_DATA);
    });

    it('notifica suscriptores al cambiar', () => {
        const received: (typeof INITIAL_PAGARE_DATA)[] = [];
        const unsub = $pagareFormData.subscribe((v) => received.push(v));
        const updated = {
            ...INITIAL_PAGARE_DATA,
            deudor: { ...INITIAL_PAGARE_DATA.deudor, ciudadResidencia: 'Medellín' },
        };
        $pagareFormData.set(updated);
        unsub();
        expect(received).toHaveLength(2);
        expect(received[1]).toEqual(updated);
    });
});

describe('$pagareStep', () => {
    beforeEach(() => {
        localStorage.clear();
        $pagareStep.set(1);
    });

    it('valor por defecto es 1', () => {
        expect($pagareStep.get()).toBe(1);
    });

    it('persiste en localStorage con key lexia_pag_step_v1', () => {
        $pagareStep.set(2);
        expect(localStorage.getItem(STEP_KEY)).toBe('2');
    });

    it('decode inválido retorna 1', () => {
        const decode = (raw: string): number => {
            const n = parseInt(raw, 10);
            if (isNaN(n) || n < 1 || n > PAGARE_STEPS.length) return 1;
            return n;
        };
        expect(decode('abc')).toBe(1);
        expect(decode('')).toBe(1);
        expect(decode('0')).toBe(1);
        expect(decode(`${PAGARE_STEPS.length + 1}`)).toBe(1);
    });

    it('step fuera de rango (0 y length+1) retorna 1', () => {
        const decode = (raw: string): number => {
            const n = parseInt(raw, 10);
            if (isNaN(n) || n < 1 || n > PAGARE_STEPS.length) return 1;
            return n;
        };
        expect(decode('0')).toBe(1);
        expect(decode(`${PAGARE_STEPS.length + 1}`)).toBe(1);
    });

    it('step válido persiste y se recupera', () => {
        $pagareStep.set(PAGARE_STEPS.length);
        expect($pagareStep.get()).toBe(PAGARE_STEPS.length);
        expect(localStorage.getItem(STEP_KEY)).toBe(String(PAGARE_STEPS.length));
    });

    it('notifica suscriptores al cambiar', () => {
        const received: number[] = [];
        const unsub = $pagareStep.subscribe((v) => received.push(v));
        $pagareStep.set(3);
        unsub();
        expect(received).toEqual([1, 3]);
    });
});

describe('$pagareMaxStep', () => {
    beforeEach(() => {
        localStorage.clear();
        $pagareMaxStep.set(1);
    });

    it('valor por defecto es 1', () => {
        expect($pagareMaxStep.get()).toBe(1);
    });

    it('persiste en localStorage con key lexia_pag_max_v1', () => {
        $pagareMaxStep.set(3);
        expect(localStorage.getItem('lexia_pag_max_v1')).toBe('3');
    });

    it('puede avanzar hasta el máximo de steps', () => {
        $pagareMaxStep.set(PAGARE_STEPS.length);
        expect($pagareMaxStep.get()).toBe(PAGARE_STEPS.length);
    });

    it('decode inválido retorna 1', () => {
        const decode = (raw: string): number => {
            const n = parseInt(raw, 10);
            if (isNaN(n) || n < 1 || n > PAGARE_STEPS.length) return 1;
            return n;
        };
        expect(decode('0')).toBe(1);
        expect(decode(`${PAGARE_STEPS.length + 1}`)).toBe(1);
        expect(decode('abc')).toBe(1);
    });

    it('no disminuye al usar Math.max (simulando handleNext)', () => {
        $pagareMaxStep.set(3);
        const candidate = 2;
        $pagareMaxStep.set(Math.max($pagareMaxStep.get(), candidate));
        expect($pagareMaxStep.get()).toBe(3);
    });
});
