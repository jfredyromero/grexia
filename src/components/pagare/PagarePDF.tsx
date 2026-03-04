import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
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
        paddingTop: 72,
        paddingBottom: 36,
        paddingHorizontal: 46,
        color: '#1e293b',
    },
    // ── Fixed header (all pages) ─────────────
    fixedHeader: {
        position: 'absolute',
        top: 15,
        left: 46,
        right: 46,
    },
    // ── Lexia logo text ──────────────────────
    lexiaText: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        color: '#112A46',
        letterSpacing: 2.5,
    },
    // ── Header ──────────────────────────────
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    logoText: {
        fontSize: 19,
        fontFamily: 'Times-Bold',
        color: '#112F4F',
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
        color: '#112F4F',
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
        borderBottomColor: '#112F4F',
        marginBottom: 12,
    },
    // ── Amount Box ──────────────────────────
    amountBox: {
        borderWidth: 1.5,
        borderColor: '#112F4F',
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
        color: '#112F4F',
        marginBottom: 3,
    },
    amountVal: {
        fontSize: 20,
        fontFamily: 'Times-Bold',
        color: '#112F4F',
    },
    amountDateLbl: {
        fontSize: 7.5,
        fontFamily: 'Times-Bold',
        color: '#112F4F',
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
        color: '#112F4F',
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
        color: '#112F4F',
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
        color: '#112F4F',
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
    // ── Watermark — same pattern as fixedHeader/pageFooter ──
    watermark: {
        position: 'absolute',
        top: 300,
        left: -120,
        right: 0,
        alignItems: 'center',
        transform: 'rotate(-42deg)',
        transformOrigin: 'center',
        opacity: 0.12,
    },
    watermarkText: {
        fontSize: 180,
        fontFamily: 'Helvetica-Bold',
        color: '#112F4F',
        letterSpacing: 6,
    },
    // ── Page footer (all pages, all plans) — mismo patrón que fixedHeader pero en bottom ──
    pageFooter: {
        position: 'absolute',
        bottom: 14,
        left: 46,
        right: 46,
    },
    pageFooterDivider: {
        borderTopWidth: 0.5,
        borderTopColor: '#e2e8f0',
        marginBottom: 5,
    },
    pageFooterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    pageFooterBrand: {
        fontSize: 7,
        color: '#94a3b8',
    },
    pageFooterBrandBold: {
        fontSize: 7,
        color: '#112F4F',
        fontFamily: 'Helvetica-Bold',
    },
    pageFooterCta: {
        fontSize: 7,
        color: '#64748b',
        textAlign: 'right',
        flex: 1,
    },
    pageFooterCtaBold: {
        fontSize: 7,
        color: '#112F4F',
        fontFamily: 'Helvetica-Bold',
    },
});

const PERIODO_LABELS: Record<string, string> = {
    mensual: 'mensuales',
    bimestral: 'bimestrales',
    trimestral: 'trimestrales',
};

// ── Lexia logo icon (react-pdf SVG) ──────────────────────────────────────────

