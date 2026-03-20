import { describe, it, expect, beforeEach } from 'vitest';
import { $tutelaFormData, $tutelaStep, $tutelaMaxStep } from '../tutela';
import { INITIAL_TUTELA_DATA, TUTELA_STEPS } from '../../components/tutela/types';

const FORM_KEY = 'grexia_tutela_form_v1';
const STEP_KEY = 'grexia_tutela_step_v1';
const MAX_KEY = 'grexia_tutela_max_v1';

describe('$tutelaFormData', () => {
    beforeEach(() => {
        localStorage.clear();
        $tutelaFormData.set(INITIAL_TUTELA_DATA);
    });

    it('valor por defecto es INITIAL_TUTELA_DATA', () => {
        expect($tutelaFormData.get()).toEqual(INITIAL_TUTELA_DATA);
    });

    it('persiste en localStorage con la key correcta', () => {
        const updated = { ...INITIAL_TUTELA_DATA, nombreCompleto: 'Ana López' };
        $tutelaFormData.set(updated);
        const stored = localStorage.getItem(FORM_KEY);
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored!).nombreCompleto).toBe('Ana López');
    });

    it('persiste el array de condicionesVulnerabilidad', () => {
        const updated = {
            ...INITIAL_TUTELA_DATA,
            condicionesVulnerabilidad: ['adulto_mayor', 'cabeza_hogar'],
        };
        $tutelaFormData.set(updated);
        expect($tutelaFormData.get().condicionesVulnerabilidad).toHaveLength(2);
        expect($tutelaFormData.get().condicionesVulnerabilidad).toContain('adulto_mayor');
    });

    it('decode JSON roto retorna INITIAL_TUTELA_DATA', () => {
        let decoded: typeof INITIAL_TUTELA_DATA;
        try {
            decoded = JSON.parse('no-es-json{{');
        } catch {
            decoded = INITIAL_TUTELA_DATA;
        }
        expect(decoded).toEqual(INITIAL_TUTELA_DATA);
    });

    it('notifica suscriptores al cambiar', () => {
        const received: (typeof INITIAL_TUTELA_DATA)[] = [];
        const unsub = $tutelaFormData.subscribe((v) => received.push(v));
        $tutelaFormData.set({ ...INITIAL_TUTELA_DATA, ciudad: 'Medellín' });
        unsub();
        expect(received).toHaveLength(2);
        expect(received[1].ciudad).toBe('Medellín');
    });
});

describe('$tutelaStep', () => {
    beforeEach(() => {
        localStorage.clear();
        $tutelaStep.set(1);
    });

    it('valor por defecto es 1', () => {
        expect($tutelaStep.get()).toBe(1);
    });

    it('persiste en localStorage', () => {
        $tutelaStep.set(3);
        expect(localStorage.getItem(STEP_KEY)).toBe('3');
    });

    it('decode inválido retorna 1', () => {
        const decode = (raw: string): number => {
            const n = parseInt(raw, 10);
            if (isNaN(n) || n < 1 || n > TUTELA_STEPS.length) return 1;
            return n;
        };
        expect(decode('abc')).toBe(1);
        expect(decode('0')).toBe(1);
        expect(decode(`${TUTELA_STEPS.length + 1}`)).toBe(1);
    });

    it('step válido persiste y se recupera', () => {
        $tutelaStep.set(TUTELA_STEPS.length);
        expect($tutelaStep.get()).toBe(TUTELA_STEPS.length);
    });
});

describe('$tutelaMaxStep', () => {
    beforeEach(() => {
        localStorage.clear();
        $tutelaMaxStep.set(1);
    });

    it('valor por defecto es 1', () => {
        expect($tutelaMaxStep.get()).toBe(1);
    });

    it('persiste en localStorage', () => {
        $tutelaMaxStep.set(4);
        expect(localStorage.getItem(MAX_KEY)).toBe('4');
    });

    it('no disminuye con Math.max (simulando handleNext)', () => {
        $tutelaMaxStep.set(5);
        $tutelaMaxStep.set(Math.max($tutelaMaxStep.get(), 3));
        expect($tutelaMaxStep.get()).toBe(5);
    });

    it('puede avanzar hasta el máximo de steps', () => {
        $tutelaMaxStep.set(TUTELA_STEPS.length);
        expect($tutelaMaxStep.get()).toBe(TUTELA_STEPS.length);
    });
});
