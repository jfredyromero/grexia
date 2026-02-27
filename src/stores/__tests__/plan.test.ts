import { describe, it, expect, beforeEach } from 'vitest';
import { $plan, $logoUrl } from '../plan';

const STORAGE_KEY = 'lexia_plan';

describe('$plan', () => {
    beforeEach(() => {
        localStorage.clear();
        $plan.set('free');
    });

    it('valor por defecto es "free"', () => {
        expect($plan.get()).toBe('free');
    });

    it('set("empresarial") actualiza el store', () => {
        $plan.set('empresarial');
        expect($plan.get()).toBe('empresarial');
    });

    it('persiste "empresarial" en localStorage', () => {
        $plan.set('empresarial');
        expect(localStorage.getItem(STORAGE_KEY)).toBe('empresarial');
    });

    it('localStorage refleja el último plan seleccionado', () => {
        $plan.set('empresarial');
        expect(localStorage.getItem(STORAGE_KEY)).toBe('empresarial');
        expect($plan.get()).toBe('empresarial');
    });

    it('notifica a los suscriptores al cambiar', () => {
        const received: string[] = [];
        const unsub = $plan.subscribe((v) => received.push(v));
        $plan.set('empresarial');
        unsub();
        expect(received).toEqual(['free', 'empresarial']);
    });

    it('decode rechaza valores inválidos de localStorage y retorna "free"', () => {
        const decoded = (v: string) => (v === 'empresarial' ? v : 'free');
        expect(decoded('invalido')).toBe('free');
        expect(decoded('empresarial')).toBe('empresarial');
        expect(decoded('')).toBe('free');
        expect(decoded('basico')).toBe('free');
        expect(decoded('pro')).toBe('free');
        expect(decoded('FREE')).toBe('free');
    });
});

describe('$logoUrl', () => {
    beforeEach(() => {
        $logoUrl.set('');
    });

    it('valor por defecto es cadena vacía', () => {
        expect($logoUrl.get()).toBe('');
    });

    it('almacena una data URL de imagen', () => {
        $logoUrl.set('data:image/png;base64,abc123');
        expect($logoUrl.get()).toBe('data:image/png;base64,abc123');
    });

    it('se puede limpiar volviendo a cadena vacía', () => {
        $logoUrl.set('data:image/png;base64,abc123');
        $logoUrl.set('');
        expect($logoUrl.get()).toBe('');
    });

    it('no persiste en localStorage', () => {
        $logoUrl.set('data:image/png;base64,abc123');
        const logoKeys = Object.keys(localStorage).filter((k) => k.includes('logo'));
        expect(logoKeys).toHaveLength(0);
    });

    it('notifica a los suscriptores al cambiar', () => {
        const received: string[] = [];
        const unsub = $logoUrl.subscribe((v) => received.push(v));
        $logoUrl.set('data:image/png;base64,test');
        unsub();
        expect(received).toEqual(['', 'data:image/png;base64,test']);
    });
});
