export type TipoInmueble = 'Apartamento' | 'Casa' | 'Local Comercial' | 'Oficina';
export type { PlanTier } from '../../types/plans';
export type TipoDocArrendador = 'CC' | 'CE' | 'NIT';
export type TipoDocArrendatario = 'CC' | 'CE' | 'Pasaporte';

export function isComercial(tipo: TipoInmueble | ''): boolean {
    return tipo === 'Local Comercial' || tipo === 'Oficina';
}

export interface InmuebleData {
    tipoInmueble: TipoInmueble | '';
    propiedadHorizontal: boolean;
    direccion: string;
    ciudad: string;
    departamento: string;
    estrato: string;
    areaMq: string;
}

export interface ArrendadorData {
    nombreCompleto: string;
    tipoDocumento: TipoDocArrendador | '';
    numeroDocumento: string;
    telefono: string;
    email: string;
}

export interface ArrendatarioData {
    nombreCompleto: string;
    tipoDocumento: TipoDocArrendatario | '';
    numeroDocumento: string;
    telefono: string;
    email: string;
}

export interface CondicionesData {
    fechaInicio: string;
    duracionMeses: number;
    canonMensual: string;
    depositoCOP: string;
    diaPagoMes: number;
    actividadComercial: string;
}

export interface ArrendamientoFormData {
    inmueble: InmuebleData;
    arrendador: ArrendadorData;
    arrendatario: ArrendatarioData;
    condiciones: CondicionesData;
}

export const INITIAL_FORM_DATA: ArrendamientoFormData = {
    inmueble: {
        tipoInmueble: '',
        propiedadHorizontal: false,
        direccion: '',
        ciudad: '',
        departamento: '',
        estrato: '3',
        areaMq: '',
    },
    arrendador: {
        nombreCompleto: '',
        tipoDocumento: '',
        numeroDocumento: '',
        telefono: '',
        email: '',
    },
    arrendatario: {
        nombreCompleto: '',
        tipoDocumento: '',
        numeroDocumento: '',
        telefono: '',
        email: '',
    },
    condiciones: {
        fechaInicio: '',
        duracionMeses: 12,
        canonMensual: '',
        depositoCOP: '',
        diaPagoMes: 5,
        actividadComercial: '',
    },
};

export const STEPS = [
    { number: 1, label: 'Inmueble' },
    { number: 2, label: 'Arrendador' },
    { number: 3, label: 'Arrendatario' },
    { number: 4, label: 'Condiciones' },
    { number: 5, label: 'Contrato' },
] as const;

export const DEPARTAMENTOS = [
    'Amazonas',
    'Antioquia',
    'Arauca',
    'Atlántico',
    'Bogotá',
    'Bolívar',
    'Boyacá',
    'Caldas',
    'Caquetá',
    'Casanare',
    'Cauca',
    'Cesar',
    'Chocó',
    'Córdoba',
    'Cundinamarca',
    'Guainía',
    'Guaviare',
    'Huila',
    'La Guajira',
    'Magdalena',
    'Meta',
    'Nariño',
    'Norte de Santander',
    'Putumayo',
    'Quindío',
    'Risaralda',
    'San Andrés y Providencia',
    'Santander',
    'Sucre',
    'Tolima',
    'Valle del Cauca',
    'Vaupés',
    'Vichada',
] as const;
