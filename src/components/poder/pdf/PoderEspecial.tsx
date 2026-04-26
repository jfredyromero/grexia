import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { PoderFormData } from '../types';
import { getTipoProcesoConfig, tipoProcesoHasInmueble, tipoProcesoHasDemandados } from '../types';
import { formatLugarYFecha, formatDemandadosLista } from '../poderUtils';
import { PDFHeader, PDFFooter, PDFWatermark, pdfStyles as s, B, SigBlock } from '../../pdf/shared';

interface Props {
    formData: PoderFormData;
}

const PLACEHOLDER = '___________________';

export default function PoderEspecial({ formData }: Props) {
    const { poderdante, apoderado, proceso, tipoProceso } = formData;

    const cfg = getTipoProcesoConfig(tipoProceso);
    const hasInmueble = tipoProcesoHasInmueble(tipoProceso);
    const hasDemandados = tipoProcesoHasDemandados(tipoProceso);
    const tipoLabel = cfg?.labelDocumento ?? PLACEHOLDER;

    const lugarFecha = formatLugarYFecha(poderdante.ciudadPoderdante);
    const demandadosStr = formatDemandadosLista(proceso.demandados);

    return (
        <Document language="es-CO">
            <Page
                size="A4"
                style={s.page}
            >
                <PDFWatermark />
                <PDFFooter />
                <PDFHeader
                    title="PODER ESPECIAL"
                    subtitle="Art. 74 y 77 Código General del Proceso"
                />

                {/* Lugar y fecha */}
                <Text
                    style={{
                        fontSize: 10,
                        color: '#1e293b',
                        textAlign: 'right',
                        marginBottom: 10,
                    }}
                >
                    {lugarFecha}
                </Text>

                {/* Asunto: tipo de proceso destacado */}
                <View style={[s.conditionsBox, { alignItems: 'center', textAlign: 'center' }]}>
                    <Text style={s.conditionsTitle}>Asunto</Text>
                    <Text
                        style={{
                            fontFamily: 'Times-Bold',
                            fontSize: 12,
                            color: '#112F4F',
                            letterSpacing: 0.5,
                            textAlign: 'center',
                        }}
                    >
                        {tipoLabel}
                    </Text>
                </View>

                {/* Caja de partes */}
                <View style={s.partiesBox}>
                    <View style={[s.partyCol, s.partyColLeft]}>
                        <Text style={s.partyColHeader}>Poderdante</Text>
                        <Text style={s.partyName}>{poderdante.nombreCompleto || PLACEHOLDER}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>C.C.: </Text>
                            {poderdante.ccPoderdante || PLACEHOLDER}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Expedida en: </Text>
                            {poderdante.lugarExpedicionPoderdante || PLACEHOLDER}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Domicilio: </Text>
                            {poderdante.ciudadPoderdante || PLACEHOLDER}
                        </Text>
                    </View>
                    <View style={s.partyCol}>
                        <Text style={s.partyColHeader}>Apoderado(a)</Text>
                        <Text style={s.partyName}>{apoderado.nombreCompleto || PLACEHOLDER}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>C.C.: </Text>
                            {apoderado.ccApoderado || PLACEHOLDER}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>T.P.: </Text>
                            {apoderado.tarjetaProfesional || PLACEHOLDER}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Vecino(a) de: </Text>
                            {apoderado.ciudadApoderado || PLACEHOLDER}
                        </Text>
                    </View>
                </View>

                {/* Cuerpo principal del poder */}
                <Text style={s.introPara}>
                    <B>{poderdante.nombreCompleto || PLACEHOLDER}</B>, identificado(a) con cédula de ciudadanía No.{' '}
                    <B>{poderdante.ccPoderdante || PLACEHOLDER}</B>, expedida en{' '}
                    {poderdante.lugarExpedicionPoderdante || PLACEHOLDER}, domiciliado(a) y residente en la ciudad de{' '}
                    {poderdante.ciudadPoderdante || PLACEHOLDER}
                    {hasInmueble && (
                        <>
                            , propietario(a) del inmueble ubicado en{' '}
                            <B>{poderdante.direccionInmueble || PLACEHOLDER}</B>, con matrícula inmobiliaria No.{' '}
                            <B>{poderdante.matriculaInmobiliaria || PLACEHOLDER}</B>
                        </>
                    )}
                    , obrando en nombre propio, confiero <B>PODER ESPECIAL, AMPLIO Y SUFICIENTE</B> a{' '}
                    <B>{apoderado.nombreCompleto || PLACEHOLDER}</B>, mayor de edad y vecino(a) de{' '}
                    {apoderado.ciudadApoderado || PLACEHOLDER}, identificado(a) con cédula de ciudadanía No.{' '}
                    <B>{apoderado.ccApoderado || PLACEHOLDER}</B>, expedida en{' '}
                    {apoderado.lugarExpedicionApoderado || PLACEHOLDER}, abogado(a) en ejercicio y portador(a) de la
                    Tarjeta Profesional número <B>{apoderado.tarjetaProfesional || PLACEHOLDER}</B> del{' '}
                    <B>Consejo Superior de la Judicatura</B>, quien queda facultado(a) para que, en mi nombre y
                    representación, adelante el <B>{tipoLabel}</B>
                    {hasInmueble && (
                        <>
                            {' '}
                            sobre el inmueble ubicado en <B>{poderdante.direccionInmueble || PLACEHOLDER}</B>, con
                            matrícula inmobiliaria No. <B>{poderdante.matriculaInmobiliaria || PLACEHOLDER}</B>
                        </>
                    )}
                    {hasDemandados && (
                        <>
                            , en contra de <B>{demandadosStr}</B>
                        </>
                    )}
                    .
                </Text>

                {/* Objeto libre cuando no hay demandados */}
                {!hasDemandados && (
                    <Text style={s.introPara}>
                        <B>Objeto del poder: </B>
                        {proceso.objetoPoder || PLACEHOLDER}
                    </Text>
                )}

                {/* Facultades generales */}
                <Text style={s.introPara}>
                    Mi apoderado(a) queda ampliamente facultado(a) para presentar toda clase de escritos, solicitar y
                    aportar los documentos que sean necesarios, gestionar ante las autoridades, entidades públicas y
                    privadas que corresponda, y realizar todas las actuaciones procesales o extraprocesales pertinentes
                    para el cabal ejercicio de este poder.
                </Text>

                {/* Facultades del artículo 77 */}
                <Text style={s.introPara}>
                    Mi apoderado(a) queda facultado(a) de conformidad con el <B>artículo 77</B> del Código General del
                    Proceso y, en especial, para cobrar y recibir, desistir, conciliar, transigir. Del mismo modo, para
                    presentar recursos, aportar y solicitar pruebas, sustituir este poder, revocar las respectivas
                    sustituciones y, en general, para llevar a cabo todas las diligencias necesarias para el ejercicio
                    de este poder.
                </Text>

                {/* Firma */}
                <View
                    style={s.signaturesWrap}
                    wrap={false}
                >
                    <View style={s.sigCol}>
                        <SigBlock
                            name={poderdante.nombreCompleto || PLACEHOLDER}
                            cc={`C.C. No. ${poderdante.ccPoderdante || PLACEHOLDER} expedida en ${
                                poderdante.lugarExpedicionPoderdante || PLACEHOLDER
                            }.`}
                            role="PODERDANTE"
                        />
                    </View>
                    <View style={s.sigCol} />
                </View>
            </Page>
        </Document>
    );
}
