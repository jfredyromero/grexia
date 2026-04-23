export type TipoContrato = 'termino-fijo' | 'obra-labor';
export type TipoDocEmpleador = 'CC' | 'NIT';
export type TipoDocTrabajador = 'CC' | 'CE' | 'Pasaporte';
export type UnidadDuracion = 'dias' | 'meses' | 'anos';
export type FrecuenciaPago = 'mensual' | 'quincenal' | 'semanal';
export type MetodoPago = 'efectivo' | 'transferencia';
export type JornadaTrabajo =
    | 'lunes-viernes-8-5'
    | 'lunes-viernes-7-4'
    | 'lunes-sabado-8-12'
    | 'turnos-rotativos'
    | 'otro';

export interface EmpleadorData {
    nombreCompleto: string;
    tipoDocumento: TipoDocEmpleador | '';
    numeroDocumento: string;
    ciudad: string;
    direccion: string;
}

export interface TrabajadorData {
    nombreCompleto: string;
    tipoDocumento: TipoDocTrabajador | '';
    numeroDocumento: string;
    ciudad: string;
    direccion: string;
}

export interface CondicionesTerminoFijo {
    cargo: string;
    salario: string;
    frecuenciaPago: FrecuenciaPago | '';
    metodoPago: MetodoPago | '';
    cuentaBancaria: string;
    jornada: JornadaTrabajo | '';
    lugarPrestacion: string;
    duracionNumero: string;
    duracionUnidad: UnidadDuracion | '';
}

export interface CondicionesObraLabor {
    descripcionObra: string;
    oficio: string;
    salario: string;
    modalidadPago: string;
    lugar: string;
}

export interface LaboralFormData {
    tipoContrato: TipoContrato | '';
    empleador: EmpleadorData;
    trabajador: TrabajadorData;
    condicionesTerminoFijo: CondicionesTerminoFijo;
    condicionesObraLabor: CondicionesObraLabor;
}

export const INITIAL_LABORAL_DATA: LaboralFormData = {
    tipoContrato: '',
    empleador: {
        nombreCompleto: '',
        tipoDocumento: '',
        numeroDocumento: '',
        ciudad: '',
        direccion: '',
    },
    trabajador: {
        nombreCompleto: '',
        tipoDocumento: '',
        numeroDocumento: '',
        ciudad: '',
        direccion: '',
    },
    condicionesTerminoFijo: {
        cargo: '',
        salario: '',
        frecuenciaPago: '',
        metodoPago: '',
        cuentaBancaria: '',
        jornada: '',
        lugarPrestacion: '',
        duracionNumero: '',
        duracionUnidad: '',
    },
    condicionesObraLabor: {
        descripcionObra: '',
        oficio: '',
        salario: '',
        modalidadPago: '',
        lugar: '',
    },
};

export const LABORAL_STEPS = [
    { number: 1, label: 'Tipo' },
    { number: 2, label: 'Empleador' },
    { number: 3, label: 'Trabajador' },
    { number: 4, label: 'Condiciones' },
    { number: 5, label: 'Preview' },
] as const;

export const TIPOS_DOC_EMPLEADOR: TipoDocEmpleador[] = ['CC', 'NIT'];
export const TIPOS_DOC_TRABAJADOR: TipoDocTrabajador[] = ['CC', 'CE', 'Pasaporte'];

export const DOC_LABELS: Record<TipoDocEmpleador | TipoDocTrabajador, string> = {
    CC: 'Cédula de Ciudadanía',
    NIT: 'NIT',
    CE: 'Cédula de Extranjería',
    Pasaporte: 'Pasaporte',
};
