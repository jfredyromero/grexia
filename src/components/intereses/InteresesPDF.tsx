import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader, PDFFooter, PDFWatermark, C, BLUE, BLUE_LIGHT_BG } from '../arrendamiento/pdf/shared';
import type { ResultadoLiquidacion } from './interesesUtils';
import { formatCOP, formatPct } from './interesesUtils';

interface InteresesPDFProps {
    resultado: ResultadoLiquidacion;
}

const ADVERTENCIAS = [
    'Esta liquidación es orientativa y no constituye concepto jurídico ni reemplaza el criterio del juez o árbitro competente.',
    'Las tasas aplicadas corresponden a las certificadas por la Superintendencia Financiera de Colombia para cada período.',
    'La tasa de interés moratorio equivale al 1.5 veces la tasa bancaria corriente (tasa de usura), conforme al art. 884 del Código de Comercio.',
    'El cálculo no incluye anatocismo: los intereses se liquidan siempre sobre el capital inicial.',
    'Para períodos posteriores a la última tasa certificada publicada, se aplicó la última tasa disponible como referencia provisional.',
];

function formatDateLabel(iso: string): string {
    const [y, m, d] = iso.split('-');
    const meses = [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre',
    ];
    return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

const s = StyleSheet.create({
    section: {
        marginBottom: 12,
    },
    sectionLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7.5,
        color: C.slate700,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: C.slate300,
        paddingBottom: 3,
    },

    // Resumen
    resumenBox: {
        borderWidth: 1.5,
        borderColor: BLUE,
        borderRadius: 4,
        marginBottom: 12,
    },
    resumenTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7.5,
        color: BLUE,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        padding: 8,
        paddingBottom: 5,
    },
    resumenGrid: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: BLUE,
        borderTopStyle: 'dashed',
    },
    resumenCell: {
        flex: 1,
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: BLUE,
        borderRightStyle: 'dashed',
    },
    resumenCellLast: {
        flex: 1,
        padding: 8,
    },
    resumenCellHighlight: {
        flex: 1,
        padding: 8,
        backgroundColor: BLUE,
    },
    resumenLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 6.5,
        color: C.slate500,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 3,
    },
    resumenLabelLight: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 6.5,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 3,
    },
    resumenValue: {
        fontFamily: 'Times-Bold',
        fontSize: 13,
        color: C.slate900,
    },
    resumenValueSm: {
        fontFamily: 'Times-Bold',
        fontSize: 10,
        color: C.slate900,
    },
    resumenValueSmLine: {
        fontSize: 9,
        color: C.slate700,
        marginTop: 1,
    },
    resumenValueWhite: {
        fontFamily: 'Times-Bold',
        fontSize: 18,
        color: '#ffffff',
        lineHeight: 1,
    },

    // Tables
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BLUE_LIGHT_BG,
    },
    tableHeaderAlt: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tableRowAlt: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    tableFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderTopColor: C.slate300,
        backgroundColor: '#f1f5f9',
    },
    th: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        color: BLUE,
        padding: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    thAlt: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        color: C.slate700,
        padding: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    td: {
        fontSize: 8.5,
        color: C.slate700,
        padding: 5,
        lineHeight: 1.4,
    },
    tdBold: {
        fontFamily: 'Times-Bold',
        fontSize: 8.5,
        color: C.slate900,
        padding: 5,
    },
    tdBlue: {
        fontFamily: 'Times-Bold',
        fontSize: 8.5,
        color: BLUE,
        padding: 5,
    },
    tableWrapper: {
        borderWidth: 0.5,
        borderColor: C.slate200,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 12,
    },

    // Advertencias
    advertenciasBox: {
        borderWidth: 1,
        borderColor: C.slate400,
        borderStyle: 'dashed',
        borderRadius: 4,
        padding: 8,
        marginBottom: 12,
    },
    advertenciasTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        color: C.slate700,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 5,
    },
    advertenciaRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    advertenciaNum: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: C.slate400,
        width: 12,
    },
    advertenciaText: {
        fontSize: 8,
        color: C.slate700,
        flex: 1,
        lineHeight: 1.5,
    },
});

