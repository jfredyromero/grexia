// ─────────────────────────────────────────────────────────────────────────────
// Funciones puras para la herramienta Poder Especial.
//
// No deben tener side effects ni imports de React/DOM.
// ─────────────────────────────────────────────────────────────────────────────

const MESES = [
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
] as const;

const DEMANDADOS_MAX = 10;

// ── Encabezado del documento ─────────────────────────────────────────────────

export function formatLugarYFecha(ciudad: string, fecha: Date = new Date()): string {
    const ciudadStr = ciudad.trim() ? ciudad : '___________________';
    const dia = fecha.getDate();
    const mes = MESES[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${ciudadStr}, ${dia} de ${mes} de ${año}.`;
}

// ── Demandados — operaciones de lista dinámica ───────────────────────────────

export function cleanDemandados(demandados: string[]): string[] {
    return demandados.map((d) => d.trim()).filter((d) => d.length > 0);
}

export function formatDemandadosLista(demandados: string[]): string {
    const limpio = cleanDemandados(demandados);
    if (limpio.length === 0) return '___________________';
    if (limpio.length === 1) return limpio[0];
    if (limpio.length === 2) return `${limpio[0]} y ${limpio[1]}`;
    const ultimo = limpio[limpio.length - 1];
    const resto = limpio.slice(0, -1);
    return `${resto.join(', ')} y ${ultimo}`;
}

export function addDemandado(demandados: string[]): string[] {
    if (demandados.length >= DEMANDADOS_MAX) return demandados;
    return [...demandados, ''];
}

export function removeDemandado(demandados: string[], index: number): string[] {
    const next = demandados.filter((_, i) => i !== index);
    return next.length === 0 ? [''] : next;
}

export function updateDemandado(demandados: string[], index: number, value: string): string[] {
    return demandados.map((d, i) => (i === index ? value : d));
}

// ── Constantes públicas ──────────────────────────────────────────────────────

export const DEMANDADOS_MAX_COUNT = DEMANDADOS_MAX;
