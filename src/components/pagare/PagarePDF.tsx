import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { PagareFormData, PlanTier } from './types';
import { formatCOP, formatDate, numberToWordsCOP } from './pagareUtils';

interface PagarePDFProps {
    formData: PagareFormData;
    plan: PlanTier;
    logoUrl?: string;
}

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Times-Roman',
        fontSize: 10,
        lineHeight: 1.6,
        padding: '40pt 48pt',
        color: '#1e293b',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    logoText: {
        fontSize: 16,
        fontFamily: 'Times-Bold',
        color: '#1b3070',
    },
    logoImage: {
        height: 36,
        objectFit: 'contain',
    },
    titleBlock: {
        alignItems: 'flex-end',
    },
    docTitle: {
        fontSize: 16,
        fontFamily: 'Times-Bold',
        color: '#1b3070',
        letterSpacing: 2,
    },
    docSubtitle: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 2,
    },
    divider: {
        borderBottomWidth: 2,
        borderBottomColor: '#1b3070',
        marginBottom: 16,
    },
    paragraph: {
        marginBottom: 12,
        textAlign: 'justify',
    },
    bold: {
        fontFamily: 'Times-Bold',
    },
    signaturesRow: {
        flexDirection: 'row',
        gap: 40,
        marginTop: 48,
    },
    signatureBlock: {
        flex: 1,
        borderTopWidth: 1,
        borderTopColor: '#334155',
        paddingTop: 8,
    },
    sigName: {
        fontFamily: 'Times-Bold',
        fontSize: 10,
    },
    sigDetail: {
        color: '#64748b',
        fontSize: 9,
        marginTop: 2,
    },
    watermarkText: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: 48,
        fontFamily: 'Times-Bold',
        color: '#e2e8f0',
    },
    freeFooter: {
        marginTop: 24,
        padding: '8pt 12pt',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 6,
        fontSize: 8,
        color: '#94a3b8',
        textAlign: 'center',
    },
});