export default function InteresesPDF({ resultado }: InteresesPDFProps) {
    const {
        capital,
        tipo,
        fechaInicio,
        fechaPago,
        diasTotal,
        tasaPromedioPonderada,
        totalIntereses,
        segmentos,
        meses,
    } = resultado;
    const tipoLabel = tipo === 'corriente' ? 'Interés Corriente' : 'Interés Moratorio';

    return (
        <Document language="es-CO">
            <Page
                size="A4"
                style={{
                    fontFamily: 'Times-Roman',
                    fontSize: 10,
                    color: C.slate800,
                    paddingTop: 90,
                    paddingBottom: 65,
                    paddingHorizontal: 55,
                    lineHeight: 1.6,
                    backgroundColor: '#ffffff',
                }}
            >
                <PDFWatermark />
                <PDFFooter />
                <PDFHeader
                    title="LIQUIDADOR"
                    subtitle="Superfinanciera Colombia"
                />

                {/* Resumen */}
                <View style={s.resumenBox}>
                    <Text style={s.resumenTitle}>Resumen de la Liquidación</Text>
                    <View style={s.resumenGrid}>
                        <View style={s.resumenCell}>
                            <Text style={s.resumenLabel}>Capital</Text>
                            <Text style={s.resumenValue}>{formatCOP(capital)}</Text>
                        </View>
                        <View style={s.resumenCell}>
                            <Text style={s.resumenLabel}>Tipo</Text>
                            <Text style={s.resumenValueSm}>{tipoLabel}</Text>
                        </View>
                        <View style={s.resumenCellLast}>
                            <Text style={s.resumenLabel}>Período</Text>
                            <Text style={s.resumenValueSm}>{formatDateLabel(fechaInicio)}</Text>
                            <Text style={s.resumenValueSmLine}>al {formatDateLabel(fechaPago)}</Text>
                        </View>
                    </View>
                    <View style={s.resumenGrid}>
                        <View style={s.resumenCell}>
                            <Text style={s.resumenLabel}>Días totales</Text>
                            <Text style={s.resumenValue}>{diasTotal}</Text>
                        </View>
                        <View style={s.resumenCell}>
                            <Text style={s.resumenLabel}>Tasa prom. ponderada</Text>
                            <Text style={s.resumenValue}>{formatPct(tasaPromedioPonderada, 2)} EA</Text>
                        </View>
                        <View style={s.resumenCellHighlight}>
                            <Text style={s.resumenLabelLight}>Total intereses</Text>
                            <Text style={s.resumenValueWhite}>{formatCOP(totalIntereses)}</Text>
                        </View>
                    </View>
                </View>

                {/* Detalle por período */}
                <Text style={s.sectionLabel}>Detalle por período de tasa</Text>
                <View style={s.tableWrapper}>
                    <View
                        wrap={false}
                        style={s.tableHeader}
                    >
                        <Text style={[s.th, { flex: 3 }]}>Período</Text>
                        <Text style={[s.th, { flex: 0.6, textAlign: 'right' }]}>Días</Text>
                        <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>TEA corriente</Text>
                        <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>TEA aplicada</Text>
                        <Text style={[s.th, { flex: 1.5, textAlign: 'right' }]}>Interés causado</Text>
                    </View>
                    {segmentos.map((seg, i) => (
                        <View
                            key={i}
                            wrap={false}
                            style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}
                        >
                            <Text style={[s.td, { flex: 3 }]}>{seg.periodoLabel}</Text>
                            <Text style={[s.td, { flex: 0.6, textAlign: 'right' }]}>{seg.dias}</Text>
                            <Text style={[s.td, { flex: 1, textAlign: 'right' }]}>
                                {formatPct(seg.teaCorriente, 2)}
                            </Text>
                            <Text style={[s.td, { flex: 1, textAlign: 'right' }]}>{formatPct(seg.teaAplicada, 2)}</Text>
                            <Text style={[s.tdBold, { flex: 1.5, textAlign: 'right' }]}>
                                {formatCOP(seg.interesCausado)}
                            </Text>
                        </View>
                    ))}
                    <View
                        wrap={false}
                        style={s.tableFooter}
                    >
                        <Text style={[s.tdBold, { flex: 6.1 }]}>Total</Text>
                        <Text style={[s.tdBlue, { flex: 1.5, textAlign: 'right' }]}>{formatCOP(totalIntereses)}</Text>
                    </View>
                </View>

                {/* Detalle mensual */}
                <Text style={s.sectionLabel}>Detalle mensual</Text>
                <View style={s.tableWrapper}>
                    <View
                        wrap={false}
                        style={s.tableHeaderAlt}
                    >
                        <Text style={[s.thAlt, { flex: 2 }]}>Mes</Text>
                        <Text style={[s.thAlt, { flex: 0.6, textAlign: 'right' }]}>Días</Text>
                        <Text style={[s.thAlt, { flex: 1.2, textAlign: 'right' }]}>Tasa diaria prom.</Text>
                        <Text style={[s.thAlt, { flex: 1.5, textAlign: 'right' }]}>Interés del mes</Text>
                        <Text style={[s.thAlt, { flex: 1.5, textAlign: 'right' }]}>Acumulado</Text>
                    </View>
                    {meses.map((m, i) => (
                        <View
                            key={i}
                            wrap={false}
                            style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}
                        >
                            <Text style={[s.td, { flex: 2, textTransform: 'capitalize' }]}>{m.mes}</Text>
                            <Text style={[s.td, { flex: 0.6, textAlign: 'right' }]}>{m.dias}</Text>
                            <Text style={[s.td, { flex: 1.2, textAlign: 'right' }]}>
                                {(m.tasaDiariaPromedio * 100).toFixed(6)}%
                            </Text>
                            <Text style={[s.td, { flex: 1.5, textAlign: 'right' }]}>{formatCOP(m.interesMes)}</Text>
                            <Text style={[s.tdBold, { flex: 1.5, textAlign: 'right' }]}>{formatCOP(m.acumulado)}</Text>
                        </View>
                    ))}
                </View>

                {/* Advertencias */}
                <View style={s.advertenciasBox}>
                    <Text style={s.advertenciasTitle}>Advertencias legales</Text>
                    {ADVERTENCIAS.map((a, i) => (
                        <View
                            key={i}
                            style={s.advertenciaRow}
                        >
                            <Text style={s.advertenciaNum}>{i + 1}.</Text>
                            <Text style={s.advertenciaText}>{a}</Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
}
