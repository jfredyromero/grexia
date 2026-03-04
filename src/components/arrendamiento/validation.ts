import type { ArrendadorData, ArrendatarioData, CoarrendatarioData, InmuebleData, CondicionesData, TipoInmueble } from './types';

export type ValidationErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Arrendador ────────────────────────────────────────────────────────────────

export function validateArrendador(data: ArrendadorData): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!data.nombreCompleto.trim()) errors.nombreCompleto = 'Campo requerido';
    if (!data.tipoDocumento) errors.tipoDocumento = 'Selecciona el tipo de documento';
    if (!data.numeroDocumento.trim()) errors.numeroDocumento = 'Campo requerido';
    if (!data.telefono.trim()) errors.telefono = 'Campo requerido';
    if (data.email && !EMAIL_RE.test(data.email)) errors.email = 'Correo inválido';
    return errors;
}

// ── Arrendatario ──────────────────────────────────────────────────────────────

export function validateArrendatario(data: ArrendatarioData): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!data.nombreCompleto.trim()) errors.nombreCompleto = 'Campo requerido';
    if (!data.tipoDocumento) errors.tipoDocumento = 'Selecciona el tipo de documento';
    if (!data.numeroDocumento.trim()) errors.numeroDocumento = 'Campo requerido';
    if (!data.telefono.trim()) errors.telefono = 'Campo requerido';
    if (data.email && !EMAIL_RE.test(data.email)) errors.email = 'Correo inválido';
    return errors;
}

// ── Coarrendatario ────────────────────────────────────────────────────────────

export function validateCoarrendatario(data: CoarrendatarioData): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!data.nombreCompleto.trim()) errors.nombreCompleto = 'Campo requerido';
    if (!data.tipoDocumento) errors.tipoDocumento = 'Selecciona el tipo de documento';
    if (!data.numeroDocumento.trim()) errors.numeroDocumento = 'Campo requerido';
    if (!data.telefono.trim()) errors.telefono = 'Campo requerido';
    if (data.email && !EMAIL_RE.test(data.email)) errors.email = 'Correo inválido';
    return errors;
}

// ── Inmueble ──────────────────────────────────────────────────────────────────

export function validateInmueble(data: InmuebleData): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!data.tipoInmueble) errors.tipoInmueble = 'Selecciona el tipo de inmueble';
    if (!data.direccion.trim()) errors.direccion = 'Campo requerido';
    if (!data.ciudad.trim()) errors.ciudad = 'Campo requerido';
    if (!data.departamento) errors.departamento = 'Selecciona el departamento';
    if (!data.areaMq.trim()) errors.areaMq = 'Campo requerido';
    return errors;
}

// ── Condiciones ───────────────────────────────────────────────────────────────

export function validateCondiciones(data: CondicionesData, tipoInmueble: TipoInmueble | ''): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!data.fechaInicio) errors.fechaInicio = 'Campo requerido';
    if (!data.canonMensual.trim()) errors.canonMensual = 'Campo requerido';
    if (!data.depositoCOP.trim()) errors.depositoCOP = 'Campo requerido';
    if (tipoInmueble === 'Local Comercial' && !data.actividadComercial.trim()) {
        errors.actividadComercial = 'Campo requerido para local comercial';
    }
    return errors;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function hasErrors(errors: ValidationErrors): boolean {
    return Object.keys(errors).length > 0;
}
