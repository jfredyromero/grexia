import type { TutelaFormData } from './types';
import { TIPO_NEGATIVA_OPTIONS, TIPO_PRETENSION_OPTIONS, CONDICIONES_VULNERABILIDAD, DOCUMENTOS_GUIA } from './types';

export function formatFecha(dateStr: string): string {
    if (!dateStr) return '___________________';
    const [year, month, day] = dateStr.split('-');
    const meses = [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre',
    ];
    return `${parseInt(day)} de ${meses[parseInt(month) - 1]} de ${year}`;
}

export function getFechaHoy(): string {
    return formatFecha(new Date().toISOString().split('T')[0]);
}

export function getEPSDisplay(data: TutelaFormData): string {
    if (data.nombreEPS === 'Otra') return data.otraEPS || '___________________';
    return data.nombreEPS || '___________________';
}

export function getTipoNegativaLabel(value: string): string {
    return TIPO_NEGATIVA_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getTipoPretensionLabel(value: string): string {
    return TIPO_PRETENSION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getVulnerabilidadTexto(data: TutelaFormData): string {
    const condiciones = data.condicionesVulnerabilidad
        .filter((v) => v !== 'ninguna')
        .map((v) => CONDICIONES_VULNERABILIDAD.find((c) => c.value === v)?.label ?? v);

    if (condiciones.length === 0) return '';

    const parts: string[] = [];
    for (const cond of data.condicionesVulnerabilidad) {
        if (cond === 'discapacidad' && data.tipoDiscapacidad)
            parts.push(`persona con discapacidad (${data.tipoDiscapacidad})`);
        else if (cond === 'zona_dificil' && data.descripcionZonaAcceso)
            parts.push(`residente en zona de difícil acceso geográfico (${data.descripcionZonaAcceso})`);
        else if (cond !== 'ninguna') {
            const label = CONDICIONES_VULNERABILIDAD.find((c) => c.value === cond)?.label ?? cond;
            parts.push(label.toLowerCase());
        }
    }

    if (parts.length === 0) return '';
    return `Se identifica como sujeto de especial protección constitucional en condición de: ${parts.join(', ')}.`;
}

export function generarTextoHechos(data: TutelaFormData): string {
    const eps = getEPSDisplay(data);
    const regimen = data.regimen === 'contributivo' ? 'régimen contributivo' : 'régimen subsidiado';
    const tipoNeg = getTipoNegativaLabel(data.tipoNegativa);
    const vulnerabilidad = getVulnerabilidadTexto(data);
    const medicoTratante =
        data.tieneMedicoTratante === 'si' && data.nombreMedico
            ? ` El médico tratante asignado es ${data.nombreMedico}.`
            : '';

    const parrafos: string[] = [];

    // Párrafo 1: afiliación y vulnerabilidad
    parrafos.push(
        `Me encuentro afiliado(a) a ${eps} en ${regimen}. ` +
            (vulnerabilidad ? vulnerabilidad + ' ' : '') +
            `Actúo en nombre propio, en ejercicio de mis derechos constitucionales fundamentales.`
    );

    // Párrafo 2: historia clínica, diagnóstico y negativa
    parrafos.push(
        `Padezco de ${data.diagnostico || '___________________'}, condición que ha sido debidamente documentada en mi historia clínica. ` +
            `${data.historiaClinica}` +
            `${medicoTratante} ` +
            `En fecha aproximada del ${formatFecha(data.fechaNegativa)}, la entidad accionada procedió a negarme el siguiente servicio de salud requerido: ` +
            `${data.servicioNegado || '___________________'}. La negativa se presentó mediante: ${tipoNeg.toLowerCase()}.`
    );

    // Párrafo 3: impacto en salud y vida
    let impactoParrafo = `Dicha negativa afecta gravemente mi salud, vida e integridad personal de la siguiente manera: ${data.impactoSaludVida}`;
    if (data.afectaTrabajo === 'si' && data.descripcionImpactoTrabajo) {
        impactoParrafo += ` Adicionalmente, esta situación impacta mi actividad económica y trabajo: ${data.descripcionImpactoTrabajo}`;
    }
    if (data.afectaFamilia === 'si' && data.descripcionImpactoFamilia) {
        impactoParrafo += ` Así mismo, afecta mi vida familiar: ${data.descripcionImpactoFamilia}`;
    }
    parrafos.push(impactoParrafo);

    // Párrafo 4: responsabilidad de la accionada
    parrafos.push(
        `La responsabilidad de esta vulneración recae directamente sobre ${eps}, quien siendo la entidad encargada de garantizar la prestación ` +
            `de mis servicios de salud, ha omitido su deber legal y constitucional al negarme, demorar o no autorizar ` +
            `${data.servicioNegado || 'los servicios de salud requeridos'}, prescrito(s) por los profesionales de la salud que me atienden.`
    );

    // Párrafo 5: forma de garantizar la protección
    const pretension =
        data.tipoPretension === 'otro'
            ? data.otraPretension
            : getTipoPretensionLabel(data.tipoPretension).toLowerCase();
    parrafos.push(
        `La forma de garantizar la protección de mis derechos fundamentales vulnerados consiste en que ${eps} proceda de manera inmediata a ` +
            `${pretension}: ${data.detalleEspecifico}. ` +
            `He formulado esta solicitud ante la entidad en ${data.numeroSolicitudes} ocasión(es) sin obtener respuesta favorable.`
    );

    return parrafos.join('\n\n');
}

export function generarPretensiones(data: TutelaFormData): string[] {
    const eps = getEPSDisplay(data);
    const pretension =
        data.tipoPretension === 'otro' ? data.otraPretension : getTipoPretensionLabel(data.tipoPretension);
    const detalle = data.detalleEspecifico || '___________________';

    return [
        `Tutelar los derechos fundamentales expuestos en la presente acción y declarar la responsabilidad por su vulneración a ${eps}.`,
        `Como consecuencia de lo anterior, ORDENAR a ${eps} AUTORIZAR Y GARANTIZAR la ${pretension.toLowerCase()}: ${detalle}.`,
        `ORDENAR a ${eps} adopte medidas provisionales urgentes conforme al artículo 7 del Decreto 2591 de 1991, para que se autoricen todos los procedimientos y tratamientos prescritos por los médicos; fuesen exámenes médicos, cirugías o demás a consideración de los expertos de la salud.`,
    ];
}

export function generarListaAnexos(data: TutelaFormData): string[] {
    return data.documentosGuia
        .map((doc) => DOCUMENTOS_GUIA.find((d) => d.value === doc)?.label)
        .filter((label): label is string => !!label);
}
