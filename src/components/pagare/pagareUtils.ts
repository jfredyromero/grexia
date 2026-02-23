// Re-export shared utilities from contractUtils
export { formatCOP, formatDate, numberToWordsCOP } from '../arrendamiento/contractUtils';

import type { PeriodoCuotas } from './types';

export const PERIODO_LABELS: Record<PeriodoCuotas, string> = {
    mensual: 'mensual',
    bimestral: 'bimestral',
    trimestral: 'trimestral',
};