function LexiaLogoPDF({ size = 24 }: { size?: number }) {
    return (
        <Svg
            viewBox="0 0 1024 1024"
            width={size}
            height={size}
        >
            <Path
                fill="#112F4F"
                d="M438.7 533.3c-37.5-36.8-74.6-73.4-112.1-109.7-10.8-10.6-17.2-22.7-16.6-38.1.4-10.6 3.8-20.5 11.2-28.1 23.2-23.5 46.4-46.9 70.3-69.6 17.2-16.3 45.9-15.5 63.4 1 18.1 17.2 35.8 34.9 53.7 52.4 48.5 47.4 96.9 94.9 145.3 142.4 18.3 17.9 19.3 48.8 1.5 67.4-17.3 18-35.4 35.3-53.2 52.9-3.4 3.4-6.8 6.8-10.3 10.2-21 20-50.5 20-71.2-.2-27.4-26.7-54.5-53.4-82-80.4z"
            />
            <Path
                fill="#112F4F"
                d="M858.9 707c0 .4.1.9-.2 2-.8 9.8-1.4 19-1.7 28.2-.1 2.9-.6 5-4.5 4.8-5.2 0-9.8 0-14.8-.3-7-.1-13.9.1-21.2.3-7.2 0-13.9 0-21 0-1.4 0-2.5 0-3.9 0-1.1 0-1.9 0-3.1 0-10.8-.3-21.2-.6-32-.9-2.4.6-4.5 1.3-6.6 2-1.4.1-2.8.1-4.6-.4-.7-2.9-1-5.3-1.4-8.1 0-97.5 0-194.5 0-291.5 0-2-.9-3.9-1.3-5.9-.7 0-1.4 0-2.7-.4-2.4-.5-4.2-.7-6-.7-21.3 0-42.6 0-63.9 0-1.8 0-3.6 0-5 0v-11.6c.2-11 0-22-.3-33-.1-4.6 1.5-5.5 5.7-5.5 44.3.1 88.6.1 132.9.1 4.9 0 9.8 0 15.5 0v2.1c0 2.1 0 4.2 0 6.3 0 68.3 0 136.6 0 204.9 0 29.3 0 58.6.1 87.9 0 1.8 1.3 3.5 2 5.3 0 0 0 .1.2.3 1 0 1.9.2 3.2.3 1.8 0 3.2 0 5 0 4.2 0 7.9 0 12 0 1.8 0 3.2 0 5 0 3.8 0 7.2 0 10.5.4.7 1.8 1.3 3.2 2 4.6z"
            />
            <Path
                fill="#5FADAF"
                d="M455.1 705.4c-2.9 7.3-5.8 14.6-9.1 22.4-1 2.9-1.9 5.3-1.9 7.7-.2 6.5-.1 6.5-6.5 6.5-86.4 0-172.7 0-259 0-1.2 0-2.6.4-3.4-.1-1.3-.7-2.2-2.1-3.3-3.2 15.2-15.4 30.3-30.9 45.5-46.3 56.5-56.9 112.9-113.8 169.4-170.7 1.4-1.4 2.9-2.7 5.2-4.9 9.5 10.6 18.8 21.1 29 32.5-4.6 4.4-11 10.2-17.1 16.3-34.7 34.8-69.4 69.6-104 104.5-9.9 9.9-19.6 20-29.3 30.7 1.9.8 3.9 1.2 5.8 1.2 57.2 0 114.5 0 171.7 0 1.2 0 2.4.1 3.5 0 2.6-.3 3.7.9 3.6 3.4z"
            />
            <Path
                fill="#112F4F"
                d="M624.1 312c0-6.1 0-11.8 0-17.7 78.3 0 156.2 0 234.5 0 0 25.9 0 51.9 0 78.2-77.9 0-155.8 0-234.5 0 0-19.9 0-40 0-60.5z"
            />
            <Path
                fill="#112F4F"
                d="M481.1 739c.5-19.3 15.9-35.5 36.8-37.7 1.7.4 2.7.6 3.7.6 48.7 0 97.5 0 146.2 0 1.4 0 2.8-.5 4.2-.8 19.7.7 38.2 20.8 37 40.3 0 .6-.7 1.2-1.8 1.4-2.7-.5-4.7-.8-6.6-.8-71 0-142 0-213 0-2.6 0-5.5.6-6.5-2.9z"
            />
            <Path
                fill="#FFFFFF"
                d="M454 488c-15.6-16.6-31-33-46.2-49.1 21.8-21.8 45.3-45.2 69-68.9 31.9 31.3 64.1 62.8 96.1 94.2-23.6 23.6-47.1 47.1-70.8 70.9-15.7-15.4-31.7-31.1-48.1-47.1z"
            />
            <Path
                fill="#FFFFFF"
                d="M383 355c11.2-11.2 22.2-22.1 33.2-33 5.2-5.1 6.7-5 11.9.1 5.9 5.9 11.7 11.8 17.4 17.5-23.4 23.7-46.8 47.3-70.5 71.3-6.8-6.8-13.6-13.3-20.1-20.2-3.4-3.4-1.3-6.5 1.5-9.3 8.8-8.7 17.6-17.3 26.6-26.4z"
            />
            <Path
                fill="#FFFFFF"
                d="M544.5 576.5c-3.8-3.9-7.4-7.6-10.9-11.3 23.3-23.2 46.8-46.6 70.7-70.5 6.6 6.6 13.7 13.3 20.4 20.4 2.6 2.7.7 5.6-1.6 7.9-9.6 9.5-19.1 19-28.7 28.5-10.3 10.2-20.6 20.4-30.9 30.6-5.3 5.2-7.5 5.2-13 0-1.9-1.9-3.8-3.8-5.9-6-.1 0-.1.1-.1 0z"
            />
        </Svg>
    );
}

