export interface TutelaFormData {
    // Paso 1 - Accionante
    nombreCompleto: string;
    cedula: string;
    ciudad: string;
    telefono: string;
    correo: string;

    // Paso 2 - EPS
    nombreEPS: string;
    otraEPS: string;
    regimen: 'contributivo' | 'subsidiado' | '';
    sedeEPS: string;
    correoEPS: string;

    // Paso 3 - Condición médica
    diagnostico: string;
    servicioNegado: string;
    tipoNegativa: string;
    fechaNegativa: string;
    historiaClinica: string;
    tieneMedicoTratante: 'si' | 'no' | '';
    nombreMedico: string;

    // Paso 4 - Vulnerabilidad
    condicionesVulnerabilidad: string[];
    tipoDiscapacidad: string;
    descripcionZonaAcceso: string;

    // Paso 5 - Impacto
    impactoSaludVida: string;
    afectaTrabajo: 'si' | 'no' | '';
    descripcionImpactoTrabajo: string;
    afectaFamilia: 'si' | 'no' | '';
    descripcionImpactoFamilia: string;

    // Paso 6 - Pretensiones
    tipoPretension: string;
    otraPretension: string;
    detalleEspecifico: string;
    numeroSolicitudes: number;

    // Paso 7 - Anexos
    documentosGuia: string[];
}

export const INITIAL_TUTELA_DATA: TutelaFormData = {
    nombreCompleto: '',
    cedula: '',
    ciudad: '',
    telefono: '',
    correo: '',
    nombreEPS: '',
    otraEPS: '',
    regimen: '',
    sedeEPS: '',
    correoEPS: '',
    diagnostico: '',
    servicioNegado: '',
    tipoNegativa: '',
    fechaNegativa: '',
    historiaClinica: '',
    tieneMedicoTratante: '',
    nombreMedico: '',
    condicionesVulnerabilidad: [],
    tipoDiscapacidad: '',
    descripcionZonaAcceso: '',
    impactoSaludVida: '',
    afectaTrabajo: '',
    descripcionImpactoTrabajo: '',
    afectaFamilia: '',
    descripcionImpactoFamilia: '',
    tipoPretension: '',
    otraPretension: '',
    detalleEspecifico: '',
    numeroSolicitudes: 1,
    documentosGuia: [],
};

export const TUTELA_STEPS = [
    { number: 1, label: 'Accionante' },
    { number: 2, label: 'EPS' },
    { number: 3, label: 'Condición' },
    { number: 4, label: 'Vulnerabilidad' },
    { number: 5, label: 'Impacto' },
    { number: 6, label: 'Pretensiones' },
    { number: 7, label: 'Anexos' },
    { number: 8, label: 'Preview' },
] as const;

export const EPS_LIST = [
    'Sura EPS',
    'Compensar EPS',
    'Nueva EPS',
    'Sanitas EPS',
    'Salud Total EPS',
    'Famisanar EPS',
    'Coosalud EPS',
    'Medimás EPS',
    'Aliansalud EPS',
    'Mutual Ser EPS',
    'Emssanar EPS',
    'Capresoca EPS',
    'Otra',
] as const;

export const TIPO_NEGATIVA_OPTIONS = [
    { value: 'no_autorizacion', label: 'No autorización por la EPS' },
    { value: 'no_respuesta', label: 'No respuesta a la solicitud' },
    { value: 'negativa_verbal', label: 'Negativa verbal del médico/EPS' },
    { value: 'demora', label: 'Demora excesiva sin resolución' },
    { value: 'otra', label: 'Otra' },
] as const;

export const TIPO_PRETENSION_OPTIONS = [
    { value: 'procedimiento', label: 'Autorización del procedimiento médico' },
    { value: 'medicamento', label: 'Entrega del medicamento prescrito' },
    { value: 'examenes', label: 'Realización de los exámenes ordenados' },
    { value: 'cirugia', label: 'Autorización de cirugía' },
    { value: 'especialista', label: 'Remisión a especialista' },
    { value: 'otro', label: 'Otro' },
] as const;

export const CONDICIONES_VULNERABILIDAD = [
    { value: 'adulto_mayor', label: 'Adulto mayor (más de 60 años)' },
    { value: 'menor_edad', label: 'Menor de edad' },
    { value: 'discapacidad', label: 'Persona con discapacidad' },
    { value: 'enfermedad_cronica', label: 'Enfermedad crónica o terminal' },
    { value: 'zona_dificil', label: 'Zona de difícil acceso geográfico' },
    { value: 'embarazo', label: 'Embarazo o lactancia' },
    { value: 'cabeza_hogar', label: 'Cabeza de hogar' },
    { value: 'ninguna', label: 'Ninguna condición especial' },
] as const;

export const DOCUMENTOS_GUIA = [
    { value: 'historia_clinica', label: 'Copia de historia clínica' },
    { value: 'carta_negativa', label: 'Carta de negativa de la EPS' },
    { value: 'examenes_no_autorizados', label: 'Exámenes o procedimientos ordenados no autorizados' },
    { value: 'cedula', label: 'Cédula de ciudadanía' },
    { value: 'respuesta_eps', label: 'Respuesta escrita de la EPS negando el servicio' },
    { value: 'formula_medica', label: 'Fórmula médica del medicamento negado' },
] as const;
