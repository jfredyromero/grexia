import type { PagareFormData } from './types';
import { formatCOP, formatDate, numberToWordsCOP, periodoLabel } from './pagareUtils';

interface PagareTemplateProps {
    formData: PagareFormData;
}

function docTypeLabel(tipo: string): string {
    if (tipo === 'CC') return 'cédula de ciudadanía No.';
    if (tipo === 'CE') return 'cédula de extranjería No.';
    if (tipo === 'NIT') return 'NIT No.';
    if (tipo === 'Pasaporte') return 'pasaporte No.';
    return 'documento No.';
}

export default function PagareTemplate({ formData }: PagareTemplateProps) {
    const { acreedor, deudor, obligacion } = formData;

    const valorNum = parseInt(obligacion.valorPrincipal.replace(/\D/g, ''), 10) || 0;
    const valorFormatted = obligacion.valorPrincipal ? formatCOP(obligacion.valorPrincipal) : '$ ___________________';
    const valorWords = valorNum > 0 ? numberToWordsCOP(valorNum).toUpperCase() : '___________________';

    const fechaSuscripcionStr = obligacion.fechaSuscripcion
        ? formatDate(obligacion.fechaSuscripcion)
        : '___________________';
    const fechaVencimientoStr = obligacion.fechaVencimiento
        ? formatDate(obligacion.fechaVencimiento)
        : '___________________';

    const ciudadStr = obligacion.ciudadSuscripcion || '___________________';
    const ciudadDeudorStr = deudor.ciudadResidencia || '___________________';

    const ACREEDOR_DOC = `${docTypeLabel(acreedor.tipoDocumento)} ${acreedor.numeroDocumento || '_______________'}`;
    const DEUDOR_DOC = `${docTypeLabel(deudor.tipoDocumento)} ${deudor.numeroDocumento || '_______________'}`;

    const tasaMora = obligacion.tasaInteresMora
        ? `${obligacion.tasaInteresMora}% mensual`
        : 'tasa máxima legal vigente certificada por la Superintendencia Financiera de Colombia';

    // Payment schedule description
    let pagoDesc: string;
    if (!obligacion.modalidadPago) {
        pagoDesc = 'por definir';
    } else if (obligacion.modalidadPago === 'unico') {
        pagoDesc = `Pago único con vencimiento el ${fechaVencimientoStr}`;
    } else {
        const pl = periodoLabel(obligacion.periodoCuotas, obligacion.numeroCuotas);
        pagoDesc = `${obligacion.numeroCuotas || '___'} cuotas ${pl}`;
    }

    return (
        <div className="relative bg-white font-serif text-[10px] text-slate-800 leading-relaxed">
            {/* ── Watermark ── */}
            <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-10"
                style={{ transform: 'rotate(-42deg)' }}
            >
                <span
                    className="text-[180px] font-black tracking-widest opacity-[0.06] text-[#112F4F]"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                >
                    GREXIA
                </span>
            </div>

            {/* ── Page wrapper ── */}
            <div className="max-w-[794px] mx-auto px-14 py-10">
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-2">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo.svg"
                            alt="Grexia"
                            className="h-7"
                        />
                        <span className="text-lg font-black tracking-[2.5px] text-[#112F4F]">GREXIA</span>
                    </div>
                    {/* Title */}
                    <div className="text-right">
                        <h1 className="text-xl font-black tracking-[2px] text-[#112F4F] leading-tight">PAGARÉ</h1>
                        <p className="text-[9px] text-slate-500 mt-0.5">Título Valor · Código de Comercio</p>
                    </div>
                </div>
                <div className="border-b-[1.5px] border-[#112F4F] mb-4" />

                {/* ── Info Box: Valor + Ciudad/Fecha ── */}
                <div className="flex border-[1.5px] border-[#1b3070] rounded mb-3">
                    <div className="flex-[3] p-3 border-r border-dashed border-[#1b3070]">
                        <p className="text-[7px] font-bold uppercase tracking-[0.6px] text-slate-700 mb-1">
                            Valor del Pagaré
                        </p>
                        <p className="text-[20px] font-black text-slate-900 leading-none mb-1">{valorFormatted}</p>
                        <p className="text-[8px] text-slate-700 uppercase tracking-[0.3px] border-t border-dashed border-slate-300 pt-1 mt-1">
                            SON: {valorWords} M/L
                        </p>
                    </div>
                    <div className="flex-[2] p-3">
                        <p className="text-[7px] font-bold uppercase tracking-[0.6px] text-slate-700 mb-1">
                            Ciudad y Fecha de Suscripción
                        </p>
                        <p className="text-[10px] font-black text-slate-900 mb-1">
                            {ciudadStr}, {fechaSuscripcionStr}
                        </p>
                    </div>
                </div>

                {/* ── Parties Box: Acreedor | Deudor ── */}
                <div className="flex bg-[#EBF4FF] border border-[#1b3070] rounded mb-3">
                    <div className="flex-1 p-3 border-r border-dashed border-[#1b3070]">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-[#1b3070] border-b border-[#1b3070] pb-1 mb-2">
                            Acreedor(a)
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {acreedor.nombreCompleto || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">{acreedor.tipoDocumento || 'Doc.'}: </span>
                            {acreedor.numeroDocumento || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Teléfono: </span>
                            {acreedor.telefono || '___________________'}
                        </p>
                        {acreedor.email && (
                            <p className="text-[9px] text-slate-800 leading-relaxed">
                                <span className="font-bold">Correo: </span>
                                {acreedor.email}
                            </p>
                        )}
                    </div>
                    <div className="flex-1 p-3">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-[#1b3070] border-b border-[#1b3070] pb-1 mb-2">
                            Deudor(a)
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {deudor.nombreCompleto || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">{deudor.tipoDocumento || 'Doc.'}: </span>
                            {deudor.numeroDocumento || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Ciudad: </span>
                            {ciudadDeudorStr}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Teléfono: </span>
                            {deudor.telefono || '___________________'}
                        </p>
                        {deudor.email && (
                            <p className="text-[9px] text-slate-800 leading-relaxed">
                                <span className="font-bold">Correo: </span>
                                {deudor.email}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Intro / Declaration ── */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    Yo, <strong>{deudor.nombreCompleto || '___________________'}</strong>, mayor de edad,
                    identificado(a) con {DEUDOR_DOC}, domiciliado(a) en {ciudadDeudorStr}, declaro que me comprometo a
                    pagar incondicionalmente a la orden de{' '}
                    <strong>{acreedor.nombreCompleto || '___________________'}</strong>, identificado(a) con{' '}
                    {ACREEDOR_DOC}, o a quien represente sus derechos, en la ciudad de <strong>{ciudadStr}</strong> y en
                    las condiciones señaladas en este título valor, la suma de <strong>{valorFormatted}</strong> (
                    {valorWords} M/L), de conformidad con las siguientes estipulaciones:
                </p>

                {/* ── Conditions Box ── */}
                <div className="border border-dashed border-slate-500 rounded p-3 mb-4">
                    <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-slate-700 mb-2">
                        Condiciones de Pago
                    </p>
                    <div className="flex gap-1 text-[9.5px] text-slate-800 leading-[1.55] mb-1">
                        <span className="font-black">Modalidad:</span>
                        <span>{pagoDesc}</span>
                    </div>
                    {obligacion.modalidadPago === 'cuotas' && (
                        <div className="flex gap-1 text-[9.5px] text-slate-800 leading-[1.55] mb-1">
                            <span className="font-black">Cuotas:</span>
                            <span>
                                {obligacion.numeroCuotas || '___'}{' '}
                                {periodoLabel(obligacion.periodoCuotas, obligacion.numeroCuotas)}
                            </span>
                        </div>
                    )}
                    <div className="flex gap-1 text-[9.5px] text-slate-800 leading-[1.55] mb-1">
                        <span className="font-black">Intereses de mora:</span>
                        <span>{tasaMora}</span>
                    </div>
                    <div className="flex gap-1 text-[9.5px] text-slate-800 leading-[1.55]">
                        <span className="font-black">Ciudad de pago:</span>
                        <span>{ciudadStr}</span>
                    </div>
                </div>

                {/* ── Clauses ── */}
                <p className="text-[8px] font-bold uppercase tracking-[0.8px] text-slate-700 border-b border-slate-300 pb-1 mb-3">
                    Cláusulas
                </p>

                {/* PRIMERA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>PRIMERA.</strong> <strong>– OBJETO:</strong> Que por virtud del presente título valor
                        pagaré incondicionalmente a la orden de:{' '}
                        <strong>{acreedor.nombreCompleto || '________________________________'}</strong>, identificado{' '}
                        {ACREEDOR_DOC} o a quien represente sus derechos, en la ciudad y dirección indicados, y en las
                        fechas de amortización por cuotas señaladas en la cláusula tercera de este pagaré, la suma de{' '}
                        <strong>
                            {valorWords} ({valorFormatted})
                        </strong>
                        , más los intereses señalados en la cláusula segunda de este documento.
                    </p>
                </div>

                {/* SEGUNDA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>SEGUNDA.</strong> <strong>– INTERESES:</strong> Que sobre la suma debida se reconocerán
                        intereses corrientes a una tasa nominal mensual del{' '}
                        {obligacion.tasaInteresNominal ? (
                            <>
                                <strong>{obligacion.tasaInteresNominal}%</strong>
                            </>
                        ) : (
                            '____________________________________'
                        )}
                        . Sin embargo, en caso de mora en el cumplimiento de las cuotas señaladas en la cláusula tercera
                        de este pagaré, cancelaré intereses de mora a un tasa nominal mensual del{' '}
                        {obligacion.tasaInteresMora ? (
                            <>
                                <strong>{obligacion.tasaInteresMora}%</strong> mensual
                            </>
                        ) : (
                            '____________________'
                        )}{' '}
                        sobre el saldo de capital que llegue a estar en mora.
                    </p>
                    <div className="mt-2 pl-4 border-l-[1.5px] border-slate-300">
                        <p className="text-[9.5px] text-slate-700 leading-[1.6] text-justify">
                            <span className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.3px] block mb-0.5">
                                Intereses moratorios
                            </span>
                            Los intereses moratorios se causarán sobre las sumas vencidas y no pagadas, desde el día
                            siguiente al del vencimiento de la obligación o de cada cuota, según el caso, hasta el día
                            del pago efectivo.
                        </p>
                    </div>
                </div>

                {/* TERCERA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>TERCERA.</strong> <strong>–PLAZO:</strong>{' '}
                        {obligacion.modalidadPago === 'unico' ? (
                            <>
                                Que pagaré el capital indicado en la cláusula primera de este pagaré en un único pago
                                con vencimiento el <strong>{fechaVencimientoStr}</strong>.
                            </>
                        ) : obligacion.modalidadPago === 'cuotas' ? (
                            <>
                                Que pagaré el capital indicado en la cláusula primera de este pagaré mediante{' '}
                                <strong>{obligacion.numeroCuotas || '____________'}</strong> cuotas iguales,{' '}
                                {periodoLabel(obligacion.periodoCuotas, obligacion.numeroCuotas)} y sucesivas cada una
                                de ellas. La primera de estas cuotas se cancelará el día _____________________ y de allí
                                en adelante en forma {periodoLabel(obligacion.periodoCuotas, '1')} el último día de cada
                                período.
                            </>
                        ) : (
                            <>
                                Que pagaré el capital indicado en la cláusula primera de este pagaré mediante
                                ____________ cuotas iguales, mensuales y sucesivas cada una de ellas por un monto de
                                __________________________. La primera de estas cuotas se cancelará el día
                                _____________________y de allí en adelante en forma mensual el último día de cada mes.
                            </>
                        )}
                    </p>
                    <div className="mt-2 pl-4 border-l-[1.5px] border-slate-300">
                        <p className="text-[9.5px] text-slate-700 leading-[1.6] text-justify">
                            <span className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.3px] block mb-0.5">
                                Transferible por endoso
                            </span>
                            El presente pagaré es transferible por endoso y el tenedor podrá hacer exigible la
                            obligación total o parcialmente según los términos pactados.
                        </p>
                    </div>
                </div>

                {/* CUARTA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>CUARTA.</strong> <strong>–CLAUSULA ACELERATORIA:</strong> El tenedor del presente pagaré
                        podrá declarar vencidos la totalidad de los plazos de esta obligación o de las cuotas que
                        constituyan el saldo de lo debido y exigir su pago inmediato ya sea judicial o
                        extrajudicialmente, cuando el deudor entre en mora o incumpla una cualquiera de las obligaciones
                        derivadas del presente documento.
                    </p>
                    <div className="mt-2 pl-4 border-l-[1.5px] border-slate-300">
                        <p className="text-[9.5px] text-slate-700 leading-[1.6] text-justify">
                            <span className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.3px] block mb-0.5">
                                Mérito ejecutivo
                            </span>
                            El presente pagaré presta mérito ejecutivo y podrá ser cobrado judicialmente sin necesidad
                            de requerimiento previo al deudor, de conformidad con las normas del Código de Comercio y el
                            Código General del Proceso.
                        </p>
                    </div>
                </div>

                {/* QUINTA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>QUINTA</strong> <strong>– IMPUESTO DE TIMBRE:</strong> Los gastos originados por
                        concepto de impuesto de timbre correrán a cargo de EL DEUDOR.
                    </p>
                </div>

                {/* ADICIONAL: Domicilio contractual */}
                <div className="mb-4">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>SEXTA</strong> <strong>– DOMICILIO CONTRACTUAL:</strong> Para todos los efectos legales
                        derivados del presente pagaré, las partes acuerdan como domicilio contractual la ciudad de{' '}
                        <strong>{ciudadStr}</strong>, sin perjuicio de la competencia de otras jurisdicciones que la ley
                        señale de manera imperativa.
                    </p>
                </div>

                {/* ── Closing statement ── */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-10">
                    En Constancia de lo anterior, se suscribe este documento en la ciudad de{' '}
                    <strong>{ciudadStr}</strong> el <strong>{fechaSuscripcionStr}</strong>.
                </p>

                {/* ── Signature blocks ── */}
                <div className="grid grid-cols-2 gap-8 mt-10">
                    {/* Deudor */}
                    <div>
                        <div className="border-t-[1.5px] border-slate-400 pt-2 flex gap-3 items-start">
                            <div className="flex-1">
                                <p className="font-black text-[10px] text-slate-900 mb-0.5">
                                    {deudor.nombreCompleto || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700">
                                    DEUDOR · {deudor.tipoDocumento || 'Doc.'}{' '}
                                    {deudor.numeroDocumento || '___________________'}
                                </p>
                                {deudor.email && <p className="text-[9px] text-slate-700">{deudor.email}</p>}
                            </div>
                            <div className="border border-slate-400 rounded w-14 h-16 flex items-end justify-center pb-1 shrink-0">
                                <span className="text-[7px] text-slate-400 uppercase tracking-[0.5px]">Huella</span>
                            </div>
                        </div>
                    </div>

                    {/* Acreedor */}
                    <div>
                        <div className="border-t-[1.5px] border-slate-400 pt-2 flex gap-3 items-start">
                            <div className="flex-1">
                                <p className="font-black text-[10px] text-slate-900 mb-0.5">
                                    {acreedor.nombreCompleto || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700">
                                    ACREEDOR · {acreedor.tipoDocumento || 'Doc.'}{' '}
                                    {acreedor.numeroDocumento || '___________________'}
                                </p>
                                {acreedor.email && <p className="text-[9px] text-slate-700">{acreedor.email}</p>}
                            </div>
                            <div className="border border-slate-400 rounded w-14 h-16 flex items-end justify-center pb-1 shrink-0">
                                <span className="text-[7px] text-slate-400 uppercase tracking-[0.5px]">Huella</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="mt-10 border-t border-slate-200 pt-2 flex justify-between items-center">
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
