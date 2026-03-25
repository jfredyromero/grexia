import type { VendedorData, CompradorData, InmuebleData, TradicionData, EconomicoData, EscrituraData } from './types';

type Errors = Record<string, string>;

export function validateVendedor(data: VendedorData): Errors {
    const e: Errors = {};
    if (!data.nombre.trim()) e.nombre = 'El nombre del vendedor es requerido.';
    if (!data.cc.trim()) e.cc = 'La cedula del vendedor es requerida.';
    if (!data.ccExpedidaEn.trim()) e.ccExpedidaEn = 'El lugar de expedicion es requerido.';
    if (!data.ciudad.trim()) e.ciudad = 'La ciudad de domicilio es requerida.';
    return e;
}

export function validateComprador(data: CompradorData): Errors {
    const e: Errors = {};
    if (!data.nombre.trim()) e.nombre = 'El nombre del comprador es requerido.';
    if (!data.cc.trim()) e.cc = 'La cedula del comprador es requerida.';
    if (!data.ccExpedidaEn.trim()) e.ccExpedidaEn = 'El lugar de expedicion es requerido.';
    if (!data.ciudad.trim()) e.ciudad = 'La ciudad de domicilio es requerida.';
    return e;
}

export function validateInmueble(data: InmuebleData): Errors {
    const e: Errors = {};
    if (!data.direccion.trim()) e.direccion = 'La direccion del inmueble es requerida.';
    if (!data.ciudad.trim()) e.ciudad = 'La ciudad del inmueble es requerida.';
    if (!data.area.trim()) e.area = 'El area del inmueble es requerida.';
    if (!data.linderoNorte.trim()) e.linderoNorte = 'El lindero Norte es requerido.';
    if (!data.linderoSur.trim()) e.linderoSur = 'El lindero Sur es requerido.';
    if (!data.linderoOriente.trim()) e.linderoOriente = 'El lindero Oriente es requerido.';
    if (!data.linderoOccidente.trim()) e.linderoOccidente = 'El lindero Occidente es requerido.';
    if (!data.matricula.trim()) e.matricula = 'La matricula inmobiliaria es requerida.';
    if (!data.cedulaCatastral.trim()) e.cedulaCatastral = 'La cedula catastral es requerida.';
    return e;
}

export function validateTradicion(data: TradicionData): Errors {
    const e: Errors = {};
    if (!data.tipoActo.trim()) e.tipoActo = 'El tipo de acto es requerido.';
    if (!data.escrituraNro.trim()) e.escrituraNro = 'El numero de escritura es requerido.';
    if (!data.notaria.trim()) e.notaria = 'La notaria es requerida.';
    if (!data.folioMatricula.trim()) e.folioMatricula = 'El folio de matricula es requerido.';
    if (!data.ciudadRegistro.trim()) e.ciudadRegistro = 'La ciudad de registro es requerida.';
    return e;
}

export function validateEconomico(data: EconomicoData): Errors {
    const e: Errors = {};
    if (!data.precioTotal.trim()) e.precioTotal = 'El precio total es requerido.';
    if (!data.formaDePago.trim()) e.formaDePago = 'La forma de pago es requerida.';
    if (!data.arrasValor.trim()) e.arrasValor = 'El valor de las arras es requerido.';
    if (!data.clausulaPenalValor.trim()) e.clausulaPenalValor = 'El valor de la clausula penal es requerido.';
    return e;
}

export function validateEscritura(data: EscrituraData): Errors {
    const e: Errors = {};
    if (!data.notaria.trim()) e.notaria = 'La notaria es requerida.';
    if (!data.fecha) e.fecha = 'La fecha de escritura es requerida.';
    if (!data.gastosDistribucion.trim()) e.gastosDistribucion = 'La distribucion de gastos es requerida.';
    if (!data.domicilioCiudad.trim()) e.domicilioCiudad = 'La ciudad de domicilio contractual es requerida.';
    if (data.incluyeTestigo) {
        if (!data.testigoNombre.trim()) e.testigoNombre = 'El nombre del testigo es requerido.';
        if (!data.testigoCC.trim()) e.testigoCC = 'La cedula del testigo es requerida.';
    }
    return e;
}

export function hasErrors(errors: Errors): boolean {
    return Object.values(errors).some((v) => v.length > 0);
}