export default function PagarePDF({ formData, plan, logoUrl }: PagarePDFProps) {
    const { acreedor, deudor, obligacion } = formData;
    const showWatermark = plan === 'free';

    const valorNum = parseInt(obligacion.valorPrincipal.replace(/\D/g, ''), 10) || 0;
    const valorCOP = formatCOP(obligacion.valorPrincipal);
    const valorLetras = valorNum > 0 ? numberToWordsCOP(valorNum) : '___________________';

    const periodoLabel: Record<string, string> = {
        mensual: 'mensuales',
        bimestral: 'bimestrales',
        trimestral: 'trimestrales',
    };

    const moraTxt = obligacion.tasaInteresMora
        ? `${obligacion.tasaInteresMora}% mensual`
        : 'la tasa máxima legal vigente certificada por la Superintendencia Financiera de Colombia';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Watermark */}
                {showWatermark && (
                    <Text style={styles.watermarkText}>LEXIA · DRAFT</Text>
                )}

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        {logoUrl && plan !== 'free' ? (
                            <Image src={logoUrl} style={styles.logoImage} />
                        ) : (
                            <Text style={styles.logoText}>LEXIA</Text>
                        )}
                    </View>
                    <View style={styles.titleBlock}>
                        <Text style={styles.docTitle}>PAGARÉ</Text>
                        <Text style={styles.docSubtitle}>Título Valor · Código de Comercio colombiano</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* City & Date */}
                <Text style={styles.paragraph}>
                    En <Text style={styles.bold}>{obligacion.ciudadSuscripcion || '___________________'}</Text>, el{' '}
                    <Text style={styles.bold}>
                        {obligacion.fechaSuscripcion ? formatDate(obligacion.fechaSuscripcion) : '___________________'}
                    </Text>.
                </Text>

                {/* Obligation paragraph */}
                <Text style={styles.paragraph}>
                    Yo, <Text style={styles.bold}>{deudor.nombreCompleto || '___________________'}</Text>, identificado(a) con {deudor.tipoDocumento || '___'} No.{' '}
                    <Text style={styles.bold}>{deudor.numeroDocumento || '___________________'}</Text>, residente en{' '}
                    <Text style={styles.bold}>{deudor.ciudadResidencia || '___________________'}</Text>
                    {deudor.telefono ? `, teléfono ${deudor.telefono}` : ''}, me comprometo a pagar incondicionalmente a la orden de{' '}
                    <Text style={styles.bold}>{acreedor.nombreCompleto || '___________________'}</Text>, identificado(a) con {acreedor.tipoDocumento || '___'} No.{' '}
                    <Text style={styles.bold}>{acreedor.numeroDocumento || '___________________'}</Text>
                    {acreedor.telefono ? `, teléfono ${acreedor.telefono}` : ''}, la suma de{' '}
                    <Text style={styles.bold}>{valorCOP}</Text> ({valorLetras}).
                </Text>

                {/* Payment terms */}
                {obligacion.modalidadPago === 'unico' && (
                    <Text style={styles.paragraph}>
                        El pago se realizará en su totalidad a más tardar el{' '}
                        <Text style={styles.bold}>
                            {obligacion.fechaVencimiento ? formatDate(obligacion.fechaVencimiento) : '___________________'}
                        </Text>.
                    </Text>
                )}
                {obligacion.modalidadPago === 'cuotas' && obligacion.numeroCuotas && obligacion.periodoCuotas && (
                    <Text style={styles.paragraph}>
                        El pago se realizará en <Text style={styles.bold}>{obligacion.numeroCuotas}</Text> cuotas{' '}
                        {periodoLabel[obligacion.periodoCuotas] || obligacion.periodoCuotas} iguales y consecutivas, a partir del mes siguiente a la fecha de suscripción del presente documento.
                    </Text>
                )}

                {/* Mora clause */}
                <Text style={styles.paragraph}>
                    En caso de mora en el pago, el deudor reconocerá intereses moratorios a la tasa de{' '}
                    <Text style={styles.bold}>{moraTxt}</Text>, sin perjuicio del cobro de honorarios de cobranza y costas judiciales a que haya lugar.
                </Text>

                {/* Transfer clause */}
                <Text style={styles.paragraph}>
                    El presente pagaré es transferible por endoso y presta mérito ejecutivo conforme a los artículos 621 y siguientes del Código de Comercio de Colombia. El deudor renuncia a los trámites del proceso ordinario y se somete al proceso ejecutivo para su cobro.
                </Text>

                {/* Domicile */}
                <Text style={styles.paragraph}>
                    Para todos los efectos legales derivados del presente título valor, las partes señalan como domicilio contractual la ciudad de{' '}
                    <Text style={styles.bold}>{obligacion.ciudadSuscripcion || '___________________'}</Text>.
                </Text>

                {/* Signatures */}
                <View style={styles.signaturesRow}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.sigName}>{acreedor.nombreCompleto || '___________________'}</Text>
                        <Text style={styles.sigDetail}>
                            Acreedor · {acreedor.tipoDocumento || '___'} {acreedor.numeroDocumento || '___'}
                        </Text>
                        {acreedor.email ? <Text style={styles.sigDetail}>{acreedor.email}</Text> : null}
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.sigName}>{deudor.nombreCompleto || '___________________'}</Text>
                        <Text style={styles.sigDetail}>
                            Deudor · {deudor.tipoDocumento || '___'} {deudor.numeroDocumento || '___'}
                        </Text>
                        {deudor.email ? <Text style={styles.sigDetail}>{deudor.email}</Text> : null}
                    </View>
                </View>

                {/* Free plan footer */}
                {showWatermark && (
                    <Text style={styles.freeFooter}>
                        Documento generado con Lexia (plan gratuito). Actualiza tu plan en lexia.co para eliminar esta marca de agua.
                    </Text>
                )}
            </Page>
        </Document>
    );
}
