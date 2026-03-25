// Re-export shared utilities from contractUtils
export { formatCOP, formatDate, numberToWordsCOP } from '../arrendamiento/contractUtils';

/**
 * Formats a COP input value with thousands separators for display in form fields.
 */
export function formatCOPInput(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('es-CO').format(parseInt(digits, 10));
}
