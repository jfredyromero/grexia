import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { ArrendamientoFormData } from '../types';
import { formatCOP, formatDate, numberToWordsCOP } from '../contractUtils';
import { PDFHeader, PDFFooter, PDFWatermark, pdfStyles as s, B, Para, Clause, SigBlock } from './shared';

// ── Main component ────────────────────────────────────────────────────────────

interface LocalComercialPDFProps {
    formData: ArrendamientoFormData;
}

export default function LocalComercialPDF({ formData }: LocalComercialPDFProps) {
    const { inmueble, arrendador, arrendatario, coarrendatario, condiciones } = formData;

    const canonNum = parseInt(condiciones.canonMensual.replace(/\D/g, ''), 10) || 0;
    const depositoNum = parseInt(condiciones.depositoCOP.replace(/\D/g, ''), 10) || 0;
    const depositoMeses = canonNum > 0 ? Math.round(depositoNum / canonNum) : 1;

    const fechaStr = formatDate(condiciones.fechaInicio);
    const ciudadStr = inmueble.ciudad || '___________________';
    const hasCoarrendatario = !!coarrendatario;

    const arrendadorDoc = arrendador.tipoDocumento === 'NIT' ? 'NIT' : 'cédula de ciudadanía';
    const arrendadorDocLabel = arrendador.tipoDocumento === 'NIT' ? 'NIT' : arrendador.tipoDocumento || 'Doc.';
    const arrendatarioDoc =
        arrendatario.tipoDocumento === 'CE'
            ? 'de extranjería'
            : arrendatario.tipoDocumento === 'Pasaporte'
              ? 'pasaporte'
              : 'de ciudadanía';
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

    const canonWords = numberToWordsCOP(canonNum);
    const canonFormatted = formatCOP(condiciones.canonMensual);
    const depositoFormatted = formatCOP(condiciones.depositoCOP);

    const inmuebleDesc = inmueble.direccion ? `${inmueble.direccion}, ${ciudadStr}` : '___________________';
    const actividadComercial = condiciones.actividadComercial || '___________________';

    return (
        <Document language="es-CO">
            <Page
                size="A4"
                style={s.page}
            >
                <PDFWatermark />
                <PDFFooter />
                <PDFHeader
                    title="ARRENDAMIENTO"
                    subtitle="Contrato de Local Comercial"
                />

                {/* ── Info box: Canon + Ciudad/Fecha ── */}
                <View style={s.infoBox}>
                    <View style={s.infoLeft}>
                        <Text style={s.infoSectionLabel}>Canon Mensual de Arrendamiento</Text>
                        <Text style={s.infoCanonValue}>{canonFormatted}</Text>
                        <Text style={s.infoCanonWords}>SON: {canonWords} M/L</Text>
                    </View>
                    <View style={s.infoRight}>
                        <Text style={s.infoSectionLabel}>Ciudad y Fecha de Suscripción</Text>
                        <Text style={s.infoCityValue}>
                            {ciudadStr}, {fechaStr}
                        </Text>
                    </View>
                </View>

                {/* ── Parties box: Arrendador | Arrendatario ── */}
                <View style={s.partiesBox}>
                    <View style={[s.partyCol, s.partyColLeft]}>
                        <Text style={s.partyColHeader}>Arrendador(a)</Text>
                        <Text style={s.partyName}>{arrendador.nombreCompleto || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>{arrendadorDocLabel}: </Text>
                            {arrendador.numeroDocumento || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Teléfono: </Text>
                            {arrendador.telefono || '___________________'}
                        </Text>
                        {arrendador.email ? (
                            <Text style={s.partyLine}>
                                <Text style={s.partyLineLabel}>Correo: </Text>
                                {arrendador.email}
                            </Text>
                        ) : null}
                    </View>
                    <View style={s.partyCol}>
                        <Text style={s.partyColHeader}>Arrendatario(a)</Text>
                        <Text style={s.partyName}>{arrendatario.nombreCompleto || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>{arrendatarioDocLabel}: </Text>
                            {arrendatario.numeroDocumento || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Dirección Inmueble: </Text>
                            {inmueble.direccion || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Teléfono: </Text>
                            {arrendatario.telefono || '___________________'}
                        </Text>
                        {arrendatario.email ? (
                            <Text style={s.partyLine}>
                                <Text style={s.partyLineLabel}>Correo: </Text>
                                {arrendatario.email}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* ── Intro paragraph ── */}
                <Text style={s.introPara}>
                    <B>{arrendador.nombreCompleto || '___________________'}</B> mayor de edad, identificado(a) con{' '}
                    {arrendadorDoc} No. <B>{arrendador.numeroDocumento || '___________________'}</B>, quien obra en
                    nombre propio, de manera libre expresa y voluntaria, y que para efectos de este contrato se
                    denominará el <B>ARRENDADOR</B>; y por la otra parte,{' '}
                    <B>{arrendatario.nombreCompleto || '___________________'}</B>, mayor de edad, identificado(a) con la
                    Cédula {arrendatarioDoc} <B>{arrendatario.numeroDocumento || '___________________'}</B>, quien para
                    efectos de este contrato obra en nombre propio y que se denominará el <B>ARRENDATARIO</B>,
                    manifestaron que han decidido celebrar un contrato de arrendamiento de local comercial, en adelante
                    el{' '}
                    <B>
                        {'"'}contrato{'"'}
                    </B>
                    , el cual se rige por las siguientes cláusulas:
                </Text>

                {/* ── Payment conditions (dashed box) ── */}
                <View style={s.conditionsBox}>
                    <Text style={s.conditionsTitle}>Condiciones de Pago y Garantías</Text>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Forma de pago:</Text>
                        <Text>Mensual, por adelantado, dentro de los primeros {diaPago} días de cada mes.</Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Lugar:</Text>
                        <Text>En las oficinas o residencia del Arrendador, o lugar pactado por las partes.</Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Depósito:</Text>
                        <Text>
                            Equivalente a {depositoMeses === 1 ? 'un (1) mes' : `${depositoMeses} meses`} de canon (
                            {depositoFormatted}).
                        </Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Vigencia:</Text>
                        <Text>
                            {duracionLabel}, a partir del {fechaStr}.
                        </Text>
                    </View>
                </View>

                {/* ── Clauses section ── */}
                <Text style={s.clausesSectionLabel}>Cláusulas Principales</Text>

                <Clause
                    number="Primera"
                    title="Objeto"
                >
                    Por medio del presente Contrato, el Arrendador entrega a título de arrendamiento bien inmueble el
                    cual será exclusivamente destinado para el desarrollo del objeto social, negocio o actividad
                    comercial del Arrendatario (en adelante, denominado el{' '}
                    <B>
                        {'"'}INMUEBLE{'"'}
                    </B>
                    ), identificado así: <B>{inmuebleDesc}</B>
                    {inmueble.areaMq ? `, con área aproximada de ${inmueble.areaMq} m²` : ''}
                    {inmueble.estrato ? `, estrato ${inmueble.estrato}` : ''}.
                </Clause>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Segunda. – Canon de Arrendamiento: </Text>
                        El canon de arrendamiento será mensual determinado en la suma de{' '}
                        <B>
                            {canonWords} ({canonFormatted})
                        </B>{' '}
                        que el Arrendatario pagará anticipadamente al Arrendador (o a su orden), en las oficinas,
                        residencia del Arrendador, y/o lugar pactado, que puede variar según consenso de las partes,
                        dentro de los primeros <B>{diaPago}</B> días de cada mes.{'\n'}
                        El arrendatario también puede pagar el canon de arrendamiento en la cuenta bancaria, aplicación
                        móvil, plataforma financiera que indique el Arrendador.
                    </Text>
                </View>

                <Clause
                    number="Tercera"
                    title="Reajuste del Canon de Arrendamiento"
                >
                    Cada doce (12) meses de ejecución del Contrato, el valor del canon de arrendamiento será reajustado
                    en una proporción convenida entre las partes, sin exceder en todo caso el límite máximo de reajuste
                    fijado por la ley, superintendencia y entidades que regulen el funcionamiento y ejecución del
                    contrato.
                </Clause>

                <Clause
                    number="Cuarta"
                    title="Vigencia"
                >
                    El arrendamiento tendrá una duración de <B>{duracionLabel}</B> contados a partir del{' '}
                    <B>{fechaStr}</B>. No obstante lo anterior, el término del arrendamiento se prorrogará
                    automáticamente por periodos consecutivos de un (1) año, si ninguna de las partes con antelación de
                    3 meses al vencimiento del periodo inicial o de cualquiera de sus prorrogas informa a la otra parte
                    su decisión de terminar este contrato. Lo anterior sin perjuicio del derecho a la renovación
                    consagrado en el Articulo 518 del Código de Comercio.
                </Clause>

                <Clause
                    number="Quinta"
                    title="Entrega"
                >
                    El Arrendatario en la fecha de suscripción de este documento declara (I) recibir el inmueble de
                    manos del Arrendador en perfecto estado, de conformidad con el inventario elaborado por las partes y
                    que forma parte integrante de este contrato (de existir).
                </Clause>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Sexta. - Reparaciones: </Text>
                        Los daños que se ocasionen al Inmueble por el Arrendatario, por responsabilidad suya o de sus
                        dependientes, serán reparados y cubiertos sus costos de reparación en su totalidad por el
                        Arrendatario. En todo caso, el Arrendatario se obliga a restituir el Inmueble en el mismo estado
                        en que lo ha recibido, salvo el deterioro natural por el uso legitimo. Las reparaciones
                        locativas al Inmueble estarán a cargo del Arrendatario.
                    </Text>
                    <Para label="Parágrafo 1">
                        El Arrendatario se abstendrá de hacer mejoras de cualquier clase al Inmueble sin permiso previo
                        y escrito del Arrendador. Las mejoras al Inmueble serán del propietario del Inmueble y no habrá
                        lugar al reconocimiento de costo, precio o indemnización alguna al Arrendatario por las mejoras
                        realizadas. Las mejoras no podrán retirarse salvo que el Arrendador lo exija por escrito, a lo
                        que el Arrendatario accederá inmediatamente y a su costa, dejando el Inmueble en el mismo buen
                        estado en que lo recibió del Arrendador.
                    </Para>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Séptima. – Servicios Públicos: </Text>
                        El Arrendatario pagará oportuna y totalmente los servicios públicos del Inmueble desde la fecha
                        en que comience el arrendamiento hasta la restitución del Inmueble. Si el Arrendatario no paga
                        los servicios públicos a su cargo, el Arrendador podrá hacerlo para evitar que los servicios
                        públicos sean suspendidos. El incumplimiento del Arrendatario en el pago oportuno de los
                        servicios públicos del Inmueble se tendrá como incumplimiento del Contrato y el Arrendatario
                        deberá cancelar de manera incondicional e irrevocable al Arrendador las sumas que por este
                        concepto haya tenido que pagar el Arrendador, pago que deberá hacerse de manera inmediata por el
                        Arrendatario contra la presentación de las facturas correspondientes por parte del Arrendador.
                        No obstante lo anterior, el Arrendador podrá abstenerse de pagar los servicios a cargo del
                        Arrendatario, sin que por ello el Arrendatario pueda alegar responsabilidad del Arrendador.
                    </Text>
                    <Para label="Parágrafo 1">
                        El Arrendatario declara que ha recibido en perfecto estado de funcionamiento y de conservación
                        las instalaciones para uso de los servicios públicos del Inmueble, que se abstendrá de
                        modificarlas sin permiso previo y escrito del Arrendador y que responderá por daños y/o
                        violaciones de los reglamentos de las correspondientes empresas de servicios públicos.
                    </Para>
                    <Para label="Parágrafo 2">
                        El Arrendatario reconoce que el Arrendador en ningún caso y bajo ninguna circunstancia es
                        responsable por la interrupción o deficiencia en la prestación de cualquiera de los servicios
                        públicos del Inmueble. En caso de la prestación deficiente o suspensión de cualquiera de los
                        servicios públicos del Inmueble, el Arrendatario reclamará de manera directa a las empresas
                        prestadoras del servicio y no al Arrendador.
                    </Para>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Octava. – Destinación: </Text>
                        El Arrendatario, durante la vigencia del Contrato, destinará el Inmueble única y exclusivamente
                        para el desarrollo de su negocio, objeto social o actividad comercial, la cual consiste en:{' '}
                        <B>{actividadComercial}</B>. En ningún caso el Arrendatario podrá subarrendar o ceder en todo o
                        en parte este arrendamiento, de conformidad con lo establecido para el efecto en el Artículo 523
                        del Código de Comercio. En el evento que esto suceda, el Arrendador podrá dar por terminado
                        validamente el contrato en forma inmediata, sin lugar a indemnización alguna en favor del
                        Arrendatario y podrá exigir la devolución del inmueble sin necesidad de ningún tipo de
                        requerimiento previo por parte del Arrendador.
                    </Text>
                    <Para label="Parágrafo">
                        El Arrendador declara expresa y terminantemente prohibida la destinación del inmueble a los
                        fines contemplados en el literal b) del parágrafo del Artículo 34 de la Ley 30 de 1986 y en
                        consecuencia el Arrendatario se obliga a no usar, el Inmueble para el ocultamiento de personas,
                        depósito de armas o explosivos y dinero de grupos terroristas. No destinará el inmueble para la
                        elaboración, almacenamiento o venta de sustancias alucinógenas tales como marihuana, hachís,
                        cocaína, metacualona y similares. El Arrendatario faculta al Arrendador para que, directamente o
                        a través de sus funcionarios debidamente autorizados por escrito, visiten el Inmueble para
                        verificar el cumplimiento de las obligaciones del Arrendatario.
                    </Para>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Novena. - Restitución: </Text>
                        Vencido el periodo inicial o la última prórroga del Contrato, el Arrendatario (I) restituirá el
                        Inmueble al Arrendador en las mismas buenas condiciones en que lo recibió del Arrendador, salvo
                        el deterioro natural causado por el uso legítimo, (II) entregará al Arrendador los ejemplares
                        originales de las facturas de cobro por concepto de servicios públicos del Inmueble
                        correspondientes a los últimos tres (3) meses, debidamente canceladas por el Arrendatario, bajo
                        el entendido que hará entrega de dichas facturas en el domicilio del Arrendador, con una
                        antelación de dos (2) días hábiles a la fecha fijada para la restitución material del Inmueble
                        al Arrendador.
                    </Text>
                    <Para label="Parágrafo 1">
                        No obstante lo anterior, el Arrendador podrá negarse a recibir el Inmueble, cuando a su juicio
                        existan obligaciones pendientes a cargo del Arrendatario que no hayan sido satisfechas en forma
                        debida, caso en el cual se seguirá causando el canon de arrendamiento hasta que el Arrendatario
                        cumpla con lo que le corresponde.
                    </Para>
                    <Para label="Parágrafo 2">
                        La responsabilidad del Arrendatario subsistirá aún después de restituido el Inmueble, mientras
                        el Arrendador no haya entregado el paz y salvo correspondiente por escrito al Arrendatario.
                    </Para>
                </View>

                <Clause
                    number="Décima"
                    title="Renuncia"
                >
                    El Arrendatario declara que renuncia en beneficio del Arrendador o de su cesionario, a todo
                    requerimiento para constituirlo en mora en el cumplimiento de las obligaciones a su cargo derivadas
                    de este Contrato.
                </Clause>

                <Clause
                    number="Décima Primera"
                    title="Cesión"
                >
                    El Arrendatario faculta al Arrendador a ceder total o parcialmente este Contrato y declara al
                    cedente del Contrato, es decir al Arrendador, libre de cualquier responsabilidad como consecuencia
                    de la cesión que haga de este Contrato.
                </Clause>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Décima Segunda. – Incumplimiento: </Text>
                        El incumplimiento del Arrendatario a cualquiera de sus obligaciones legales o contractuales
                        faculta al Arrendador para ejercer las siguientes acciones, simultáneamente o en el orden que él
                        elija:{'\n'}
                        Declarar terminado este Contrato y reclamar la devolución del Inmueble judicial, policial y/o
                        extrajudicialmente;{'\n'}
                        Exigir y perseguir a través de cualquier medio, judicial, o extrajudicialmente, al Arrendatario
                        el monto de los perjuicios resultantes del incumplimiento, así como de la multa por
                        incumplimiento pactada en este Contrato.
                    </Text>
                </View>

                <Clause
                    number="Décima Tercera"
                    title="Validez"
                >
                    El presente Contrato anula todo convenio anterior relativo al arrendamiento del mismo Inmueble y
                    solamente podrá ser modificado por escrito suscrito por la Partes.
                </Clause>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Décima Cuarta. – </Text>
                        El Arrendatario autoriza al Arrendador (de ser necesario) a buscar y obtener información sobre
                        sus posibles salarios, títulos y propiedades en entidades tanto privadas como publicas; como lo
                        pueden ser: bancos, instituciones de crédito, la Oficina de Registro de Instrumentos Públicos,
                        entre otros.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Décima Quinta. – Merito Ejecutivo: </Text>
                        El Arrendatario declara de manera expresa que reconoce y acepta que este Contrato presta mérito
                        ejecutivo para exigir del Arrendatario y a favor del Arrendador el pago de (i) los cánones de
                        arrendamiento causados y no pagados por el Arrendatario, (ii) las multas y sanciones que se
                        causen por el incumplimiento del Arrendatario de cualquiera de las obligaciones a su cargo en
                        virtud de la ley o de este Contrato, (iii) las sumas causadas y no pagadas por el Arrendatario
                        por concepto de servicios públicos del Inmueble, cuotas de administración y cualquier otra suma
                        de dinero que por cualquier concepto deba ser pagada por el Arrendatario; para lo cual bastará
                        la sola afirmación de incumplimiento del Arrendatario hecha por el Arrendador, afirmación que
                        solo podrá ser desvirtuada por el Arrendatario con la presentación de los respectivos recibos de
                        pago.
                    </Text>
                    <Para label="Parágrafo">
                        Las Partes acuerdan que cualquier copia de este Contrato tendrá mismo valor que el original para
                        efectos judiciales y extrajudiciales.
                    </Para>
                </View>

                <Clause
                    number="Décima Sexta"
                    title="Costos"
                >
                    Cualquier costo que se cause con ocasión de la celebración o prorroga de este Contrato, incluyendo
                    el impuesto de timbre, será sumido en su integridad por el Arrendatario.
                </Clause>

                <Clause
                    number="Décima Séptima"
                    title="Cláusula Penal"
                >
                    En el evento de incumplimiento cualquiera de las Partes a las obligaciones a su cargo contenidas en
                    la ley o en este Contrato, la parte incumplida deberá pagar a la otra parte una suma equivalente a{' '}
                    <B>3 cánones</B> de arrendamiento vigentes en la fecha del incumplimiento, a título de pena. En el
                    evento que los perjuicios ocasionados por la parte incumplida, excedan el valor de la suma aquí
                    prevista como pena, la parte incumplida deberá pagar a la otra parte la diferencia entre el valor
                    total de los perjuicios y el valor de la pena prevista en esta Cláusula.
                </Clause>

                <Clause
                    number="Décima Octava"
                    title="Autorización"
                >
                    El Arrendatario autoriza expresamente e irrevocablemente al Arrendador y/o al cesionario de este
                    Contrato a consultar información del Arrendatario que obre en las bases de datos de información del
                    comportamiento financiero y crediticio o centrales de riesgo que existan en el país, así como a
                    reportar a dichas bases de datos cualquier incumplimiento del Arrendatario a este Contrato.
                </Clause>

                <Clause
                    number="Décima Novena"
                    title="Abandono"
                >
                    El Arrendatario autoriza de manera expresa e irrevocable al Arrendador para ingresar al Inmueble y
                    recuperar su tenencia, con el solo requisito de la presencia de dos (2) testigos, en procura de
                    evitar el deterioro o desmantelamiento del Inmueble, en el evento que por cualquier causa o
                    circunstancia el Inmueble permanezca abandonado o deshabitado por el término de dos (2) meses o más
                    y que la exposición al riesgo sea tal que amenace la integridad física del bien o la seguridad del
                    vecindario.
                </Clause>

                <Clause
                    number="Vigésima"
                    title="Recibos de pago de servicios públicos"
                >
                    El Arrendador en cualquier tiempo durante la vigencia de este Contrato, podrá exigir del
                    Arrendatario la presentación de las facturas de los servicios públicos del Inmueble a fin de
                    verificar la cancelación de los mismos. En el evento que el Arrendador llegare a comprobar que
                    alguna de las facturas no ha sido pagada por el Arrendatario encontrándose vencido el plazo para el
                    pago previsto en la factura respectiva, el Arrendador podrá terminar de manera inmediata este
                    Contrato y exigir del Arrendatario el pago de las sumas a que hubiere lugar.
                </Clause>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Vigésima Primera. – Impuestos: </Text>
                        El valor del impuesto de timbre que cause la celebración de este contrato o cualquiera de sus
                        prorrogas estará a cargo de (identificación de la parte que asume estos costos).
                    </Text>
                </View>

                {/* ── Closing statement ── */}
                <Text style={s.closingText}>
                    Para constancia, el presente Contrato es suscrito en la ciudad de <B>{ciudadStr}</B>, el día{' '}
                    <B>{fechaStr}</B>, en dos (2) ejemplares de igual valor, cada uno de ellos con destino a cada una de
                    las Partes.
                </Text>

                {/* ── Signature block ── */}
                <View
                    style={s.signaturesWrap}
                    wrap={false}
                >
                    <View style={s.sigCol}>
                        <SigBlock
                            name={arrendador.nombreCompleto || '___________________'}
                            role={`ARRENDADOR – ${arrendadorDocLabel} ${arrendador.numeroDocumento || '___________________'}`}
                        />
                    </View>
                    <View style={s.sigCol}>
                        <SigBlock
                            name={arrendatario.nombreCompleto || '___________________'}
                            role={`ARRENDATARIO – ${arrendatarioDocLabel} ${arrendatario.numeroDocumento || '___________________'}`}
                        />
                    </View>
                </View>

                {hasCoarrendatario && (
                    <View
                        style={s.signaturesWrapBottom}
                        wrap={false}
                    >
                        <View style={[s.sigCol, { flex: 0.5 }]}>
                            <SigBlock
                                name={coarrendatario!.nombreCompleto || '___________________'}
                                role={`COARRENDATARIO – ${coarrendatario!.tipoDocumento || 'Doc.'} ${coarrendatario!.numeroDocumento || '___________________'}`}
                            />
                        </View>
                        <View style={[s.sigCol, { flex: 0.5 }]} />
                    </View>
                )}
            </Page>
        </Document>
    );
}
