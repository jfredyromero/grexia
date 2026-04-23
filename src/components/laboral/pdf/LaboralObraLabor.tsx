import type { LaboralFormData } from '../types';
import { numberToWordsCOP, formatCOP } from '../laboralUtils';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { PDFHeader, PDFFooter, PDFWatermark, pdfStyles as s, SigBlock } from '../../pdf/shared';

interface Props {
    formData: LaboralFormData;
}

function docTypeLabel(tipo: string): string {
    if (tipo === 'CC') return 'C.C.';
    if (tipo === 'CE') return 'C.E.';
    if (tipo === 'NIT') return 'NIT';
    if (tipo === 'Pasaporte') return 'Pasaporte';
    return 'Doc.';
}

export default function LaboralObraLabor({ formData }: Props) {
    const { empleador, trabajador, condicionesObraLabor: ol } = formData;

    const salarioNum = parseInt(ol.salario.replace(/\D/g, ''), 10) || 0;
    const salarioFormatted = ol.salario ? formatCOP(ol.salario) : '$ ___________________';
    const salarioWords = salarioNum > 0 ? numberToWordsCOP(salarioNum) : '___________________';

    return (
        <Document language="es-CO">
            <Page
                size="A4"
                style={s.page}
            >
                <PDFHeader
                    title="CONTRATO POR OBRA O LABOR"
                    subtitle="Cód. Sustantivo del Trabajo · Colombia"
                />
                <PDFWatermark />
                <PDFFooter />

                {/* Caja de partes */}
                <View style={s.partiesBox}>
                    <View style={[s.partyCol, s.partyColLeft]}>
                        <Text style={s.partyColHeader}>Empleador</Text>
                        <Text style={s.partyName}>{empleador.nombreCompleto || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>{docTypeLabel(empleador.tipoDocumento)} </Text>
                            {empleador.numeroDocumento || '_______________'}
                        </Text>
                        <Text style={s.partyLine}>{empleador.ciudad || '___________________'}</Text>
                        <Text style={s.partyLine}>{empleador.direccion || '___________________'}</Text>
                    </View>
                    <View style={s.partyCol}>
                        <Text style={s.partyColHeader}>Trabajador</Text>
                        <Text style={s.partyName}>{trabajador.nombreCompleto || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>{docTypeLabel(trabajador.tipoDocumento)} </Text>
                            {trabajador.numeroDocumento || '_______________'}
                        </Text>
                        <Text style={s.partyLine}>{trabajador.ciudad || '___________________'}</Text>
                        <Text style={s.partyLine}>{trabajador.direccion || '___________________'}</Text>
                    </View>
                </View>

                {/* Caja de datos de la obra */}
                <View style={s.conditionsBox}>
                    <Text style={s.conditionsTitle}>Datos de la Obra</Text>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Obra o Labor: </Text>
                        <Text style={{ fontSize: 9.5, color: '#1e293b', flex: 1 }}>
                            {ol.descripcionObra || '___________________'}
                        </Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Oficio: </Text>
                        <Text style={{ fontSize: 9.5, color: '#1e293b', flex: 1 }}>
                            {ol.oficio || '___________________'}
                        </Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Salario u Honorarios: </Text>
                        <Text style={{ fontSize: 9.5, color: '#1e293b', flex: 1 }}>
                            {salarioWords} ({salarioFormatted}), {ol.modalidadPago || '___________________'}
                        </Text>
                    </View>
                    <View style={s.conditionRow}>
                        <Text style={s.conditionLabel}>Lugar: </Text>
                        <Text style={{ fontSize: 9.5, color: '#1e293b', flex: 1 }}>
                            {ol.lugar || '___________________'}
                        </Text>
                    </View>
                </View>

                {/* Párrafo introductorio */}
                <Text style={s.introPara}>
                    Entre el empleador y el trabajador, de las condiciones ya dichas identificados como aparece al pie
                    de sus correspondientes firmas se ha celebrado el presente contrato individual de trabajo, regido
                    además por las siguientes cláusulas:
                </Text>

                {/* Cláusula Primera */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Primera. </Text>
                        El empleador contrata los servicios personales del trabajador y este se obliga: a) A poner al
                        servicio del empleador toda su capacidad normal de trabajo, en forma exclusiva en el desempeño
                        de las funciones propias del oficio mencionado y las labores anexas y complementarias del mismo,
                        de conformidad con las órdenes e instrucciones que le imparta el empleador o sus representantes,
                        y b) A no prestar directa ni indirectamente servicios laborales a otros empleadores, ni a
                        trabajar por cuenta propia en el mismo oficio, durante la vigencia de este contrato.
                    </Text>
                </View>

                {/* Cláusula Segunda */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Segunda. </Text>
                        El empleador pagará al trabajador por la prestación de sus servicios el salario indicado,
                        pagadero en las oportunidades también señaladas anteriormente. Dentro de este pago se encuentra
                        incluida la remuneración de los descansos dominicales y festivos de que tratan los capítulos I y
                        II del título VII del Código Sustantivo del Trabajo. Se aclara y se conviene que en los casos en
                        los que el trabajador devengue comisiones o cualquier otra modalidad de salario variable, el
                        82.5% de dichos ingresos, constituye remuneración ordinaria y el 17.5% restante esta designado a
                        remunerar el descanso en los días dominicales y festivos que tratan los capítulos I y II del
                        título VII del Código Sustantivo de Trabajo.
                    </Text>
                </View>

                {/* Cláusula Tercera */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Tercera. </Text>
                        Todo trabajo suplementario o en horas extras y todo trabajo en día domingo o festivo en los que
                        legalmente debe concederse el descanso, se remunerará conforme a la Ley, así como los
                        correspondientes recargos nocturnos. Para el reconocimiento y pago del trabajo suplementario,
                        dominical o festivo el empleador o sus representantes deben autorizarlo previamente por escrito.
                        Cuando la necesidad de este trabajo se presente de manera imprevista o inaplazable, deberá
                        ejecutarse y darse cuenta de él por escrito, a la mayor brevedad, al empleador o sus
                        representantes.
                    </Text>
                </View>

                {/* Cláusula Cuarta */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Cuarta. </Text>
                        El trabajador se obliga a laborar la jornada ordinaria en los turnos y dentro de las horas
                        señaladas por el empleador, pudiendo hacer éste ajustes o cambios de horario cuando lo estime
                        conveniente. Por el acuerdo expreso o tácito de las partes, podrán repartirse las horas jornada
                        ordinaria de la forma prevista en el artículo 164 del Código Sustantivo del Trabajo, modificado
                        por el artículo 23 de la Ley 50 de 1990, teniendo en cuenta que los tiempos de descanso entre
                        las secciones de la jornada no se computan dentro de la misma, según el artículo 167 ibídem.
                    </Text>
                </View>

                {/* Cláusula Quinta */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Quinta. </Text>
                        El presente contrato se celebra por el tiempo que dure la realización de la obra (o labor
                        contratada), según se determino anteriormente.
                    </Text>
                </View>

                {/* Cláusula Sexta */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Sexta. </Text>
                        Son justas causas para dar por terminado unilateralmente este contrato por cualquiera de las
                        partes, las enumeradas en el artículo 7º del decreto 2351 de 1965; y, además, por parte del
                        empleado, las faltas que para el efecto se califiquen como graves en el espacio reservado para
                        las cláusulas adicionales en el presente contrato.
                    </Text>
                </View>

                {/* Cláusula Séptima */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Séptima. </Text>
                        Las invenciones o descubrimientos realizados por el trabajador contratado para investigar
                        pertenecen al empleador, de conformidad con el artículo 539 del Código de Comercio, así como el
                        artículo 20 y concordantes de la ley 23 de 1982 sobre derechos de autor. En cualquier otro caso
                        el invento pertenece al trabajador, salvo cuando éste no haya sido contratado para investigar y
                        realice la invención mediante datos o medios conocidos o utilizados en razón de la labor
                        desempeñada, evento en el cual el trabajador, tendrá derecho a una compensación que se fijará de
                        acuerdo con el monto del salario, la importancia del invento o descubrimiento, el beneficio que
                        reporte al empleador u otros factores similares.
                    </Text>
                </View>

                {/* Cláusula Octava */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Octava. </Text>
                        Las partes podrán convenir que el trabajo se preste en lugar distinto al inicialmente
                        contratado, siempre que tales traslados no desmejoren las condiciones laborales o de
                        remuneración del trabajador, o impliquen perjuicios para él. Los gastos que se originen con el
                        traslado serán cubiertos por el empleador de conformidad con el numeral 8º del artículo 57 del
                        Código Sustantivo del Trabajo. El trabajador se obliga a aceptar los cambios de oficio que
                        decida el empleador dentro de su poder subordinante, siempre que se respeten las condiciones
                        laborales del trabajador y no se le causen perjuicios.
                    </Text>
                </View>

                {/* Cláusula Novena */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Novena. </Text>
                        Este contrato ha sido redactado estrictamente de acuerdo con la ley y la jurisprudencia y será
                        interpretado de buena fe y en consonancia con el Código Sustantivo del Trabajo cuyo objeto,
                        definido en su artículo 1º, es lograr la justicia en las relaciones entre empleadores y
                        trabajadores dentro de un espíritu de coordinación económica y equilibrio social.
                    </Text>
                </View>

                {/* Cláusula Décima */}
                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>Décima. </Text>
                        El presente contrato reemplaza en su integridad y deja sin efecto alguno cualquiera otro
                        contrato verbal o escrito celebrado por las partes con anterioridad. Las modificaciones que se
                        acuerden al presente contrato se anotarán a continuación de su texto.
                    </Text>
                </View>

                {/* Cierre */}
                <Text style={s.closingText}>
                    Leído el presente documento, de manera libre expresa y voluntaria, firman y suscriben el presente
                    contrato de efectos legales.
                </Text>

                {/* Firmas */}
                <View style={s.signaturesWrap}>
                    <View style={s.sigCol}>
                        <SigBlock
                            name={empleador.nombreCompleto || '___________________'}
                            cc={`${docTypeLabel(empleador.tipoDocumento)} ${empleador.numeroDocumento || '_______________'}`}
                            role="EMPLEADOR"
                        />
                    </View>
                    <View style={s.sigCol}>
                        <SigBlock
                            name={trabajador.nombreCompleto || '___________________'}
                            cc={`${docTypeLabel(trabajador.tipoDocumento)} ${trabajador.numeroDocumento || '_______________'}`}
                            role="TRABAJADOR"
                        />
                    </View>
                </View>
            </Page>
        </Document>
    );
}
