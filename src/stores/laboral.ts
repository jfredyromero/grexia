import { persistentAtom } from '@nanostores/persistent';
import type { LaboralFormData } from '../components/laboral/types';
import { INITIAL_LABORAL_DATA, LABORAL_STEPS } from '../components/laboral/types';

function safeDecodeForm(raw: string): LaboralFormData {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as LaboralFormData;
    } catch {
        // fall through
    }
    return INITIAL_LABORAL_DATA;
}

function safeDecodeStep(maxStep: number) {
    return (raw: string): number => {
        const n = parseInt(raw, 10);
        if (isNaN(n) || n < 1 || n > maxStep) return 1;
        return n;
    };
}

export const $laboralFormData = persistentAtom<LaboralFormData>('grexia_lab_form_v1', INITIAL_LABORAL_DATA, {
    encode: JSON.stringify,
    decode: safeDecodeForm,
});

export const $laboralStep = persistentAtom<number>('grexia_lab_step_v1', 1, {
    encode: String,
    decode: safeDecodeStep(LABORAL_STEPS.length),
});

export const $laboralMaxStep = persistentAtom<number>('grexia_lab_max_v1', 1, {
    encode: String,
    decode: safeDecodeStep(LABORAL_STEPS.length),
});
