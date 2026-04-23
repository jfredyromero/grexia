import type { LaboralFormData, JornadaTrabajo } from '../types';
import { formatCOP, numberToWordsCOP, formatDuracion, formatJornada } from '../laboralUtils';

const base = import.meta.env.BASE_URL;

interface Props {
    formData: LaboralFormData;
}

function docTypeLabel(tipo: string): string {
    if (tipo === 'CC') return 'cédula de ciudadanía No.';
    if (tipo === 'CE') return 'cédula de extranjería No.';
    if (tipo === 'NIT') return 'NIT No.';
    if (tipo === 'Pasaporte') return 'pasaporte No.';
    return 'documento No.';
}

function frecuenciaLabel(f: string): string {
    if (f === 'mensual') return 'Mensual';
    if (f === 'quincenal') return 'Quincenal';
    if (f === 'semanal') return 'Semanal';
    return f || '___________________';
}

function metodoPagoLabel(m: string): string {
    if (m === 'efectivo') return 'Efectivo';
    if (m === 'transferencia') return 'Transferencia bancaria';
    return m || '___________________';
}

export default function LaboralTerminoFijo({ formData }: Props) {
    const { empleador, trabajador, condicionesTerminoFijo: tf } = formData;

    const salarioNum = parseInt(tf.salario.replace(/\D/g, ''), 10) || 0;
    const salarioFormatted = tf.salario ? formatCOP(tf.salario) : '$ ___________________';
    const salarioWords = salarioNum > 0 ? numberToWordsCOP(salarioNum) : '___________________';

    const duracionStr =
        tf.duracionNumero && tf.duracionUnidad
            ? formatDuracion(tf.duracionNumero, tf.duracionUnidad)
            : '___________________';

    const jornadaStr = tf.jornada ? formatJornada(tf.jornada as JornadaTrabajo) || tf.jornada : '___________________';

    const ciudadStr = empleador.ciudad || '___________________';

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
                        <h1 className="text-xl font-black tracking-[2px] text-[#112F4F] leading-tight">
                            CONTRATO DE TRABAJO A TÉRMINO FIJO
                        </h1>
                        <p className="text-[9px] text-slate-500 mt-0.5">Cód. Sustantivo del Trabajo · Colombia</p>
                    </div>
                </div>
                <div className="border-b-[1.5px] border-[#112F4F] mb-4" />

                {/* Parties box */}
                <div className="flex bg-[#EBF4FF] border border-primary rounded mb-3">
                    <div className="flex-1 p-3 border-r border-dashed border-primary">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-primary border-b border-primary pb-1 mb-2">
                            Empleador
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {empleador.nombreCompleto || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">{empleador.tipoDocumento || 'Doc.'}: </span>
                            {empleador.numeroDocumento || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Ciudad: </span>
                            {empleador.ciudad || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Dirección: </span>
                            {empleador.direccion || '___________________'}
                        </p>
                    </div>
                    <div className="flex-1 p-3">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-primary border-b border-primary pb-1 mb-2">
                            Trabajador
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {trabajador.nombreCompleto || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">{trabajador.tipoDocumento || 'Doc.'}: </span>
                            {trabajador.numeroDocumento || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Ciudad: </span>
                            {trabajador.ciudad || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Dirección: </span>
                            {trabajador.direccion || '___________________'}
                        </p>
                    </div>
                </div>

                {/* Conditions box */}
                <div className="border border-dashed border-slate-500 rounded p-3 mb-4">
                    <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-slate-700 mb-2">
                        Condiciones del Contrato
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[9.5px] text-slate-800">
                        <div className="flex gap-1">
                            <span className="font-black">Cargo:</span>
                            <span>{tf.cargo || '___________________'}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="font-black">Duración:</span>
                            <span>{duracionStr}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="font-black">Salario:</span>
                            <span>
                                {salarioWords} ({salarioFormatted})
                            </span>
                        </div>
                        <div className="flex gap-1">
                            <span className="font-black">Jornada:</span>
                            <span>{jornadaStr}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="font-black">Frecuencia:</span>
                            <span>{frecuenciaLabel(tf.frecuenciaPago)}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="font-black">Método de pago:</span>
                            <span>
                                {metodoPagoLabel(tf.metodoPago)}
                                {tf.metodoPago === 'transferencia' && tf.cuentaBancaria
                                    ? `, Cta. ${tf.cuentaBancaria}`
                                    : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Intro */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                    Entre <strong>{empleador.nombreCompleto || '___________________'}</strong>, mayor de edad,
                    identificado con {docTypeLabel(empleador.tipoDocumento)}{' '}
                    <strong>{empleador.numeroDocumento || '_______________'}</strong>, quien para efectos del presente
                    contrato se identifica como el <strong>EMPLEADOR</strong>; y{' '}
                    <strong>{trabajador.nombreCompleto || '___________________'}</strong>, mayor de edad, identificado
                    con {docTypeLabel(trabajador.tipoDocumento)}{' '}
                    <strong>{trabajador.numeroDocumento || '_______________'}</strong>, residente en la ciudad de{' '}
                    {trabajador.ciudad || '___________________'} en {trabajador.direccion || '___________________'},
                    quien para los efectos del presente contrato se identificará como el <strong>TRABAJADOR</strong>, de
                    manera libre, expresa y voluntaria suscriben contrato de trabajo a término fijo bajo las siguientes
                    condiciones, cláusulas y artículos:
                </p>

                {/* Artículo 1 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Artículo 1. Naturaleza y Objeto:</strong> A través del presente documento se suscribe
                    contrato de trabajo a término fijo, en vigencia del cual el EMPLEADOR contrata al TRABAJADOR para
                    que de forma personal dirija su capacidad de trabajo en aras de la prestación de servicios y
                    desempeño de las actividades propias del cargo de{' '}
                    <strong>{tf.cargo || '___________________'}</strong>, y como contraprestación el EMPLEADOR pagará
                    una remuneración.
                </p>

                {/* Artículo 2 — listas */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] font-bold mb-1">
                        Artículo 2. Obligaciones de las partes:
                    </p>
                    <p className="text-[10px] text-slate-800 font-semibold mb-0.5">Del EMPLEADOR:</p>
                    <ul className="list-disc pl-5 mb-2 space-y-0.5 text-[10px] text-slate-800 leading-[1.65]">
                        <li>Pagar en la forma pactada el monto equivalente a la remuneración.</li>
                        <li>Realizar la afiliación y correspondiente aporte a parafiscales.</li>
                        <li>
                            Dotar al TRABAJADOR de los elementos de trabajo necesarios para el correcto desempeño de la
                            gestión contratada.
                        </li>
                        <li>
                            Las obligaciones especiales enunciadas en los artículos 56 y 57 del Código Sustantivo del
                            Trabajo.
                        </li>
                    </ul>
                    <p className="text-[10px] text-slate-800 font-semibold mb-0.5">Del TRABAJADOR:</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-[10px] text-slate-800 leading-[1.65]">
                        <li>Cumplir a cabalidad con el objeto del contrato, en la forma convenida.</li>
                        <li>
                            Las obligaciones especiales enunciadas en los artículos 56 y 58 del Código Sustantivo del
                            Trabajo.
                        </li>
                    </ul>
                </div>

                {/* Artículo 3 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Artículo 3. Lugar de prestación del servicio:</strong> El TRABAJADOR prestará sus servicios
                    de forma personal en <strong>{tf.lugarPrestacion || '___________________'}</strong>.
                </p>

                {/* Artículo 4 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Artículo 4. Jornada de trabajo:</strong> La jornada de trabajo será de{' '}
                    <strong>{jornadaStr}</strong>, sin exceder las 42 horas semanales permitidas por la ley.
                </p>

                {/* Artículo 5 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Artículo 5. Remuneración:</strong> El EMPLEADOR deberá pagar al TRABAJADOR, a título de
                    remuneración por las actividades, un monto de{' '}
                    <strong>
                        {salarioWords} ({salarioFormatted})
                    </strong>{' '}
                    en moneda legal colombiana.
                </p>

                {/* Artículo 6 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Artículo 6. Forma de pago:</strong> El pago se realizará de forma{' '}
                    <strong>{frecuenciaLabel(tf.frecuenciaPago)}</strong> mediante{' '}
                    <strong>{metodoPagoLabel(tf.metodoPago)}</strong>
                    {tf.metodoPago === 'transferencia' && tf.cuentaBancaria
                        ? `, a la cuenta bancaria No. ${tf.cuentaBancaria}`
                        : ''}
                    .
                </p>

                {/* Artículo 7 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Artículo 7. Duración del contrato:</strong> El presente contrato será por el término de{' '}
                    <strong>{duracionStr}</strong>, prorrogables de forma automática por un término igual al
                    inicialmente pactado si se cumplen las condiciones acordadas entre las partes.
                </p>

                {/* Artículo 8 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Artículo 8. Preaviso:</strong> La parte que desee terminar el contrato deberá notificarlo
                    por escrito dentro de los <strong>30 días</strong> anteriores al vencimiento del término de
                    duración.
                </p>

                {/* Artículo 9 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Artículo 9. Terminación unilateral del contrato:</strong> El presente contrato se podrá
                    terminar unilateralmente y sin indemnización alguna por cualquiera de las partes, siempre y cuando
                    se configure alguna de las situaciones previstas en el artículo 62 del Código Sustantivo del Trabajo
                    o haya incumplimiento grave de alguna cláusula del contrato. Se considera incumplimiento grave el
                    desconocimiento de las obligaciones o prohibiciones previstas en el contrato.
                </p>

                {/* Artículo 10 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Artículo 10. Domicilio de las partes:</strong> Para todos los efectos legales y
                    convencionales, el domicilio de las partes es: el EMPLEADOR: {ciudadStr},{' '}
                    {empleador.direccion || '___________________'}; el TRABAJADOR:{' '}
                    {trabajador.ciudad || '___________________'}, {trabajador.direccion || '___________________'}.
                </p>

                {/* Artículo 11 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-8">
                    <strong>Artículo 11. Integridad:</strong> El presente contrato reemplaza en su integridad y deja sin
                    efecto cualquier acuerdo de voluntades pactado con anterioridad a la suscripción del mismo.
                </p>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 mt-10">
                    <div>
                        <div className="border-t-[1.5px] border-slate-400 pt-2 flex gap-3 items-start">
                            <div className="flex-1">
                                <p className="font-black text-[10px] text-slate-900 mb-0.5">
                                    {empleador.nombreCompleto || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700">
                                    {docTypeLabel(empleador.tipoDocumento)}{' '}
                                    {empleador.numeroDocumento || '_______________'}
                                </p>
                                <p className="text-[9px] text-slate-700 font-bold">EMPLEADOR</p>
                            </div>
                            <div className="border border-slate-400 rounded w-14 h-16 flex items-end justify-center pb-1 shrink-0">
                                <span className="text-[7px] text-slate-400 uppercase tracking-[0.5px]">Huella</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="border-t-[1.5px] border-slate-400 pt-2 flex gap-3 items-start">
                            <div className="flex-1">
                                <p className="font-black text-[10px] text-slate-900 mb-0.5">
                                    {trabajador.nombreCompleto || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700">
                                    {docTypeLabel(trabajador.tipoDocumento)}{' '}
                                    {trabajador.numeroDocumento || '_______________'}
                                </p>
                                <p className="text-[9px] text-slate-700 font-bold">TRABAJADOR</p>
                            </div>
                            <div className="border border-slate-400 rounded w-14 h-16 flex items-end justify-center pb-1 shrink-0">
                                <span className="text-[7px] text-slate-400 uppercase tracking-[0.5px]">Huella</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
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
