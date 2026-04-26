import { describe, it, expect, beforeEach } from 'vitest';
import { $poderFormData, $poderStep, $poderMaxStep } from '../poder';
import { INITIAL_PODER_DATA } from '../../components/poder/types';

// ── Reset localStorage and stores antes de cada test ─────────────────────────

beforeEach(() => {
    localStorage.clear();
    $poderFormData.set(INITIAL_PODER_DATA);
    $poderStep.set(1);
    $poderMaxStep.set(1);
});

// ── $poderFormData ────────────────────────────────────────────────────────────

describe('$poderFormData', () => {
    it('inicia con INITIAL_PODER_DATA', () => {
        expect($poderFormData.get()).toEqual(INITIAL_PODER_DATA);
    });

    it('persiste cambios en localStorage', () => {
        const updated = {
            ...INITIAL_PODER_DATA,
            tipoProceso: 'proceso-laboral' as const,
        };
        $poderFormData.set(updated);
        const stored = localStorage.getItem('grexia_pod_form_v1');
        expect(stored).toBeTruthy();
        expect(JSON.parse(stored!)).toEqual(updated);
    });

    it('soporta lista dinámica de demandados', () => {
        const updated = {
            ...INITIAL_PODER_DATA,
            proceso: { demandados: ['A', 'B', 'C'], objetoPoder: '' },
        };
        $poderFormData.set(updated);
        expect($poderFormData.get().proceso.demandados).toEqual(['A', 'B', 'C']);
    });
});

// ── $poderStep ────────────────────────────────────────────────────────────────

describe('$poderStep', () => {
    it('inicia en 1', () => {
        expect($poderStep.get()).toBe(1);
    });

    it('acepta valores válidos (1-5)', () => {
        $poderStep.set(3);
        expect($poderStep.get()).toBe(3);
    });
});

// ── $poderMaxStep ─────────────────────────────────────────────────────────────

describe('$poderMaxStep', () => {
    it('inicia en 1', () => {
        expect($poderMaxStep.get()).toBe(1);
    });

    it('puede aumentar', () => {
        $poderMaxStep.set(4);
        expect($poderMaxStep.get()).toBe(4);
    });
});
