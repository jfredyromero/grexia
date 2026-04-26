import type { PoderFormData } from '../types';
import { getTipoProcesoConfig, tipoProcesoHasInmueble, tipoProcesoHasDemandados } from '../types';
import { formatLugarYFecha, formatDemandadosLista } from '../poderUtils';

const base = import.meta.env.BASE_URL;

interface Props {
    formData: PoderFormData;
}

export default function PoderEspecial({ formData }: Props) {
    const { poderdante, apoderado, proceso, tipoProceso } = formData;

    const cfg = getTipoProcesoConfig(tipoProceso);
    const hasInmueble = tipoProcesoHasInmueble(tipoProceso);
    const hasDemandados = tipoProcesoHasDemandados(tipoProceso);
    const tipoLabel = cfg?.labelDocumento ?? '___________________';

    const lugarFecha = formatLugarYFecha(poderdante.ciudadPoderdante);
    const demandadosStr = formatDemandadosLista(proceso.demandados);

    const placeholder = '___________________';

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
                            PODER ESPECIAL
                        </h1>
                        <p className="text-[9px] text-slate-500 mt-0.5">Art. 74 y 77 Código General del Proceso</p>
                    </div>
                </div>
                <div className="border-b-[1.5px] border-[#112F4F] mb-4" />

                {/* Lugar y fecha */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-right mb-4">{lugarFecha}</p>

                {/* Tipo de proceso destacado */}
                <div className="border border-dashed border-slate-500 rounded p-3 mb-5 text-center">
                    <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-slate-700 mb-1">Asunto</p>
                    <p className="font-black text-[12px] text-[#112F4F] tracking-wide">{tipoLabel}</p>
                </div>

                {/* Caja de partes */}
                <div className="flex bg-[#EBF4FF] border border-[#1b3070] rounded mb-5">
                    <div className="flex-1 p-3 border-r border-dashed border-[#1b3070]">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-[#1b3070] border-b border-[#1b3070] pb-1 mb-2">
                            Poderdante
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {poderdante.nombreCompleto || placeholder}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">C.C.: </span>
                            {poderdante.ccPoderdante || placeholder}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Expedida en: </span>
                            {poderdante.lugarExpedicionPoderdante || placeholder}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Domicilio: </span>
                            {poderdante.ciudadPoderdante || placeholder}
                        </p>
                    </div>
                    <div className="flex-1 p-3">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-[#1b3070] border-b border-[#1b3070] pb-1 mb-2">
                            Apoderado(a)
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {apoderado.nombreCompleto || placeholder}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">C.C.: </span>
                            {apoderado.ccApoderado || placeholder}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">T.P.: </span>
                            {apoderado.tarjetaProfesional || placeholder}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Vecino(a) de: </span>
                            {apoderado.ciudadApoderado || placeholder}
                        </p>
                    </div>
                </div>

                {/* Cuerpo principal del poder */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                    <strong>{poderdante.nombreCompleto || placeholder}</strong>, identificado(a) con cédula de
                    ciudadanía No. <strong>{poderdante.ccPoderdante || placeholder}</strong>, expedida en{' '}
                    {poderdante.lugarExpedicionPoderdante || placeholder}, domiciliado(a) y residente en la ciudad de{' '}
                    {poderdante.ciudadPoderdante || placeholder}
                    {hasInmueble && (
                        <>
                            , propietario(a) del inmueble ubicado en{' '}
                            <strong>{poderdante.direccionInmueble || placeholder}</strong>, con matrícula inmobiliaria
                            No. <strong>{poderdante.matriculaInmobiliaria || placeholder}</strong>
                        </>
                    )}
                    , obrando en nombre propio, confiero <strong>PODER ESPECIAL, AMPLIO Y SUFICIENTE</strong> a{' '}
                    <strong>{apoderado.nombreCompleto || placeholder}</strong>, mayor de edad y vecino(a) de{' '}
                    {apoderado.ciudadApoderado || placeholder}, identificado(a) con cédula de ciudadanía No.{' '}
                    <strong>{apoderado.ccApoderado || placeholder}</strong>, expedida en{' '}
                    {apoderado.lugarExpedicionApoderado || placeholder}, abogado(a) en ejercicio y portador(a) de la
                    Tarjeta Profesional número <strong>{apoderado.tarjetaProfesional || placeholder}</strong> del{' '}
                    <strong>Consejo Superior de la Judicatura</strong>, quien queda facultado(a) para que, en mi nombre
                    y representación, adelante el <strong>{tipoLabel}</strong>
                    {hasInmueble && (
                        <>
                            {' '}
                            sobre el inmueble ubicado en <strong>{poderdante.direccionInmueble || placeholder}</strong>,
                            con matrícula inmobiliaria No.{' '}
                            <strong>{poderdante.matriculaInmobiliaria || placeholder}</strong>
                        </>
                    )}
                    {hasDemandados && (
                        <>
                            , en contra de <strong>{demandadosStr}</strong>
                        </>
                    )}
                    .
                </p>

                {/* Objeto libre cuando no hay demandados */}
                {!hasDemandados && (
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                        <strong>Objeto del poder: </strong>
                        {proceso.objetoPoder || placeholder}
                    </p>
                )}

                {/* Facultades generales */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                    Mi apoderado(a) queda ampliamente facultado(a) para presentar toda clase de escritos, solicitar y
                    aportar los documentos que sean necesarios, gestionar ante las autoridades, entidades públicas y
                    privadas que corresponda, y realizar todas las actuaciones procesales o extraprocesales pertinentes
                    para el cabal ejercicio de este poder.
                </p>

                {/* Facultades del artículo 77 */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-10">
                    Mi apoderado(a) queda facultado(a) de conformidad con el <strong>artículo 77</strong> del Código
                    General del Proceso y, en especial, para cobrar y recibir, desistir, conciliar, transigir. Del mismo
                    modo, para presentar recursos, aportar y solicitar pruebas, sustituir este poder, revocar las
                    respectivas sustituciones y, en general, para llevar a cabo todas las diligencias necesarias para el
                    ejercicio de este poder.
                </p>

                {/* Firma del poderdante */}
                <div className="grid grid-cols-2 gap-8 mt-12">
                    <div>
                        <div className="border-t-[1.5px] border-slate-400 pt-2 flex gap-3 items-start">
                            <div className="flex-1">
                                <p className="font-black text-[10px] text-slate-900 mb-0.5">
                                    {poderdante.nombreCompleto || placeholder}
                                </p>
                                <p className="text-[9px] text-slate-700">
                                    C.C. No. {poderdante.ccPoderdante || placeholder} expedida en{' '}
                                    {poderdante.lugarExpedicionPoderdante || placeholder}.
                                </p>
                                <p className="text-[9px] text-slate-700 font-bold">PODERDANTE</p>
                            </div>
                            <div className="border border-slate-400 rounded w-14 h-16 flex items-end justify-center pb-1 shrink-0">
                                <span className="text-[7px] text-slate-400 uppercase tracking-[0.5px]">Huella</span>
                            </div>
                        </div>
                    </div>
                    <div />
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
