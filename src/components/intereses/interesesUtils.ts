import type { TasaEntry } from '../../data/tasasIntereses';

export type { TasaEntry };

export interface SegmentoPeriodo {
    periodoLabel: string;
    dias: number;
    teaCorriente: number;
    teaAplicada: number;
    interesCausado: number;
}

export interface MesDetalle {
    mes: string;
    dias: number;
    tasaDiariaPromedio: number;
    interesMes: number;
    acumulado: number;
}

export interface ResultadoLiquidacion {
    capital: number;
    tipo: 'corriente' | 'moratorio';
    fechaInicio: string;
    fechaPago: string;
    diasTotal: number;
    tasaPromedioPonderada: number;
    totalIntereses: number;
    segmentos: SegmentoPeriodo[];
    meses: MesDetalle[];
}

const MESES_ES = [
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

function toDate(iso: string): Date {
    return new Date(iso + 'T00:00:00');
}

function addDays(d: Date, n: number): Date {
    return new Date(d.getTime() + n * 86400000);
}

function diffDays(a: Date, b: Date): number {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function tasaDiariaFn(tea: number): number {
    return Math.pow(1 + tea, 1 / 365) - 1;
}

function teaAplicadaFn(tea: number, tipo: 'corriente' | 'moratorio'): number {
    return tipo === 'moratorio' ? tea * 1.5 : tea;
}

function calcularSegmento(
    capital: number,
    tipo: 'corriente' | 'moratorio',
    segInicio: Date,
    segFin: Date,
    tea: number
): { dias: number; interes: number; tasaDiaria: number; teaAplicada: number; teaCorriente: number } {
    const dias = diffDays(segInicio, segFin) + 1;
    const teaAplicada = teaAplicadaFn(tea, tipo);
    const td = tasaDiariaFn(teaAplicada);
    return { dias, interes: capital * td * dias, tasaDiaria: td, teaAplicada, teaCorriente: tea };
}

export function calcularIntereses(
    capital: number,
    tipo: 'corriente' | 'moratorio',
    fechaInicio: string,
    fechaPago: string,
    tasas: TasaEntry[]
): ResultadoLiquidacion {
    const inicio = toDate(fechaInicio);
    const pago = toDate(fechaPago);

    const empty: ResultadoLiquidacion = {
        capital,
        tipo,
        fechaInicio,
        fechaPago,
        diasTotal: 0,
        tasaPromedioPonderada: 0,
        totalIntereses: 0,
        segmentos: [],
        meses: [],
    };

    if (!tasas.length || pago < inicio) return empty;

    const lastTasa = tasas[tasas.length - 1];
    const lastHasta = toDate(lastTasa.hasta);

    const segmentos: SegmentoPeriodo[] = [];
    let diasTotal = 0;
    let totalIntereses = 0;
    let sumPonderadaDias = 0;

    // Process tasa table entries
    for (const tasa of tasas) {
        const tDesde = toDate(tasa.desde);
        const tHasta = toDate(tasa.hasta);

        const segInicio = tDesde > inicio ? tDesde : inicio;
        const segFin = tHasta < pago ? tHasta : pago;

        if (segInicio > segFin) continue;

        const r = calcularSegmento(capital, tipo, segInicio, segFin, tasa.tea);
        if (r.dias <= 0) continue;

        segmentos.push({
            periodoLabel: `${segInicio.toISOString().split('T')[0]} – ${segFin.toISOString().split('T')[0]}`,
            dias: r.dias,
            teaCorriente: tasa.tea,
            teaAplicada: r.teaAplicada,
            interesCausado: r.interes,
        });

        diasTotal += r.dias;
        totalIntereses += r.interes;
        sumPonderadaDias += r.teaAplicada * r.dias;
    }

    // Extension beyond last published tasa
    if (pago > lastHasta) {
        const extStart = addDays(lastHasta, 1);
        const segInicio = extStart > inicio ? extStart : inicio;
        if (segInicio <= pago) {
            const r = calcularSegmento(capital, tipo, segInicio, pago, lastTasa.tea);
            if (r.dias > 0) {
                segmentos.push({
                    periodoLabel: `${segInicio.toISOString().split('T')[0]} – ${pago.toISOString().split('T')[0]} (últ. tasa disponible)`,
                    dias: r.dias,
                    teaCorriente: lastTasa.tea,
                    teaAplicada: r.teaAplicada,
                    interesCausado: r.interes,
                });
                diasTotal += r.dias;
                totalIntereses += r.interes;
                sumPonderadaDias += r.teaAplicada * r.dias;
            }
        }
    }

    const tasaPromedioPonderada = diasTotal > 0 ? sumPonderadaDias / diasTotal : 0;

    // Monthly detail
    const meses = buildMonthlyDetail(capital, tipo, inicio, pago, tasas, lastTasa);

    return {
        capital,
        tipo,
        fechaInicio,
        fechaPago,
        diasTotal,
        tasaPromedioPonderada,
        totalIntereses,
        segmentos,
        meses,
    };
}

function buildMonthlyDetail(
    capital: number,
    tipo: 'corriente' | 'moratorio',
    inicio: Date,
    pago: Date,
    tasas: TasaEntry[],
    lastTasa: TasaEntry
): MesDetalle[] {
    const meses: MesDetalle[] = [];
    let acumulado = 0;
    const lastHasta = toDate(lastTasa.hasta);

    let monthStart = new Date(inicio.getFullYear(), inicio.getMonth(), 1);

    while (monthStart <= pago) {
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

        const segInicio = monthStart > inicio ? monthStart : inicio;
        const segFin = monthEnd < pago ? monthEnd : pago;

        if (segInicio > segFin) {
            monthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
            continue;
        }

        const dias = diffDays(segInicio, segFin) + 1;
        let monthInterest = 0;
        let sumTdDias = 0;

        for (const tasa of tasas) {
            const tDesde = toDate(tasa.desde);
            const tHasta = toDate(tasa.hasta);

            const subInicio = tDesde > segInicio ? tDesde : segInicio;
            const subFin = tHasta < segFin ? tHasta : segFin;

            if (subInicio > subFin) continue;

            const r = calcularSegmento(capital, tipo, subInicio, subFin, tasa.tea);
            if (r.dias <= 0) continue;
            monthInterest += r.interes;
            sumTdDias += r.tasaDiaria * r.dias;
        }

        // Extension
        if (segFin > lastHasta) {
            const extStart = addDays(lastHasta, 1);
            const subInicio = extStart > segInicio ? extStart : segInicio;
            if (subInicio <= segFin) {
                const r = calcularSegmento(capital, tipo, subInicio, segFin, lastTasa.tea);
                if (r.dias > 0) {
                    monthInterest += r.interes;
                    sumTdDias += r.tasaDiaria * r.dias;
                }
            }
        }

        acumulado += monthInterest;

        meses.push({
            mes: `${MESES_ES[monthStart.getMonth()]} ${monthStart.getFullYear()}`,
            dias,
            tasaDiariaPromedio: dias > 0 ? sumTdDias / dias : 0,
            interesMes: monthInterest,
            acumulado,
        });

        monthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    }

    return meses;
}

export function formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(
        value
    );
}

export function formatPct(value: number, decimals = 4): string {
    return (value * 100).toFixed(decimals) + '%';
}

export function formatCOPInput(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('es-CO').format(parseInt(digits, 10));
}
