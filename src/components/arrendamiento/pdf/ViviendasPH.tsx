import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { ArrendamientoFormData, PlanTier } from '../types';
import { formatCOP, formatDate, numberToWordsCOP } from '../contractUtils';
import { PDFHeader, PDFFooter, PDFWatermark, pdfStyles as s, B, Para, Clause, SigBlock } from './shared';

// ── Main component ────────────────────────────────────────────────────────────

interface ViviendasPHPDFProps {
    formData: ArrendamientoFormData;
    plan: PlanTier;
    logoUrl?: string;
}

export default function ViviendasPHPDF({ formData, plan, logoUrl }: ViviendasPHPDFProps) {
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

    return (
        <Document language="es-CO">
            <Page
                size="A4"
                style={s.page}
            >
                <PDFWatermark plan={plan} />
                <PDFFooter />
                <PDFHeader
                    plan={plan}
                    logoUrl={logoUrl}
                    title="ARRENDAMIENTO"
                    subtitle="Contrato de Vivienda Urbana - Propiedad Horizontal"
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
                    Cédula {arrendatarioDoc} <B>{arrendatario.numeroDocumento || '___________________'}</B> quien para
                    efectos de este contrato obra en nombre propio, de manera libre expresa y voluntaria, y se
                    denominará el{' '}
                    <B>
                        {'"'}ARRENDATARIO{'"'}
                    </B>
                    , manifiestan en el presente documento que han decidido celebrar un contrato de arrendamiento de
                    bien inmueble destinado a vivienda, en adelante el{' '}
                    <B>
                        {'"'}CONTRATO{'"'}
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
                    Por medio del presente Contrato, el Arrendador entrega a título de arrendamiento un bien inmueble
                    urbano destinado al uso y habitación del Arrendatario identificado así: <B>{inmuebleDesc}</B>
                    {inmueble.areaMq ? `, con área aproximada de ${inmueble.areaMq} m²` : ''}
                    {inmueble.estrato ? `, estrato ${inmueble.estrato}` : ''}, destinado exclusivamente para el uso de
                    vivienda del Arrendatario y la de su núcleo familiar, en adelante identificado como el{' '}
                    <B>
                        {'"'}INMUEBLE{'"'}
                    </B>
                    .
                </Clause>

                <Clause
                    number="Segunda"
                    title="Régimen de Propiedad Horizontal"
                >
                    El Inmueble descrito y alinderado en la Cláusula Primera del presente Contrato, forma parte del
                    conjunto o edificio el cual se encuentra ubicado en el área urbana de la ciudad de{' '}
                    <B>{ciudadStr}</B>, sometido al Régimen de Propiedad Horizontal, según consta en el respectivo
                    Reglamento de Propiedad Horizontal, debidamente registrada en la oficina de Instrumentos Públicos de
                    la ciudad de <B>{ciudadStr}</B>.
                </Clause>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Tercera. – Canon de Arrendamiento: </Text>
                        El canon de arrendamiento será mensual determinado en la suma de{' '}
                        <B>
                            {canonWords} ({canonFormatted})
                        </B>{' '}
                        que el Arrendatario pagará anticipadamente al Arrendador (o a su orden), en las oficinas,
                        residencia del Arrendador, y/o lugar pactado que puede variar según consenso de las partes,
                        dentro de los primeros <B>{diaPago}</B> días de cada mes. El arrendatario también puede pagar el
                        canon de arrendamiento en la cuenta bancaria, aplicación móvil o plataforma financiera que
                        indique el Arrendador.
                    </Text>
                    <Para label="Parágrafo 1">
                        Si el límite máximo de reajuste del canon de arrendamiento señalado por el Artículo 7° de la Ley
                        242 de 1995 llegare a variar por alguna disposición legal posterior a la fecha de firma del
                        presente Contrato, las Partes acuerdan que el porcentaje de reajuste que se aplicará al canon de
                        arrendamiento fijado en este Contrato, será el máximo permitido por la ley para la fecha en que
                        el canon de arrendamiento deba ser reajustado.
                    </Para>
                    <Para label="Parágrafo 2">
                        La tolerancia del Arrendador en recibir el pago del canon de arrendamiento con posterioridad al
                        plazo indicado para ello en esta Cláusula, no podrá entenderse, en ningún caso, como ánimo del
                        Arrendador de modificar el término establecido en este Contrato para el pago del canon.
                    </Para>
                </View>

                <Clause
                    number="Cuarta"
                    title="Vigencia"
                >
                    El arrendamiento tendrá una duración de <B>{duracionLabel}</B> contados a partir del{' '}
                    <B>{fechaStr}</B>. No obstante lo anterior, el término del arrendamiento se prorrogará
                    automáticamente por periodos consecutivos iguales al inicial siempre que cada una de las partes haya
                    cumplido con las obligaciones a su cargo y el Arrendatario se avenga a los reajustes de la renta
                    autorizados por ley. En caso de que alguna de las Partes desee terminar el Contrato deberá cumplir
                    los presupuestos de los artículos 22, 23, 24 y 25 del capítulo VII de la ley 820 de 2003.
                </Clause>

                <Clause
                    number="Quinta"
                    title="Entrega"
                >
                    El Arrendatario en la fecha de suscripción de este documento declara (i) recibir el Inmueble de
                    manos del Arrendador en perfecto estado, de conformidad con el inventario elaborado por las partes
                    (de existir), y (ii) que conoce en su integridad el texto del Reglamento de Propiedad Horizontal
                    aplicable al Inmueble y que lo respetará y lo hará respetar en su integridad, documento que se
                    entiende incorporado a este Contrato.
                </Clause>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Sexta. – Reparaciones: </Text>
                        Los daños que se ocasionen al Inmueble por el Arrendatario, por responsabilidad suya o de sus
                        dependientes, serán reparados y cubiertos sus costos de reparación en su totalidad por el
                        Arrendatario. Igualmente, el Arrendatario se obliga a cumplir con las obligaciones previstas en
                        los artículos 2029 y 2030 del Código Civil.
                    </Text>
                    <Para label="Parágrafo">
                        El Arrendatario se abstendrá de hacer mejoras de cualquier clase al Inmueble sin permiso previo
                        y escrito del Arrendador. Las mejoras al Inmueble serán del propietario del Inmueble y no habrá
                        lugar al reconocimiento del precio, costo o indemnización alguna al Arrendatario por las mejoras
                        realizadas. Las mejoras no podrán retirarse salvo que el Arrendador lo exija por escrito, a lo
                        que el Arrendatario accederá inmediatamente a su costa, dejando el Inmueble en el mismo buen
                        estado en que lo recibió del Arrendador, salvo el deterioro natural por el uso legítimo.
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
                        No obstante lo anterior, el Arrendador podrá abstenerse de pagar los servicios públicos a cargo
                        del Arrendatario, sin que por ello el Arrendatario pueda alegar responsabilidad del Arrendador.
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
                        para su vivienda y la de su núcleo familiar. En ningún caso el Arrendatario podrá subarrendar o
                        ceder en todo o en parte este arrendamiento, so pena de que el Arrendador pueda dar por
                        terminado válidamente el Contrato en forma inmediata, sin lugar a indemnización alguna en favor
                        del Arrendatario y podrá exigir la devolución del Inmueble sin necesidad de ningún tipo de
                        requerimiento previo por parte del Arrendador. Igualmente, el Arrendatario se abstendrá de
                        guardar o permitir que dentro del Inmueble se guarden semovientes o animales domésticos y/o
                        elementos inflamables, tóxicos, insalubres, explosivos o dañosos para la conservación, higiene,
                        seguridad y estética del inmueble y en general de sus ocupantes permanentes o transitorios.
                    </Text>
                    <Para label="Parágrafo">
                        El Arrendador declara expresa y terminantemente prohibida la destinación del inmueble a los
                        fines contemplados en el literal b) del Parágrafo del Artículo 34 de la Ley 30 de 1986 y en
                        consecuencia el Arrendatario se obliga a no usar, el Inmueble para el ocultamiento de personas,
                        depósito de armas o explosivos y dinero de los grupos terroristas. No destinará el inmueble para
                        la elaboración, almacenamiento o venta de sustancias alucinógenas tales como marihuana, hachís,
                        cocaína, metacualona y similares. El Arrendatario faculta al Arrendador para que, directamente o
                        a través de sus funcionarios debidamente autorizados por escrito, visiten el Inmueble para
                        verificar el cumplimiento de las obligaciones del Arrendatario.
                    </Para>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Novena. – Restitución: </Text>
                        Terminado el contrato en los términos establecidos en el presente documento y de conformidad con
                        la ley, el Arrendatario (i) restituirá el Inmueble al Arrendador en las mismas buenas
                        condiciones en que lo recibió del Arrendador, salvo el deterioro natural causado por el uso
                        legítimo, (ii) entregará al Arrendador los ejemplares originales de las facturas de cobro por
                        concepto de servicios públicos del Inmueble correspondientes a los últimos tres (3) meses,
                        debidamente canceladas por el Arrendatario, bajo el entendido que hará entrega de dichas
                        facturas en el domicilio del Arrendador, con una antelación de dos (2) días hábiles a la fecha
                        fijada para la restitución material del Inmueble al Arrendador.
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
                    El Arrendatario declara que (i) no ha tenido ni tiene posesión del Inmueble, y (ii) que renuncia en
                    beneficio del Arrendador o de su cesionario, a todo requerimiento para constituirlo en mora en el
                    cumplimiento de las obligaciones a su cargo derivadas de este Contrato.
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
                        elija: (I) Declarar terminado este Contrato y reclamar la devolución del Inmueble judicial,
                        policial y/o extrajudicialmente. (II) Exigir y perseguir a través de cualquier medio, judicial o
                        extrajudicialmente, al Arrendatario y/o coarrendatarios por el monto de los perjuicios
                        resultantes del incumplimiento, así como de la multa por incumplimiento pactada en este
                        Contrato.
                    </Text>
                    <Para label="Parágrafo">
                        Son causales de terminación del Contrato en forma unilateral por el Arrendador las previstas en
                        los artículos 22 y 23 del capítulo VII de la ley 820 de 2003; y por parte del Arrendatario las
                        consagradas en los Artículos 24 y 25 de la misma Ley. No obstante lo anterior, las Partes en
                        cualquier tiempo y de común acuerdo podrán dar por terminado el presente Contrato.
                    </Para>
                </View>

                <Clause
                    number="Décima Tercera"
                    title="Validez"
                >
                    El presente Contrato anula todo convenio anterior relativo al arrendamiento del mismo Inmueble y
                    solamente podrá ser modificado por escrito suscrito por las Partes.
                </Clause>

                <Clause
                    number="Décima Cuarta"
                    title=""
                >
                    El Arrendatario autoriza al Arrendador (de ser necesario) a buscar y obtener información sobre sus
                    posibles salarios, títulos y propiedades en entidades tanto privadas como públicas; como lo pueden
                    ser: bancos, instituciones de crédito, la Oficina de Registro de Instrumentos Públicos, entre otros.
                </Clause>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Décima Quinta. – Mérito Ejecutivo: </Text>
                        El Arrendatario declara de manera expresa que reconoce y acepta que este Contrato presta mérito
                        ejecutivo para exigir del Arrendatario y a favor del Arrendador el pago de (I) los cánones de
                        arrendamiento causados y no pagados por el Arrendatario, (II) las multas y sanciones que se
                        causen por el incumplimiento del Arrendatario de cualquiera de las obligaciones a su cargo en
                        virtud de la ley o de este Contrato, (III) las sumas causadas y no pagadas por el Arrendatario
                        por concepto de servicios públicos del Inmueble, cuotas de administración y cualquier otra suma
                        de dinero que por cualquier concepto deba ser pagada por el Arrendatario; para lo cual bastará
                        la sola afirmación de incumplimiento del Arrendatario hecha por el Arrendador, afirmación que
                        solo podrá ser desvirtuada por el Arrendatario con la presentación de los respectivos recibos de
                        pago.
                    </Text>
                    <Para label="Parágrafo">
                        Las Partes acuerdan que cualquier copia autenticada ante Notario de este Contrato tendrá el
                        mismo valor que el original para efectos judiciales y extrajudiciales.
                    </Para>
                </View>

                <Clause
                    number="Décima Sexta"
                    title="Costos"
                >
                    Cualquier costo que se cause con ocasión de la celebración o prórroga de este Contrato, incluyendo
                    el impuesto de timbre, será asumido en su integridad por el Arrendatario.
                </Clause>

                <Clause
                    number="Décima Séptima"
                    title="Preaviso"
                >
                    El Arrendador podrá dar por terminado el presente Contrato de conformidad con los artículos 22 y 23
                    del capítulo VII de la ley 820 de 2003.
                </Clause>

                <Clause
                    number="Décima Octava"
                    title="Cláusula Penal"
                >
                    En el evento de incumplimiento cualquiera de las Partes a las obligaciones a su cargo contenidas en
                    la ley o en este Contrato, la Parte incumplida deberá pagar a la otra Parte una suma equivalente a{' '}
                    <B>3 cánones</B> de arrendamiento vigentes en la fecha del incumplimiento, a título de pena. En el
                    evento que los perjuicios ocasionados por la Parte incumplida, excedan el valor de la suma aquí
                    prevista como pena, la Parte incumplida deberá pagar a la otra Parte la diferencia entre el valor
                    total de los perjuicios y el valor de la pena prevista en esta Cláusula.
                </Clause>

                <Clause
                    number="Décima Novena"
                    title="Autorización"
                >
                    El Arrendatario autoriza expresamente e irrevocablemente al Arrendador y/o al cesionario de este
                    Contrato a consultar información del Arrendatario que obre en las bases de datos de información del
                    comportamiento financiero y crediticio o centrales de riesgo que existan en el país, así como a
                    reportar a dichas bases de datos cualquier incumplimiento del Arrendatario a este Contrato.
                </Clause>

                <Clause
                    number="Vigésima"
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
                    number="Vigésima Primera"
                    title="Recibos de pago de servicios públicos"
                >
                    El Arrendador en cualquier tiempo durante la vigencia de este Contrato, podrá exigir del
                    Arrendatario la presentación de las facturas de los servicios públicos del Inmueble a fin de
                    verificar la cancelación de los mismos. En el evento que el Arrendador llegare a comprobar que
                    alguna de las facturas no ha sido pagada por el Arrendatario encontrándose vencido el plazo para el
                    pago previsto en la respectiva factura, el Arrendador podrá terminar de manera inmediata este
                    Contrato y exigir del Arrendatario el pago de las sumas a que hubiere lugar.
                </Clause>

                {hasCoarrendatario ? (
                    <View style={s.clauseWrap}>
                        <Text style={s.clauseText}>
                            <Text style={s.clauseTitleInline}>Vigésima Segunda. – Coarrendatarios: </Text>
                            {
                                'Para garantizar al Arrendador el cumplimiento de las obligaciones a cargo del Arrendatario, el Arrendatario tiene como coarrendatario a '
                            }
                            <B>{coarrendatario!.nombreCompleto || '___________________'}</B>
                            {` mayor de edad, identificado(a) con ${coarrendatario!.tipoDocumento || 'cédula de ciudadanía'} No. `}
                            <B>{coarrendatario!.numeroDocumento || '___________________'}</B>
                            {
                                ', quien para efectos de este Contrato obra en nombre propio, quienes declaran que se obligan de manera solidaria con el Arrendatario y frente al Arrendador durante el término de duración de este Contrato y hasta que el Inmueble sea devuelto al Arrendador a su entera satisfacción.'
                            }
                        </Text>
                    </View>
                ) : (
                    <View style={s.clauseWrap}>
                        <Text style={s.clauseText}>
                            <Text style={s.clauseTitleInline}>Vigésima Segunda. – Coarrendatarios: </Text>
                            {
                                'Para garantizar al Arrendador el cumplimiento de las obligaciones a cargo del Arrendatario, el Arrendatario tiene como coarrendatario a ___________________________, mayor de edad, identificado(a) con cédula de ciudadanía No. ___________________________, quien para efectos de este Contrato obra en nombre propio, quienes declaran que se obligan de manera solidaria con el Arrendatario y frente al Arrendador durante el término de duración de este Contrato y hasta que el Inmueble sea devuelto al Arrendador a su entera satisfacción.'
                            }
                        </Text>
                    </View>
                )}

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
