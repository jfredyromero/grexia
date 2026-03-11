// Re-export shared utilities from contractUtils
export { formatCOP, formatDate, numberToWordsCOP } from '../arrendamiento/contractUtils';

import type { PeriodoCuotas } from './types';

export const PERIODO_LABELS: Record<PeriodoCuotas, string> = {
    mensual: 'mensual',
    bimestral: 'bimestral',
    trimestral: 'trimestral',
};

export function periodoLabel(periodo: string, n: string | number): string {
    const num = typeof n === 'string' ? parseInt(n, 10) || 1 : n;
    const base = PERIODO_LABELS[periodo as PeriodoCuotas] ?? periodo;
    if (num === 1) return base;
    return base + 'es';
}
