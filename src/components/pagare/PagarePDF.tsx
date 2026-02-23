import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { PagareFormData, PlanTier } from './types';
import { formatCOP, formatDate, numberToWordsCOP } from './pagareUtils';

interface PagarePDFProps {
    formData: PagareFormData;
    plan: PlanTier;
    logoUrl?: string;
}

const s = StyleSheet.create({
    page: {
        fontFamily: 'Times-Roman',
        fontSize: 10,
        lineHeight: 1.5,
        padding: '36pt 46pt',
        color: '#1e293b',
    },
    // ── Header ──────────────────────────────
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    logoText: {
        fontSize: 19,
        fontFamily: 'Times-Bold',
        color: '#1b3070',
    },
    logoImage: {
        height: 38,
        objectFit: 'contain',
    },
    titleArea: {
        alignItems: 'flex-end',
    },
    pagareTitle: {
        fontSize: 26,
        fontFamily: 'Times-Bold',
        color: '#1b3070',
        letterSpacing: 4,
        lineHeight: 1,
    },
    pagareSubtitle: {
        fontSize: 7.5,
        color: '#64748b',
        marginTop: 3,
    },
    divider: {
        borderBottomWidth: 2.5,
        borderBottomColor: '#1b3070',
        marginBottom: 12,
    },
    // ── Amount Box ──────────────────────────
    amountBox: {
        borderWidth: 1.5,
        borderColor: '#1b3070',
        borderRadius: 4,
        padding: '10pt 14pt',
        backgroundColor: '#eef2ff',
        marginBottom: 12,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    amountLbl: {
        fontSize: 7.5,
        fontFamily: 'Times-Bold',
        color: '#1b3070',
        marginBottom: 3,
    },
    amountVal: {
        fontSize: 20,
        fontFamily: 'Times-Bold',
        color: '#1b3070',
    },
    amountDateLbl: {
        fontSize: 7.5,
        fontFamily: 'Times-Bold',
        color: '#1b3070',
        marginBottom: 3,
        textAlign: 'right',
    },
    amountDateVal: {
        fontSize: 10,
        fontFamily: 'Times-Bold',
        textAlign: 'right',
    },
    letrasRow: {
        borderTopWidth: 1,
        borderTopColor: '#a5b4fc',
        borderTopStyle: 'dashed',
        paddingTop: 6,
    },
    sonLbl: {
        fontFamily: 'Times-Bold',
        fontSize: 9,
        color: '#64748b',
    },
    letrasVal: {
        fontFamily: 'Times-Italic',
        fontSize: 9,
    },
    // ── Parties ─────────────────────────────
    partiesRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    partyBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 3,
        padding: '8pt 10pt',
        backgroundColor: '#f8fafc',
    },
    partyBoxLeft: {
        marginRight: 8,
    },
    partyTitle: {
        fontSize: 8,
        fontFamily: 'Times-Bold',
        color: '#1b3070',
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 4,
    },
    partyRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    partyLbl: {
        fontSize: 9,
        color: '#64748b',
        width: 54,
    },
    partyVal: {
        fontSize: 9,
        fontFamily: 'Times-Bold',
        flex: 1,
    },
    // ── Body text ───────────────────────────
    para: {
        fontSize: 10,
        textAlign: 'justify',
        marginBottom: 10,
    },
    bold: {
        fontFamily: 'Times-Bold',
    },
    italic: {
        fontFamily: 'Times-Italic',
    },
    // ── Payment box ─────────────────────────
    payBox: {
        borderWidth: 1,
        borderColor: '#94a3b8',
        borderStyle: 'dashed',
        borderRadius: 3,
        padding: '8pt 12pt',
        marginBottom: 12,
        backgroundColor: '#fafafa',
    },
    payTitle: {
        fontSize: 8,
        fontFamily: 'Times-Bold',
        color: '#1b3070',
        marginBottom: 6,
    },
    payText: {
        fontSize: 10,
        marginBottom: 4,
    },
    moraRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    moraLbl: {
        fontSize: 9,
        color: '#64748b',
    },
    moraVal: {
        fontSize: 9,
        fontFamily: 'Times-Bold',
    },
    // ── Clauses ─────────────────────────────
    clausesTitle: {
        fontSize: 8,
        fontFamily: 'Times-Bold',
        color: '#1b3070',
        marginBottom: 6,
    },
    clausePara: {
        fontSize: 10,
        textAlign: 'justify',
        marginBottom: 5,
    },
    // ── Divider light ───────────────────────
    hrLight: {
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        marginBottom: 20,
    },
    // ── Signatures ──────────────────────────
    sigRow: {
        flexDirection: 'row',
    },
    sigBlock: {
        flex: 1,
    },
    sigBlockLeft: {
        marginRight: 32,
    },
    sigSpace: {
        height: 48,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
        marginBottom: 6,
    },
    sigName: {
        fontSize: 10,
        fontFamily: 'Times-Bold',
    },
    sigDetail: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 2,
    },
    // ── Watermark ───────────────────────────
    watermark: {
        position: 'absolute',
        top: '40%',
        left: '8%',
        fontSize: 52,
        fontFamily: 'Times-Bold',
        color: '#dde3f0',
        transform: 'rotate(-42deg)',
    },
    // ── Free footer ─────────────────────────
    freeFooter: {
        marginTop: 18,
        padding: '7pt 12pt',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        fontSize: 8,
        color: '#94a3b8',
        textAlign: 'center',
    },
});

