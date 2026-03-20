import { persistentAtom } from '@nanostores/persistent';
import type { TutelaFormData } from '../components/tutela/types';
import { INITIAL_TUTELA_DATA, TUTELA_STEPS } from '../components/tutela/types';

function safeDecodeForm(raw: string): TutelaFormData {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as TutelaFormData;
    } catch {
        // fall through
    }
    return INITIAL_TUTELA_DATA;
}

function safeDecodeStep(maxStep: number) {
    return (raw: string): number => {
        const n = parseInt(raw, 10);
        if (isNaN(n) || n < 1 || n > maxStep) return 1;
        return n;
    };
}

export const $tutelaFormData = persistentAtom<TutelaFormData>('grexia_tutela_form_v1', INITIAL_TUTELA_DATA, {
    encode: JSON.stringify,
    decode: safeDecodeForm,
});

export const $tutelaStep = persistentAtom<number>('grexia_tutela_step_v1', 1, {
    encode: String,
    decode: safeDecodeStep(TUTELA_STEPS.length),
});

export const $tutelaMaxStep = persistentAtom<number>('grexia_tutela_max_v1', 1, {
    encode: String,
    decode: safeDecodeStep(TUTELA_STEPS.length),
});
