import { persistentAtom } from '@nanostores/persistent';
import type { PoderFormData } from '../components/poder/types';
import { INITIAL_PODER_DATA, PODER_STEPS } from '../components/poder/types';

function safeDecodeForm(raw: string): PoderFormData {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as PoderFormData;
    } catch {
        // fall through
    }
    return INITIAL_PODER_DATA;
}

function safeDecodeStep(maxStep: number) {
    return (raw: string): number => {
        const n = parseInt(raw, 10);
        if (isNaN(n) || n < 1 || n > maxStep) return 1;
        return n;
    };
}

export const $poderFormData = persistentAtom<PoderFormData>('grexia_pod_form_v1', INITIAL_PODER_DATA, {
    encode: JSON.stringify,
    decode: safeDecodeForm,
});

export const $poderStep = persistentAtom<number>('grexia_pod_step_v1', 1, {
    encode: String,
    decode: safeDecodeStep(PODER_STEPS.length),
});

export const $poderMaxStep = persistentAtom<number>('grexia_pod_max_v1', 1, {
    encode: String,
    decode: safeDecodeStep(PODER_STEPS.length),
});
