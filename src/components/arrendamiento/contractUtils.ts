// ── Formatting utilities ──────────────────────────────────────────────────────

export function formatCOP(value: string): string {
    const num = parseInt(value.replace(/\D/g, ''), 10);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(num);
}

export function formatDate(iso: string): string {
    if (!iso) return '___________________';
    const [year, month, day] = iso.split('-');
    const months = [
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
    return `${parseInt(day, 10)} de ${months[parseInt(month, 10) - 1]} de ${year}`;
}

// ── Number-to-words (Colombian Spanish) ──────────────────────────────────────

const ONES = [
    '',
    'UN',
    'DOS',
    'TRES',
    'CUATRO',
    'CINCO',
    'SEIS',
    'SIETE',
    'OCHO',
    'NUEVE',
    'DIEZ',
    'ONCE',
    'DOCE',
    'TRECE',
    'CATORCE',
    'QUINCE',
    'DIECISÉIS',
    'DIECISIETE',
    'DIECIOCHO',
    'DIECINUEVE',
];

const TENS = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];

const HUNDREDS = [
    '',
    'CIENTO',
    'DOSCIENTOS',
    'TRESCIENTOS',
    'CUATROCIENTOS',
    'QUINIENTOS',
    'SEISCIENTOS',
    'SETECIENTOS',
    'OCHOCIENTOS',
    'NOVECIENTOS',
];

export function threeDigits(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const hStr = HUNDREDS[h];
    if (rem === 0) return hStr;
    if (rem < 20) return (hStr ? hStr + ' ' : '') + ONES[rem];
    const t = Math.floor(rem / 10);
    const u = rem % 10;
    const tensStr = u === 0 ? TENS[t] : t === 2 ? 'VEINTI' + ONES[u] : TENS[t] + ' Y ' + ONES[u];
    return (hStr ? hStr + ' ' : '') + tensStr;
}

export function numberToWordsCOP(n: number): string {
    if (n === 0) return 'CERO PESOS';
    const millions = Math.floor(n / 1_000_000);
    const thousands = Math.floor((n % 1_000_000) / 1_000);
    const remainder = n % 1_000;

    const parts: string[] = [];
    if (millions > 0) {
        parts.push(millions === 1 ? 'UN MILLÓN' : threeDigits(millions) + ' MILLONES');
    }
    if (thousands > 0) {
        parts.push(thousands === 1 ? 'MIL' : threeDigits(thousands) + ' MIL');
    }
    if (remainder > 0) {
        parts.push(threeDigits(remainder));
    }

    return parts.join(' ') + ' PESOS';
}
