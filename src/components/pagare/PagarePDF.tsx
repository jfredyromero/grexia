import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { PagareFormData } from './types';
import { formatCOP, formatDate, numberToWordsCOP, periodoLabel } from './pagareUtils';
import { PDFHeader, PDFFooter, PDFWatermark, pdfStyles as s, B, Para, SigBlock } from '../pdf/shared';

// ── Main component ────────────────────────────────────────────────────────────

interface PagarePDFProps {
    formData: PagareFormData;
}

function docTypeLabel(tipo: string): string {
    if (tipo === 'CC') return 'cédula de ciudadanía';
    if (tipo === 'CE') return 'cédula de extranjería';
    if (tipo === 'NIT') return 'NIT';
    if (tipo === 'Pasaporte') return 'pasaporte';
    return 'documento';
}

export default function PagarePDF({ formData }: PagarePDFProps) {
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

    const acreedorDocTipo = docTypeLabel(acreedor.tipoDocumento);
    const deudorDocTipo = docTypeLabel(deudor.tipoDocumento);

    const tasaMora = obligacion.tasaInteresMora
        ? `${obligacion.tasaInteresMora}% mensual`
        : 'tasa máxima legal vigente certificada por la Superintendencia Financiera de Colombia';

    let pagoDesc: string;
    if (!obligacion.modalidadPago) {
        pagoDesc = 'Por definir';
    } else if (obligacion.modalidadPago === 'unico') {
        pagoDesc = `Pago único con vencimiento el ${fechaVencimientoStr}`;
    } else {
        const pl = periodoLabel(obligacion.periodoCuotas, obligacion.numeroCuotas);
        pagoDesc = `${obligacion.numeroCuotas || '___'} cuotas ${pl}`;
    }

    return (
        <Document language="es-CO">
            <Page
                size="A4"
                style={s.page}
            >
                <PDFWatermark />
                <PDFFooter />
                <PDFHeader
                    title="PAGARÉ"
                    subtitle="Título Valor · Código de Comercio de Colombia"
                />

                {/* ── Info box: Valor + Ciudad/Fecha ── */}
                <View style={s.infoBox}>
                    <View style={s.infoLeft}>
                        <Text style={s.infoSectionLabel}>Valor del Pagaré</Text>
                        <Text style={s.infoCanonValue}>{valorFormatted}</Text>
                        <Text style={s.infoCanonWords}>SON: {valorWords} M/L</Text>
                    </View>
                    <View style={s.infoRight}>
                        <Text style={s.infoSectionLabel}>Ciudad y Fecha de Suscripción</Text>
                        <Text style={s.infoCityValue}>
                            {ciudadStr}, {fechaSuscripcionStr}
                        </Text>
                    </View>
                </View>

                {/* ── Parties box: Acreedor | Deudor ── */}
                <View style={s.partiesBox}>
                    <View style={[s.partyCol, s.partyColLeft]}>
                        <Text style={s.partyColHeader}>Acreedor(a)</Text>
                        <Text style={s.partyName}>{acreedor.nombreCompleto || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>{acreedor.tipoDocumento || 'Doc.'}: </Text>
                            {acreedor.numeroDocumento || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Teléfono: </Text>
                            {acreedor.telefono || '___________________'}
                        </Text>
                        {acreedor.email ? (
                            <Text style={s.partyLine}>
                                <Text style={s.partyLineLabel}>Correo: </Text>
                                {acreedor.email}
                            </Text>
                        ) : null}
                    </View>
                    <View style={s.partyCol}>
                        <Text style={s.partyColHeader}>Deudor(a)</Text>
                        <Text style={s.partyName}>{deudor.nombreCompleto || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>{deudor.tipoDocumento || 'Doc.'}: </Text>
                            {deudor.numeroDocumento || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Ciudad: </Text>
                            {ciudadDeudorStr}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Teléfono: </Text>
                            {deudor.telefono || '___________________'}
                        </Text>
                        {deudor.email ? (
                            <Text style={s.partyLine}>
                                <Text style={s.partyLineLabel}>Correo: </Text>
                                {deudor.email}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* ── Intro paragraph ── */}
                <Text style={s.introPara}>
                    Yo, <B>{deudor.nombreCompleto || '___________________'}</B>, mayor de edad, identificado(a) con{' '}
                    {deudorDocTipo} No. <B>{deudor.numeroDocumento || '___________________'}</B>, domiciliado(a) en{' '}
                    {ciudadDeudorStr}, declaro que me comprometo a pagar incondicionalmente a la orden de{' '}
                    <B>{acreedor.nombreCompleto || '___________________'}</B>, identificado(a) con {acreedorDocTipo} No.{' '}
                    <B>{acreedor.numeroDocumento || '___________________'}</B>, o a quien represente sus derechos, en la
                    ciudad de <B>{ciudadStr}</B> y en las condiciones señaladas en este título valor, la suma de{' '}
                    <B>{valorFormatted}</B> ({valorWords} M/L), de conformidad con las siguientes estipulaciones:
                </Text>

                {/* ── Payment conditions (dashed box) ── */}
                <View style={s.conditionsBox}>
                    <Text style={s.conditionsTitle}>Condiciones de Pago</Text>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Modalidad:</Text>
                        <Text>{pagoDesc}</Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Intereses de mora:</Text>
                        <Text>{tasaMora}</Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Ciudad de pago:</Text>
                        <Text>{ciudadStr}</Text>
                    </View>
                </View>

                {/* ── Clauses section ── */}
                <Text style={s.clausesSectionLabel}>Cláusulas</Text>

                {/* PRIMERA */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>PRIMERA. – OBJETO: </Text>
                        Que por virtud del presente título valor pagaré incondicionalmente a la orden de:{' '}
                        <B>{acreedor.nombreCompleto || '________________________________'}</B>., identificado{' '}
                        {acreedorDocTipo} No. <B>{acreedor.numeroDocumento || '______________________'}</B> o a quien
                        represente sus derechos, en la ciudad y dirección indicados, y en las fechas de amortización por
                        cuotas señaladas en la cláusula tercera de este pagaré, la suma de{' '}
                        <B>
                            {valorWords} ({valorFormatted})
                        </B>
                        , más los intereses señalados en la cláusula segunda de este documento.
                    </Text>
                </View>

                {/* SEGUNDA */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>SEGUNDA.- INTERESES: </Text>
                        {'Que sobre la suma debida se reconocerán intereses corrientes a una tasa nominal mensual del '}
                        {obligacion.tasaInteresNominal ? (
                            <B>{obligacion.tasaInteresNominal}% </B>
                        ) : (
                            '____________________________________ '
                        )}
                        {'. Sin embargo,'} en caso de mora en el cumplimiento de las cuotas señaladas en la cláusula
                        tercera de este pagaré, cancelaré intereses de mora a un tasa nominal mensual del{' '}
                        {obligacion.tasaInteresMora ? <B>{obligacion.tasaInteresMora}% </B> : '____________________ '}
                        mensual sobre el saldo de capital que llegue a estar en mora.{' '}
                    </Text>
                    <Para label="Intereses moratorios">
                        Los intereses moratorios se causarán sobre las sumas vencidas y no pagadas, desde el día
                        siguiente al del vencimiento de la obligación o de cada cuota, según el caso, hasta el día del
                        pago efectivo.
                    </Para>
                </View>

                {/* TERCERA */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>TERCERA.-PLAZO. </Text>
                        {obligacion.modalidadPago === 'unico' ? (
                            <>
                                Que pagaré el capital indicado en la cláusula primera de este pagaré en un único pago
                                con vencimiento el <B>{fechaVencimientoStr}</B>.
                            </>
                        ) : obligacion.modalidadPago === 'cuotas' ? (
                            <>
                                Que pagaré el capital indicado en la cláusula primera de este pagaré mediante{' '}
                                <B>{obligacion.numeroCuotas || '____________'}</B> cuotas iguales,{' '}
                                {periodoLabel(obligacion.periodoCuotas, obligacion.numeroCuotas)} y sucesivas. La
                                primera de estas cuotas se cancelará el día _____________________ y de allí en adelante
                                en forma {periodoLabel(obligacion.periodoCuotas, '1')} el último día de cada período.
                            </>
                        ) : (
                            'Que pagaré el capital indicado en la cláusula primera de este pagaré mediante ____________ cuotas iguales, mensuales y sucesivas cada una de ellas por un monto de __________________________. La primera de estas cuotas se cancelará el día _____________________y de allí en adelante en forma mensual el último día de cada mes.'
                        )}
                    </Text>
                    <Para label="Transferible por endoso">
                        El presente pagaré es transferible por endoso y el tenedor podrá hacer exigible la obligación
                        total o parcialmente según los términos pactados.
                    </Para>
                </View>

                {/* CUARTA */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>CUARTA.-CLAUSULA ACELERATORIA: </Text>
                        El tenedor del presente pagaré podrá declarar vencidos la totalidad de los plazos de esta
                        obligación o de las cuotas que constituyan el saldo de lo debido y exigir su pago inmediato ya
                        sea judicial o extrajudicialmente, cuando el deudor entre en mora o incumpla una cualquiera de
                        las obligaciones derivadas del presente documento.{' '}
                    </Text>
                    <Para label="Mérito ejecutivo">
                        El presente pagaré presta mérito ejecutivo y podrá ser cobrado judicialmente sin necesidad de
                        requerimiento previo al deudor, de conformidad con las normas del Código de Comercio y el Código
                        General del Proceso.
                    </Para>
                </View>

                {/* QUINTA */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>QUINTA – IMPUESTO DE TIMBRE: </Text>
                        Los gastos originados por concepto de impuesto de timbre correrán a cargo de EL DEUDOR.
                    </Text>
                </View>

                {/* SEXTA */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>SEXTA – DOMICILIO CONTRACTUAL: </Text>
                        Para todos los efectos legales derivados del presente pagaré, las partes acuerdan como domicilio
                        contractual la ciudad de <B>{ciudadStr}</B>, sin perjuicio de la competencia de otras
                        jurisdicciones que la ley señale de manera imperativa.
                    </Text>
                </View>

                {/* ── Closing statement ── */}
                <Text style={s.closingText}>
                    En Constancia de lo anterior, se suscribe este documento en la ciudad de <B>{ciudadStr}</B> el{' '}
                    <B>{fechaSuscripcionStr}</B>.
                </Text>

                {/* ── Signature block ── */}
                <View
                    style={s.signaturesWrap}
                    wrap={false}
                >
                    <View style={s.sigCol}>
                        <SigBlock
                            name={deudor.nombreCompleto || '___________________'}
                            cc={`${deudor.tipoDocumento || 'Doc.'} ${deudor.numeroDocumento || '___________________'}`}
                            role="DEUDOR"
                        />
                    </View>
                    <View style={s.sigCol}>
                        <SigBlock
                            name={acreedor.nombreCompleto || '___________________'}
                            cc={`${acreedor.tipoDocumento || 'Doc.'} ${acreedor.numeroDocumento || '___________________'}`}
                            role="ACREEDOR"
                        />
                    </View>
                </View>
            </Page>
        </Document>
    );
}
