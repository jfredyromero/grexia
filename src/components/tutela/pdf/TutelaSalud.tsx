import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TutelaFormData } from '../types';
import {
    generarTextoHechos,
    generarPretensiones,
    generarListaAnexos,
    getEPSDisplay,
    getFechaHoy,
} from '../tutelaUtils';
import {
    PDFHeader,
    PDFFooter,
    PDFWatermark,
    pdfStyles as s,
    B,
    SigBlock,
    C,
    BLUE,
} from '../../arrendamiento/pdf/shared';

const ts = StyleSheet.create({
    sectionLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: BLUE,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: C.slate300,
        paddingBottom: 3,
        marginTop: 10,
    },
    bodyText: {
        fontSize: 10,
        color: C.slate800,
        lineHeight: 1.65,
        textAlign: 'justify',
        marginBottom: 6,
        fontFamily: 'Times-Roman',
    },
    listItem: {
        flexDirection: 'row',
        fontSize: 10,
        color: C.slate800,
        lineHeight: 1.65,
        marginBottom: 4,
        fontFamily: 'Times-Roman',
    },
    listNum: {
        minWidth: 16,
        color: BLUE,
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
    },
});

interface Props {
    formData: TutelaFormData;
    hechosIA?: string | null;
}

export default function TutelaSaludPDF({ formData, hechosIA }: Props) {
    const eps = getEPSDisplay(formData);
    const fechaHoy = getFechaHoy();
    const textoHechos = hechosIA ?? generarTextoHechos(formData);
    const pretensiones = generarPretensiones(formData);
    const anexos = generarListaAnexos(formData);
    const hechosParrafos = textoHechos.split('\n\n');

    return (
        <Document language="es-CO">
            <Page
                size="A4"
                style={s.page}
            >
                <PDFWatermark />
                <PDFFooter />
                <PDFHeader
                    title="ACCIÓN DE TUTELA"
                    subtitle="Derecho a la Salud · Art. 86 C.P. de Colombia"
                />

                {/* Fecha y destinatario */}
                <Text style={ts.bodyText}>{fechaHoy}</Text>
                <Text style={[ts.bodyText, { fontFamily: 'Times-Bold' }]}>Señor:</Text>
                <Text style={[ts.bodyText, { fontFamily: 'Times-Bold' }]}>JUEZ CONSTITUCIONAL DE TUTELA (REPARTO)</Text>
                <Text style={[ts.bodyText, { marginBottom: 10 }]}>E. S. D.</Text>

                {/* Parties box */}
                <View style={s.partiesBox}>
                    <View style={[s.partyCol, s.partyColLeft]}>
                        <Text style={s.partyColHeader}>Parte Accionante</Text>
                        <Text style={s.partyName}>{formData.nombreCompleto || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>C.C. No.: </Text>
                            {formData.cedula || '___________________'}
                        </Text>
                        {formData.correo ? (
                            <Text style={s.partyLine}>
                                <Text style={s.partyLineLabel}>Correo: </Text>
                                {formData.correo}
                            </Text>
                        ) : null}
                        {formData.telefono ? (
                            <Text style={s.partyLine}>
                                <Text style={s.partyLineLabel}>Cel: </Text>
                                {formData.telefono}
                            </Text>
                        ) : null}
                    </View>
                    <View style={s.partyCol}>
                        <Text style={s.partyColHeader}>Parte Accionada</Text>
                        <Text style={s.partyName}>{eps}</Text>
                        {formData.regimen ? (
                            <Text style={s.partyLine}>
                                <Text style={s.partyLineLabel}>Régimen: </Text>
                                {formData.regimen === 'contributivo' ? 'Contributivo' : 'Subsidiado'}
                            </Text>
                        ) : null}
                        {formData.sedeEPS ? (
                            <Text style={s.partyLine}>
                                <Text style={s.partyLineLabel}>Sede: </Text>
                                {formData.sedeEPS}
                            </Text>
                        ) : null}
                        {formData.correoEPS ? (
                            <Text style={s.partyLine}>
                                <Text style={s.partyLineLabel}>Correo: </Text>
                                {formData.correoEPS}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* Párrafo introductorio */}
                <Text style={s.introPara}>
                    <B>{formData.nombreCompleto || '___________________'}</B>, mayor de edad, identificado(a) con cédula
                    de ciudadanía No. <B>{formData.cedula || '___________________'}</B> de{' '}
                    {formData.ciudad || '___________________'}, domiciliado(a) en la ciudad de{' '}
                    <B>{formData.ciudad || '___________________'}</B>, actuando en nombre propio, en ejercicio del
                    derecho consagrado en el artículo 86 de la Constitución Política y reglamentado por el Decreto 2591
                    de 1991, interpongo la presente <B>ACCIÓN DE TUTELA</B> para la protección inmediata de mis derechos
                    fundamentales a <B>LA VIDA, A LA SALUD, A LA INTEGRIDAD PERSONAL Y A LA DIGNIDAD HUMANA</B>,
                    derechos fundamentales, constitucionales y conexos, los cuales están siendo vulnerados por{' '}
                    <B>{eps}</B>.
                </Text>

                {/* I. HECHOS */}
                <Text style={ts.sectionLabel}>I. HECHOS</Text>
                {hechosParrafos.map((p, i) => (
                    <Text
                        key={i}
                        style={ts.bodyText}
                    >
                        {p}
                    </Text>
                ))}

                {/* Medida provisional */}
                <Text style={ts.sectionLabel}>II. MEDIDA PROVISIONAL</Text>
                <Text style={ts.bodyText}>
                    Solicito, con fundamento en el artículo 7 del Decreto 2591 de 1991, que se ORDENE de MANERA
                    INMEDIATA a <B>{eps}</B> AUTORIZAR, cubrir y efectuar la entrega de medicamentos y todo
                    procedimiento, examen y tratamiento prescritos por los profesionales de la salud y médicos
                    tratantes.
                </Text>

                {/* Pretensiones */}
                <Text style={ts.sectionLabel}>III. PRETENSIONES</Text>
                {pretensiones.map((p, i) => (
                    <View
                        key={i}
                        style={ts.listItem}
                    >
                        <Text style={ts.listNum}>{i + 1}.</Text>
                        <Text style={[ts.bodyText, { flex: 1, marginBottom: 2 }]}>{p}</Text>
                    </View>
                ))}
                <Text style={[ts.bodyText, { marginTop: 4 }]}>
                    Prevenir a las entidades accionadas, que en ningún caso vuelvan a incurrir en las acciones que
                    dieron mérito a iniciar esta tutela y que si lo hacen serán sancionados conforme lo dispone el Art.
                    52 del Decreto 2591/91.
                </Text>

                {/* Derechos fundamentales */}
                <Text style={ts.sectionLabel}>IV. DERECHOS FUNDAMENTALES VULNERADOS</Text>
                <Text style={ts.bodyText}>
                    La actuación de <B>{eps}</B> vulnera directamente mis derechos fundamentales a la SALUD, A LA VIDA,
                    A LA INTEGRIDAD PERSONAL, A LA DIGNIDAD HUMANA entre otros derechos fundamentales conexos
                    anteriormente descritos. La acción de tutela instituida en la constitución nacional en el artículo
                    86 tiene como finalidad evitar la violación de los derechos constitucionales fundamentales de la
                    persona cuando se encuentren amenazados o vulnerados, por la acción u omisión de una entidad pública
                    o por particulares sin que ello implique una instancia adicional a los procedimientos establecidos
                    en las normas procesales pertinentes. Referente a los anteriores hechos estimó que las entidades
                    accionadas están violando mis derechos fundamentales a la SALUD Y VIDA DIGNA al sustraerse de su
                    obligación prestacional asumida, desconociendo un derecho que la ley me otorga, imposibilitando el
                    desarrollo pleno de mis actividades cotidianas y agregando un riesgo a mi salud irreversible.
                </Text>

                {/* Violación salud */}
                <Text style={ts.sectionLabel}>V. VIOLACIÓN AL DERECHO A LA SALUD Y VIDA DIGNA</Text>
                <Text style={ts.bodyText}>
                    La violación al derecho fundamental invocado está consagrado en el artículo 49 de la constitución
                    dice que: corresponde al Estado organizar, dirigir y reglamentar la prestación de servicios de salud
                    a los habitantes y de saneamiento ambiental conforme a los principios de eficiencia, universalidad y
                    solidaridad. Adicionalmente a la violacion al precepto constitucional, en el presente caso se
                    vulneran los mandatos legales consagrados en la Ley 1751 de 2015 que define los principios del
                    derecho fundamental a la salud. Encontrando una violacion directa de los elementos de:
                    Disponibilidad, Accesibilidad, así como los principios de Universalidad, Pro homine, Oportunidad y
                    Eficiencia. Según la jurisprudencia constitucional y la sentencia T 760 de 2008, si una persona
                    alega que requiere un servicio con necesidad, la entidad encargada de asegurar la prestación del
                    servicio tiene la obligación de autorizarlo.
                </Text>

                {/* Fundamentos jurídicos */}
                <Text style={ts.sectionLabel}>VI. FUNDAMENTOS JURÍDICOS</Text>
                {[
                    'Constitución Política de Colombia: artículos 1, 11, 48, 49 y 86.',
                    'Ley 1751 de 2015: artículos 2, 6 y 10 numeral 5.',
                    'Decreto 780 de 2016: artículo 10.',
                    'Sentencia T-760 de 2008 (Corte Constitucional): garantiza la continuidad e integralidad en la atención médica.',
                    'Resolución 229 de 2020 (Minsalud): establece la responsabilidad de la EPS para garantizar atención en cualquier nivel de complejidad.',
                ].map((item, i) => (
                    <View
                        key={i}
                        style={ts.listItem}
                    >
                        <Text style={[ts.listNum, { color: C.slate500 }]}>—</Text>
                        <Text style={[ts.bodyText, { flex: 1, marginBottom: 2 }]}>{item}</Text>
                    </View>
                ))}

                {/* Procedencia */}
                <Text style={ts.sectionLabel}>VII. PROCEDENCIA Y LEGITIMIDAD</Text>
                <Text style={ts.bodyText}>
                    La presente Acción de Tutela es procedente de conformidad con lo establecido en los artículos 1, 2,
                    5 y 9 del Decreto 2591 de 1991, teniendo en cuenta que carezco de otro medio de defensa para los
                    fines de esta acción. La acción de tutela está consagrada en el artículo 86 de la Constitución
                    Política como un mecanismo procesal específico y directo cuyo objeto es la protección eficaz,
                    concreta e inmediata de los derechos constitucionales fundamentales cuando éstos resulten amenazados
                    o vulnerados por la acción o la omisión de una autoridad pública o de un particular en los casos
                    consagrados por la ley.
                </Text>

                {/* Anexos */}
                {anexos.length > 0 && (
                    <>
                        <Text style={ts.sectionLabel}>VIII. ANEXOS Y PRUEBAS</Text>
                        {anexos.map((doc, i) => (
                            <View
                                key={i}
                                style={ts.listItem}
                            >
                                <Text style={ts.listNum}>{i + 1}.</Text>
                                <Text style={[ts.bodyText, { flex: 1, marginBottom: 2 }]}>{doc}</Text>
                            </View>
                        ))}
                    </>
                )}

                {/* Juramento */}
                <Text style={ts.sectionLabel}>IX. JURAMENTO</Text>
                <Text style={ts.bodyText}>
                    Bajo la gravedad de juramento, manifiesto que no he presentado otra acción de tutela con el mismo
                    objeto ni ante otra autoridad judicial.
                </Text>

                {/* Notificaciones — SigBlocks */}
                <Text style={ts.sectionLabel}>X. NOTIFICACIONES</Text>
                <View
                    style={s.signaturesWrap}
                    wrap={false}
                >
                    {/* Accionante — con huella */}
                    <View style={s.sigCol}>
                        <SigBlock
                            name={formData.nombreCompleto || '___________________'}
                            cc={`C.C. ${formData.cedula || '___________________'}`}
                            role="ACCIONANTE"
                        />
                    </View>
                    {/* Accionada — sin huella */}
                    <View style={s.sigCol}>
                        <SigBlock
                            name={eps}
                            cc={formData.sedeEPS || ''}
                            role="PARTE ACCIONADA"
                        />
                    </View>
                </View>
            </Page>
        </Document>
    );
}
