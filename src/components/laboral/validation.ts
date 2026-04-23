import type {
    TipoContrato,
    EmpleadorData,
    TrabajadorData,
    CondicionesTerminoFijo,
    CondicionesObraLabor,
} from './types';

type Errors = Record<string, string>;

export function validateTipoContrato(tipoContrato: TipoContrato | ''): Errors {
    const e: Errors = {};
    if (!tipoContrato) e.tipoContrato = 'Selecciona el tipo de contrato.';
    return e;
}

export function validateEmpleador(data: EmpleadorData): Errors {
    const e: Errors = {};
    if (!data.nombreCompleto.trim()) e.nombreCompleto = 'El nombre o razón social es requerido.';
    if (!data.tipoDocumento) e.tipoDocumento = 'Selecciona el tipo de documento.';
    if (!data.numeroDocumento.trim()) e.numeroDocumento = 'El número de documento es requerido.';
    if (!data.ciudad.trim()) e.ciudad = 'La ciudad es requerida.';
    if (!data.direccion.trim()) e.direccion = 'La dirección es requerida.';
    return e;
}

export function validateTrabajador(data: TrabajadorData): Errors {
    const e: Errors = {};
    if (!data.nombreCompleto.trim()) e.nombreCompleto = 'El nombre completo es requerido.';
    if (!data.tipoDocumento) e.tipoDocumento = 'Selecciona el tipo de documento.';
    if (!data.numeroDocumento.trim()) e.numeroDocumento = 'El número de documento es requerido.';
    if (!data.ciudad.trim()) e.ciudad = 'La ciudad es requerida.';
    if (!data.direccion.trim()) e.direccion = 'La dirección es requerida.';
    return e;
}

export function validateCondicionesTerminoFijo(data: CondicionesTerminoFijo): Errors {
    const e: Errors = {};
    if (!data.cargo.trim()) e.cargo = 'El cargo es requerido.';
    if (!data.salario.trim()) e.salario = 'El salario es requerido.';
    if (!data.frecuenciaPago) e.frecuenciaPago = 'Selecciona la frecuencia de pago.';
    if (!data.metodoPago) e.metodoPago = 'Selecciona el método de pago.';
    if (data.metodoPago === 'transferencia' && !data.cuentaBancaria.trim()) {
        e.cuentaBancaria = 'El número de cuenta bancaria es requerido.';
    }
    if (!data.jornada) {
        e.jornada = 'Selecciona la jornada de trabajo.';
    } else if (data.jornada === 'otro') {
        e.jornada =
            'Esta jornada requiere asesoría legal especializada. Agenda una consulta para redactar tu contrato.';
    }
    if (!data.lugarPrestacion.trim()) e.lugarPrestacion = 'El lugar de prestación del servicio es requerido.';
    if (!data.duracionNumero.trim()) e.duracionNumero = 'La duración es requerida.';
    if (!data.duracionUnidad) e.duracionUnidad = 'Selecciona la unidad de duración.';
    return e;
}

export function validateCondicionesObraLabor(data: CondicionesObraLabor): Errors {
    const e: Errors = {};
    if (!data.descripcionObra.trim()) e.descripcionObra = 'La descripción de la obra o labor es requerida.';
    if (!data.oficio.trim()) e.oficio = 'El oficio es requerido.';
    if (!data.salario.trim()) e.salario = 'El salario u honorarios es requerido.';
    if (!data.modalidadPago.trim()) e.modalidadPago = 'La modalidad de pago es requerida.';
    if (!data.lugar.trim()) e.lugar = 'El lugar de prestación es requerido.';
    return e;
}

export function hasErrors(errors: Errors): boolean {
    return Object.values(errors).some((v) => v.length > 0);
}