const PERIODO_LABELS: Record<string, string> = {
    mensual: 'mensuales',
    bimestral: 'bimestrales',
    trimestral: 'trimestrales',
};

export default function PagarePDF({ formData, plan, logoUrl }: PagarePDFProps) {
    const { acreedor, deudor, obligacion } = formData;
    const isFree = plan === 'free';

    const valorNum = parseInt(obligacion.valorPrincipal.replace(/\D/g, ''), 10) || 0;
    const valorCOP = valorNum > 0 ? formatCOP(obligacion.valorPrincipal) : '$ ___________________';
    const valorLetras =
        valorNum > 0 ? numberToWordsCOP(valorNum).toUpperCase() : '___________________';

    const moraTxt = obligacion.tasaInteresMora
        ? `${obligacion.tasaInteresMora}% mensual`
        : 'la tasa maxima legal vigente certificada por la Superintendencia Financiera de Colombia';

    const ciudadFecha = `${obligacion.ciudadSuscripcion || '___________________'}${
        obligacion.fechaSuscripcion ? `, ${formatDate(obligacion.fechaSuscripcion)}` : ', ___________________'
    }`;

    return (
        <Document>
            <Page
                size="A4"
                style={s.page}
            >
                {/* Watermark (appears on every page via fixed) */}
                {isFree && (
                    <Text
                        style={s.watermark}
                        fixed
                        render={() => 'LEXIA \u00B7 DRAFT'}
                    />
                )}

                {/* ── HEADER ── */}
                <View style={s.header}>
                    <View>
                        {isFree ? (
                            <Text style={s.logoText}>LEXIA</Text>
                        ) : logoUrl ? (
                            <Image
                                src={logoUrl}
                                style={s.logoImage}
                            />
                        ) : (
                            <View style={{ height: 38 }} />
                        )}
                    </View>
                    <View style={s.titleArea}>
                        <Text style={s.pagareTitle}>PAGARE</Text>
                        <Text style={s.pagareSubtitle}>
                            Titulo Valor · Codigo de Comercio de Colombia
                        </Text>
                    </View>
                </View>

                <View style={s.divider} />

                {/* ── AMOUNT BOX ── */}
                <View style={s.amountBox}>
                    <View style={s.amountRow}>
                        <View>
                            <Text style={s.amountLbl}>VALOR DEL PAGARE</Text>
                            <Text style={s.amountVal}>{valorCOP}</Text>
                        </View>
                        <View>
                            <Text style={s.amountDateLbl}>CIUDAD Y FECHA</Text>
                            <Text style={s.amountDateVal}>{ciudadFecha}</Text>
                        </View>
                    </View>
                    <View style={s.letrasRow}>
                        <Text>
                            <Text style={s.sonLbl}>{'SON: '}</Text>
                            <Text style={s.letrasVal}>{`${valorLetras} PESOS MONEDA CORRIENTE`}</Text>
                        </Text>
                    </View>
                </View>

                {/* ── PARTIES ── */}
                <View style={s.partiesRow}>
                    {/* Deudor */}
                    <View style={[s.partyBox, s.partyBoxLeft]}>
                        <Text style={s.partyTitle}>DEUDOR(A)</Text>
                        <View style={s.partyRow}>
                            <Text style={s.partyLbl}>Nombre:</Text>
                            <Text style={s.partyVal}>
                                {deudor.nombreCompleto || '___________________'}
                            </Text>
                        </View>
                        <View style={s.partyRow}>
                            <Text style={s.partyLbl}>{`${deudor.tipoDocumento || 'Doc.'}:`}</Text>
                            <Text style={s.partyVal}>
                                {deudor.numeroDocumento || '___________________'}
                            </Text>
                        </View>
                        <View style={s.partyRow}>
                            <Text style={s.partyLbl}>Ciudad:</Text>
                            <Text style={s.partyVal}>
                                {deudor.ciudadResidencia || '___________________'}
                            </Text>
                        </View>
                        {deudor.telefono ? (
                            <View style={s.partyRow}>
                                <Text style={s.partyLbl}>Telefono:</Text>
                                <Text style={s.partyVal}>{deudor.telefono}</Text>
                            </View>
                        ) : null}
                        {deudor.email ? (
                            <View style={s.partyRow}>
                                <Text style={s.partyLbl}>Correo:</Text>
                                <Text style={s.partyVal}>{deudor.email}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Acreedor */}
                    <View style={s.partyBox}>
                        <Text style={s.partyTitle}>ACREEDOR(A)</Text>
                        <View style={s.partyRow}>
                            <Text style={s.partyLbl}>Nombre:</Text>
                            <Text style={s.partyVal}>
                                {acreedor.nombreCompleto || '___________________'}
                            </Text>
                        </View>
                        <View style={s.partyRow}>
                            <Text style={s.partyLbl}>{`${acreedor.tipoDocumento || 'Doc.'}:`}</Text>
                            <Text style={s.partyVal}>
                                {acreedor.numeroDocumento || '___________________'}
                            </Text>
                        </View>
                        {acreedor.telefono ? (
                            <View style={s.partyRow}>
                                <Text style={s.partyLbl}>Telefono:</Text>
                                <Text style={s.partyVal}>{acreedor.telefono}</Text>
                            </View>
                        ) : null}
                        {acreedor.email ? (
                            <View style={s.partyRow}>
                                <Text style={s.partyLbl}>Correo:</Text>
                                <Text style={s.partyVal}>{acreedor.email}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* ── OBLIGATION TEXT ── */}
                <Text style={s.para}>
                    {'Yo, '}
                    <Text style={s.bold}>{deudor.nombreCompleto || '___________________'}</Text>
                    {', identificado(a) con '}
                    <Text style={s.bold}>{deudor.tipoDocumento || '___'}</Text>
                    {' No. '}
                    <Text style={s.bold}>{deudor.numeroDocumento || '___________________'}</Text>
                    {', residente en '}
                    <Text style={s.bold}>{deudor.ciudadResidencia || '___________________'}</Text>
                    {', me comprometo a pagar incondicionalmente y a la orden de '}
                    <Text style={s.bold}>{acreedor.nombreCompleto || '___________________'}</Text>
                    {', identificado(a) con '}
                    <Text style={s.bold}>{acreedor.tipoDocumento || '___'}</Text>
                    {' No. '}
                    <Text style={s.bold}>{acreedor.numeroDocumento || '___________________'}</Text>
                    {', la suma de '}
                    <Text style={s.bold}>{valorCOP}</Text>
                    {' ('}
                    <Text style={s.italic}>{`${valorLetras} PESOS M/L`}</Text>
                    {').'}
                </Text>

                {/* ── PAYMENT CONDITIONS ── */}
                <View style={s.payBox}>
                    <Text style={s.payTitle}>CONDICIONES DE PAGO</Text>
                    {obligacion.modalidadPago === 'unico' ? (
                        <Text style={s.payText}>
                            {'Pago unico: a mas tardar el '}
                            <Text style={s.bold}>
                                {obligacion.fechaVencimiento
                                    ? formatDate(obligacion.fechaVencimiento)
                                    : '___________________'}
                            </Text>
                            {'.'}
                        </Text>
                    ) : obligacion.modalidadPago === 'cuotas' &&
                      obligacion.numeroCuotas &&
                      obligacion.periodoCuotas ? (
                        <Text style={s.payText}>
                            {'En '}
                            <Text style={s.bold}>{obligacion.numeroCuotas}</Text>
                            {' cuotas '}
                            <Text style={s.bold}>
                                {PERIODO_LABELS[obligacion.periodoCuotas] || obligacion.periodoCuotas}
                            </Text>
                            {
                                ' iguales y consecutivas, a partir del mes siguiente a la fecha de suscripcion.'
                            }
                        </Text>
                    ) : (
                        <Text style={[s.payText, { color: '#94a3b8' }]}>
                            Condiciones de pago por definir.
                        </Text>
                    )}
                    <View style={s.moraRow}>
                        <Text style={s.moraLbl}>{'Intereses de mora: '}</Text>
                        <Text style={s.moraVal}>{moraTxt}</Text>
                    </View>
                </View>

                {/* ── CLAUSES ── */}
                <Text style={s.clausesTitle}>CLAUSULAS</Text>
                <Text style={s.clausePara}>
                    <Text style={s.bold}>{'PRIMERA. '}</Text>
                    {
                        'El presente pagare presta merito ejecutivo y es exigible conforme a los articulos 621 y siguientes del Codigo de Comercio de Colombia. El deudor renuncia expresamente al proceso ordinario y se somete al proceso ejecutivo para su cobro.'
                    }
                </Text>
                <Text style={s.clausePara}>
                    <Text style={s.bold}>{'SEGUNDA. '}</Text>
                    {'En caso de mora en el pago, el deudor reconocera intereses moratorios a la tasa de '}
                    <Text style={s.bold}>{moraTxt}</Text>
                    {
                        ', sin perjuicio del cobro de honorarios de cobranza y costas judiciales a que haya lugar.'
                    }
                </Text>
                <Text style={s.clausePara}>
                    <Text style={s.bold}>{'TERCERA. '}</Text>
                    {
                        'El presente pagare es transferible por endoso, conforme a las normas que regulan los titulos valores en Colombia, sin que sea necesario el consentimiento del deudor para su negociacion.'
                    }
                </Text>
                <Text style={s.clausePara}>
                    <Text style={s.bold}>{'CUARTA. '}</Text>
                    {
                        'Para todos los efectos legales derivados del presente titulo valor, las partes senalan como domicilio contractual la ciudad de '
                    }
                    <Text style={s.bold}>{obligacion.ciudadSuscripcion || '___________________'}</Text>
                    {' y se someten a la jurisdiccion de sus jueces competentes.'}
                </Text>

                <View style={s.hrLight} />

                {/* ── SIGNATURES ── */}
                <View style={s.sigRow}>
                    <View style={[s.sigBlock, s.sigBlockLeft]}>
                        <View style={s.sigSpace} />
                        <Text style={s.sigName}>
                            {deudor.nombreCompleto || '___________________'}
                        </Text>
                        <Text style={s.sigDetail}>{`DEUDOR  \u00B7  ${deudor.tipoDocumento || '___'}  ${deudor.numeroDocumento || '___'}`}</Text>
                        {deudor.email ? (
                            <Text style={s.sigDetail}>{deudor.email}</Text>
                        ) : null}
                    </View>
                    <View style={s.sigBlock}>
                        <View style={s.sigSpace} />
                        <Text style={s.sigName}>
                            {acreedor.nombreCompleto || '___________________'}
                        </Text>
                        <Text style={s.sigDetail}>{`ACREEDOR  \u00B7  ${acreedor.tipoDocumento || '___'}  ${acreedor.numeroDocumento || '___'}`}</Text>
                        {acreedor.email ? (
                            <Text style={s.sigDetail}>{acreedor.email}</Text>
                        ) : null}
                    </View>
                </View>

                {/* ── FREE FOOTER ── */}
                {isFree && (
                    <Text style={s.freeFooter}>
                        {'Documento generado con '}
                        <Text style={{ fontFamily: 'Times-Bold', color: '#64748b' }}>Lexia</Text>
                        {' (plan gratuito). Actualiza tu plan en '}
                        <Text style={{ fontFamily: 'Times-Bold', color: '#64748b' }}>lexia.co</Text>
                        {' para eliminar esta marca de agua y agregar tu logo personalizado.'}
                    </Text>
                )}
            </Page>
        </Document>
    );
}
