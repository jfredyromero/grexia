import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { CompraventaFormData } from './types';
import { formatCOP, formatDate, numberToWordsCOP } from './compraventaUtils';
import { PDFHeader, PDFFooter, PDFWatermark, pdfStyles as s, B, SigBlock } from '../arrendamiento/pdf/shared';

interface CompraventaPDFProps {
    formData: CompraventaFormData;
}

export default function CompraventaPDF({ formData }: CompraventaPDFProps) {
    const { vendedor, comprador, inmueble, tradicion, economico, escritura } = formData;

    const precioNum = parseInt(economico.precioTotal.replace(/\D/g, ''), 10) || 0;
    const precioFormatted = economico.precioTotal ? formatCOP(economico.precioTotal) : '$ ___________________';
    const precioWords = precioNum > 0 ? numberToWordsCOP(precioNum).toUpperCase() : '___________________';

    const arrasFormatted = economico.arrasValor ? formatCOP(economico.arrasValor) : '___________________';
    const penalFormatted = economico.clausulaPenalValor
        ? formatCOP(economico.clausulaPenalValor)
        : '___________________';

    const fechaEscritura = escritura.fecha ? formatDate(escritura.fecha) : '___________________';
    const ciudadDomicilio = escritura.domicilioCiudad || '___________________';
    const deptDomicilio = escritura.domicilioDepartamento || '___________________';

    const precioIncluyeTexto = economico.precioIncluyeDescripcion
        ? `, precio que incluye ${economico.precioIncluyeDescripcion}`
        : '';

    return (
        <Document language="es-CO">
            <Page
                size="A4"
                style={s.page}
            >
                <PDFWatermark />
                <PDFFooter />
                <PDFHeader
                    title="PROMESA DE COMPRAVENTA"
                    subtitle="Bien Inmueble"
                />

                {/* ── Info box ── */}
                <View style={s.infoBox}>
                    <View style={s.infoLeft}>
                        <Text style={s.infoSectionLabel}>Precio del Inmueble</Text>
                        <Text style={s.infoCanonValue}>{precioFormatted}</Text>
                        <Text style={s.infoCanonWords}>SON: {precioWords} M/L</Text>
                    </View>
                    <View style={s.infoRight}>
                        <Text style={s.infoSectionLabel}>Domicilio Contractual</Text>
                        <Text style={s.infoCityValue}>
                            {ciudadDomicilio}, {deptDomicilio}
                        </Text>
                    </View>
                </View>

                {/* ── Parties box ── */}
                <View style={s.partiesBox}>
                    <View style={[s.partyCol, s.partyColLeft]}>
                        <Text style={s.partyColHeader}>Promitente Vendedor(a)</Text>
                        <Text style={s.partyName}>{vendedor.nombre || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>C.C.: </Text>
                            {vendedor.cc || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Expedida en: </Text>
                            {vendedor.ccExpedidaEn || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Ciudad: </Text>
                            {vendedor.ciudad || '___________________'}
                        </Text>
                    </View>
                    <View style={s.partyCol}>
                        <Text style={s.partyColHeader}>Promitente Comprador(a)</Text>
                        <Text style={s.partyName}>{comprador.nombre || '___________________'}</Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>C.C.: </Text>
                            {comprador.cc || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Expedida en: </Text>
                            {comprador.ccExpedidaEn || '___________________'}
                        </Text>
                        <Text style={s.partyLine}>
                            <Text style={s.partyLineLabel}>Ciudad: </Text>
                            {comprador.ciudad || '___________________'}
                        </Text>
                    </View>
                </View>

                {/* ── Intro ── */}
                <Text style={s.introPara}>
                    <B>{vendedor.nombre || '___________________'}</B>, mayor de edad, domiciliado y residente en la
                    ciudad de {vendedor.ciudad || '___________________'}, identificado con cedula de ciudadania numero{' '}
                    <B>{vendedor.cc || '___________________'}</B> expedida en{' '}
                    {vendedor.ccExpedidaEn || '___________________'} actuando a nombre propio de manera libre expresa y
                    voluntaria, quien para los efectos del presente contrato se denominara <B>EL PROMITENTE VENDEDOR</B>
                    , de una parte; y de la otra, <B>{comprador.nombre || '___________________'}</B> mayor de edad,
                    domiciliada y residente en la ciudad {comprador.ciudad || '___________________'}, identificado con
                    cedula de ciudadania numero <B>{comprador.cc || '___________________'}</B> expedida en{' '}
                    {comprador.ccExpedidaEn || '___________________'}, actuando a nombre propio, propio de manera libre
                    expresa y voluntaria, quien en adelante se denominara <B>EL PROMITENTE COMPRADOR</B>, manifiestan a
                    traves del presente documento de efecto legal que suscriben mutuamente CONTRATO DE PROMESA DE
                    COMPRAVENTA de bien inmueble, regido bajo las siguientes clausulas:
                </Text>

                {/* ── Clauses ── */}
                <Text style={s.clausesSectionLabel}>Clausulas</Text>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>PRIMERA. OBJETO. </Text>
                        EL PROMITENTE VENDEDOR se obliga a vender al PROMITENTE COMPRADOR, quien a su vez se obliga a
                        comprar el bien inmueble que se describe a continuacion: Bien inmueble ubicado en la: DIRECCION:{' '}
                        <B>{inmueble.direccion || '___________________'}</B> de la ciudad de{' '}
                        {inmueble.ciudad || '___________________'}, el cual cuenta con AREA:{' '}
                        <B>{inmueble.area || '___'}</B> m2 y alinderado de manera general asi: LINDEROS: Norte:{' '}
                        {inmueble.linderoNorte || '___'}, Sur: {inmueble.linderoSur || '___'}, Oriente:{' '}
                        {inmueble.linderoOriente || '___'}, Occidente: {inmueble.linderoOccidente || '___'} y de NUMERO
                        DE MATRICULA INMOBILIARIA: <B>{inmueble.matricula || '___________________'}</B>, CEDULA
                        CATASTRAL: <B>{inmueble.cedulaCatastral || '___________________'}</B>.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>SEGUNDA: TRADICION. </Text>
                        El Inmueble que por este contrato se promete vender por una parte, y comprar por la otra, lo
                        adquirio el promitente vendedor por <B>{tradicion.tipoActo || '___________________'}</B> segun
                        consta en la escritura publica numero <B>{tradicion.escrituraNro || '___________________'}</B>{' '}
                        de la Notaria {tradicion.notaria || '___________________'}, la cual fue registrada bajo el folio
                        de matricula inmobiliaria <B>{tradicion.folioMatricula || '___________________'}</B> de la
                        Oficina de Registro de Instrumentos Publicos de la ciudad de{' '}
                        {tradicion.ciudadRegistro || '___________________'}.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>TERCERA: OTRAS OBLIGACIONES. </Text>
                        El PROMITENTE VENDEDOR se obliga a transferir el dominio del inmueble objeto del presente
                        contrato libre de hipotecas, demandas civiles, embargos, condiciones resolutorias, pleito
                        pendiente, censos, anticresis y en general, de todo gravamen o limitacion del dominio y saldra
                        al saneamiento en los casos de la ley. Tambien se obliga el PROMITENTE VENDEDOR al pago total de
                        impuestos, tasas y contribuciones causadas hasta la fecha de la escritura publica de
                        compraventa.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>CUARTA: PRECIO Y FORMA DE PAGO. </Text>
                        El precio del inmueble prometido en venta es de <B>{precioFormatted}</B> moneda corriente
                        {precioIncluyeTexto}; suma que el PROMITENTE COMPRADOR pagara al PROMITENTE VENDEDOR asi:{' '}
                        {economico.formaDePago || '___________________'}
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>QUINTA: ARRAS. </Text>
                        La cantidad de <B>{arrasFormatted}</B> que el PROMITENTE VENDEDOR recibira al momento de la
                        firma del presente contrato, se entrega a titulo de arras confirmatorias del acuerdo prometido y
                        seran abonadas al precio total al momento de perfeccionarse el objeto de esta promesa.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>SEXTA: CLAUSULA PENAL. </Text>
                        Los promitentes establecemos, para el caso de incumplimiento, una multa por un valor de{' '}
                        <B>{penalFormatted}</B> y la devolucion total del dinero recibido en pagos anteriores, si el
                        incumplimiento es de parte del PROMITENTE COMPRADOR; y si el incumplimiento es por parte del
                        PROMITENTE VENDEDOR este devolvera al PROMITENTE COMPRADOR el valor dado como ARRAS
                        confirmatorias mas el valor determinado como clausula penal.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>
                            SEPTIMA: OTORGAMIENTO DE LA ESCRITURA PUBLICA DE COMPRAVENTA.{' '}
                        </Text>
                        La escritura publica que debera hacerse con el fin de perfeccionar la venta prometida del
                        inmueble alinderado en la clausula primera se otorgara en la Notaria{' '}
                        <B>{escritura.notaria || '___________________'}</B> el dia <B>{fechaEscritura}</B> en los
                        terminos de la CLAUSULA CUARTA.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>OCTAVA: PRORROGA. </Text>
                        Solo se podra prorrogar el termino para el cumplimiento de las obligaciones que por este
                        contrato se contraen, cuando asi lo acuerden las partes, mediante clausula que se agregue al
                        presente instrumento, por escrito y autenticado ante notaria, firmada por ambas partes por lo
                        menos con dos (2) dias habiles de anticipacion al termino inicial senalado para el otorgamiento
                        de la escritura publica.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>NOVENA: GASTOS. </Text>
                        Los Gastos notariales y de registro que se generen por concepto de escrituracion y registro
                        seran asumidos {escritura.gastosDistribucion || '___________________'}.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>DECIMA. MERITO EJECUTIVO. </Text>
                        El presente documento presta merito ejecutivo, conforme a lo dispuesto en el articulo 422 del
                        Codigo General del Proceso.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>
                            DECIMA PRIMERA. RESOLUCION AUTOMATICA POR INCUMPLIMIENTO.{' '}
                        </Text>
                        Las partes acuerdan que el incumplimiento de cualquiera de las obligaciones esenciales
                        contenidas en el presente contrato, en especial el pago del precio en las fechas pactadas o el
                        otorgamiento de la escritura publica, facultara a la parte cumplida para resolver de pleno
                        derecho el presente contrato, sin necesidad de declaracion judicial previa, bastando para ello
                        comunicacion escrita dirigida a la parte incumplida. Lo anterior se pacta con fundamento en los
                        articulos 1546 y 1609 del Codigo Civil.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>DECIMA SEGUNDA. EFECTOS EN CASO DE RESOLUCION. </Text>
                        Las partes acuerdan que la entrega material del inmueble podra realizarse antes del otorgamiento
                        y registro de la escritura publica de compraventa, sin que ello implique transferencia del
                        dominio. En el evento de que el presente contrato sea resuelto por incumplimiento de la
                        PROMITENTE COMPRADORA despues de haberse efectuado la entrega material del inmueble, LA
                        PROMITENTE VENDEDORA podra retener de las sumas recibidas los valores necesarios para cubrir
                        danos, deterioros, obligaciones pendientes y otros perjuicios causados.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>DECIMA TERCERA. IMPUESTOS Y RETENCIONES. </Text>
                        Todos los impuestos, retenciones, contribuciones y gravamenes derivados de la compraventa seran
                        asumidos conforme a la legislacion tributaria vigente; los derechos notariales seran pagados por
                        partes iguales entre comprador y vendedor; el impuesto predial sera asumido por la vendedora
                        hasta la fecha de otorgamiento de la escritura publica.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>DECIMA CUARTA. RIESGO DEL INMUEBLE. </Text>
                        El inmueble objeto del presente contrato permanecera bajo responsabilidad y riesgo de LA
                        PROMITENTE VENDEDORA hasta el momento de la entrega material del mismo.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>DECIMA QUINTA: PAZ Y SALVO. </Text>
                        EL PROMITENTE VENDEDOR se obliga a entregar el inmueble a paz y salvo por concepto de
                        administracion, servicios publicos domiciliarios, impuesto predial, valorizaciones,
                        contribuciones u obligaciones que deriven de contratos de arrendamiento anteriores.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>DECIMA SEXTA: CESION. </Text>
                        Ninguna de las partes podra ceder total o parcialmente los derechos derivados del presente
                        contrato sin autorizacion previa y escrita de la otra parte.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>DECIMA SEPTIMA. DOMICILIO. </Text>
                        Para todos los efectos legales derivados del presente contrato, las partes fijan como domicilio
                        contractual la ciudad de <B>{ciudadDomicilio}</B>, departamento de <B>{deptDomicilio}</B>.
                    </Text>
                </View>

                <View style={s.clauseWrap}>
                    <Text style={s.clauseText}>
                        <Text style={s.clauseTitleInline}>DECIMA OCTAVA. PERFECCIONAMIENTO. </Text>
                        El presente contrato constituye una promesa de contrato en los terminos del articulo 1611 del
                        Codigo Civil, obligando a las partes a celebrar la escritura publica de compraventa en las
                        condiciones aqui pactadas.
                    </Text>
                </View>

                {/* ── Closing ── */}
                <Text style={s.closingText}>
                    Los contratantes, leido el presente documento, de manera libre expresa y voluntaria, firman y
                    suscriben el presente contrato de efectos legales.
                </Text>

                {/* ── Signatures ── */}
                <View
                    style={s.signaturesWrap}
                    wrap={false}
                >
                    <View style={s.sigCol}>
                        <SigBlock
                            name={vendedor.nombre || '___________________'}
                            cc={`CC. No. ${vendedor.cc || '___________________'}`}
                            role="PROMITENTE VENDEDOR"
                        />
                    </View>
                    <View style={s.sigCol}>
                        <SigBlock
                            name={comprador.nombre || '___________________'}
                            cc={`CC. No. ${comprador.cc || '___________________'}`}
                            role="PROMITENTE COMPRADOR"
                        />
                    </View>
                </View>

                {/* ── Testigo (optional) ── */}
                {escritura.incluyeTestigo ? (
                    <View
                        style={s.signaturesWrapBottom}
                        wrap={false}
                    >
                        <View style={s.sigCol}>
                            <SigBlock
                                name={escritura.testigoNombre || '___________________'}
                                cc={`CC. No. ${escritura.testigoCC || '___________________'}`}
                                role="TESTIGO"
                            />
                        </View>
                        <View style={s.sigCol} />
                    </View>
                ) : null}
            </Page>
        </Document>
    );
}
