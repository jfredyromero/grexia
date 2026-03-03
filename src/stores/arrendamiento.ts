import { persistentAtom } from '@nanostores/persistent';
import type { ArrendamientoFormData } from '../components/arrendamiento/types';
import { INITIAL_FORM_DATA, STEPS } from '../components/arrendamiento/types';

function safeDecodeForm(raw: string): ArrendamientoFormData {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as ArrendamientoFormData;
    } catch {
        // fall through
    }
    return INITIAL_FORM_DATA;
}

function safeDecodeStep(maxStep: number) {
    return (raw: string): number => {
        const n = parseInt(raw, 10);
        if (isNaN(n) || n < 1 || n > maxStep) return 1;
        return n;
    };
}

export const $arrendamientoFormData = persistentAtom<ArrendamientoFormData>('lexia_arr_form_v1', INITIAL_FORM_DATA, {
    encode: JSON.stringify,
    decode: safeDecodeForm,
});

export const $arrendamientoStep = persistentAtom<number>('lexia_arr_step_v1', 1, {
    encode: String,
    decode: safeDecodeStep(STEPS.length),
});

export const $arrendamientoMaxStep = persistentAtom<number>('lexia_arr_max_v1', 1, {
    encode: String,
    decode: safeDecodeStep(STEPS.length),
});
