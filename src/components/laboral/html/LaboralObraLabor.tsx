import type { LaboralFormData } from '../types';
import { formatCOP, numberToWordsCOP } from '../laboralUtils';

const base = import.meta.env.BASE_URL;

interface LaboralObraLaborProps {
    formData: LaboralFormData;
}

function docTypeLabel(tipo: string): string {
    if (tipo === 'CC') return 'cédula de ciudadanía No.';
    if (tipo === 'CE') return 'cédula de extranjería No.';
    if (tipo === 'NIT') return 'NIT No.';
    if (tipo === 'Pasaporte') return 'pasaporte No.';
    return 'documento No.';
}

export default function LaboralObraLabor({ formData }: LaboralObraLaborProps) {
    const { empleador, trabajador, condicionesObraLabor: ol } = formData;

    const salarioNum = parseInt(ol.salario.replace(/\D/g, ''), 10) || 0;
    const salarioFormatted = ol.salario ? formatCOP(ol.salario) : '$ ___________________';
    const salarioWords = salarioNum > 0 ? numberToWordsCOP(salarioNum) : '___________________';

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
                            CONTRATO POR OBRA O LABOR
                        </h1>
                        <p className="text-[9px] text-slate-500 mt-0.5">Cód. Sustantivo del Trabajo · Colombia</p>
                    </div>
                </div>
                <div className="border-b-[1.5px] border-[#112F4F] mb-4" />

                {/* Caja de partes */}
                <div className="flex bg-[#EBF4FF] border border-[#1b3070] rounded mb-3">
                    <div className="flex-1 p-3 border-r border-dashed border-[#1b3070]">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-[#1b3070] border-b border-[#1b3070] pb-1 mb-2">
                            Empleador
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {empleador.nombreCompleto || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800">
                            {docTypeLabel(empleador.tipoDocumento)} {empleador.numeroDocumento || '_______________'}
                        </p>
                        <p className="text-[9px] text-slate-800">{empleador.ciudad || '___________________'}</p>
                        <p className="text-[9px] text-slate-800">{empleador.direccion || '___________________'}</p>
                    </div>
                    <div className="flex-1 p-3">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-[#1b3070] border-b border-[#1b3070] pb-1 mb-2">
                            Trabajador
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {trabajador.nombreCompleto || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800">
                            {docTypeLabel(trabajador.tipoDocumento)} {trabajador.numeroDocumento || '_______________'}
                        </p>
                        <p className="text-[9px] text-slate-800">{trabajador.ciudad || '___________________'}</p>
                        <p className="text-[9px] text-slate-800">{trabajador.direccion || '___________________'}</p>
                    </div>
                </div>

                {/* Caja de datos de la obra */}
                <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 space-y-3">
                    <div>
                        <p className="font-bold uppercase text-[7.5px] tracking-wide text-slate-600 mb-0.5">
                            Obra o Labor
                        </p>
                        <p className="text-[10px] leading-[1.55]">{ol.descripcionObra || '___________________'}</p>
                    </div>
                    <div>
                        <p className="font-bold uppercase text-[7.5px] tracking-wide text-slate-600 mb-0.5">Oficio</p>
                        <p>{ol.oficio || '___________________'}</p>
                    </div>
                    <div>
                        <p className="font-bold uppercase text-[7.5px] tracking-wide text-slate-600 mb-0.5">
                            Salario u Honorarios
                        </p>
                        <p>
                            <strong>{salarioWords}</strong> ({salarioFormatted}),{' '}
                            {ol.modalidadPago || '___________________'}
                        </p>
                    </div>
                    <div>
                        <p className="font-bold uppercase text-[7.5px] tracking-wide text-slate-600 mb-0.5">Lugar</p>
                        <p>{ol.lugar || '___________________'}</p>
                    </div>
                </div>

                {/* Párrafo introductorio de cláusulas */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                    Entre el empleador y el trabajador, de las condiciones ya dichas identificados como aparece al pie
                    de sus correspondientes firmas se ha celebrado el presente contrato individual de trabajo, regido
                    además por las siguientes cláusulas:
                </p>

                {/* Cláusulas */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Primera.</strong> El empleador contrata los servicios personales del trabajador y este se
                    obliga: a) A poner al servicio del empleador toda su capacidad normal de trabajo, en forma exclusiva
                    en el desempeño de las funciones propias del oficio mencionado y las labores anexas y
                    complementarias del mismo, de conformidad con las órdenes e instrucciones que le imparta el
                    empleador o sus representantes, y b) A no prestar directa ni indirectamente servicios laborales a
                    otros empleadores, ni a trabajar por cuenta propia en el mismo oficio, durante la vigencia de este
                    contrato.
                </p>

                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Segunda.</strong> El empleador pagará al trabajador por la prestación de sus servicios el
                    salario indicado, pagadero en las oportunidades también señaladas anteriormente. Dentro de este pago
                    se encuentra incluida la remuneración de los descansos dominicales y festivos de que tratan los
                    capítulos I y II del título VII del Código Sustantivo del Trabajo. Se aclara y se conviene que en
                    los casos en los que el trabajador devengue comisiones o cualquier otra modalidad de salario
                    variable, el 82.5% de dichos ingresos, constituye remuneración ordinaria y el 17.5% restante esta
                    designado a remunerar el descanso en los días dominicales y festivos que tratan los capítulos I y II
                    del título VII del Código Sustantivo de Trabajo.
                </p>

                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Tercera.</strong> Todo trabajo suplementario o en horas extras y todo trabajo en día domingo
                    o festivo en los que legalmente debe concederse el descanso, se remunerará conforme a la Ley, así
                    como los correspondientes recargos nocturnos. Para el reconocimiento y pago del trabajo
                    suplementario, dominical o festivo el empleador o sus representantes deben autorizarlo previamente
                    por escrito. Cuando la necesidad de este trabajo se presente de manera imprevista o inaplazable,
                    deberá ejecutarse y darse cuenta de él por escrito, a la mayor brevedad, al empleador o sus
                    representantes.
                </p>

                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Cuarta.</strong> El trabajador se obliga a laborar la jornada ordinaria en los turnos y
                    dentro de las horas señaladas por el empleador, pudiendo hacer éste ajustes o cambios de horario
                    cuando lo estime conveniente. Por el acuerdo expreso o tácito de las partes, podrán repartirse las
                    horas jornada ordinaria de la forma prevista en el artículo 164 del Código Sustantivo del Trabajo,
                    modificado por el artículo 23 de la Ley 50 de 1990, teniendo en cuenta que los tiempos de descanso
                    entre las secciones de la jornada no se computan dentro de la misma, según el artículo 167 ibídem.
                </p>

                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Quinta.</strong> El presente contrato se celebra por el tiempo que dure la realización de la
                    obra (o labor contratada), según se determino anteriormente.
                </p>

                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Sexta.</strong> Son justas causas para dar por terminado unilateralmente este contrato por
                    cualquiera de las partes, las enumeradas en el artículo 7º del decreto 2351 de 1965; y, además, por
                    parte del empleado, las faltas que para el efecto se califiquen como graves en el espacio reservado
                    para las cláusulas adicionales en el presente contrato.
                </p>

                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Séptima.</strong> Las invenciones o descubrimientos realizados por el trabajador contratado
                    para investigar pertenecen al empleador, de conformidad con el artículo 539 del Código de Comercio,
                    así como el artículo 20 y concordantes de la ley 23 de 1982 sobre derechos de autor. En cualquier
                    otro caso el invento pertenece al trabajador, salvo cuando éste no haya sido contratado para
                    investigar y realice la invención mediante datos o medios conocidos o utilizados en razón de la
                    labor desempeñada, evento en el cual el trabajador, tendrá derecho a una compensación que se fijará
                    de acuerdo con el monto del salario, la importancia del invento o descubrimiento, el beneficio que
                    reporte al empleador u otros factores similares.
                </p>

                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Octava.</strong> Las partes podrán convenir que el trabajo se preste en lugar distinto al
                    inicialmente contratado, siempre que tales traslados no desmejoren las condiciones laborales o de
                    remuneración del trabajador, o impliquen perjuicios para él. Los gastos que se originen con el
                    traslado serán cubiertos por el empleador de conformidad con el numeral 8º del artículo 57 del
                    Código Sustantivo del Trabajo. El trabajador se obliga a aceptar los cambios de oficio que decida el
                    empleador dentro de su poder subordinante, siempre que se respeten las condiciones laborales del
                    trabajador y no se le causen perjuicios.
                </p>

                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>Novena.</strong> Este contrato ha sido redactado estrictamente de acuerdo con la ley y la
                    jurisprudencia y será interpretado de buena fe y en consonancia con el Código Sustantivo del Trabajo
                    cuyo objeto, definido en su artículo 1º, es lograr la justicia en las relaciones entre empleadores y
                    trabajadores dentro de un espíritu de coordinación económica y equilibrio social.
                </p>

                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-8">
                    <strong>Décima.</strong> El presente contrato reemplaza en su integridad y deja sin efecto alguno
                    cualquiera otro contrato verbal o escrito celebrado por las partes con anterioridad. Las
                    modificaciones que se acuerden al presente contrato se anotarán a continuación de su texto.
                </p>

                {/* Cierre antes de firmas */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-center mb-8">
                    Leído el presente documento, de manera libre expresa y voluntaria, firman y suscriben el presente
                    contrato de efectos legales.
                </p>

                {/* Bloques de firma con huella */}
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
