import type { InteresesFormData } from './types';

type Errors = Record<string, string>;

export function validateObligacion(data: InteresesFormData): Errors {
    const e: Errors = {};
    if (!data.capital.trim() || parseInt(data.capital, 10) <= 0) {
        e.capital = 'El capital debe ser mayor a cero.';
    }
    if (!data.tipoInteres) {
        e.tipoInteres = 'Selecciona el tipo de interés.';
    }
    if (!data.fechaIniciaMora) {
        e.fechaIniciaMora = 'La fecha de inicio de mora es requerida.';
    }
    if (!data.fechaPago) {
        e.fechaPago = 'La fecha de pago es requerida.';
    }
    if (data.fechaIniciaMora && data.fechaPago && data.fechaPago < data.fechaIniciaMora) {
        e.fechaPago = 'La fecha de pago debe ser igual o posterior a la fecha de inicio de mora.';
    }
    return e;
}

export function hasErrors(errors: Errors): boolean {
    return Object.values(errors).some((v) => v.length > 0);
}
