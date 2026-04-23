export { numberToWordsCOP, formatCOP, formatDate, threeDigits } from '../arrendamiento/contractUtils';

import { threeDigits } from '../arrendamiento/contractUtils';
import type { JornadaTrabajo, UnidadDuracion, FrecuenciaPago, MetodoPago } from './types';

export function formatDuracion(num: string, unidad: UnidadDuracion): string {
    const n = parseInt(num, 10);
    if (isNaN(n) || n <= 0) return `___ ${unidad}`;

    const word = threeDigits(n).toLowerCase() || 'cero';

    const singular: Record<UnidadDuracion, string> = { dias: 'día', meses: 'mes', anos: 'año' };
    const plural: Record<UnidadDuracion, string> = { dias: 'días', meses: 'meses', anos: 'años' };
    const label = n === 1 ? singular[unidad] : plural[unidad];

    return `${word} (${n}) ${label}`;
}

export function formatJornada(jornada: JornadaTrabajo): string {
    const labels: Record<JornadaTrabajo, string> = {
        'lunes-viernes-8-5': 'lunes a viernes de 8:00 a.m. a 5:00 p.m.',
        'lunes-viernes-7-4': 'lunes a viernes de 7:00 a.m. a 4:00 p.m.',
        'lunes-sabado-8-12': 'lunes a sábado de 8:00 a.m. a 12:00 p.m.',
        'turnos-rotativos': 'turnos rotativos según programación del empleador',
        otro: '',
    };
    return labels[jornada] ?? '';
}

export const JORNADA_OPTIONS: Array<{ value: JornadaTrabajo; label: string }> = [
    { value: 'lunes-viernes-8-5', label: 'Lunes a viernes: 8:00 a.m. a 5:00 p.m.' },
    { value: 'lunes-viernes-7-4', label: 'Lunes a viernes: 7:00 a.m. a 4:00 p.m.' },
    { value: 'lunes-sabado-8-12', label: 'Lunes a sábado: 8:00 a.m. a 12:00 p.m.' },
    { value: 'turnos-rotativos', label: 'Turnos rotativos' },
    { value: 'otro', label: 'Otro (requiere asesoría legal)' },
];

export const UNIDAD_DURACION_OPTIONS: Array<{ value: UnidadDuracion; label: string }> = [
    { value: 'dias', label: 'Días' },
    { value: 'meses', label: 'Meses' },
    { value: 'anos', label: 'Años' },
];

export const FRECUENCIA_PAGO_OPTIONS: Array<{ value: FrecuenciaPago; label: string }> = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'quincenal', label: 'Quincenal' },
    { value: 'semanal', label: 'Semanal' },
];

export const METODO_PAGO_OPTIONS: Array<{ value: MetodoPago; label: string }> = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia bancaria' },
];
