export type { PlanTier } from '../../types/plans';
export type TipoDocPersona = 'CC' | 'CE' | 'NIT' | 'Pasaporte';
export type ModalidadPago = 'unico' | 'cuotas';
export type PeriodoCuotas = 'mensual' | 'bimestral' | 'trimestral';

export interface AcreedorData {
    nombreCompleto: string;
    tipoDocumento: TipoDocPersona | '';
    numeroDocumento: string;
    telefono: string;
    email: string;
}

export interface DeudorData {
    nombreCompleto: string;
    tipoDocumento: TipoDocPersona | '';
    numeroDocumento: string;
    telefono: string;
    email: string;
    ciudadResidencia: string;
}

export interface ObligacionData {
    valorPrincipal: string;
    fechaSuscripcion: string;
    modalidadPago: ModalidadPago | '';
    fechaVencimiento: string;
    numeroCuotas: string;
    periodoCuotas: PeriodoCuotas | '';
    ciudadSuscripcion: string;
    tasaInteresMora: string;
}

export interface PagareFormData {
    acreedor: AcreedorData;
    deudor: DeudorData;
    obligacion: ObligacionData;
}

export const INITIAL_PAGARE_DATA: PagareFormData = {
    acreedor: {
        nombreCompleto: '',
        tipoDocumento: '',
        numeroDocumento: '',
        telefono: '',
        email: '',
    },
    deudor: {
        nombreCompleto: '',
        tipoDocumento: '',
        numeroDocumento: '',
        telefono: '',
        email: '',
        ciudadResidencia: '',
    },
    obligacion: {
        valorPrincipal: '',
        fechaSuscripcion: '',
        modalidadPago: '',
        fechaVencimiento: '',
        numeroCuotas: '',
        periodoCuotas: '',
        ciudadSuscripcion: '',
        tasaInteresMora: '',
    },
};

export const PAGARE_STEPS = [
    { number: 1, label: 'Acreedor' },
    { number: 2, label: 'Deudor' },
    { number: 3, label: 'Obligación' },
    { number: 4, label: 'Pagaré' },
] as const;

export const TIPOS_DOC_PERSONA: TipoDocPersona[] = ['CC', 'CE', 'NIT', 'Pasaporte'];

export const DOC_LABELS: Record<TipoDocPersona, string> = {
    CC: 'Cédula de Ciudadanía',
    CE: 'Cédula de Extranjería',
    NIT: 'NIT',
    Pasaporte: 'Pasaporte',
};
