import type { CompraventaFormData } from './types';
import { formatCOP, formatDate, numberToWordsCOP } from './compraventaUtils';

interface CompraventaTemplateProps {
    formData: CompraventaFormData;
}

const base = import.meta.env.BASE_URL;

export default function CompraventaTemplate({ formData }: CompraventaTemplateProps) {
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
        <div className="relative bg-white font-serif text-[10px] text-slate-800 leading-relaxed">
            {/* ── Watermark ── */}
            <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute inset-0 flex items-center justify-center z-10"
                style={{ transform: 'rotate(-42deg)' }}
            >
                <span
                    className="text-[180px] font-black tracking-widest opacity-[0.06] text-[#112F4F]"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                >
                    GREXIA
                </span>
            </div>

            {/* ── Page wrapper ── */}
            <div className="max-w-198.5 mx-auto px-14 py-10">
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <img
                            src={base + 'logo.svg'}
                            alt="Grexia"
                            className="h-7"
                        />
                        <span
                            className="text-[22px] font-black uppercase tracking-[0.05em] text-[#112F4F]"
                            style={{ fontFamily: "'Montserrat', 'Proxima Nova', 'Segoe UI', sans-serif" }}
                        >
                            GREXIA
                        </span>
                    </div>
                    <div className="text-right">
                        <h1 className="text-xl font-black tracking-[2px] text-[#112F4F] leading-tight">
                            PROMESA DE COMPRAVENTA
                        </h1>
                        <p className="text-[9px] text-slate-500 mt-0.5">Bien Inmueble</p>
                    </div>
                </div>
                <div className="border-b-[1.5px] border-[#112F4F] mb-4" />

                {/* ── Info Box: Precio + Domicilio ── */}
                <div className="flex border-[1.5px] border-primary rounded mb-3">
                    <div className="flex-3 p-3 border-r border-dashed border-primary">
                        <p className="text-[7px] font-bold uppercase tracking-[0.6px] text-slate-700 mb-1">
                            Precio del Inmueble
                        </p>
                        <p className="text-[20px] font-black text-slate-900 leading-none mb-1">{precioFormatted}</p>
                        <p className="text-[8px] text-slate-700 uppercase tracking-[0.3px] border-t border-dashed border-slate-300 pt-1 mt-1">
                            SON: {precioWords} M/L
                        </p>
                    </div>
                    <div className="flex-2 p-3">
                        <p className="text-[7px] font-bold uppercase tracking-[0.6px] text-slate-700 mb-1">
                            Domicilio Contractual
                        </p>
                        <p className="text-[10px] font-black text-slate-900 mb-1">
                            {ciudadDomicilio}, {deptDomicilio}
                        </p>
                    </div>
                </div>

                {/* ── Parties Box: Vendedor | Comprador ── */}
                <div className="flex bg-[#EBF4FF] border border-primary rounded mb-3">
                    <div className="flex-1 p-3 border-r border-dashed border-primary">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-primary border-b border-primary pb-1 mb-2">
                            Promitente Vendedor(a)
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {vendedor.nombre || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">C.C.: </span>
                            {vendedor.cc || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Expedida en: </span>
                            {vendedor.ccExpedidaEn || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Ciudad: </span>
                            {vendedor.ciudad || '___________________'}
                        </p>
                    </div>
                    <div className="flex-1 p-3">
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.8px] text-primary border-b border-primary pb-1 mb-2">
                            Promitente Comprador(a)
                        </p>
                        <p className="font-black text-[9.5px] text-slate-900 mb-1">
                            {comprador.nombre || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">C.C.: </span>
                            {comprador.cc || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Expedida en: </span>
                            {comprador.ccExpedidaEn || '___________________'}
                        </p>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                            <span className="font-bold">Ciudad: </span>
                            {comprador.ciudad || '___________________'}
                        </p>
                    </div>
                </div>

                {/* ── Intro paragraph ── */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-3">
                    <strong>{vendedor.nombre || '___________________'}</strong>, mayor de edad, domiciliado y residente
                    en la ciudad de {vendedor.ciudad || '___________________'}, identificado con cedula de ciudadania
                    numero <strong>{vendedor.cc || '___________________'}</strong> expedida en{' '}
                    {vendedor.ccExpedidaEn || '___________________'} actuando a nombre propio de manera libre expresa y
                    voluntaria, quien para los efectos del presente contrato se denominara{' '}
                    <strong>EL PROMITENTE VENDEDOR</strong>, de una parte; y de la otra,{' '}
                    <strong>{comprador.nombre || '___________________'}</strong> mayor de edad, domiciliada y residente
                    en la ciudad {comprador.ciudad || '___________________'}, identificado con cedula de ciudadania
                    numero <strong>{comprador.cc || '___________________'}</strong> expedida en{' '}
                    {comprador.ccExpedidaEn || '___________________'}, actuando a nombre propio, propio de manera libre
                    expresa y voluntaria, quien en adelante se denominara <strong>EL PROMITENTE COMPRADOR</strong>,
                    manifiestan a traves del presente documento de efecto legal que suscriben mutuamente CONTRATO DE
                    PROMESA DE COMPRAVENTA de bien inmueble, regido bajo las siguientes clausulas:
                </p>

                {/* ── Clausulas ── */}
                <p className="text-[8px] font-bold uppercase tracking-[0.8px] text-slate-700 border-b border-slate-300 pb-1 mb-3">
                    Clausulas
                </p>

                {/* PRIMERA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>PRIMERA. OBJETO.</strong> EL PROMITENTE VENDEDOR se obliga a vender al PROMITENTE
                        COMPRADOR, quien a su vez se obliga a comprar el bien inmueble que se describe a continuacion:
                        Bien inmueble ubicado en la: DIRECCION:{' '}
                        <strong>{inmueble.direccion || '___________________'}</strong> de la ciudad de{' '}
                        {inmueble.ciudad || '___________________'}, el cual cuenta con AREA:{' '}
                        <strong>{inmueble.area || '___'}</strong> m2 y alinderado de manera general asi: LINDEROS:{' '}
                        Norte: {inmueble.linderoNorte || '___'}, Sur: {inmueble.linderoSur || '___'}, Oriente:{' '}
                        {inmueble.linderoOriente || '___'}, Occidente: {inmueble.linderoOccidente || '___'} y de NUMERO
                        DE MATRICULA INMOBILIARIA: <strong>{inmueble.matricula || '___________________'}</strong>,
                        CEDULA CATASTRAL: <strong>{inmueble.cedulaCatastral || '___________________'}</strong>.
                    </p>
                </div>

                {/* SEGUNDA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>SEGUNDA. TRADICION.</strong> El Inmueble que por este contrato se promete vender por una
                        parte, y comprar por la otra, lo adquirio el promitente vendedor por{' '}
                        <strong>{tradicion.tipoActo || '___________________'}</strong> segun consta en la escritura
                        publica numero <strong>{tradicion.escrituraNro || '___________________'}</strong> de la Notaria{' '}
                        {tradicion.notaria || '___________________'}, la cual fue registrada bajo el folio de matricula
                        inmobiliaria <strong>{tradicion.folioMatricula || '___________________'}</strong> de la Oficina
                        de Registro de Instrumentos Publicos de la ciudad de{' '}
                        {tradicion.ciudadRegistro || '___________________'}.
                    </p>
                </div>

                {/* TERCERA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>TERCERA. OTRAS OBLIGACIONES.</strong> El PROMITENTE VENDEDOR se obliga a transferir el
                        dominio del inmueble objeto del presente contrato libre de hipotecas, demandas civiles,
                        embargos, condiciones resolutorias, pleito pendiente, censos, anticresis y en general, de todo
                        gravamen o limitacion del dominio y saldra al saneamiento en los casos de la ley. Tambien se
                        obliga el PROMITENTE VENDEDOR al pago total de impuestos, tasas y contribuciones causadas hasta
                        la fecha de la escritura publica de compraventa.
                    </p>
                </div>

                {/* CUARTA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>CUARTA. PRECIO Y FORMA DE PAGO.</strong> El precio del inmueble prometido en venta es de{' '}
                        <strong>{precioFormatted}</strong> moneda corriente{precioIncluyeTexto}; suma que el PROMITENTE
                        COMPRADOR pagara al PROMITENTE VENDEDOR asi: {economico.formaDePago || '___________________'}
                    </p>
                </div>

                {/* QUINTA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>QUINTA. ARRAS.</strong> La cantidad de <strong>{arrasFormatted}</strong> que el
                        PROMITENTE VENDEDOR recibira al momento de la firma del presente contrato, se entrega a titulo
                        de arras confirmatorias del acuerdo prometido y seran abonadas al precio total al momento de
                        perfeccionarse el objeto de esta promesa.
                    </p>
                </div>

                {/* SEXTA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>SEXTA. CLAUSULA PENAL.</strong> Los promitentes establecemos, para el caso de
                        incumplimiento, una multa por un valor de <strong>{penalFormatted}</strong> y la devolucion
                        total del dinero recibido en pagos anteriores, si el incumplimiento es de parte del PROMITENTE
                        COMPRADOR; y si el incumplimiento es por parte del PROMITENTE VENDEDOR este devolvera al
                        PROMITENTE COMPRADOR el valor dado como ARRAS confirmatorias mas el valor determinado como
                        clausula penal.
                    </p>
                </div>

                {/* SEPTIMA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>SEPTIMA. OTORGAMIENTO DE LA ESCRITURA PUBLICA DE COMPRAVENTA.</strong> La escritura
                        publica que debera hacerse con el fin de perfeccionar la venta prometida del inmueble alinderado
                        en la clausula primera se otorgara en la Notaria{' '}
                        <strong>{escritura.notaria || '___________________'}</strong> el dia{' '}
                        <strong>{fechaEscritura}</strong> en los terminos de la CLAUSULA CUARTA.
                    </p>
                </div>

                {/* OCTAVA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>OCTAVA. PRORROGA.</strong> Solo se podra prorrogar el termino para el cumplimiento de
                        las obligaciones que por este contrato se contraen, cuando asi lo acuerden las partes, mediante
                        clausula que se agregue al presente instrumento, por escrito y autenticado ante notaria, firmada
                        por ambas partes por lo menos con dos (2) dias habiles de anticipacion al termino inicial
                        senalado para el otorgamiento de la escritura publica.
                    </p>
                </div>

                {/* NOVENA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>NOVENA. GASTOS.</strong> Los Gastos notariales y de registro que se generen por concepto
                        de escrituracion y registro seran asumidos{' '}
                        {escritura.gastosDistribucion || '___________________'}.
                    </p>
                </div>

                {/* DECIMA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>DECIMA. MERITO EJECUTIVO.</strong> El presente documento presta merito ejecutivo,
                        conforme a lo dispuesto en el articulo 422 del Codigo General del Proceso.
                    </p>
                </div>

                {/* DECIMA PRIMERA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>DECIMA PRIMERA. RESOLUCION AUTOMATICA POR INCUMPLIMIENTO.</strong> Las partes acuerdan
                        que el incumplimiento de cualquiera de las obligaciones esenciales contenidas en el presente
                        contrato, en especial el pago del precio en las fechas pactadas o el otorgamiento de la
                        escritura publica, facultara a la parte cumplida para resolver de pleno derecho el presente
                        contrato, sin necesidad de declaracion judicial previa, bastando para ello comunicacion escrita
                        dirigida a la parte incumplida. En tal evento: si el incumplimiento fuere imputable a LA
                        PROMITENTE COMPRADORA, las sumas entregadas podran ser retenidas por LA PROMITENTE VENDEDORA
                        hasta el valor de la clausula penal pactada por los perjuicios efectivamente causados; si el
                        incumplimiento fuere imputable a LA PROMITENTE VENDEDORA, esta debera reintegrar todas las sumas
                        recibidas mas la clausula penal pactada dentro de los cinco (5) dias habiles siguientes a la
                        comunicacion de resolucion. Lo anterior se pacta con fundamento en los articulos 1546 y 1609 del
                        Codigo Civil.
                    </p>
                </div>

                {/* DECIMA SEGUNDA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>DECIMA SEGUNDA. EFECTOS EN CASO DE RESOLUCION.</strong> Las partes acuerdan que la
                        entrega material del inmueble podra realizarse antes del otorgamiento y registro de la escritura
                        publica de compraventa, sin que ello implique transferencia del dominio, el cual solo se
                        entendera transferido con el otorgamiento y registro de la correspondiente escritura publica. En
                        caso de que por causas no imputables a las partes, tales como demoras administrativas,
                        notariales, registrales o por actuaciones de terceros, no se realice oportunamente el
                        otorgamiento o registro de la escritura publica, la entrega material del inmueble conservara
                        plena validez y no generara penalidad para ninguna de las partes, siempre que se haya cumplido
                        con las obligaciones contractuales. En el evento de que el presente contrato sea resuelto por
                        incumplimiento de la PROMITENTE COMPRADORA despues de haberse efectuado la entrega material del
                        inmueble, LA PROMITENTE VENDEDORA podra retener de las sumas recibidas los valores necesarios
                        para cubrir danos, deterioros, obligaciones pendientes, canones equivalentes al uso del
                        inmueble, servicios publicos, administracion u otros perjuicios causados, sin perjuicio de la
                        aplicacion de la clausula penal pactada y de las demas acciones legales a que haya lugar.
                    </p>
                </div>

                {/* DECIMA TERCERA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>DECIMA TERCERA. IMPUESTOS Y RETENCIONES.</strong> Todos los impuestos, retenciones,
                        contribuciones y gravamenes derivados de la compraventa seran asumidos asi: el impuesto de
                        retencion en la fuente por enajenacion de bienes inmuebles, si hubiere lugar, sera asumido por
                        la parte vendedora conforme a la legislacion tributaria vigente; los derechos notariales seran
                        pagados por partes iguales entre comprador y vendedor; el impuesto predial sera asumido por la
                        vendedora hasta la fecha de otorgamiento de la escritura publica.
                    </p>
                </div>

                {/* DECIMA CUARTA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>DECIMA CUARTA. RIESGO DEL INMUEBLE.</strong> El inmueble objeto del presente contrato
                        permanecera bajo responsabilidad y riesgo de LA PROMITENTE VENDEDORA hasta el momento de la
                        entrega material del mismo. En consecuencia, cualquier dano, deterioro o perdida total o parcial
                        del inmueble antes de la entrega sera asumido por la vendedora, quien debera restituir las sumas
                        recibidas o reparar el inmueble a su estado original.
                    </p>
                </div>

                {/* DECIMA QUINTA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>DECIMA QUINTA. PAZ Y SALVO.</strong> EL PROMITENTE VENDEDOR se obliga a entregar el
                        inmueble a paz y salvo por concepto de administracion del conjunto residencial, servicios
                        publicos domiciliarios, impuesto predial, valorizaciones, contribuciones u obligaciones que
                        deriven de contratos de arrendamiento anteriores suscritos por EL PROMITENTE VENDEDOR. El
                        comprador podra exigir la presentacion de los respectivos certificados de paz y salvo antes de
                        la firma de la escritura publica.
                    </p>
                </div>

                {/* DECIMA SEXTA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>DECIMA SEXTA. CESION.</strong> Ninguna de las partes podra ceder total o parcialmente
                        los derechos derivados del presente contrato sin autorizacion previa y escrita de la otra parte.
                    </p>
                </div>

                {/* DECIMA SEPTIMA */}
                <div className="mb-3">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>DECIMA SEPTIMA. DOMICILIO.</strong> Para todos los efectos legales derivados del
                        presente contrato, las partes fijan como domicilio contractual la ciudad de{' '}
                        <strong>{ciudadDomicilio}</strong>, departamento de <strong>{deptDomicilio}</strong>.
                    </p>
                </div>

                {/* DECIMA OCTAVA */}
                <div className="mb-4">
                    <p className="text-[10px] text-slate-800 leading-[1.65] text-justify">
                        <strong>DECIMA OCTAVA. PERFECCIONAMIENTO.</strong> El presente contrato constituye una promesa
                        de contrato en los terminos del articulo 1611 del Codigo Civil, obligando a las partes a
                        celebrar la escritura publica de compraventa en las condiciones aqui pactadas.
                    </p>
                </div>

                {/* ── Closing statement ── */}
                <p className="text-[10px] text-slate-800 leading-[1.65] text-justify mb-10">
                    Los contratantes, leido el presente documento, de manera libre expresa y voluntaria, firman y
                    suscriben el presente contrato de efectos legales.
                </p>

                {/* ── Signature blocks ── */}
                <div className="grid grid-cols-2 gap-8 mt-10">
                    {/* Vendedor */}
                    <div>
                        <div className="border-t-[1.5px] border-slate-400 pt-2 flex gap-3 items-start">
                            <div className="flex-1">
                                <p className="font-black text-[10px] text-slate-900 mb-0.5">
                                    {vendedor.nombre || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700">
                                    CC. No. {vendedor.cc || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700 font-bold">PROMITENTE VENDEDOR</p>
                            </div>
                            <div className="border border-slate-400 rounded w-14 h-16 flex items-end justify-center pb-1 shrink-0">
                                <span className="text-[7px] text-slate-400 uppercase tracking-[0.5px]">Huella</span>
                            </div>
                        </div>
                    </div>

                    {/* Comprador */}
                    <div>
                        <div className="border-t-[1.5px] border-slate-400 pt-2 flex gap-3 items-start">
                            <div className="flex-1">
                                <p className="font-black text-[10px] text-slate-900 mb-0.5">
                                    {comprador.nombre || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700">
                                    CC. No. {comprador.cc || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700 font-bold">PROMITENTE COMPRADOR</p>
                            </div>
                            <div className="border border-slate-400 rounded w-14 h-16 flex items-end justify-center pb-1 shrink-0">
                                <span className="text-[7px] text-slate-400 uppercase tracking-[0.5px]">Huella</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Testigo (optional) ── */}
                {escritura.incluyeTestigo && (
                    <div className="mt-10 max-w-xs">
                        <div className="border-t-[1.5px] border-slate-400 pt-2 flex gap-3 items-start">
                            <div className="flex-1">
                                <p className="font-black text-[10px] text-slate-900 mb-0.5">
                                    {escritura.testigoNombre || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700">
                                    CC No. {escritura.testigoCC || '___________________'}
                                </p>
                                <p className="text-[9px] text-slate-700 font-bold">TESTIGO</p>
                            </div>
                            <div className="border border-slate-400 rounded w-14 h-16 flex items-end justify-center pb-1 shrink-0">
                                <span className="text-[7px] text-slate-400 uppercase tracking-[0.5px]">Huella</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Footer ── */}
                <div className="mt-10 border-t border-slate-200 pt-2 flex justify-between items-center">
                    <p className="text-[7px] text-slate-400">
                        Generado con <span className="text-[#112F4F] font-bold">grexia.co</span>
                    </p>
                    <p className="text-[7px] text-slate-500 text-right">
                        ¿Dudas sobre este documento?{' '}
                        <span className="text-[#112F4F] font-bold">Agenda una asesoria legal</span>
                        {' en '}
                        <span className="text-[#112F4F] font-bold">grexia.co</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
