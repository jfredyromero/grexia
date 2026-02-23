import type { ReactNode } from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { ArrendamientoFormData, PlanTier } from './types';
import { isComercial } from './types';
import { formatCOP, formatDate, numberToWordsCOP } from './contractUtils';

// ── Color palette ─────────────────────────────────────────────────────────────

const C = {
    slate900: '#0f172a',
    slate800: '#1e293b',
    slate700: '#334155',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate300: '#cbd5e1',
    slate200: '#e2e8f0',
    slate50: '#f8fafc',
};

// ── Stylesheet ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    page: {
        fontFamily: 'Times-Roman',
        fontSize: 10,
        color: C.slate800,
        paddingTop: 55,
        paddingBottom: 65,
        paddingHorizontal: 55,
        lineHeight: 1.6,
        backgroundColor: '#ffffff',
    },

    // Logo
    logoWrap: {
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: C.slate200,
    },
    logo: {
        height: 30,
        maxWidth: 130,
        objectFit: 'contain',
    },

    // Title block
    title: {
        fontFamily: 'Times-Bold',
        fontSize: 13,
        textAlign: 'center',
        color: C.slate900,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 3,
    },
    regimen: {
        fontSize: 9,
        textAlign: 'center',
        color: C.slate500,
        marginBottom: 2,
    },
    cityDate: {
        fontSize: 10,
        textAlign: 'center',
        color: C.slate500,
        marginBottom: 22,
    },

    // Parties box
    partiesBox: {
        backgroundColor: C.slate50,
        borderWidth: 1,
        borderColor: C.slate200,
        borderRadius: 8,
        padding: 14,
        marginBottom: 18,
    },
    partiesLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: C.slate700,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    partiesRow: {
        flexDirection: 'row',
        gap: 14,
    },
    partyCol: {
        flex: 1,
    },
    partyHeader: {
        fontFamily: 'Times-Bold',
        fontSize: 10,
        color: C.slate700,
        marginBottom: 3,
    },
    partyLine: {
        fontSize: 9.5,
        color: C.slate800,
        lineHeight: 1.5,
    },

    // Clauses
    clauseWrap: {
        marginBottom: 12,
    },
    clauseTitle: {
        fontFamily: 'Times-Bold',
        fontSize: 10,
        color: C.slate900,
        marginBottom: 3,
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

    // Ordered list
    listWrap: {
        marginTop: 3,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    listNum: {
        width: 16,
        fontSize: 10,
        color: C.slate800,
    },
    listText: {
        flex: 1,
        fontSize: 10,
        color: C.slate800,
        lineHeight: 1.5,
    },

    // Signature block
    signaturesWrap: {
        flexDirection: 'row',
        marginTop: 40,
        gap: 40,
    },
    sigCol: {
        flex: 1,
    },
    sigLine: {
        borderTopWidth: 1.5,
        borderTopColor: C.slate400,
        paddingTop: 8,
    },
    sigLabel: {
        fontFamily: 'Times-Bold',
        fontSize: 10,
        color: C.slate900,
        marginBottom: 3,
    },
    sigText: {
        fontSize: 9.5,
        color: C.slate800,
        lineHeight: 1.5,
    },

    // Disclaimer (free plan, bottom of document)
    disclaimer: {
        marginTop: 28,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: C.slate200,
    },
    disclaimerText: {
        fontSize: 8,
        color: C.slate400,
        textAlign: 'center',
        lineHeight: 1.5,
    },

    // Fixed watermark footer (all pages, free plan)
    watermark: {
        position: 'absolute',
        bottom: 16,
        left: 55,
        right: 55,
        fontSize: 7.5,
        color: C.slate300,
        textAlign: 'center',
    },
});

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Inline bold span within a Text paragraph */
function B({ children }: { children: string }) {
    return <Text style={s.bold}>{children}</Text>;
}

function Clause({ number, title, children }: { number: string; title: string; children: ReactNode }) {
    return (
        <View style={s.clauseWrap}>
            <Text style={s.clauseTitle}>
                {number}. {title.toUpperCase()}
            </Text>
            {children}
        </View>
    );
}

