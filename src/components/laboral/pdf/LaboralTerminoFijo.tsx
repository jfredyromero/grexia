import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { LaboralFormData, JornadaTrabajo } from '../types';
import { formatCOP, numberToWordsCOP, formatDuracion, formatJornada } from '../laboralUtils';
import { PDFHeader, PDFFooter, PDFWatermark, pdfStyles as s, B, SigBlock } from '../../pdf/shared';

interface Props {
    formData: LaboralFormData;
}

function docTypeLabel(tipo: string): string {
    if (tipo === 'CC') return 'cédula de ciudadanía';
    if (tipo === 'CE') return 'cédula de extranjería';
    if (tipo === 'NIT') return 'NIT';
    if (tipo === 'Pasaporte') return 'pasaporte';
    return 'documento';
}

function frecuenciaLabel(f: string): string {
    if (f === 'mensual') return 'mensual';
    if (f === 'quincenal') return 'quincenal';
    if (f === 'semanal') return 'semanal';
    return f || '___________________';
}

function metodoPagoLabel(m: string): string {
    if (m === 'efectivo') return 'efectivo';
    if (m === 'transferencia') return 'transferencia bancaria';
    return m || '___________________';
}

const BLUE = '#1b3070';
const BLUE_LIGHT_BG = '#EBF4FF';

