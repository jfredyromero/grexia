import type { AcreedorData, DeudorData, ObligacionData } from './types';

type Errors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAcreedor(data: AcreedorData): Errors {
    const e: Errors = {};
    if (!data.nombreCompleto.trim()) e.nombreCompleto = 'El nombre es requerido.';
    if (!data.tipoDocumento) e.tipoDocumento = 'Selecciona un tipo de documento.';
    if (!data.numeroDocumento.trim()) e.numeroDocumento = 'El número de documento es requerido.';
    if (!data.telefono.trim()) e.telefono = 'El teléfono es requerido.';
    if (data.email && !EMAIL_REGEX.test(data.email)) e.email = 'Correo electrónico inválido.';
    return e;
}

export function validateDeudor(data: DeudorData): Errors {
    const e: Errors = {};
    if (!data.nombreCompleto.trim()) e.nombreCompleto = 'El nombre es requerido.';
    if (!data.tipoDocumento) e.tipoDocumento = 'Selecciona un tipo de documento.';
    if (!data.numeroDocumento.trim()) e.numeroDocumento = 'El número de documento es requerido.';
    if (!data.telefono.trim()) e.telefono = 'El teléfono es requerido.';
    if (data.email && !EMAIL_REGEX.test(data.email)) e.email = 'Correo electrónico inválido.';
    if (!data.ciudadResidencia.trim()) e.ciudadResidencia = 'La ciudad de residencia es requerida.';
    return e;
}

export function validateObligacion(data: ObligacionData): Errors {
    const e: Errors = {};
    if (!data.valorPrincipal.trim()) e.valorPrincipal = 'El valor es requerido.';
    if (!data.fechaSuscripcion) e.fechaSuscripcion = 'La fecha de suscripción es requerida.';
    if (!data.modalidadPago) e.modalidadPago = 'Selecciona la modalidad de pago.';
    if (data.modalidadPago === 'unico' && !data.fechaVencimiento) {
        e.fechaVencimiento = 'La fecha de vencimiento es requerida.';
    }
    if (data.modalidadPago === 'cuotas') {
        if (!data.numeroCuotas.trim()) e.numeroCuotas = 'El número de cuotas es requerido.';
        if (!data.periodoCuotas) e.periodoCuotas = 'Selecciona el período de las cuotas.';
    }
    if (!data.ciudadSuscripcion.trim()) e.ciudadSuscripcion = 'La ciudad de suscripción es requerida.';
    return e;
}

export function hasErrors(errors: Errors): boolean {
    return Object.values(errors).some((v) => v.length > 0);
}