function OrderedList({ items }: { items: string[] }) {
    return (
        <View style={s.listWrap}>
            {items.map((text, i) => (
                <View
                    key={i}
                    style={s.listItem}
                >
                    <Text style={s.listNum}>{i + 1}.</Text>
                    <Text style={s.listText}>{text}</Text>
                </View>
            ))}
        </View>
    );
}

const ORDINALS = [
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
];

function ord(n: number): string {
    return ORDINALS[n] ?? String(n);
}

// ── VIVIENDA clauses (Ley 820 de 2003) ───────────────────────────────────────

function ClausesVivienda({ formData }: { formData: ArrendamientoFormData }) {
    const { inmueble, condiciones } = formData;
    const canonNum = parseInt(condiciones.canonMensual.replace(/\D/g, ''), 10) || 0;
    const depositoNum = parseInt(condiciones.depositoCOP.replace(/\D/g, ''), 10) || 0;
    const depositoMeses = canonNum > 0 ? Math.round(depositoNum / canonNum) : 1;
    const fechaStr = formatDate(condiciones.fechaInicio);
    const [year, , day] = condiciones.fechaInicio ? condiciones.fechaInicio.split('-') : ['____', '__', '__'];
    const tipoLabel = inmueble.tipoInmueble || 'INMUEBLE';
    const ciudadStr = inmueble.ciudad || '___________________';
    const phLabel = inmueble.propiedadHorizontal ? ' sometido al régimen de propiedad horizontal' : '';
    const ph = inmueble.propiedadHorizontal;
    const off = ph ? 1 : 0;
    const base = 7;
    const monthName = condiciones.fechaInicio
        ? new Date(condiciones.fechaInicio + 'T12:00:00').toLocaleString('es-CO', { month: 'long' })
        : '___________';

    return (
        <>
            <Clause
                number="PRIMERA"
                title="Objeto del contrato"
            >
                <Text style={s.clauseText}>
                    El ARRENDADOR entrega al ARRENDATARIO, a título de arrendamiento, el inmueble tipo{' '}
                    <B>{tipoLabel}</B>
                    {phLabel}, ubicado en <B>{inmueble.direccion || '___________________'}</B>, ciudad de{' '}
                    <B>{ciudadStr}</B>, departamento de <B>{inmueble.departamento || '___________________'}</B>
                    {inmueble.areaMq ? `, con un área aproximada de ${inmueble.areaMq} m²` : ''}, estrato{' '}
                    <B>{inmueble.estrato || '___'}</B>. El destino del inmueble será exclusivamente{' '}
                    <B>vivienda urbana</B>, conforme a lo dispuesto en la Ley 820 de 2003.
                </Text>
            </Clause>

            <Clause
                number="SEGUNDA"
                title="Canon de arrendamiento"
            >
                <Text style={s.clauseText}>
                    El canon mensual de arrendamiento es de{' '}
                    <B>{`${numberToWordsCOP(canonNum)} (${formatCOP(condiciones.canonMensual)} COP)`}</B>. El
                    ARRENDATARIO se obliga a pagarlo a más tardar el día <B>{String(condiciones.diaPagoMes)}</B> de cada
                    mes. El canon podrá ser reajustado anualmente conforme al IPC certificado por el DANE, en los
                    términos del artículo 20 de la Ley 820 de 2003.
                </Text>
            </Clause>

            <Clause
                number="TERCERA"
                title="Forma y lugar de pago"
            >
                <Text style={s.clauseText}>
                    El canon se pagará por mensualidades anticipadas, a más tardar el día{' '}
                    <B>{String(condiciones.diaPagoMes)}</B> de cada mes calendario. El incumplimiento en el pago
                    constituye causal de terminación del contrato, conforme al artículo 22, numeral 1, de la Ley 820 de
                    2003.
                </Text>
            </Clause>

            <Clause
                number="CUARTA"
                title="Duración y renovación"
            >
                <Text style={s.clauseText}>
                    El contrato tendrá una duración de <B>{`${String(condiciones.duracionMeses)} meses`}</B>, contados a
                    partir del <B>{fechaStr}</B>. A su vencimiento, se entenderá prorrogado en iguales condiciones y por
                    el mismo término, en los términos del artículo 6 de la Ley 820 de 2003.
                </Text>
            </Clause>

            <Clause
                number="QUINTA"
                title="Depósito de garantía"
            >
                <Text style={s.clauseText}>
                    El ARRENDATARIO entrega en calidad de depósito de garantía la suma de{' '}
                    <B>{`${numberToWordsCOP(depositoNum)} (${formatCOP(condiciones.depositoCOP)} COP)`}</B>, equivalente
                    a <B>{String(depositoMeses)}</B> mes(es) de canon. Dicha suma será devuelta al término del contrato,
                    descontando los valores adeudados conforme a la ley. El depósito no podrá exceder el valor de dos
                    (2) meses de canon, según el artículo 16 de la Ley 820 de 2003.
                </Text>
            </Clause>

            <Clause
                number="SEXTA"
                title="Servicios públicos"
            >
                <Text style={s.clauseText}>
                    Los servicios públicos domiciliarios (agua, energía eléctrica, gas natural, teléfono e internet)
                    corren por cuenta del ARRENDATARIO, salvo pacto en contrario debidamente consignado por escrito.
                </Text>
            </Clause>

            {ph && (
                <Clause
                    number="SÉPTIMA"
                    title="Propiedad Horizontal y Reglamento"
                >
                    <Text style={s.clauseText}>
                        El inmueble hace parte de un conjunto o edificio sometido al régimen de propiedad horizontal. El
                        ARRENDATARIO se obliga a conocer y cumplir el reglamento de propiedad horizontal vigente, así
                        como las decisiones de la asamblea de copropietarios y del administrador. Las cuotas de
                        administración y demás expensas comunes ordinarias corren por cuenta del ARRENDATARIO, salvo
                        pacto en contrario.
                    </Text>
                </Clause>
            )}

            <Clause
                number={ord(base + off)}
                title="Obligaciones del arrendador"
            >
                <OrderedList
                    items={[
                        'Entregar el inmueble en buen estado de servicio, seguridad y sanidad.',
                        'Mantener el inmueble en estado de servir para el fin convenido.',
                        'Garantizar el goce pacífico del inmueble al ARRENDATARIO.',
                        'No realizar obras o mejoras que perturben el uso del inmueble sin previo aviso.',
                    ]}
                />
            </Clause>

            <Clause
                number={ord(base + off + 1)}
                title="Obligaciones del arrendatario"
            >
                <OrderedList
                    items={[
                        'Pagar el canon de arrendamiento en las fechas y forma pactadas.',
                        'Conservar el inmueble en buen estado y restituirlo en las mismas condiciones.',
                        'No subarrendar ni ceder el contrato sin autorización escrita del ARRENDADOR.',
                        'No realizar reformas o modificaciones sin autorización escrita del ARRENDADOR.',
                        ...(ph ? ['Cumplir el reglamento de propiedad horizontal.'] : []),
                        'Comunicar oportunamente al ARRENDADOR las novedades que afecten el inmueble.',
                    ]}
                />
            </Clause>

            <Clause
                number={ord(base + off + 2)}
                title="Causales de terminación"
            >
                <Text style={s.clauseText}>El presente contrato podrá darse por terminado por:</Text>
                <OrderedList
                    items={[
                        'Mutuo acuerdo entre las partes.',
                        'Incumplimiento de las obligaciones de cualquiera de las partes.',
                        'Mora en el pago del canon, conforme al artículo 22, numeral 1, de la Ley 820 de 2003.',
                        'Vencimiento del término pactado sin prórroga.',
                        'Las demás causales establecidas en la Ley 820 de 2003.',
                    ]}
                />
            </Clause>

            <Clause
                number={ord(base + off + 3)}
                title="Preaviso de terminación"
            >
                <Text style={s.clauseText}>
                    Cualquiera de las partes que desee dar por terminado el contrato al vencimiento del término deberá
                    notificar a la otra con un mínimo de <B>tres (3) meses</B> de anticipación, conforme al artículo 22
                    de la Ley 820 de 2003.
                </Text>
            </Clause>

            <Clause
                number={ord(base + off + 4)}
                title="Resolución de conflictos"
            >
                <Text style={s.clauseText}>
                    Las controversias que surjan del presente contrato se resolverán, en primera instancia, mediante
                    conciliación ante un Centro de Conciliación autorizado por el Ministerio de Justicia y del Derecho.
                    De no llegarse a acuerdo, las partes acudirán a la vía judicial ordinaria.
                </Text>
            </Clause>

            <Clause
                number={ord(base + off + 5)}
                title="Norma aplicable"
            >
                <Text style={s.clauseText}>
                    El presente contrato se regirá por la Ley 820 de 2003, el Código Civil colombiano y demás
                    disposiciones aplicables vigentes.
                </Text>
            </Clause>

            <Clause
                number={ord(base + off + 6)}
                title="Aceptación"
            >
                <Text style={s.clauseText}>
                    Las partes declaran haber leído íntegramente el presente contrato, encontrarlo conforme a sus
                    intereses y firmarlo en señal de aceptación, en la ciudad de <B>{ciudadStr}</B>, a los{' '}
                    <B>{String(parseInt(day, 10))}</B> días del mes de <B>{monthName}</B> de <B>{year}</B>.
                </Text>
            </Clause>
        </>
    );
}

