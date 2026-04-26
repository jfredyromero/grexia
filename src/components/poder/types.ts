// ─────────────────────────────────────────────────────────────────────────────
// Tipos para la herramienta Poder Especial
//
// El tipo de proceso es el discriminador que activa o desactiva campos
// condicionales en el formulario y en el template:
//   - hasInmueble    → muestra/oculta campos de inmueble (dirección + matrícula)
//   - hasDemandados  → muestra/oculta lista de demandados; en caso contrario
//                      pide un texto libre con el objeto del poder
// ─────────────────────────────────────────────────────────────────────────────

export type TipoProceso =
    | 'declaracion-pertenencia'
    | 'proceso-civil'
    | 'proceso-laboral'
    | 'proceso-penal'
    | 'proceso-familia'
    | 'cobro-juridico'
    | 'tramites-notariales'
    | 'administracion-bienes';

export interface TipoProcesoConfig {
    value: TipoProceso;
    label: string;
    /** Mayúsculas usadas en el cuerpo del documento. */
    labelDocumento: string;
    /** Texto corto para el card del selector. */
    description: string;
    /** Icono de Material Symbols. */
    icon: string;
    hasInmueble: boolean;
    hasDemandados: boolean;
}

export const TIPOS_PROCESO: readonly TipoProcesoConfig[] = [
    {
        value: 'declaracion-pertenencia',
        label: 'Declaración de Pertenencia',
        labelDocumento: 'PROCESO DE DECLARACIÓN DE PERTENENCIA',
        description: 'Adquirir la propiedad de un inmueble por prescripción adquisitiva.',
        icon: 'home_work',
        hasInmueble: true,
        hasDemandados: true,
    },
    {
        value: 'proceso-civil',
        label: 'Proceso Civil General',
        labelDocumento: 'PROCESO CIVIL',
        description: 'Conflictos civiles entre particulares: contratos, responsabilidad, restitución.',
        icon: 'gavel',
        hasInmueble: false,
        hasDemandados: true,
    },
    {
        value: 'proceso-laboral',
        label: 'Proceso Laboral',
        labelDocumento: 'PROCESO LABORAL',
        description: 'Reclamación de prestaciones, indemnizaciones o derechos laborales.',
        icon: 'work',
        hasInmueble: false,
        hasDemandados: true,
    },
    {
        value: 'proceso-penal',
        label: 'Proceso Penal',
        labelDocumento: 'PROCESO PENAL',
        description: 'Representación como víctima o querellante en proceso penal.',
        icon: 'shield',
        hasInmueble: false,
        hasDemandados: true,
    },
    {
        value: 'proceso-familia',
        label: 'Proceso de Familia',
        labelDocumento: 'PROCESO DE FAMILIA',
        description: 'Custodia, alimentos, divorcio, sucesión y demás asuntos de familia.',
        icon: 'family_restroom',
        hasInmueble: false,
        hasDemandados: true,
    },
    {
        value: 'cobro-juridico',
        label: 'Cobro Jurídico',
        labelDocumento: 'PROCESO EJECUTIVO DE COBRO JURÍDICO',
        description: 'Recuperar acreencias mediante proceso ejecutivo.',
        icon: 'request_quote',
        hasInmueble: false,
        hasDemandados: true,
    },
    {
        value: 'tramites-notariales',
        label: 'Trámites Notariales',
        labelDocumento: 'TRÁMITES NOTARIALES',
        description: 'Escrituración, sucesiones notariales y firmas en notaría.',
        icon: 'edit_document',
        hasInmueble: true,
        hasDemandados: false,
    },
    {
        value: 'administracion-bienes',
        label: 'Administración de Bienes',
        labelDocumento: 'ADMINISTRACIÓN DE BIENES',
        description: 'Administrar inmuebles, suscribir contratos y cobrar cánones.',
        icon: 'apartment',
        hasInmueble: true,
        hasDemandados: false,
    },
] as const;

// ── Slices del formulario ────────────────────────────────────────────────────

export interface PoderdanteData {
    nombreCompleto: string;
    ccPoderdante: string;
    lugarExpedicionPoderdante: string;
    ciudadPoderdante: string;
    /** Solo aplica cuando hasInmueble === true. */
    direccionInmueble: string;
    /** Solo aplica cuando hasInmueble === true. */
    matriculaInmobiliaria: string;
}

export interface ApoderadoData {
    nombreCompleto: string;
    ccApoderado: string;
    lugarExpedicionApoderado: string;
    ciudadApoderado: string;
    tarjetaProfesional: string;
}

export interface ProcesoData {
    /** Lista dinámica. Solo aplica cuando hasDemandados === true. */
    demandados: string[];
    /** Texto libre. Solo aplica cuando hasDemandados === false. */
    objetoPoder: string;
}

export interface PoderFormData {
    tipoProceso: TipoProceso | '';
    poderdante: PoderdanteData;
    apoderado: ApoderadoData;
    proceso: ProcesoData;
}

export const INITIAL_PODER_DATA: PoderFormData = {
    tipoProceso: '',
    poderdante: {
        nombreCompleto: '',
        ccPoderdante: '',
        lugarExpedicionPoderdante: '',
        ciudadPoderdante: '',
        direccionInmueble: '',
        matriculaInmobiliaria: '',
    },
    apoderado: {
        nombreCompleto: '',
        ccApoderado: '',
        lugarExpedicionApoderado: '',
        ciudadApoderado: '',
        tarjetaProfesional: '',
    },
    proceso: {
        demandados: [''],
        objetoPoder: '',
    },
};

export const PODER_STEPS = [
    { number: 1, label: 'Tipo' },
    { number: 2, label: 'Poderdante' },
    { number: 3, label: 'Apoderado' },
    { number: 4, label: 'Proceso' },
    { number: 5, label: 'Preview' },
] as const;

// ── Helpers de configuración ─────────────────────────────────────────────────

export function getTipoProcesoConfig(tipo: TipoProceso | ''): TipoProcesoConfig | null {
    if (!tipo) return null;
    return TIPOS_PROCESO.find((t) => t.value === tipo) ?? null;
}

export function tipoProcesoHasInmueble(tipo: TipoProceso | ''): boolean {
    return getTipoProcesoConfig(tipo)?.hasInmueble ?? false;
}

export function tipoProcesoHasDemandados(tipo: TipoProceso | ''): boolean {
    return getTipoProcesoConfig(tipo)?.hasDemandados ?? false;
}
