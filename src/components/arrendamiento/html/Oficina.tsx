import type { ArrendamientoFormData, PlanTier } from '../types';
import { formatCOP, formatDate, numberToWordsCOP } from '../contractUtils';

interface OficinaProps {
    formData: ArrendamientoFormData;
    plan?: PlanTier;
    logoUrl?: string;
}

function docTypeLabel(tipo: string): string {
    if (tipo === 'CC') return 'cédula de ciudadanía No.';
    if (tipo === 'CE') return 'cédula de extranjería No.';
    if (tipo === 'Pasaporte') return 'pasaporte No.';
    if (tipo === 'NIT') return 'NIT No.';
    return 'documento No.';
}

export default function OficinaTemplate({ formData, plan = 'free', logoUrl }: OficinaProps) {
    const { inmueble, arrendador, arrendatario, coarrendatario, condiciones } = formData;
    const canonNum = parseInt(condiciones.canonMensual.replace(/\D/g, ''), 10) || 0;
    const depositoNum = parseInt(condiciones.depositoCOP.replace(/\D/g, ''), 10) || 0;
    const depositoMeses = canonNum > 0 ? Math.round(depositoNum / canonNum) : 1;
    const fechaStr = formatDate(condiciones.fechaInicio);
    const ciudadStr = inmueble.ciudad || '___________________';
    const isFree = plan === 'free';
    const isPaid = plan === 'empresarial';

    const ARR_DOC = `${docTypeLabel(arrendador.tipoDocumento)} ${arrendador.numeroDocumento || '_______________'}`;
    const ATA_DOC = `${docTypeLabel(arrendatario.tipoDocumento)} ${arrendatario.numeroDocumento || '_______________'}`;
    const CO_DOC = coarrendatario
        ? `${docTypeLabel(coarrendatario.tipoDocumento)} ${coarrendatario.numeroDocumento || '_______________'}`
        : '_______________';

    const arrendadorDocLabel = arrendador.tipoDocumento || 'Doc.';
    const arrendatarioDocLabel = arrendatario.tipoDocumento || 'Doc.';

    const diaPago = String(condiciones.diaPagoMes);
    const duracionLabel =
        condiciones.duracionMeses === 1
            ? 'un (1) mes'
            : condiciones.duracionMeses === 12
              ? 'doce (12) meses'
              : condiciones.duracionMeses === 24
                ? 'veinticuatro (24) meses'
                : `${condiciones.duracionMeses} meses`;

    const actividadComercial = condiciones.actividadComercial || '_______________';

    return (
        <div
            id="contract-content"
            className="relative bg-white rounded-lg font-serif text-sm text-slate-800 leading-relaxed"
        >
            {isFree && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: '44%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-42deg)',
                        fontSize: '76px',
                        fontWeight: 900,
                        color: 'rgba(17, 47, 79, 0.10)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        zIndex: 0,
                        fontFamily: "'Montserrat', 'Proxima Nova', 'Segoe UI', sans-serif",
                        letterSpacing: '8px',
                    }}
                >
                    LEXIA
                </div>
            )}

            <div
                className="p-8 lg:p-10"
                style={{ position: 'relative', zIndex: 1 }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-3">
                    {!isPaid ? (
                        <div className="flex items-center gap-[10px]">
                            <img
                                src="/logo.svg"
                                alt="Lexia"
                                className="h-[38px] w-[38px] shrink-0 object-contain"
                            />
                            <div className="h-[30px] w-px bg-slate-200 shrink-0" />
                            <span
                                className="text-[22px] font-black uppercase tracking-[0.05em] text-[#112F4F]"
                                style={{ fontFamily: "'Montserrat', 'Proxima Nova', 'Segoe UI', sans-serif" }}
                            >
                                LEXIA
                            </span>
                        </div>
                    ) : logoUrl ? (
                        <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-12 max-w-[130px] object-contain"
                        />
                    ) : (
                        <div className="h-[38px]" />
                    )}
                    <div className="text-right">
                        <h1 className="text-[22px] font-black uppercase tracking-[0.06em] text-[#112F4F] leading-none">
                            CONTRATO DE ARRENDAMIENTO
                        </h1>
                        <p className="text-[9px] text-slate-500 mt-1">Contrato de Oficina</p>
                    </div>
                </div>
                <hr className="border-0 border-t-2 border-[#1b3070] mb-5" />

                {/* ── Info box: Canon + Ciudad/Fecha ── */}
                <div
                    className="flex mb-4"
                    style={{ border: '1.5px solid #1b3070', borderRadius: '4px' }}
                >
                    <div
                        className="flex-1 p-3"
                        style={{ borderRight: '1px dashed #1b3070' }}
                    >
                        <p
                            className="text-[9px] font-bold uppercase tracking-wide text-slate-600 mb-1"
                            style={{ fontFamily: 'sans-serif' }}
                        >
                            Canon Mensual de Arrendamiento
                        </p>
                        <p className="text-2xl font-black text-slate-900 leading-none mb-1">
                            {formatCOP(condiciones.canonMensual)}
                        </p>
                        <p
                            className="text-[8px] uppercase tracking-wide text-slate-600 border-t border-dashed border-slate-300 pt-1 mt-1"
                            style={{ fontFamily: 'sans-serif' }}
                        >
                            SON: {numberToWordsCOP(canonNum)} M/L
                        </p>
                    </div>
                    <div
                        className="p-3"
                        style={{ flex: '0 0 42%' }}
                    >
                        <p
                            className="text-[9px] font-bold uppercase tracking-wide text-slate-600 mb-1"
                            style={{ fontFamily: 'sans-serif' }}
                        >
                            Ciudad y Fecha de Suscripción
                        </p>
                        <p className="font-bold text-slate-900">
                            {ciudadStr}, {fechaStr}
                        </p>
                    </div>
                </div>

                {/* ── Parties box: Arrendador | Arrendatario ── */}
                <div
                    className="flex mb-4"
                    style={{ backgroundColor: '#EBF4FF', border: '1px solid #1b3070', borderRadius: '4px' }}
                >
                    <div
                        className="flex-1 p-3"
                        style={{ borderRight: '1px dashed #1b3070' }}
                    >
                        <p
                            className="text-[8px] font-bold uppercase tracking-wide text-[#1b3070] pb-1 mb-2 border-b border-[#1b3070]"
                            style={{ fontFamily: 'sans-serif' }}
                        >
                            Arrendador(a)
                        </p>
                        <p className="font-bold text-slate-900 text-[11px]">
                            {arrendador.nombreCompleto || '___________________'}
                        </p>
                        <p className="text-[10px] text-slate-700">
                            <span style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>{arrendadorDocLabel}: </span>
                            {arrendador.numeroDocumento || '___________________'}
                        </p>
                        <p className="text-[10px] text-slate-700">
                            <span style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>Teléfono: </span>
                            {arrendador.telefono || '___________________'}
                        </p>
                        {arrendador.email && (
                            <p className="text-[10px] text-slate-700">
                                <span style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>Correo: </span>
                                {arrendador.email}
                            </p>
                        )}
                    </div>
                    <div className="flex-1 p-3">
                        <p
                            className="text-[8px] font-bold uppercase tracking-wide text-[#1b3070] pb-1 mb-2 border-b border-[#1b3070]"
                            style={{ fontFamily: 'sans-serif' }}
                        >
                            Arrendatario(a)
                        </p>
                        <p className="font-bold text-slate-900 text-[11px]">
                            {arrendatario.nombreCompleto || '___________________'}
                        </p>
                        <p className="text-[10px] text-slate-700">
                            <span style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>{arrendatarioDocLabel}: </span>
                            {arrendatario.numeroDocumento || '___________________'}
                        </p>
                        <p className="text-[10px] text-slate-700">
                            <span style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>Dirección Inmueble: </span>
                            {inmueble.direccion || '___________________'}
                        </p>
                        <p className="text-[10px] text-slate-700">
                            <span style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>Teléfono: </span>
                            {arrendatario.telefono || '___________________'}
                        </p>
                        {arrendatario.email && (
                            <p className="text-[10px] text-slate-700">
                                <span style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>Correo: </span>
                                {arrendatario.email}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Introduction paragraph ── */}
                <p className="mb-5 text-justify">
                    <strong>{arrendador.nombreCompleto || '_______________'}</strong>, mayor de edad, identificado(a)
                    con {ARR_DOC}, quien obra en nombre propio, de manera libre expresa y voluntaria, y que para efectos
                    de este contrato se denominará el <strong>ARRENDADOR</strong>; y por la otra parte,{' '}
                    <strong>{arrendatario.nombreCompleto || '_______________'}</strong>, mayor de edad, identificado(a)
                    con {ATA_DOC}, quien para efectos de este contrato obra en nombre propio y se denominará el{' '}
                    <strong>&quot;ARRENDATARIO&quot;</strong>, manifestaron que han decidido celebrar un contrato de
                    arrendamiento de oficina, en adelante el <strong>&quot;CONTRATO&quot;</strong>, el cual se rige por
                    las siguientes cláusulas:
                </p>

                {/* ── Payment conditions (dashed box) ── */}
                <div
                    className="mb-5 p-3"
                    style={{ border: '1px dashed #64748b', borderRadius: '4px' }}
                >
                    <p
                        className="text-[8px] font-bold uppercase tracking-wide text-slate-600 mb-2"
                        style={{ fontFamily: 'sans-serif' }}
                    >
                        Condiciones de Pago y Garantías
                    </p>
                    <p className="text-[11px] text-slate-800 leading-snug mb-1">
                        <strong>Forma de pago:</strong> Mensual, por adelantado, dentro de los primeros {diaPago} días
                        de cada mes.
                    </p>
                    <p className="text-[11px] text-slate-800 leading-snug mb-1">
                        <strong>Lugar:</strong> En las oficinas o residencia del Arrendador, o lugar pactado por las
                        partes.
                    </p>
                    <p className="text-[11px] text-slate-800 leading-snug mb-1">
                        <strong>Depósito:</strong> Equivalente a{' '}
                        {depositoMeses === 1 ? 'un (1) mes' : `${depositoMeses} meses`} de canon (
                        {formatCOP(condiciones.depositoCOP)}).
                    </p>
                    <p className="text-[11px] text-slate-800 leading-snug">
                        <strong>Vigencia:</strong> {duracionLabel}, a partir del {fechaStr}.
                    </p>
                </div>

                {/* ── Clauses ── */}
                <p
                    className="text-[8px] font-bold uppercase tracking-wide text-slate-600 mb-3 pb-1 border-b border-slate-200"
                    style={{ fontFamily: 'sans-serif' }}
                >
                    Cláusulas Principales
                </p>

                <div className="space-y-4 text-justify">
                    {/* 1 */}
                    <div>
                        <p>
                            <strong>Primera. &ndash; Objeto: </strong>Por medio del presente Contrato, el Arrendador
                            entrega a título de arrendamiento bien inmueble el cual será exclusivamente destinado para
                            el desarrollo del objeto social, negocio o actividad comercial del Arrendatario (en
                            adelante, denominado el <strong>&quot;INMUEBLE&quot;</strong>), identificado así:{' '}
                            <strong>{inmueble.direccion || '_______________'}</strong>, ciudad de{' '}
                            <strong>{ciudadStr}</strong>, departamento de{' '}
                            <strong>{inmueble.departamento || '_______________'}</strong>
                            {inmueble.areaMq ? `, con área aproximada de ${inmueble.areaMq} m²` : ''}
                            {inmueble.estrato ? `, estrato ${inmueble.estrato}` : ''}.
                        </p>
                    </div>

                    {/* 2 */}
                    <div>
                        <p>
                            <strong>Segunda. &ndash; Canon de Arrendamiento: </strong>El canon de arrendamiento será
                            mensual determinado en la suma de{' '}
                            <strong>
                                {numberToWordsCOP(canonNum)} ({formatCOP(condiciones.canonMensual)})
                            </strong>{' '}
                            que el Arrendatario pagará anticipadamente al Arrendador (o a su orden), en las oficinas,
                            residencia del Arrendador, y/o lugar pactado, que puede variar según concenso de las partes,
                            dentro de los primeros <strong>{diaPago}</strong> días de cada mes.
                        </p>
                        <p className="mt-2">
                            El arrendatario también puede pagar el canon de arrendamiento en la cuenta bancaria,
                            aplicación móvil, plataforma financiera{' '}
                            <span className="underline decoration-dotted">_______________</span> de identificación{' '}
                            <span className="underline decoration-dotted">_______________</span>.
                        </p>
                    </div>

                    {/* 3 */}
                    <div>
                        <p>
                            <strong>Tercera. &ndash; Reajuste del Canon de Arrendamiento: </strong>Cada doce (12) meses
                            de ejecución del Contrato, el valor del canon de arrendamiento será reajustado en una
                            proporción convenida entre las partes, sin exceder en todo caso el límite máximo de reajuste
                            fijado por la ley, superintendencia y entidades que regulen el funcionamiento y ejecución
                            del contrato.
                        </p>
                    </div>

                    {/* 4 */}
                    <div>
                        <p>
                            <strong>Cuarta. &ndash; Vigencia: </strong>El arrendamiento tendrá una duración de{' '}
                            <strong>{duracionLabel}</strong> contados a partir del <strong>{fechaStr}</strong>. No
                            obstante lo anterior, el término del arrendamiento se prorrogará automáticamente por
                            periodos consecutivos de un (1) año, si ninguna de las partes con antelación de 3 meses al
                            vencimiento del periodo inicial o de cualquiera de sus prorrogas informa a la otra parte su
                            decisión de terminar este contrato. Lo anterior sin perjuicio del derecho a la renovación
                            consagrado en el Artículo 518 del Código de Comercio.
                        </p>
                    </div>

                    {/* 5 */}
                    <div>
                        <p>
                            <strong>Quinta. &ndash; Entrega: </strong>El Arrendatario en la fecha de suscripción de este
                            documento declara recibir el inmueble de manos del Arrendador en perfecto estado, de
                            conformidad con el inventario elaborado por las Partes y que forma parte integrante de este
                            contrato (de existir).
                        </p>
                    </div>

                    {/* 6 */}
                    <div>
                        <p>
                            <strong>Sexta. &ndash; Reparaciones: </strong>Los daños que se ocasionen al Inmueble por el
                            Arrendatario, por responsabilidad suya o de sus dependientes, serán reparados y cubiertos
                            sus costos de reparación en su totalidad por el Arrendatario. En todo caso, el Arrendatario
                            se obliga a restituir el Inmueble en el mismo estado en que lo ha recibido, salvo el
                            deterioro natural por el uso legitimo. Las reparaciones locativas al Inmueble estarán a
                            cargo del Arrendatario y las estructurales a cargo del Arrendador.
                        </p>
                        <p className="mt-2">
                            <strong>Parágrafo 1: </strong>El Arrendatario se abstendrá de hacer mejoras de cualquier
                            clase al Inmueble sin permiso previo y escrito del Arrendador. Las mejoras al Inmueble serán
                            del propietario del Inmueble y no habrá lugar al reconocimiento de costo, precio o
                            indemnización alguna al Arrendatario por las mejoras realizadas. Las mejoras no podrán
                            retirarse salvo que el Arrendador lo exija por escrito, a lo que el Arrendatario accederá
                            inmediatamente y a su costa, dejando el Inmueble en el mismo buen estado en que lo recibió
                            del Arrendador.
                        </p>
                    </div>

                    {/* 7 */}
                    <div>
                        <p>
                            <strong>Séptima. &ndash; Servicios Públicos: </strong>El Arrendatario pagará oportuna y
                            totalmente los servicios públicos del Inmueble desde la fecha en que comience el
                            arrendamiento hasta la restitución del Inmueble. Si el Arrendatario no paga los servicios
                            públicos a su cargo, el Arrendador podrá hacerlo para evitar que los servicios públicos sean
                            suspendidos. El incumplimiento del Arrendatario en el pago oportuno de los servicios
                            públicos del Inmueble se tendrá como incumplimiento del Contrato y el Arrendatario deberá
                            cancelar de manera incondicional e irrevocable al Arrendador las sumas que por este concepto
                            haya tenido que pagar el Arrendador, pago que deberá hacerse de manera inmediata por el
                            Arrendatario contra la presentación de las facturas correspondientes por parte del
                            Arrendador. No obstante lo anterior, el Arrendador podrá abstenerse de pagar los servicios a
                            cargo del Arrendatario, sin que por ello el Arrendatario pueda alegar responsabilidad del
                            Arrendador.
                        </p>
                        <p className="mt-2">
                            <strong>Parágrafo 1: </strong>El Arrendatario declara que ha recibido en perfecto estado de
                            funcionamiento y de conservación las instalaciones para uso de los servicios públicos del
                            Inmueble, que se abstendrá de modificarlas sin permiso previo y escrito del Arrendador y que
                            responderá por daños y/o violaciones de los reglamentos de las correspondientes empresas de
                            servicios públicos.
                        </p>
                        <p className="mt-2">
                            <strong>Parágrafo 2: </strong>El Arrendatario reconoce que el Arrendador en ningún caso y
                            bajo ninguna circunstancia es responsable por la interrupción o deficiencia en la prestación
                            de cualquiera de los servicios públicos del Inmueble. En caso de la prestación deficiente o
                            suspensión de cualquiera de los servicios públicos del Inmueble, el Arrendatario reclamará
                            de manera directa a las empresas prestadoras del servicio y no al Arrendador.
                        </p>
                    </div>

                    {/* 8 */}
                    <div>
                        <p>
                            <strong>Octava. &ndash; Destinación: </strong>El Arrendatario, durante la vigencia del
                            Contrato, destinará el Inmueble única y exclusivamente para el desarrollo de su negocio,
                            objeto social o actividad comercial, la cual consiste en:{' '}
                            <strong>{actividadComercial}</strong>. En ningún caso el Arrendatario podrá subarrendar o
                            ceder en todo o en parte este arrendamiento, de conformidad con lo establecido para el
                            efecto en el Artículo 523 del Código de Comercio. En el evento que esto suceda, el
                            Arrendador podrá dar por terminado válidamente el Contrato en forma inmediata, sin lugar a
                            indemnización alguna en favor del Arrendatario y podrá exigir la devolución del Inmueble sin
                            necesidad de ningún tipo de requerimiento previo por parte del Arrendador.
                        </p>
                        <p className="mt-2">
                            <strong>Parágrafo: </strong>El Arrendador declara expresa y terminantemente prohibida la
                            destinación del inmueble a los fines contemplados en el literal b) del parágrafo del
                            Artículo 34 de la Ley 30 de 1986 y en consecuencia el Arrendatario se obliga a no usar el
                            Inmueble para el ocultamiento de personas, depósito de armas o explosivos y dinero de grupos
                            terroristas. No destinará el inmueble para la elaboración, almacenamiento o venta de
                            sustancias alucinógenas tales como marihuana, hachís, cocaína, meta y similares. El
                            Arrendatario faculta al Arrendador para que, directamente o a través de sus funcionarios
                            debidamente autorizados por escrito, visiten el Inmueble para verificar el cumplimiento de
                            las obligaciones del Arrendatario.
                        </p>
                    </div>

                    {/* 9 */}
                    <div>
                        <p>
                            <strong>Novena. &ndash; Restitución: </strong>Vencido el periodo inicial o la última
                            prórroga del Contrato, el Arrendatario (I) restituirá el Inmueble al Arrendador en las
                            mismas buenas condiciones en que lo recibió del Arrendador, salvo el deterioro natural
                            causado por el uso legítimo, (II) entregará al Arrendador los ejemplares originales de las
                            facturas de cobro por concepto de servicios públicos del Inmueble correspondientes a los
                            últimos tres (3) meses, debidamente canceladas por el Arrendatario, bajo el entendido que
                            hará entrega de dichas facturas en el domicilio del Arrendador, con una antelación de dos
                            (2) días hábiles a la fecha fijada para la restitución material del Inmueble al Arrendador.
                        </p>
                        <p className="mt-2">
                            <strong>Parágrafo 1: </strong>No obstante lo anterior, el Arrendador podrá negarse a recibir
                            el Inmueble, cuando a su juicio existan obligaciones pendientes a cargo del Arrendatario que
                            no hayan sido satisfechas en forma debida, caso en el cual se seguirá causando el canon de
                            arrendamiento hasta que el Arrendatario cumpla con lo que le corresponde.
                        </p>
                        <p className="mt-2">
                            <strong>Parágrafo 2: </strong>La responsabilidad del Arrendatario subsistirá aún después de
                            restituido el Inmueble, mientras el Arrendador no haya entregado el paz y salvo
                            correspondiente por escrito al Arrendatario.
                        </p>
                    </div>

                    {/* 10 */}
                    <div>
                        <p>
                            <strong>Décima. &ndash; Renuncia: </strong>El Arrendatario declara que renuncia en beneficio
                            del Arrendador o de su cesionario, a todo requerimiento para constituirlo en mora en el
                            cumplimiento de las obligaciones a su cargo derivadas de este Contrato.
                        </p>
                    </div>

                    {/* 11 */}
                    <div>
                        <p>
                            <strong>Décima Primera. &ndash; Cesión: </strong>El Arrendatario faculta al Arrendador a
                            ceder total o parcialmente este Contrato y declara al cedente del Contrato, es decir al
                            Arrendador, libre de cualquier responsabilidad como consecuencia de la cesión que haga de
                            este Contrato.
                        </p>
                    </div>

                    {/* 12 */}
                    <div>
                        <p>
                            <strong>Décima Segunda. &ndash; Incumplimiento: </strong>El incumplimiento del Arrendatario
                            a cualquiera de sus obligaciones legales o contractuales, faculta al Arrendador para ejercer
                            las siguientes acciones, simultáneamente o en el orden que él elija: (I) Declarar terminado
                            este Contrato y reclamar la devolución del Inmueble judicial, policial y/o
                            extrajudicialmente; (II) exigir y perseguir a través de cualquier medio, judicial o
                            extrajudicialmente, al Arrendatario por el monto de los perjuicios resultantes del
                            incumplimiento, así como de la multa por incumplimiento pactada en este Contrato.
                        </p>
                    </div>

                    {/* 13 */}
                    <div>
                        <p>
                            <strong>Décima Tercera. &ndash; Validez: </strong>El presente Contrato anula todo convenio
                            anterior relativo al arrendamiento del mismo Inmueble y solamente podrá ser modificado por
                            escrito suscrito por la partes.
                        </p>
                    </div>

                    {/* 14 */}
                    <div>
                        <p>
                            <strong>Décima Cuarta. &ndash; </strong>El Arrendatario autoriza al Arrendador (de ser
                            necesario) a buscar y obtener informacion sobre sus posibles salarios, tiulos y propiedades
                            en entiedades tanto privadas como publicas; como lo pueden ser: bancos, instituciones de
                            credito, la Oficina de Registro de Instrumentos Publicos, entre otros.
                        </p>
                    </div>

                    {/* 15 */}
                    <div>
                        <p>
                            <strong>Décima Quinta. &ndash; Merito Ejecutivo: </strong>El Arrendatario declara de manera
                            expresa que reconoce y acepta que este Contrato presta mérito ejecutivo para exigir del
                            Arrendatario y a favor del Arrendador el pago de (I) los cánones de arrendamiento causados y
                            no pagados por el Arrendatario, (II) las multas y sanciones que se causen por el
                            incumplimiento del Arrendatario de cualquiera de las obligaciones a su cargo en virtud de la
                            ley o de este Contrato, (III) las sumas causadas y no pagadas por el Arrendatario por
                            concepto de servicios públicos del Inmueble, cuotas de administración y cualquier otra suma
                            de dinero que por cualquier concepto deba ser pagada por el Arrendatario; para lo cual
                            bastará la sola afirmación de incumplimiento del Arrendatario hecha por el Arrendador;
                            afirmación que solo podrá ser desvirtuada por el Arrendatario con la presentación de los
                            respectivos recibos de pago.
                        </p>
                        <p className="mt-2">
                            <strong>Parágrafo: </strong>Las Partes acuerdan que cualquier copia de este Contrato tendrá
                            mismo valor que el original para efectos judiciales y extrajudiciales.
                        </p>
                    </div>

                    {/* 16 */}
                    <div>
                        <p>
                            <strong>Décima Sexta. &ndash; Costos: </strong>Cualquier costo que se cause con ocasión de
                            la celebración o prorroga de este Contrato, incluyendo el impuesto de timbre, será sumido en
                            su integridad por el Arrendatario.
                        </p>
                    </div>

                    {/* 17 */}
                    <div>
                        <p>
                            <strong>Décima Séptima. &ndash; Cláusula Penal: </strong>En el evento de un incumplimiento
                            cualquiera de las partes a las obligaciones a su cargo contenidas en la ley o en este
                            contrato, la parte incumplida deberá pagar a la otra parte una suma equivalente a{' '}
                            <strong>3 cánones</strong> de arrendamiento vigentes en la fecha del incumplimiento, a
                            título de pena. En el evento que los perjuicios ocasionados por la parte incumplida, excedan
                            el valor de la suma aquí prevista como pena, la parte incumplida deberá pagar a la otra
                            parte la diferencia entre el valor total de los perjuicios y el valor de la pena prevista en
                            esta Cláusula.
                        </p>
                    </div>

                    {/* 18 */}
                    <div>
                        <p>
                            <strong>Décima Octava. &ndash; Autorización: </strong>El Arrendatario autoriza expresamente
                            e irrevocablemente al Arrendador y/o al cesionario de este contrato a consultar información
                            del Arrendatario que obre en las bases de datos de información del comportamiento financiero
                            y crediticio o centrales de riesgo que existan en el país, así como a reportar a dichas
                            bases de datos cualquier incumplimiento del Arrendatario a este Contrato.
                        </p>
                    </div>

                    {/* 19 */}
                    <div>
                        <p>
                            <strong>Décima Novena. &ndash; Abandono: </strong>El Arrendatario autoriza de manera expresa
                            e irrevocable al Arrendador para ingresar al Inmueble y recuperar su tenencia, con el solo
                            requisito de la presencia de dos (2) testigos, en procura de evitar el deterioro o
                            desmantelamiento del Inmueble, en el evento que por cualquier causa o circunstancia el
                            Inmueble permanezca abandonado o deshabitado por el término de dos (2) meses o más y que la
                            exposición al riesgo sea tal que amenace la integridad física del bien o la seguridad del
                            vecindario.
                        </p>
                    </div>

                    {/* 20 */}
                    <div>
                        <p>
                            <strong>Vigésima. &ndash; Recibos de pago de servicios públicos: </strong>
                            El Arrendador en cualquier tiempo durante la vigencia de este Contrato, podrá exigir del
                            Arrendatario la presentación de las facturas de los servicios públicos del Inmueble a fin de
                            verificar la cancelación de los mismos. En el evento que el Arrendador llegare a comprobar
                            que alguna de las facturas no ha sido pagadas por el Arrendatario encontrándose vencido el
                            plazo para el pago previsto en la factura respectiva, el Arrendador podrá terminar de manera
                            inmediata este contrato y exigir del Arrendatario el pago de las sumas a que hubiere lugar.
                        </p>
                    </div>

                    {/* 21 */}
                    <div>
                        <p>
                            <strong>Vigésima Primera. &ndash; Impuestos: </strong>El valor del impuesto de timbre que
                            cause la celebración de este contrato o cualquiera de sus prorrogas estará a cargo de{' '}
                            <span className="underline decoration-dotted">_______________</span>.
                        </p>
                    </div>

                    {/* 22 */}
                    <div>
                        {coarrendatario ? (
                            <p>
                                <strong>Vigésima Segunda. &ndash; Coarrendatarios: </strong>
                                Para garantizar al Arrendador el cumplimiento de las obligaciones a cargo del
                                Arrendatario, el Arrendatario tiene como coarrendatario a{' '}
                                <strong>{coarrendatario.nombreCompleto || '_______________'}</strong>, mayor de edad,
                                identificado(a) con {CO_DOC}, quien para efectos de este Contrato obra en nombre propio,
                                quienes declaran que se obligan de manera solidaria con el Arrendatario y frente al
                                Arrendador durante el término de duración de este Contrato y hasta que el Inmueble sea
                                devuelto al Arrendador a su entera satisfacción.
                            </p>
                        ) : (
                            <p>
                                <strong>Vigésima Segunda. &ndash; Coarrendatarios: </strong>
                                Para garantizar al Arrendador el cumplimiento de las obligaciones a cargo del
                                Arrendatario, el Arrendatario tiene como coarrendatario a{' '}
                                <span className="underline decoration-dotted">_______________</span>, mayor de edad,
                                identificado(a) con cédula de ciudadanía No.{' '}
                                <span className="underline decoration-dotted">_______________</span>, quien para efectos
                                de este Contrato obra en nombre propio, quienes declaran que se obligan de manera
                                solidaria con el Arrendatario y frente al Arrendador durante el término de duración de
                                este Contrato y hasta que el Inmueble sea devuelto al Arrendador a su entera
                                satisfacción.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Closing statement ── */}
                <p className="mt-6 mb-6 text-justify">
                    Para constancia, el presente Contrato es suscrito en la ciudad de <strong>{ciudadStr}</strong>, el
                    día <strong>{fechaStr}</strong>, en dos (2) ejemplares de igual valor, cada uno de ellos con destino
                    a cada una de las Partes.
                </p>

                {/* ── Signatures ── */}
                <div className="grid grid-cols-2 gap-8 mt-8">
                    {/* Arrendador */}
                    <div>
                        <div className="border-t-2 border-slate-400 pt-3">
                            <p className="font-bold text-slate-900 text-[11px]">
                                {arrendador.nombreCompleto || '_______________'}
                            </p>
                            <p
                                className="text-[9px] text-slate-600 mb-3"
                                style={{ fontFamily: 'sans-serif' }}
                            >
                                {arrendadorDocLabel} {arrendador.numeroDocumento || '_______________'}
                            </p>
                            <p
                                className="text-[8px] font-bold uppercase tracking-wide text-slate-700 mb-2"
                                style={{ fontFamily: 'sans-serif' }}
                            >
                                EL ARRENDADOR
                            </p>
                            <div
                                className="flex items-end justify-center"
                                style={{
                                    border: '1px solid #94a3b8',
                                    borderRadius: '2px',
                                    width: '56px',
                                    height: '66px',
                                    paddingBottom: '4px',
                                }}
                            >
                                <span
                                    className="text-[7px] uppercase tracking-wide text-slate-400"
                                    style={{ fontFamily: 'sans-serif' }}
                                >
                                    Huella
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Arrendatario */}
                    <div>
                        <div className="border-t-2 border-slate-400 pt-3">
                            <p className="font-bold text-slate-900 text-[11px]">
                                {arrendatario.nombreCompleto || '_______________'}
                            </p>
                            <p
                                className="text-[9px] text-slate-600 mb-3"
                                style={{ fontFamily: 'sans-serif' }}
                            >
                                {arrendatarioDocLabel} {arrendatario.numeroDocumento || '_______________'}
                            </p>
                            <p
                                className="text-[8px] font-bold uppercase tracking-wide text-slate-700 mb-2"
                                style={{ fontFamily: 'sans-serif' }}
                            >
                                EL ARRENDATARIO
                            </p>
                            <div
                                className="flex items-end justify-center"
                                style={{
                                    border: '1px solid #94a3b8',
                                    borderRadius: '2px',
                                    width: '56px',
                                    height: '66px',
                                    paddingBottom: '4px',
                                }}
                            >
                                <span
                                    className="text-[7px] uppercase tracking-wide text-slate-400"
                                    style={{ fontFamily: 'sans-serif' }}
                                >
                                    Huella
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coarrendatario signature (conditional) */}
                {coarrendatario && (
                    <div className="grid grid-cols-2 gap-8 mt-8">
                        <div>
                            <div className="border-t-2 border-slate-400 pt-3">
                                <p className="font-bold text-slate-900 text-[11px]">
                                    {coarrendatario.nombreCompleto || '_______________'}
                                </p>
                                <p
                                    className="text-[9px] text-slate-600 mb-3"
                                    style={{ fontFamily: 'sans-serif' }}
                                >
                                    {coarrendatario.tipoDocumento || 'Doc.'}{' '}
                                    {coarrendatario.numeroDocumento || '_______________'}
                                </p>
                                <p
                                    className="text-[8px] font-bold uppercase tracking-wide text-slate-700 mb-2"
                                    style={{ fontFamily: 'sans-serif' }}
                                >
                                    EL COARRENDATARIO
                                </p>
                                <div
                                    className="flex items-end justify-center"
                                    style={{
                                        border: '1px solid #94a3b8',
                                        borderRadius: '2px',
                                        width: '56px',
                                        height: '66px',
                                        paddingBottom: '4px',
                                    }}
                                >
                                    <span
                                        className="text-[7px] uppercase tracking-wide text-slate-400"
                                        style={{ fontFamily: 'sans-serif' }}
                                    >
                                        Huella
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div />
                    </div>
                )}

                {/* ── Footer ── */}
                <div className="mt-10 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <p
                        className="text-[9px] text-slate-400"
                        style={{ fontFamily: 'sans-serif' }}
                    >
                        Generado por <strong className="text-[#112F4F]">Lexia.co</strong>
                    </p>
                    <p
                        className="text-[9px] text-slate-500 text-right"
                        style={{ fontFamily: 'sans-serif' }}
                    >
                        ¿Dudas sobre este documento?{' '}
                        <strong className="text-[#112F4F]">Agenda una asesoría legal</strong>
                        {' en '}
                        <strong className="text-[#112F4F]">lexia.co</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
