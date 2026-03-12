import { persistentAtom } from '@nanostores/persistent';
import type { PagareFormData } from '../components/pagare/types';
import { INITIAL_PAGARE_DATA, PAGARE_STEPS } from '../components/pagare/types';

function safeDecodeForm(raw: string): PagareFormData {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as PagareFormData;
    } catch {
        // fall through
    }
    return INITIAL_PAGARE_DATA;
}

function safeDecodeStep(maxStep: number) {
    return (raw: string): number => {
        const n = parseInt(raw, 10);
        if (isNaN(n) || n < 1 || n > maxStep) return 1;
        return n;
    };
}

export const $pagareFormData = persistentAtom<PagareFormData>('grexia_pag_form_v1', INITIAL_PAGARE_DATA, {
    encode: JSON.stringify,
    decode: safeDecodeForm,
});

export const $pagareStep = persistentAtom<number>('grexia_pag_step_v1', 1, {
    encode: String,
    decode: safeDecodeStep(PAGARE_STEPS.length),
});

export const $pagareMaxStep = persistentAtom<number>('grexia_pag_max_v1', 1, {
    encode: String,
    decode: safeDecodeStep(PAGARE_STEPS.length),
});