// ── COMERCIAL clauses (Código de Comercio) ────────────────────────────────────

function ClausesComercial({ formData }: { formData: ArrendamientoFormData }) {
    const { inmueble, condiciones } = formData;
    const canonNum = parseInt(condiciones.canonMensual.replace(/\D/g, ''), 10) || 0;
    const depositoNum = parseInt(condiciones.depositoCOP.replace(/\D/g, ''), 10) || 0;
    const fechaStr = formatDate(condiciones.fechaInicio);
    const [year, , day] = condiciones.fechaInicio ? condiciones.fechaInicio.split('-') : ['____', '__', '__'];
    const tipoLabel = inmueble.tipoInmueble || 'INMUEBLE';
    const ciudadStr = inmueble.ciudad || '___________________';
    const esLocal = inmueble.tipoInmueble === 'Local Comercial';
    const phLabel = inmueble.propiedadHorizontal ? ' sometido al régimen de propiedad horizontal' : '';
    const ph = inmueble.propiedadHorizontal;
    const off = ph ? 1 : 0;
    const base = 8;
    const monthName = condiciones.fechaInicio
        ? new Date(condiciones.fechaInicio + 'T12:00:00').toLocaleString('es-CO', { month: 'long' })
        : '___________';

    return (
        <>
            <Clause
                number="PRIMERA"
                title="Objeto del contrato"
            >
                <Text style={s.clauseText}>
                    El ARRENDADOR entrega al ARRENDATARIO, a título de arrendamiento, el inmueble tipo{' '}
                    <B>{tipoLabel}</B>
                    {phLabel}, ubicado en <B>{inmueble.direccion || '___________________'}</B>, ciudad de{' '}
                    <B>{ciudadStr}</B>, departamento de <B>{inmueble.departamento || '___________________'}</B>
                    {inmueble.areaMq ? `, con un área aproximada de ${inmueble.areaMq} m²` : ''}, estrato{' '}
                    <B>{inmueble.estrato || '___'}</B>.
                </Text>
            </Clause>

            {esLocal ? (
                <Clause
                    number="SEGUNDA"
                    title="Actividad comercial autorizada"
                >
                    <Text style={s.clauseText}>
                        El ARRENDATARIO destinará el inmueble exclusivamente al desarrollo de la siguiente actividad
                        comercial: <B>{condiciones.actividadComercial || '___________________'}</B>. Queda expresamente
                        prohibido el cambio de actividad sin autorización previa y escrita del ARRENDADOR. El
                        ARRENDATARIO será responsable de obtener las licencias, permisos y registros que la ley exija
                        para el ejercicio de dicha actividad.
                    </Text>
                </Clause>
            ) : (
                <Clause
                    number="SEGUNDA"
                    title="Destinación del inmueble"
                >
                    <Text style={s.clauseText}>
                        El ARRENDATARIO destinará el inmueble exclusivamente para uso de <B>oficina</B>. Queda
                        expresamente prohibido el uso residencial o el desarrollo de actividades distintas sin
                        autorización previa y escrita del ARRENDADOR.
                    </Text>
                </Clause>
            )}

            <Clause
                number="TERCERA"
                title="Canon de arrendamiento"
            >
                <Text style={s.clauseText}>
                    El canon mensual de arrendamiento es de{' '}
                    <B>{`${numberToWordsCOP(canonNum)} (${formatCOP(condiciones.canonMensual)} COP)`}</B>. El
                    ARRENDATARIO se obliga a pagarlo a más tardar el día <B>{String(condiciones.diaPagoMes)}</B> de cada
                    mes. Las partes podrán acordar libremente el reajuste anual del canon, sin que aplique el límite del
                    IPC previsto en la Ley 820 de 2003, por tratarse de un arrendamiento comercial regido por el Código
                    de Comercio.
                </Text>
            </Clause>

            <Clause
                number="CUARTA"
                title="Forma y lugar de pago"
            >
                <Text style={s.clauseText}>
                    El canon se pagará por mensualidades anticipadas, a más tardar el día{' '}
                    <B>{String(condiciones.diaPagoMes)}</B> de cada mes calendario. El incumplimiento en el pago durante
                    dos (2) periodos consecutivos constituirá causal de terminación unilateral del contrato por parte
                    del ARRENDADOR.
                </Text>
            </Clause>

            <Clause
                number="QUINTA"
                title="Duración del contrato"
            >
                <Text style={s.clauseText}>
                    El contrato tendrá una duración de <B>{`${String(condiciones.duracionMeses)} meses`}</B>, contados a
                    partir del <B>{fechaStr}</B>. Vencido el término, el contrato podrá prorrogarse por acuerdo escrito
                    entre las partes.
                </Text>
            </Clause>

            <Clause
                number="SEXTA"
                title="Depósito de garantía"
            >
                <Text style={s.clauseText}>
                    El ARRENDATARIO entrega en calidad de depósito de garantía la suma de{' '}
                    <B>{`${numberToWordsCOP(depositoNum)} (${formatCOP(condiciones.depositoCOP)} COP)`}</B>. Dicha suma
                    será devuelta al término del contrato, descontando los valores adeudados, perjuicios causados al
                    inmueble y demás obligaciones pendientes del ARRENDATARIO.
                </Text>
            </Clause>

            <Clause
                number="SÉPTIMA"
                title="Servicios públicos y administración"
            >
                <Text style={s.clauseText}>
                    Los servicios públicos (agua, energía eléctrica, gas, teléfono e internet) y las cuotas de
                    administración, si aplican, corren por cuenta del ARRENDATARIO, salvo pacto en contrario. El
                    ARRENDATARIO no podrá interrumpir el pago de los servicios durante la vigencia del contrato.
                </Text>
            </Clause>

            {ph && (
                <Clause
                    number="OCTAVA"
                    title="Propiedad Horizontal y Reglamento"
                >
                    <Text style={s.clauseText}>
                        El inmueble hace parte de un edificio o centro comercial sometido al régimen de propiedad
                        horizontal. El ARRENDATARIO se obliga a conocer y cumplir el reglamento de propiedad horizontal
                        vigente y las decisiones de la administración. Las cuotas de administración y expensas comunes
                        ordinarias corren por cuenta del ARRENDATARIO, salvo pacto en contrario.
                    </Text>
                </Clause>
            )}

            <Clause
                number={ord(base + off)}
                title="Obligaciones del arrendador"
            >
                <OrderedList
                    items={[
                        'Entregar el inmueble en buen estado y apto para el uso pactado.',
                        'Mantener el inmueble en condiciones que permitan el uso convenido.',
                        'Garantizar el goce pacífico del inmueble al ARRENDATARIO.',
                        'Realizar las reparaciones locativas mayores que no sean imputables al ARRENDATARIO.',
                    ]}
                />
            </Clause>

            <Clause
                number={ord(base + off + 1)}
                title="Obligaciones del arrendatario"
            >
                <OrderedList
                    items={[
                        'Pagar el canon de arrendamiento en las fechas y forma pactadas.',
                        'Usar el inmueble exclusivamente para la actividad autorizada.',
                        'Conservar el inmueble en buen estado y restituirlo en las mismas condiciones.',
                        'No subarrendar ni ceder el contrato sin autorización escrita del ARRENDADOR.',
                        'No realizar adecuaciones, reformas o modificaciones al inmueble sin autorización escrita del ARRENDADOR.',
                        ...(ph ? ['Cumplir el reglamento de propiedad horizontal.'] : []),
                        'Obtener y mantener vigentes los permisos y licencias para su actividad.',
                        'Comunicar al ARRENDADOR cualquier daño o novedad que afecte el inmueble.',
                    ]}
                />
            </Clause>

            <Clause
                number={ord(base + off + 2)}
                title="Mejoras y adecuaciones"
            >
                <Text style={s.clauseText}>
                    Las mejoras útiles o de lujo que el ARRENDATARIO realice con autorización escrita del ARRENDADOR
                    quedarán en beneficio del inmueble sin derecho a indemnización, salvo pacto en contrario. Las
                    mejoras necesarias autorizadas serán abonadas al ARRENDATARIO conforme a lo pactado. El ARRENDATARIO
                    deberá restituir el inmueble en el estado en que lo recibió.
                </Text>
            </Clause>

            <Clause
                number={ord(base + off + 3)}
                title="Terminación anticipada"
            >
                <Text style={s.clauseText}>
                    Cualquiera de las partes podrá dar por terminado el contrato antes del vencimiento del término
                    pactado, con un preaviso mínimo de <B>tres (3) meses</B> mediante comunicación escrita. El
                    incumplimiento de este preaviso generará el pago de una indemnización equivalente al canon
                    correspondiente al tiempo de preaviso no cumplido.
                </Text>
            </Clause>

            <Clause
                number={ord(base + off + 4)}
                title="Causales de terminación"
            >
                <Text style={s.clauseText}>El presente contrato podrá darse por terminado por:</Text>
                <OrderedList
                    items={[
                        'Mutuo acuerdo entre las partes.',
                        'Mora en el pago de dos (2) o más cánones consecutivos.',
                        'Cambio de actividad comercial sin autorización del ARRENDADOR.',
                        'Subarrendamiento o cesión sin autorización escrita del ARRENDADOR.',
                        'Incumplimiento grave de cualquiera de las obligaciones pactadas.',
                        'Vencimiento del término pactado sin prórroga.',
                    ]}
                />
            </Clause>

            <Clause
                number={ord(base + off + 5)}
                title="Resolución de conflictos"
            >
                <Text style={s.clauseText}>
                    Las controversias que surjan del presente contrato se resolverán mediante conciliación ante un
                    Centro de Conciliación autorizado. De no llegarse a acuerdo, las partes acudirán a la jurisdicción
                    ordinaria competente en la ciudad de <B>{ciudadStr}</B>.
                </Text>
            </Clause>

            <Clause
                number={ord(base + off + 6)}
                title="Norma aplicable"
            >
                <Text style={s.clauseText}>
                    El presente contrato se regirá por el Código de Comercio colombiano, el Código Civil y demás
                    disposiciones legales vigentes aplicables a los contratos de arrendamiento comercial.
                </Text>
            </Clause>

            <Clause
                number={ord(base + off + 7)}
                title="Aceptación"
            >
                <Text style={s.clauseText}>
                    Las partes declaran haber leído íntegramente el presente contrato, encontrarlo conforme a sus
                    intereses y firmarlo en señal de aceptación, en la ciudad de <B>{ciudadStr}</B>, a los{' '}
                    <B>{String(parseInt(day, 10))}</B> días del mes de <B>{monthName}</B> de <B>{year}</B>.
                </Text>
            </Clause>
        </>
    );
}

