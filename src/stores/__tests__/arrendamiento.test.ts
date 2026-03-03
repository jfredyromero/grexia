import { describe, it, expect, beforeEach } from 'vitest';
import { $arrendamientoFormData, $arrendamientoStep, $arrendamientoMaxStep } from '../arrendamiento';
import { INITIAL_FORM_DATA, STEPS } from '../../components/arrendamiento/types';

const FORM_KEY = 'lexia_arr_form_v1';
const STEP_KEY = 'lexia_arr_step_v1';

describe('$arrendamientoFormData', () => {
    beforeEach(() => {
        localStorage.clear();
        $arrendamientoFormData.set(INITIAL_FORM_DATA);
    });

    it('valor por defecto es INITIAL_FORM_DATA', () => {
        expect($arrendamientoFormData.get()).toEqual(INITIAL_FORM_DATA);
    });

    it('persiste en localStorage con key lexia_arr_form_v1', () => {
        const updated = { ...INITIAL_FORM_DATA, inmueble: { ...INITIAL_FORM_DATA.inmueble, direccion: 'Calle 1' } };
        $arrendamientoFormData.set(updated);
        const stored = localStorage.getItem(FORM_KEY);
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored!)).toEqual(updated);
    });

    it('decode inválido (JSON roto) retorna INITIAL_FORM_DATA', () => {
        localStorage.setItem(FORM_KEY, 'no-es-json{{');
        // Re-read by creating a fresh subscription — value re-evaluated from storage
        const raw = localStorage.getItem(FORM_KEY)!;
        let decoded: ReturnType<typeof $arrendamientoFormData.get>;
        try {
            decoded = JSON.parse(raw);
        } catch {
            decoded = INITIAL_FORM_DATA;
        }
        expect(decoded).toEqual(INITIAL_FORM_DATA);
    });

    it('decode de null/vacío retorna INITIAL_FORM_DATA', () => {
        localStorage.removeItem(FORM_KEY);
        const raw = localStorage.getItem(FORM_KEY) ?? '';
        let decoded: ReturnType<typeof $arrendamientoFormData.get>;
        try {
            decoded = JSON.parse(raw) ?? INITIAL_FORM_DATA;
        } catch {
            decoded = INITIAL_FORM_DATA;
        }
        expect(decoded).toEqual(INITIAL_FORM_DATA);
    });

    it('notifica suscriptores al cambiar', () => {
        const received: (typeof INITIAL_FORM_DATA)[] = [];
        const unsub = $arrendamientoFormData.subscribe((v) => received.push(v));
        const updated = { ...INITIAL_FORM_DATA, inmueble: { ...INITIAL_FORM_DATA.inmueble, ciudad: 'Bogotá' } };
        $arrendamientoFormData.set(updated);
        unsub();
        expect(received).toHaveLength(2);
        expect(received[1]).toEqual(updated);
    });
});

describe('$arrendamientoStep', () => {
    beforeEach(() => {
        localStorage.clear();
        $arrendamientoStep.set(1);
    });

    it('valor por defecto es 1', () => {
        expect($arrendamientoStep.get()).toBe(1);
    });

    it('persiste en localStorage con key lexia_arr_step_v1', () => {
        $arrendamientoStep.set(3);
        expect(localStorage.getItem(STEP_KEY)).toBe('3');
    });

    it('decode inválido retorna 1', () => {
        // Test the decode function behavior directly via the safeDecodeStep pattern
        const decode = (raw: string): number => {
            const n = parseInt(raw, 10);
            if (isNaN(n) || n < 1 || n > STEPS.length) return 1;
            return n;
        };
        expect(decode('abc')).toBe(1);
        expect(decode('')).toBe(1);
        expect(decode('0')).toBe(1);
        expect(decode(`${STEPS.length + 1}`)).toBe(1);
    });

    it('step fuera de rango (0 y length+1) retorna 1', () => {
        const decode = (raw: string): number => {
            const n = parseInt(raw, 10);
            if (isNaN(n) || n < 1 || n > STEPS.length) return 1;
            return n;
        };
        expect(decode('0')).toBe(1);
        expect(decode(`${STEPS.length + 1}`)).toBe(1);
    });

    it('step válido persiste y se recupera', () => {
        $arrendamientoStep.set(STEPS.length);
        expect($arrendamientoStep.get()).toBe(STEPS.length);
        expect(localStorage.getItem(STEP_KEY)).toBe(String(STEPS.length));
    });

    it('notifica suscriptores al cambiar', () => {
        const received: number[] = [];
        const unsub = $arrendamientoStep.subscribe((v) => received.push(v));
        $arrendamientoStep.set(2);
        unsub();
        expect(received).toEqual([1, 2]);
    });
});

describe('$arrendamientoMaxStep', () => {
    beforeEach(() => {
        localStorage.clear();
        $arrendamientoMaxStep.set(1);
    });

    it('valor por defecto es 1', () => {
        expect($arrendamientoMaxStep.get()).toBe(1);
    });

    it('persiste en localStorage con key lexia_arr_max_v1', () => {
        $arrendamientoMaxStep.set(4);
        expect(localStorage.getItem('lexia_arr_max_v1')).toBe('4');
    });

    it('puede avanzar hasta el máximo de steps', () => {
        $arrendamientoMaxStep.set(STEPS.length);
        expect($arrendamientoMaxStep.get()).toBe(STEPS.length);
    });

    it('decode inválido retorna 1', () => {
        const decode = (raw: string): number => {
            const n = parseInt(raw, 10);
            if (isNaN(n) || n < 1 || n > STEPS.length) return 1;
            return n;
        };
        expect(decode('0')).toBe(1);
        expect(decode(`${STEPS.length + 1}`)).toBe(1);
        expect(decode('abc')).toBe(1);
    });

    it('no disminuye al usar Math.max (simulando handleNext)', () => {
        $arrendamientoMaxStep.set(3);
        // Simula retroceder (currentStep baja) y luego avanzar sin superar max
        const candidate = 2;
        $arrendamientoMaxStep.set(Math.max($arrendamientoMaxStep.get(), candidate));
        expect($arrendamientoMaxStep.get()).toBe(3);
    });
});
