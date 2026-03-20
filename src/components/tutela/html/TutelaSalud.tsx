import type { TutelaFormData } from '../types';
import {
    generarTextoHechos,
    generarPretensiones,
    generarListaAnexos,
    getEPSDisplay,
    getFechaHoy,
} from '../tutelaUtils';

const base = import.meta.env.BASE_URL;

interface Props {
    formData: TutelaFormData;
    hechosIA?: string | null;
}

export default function TutelaSaludTemplate({ formData, hechosIA }: Props) {
    const eps = getEPSDisplay(formData);
    const fechaHoy = getFechaHoy();
    const textoHechos = hechosIA ?? generarTextoHechos(formData);
    const pretensiones = generarPretensiones(formData);
    const anexos = generarListaAnexos(formData);

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
                            ACCIÓN DE TUTELA
                        </h1>
                        <p className="text-[9px] text-slate-500 mt-0.5">Derecho a la Salud · Art. 86 C.P.</p>
                    </div>
                </div>
                <div className="border-b-[1.5px] border-[#112F4F] mb-4" />

                {/* Encabezado formal */}
                <p className="text-[10px] text-slate-700 mb-1">{fechaHoy}</p>
                <p className="text-[10px] font-bold text-slate-800 mb-0.5">Señor:</p>
                <p className="text-[10px] font-bold text-slate-800 mb-0.5">JUEZ CONSTITUCIONAL DE TUTELA (REPARTO)</p>
                <p className="text-[10px] text-slate-700 mb-4">E. S. D.</p>

                {/* Parties box */}
                <div className="flex bg-[#EBF4FF] border border-primary rounded mb-4">
                    <div className="flex-1 p-3 border-r border-dashed border-primary">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-primary border-b border-primary pb-1 mb-2">
                            Parte Accionante
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {formData.nombreCompleto || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">C.C. No.: </span>
                            {formData.cedula || '___________________'}
                        </p>
                        {formData.correo && (
                            <p className="text-[9px] text-slate-800 leading-relaxed">
                                <span className="font-bold">Correo: </span>
                                {formData.correo}
                            </p>
                        )}
                        {formData.telefono && (
                            <p className="text-[9px] text-slate-800 leading-relaxed">
                                <span className="font-bold">Cel: </span>
                                {formData.telefono}
                            </p>
                        )}
                    </div>
                    <div className="flex-1 p-3">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-primary border-b border-primary pb-1 mb-2">
                            Parte Accionada
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">{eps}</p>
                        {formData.regimen && (
                            <p className="text-[9px] text-slate-800 leading-relaxed">
                                <span className="font-bold">Régimen: </span>
                                {formData.regimen === 'contributivo' ? 'Contributivo' : 'Subsidiado'}
                            </p>
                        )}
                        {formData.sedeEPS && (
                            <p className="text-[9px] text-slate-800 leading-relaxed">
                                <span className="font-bold">Sede: </span>
                                {formData.sedeEPS}
                            </p>
                        )}
                        {formData.correoEPS && (
                            <p className="text-[9px] text-slate-800 leading-relaxed">
                                <span className="font-bold">Correo: </span>
                                {formData.correoEPS}
                            </p>
                        )}
                    </div>
                </div>

                {/* Párrafo introductorio */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                    <strong>{formData.nombreCompleto || '___________________'}</strong>, mayor de edad, identificado(a)
                    con cédula de ciudadanía No. <strong>{formData.cedula || '___________________'}</strong> de{' '}
                    {formData.ciudad || '___________________'}, domiciliado(a) en la ciudad de{' '}
                    <strong>{formData.ciudad || '___________________'}</strong>, actuando en nombre propio, en ejercicio
                    del derecho consagrado en el artículo 86 de la Constitución Política y reglamentado por el Decreto
                    2591 de 1991, interpongo la presente <strong>ACCIÓN DE TUTELA</strong> para la protección inmediata
                    de mis derechos fundamentales a{' '}
                    <strong>LA VIDA, A LA SALUD, A LA INTEGRIDAD PERSONAL Y A LA DIGNIDAD HUMANA</strong>, derechos
                    fundamentales, constitucionales y conexos, los cuales están siendo vulnerados por{' '}
                    <strong>{eps}</strong>.
                </p>

                {/* I. HECHOS */}
                <p className="text-[10px] font-black uppercase tracking-[1px] text-[#112F4F] border-b border-slate-300 pb-1 mb-3">
                    I. HECHOS
                </p>
                {textoHechos.split('\n\n').map((parrafo, i) => (
                    <p
                        key={i}
                        className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3"
                    >
                        {parrafo}
                    </p>
                ))}

                {/* II. Medida provisional */}
                <p className="text-[10px] font-black uppercase tracking-[1px] text-[#112F4F] border-b border-slate-300 pb-1 mb-3">
                    II. MEDIDA PROVISIONAL
                </p>
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                    Solicito, con fundamento en el artículo 7 del Decreto 2591 de 1991, que se ORDENE de MANERA
                    INMEDIATA a <strong>{eps}</strong> AUTORIZAR, cubrir y efectuar la entrega de medicamentos y todo
                    procedimiento, examen y tratamiento prescritos por los profesionales de la salud y médicos
                    tratantes.
                </p>

                {/* III. Pretensiones */}
                <p className="text-[10px] font-black uppercase tracking-[1px] text-[#112F4F] border-b border-slate-300 pb-1 mb-3">
                    III. PRETENSIONES
                </p>
                <ol className="list-decimal list-inside mb-4 flex flex-col gap-2">
                    {pretensiones.map((p, i) => (
                        <li
                            key={i}
                            className="text-[10px] text-slate-800 leading-[1.65] text-justify"
                        >
                            {p}
                        </li>
                    ))}
                </ol>
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                    Prevenir a las entidades accionadas, que en ningún caso vuelvan a incurrir en las acciones que
                    dieron mérito a iniciar esta tutela y que si lo hacen serán sancionados conforme lo dispone el Art.
                    52 del Decreto 2591/91.
                </p>

                {/* IV. Derechos fundamentales */}
                <p className="text-[10px] font-black uppercase tracking-[1px] text-[#112F4F] border-b border-slate-300 pb-1 mb-3">
                    IV. DERECHOS FUNDAMENTALES VULNERADOS
                </p>
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                    La actuación de <strong>{eps}</strong> vulnera directamente mis derechos fundamentales a la SALUD, A
                    LA VIDA, A LA INTEGRIDAD PERSONAL, A LA DIGNIDAD HUMANA entre otros derechos fundamentales conexos
                    anteriormente descritos. La acción de tutela instituida en la constitución nacional en el artículo
                    86 tiene como finalidad evitar la violación de los derechos constitucionales fundamentales de la
                    persona cuando se encuentren amenazados o vulnerados, por la acción u omisión de una entidad pública
                    o por particulares sin que ello implique una instancia adicional a los procedimientos establecidos
                    en las normas procesales pertinentes. Referente a los anteriores hechos estimó que las entidades
                    accionadas están violando mis derechos fundamentales a la SALUD Y VIDA DIGNA al sustraerse de su
                    obligación prestacional asumida, desconociendo un derecho que la ley me otorga, imposibilitando el
                    desarrollo pleno de mis actividades cotidianas y agregando un riesgo a mi salud irreversible.
                </p>

                {/* V. Violación al derecho a la salud */}
                <p className="text-[10px] font-black uppercase tracking-[1px] text-[#112F4F] border-b border-slate-300 pb-1 mb-3">
                    V. VIOLACIÓN AL DERECHO A LA SALUD Y VIDA DIGNA
                </p>
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                    La violación al derecho fundamental invocado está consagrado en el artículo 49 de la constitución
                    dice que: corresponde al Estado organizar, dirigir y reglamentar la prestación de servicios de salud
                    a los habitantes y de saneamiento ambiental conforme a los principios de eficiencia, universalidad y
                    solidaridad. Adicionalmente a la violacion al precepto constitucional, en el presente caso se
                    vulneran los mandatos legales consagrados en la Ley 1751 de 2015 que define los principios del
                    derecho fundamental a la salud. Encontrando una violacion directa de los elementos de:
                    Disponibilidad, Accesibilidad, Universalidad, Pro homine, Oportunidad y Eficiencia. Según la
                    jurisprudencia constitucional y la sentencia T 760 de 2008, si una persona alega que requiere un
                    servicio con necesidad, la entidad encargada de asegurar la prestación del servicio tiene la
                    obligación de autorizarlo.
                </p>

                {/* VI. Fundamentos jurídicos */}
                <p className="text-[10px] font-black uppercase tracking-[1px] text-[#112F4F] border-b border-slate-300 pb-1 mb-3">
                    VI. FUNDAMENTOS JURÍDICOS
                </p>
                <ul className="mb-4 flex flex-col gap-1">
                    {[
                        'Constitución Política de Colombia: artículos 1, 11, 48, 49 y 86.',
                        'Ley 1751 de 2015: artículos 2, 6 y 10 numeral 5.',
                        'Decreto 780 de 2016: artículo 10.',
                        'Sentencia T-760 de 2008 (Corte Constitucional): garantiza la continuidad e integralidad en la atención médica.',
                        'Resolución 229 de 2020 (Minsalud): establece la responsabilidad de la EPS para garantizar atención en cualquier nivel de complejidad.',
                    ].map((item, i) => (
                        <li
                            key={i}
                            className="text-[10px] text-slate-800 leading-[1.65] flex gap-2"
                        >
                            <span className="text-primary shrink-0">—</span>
                            {item}
                        </li>
                    ))}
                </ul>

                {/* VII. Procedencia */}
                <p className="text-[10px] font-black uppercase tracking-[1px] text-[#112F4F] border-b border-slate-300 pb-1 mb-3">
                    VII. PROCEDENCIA Y LEGITIMIDAD
                </p>
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-4">
                    La presente Acción de Tutela es procedente de conformidad con lo establecido en los artículos 1, 2,
                    5 y 9 del Decreto 2591 de 1991, teniendo en cuenta que carezco de otro medio de defensa para los
                    fines de esta acción. La acción de tutela está consagrada en el artículo 86 de la Constitución
                    Política como un mecanismo procesal específico y directo cuyo objeto es la protección eficaz,
                    concreta e inmediata de los derechos constitucionales fundamentales cuando éstos resulten amenazados
                    o vulnerados por la acción o la omisión de una autoridad pública o de un particular.
                </p>

                {/* Anexos */}
                {anexos.length > 0 && (
                    <>
                        <p className="text-[10px] font-black uppercase tracking-[1px] text-[#112F4F] border-b border-slate-300 pb-1 mb-3">
                            VIII. ANEXOS Y PRUEBAS
                        </p>
                        <ul className="mb-4 flex flex-col gap-1">
                            {anexos.map((doc, i) => (
                                <li
                                    key={i}
                                    className="text-[10px] text-slate-800 leading-[1.65] flex gap-2"
                                >
                                    <span className="shrink-0">{i + 1}.</span>
                                    {doc}
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {/* IX. Juramento */}
                <p className="text-[10px] font-black uppercase tracking-[1px] text-[#112F4F] border-b border-slate-300 pb-1 mb-3">
                    IX. JURAMENTO
                </p>
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-6">
                    Bajo la gravedad de juramento, manifiesto que no he presentado otra acción de tutela con el mismo
                    objeto ni ante otra autoridad judicial.
                </p>

                {/* X. Notificaciones — SigBlocks */}
                <p className="text-[10px] font-black uppercase tracking-[1px] text-[#112F4F] border-b border-slate-300 pb-1 mb-3">
                    X. NOTIFICACIONES
                </p>
                <div className="grid grid-cols-2 gap-8 mt-10">
                    {/* Accionante — con huella */}
                    <div>
                        <div className="border-t-[1.5px] border-slate-400 pt-2 flex gap-3 items-start">
                            <div className="flex-1">
                                <p className="font-black text-[10px] text-slate-900 mb-0.5">
                                    {formData.nombreCompleto || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700">
                                    C.C. {formData.cedula || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700 font-bold">ACCIONANTE</p>
                            </div>
                            <div className="border border-slate-400 rounded w-14 h-16 flex items-end justify-center pb-1 shrink-0">
                                <span className="text-[7px] text-slate-400 uppercase tracking-[0.5px]">Huella</span>
                            </div>
                        </div>
                    </div>
                    {/* Accionada — sin huella */}
                    <div>
                        <div className="border-t-[1.5px] border-slate-400 pt-2">
                            <p className="font-black text-[10px] text-slate-900 mb-0.5">{eps}</p>
                            {formData.sedeEPS && <p className="text-[9px] text-slate-700">{formData.sedeEPS}</p>}
                            <p className="text-[9px] text-slate-700 font-bold">PARTE ACCIONADA</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 border-t border-slate-200 pt-2 flex justify-between items-center">
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
