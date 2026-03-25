import { persistentAtom } from '@nanostores/persistent';
import type { CompraventaFormData } from '../components/compraventa/types';
import { INITIAL_COMPRAVENTA_DATA, COMPRAVENTA_STEPS } from '../components/compraventa/types';

function safeDecodeForm(raw: string): CompraventaFormData {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            const p = parsed as Record<string, unknown>;
            return {
                vendedor: { ...INITIAL_COMPRAVENTA_DATA.vendedor, ...(p.vendedor as object) },
                comprador: { ...INITIAL_COMPRAVENTA_DATA.comprador, ...(p.comprador as object) },
                inmueble: { ...INITIAL_COMPRAVENTA_DATA.inmueble, ...(p.inmueble as object) },
                tradicion: { ...INITIAL_COMPRAVENTA_DATA.tradicion, ...(p.tradicion as object) },
                economico: { ...INITIAL_COMPRAVENTA_DATA.economico, ...(p.economico as object) },
                escritura: { ...INITIAL_COMPRAVENTA_DATA.escritura, ...(p.escritura as object) },
            };
        }
    } catch {
        // fall through
    }
    return INITIAL_COMPRAVENTA_DATA;
}

function safeDecodeStep(maxStep: number) {
    return (raw: string): number => {
        const n = parseInt(raw, 10);
        if (isNaN(n) || n < 1 || n > maxStep) return 1;
        return n;
    };
}

export const $compraventaFormData = persistentAtom<CompraventaFormData>('grexia_cv_form_v1', INITIAL_COMPRAVENTA_DATA, {
    encode: JSON.stringify,
    decode: safeDecodeForm,
});

export const $compraventaStep = persistentAtom<number>('grexia_cv_step_v1', 1, {
    encode: String,
    decode: safeDecodeStep(COMPRAVENTA_STEPS.length),
});

export const $compraventaMaxStep = persistentAtom<number>('grexia_cv_max_v1', 1, {
    encode: String,
    decode: safeDecodeStep(COMPRAVENTA_STEPS.length),
});
