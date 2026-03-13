import type { ResultadoLiquidacion } from './interesesUtils';
import { formatCOP, formatPct } from './interesesUtils';

interface InteresesTemplateProps {
    resultado: ResultadoLiquidacion;
}

const base = import.meta.env.BASE_URL;

const ADVERTENCIAS = [
    'Esta liquidación es orientativa y no constituye concepto jurídico ni reemplaza el criterio del juez o árbitro competente.',
    'Las tasas aplicadas corresponden a las certificadas por la Superintendencia Financiera de Colombia para cada período.',
    'La tasa de interés moratorio es equivalente al 1.5 veces la tasa de interés bancario corriente (tasa de usura), conforme al artículo 884 del Código de Comercio.',
    'El cálculo no incluye anatocismo: los intereses se liquidan siempre sobre el capital inicial, no sobre intereses acumulados.',
    'Para períodos posteriores a la última tasa certificada publicada, se aplicó la última tasa disponible como referencia provisional.',
];

function formatDateLabel(iso: string): string {
    const [y, m, d] = iso.split('-');
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
    return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

export default function InteresesTemplate({ resultado }: InteresesTemplateProps) {
    const {
        capital,
        tipo,
        fechaInicio,
        fechaPago,
        diasTotal,
        tasaPromedioPonderada,
        totalIntereses,
        segmentos,
        meses,
    } = resultado;

    const tipoLabel = tipo === 'corriente' ? 'Interés Corriente' : 'Interés Moratorio';

    return (
        <div className="relative bg-white font-serif text-[10px] text-slate-800 leading-relaxed">
            {/* Watermark */}
            <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute inset-0 flex items-center justify-center z-10"
                style={{ transform: 'rotate(-42deg)' }}
            >
                <span
                    className="text-[180px] font-black tracking-widest opacity-[0.06] text-[#112F4F]"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                >
                    GREXIA
                </span>
            </div>

            <div className="max-w-198.5 mx-auto px-14 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <img
                            src={base + 'logo.svg'}
                            alt="Grexia"
                            className="h-7"
                        />

                        <span
                            className="text-[22px] font-black uppercase tracking-[0.05em] text-[#112F4F]"
                            style={{ fontFamily: "'Montserrat', 'Proxima Nova', 'Segoe UI', sans-serif" }}
                        >
                            GREXIA
                        </span>
                    </div>
                    <div className="text-right">
                        <h1 className="text-xl font-black tracking-[2px] text-[#112F4F] leading-tight">LIQUIDADOR</h1>
                        <p className="text-[9px] text-slate-500 mt-0.5">Superfinanciera Colombia</p>
                    </div>
                </div>
                <div className="border-b-[1.5px] border-[#112F4F] mb-4" />

                {/* Sección 1: Resumen */}
                <div className="border-[1.5px] border-primary rounded mb-4">
                    <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-primary px-3 pt-2 mb-2">
                        Resumen de la Liquidación
                    </p>
                    <div className="grid grid-cols-3 border-t border-primary border-dashed">
                        <div className="p-3 border-r border-dashed border-primary">
                            <p className="text-[7px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1">
                                Capital
                            </p>
                            <p className="text-[13px] font-black text-slate-900">{formatCOP(capital)}</p>
                        </div>
                        <div className="p-3 border-r border-dashed border-primary">
                            <p className="text-[7px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1">Tipo</p>
                            <p className="text-[11px] font-black text-slate-900">{tipoLabel}</p>
                        </div>
                        <div className="p-3">
                            <p className="text-[7px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1">
                                Período
                            </p>
                            <p className="text-[9px] font-black text-slate-900">{formatDateLabel(fechaInicio)}</p>
                            <p className="text-[9px] text-slate-600">al {formatDateLabel(fechaPago)}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 border-t border-primary border-dashed">
                        <div className="p-3 border-r border-dashed border-primary">
                            <p className="text-[7px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1">
                                Días totales
                            </p>
                            <p className="text-[13px] font-black text-slate-900">{diasTotal}</p>
                        </div>
                        <div className="p-3 border-r border-dashed border-primary">
                            <p className="text-[7px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1">
                                Tasa prom. ponderada
                            </p>
                            <p className="text-[13px] font-black text-slate-900">
                                {formatPct(tasaPromedioPonderada, 2)} EA
                            </p>
                        </div>
                        <div className="p-3 bg-primary rounded-br">
                            <p className="text-[7px] font-bold uppercase tracking-[0.5px] text-white/70 mb-1">
                                Total intereses
                            </p>
                            <p className="text-[18px] font-black text-white leading-none">
                                {formatCOP(totalIntereses)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sección 2: Detalle por período */}
                <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-slate-700 border-b border-slate-300 pb-1 mb-2">
                    Detalle por período de tasa
                </p>
                <div className="mb-4 border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-[9px]">
                        <thead>
                            <tr className="bg-[#EBF4FF]">
                                <th className="text-left p-2 font-bold text-primary">Período</th>
                                <th className="text-right p-2 font-bold text-primary">Días</th>
                                <th className="text-right p-2 font-bold text-primary">TEA corriente</th>
                                <th className="text-right p-2 font-bold text-primary">TEA aplicada</th>
                                <th className="text-right p-2 font-bold text-primary">Interés causado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {segmentos.map((seg, i) => (
                                <tr
                                    key={i}
                                    className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                                >
                                    <td className="p-2 text-slate-700">{seg.periodoLabel}</td>
                                    <td className="p-2 text-right text-slate-700">{seg.dias}</td>
                                    <td className="p-2 text-right text-slate-700">{formatPct(seg.teaCorriente, 2)}</td>
                                    <td className="p-2 text-right text-slate-700">{formatPct(seg.teaAplicada, 2)}</td>
                                    <td className="p-2 text-right font-semibold text-slate-900">
                                        {formatCOP(seg.interesCausado)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-slate-300 bg-slate-100">
                                <td
                                    className="p-2 font-bold text-slate-800"
                                    colSpan={4}
                                >
                                    Total
                                </td>
                                <td className="p-2 text-right font-black text-primary">{formatCOP(totalIntereses)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Sección 3: Detalle mensual */}
                <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-slate-700 border-b border-slate-300 pb-1 mb-2">
                    Detalle mensual
                </p>
                <div className="mb-4 border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-[9px]">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="text-left p-2 font-bold text-slate-700">Mes</th>
                                <th className="text-right p-2 font-bold text-slate-700">Días</th>
                                <th className="text-right p-2 font-bold text-slate-700">Tasa diaria prom.</th>
                                <th className="text-right p-2 font-bold text-slate-700">Interés del mes</th>
                                <th className="text-right p-2 font-bold text-slate-700">Acumulado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meses.map((m, i) => (
                                <tr
                                    key={i}
                                    className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                                >
                                    <td className="p-2 capitalize text-slate-700">{m.mes}</td>
                                    <td className="p-2 text-right text-slate-700">{m.dias}</td>
                                    <td className="p-2 text-right text-slate-700">
                                        {(m.tasaDiariaPromedio * 100).toFixed(6)}%
                                    </td>
                                    <td className="p-2 text-right text-slate-700">{formatCOP(m.interesMes)}</td>
                                    <td className="p-2 text-right font-semibold text-slate-900">
                                        {formatCOP(m.acumulado)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sección 4: Advertencias */}
                <div className="border border-dashed border-slate-400 rounded p-3 mb-4">
                    <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-slate-600 mb-2">
                        Advertencias legales
                    </p>
                    <ul className="list-none flex flex-col gap-1.5">
                        {ADVERTENCIAS.map((a, i) => (
                            <li
                                key={i}
                                className="flex gap-2 text-[9px] text-slate-600 leading-[1.55]"
                            >
                                <span className="shrink-0 font-bold text-slate-400">{i + 1}.</span>
                                <span>{a}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <p className="text-[7px] text-slate-400">
                        Generado con <span className="text-[#112F4F] font-bold">grexia.co</span>
                    </p>
                    <p className="text-[7px] text-slate-500 text-right">
                        ¿Dudas sobre este documento?{' '}
                        <span className="text-[#112F4F] font-bold">Agenda una asesoría legal</span>
                        {' en '}
                        <span className="text-[#112F4F] font-bold">grexia.co</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
