import type { ReactNode } from 'react';
import { Text, View, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import type { PlanTier } from '../types';

// ── Color palette ─────────────────────────────────────────────────────────────

export const C = {
    slate900: '#0f172a',
    slate800: '#1e293b',
    slate700: '#334155',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate300: '#cbd5e1',
    slate200: '#e2e8f0',
    slate50: '#f8fafc',
    navy: '#112F4F',
};

// ── Extended ordinals (up to 23) ──────────────────────────────────────────────

export const ORDINALS = [
    '',
    'PRIMERA',
    'SEGUNDA',
    'TERCERA',
    'CUARTA',
    'QUINTA',
    'SEXTA',
    'SÉPTIMA',
    'OCTAVA',
    'NOVENA',
    'DÉCIMA',
    'DÉCIMA PRIMERA',
    'DÉCIMA SEGUNDA',
    'DÉCIMA TERCERA',
    'DÉCIMA CUARTA',
    'DÉCIMA QUINTA',
    'DÉCIMA SEXTA',
    'DÉCIMA SÉPTIMA',
    'DÉCIMA OCTAVA',
    'DÉCIMA NOVENA',
    'VIGÉSIMA',
    'VIGÉSIMA PRIMERA',
    'VIGÉSIMA SEGUNDA',
    'VIGÉSIMA TERCERA',
];

export function ord(n: number): string {
    return ORDINALS[n] ?? String(n);
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
    fixedHeader: {
        position: 'absolute',
        top: 15,
        left: 55,
        right: 55,
    },
    fixedHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    fixedDivider: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#112F4F',
    },
    lexiaText: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        color: '#112F4F',
        letterSpacing: 2.5,
    },
    logo: {
        height: 30,
        maxWidth: 130,
        objectFit: 'contain',
    },
    contractHeaderTitle: {
        fontFamily: 'Times-Bold',
        fontSize: 20,
        color: '#112F4F',
        letterSpacing: 2,
        lineHeight: 1,
        textAlign: 'right',
    },
    contractHeaderSubtitle: {
        fontSize: 7.5,
        color: '#64748b',
        textAlign: 'right',
        marginTop: 2,
    },
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
    pageFooter: {
        position: 'absolute',
        bottom: 16,
        left: 55,
        right: 55,
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

// ── Lexia logo icon (react-pdf SVG) ──────────────────────────────────────────

export function LexiaLogoPDF({ size = 24 }: { size?: number }) {
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

// ── PDFHeader ─────────────────────────────────────────────────────────────────

interface PDFHeaderProps {
    plan: PlanTier;
    logoUrl?: string;
    title: string;
    subtitle: string;
}

export function PDFHeader({ title, subtitle }: PDFHeaderProps) {
    return (
        <View
            fixed
            style={ss.fixedHeader}
        >
            <View style={ss.fixedHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <LexiaLogoPDF size={26} />
                    <View style={{ width: 1, height: 26, backgroundColor: '#e2e8f0' }} />
                    <Text style={ss.lexiaText}>LEXIA</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={ss.contractHeaderTitle}>{title}</Text>
                    <Text style={ss.contractHeaderSubtitle}>{subtitle}</Text>
                </View>
            </View>
            <View style={ss.fixedDivider} />
        </View>
    );
}

// ── PDFFooter ─────────────────────────────────────────────────────────────────

export function PDFFooter() {
    return (
        <View
            fixed
            style={ss.pageFooter}
        >
            <View style={ss.pageFooterDivider} />
            <View style={ss.pageFooterRow}>
                <Text style={ss.pageFooterBrand}>
                    Generado por <Text style={ss.pageFooterBrandBold}>Lexia.co</Text>
                </Text>
                <Text style={ss.pageFooterCta}>
                    ¿Dudas sobre este documento? <Text style={ss.pageFooterCtaBold}>Agenda una asesoría legal</Text>
                    {' en '}
                    <Text style={ss.pageFooterCtaBold}>lexia.co</Text>
                </Text>
            </View>
        </View>
    );
}

// ── PDFWatermark ──────────────────────────────────────────────────────────────

export function PDFWatermark({ plan }: { plan: PlanTier }) {
    if (plan !== 'free') return null;
    return (
        <View
            fixed
            style={ss.watermark}
        >
            <Text style={ss.watermarkText}>LEXIA</Text>
        </View>
    );
}

// ── Shared document colors ────────────────────────────────────────────────────

export const BLUE = '#1b3070';
export const BLUE_LIGHT_BG = '#EBF4FF';

// ── Shared page stylesheet ────────────────────────────────────────────────────

export const pdfStyles = StyleSheet.create({
    page: {
        fontFamily: 'Times-Roman',
        fontSize: 10,
        color: C.slate800,
        paddingTop: 90,
        paddingBottom: 65,
        paddingHorizontal: 55,
        lineHeight: 1.6,
        backgroundColor: '#ffffff',
    },

    // ── Info box ──
    infoBox: {
        borderWidth: 1.5,
        borderColor: BLUE,
        borderRadius: 4,
        marginBottom: 10,
        flexDirection: 'row',
    },
    infoLeft: {
        flex: 3,
        padding: 10,
        borderRightWidth: 1,
        borderRightColor: BLUE,
        borderRightStyle: 'dashed',
    },
    infoRight: {
        flex: 2,
        padding: 10,
    },
    infoSectionLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        color: C.slate700,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 4,
    },
    infoCanonValue: {
        fontFamily: 'Times-Bold',
        fontSize: 20,
        color: C.slate900,
        lineHeight: 1.1,
        marginBottom: 3,
    },
    infoCanonWords: {
        fontSize: 8,
        color: C.slate700,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        borderTopWidth: 0.5,
        borderTopColor: C.slate300,
        borderTopStyle: 'dashed',
        paddingTop: 4,
        marginTop: 2,
    },
    infoCityValue: {
        fontFamily: 'Times-Bold',
        fontSize: 10,
        color: C.slate900,
        marginBottom: 2,
    },

    // ── Parties box ──
    partiesBox: {
        backgroundColor: BLUE_LIGHT_BG,
        borderWidth: 1,
        borderColor: BLUE,
        borderRadius: 4,
        flexDirection: 'row',
        marginBottom: 10,
    },
    partyCol: {
        flex: 1,
        padding: 10,
    },
    partyColLeft: {
        borderRightWidth: 1,
        borderRightColor: BLUE,
        borderRightStyle: 'dashed',
    },
    partyColHeader: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7.5,
        color: BLUE,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 5,
        paddingBottom: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: BLUE,
    },
    partyName: {
        fontFamily: 'Times-Bold',
        fontSize: 9.5,
        color: C.slate900,
        marginBottom: 2,
    },
    partyLine: {
        fontSize: 9,
        color: C.slate800,
        lineHeight: 1.5,
    },
    partyLineLabel: {
        fontFamily: 'Helvetica-Bold',
    },

    // ── Intro paragraph ──
    introPara: {
        fontSize: 10,
        color: C.slate800,
        lineHeight: 1.65,
        textAlign: 'justify',
        marginBottom: 10,
    },

    // ── Payment conditions box ──
    conditionsBox: {
        borderWidth: 1,
        borderColor: C.slate500,
        borderStyle: 'dashed',
        borderRadius: 4,
        padding: 10,
        marginBottom: 12,
    },
    conditionsTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7.5,
        color: C.slate700,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    conditionRow: {
        flexDirection: 'row',
        fontSize: 9.5,
        color: C.slate800,
        lineHeight: 1.55,
        marginBottom: 2,
    },
    conditionLabel: {
        fontFamily: 'Times-Bold',
        marginRight: 3,
    },

    // ── Clauses ──
    clausesSectionLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: C.slate700,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: C.slate300,
        paddingBottom: 4,
    },
    clauseWrap: {
        marginBottom: 8,
    },
    clauseText: {
        fontSize: 10,
        color: C.slate800,
        lineHeight: 1.65,
        textAlign: 'justify',
    },
    bold: {
        fontFamily: 'Times-Bold',
    },
    clauseTitleInline: {
        fontFamily: 'Times-Bold',
    },
    paragrafo: {
        marginTop: 5,
        paddingLeft: 10,
        borderLeftWidth: 1.5,
        borderLeftColor: C.slate300,
    },
    paragrafoText: {
        fontSize: 9.5,
        color: C.slate700,
        lineHeight: 1.6,
        textAlign: 'justify',
    },
    paragrafoLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: C.slate500,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginBottom: 1,
    },

    // ── Closing statement ──
    closingText: {
        fontSize: 10,
        color: C.slate800,
        lineHeight: 1.65,
        textAlign: 'justify',
        marginTop: 10,
        marginBottom: 16,
    },

    // ── Signatures ──
    signaturesWrap: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 52,
    },
    signaturesWrapBottom: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 40,
    },
    sigCol: {
        flex: 1,
    },
    sigLine: {
        borderTopWidth: 1.5,
        borderTopColor: C.slate400,
        paddingTop: 6,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    sigTextArea: {
        flex: 1,
    },
    sigName: {
        fontFamily: 'Times-Bold',
        fontSize: 10,
        color: C.slate900,
        marginBottom: 1,
    },
    sigRole: {
        fontSize: 9,
        color: C.slate700,
    },
    fingerprintBox: {
        borderWidth: 1,
        borderColor: C.slate400,
        borderRadius: 2,
        width: 56,
        height: 66,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 4,
        alignSelf: 'flex-start',
    },
    fingerprintLabel: {
        fontSize: 7,
        color: C.slate400,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

// ── Shared helpers ────────────────────────────────────────────────────────────

export function B({ children }: { children: ReactNode }) {
    return <Text style={pdfStyles.bold}>{children}</Text>;
}

export function Para({ label, children }: { label: string; children: ReactNode }) {
    return (
        <View style={pdfStyles.paragrafo}>
            <Text style={pdfStyles.paragrafoLabel}>{label}</Text>
            <Text style={pdfStyles.paragrafoText}>{children}</Text>
        </View>
    );
}

export function Clause({ number, title, children }: { number: string; title?: string; children: ReactNode }) {
    const prefix = title ? `${number}. – ${title}: ` : `${number}. – `;
    return (
        <View style={pdfStyles.clauseWrap}>
            <Text style={pdfStyles.clauseText}>
                <Text style={pdfStyles.clauseTitleInline}>{prefix}</Text>
                {children}
            </Text>
        </View>
    );
}

export function Fingerprint() {
    return (
        <View style={pdfStyles.fingerprintBox}>
            <Text style={pdfStyles.fingerprintLabel}>Huella</Text>
        </View>
    );
}

export function SigBlock({ name, role }: { name: string; role: string }) {
    return (
        <View style={pdfStyles.sigLine}>
            <View style={pdfStyles.sigTextArea}>
                <Text style={pdfStyles.sigName}>{name}</Text>
                <Text style={pdfStyles.sigRole}>{role}</Text>
            </View>
            <Fingerprint />
        </View>
    );
}
