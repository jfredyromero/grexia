import type { TutelaFormData } from './types';

type Errors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep1(data: TutelaFormData): Errors {
    const e: Errors = {};
    if (!data.nombreCompleto.trim()) e.nombreCompleto = 'El nombre es requerido.';
    if (!data.cedula.trim()) e.cedula = 'La cédula es requerida.';
    if (!/^\d+$/.test(data.cedula.trim()) && data.cedula.trim()) e.cedula = 'Solo se permiten números.';
    if (!data.ciudad.trim()) e.ciudad = 'La ciudad es requerida.';
    if (!data.telefono.trim()) e.telefono = 'El teléfono es requerido.';
    if (!data.correo.trim()) e.correo = 'El correo es requerido.';
    else if (!EMAIL_REGEX.test(data.correo)) e.correo = 'Correo electrónico inválido.';
    return e;
}

export function validateStep2(data: TutelaFormData): Errors {
    const e: Errors = {};
    if (!data.nombreEPS) e.nombreEPS = 'Selecciona la EPS.';
    if (data.nombreEPS === 'Otra' && !data.otraEPS.trim()) e.otraEPS = 'Especifica el nombre de la entidad.';
    if (!data.regimen) e.regimen = 'Selecciona el régimen.';
    if (!data.sedeEPS.trim()) e.sedeEPS = 'La sede es requerida.';
    if (data.correoEPS && !EMAIL_REGEX.test(data.correoEPS)) e.correoEPS = 'Correo electrónico inválido.';
    return e;
}

export function validateStep3(data: TutelaFormData): Errors {
    const e: Errors = {};
    if (!data.diagnostico.trim()) e.diagnostico = 'El diagnóstico es requerido.';
    if (!data.servicioNegado.trim()) e.servicioNegado = 'Describe el servicio negado.';
    if (!data.tipoNegativa) e.tipoNegativa = 'Selecciona el tipo de negativa.';
    if (!data.fechaNegativa) e.fechaNegativa = 'La fecha aproximada es requerida.';
    if (!data.historiaClinica.trim()) e.historiaClinica = 'Describe brevemente tu historia clínica.';
    if (!data.tieneMedicoTratante) e.tieneMedicoTratante = 'Indica si tienes médico tratante.';
    if (data.tieneMedicoTratante === 'si' && !data.nombreMedico.trim())
        e.nombreMedico = 'Indica el nombre del médico tratante.';
    return e;
}

export function validateStep4(data: TutelaFormData): Errors {
    const e: Errors = {};
    if (data.condicionesVulnerabilidad.length === 0) e.condicionesVulnerabilidad = 'Selecciona al menos una opción.';
    if (data.condicionesVulnerabilidad.includes('discapacidad') && !data.tipoDiscapacidad.trim())
        e.tipoDiscapacidad = 'Describe el tipo de discapacidad.';
    if (data.condicionesVulnerabilidad.includes('zona_dificil') && !data.descripcionZonaAcceso.trim())
        e.descripcionZonaAcceso = 'Describe el municipio o vereda.';
    return e;
}

export function validateStep5(data: TutelaFormData): Errors {
    const e: Errors = {};
    if (!data.impactoSaludVida.trim()) e.impactoSaludVida = 'Describe el impacto en tu salud y vida.';
    if (!data.afectaTrabajo) e.afectaTrabajo = 'Indica si afecta tu trabajo.';
    if (data.afectaTrabajo === 'si' && !data.descripcionImpactoTrabajo.trim())
        e.descripcionImpactoTrabajo = 'Describe el impacto en tu trabajo.';
    if (!data.afectaFamilia) e.afectaFamilia = 'Indica si afecta tu vida familiar.';
    if (data.afectaFamilia === 'si' && !data.descripcionImpactoFamilia.trim())
        e.descripcionImpactoFamilia = 'Describe el impacto en tu familia.';
    return e;
}

export function validateStep6(data: TutelaFormData): Errors {
    const e: Errors = {};
    if (!data.tipoPretension) e.tipoPretension = 'Selecciona lo que solicitas.';
    if (data.tipoPretension === 'otro' && !data.otraPretension.trim()) e.otraPretension = 'Describe lo que solicitas.';
    if (!data.detalleEspecifico.trim()) e.detalleEspecifico = 'Especifica el detalle de lo solicitado.';
    if (!data.numeroSolicitudes || data.numeroSolicitudes < 1)
        e.numeroSolicitudes = 'Indica cuántas veces has solicitado esto.';
    return e;
}

export function hasErrors(errors: Errors): boolean {
    return Object.values(errors).some((v) => v.length > 0);
}
