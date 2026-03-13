import { persistentAtom } from '@nanostores/persistent';
import type { InteresesFormData } from '../components/intereses/types';
import { INITIAL_INTERESES_DATA, INTERESES_STEPS } from '../components/intereses/types';

function safeDecodeForm(raw: string): InteresesFormData {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as InteresesFormData;
    } catch {
        // fall through
    }
    return INITIAL_INTERESES_DATA;
}

function safeDecodeStep(maxStep: number) {
    return (raw: string): number => {
        const n = parseInt(raw, 10);
        if (isNaN(n) || n < 1 || n > maxStep) return 1;
        return n;
    };
}

export const $interesesFormData = persistentAtom<InteresesFormData>('grexia_int_form_v1', INITIAL_INTERESES_DATA, {
    encode: JSON.stringify,
    decode: safeDecodeForm,
});

export const $interesesStep = persistentAtom<number>('grexia_int_step_v1', 1, {
    encode: String,
    decode: safeDecodeStep(INTERESES_STEPS.length),
});

export const $interesesMaxStep = persistentAtom<number>('grexia_int_max_v1', 1, {
    encode: String,
    decode: safeDecodeStep(INTERESES_STEPS.length),
});
