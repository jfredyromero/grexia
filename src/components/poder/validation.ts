import type { TipoProceso, PoderdanteData, ApoderadoData, ProcesoData } from './types';

type Errors = Record<string, string>;

// ── Step 1: Tipo de proceso ──────────────────────────────────────────────────

export function validateTipoProceso(tipoProceso: TipoProceso | ''): Errors {
    const e: Errors = {};
    if (!tipoProceso) e.tipoProceso = 'Selecciona el tipo de proceso.';
    return e;
}

// ── Step 2: Poderdante ───────────────────────────────────────────────────────

export function validatePoderdante(data: PoderdanteData, hasInmueble: boolean): Errors {
    const e: Errors = {};
    if (!data.nombreCompleto.trim()) e.nombreCompleto = 'El nombre completo es requerido.';
    if (!data.ccPoderdante.trim()) e.ccPoderdante = 'El número de cédula es requerido.';
    if (!data.lugarExpedicionPoderdante.trim()) {
        e.lugarExpedicionPoderdante = 'El lugar de expedición de la cédula es requerido.';
    }
    if (!data.ciudadPoderdante.trim()) e.ciudadPoderdante = 'La ciudad de domicilio es requerida.';

    if (hasInmueble) {
        if (!data.direccionInmueble.trim()) e.direccionInmueble = 'La dirección del inmueble es requerida.';
        if (!data.matriculaInmobiliaria.trim()) {
            e.matriculaInmobiliaria = 'La matrícula inmobiliaria es requerida.';
        }
    }

    return e;
}

// ── Step 3: Apoderado ────────────────────────────────────────────────────────

export function validateApoderado(data: ApoderadoData): Errors {
    const e: Errors = {};
    if (!data.nombreCompleto.trim()) e.nombreCompleto = 'El nombre completo del apoderado es requerido.';
    if (!data.ccApoderado.trim()) e.ccApoderado = 'El número de cédula del apoderado es requerido.';
    if (!data.lugarExpedicionApoderado.trim()) {
        e.lugarExpedicionApoderado = 'El lugar de expedición de la cédula es requerido.';
    }
    if (!data.ciudadApoderado.trim()) e.ciudadApoderado = 'La ciudad de residencia es requerida.';
    if (!data.tarjetaProfesional.trim()) e.tarjetaProfesional = 'El número de Tarjeta Profesional es requerido.';
    return e;
}

// ── Step 4: Proceso ──────────────────────────────────────────────────────────

export function validateProceso(data: ProcesoData, hasDemandados: boolean): Errors {
    const e: Errors = {};

    if (hasDemandados) {
        const valid = data.demandados.filter((d) => d.trim().length > 0);
        if (valid.length === 0) e.demandados = 'Indica al menos un demandado.';
    } else {
        if (!data.objetoPoder.trim()) e.objetoPoder = 'Describe el objeto del poder.';
    }

    return e;
}

// ── Helper ────────────────────────────────────────────────────────────────────

export function hasErrors(errors: Errors): boolean {
    return Object.values(errors).some((v) => v.length > 0);
}