export default function PagarePDF({ formData, plan, logoUrl }: PagarePDFProps) {
    const { acreedor, deudor, obligacion } = formData;
    const isFree = plan === 'free';

    const valorNum = parseInt(obligacion.valorPrincipal.replace(/\D/g, ''), 10) || 0;
    const valorCOP = valorNum > 0 ? formatCOP(obligacion.valorPrincipal) : '$ ___________________';
    const valorLetras = valorNum > 0 ? numberToWordsCOP(valorNum).toUpperCase() : '___________________';

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
                    <View
                        fixed
                        style={s.watermark}
                    >
                        <Text style={s.watermarkText}>LEXIA</Text>
                    </View>
                )}

                {/* ── FIXED HEADER (all pages) ── */}
                <View
                    fixed
                    style={s.fixedHeader}
                >
                    <View style={s.header}>
                        {isFree ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <LexiaLogoPDF size={28} />
                                <View style={{ width: 1, height: 28, backgroundColor: '#e2e8f0' }} />
                                <Text style={s.lexiaText}>LEXIA</Text>
                            </View>
                        ) : logoUrl ? (
                            <Image
                                src={logoUrl}
                                style={s.logoImage}
                            />
                        ) : (
                            <View style={{ height: 38 }} />
                        )}
                        <View style={s.titleArea}>
                            <Text style={s.pagareTitle}>PAGARE</Text>
                            <Text style={s.pagareSubtitle}>Titulo Valor · Codigo de Comercio de Colombia</Text>
                        </View>
                    </View>
                    <View style={s.divider} />
                </View>

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
                            <Text style={s.partyVal}>{deudor.nombreCompleto || '___________________'}</Text>
                        </View>
                        <View style={s.partyRow}>
                            <Text style={s.partyLbl}>{`${deudor.tipoDocumento || 'Doc.'}:`}</Text>
                            <Text style={s.partyVal}>{deudor.numeroDocumento || '___________________'}</Text>
                        </View>
                        <View style={s.partyRow}>
                            <Text style={s.partyLbl}>Ciudad:</Text>
                            <Text style={s.partyVal}>{deudor.ciudadResidencia || '___________________'}</Text>
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
                            <Text style={s.partyVal}>{acreedor.nombreCompleto || '___________________'}</Text>
                        </View>
                        <View style={s.partyRow}>
                            <Text style={s.partyLbl}>{`${acreedor.tipoDocumento || 'Doc.'}:`}</Text>
                            <Text style={s.partyVal}>{acreedor.numeroDocumento || '___________________'}</Text>
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
                    ) : obligacion.modalidadPago === 'cuotas' && obligacion.numeroCuotas && obligacion.periodoCuotas ? (
                        <Text style={s.payText}>
                            {'En '}
                            <Text style={s.bold}>{obligacion.numeroCuotas}</Text>
                            {' cuotas '}
                            <Text style={s.bold}>
                                {PERIODO_LABELS[obligacion.periodoCuotas] || obligacion.periodoCuotas}
                            </Text>
                            {' iguales y consecutivas, a partir del mes siguiente a la fecha de suscripcion.'}
                        </Text>
                    ) : (
                        <Text style={[s.payText, { color: '#94a3b8' }]}>Condiciones de pago por definir.</Text>
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
                    {', sin perjuicio del cobro de honorarios de cobranza y costas judiciales a que haya lugar.'}
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
                        <Text style={s.sigName}>{deudor.nombreCompleto || '___________________'}</Text>
                        <Text
                            style={s.sigDetail}
                        >{`DEUDOR  \u00B7  ${deudor.tipoDocumento || '___'}  ${deudor.numeroDocumento || '___'}`}</Text>
                        {deudor.email ? <Text style={s.sigDetail}>{deudor.email}</Text> : null}
                    </View>
                    <View style={s.sigBlock}>
                        <View style={s.sigSpace} />
                        <Text style={s.sigName}>{acreedor.nombreCompleto || '___________________'}</Text>
                        <Text
                            style={s.sigDetail}
                        >{`ACREEDOR  \u00B7  ${acreedor.tipoDocumento || '___'}  ${acreedor.numeroDocumento || '___'}`}</Text>
                        {acreedor.email ? <Text style={s.sigDetail}>{acreedor.email}</Text> : null}
                    </View>
                </View>

                {/* ── PAGE FOOTER (all pages, all plans) ── */}
                <View
                    fixed
                    style={s.pageFooter}
                >
                    <View style={s.pageFooterDivider} />
                    <View style={s.pageFooterRow}>
                        <Text style={s.pageFooterBrand}>
                            Generado por <Text style={s.pageFooterBrandBold}>Lexia.co</Text>
                        </Text>
                        <Text style={s.pageFooterCta}>
                            ¿Dudas sobre este documento?{' '}
                            <Text style={s.pageFooterCtaBold}>Agenda una asesoría legal</Text>
                            {' en '}
                            <Text style={s.pageFooterCtaBold}>lexia.co</Text>
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