export default function LaboralTerminoFijo({ formData }: Props) {
    const { empleador, trabajador, condicionesTerminoFijo: tf } = formData;

    const salarioNum = parseInt(tf.salario.replace(/\D/g, ''), 10) || 0;
    const salarioFormatted = tf.salario ? formatCOP(tf.salario) : '$ ___________________';
    const salarioWords = salarioNum > 0 ? numberToWordsCOP(salarioNum) : '___________________';

    const duracionStr =
        tf.duracionNumero && tf.duracionUnidad
            ? formatDuracion(tf.duracionNumero, tf.duracionUnidad)
            : '___________________';

    const jornadaStr = tf.jornada ? formatJornada(tf.jornada as JornadaTrabajo) || tf.jornada : '___________________';

    const ciudadStr = empleador.ciudad || '___________________';

    const empleadorDoc = `${docTypeLabel(empleador.tipoDocumento)} No. ${empleador.numeroDocumento || '_______________'}`;
    const trabajadorDoc = `${docTypeLabel(trabajador.tipoDocumento)} No. ${trabajador.numeroDocumento || '_______________'}`;

    return (
        <Document language="es-CO">
            <Page
                size="A4"
                style={s.page}
            >
                <PDFWatermark />
                <PDFFooter />
                <PDFHeader
                    title="CONTRATO DE TRABAJO A TÉRMINO FIJO"
                    subtitle="Cód. Sustantivo del Trabajo · Colombia"
                />

                {/* Parties box */}
                <View style={[s.partiesBox, { backgroundColor: BLUE_LIGHT_BG, borderColor: BLUE }]}>
                    <View style={[s.partyCol, s.partyColLeft]}>
                        <Text style={[s.partyColHeader, { color: BLUE, borderBottomColor: BLUE }]}>Empleador</Text>
                        <Text style={s.partyName}>{empleador.nombreCompleto || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>{empleador.tipoDocumento || 'Doc.'}: </Text>
                            {empleador.numeroDocumento || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Ciudad: </Text>
                            {empleador.ciudad || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Dirección: </Text>
                            {empleador.direccion || '___________________'}
                        </Text>
                    </View>
                    <View style={s.partyCol}>
                        <Text style={[s.partyColHeader, { color: BLUE, borderBottomColor: BLUE }]}>Trabajador</Text>
                        <Text style={s.partyName}>{trabajador.nombreCompleto || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>{trabajador.tipoDocumento || 'Doc.'}: </Text>
                            {trabajador.numeroDocumento || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Ciudad: </Text>
                            {trabajador.ciudad || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Dirección: </Text>
                            {trabajador.direccion || '___________________'}
                        </Text>
                    </View>
                </View>

                {/* Conditions box */}
                <View style={s.conditionsBox}>
                    <Text style={s.conditionsTitle}>Condiciones del Contrato</Text>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Cargo: </Text>
                        <Text>{tf.cargo || '___________________'}</Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Salario: </Text>
                        <Text>
                            {salarioWords} ({salarioFormatted})
                        </Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Duración: </Text>
                        <Text>{duracionStr}</Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Jornada: </Text>
                        <Text>{jornadaStr}</Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Frecuencia de pago: </Text>
                        <Text>{frecuenciaLabel(tf.frecuenciaPago)}</Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Método de pago: </Text>
                        <Text>
                            {metodoPagoLabel(tf.metodoPago)}
                            {tf.metodoPago === 'transferencia' && tf.cuentaBancaria
                                ? ` — Cta. ${tf.cuentaBancaria}`
                                : ''}
                        </Text>
                    </View>
                </View>

                {/* Intro */}
                <Text style={s.introPara}>
                    Entre <B>{empleador.nombreCompleto || '___________________'}</B>, mayor de edad, identificado con{' '}
                    {empleadorDoc}, quien para efectos del presente contrato se identifica como el <B>EMPLEADOR</B>; y{' '}
                    <B>{trabajador.nombreCompleto || '___________________'}</B>, mayor de edad, identificado con{' '}
                    {trabajadorDoc}, residente en la ciudad de {trabajador.ciudad || '___________________'} en{' '}
                    {trabajador.direccion || '___________________'}, quien para los efectos del presente contrato se
                    identificará como el <B>TRABAJADOR</B>, de manera libre, expresa y voluntaria suscriben contrato de
                    trabajo a término fijo bajo las siguientes condiciones, cláusulas y artículos:
                </Text>

                {/* Artículo 1 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Artículo 1. Naturaleza y Objeto: </Text>A través del presente
                        documento se suscribe contrato de trabajo a término fijo, en vigencia del cual el EMPLEADOR
                        contrata al TRABAJADOR para que de forma personal dirija su capacidad de trabajo en aras de la
                        prestación de servicios y desempeño de las actividades propias del cargo de{' '}
                        <B>{tf.cargo || '___________________'}</B>, y como contraprestación el EMPLEADOR pagará una
                        remuneración.
                    </Text>
                </View>

                {/* Artículo 2 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseTitleInline}>Artículo 2. Obligaciones de las partes:</Text>
                    <Text style={[s.clauseText, { marginTop: 4, fontFamily: 'Times-Bold' }]}>Del EMPLEADOR:</Text>
                    <View style={{ paddingLeft: 12, marginTop: 2 }}>
                        {[
                            'Pagar en la forma pactada el monto equivalente a la remuneración.',
                            'Realizar la afiliación y correspondiente aporte a parafiscales.',
                            'Dotar al TRABAJADOR de los elementos de trabajo necesarios para el correcto desempeño de la gestión contratada.',
                            'Las obligaciones especiales enunciadas en los artículos 56 y 57 del Código Sustantivo del Trabajo.',
                        ].map((item, i) => (
                            <Text
                                key={i}
                                style={[s.clauseText, { marginBottom: 2 }]}
                            >
                                • {item}
                            </Text>
                        ))}
                    </View>
                    <Text style={[s.clauseText, { marginTop: 4, fontFamily: 'Times-Bold' }]}>Del TRABAJADOR:</Text>
                    <View style={{ paddingLeft: 12, marginTop: 2 }}>
                        {[
                            'Cumplir a cabalidad con el objeto del contrato, en la forma convenida.',
                            'Las obligaciones especiales enunciadas en los artículos 56 y 58 del Código Sustantivo del Trabajo.',
                        ].map((item, i) => (
                            <Text
                                key={i}
                                style={[s.clauseText, { marginBottom: 2 }]}
                            >
                                • {item}
                            </Text>
                        ))}
                    </View>
                </View>

                {/* Artículo 3 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Artículo 3. Lugar de prestación del servicio: </Text>
                        El TRABAJADOR prestará sus servicios de forma personal en{' '}
                        <B>{tf.lugarPrestacion || '___________________'}</B>.
                    </Text>
                </View>

                {/* Artículo 4 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Artículo 4. Jornada de trabajo: </Text>
                        La jornada de trabajo será de <B>{jornadaStr}</B>, sin exceder las 42 horas semanales permitidas
                        por la ley.
                    </Text>
                </View>

                {/* Artículo 5 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Artículo 5. Remuneración: </Text>
                        El EMPLEADOR deberá pagar al TRABAJADOR, a título de remuneración por las actividades, un monto
                        de{' '}
                        <B>
                            {salarioWords} ({salarioFormatted})
                        </B>{' '}
                        en moneda legal colombiana.
                    </Text>
                </View>

                {/* Artículo 6 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Artículo 6. Forma de pago: </Text>
                        El pago se realizará de forma <B>{frecuenciaLabel(tf.frecuenciaPago)}</B> mediante{' '}
                        <B>{metodoPagoLabel(tf.metodoPago)}</B>
                        {tf.metodoPago === 'transferencia' && tf.cuentaBancaria
                            ? `, a la cuenta bancaria No. ${tf.cuentaBancaria}`
                            : ''}
                        .
                    </Text>
                </View>

                {/* Artículo 7 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Artículo 7. Duración del contrato: </Text>
                        El presente contrato será por el término de <B>{duracionStr}</B>, prorrogables de forma
                        automática por un término igual al inicialmente pactado si se cumplen las condiciones acordadas
                        entre las partes.
                    </Text>
                </View>

                {/* Artículo 8 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Artículo 8. Preaviso: </Text>
                        La parte que desee terminar el contrato deberá notificarlo por escrito dentro de los{' '}
                        <B>30 días</B> anteriores al vencimiento del término de duración.
                    </Text>
                </View>

                {/* Artículo 9 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Artículo 9. Terminación unilateral del contrato: </Text>
                        El presente contrato se podrá terminar unilateralmente y sin indemnización alguna por cualquiera
                        de las partes, siempre y cuando se configure alguna de las situaciones previstas en el artículo
                        62 del Código Sustantivo del Trabajo o haya incumplimiento grave de alguna cláusula del
                        contrato. Se considera incumplimiento grave el desconocimiento de las obligaciones o
                        prohibiciones previstas en el contrato.
                    </Text>
                </View>

                {/* Artículo 10 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Artículo 10. Domicilio de las partes: </Text>
                        Para todos los efectos legales y convencionales, el domicilio de las partes es: el EMPLEADOR:{' '}
                        {ciudadStr}, {empleador.direccion || '___________________'}; el TRABAJADOR:{' '}
                        {trabajador.ciudad || '___________________'}, {trabajador.direccion || '___________________'}.
                    </Text>
                </View>

                {/* Artículo 11 */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Artículo 11. Integridad: </Text>
                        El presente contrato reemplaza en su integridad y deja sin efecto cualquier acuerdo de
                        voluntades pactado con anterioridad a la suscripción del mismo.
                    </Text>
                </View>

                {/* Signatures */}
                <View
                    style={s.signaturesWrap}
                    wrap={false}
                >
                    <View style={s.sigCol}>
                        <SigBlock
                            name={empleador.nombreCompleto || '___________________'}
                            cc={`${empleador.tipoDocumento || 'Doc.'} ${empleador.numeroDocumento || '___________________'}`}
                            role="EMPLEADOR"
                        />
                    </View>
                    <View style={s.sigCol}>
                        <SigBlock
                            name={trabajador.nombreCompleto || '___________________'}
                            cc={`${trabajador.tipoDocumento || 'Doc.'} ${trabajador.numeroDocumento || '___________________'}`}
                            role="TRABAJADOR"
                        />
                    </View>
                </View>
            </Page>
        </Document>
    );
}