// ── Main document component ───────────────────────────────────────────────────

interface ContractPDFProps {
    formData: ArrendamientoFormData;
    plan: PlanTier;
    logoUrl?: string;
}

export default function ContractPDF({ formData, plan, logoUrl }: ContractPDFProps) {
    const { inmueble, arrendador, arrendatario, condiciones } = formData;
    const esContratoCom = isComercial(inmueble.tipoInmueble);
    const tipoLabel = inmueble.tipoInmueble || 'INMUEBLE';
    const ciudadStr = inmueble.ciudad || '___________________';
    const fechaStr = formatDate(condiciones.fechaInicio);
    const phTag = inmueble.propiedadHorizontal ? ' en Propiedad Horizontal' : '';
    const isPaid = plan === 'basico' || plan === 'pro';

    return (
        <Document language="es-CO">
            <Page
                size="A4"
                style={s.page}
            >
                {/* ── Fixed watermark footer: one line per page on free plan ── */}
                {!isPaid && (
                    <Text
                        fixed
                        style={s.watermark}
                        render={({ pageNumber, totalPages }) =>
                            `Generado con Lexia · lexia.co — Plan Gratuito · Página ${pageNumber} de ${totalPages}`
                        }
                    />
                )}

                {/* ── Logo (paid + provided) ── */}
                {isPaid && logoUrl && (
                    <View style={s.logoWrap}>
                        <Image
                            src={logoUrl}
                            style={s.logo}
                        />
                    </View>
                )}

                {/* ── Title block ── */}
                <Text style={s.title}>
                    Contrato de Arrendamiento de {tipoLabel}
                    {phTag}
                </Text>
                <Text style={s.regimen}>
                    {esContratoCom ? 'Régimen: Código de Comercio' : 'Régimen: Ley 820 de 2003'}
                </Text>
                <Text style={s.cityDate}>
                    {ciudadStr}, {fechaStr}
                </Text>

                {/* ── Parties box ── */}
                <View style={s.partiesBox}>
                    <Text style={s.partiesLabel}>Partes del contrato</Text>
                    <View style={s.partiesRow}>
                        <View style={s.partyCol}>
                            <Text style={s.partyHeader}>Arrendador</Text>
                            <Text style={s.partyLine}>{arrendador.nombreCompleto || '___________________'}</Text>
                            <Text style={s.partyLine}>
                                {arrendador.tipoDocumento || 'Doc.'} No.{' '}
                                {arrendador.numeroDocumento || '___________________'}
                            </Text>
                            <Text style={s.partyLine}>Tel. {arrendador.telefono || '___________________'}</Text>
                            {arrendador.email ? <Text style={s.partyLine}>{arrendador.email}</Text> : null}
                        </View>
                        <View style={s.partyCol}>
                            <Text style={s.partyHeader}>Arrendatario</Text>
                            <Text style={s.partyLine}>{arrendatario.nombreCompleto || '___________________'}</Text>
                            <Text style={s.partyLine}>
                                {arrendatario.tipoDocumento || 'Doc.'} No.{' '}
                                {arrendatario.numeroDocumento || '___________________'}
                            </Text>
                            <Text style={s.partyLine}>Tel. {arrendatario.telefono || '___________________'}</Text>
                            {arrendatario.email ? <Text style={s.partyLine}>{arrendatario.email}</Text> : null}
                        </View>
                    </View>
                </View>

                {/* ── Clauses ── */}
                {esContratoCom ? <ClausesComercial formData={formData} /> : <ClausesVivienda formData={formData} />}

                {/* ── Signature block ── */}
                <View
                    style={s.signaturesWrap}
                    wrap={false}
                >
                    <View style={s.sigCol}>
                        <View style={s.sigLine}>
                            <Text style={s.sigLabel}>EL ARRENDADOR</Text>
                            <Text style={s.sigText}>{arrendador.nombreCompleto || '___________________'}</Text>
                            <Text style={s.sigText}>
                                {arrendador.tipoDocumento || 'Doc.'} No.{' '}
                                {arrendador.numeroDocumento || '___________________'}
                            </Text>
                            <Text style={s.sigText}>Tel. {arrendador.telefono || '___________________'}</Text>
                        </View>
                    </View>
                    <View style={s.sigCol}>
                        <View style={s.sigLine}>
                            <Text style={s.sigLabel}>EL ARRENDATARIO</Text>
                            <Text style={s.sigText}>{arrendatario.nombreCompleto || '___________________'}</Text>
                            <Text style={s.sigText}>
                                {arrendatario.tipoDocumento || 'Doc.'} No.{' '}
                                {arrendatario.numeroDocumento || '___________________'}
                            </Text>
                            <Text style={s.sigText}>Tel. {arrendatario.telefono || '___________________'}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Disclaimer (free plan only) ── */}
                {!isPaid && (
                    <View style={s.disclaimer}>
                        <Text style={s.disclaimerText}>Documento generado por Lexia · lexia.co</Text>
                        <Text style={s.disclaimerText}>
                            Este contrato es una referencia legal. Para mayor seguridad jurídica, consulte con un
                            abogado habilitado.
                        </Text>
                    </View>
                )}
            </Page>
        </Document>
    );
}
