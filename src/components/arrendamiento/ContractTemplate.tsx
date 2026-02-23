import type { ArrendamientoFormData, PlanTier } from './types';
import { isComercial } from './types';
import { formatCOP, formatDate, numberToWordsCOP } from './contractUtils';

interface ContractTemplateProps {
    formData: ArrendamientoFormData;
    plan?: PlanTier;
    logoUrl?: string;
}

// ── Shared clause component ───────────────────────────────────────────────────

function Clause({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
    return (
        <div className="mb-5">
            <p className="font-bold text-slate-900">
                {number}. {title.toUpperCase()}
            </p>
            <div className="mt-1 text-slate-800 leading-relaxed">{children}</div>
        </div>
    );
}

// ── VIVIENDA template (Ley 820 de 2003) ──────────────────────────────────────

function ContractVivienda({ formData }: ContractTemplateProps) {
    const { inmueble, arrendador, arrendatario, condiciones } = formData;
    const canonNum = parseInt(condiciones.canonMensual.replace(/\D/g, ''), 10) || 0;
    const depositoNum = parseInt(condiciones.depositoCOP.replace(/\D/g, ''), 10) || 0;
    const depositoMeses = canonNum > 0 ? Math.round(depositoNum / canonNum) : 1;
    const fechaStr = formatDate(condiciones.fechaInicio);
    const [year, , day] = condiciones.fechaInicio ? condiciones.fechaInicio.split('-') : ['____', '__', '__'];
    const tipoLabel = inmueble.tipoInmueble || 'INMUEBLE';
    const ciudadStr = inmueble.ciudad || '___________________';
    const phLabel = inmueble.propiedadHorizontal ? ' sometido al régimen de propiedad horizontal' : '';

    const clausesPH = inmueble.propiedadHorizontal ? (
        <Clause
            number="SÉPTIMA"
            title="Propiedad Horizontal y Reglamento"
        >
            <p>
                El inmueble hace parte de un conjunto o edificio sometido al régimen de propiedad horizontal. El
                ARRENDATARIO se obliga a conocer y cumplir el reglamento de propiedad horizontal vigente, así como las
                decisiones de la asamblea de copropietarios y del administrador. Las cuotas de administración y demás
                expensas comunes ordinarias corren por cuenta del ARRENDATARIO, salvo pacto en contrario.
            </p>
        </Clause>
    ) : null;

    const nextNum = (n: number) => {
        const nums = [
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
        return nums[n] ?? String(n);
    };

    const base = 7;
    const off = inmueble.propiedadHorizontal ? 1 : 0;

    return (
        <div className="space-y-1">
            <Clause
                number="PRIMERA"
                title="Objeto del contrato"
            >
                <p>
                    El ARRENDADOR entrega al ARRENDATARIO, a título de arrendamiento, el inmueble tipo{' '}
                    <strong>{tipoLabel}</strong>
                    {phLabel}, ubicado en <strong>{inmueble.direccion || '___________________'}</strong>, ciudad de{' '}
                    <strong>{ciudadStr}</strong>, departamento de{' '}
                    <strong>{inmueble.departamento || '___________________'}</strong>
                    {inmueble.areaMq ? `, con un área aproximada de ${inmueble.areaMq} m²` : ''}, estrato{' '}
                    <strong>{inmueble.estrato || '___'}</strong>. El destino del inmueble será exclusivamente{' '}
                    <strong>vivienda urbana</strong>, conforme a lo dispuesto en la Ley 820 de 2003.
                </p>
            </Clause>

            <Clause
                number="SEGUNDA"
                title="Canon de arrendamiento"
            >
                <p>
                    El canon mensual de arrendamiento es de{' '}
                    <strong>
                        {numberToWordsCOP(canonNum)} ({formatCOP(condiciones.canonMensual)} COP)
                    </strong>
                    . El ARRENDATARIO se obliga a pagarlo a más tardar el día <strong>{condiciones.diaPagoMes}</strong>{' '}
                    de cada mes. El canon podrá ser reajustado anualmente conforme al IPC certificado por el DANE, en
                    los términos del artículo 20 de la Ley 820 de 2003.
                </p>
            </Clause>

            <Clause
                number="TERCERA"
                title="Forma y lugar de pago"
            >
                <p>
                    El canon se pagará por mensualidades anticipadas, a más tardar el día{' '}
                    <strong>{condiciones.diaPagoMes}</strong> de cada mes calendario. El incumplimiento en el pago
                    constituye causal de terminación del contrato, conforme al artículo 22, numeral 1, de la Ley 820 de
                    2003.
                </p>
            </Clause>

            <Clause
                number="CUARTA"
                title="Duración y renovación"
            >
                <p>
                    El contrato tendrá una duración de <strong>{condiciones.duracionMeses} meses</strong>, contados a
                    partir del <strong>{fechaStr}</strong>. A su vencimiento, se entenderá prorrogado en iguales
                    condiciones y por el mismo término, en los términos del artículo 6 de la Ley 820 de 2003.
                </p>
            </Clause>

            <Clause
                number="QUINTA"
                title="Depósito de garantía"
            >
                <p>
                    El ARRENDATARIO entrega en calidad de depósito de garantía la suma de{' '}
                    <strong>
                        {numberToWordsCOP(depositoNum)} ({formatCOP(condiciones.depositoCOP)} COP)
                    </strong>
                    , equivalente a <strong>{depositoMeses}</strong> mes(es) de canon. Dicha suma será devuelta al
                    término del contrato, descontando los valores adeudados conforme a la ley. El depósito no podrá
                    exceder el valor de dos (2) meses de canon, según el artículo 16 de la Ley 820 de 2003.
                </p>
            </Clause>

            <Clause
                number="SEXTA"
                title="Servicios públicos"
            >
                <p>
                    Los servicios públicos domiciliarios (agua, energía eléctrica, gas natural, teléfono e internet)
                    corren por cuenta del ARRENDATARIO, salvo pacto en contrario debidamente consignado por escrito.
                </p>
            </Clause>

            {clausesPH}

            <Clause
                number={nextNum(base + off)}
                title="Obligaciones del arrendador"
            >
                <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li>Entregar el inmueble en buen estado de servicio, seguridad y sanidad.</li>
                    <li>Mantener el inmueble en estado de servir para el fin convenido.</li>
                    <li>Garantizar el goce pacífico del inmueble al ARRENDATARIO.</li>
                    <li>No realizar obras o mejoras que perturben el uso del inmueble sin previo aviso.</li>
                </ol>
            </Clause>

            <Clause
                number={nextNum(base + off + 1)}
                title="Obligaciones del arrendatario"
            >
                <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li>Pagar el canon de arrendamiento en las fechas y forma pactadas.</li>
                    <li>Conservar el inmueble en buen estado y restituirlo en las mismas condiciones.</li>
                    <li>No subarrendar ni ceder el contrato sin autorización escrita del ARRENDADOR.</li>
                    <li>No realizar reformas o modificaciones sin autorización escrita del ARRENDADOR.</li>
                    {inmueble.propiedadHorizontal && <li>Cumplir el reglamento de propiedad horizontal.</li>}
                    <li>Comunicar oportunamente al ARRENDADOR las novedades que afecten el inmueble.</li>
                </ol>
            </Clause>

            <Clause
                number={nextNum(base + off + 2)}
                title="Causales de terminación"
            >
                <p>El presente contrato podrá darse por terminado por:</p>
                <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li>Mutuo acuerdo entre las partes.</li>
                    <li>Incumplimiento de las obligaciones de cualquiera de las partes.</li>
                    <li>Mora en el pago del canon, conforme al artículo 22, numeral 1, de la Ley 820 de 2003.</li>
                    <li>Vencimiento del término pactado sin prórroga.</li>
                    <li>Las demás causales establecidas en la Ley 820 de 2003.</li>
                </ol>
            </Clause>

            <Clause
                number={nextNum(base + off + 3)}
                title="Preaviso de terminación"
            >
                <p>
                    Cualquiera de las partes que desee dar por terminado el contrato al vencimiento del término deberá
                    notificar a la otra con un mínimo de <strong>tres (3) meses</strong> de anticipación, conforme al
                    artículo 22 de la Ley 820 de 2003.
                </p>
            </Clause>

            <Clause
                number={nextNum(base + off + 4)}
                title="Resolución de conflictos"
            >
                <p>
                    Las controversias que surjan del presente contrato se resolverán, en primera instancia, mediante
                    conciliación ante un Centro de Conciliación autorizado por el Ministerio de Justicia y del Derecho.
                    De no llegarse a acuerdo, las partes acudirán a la vía judicial ordinaria.
                </p>
            </Clause>

            <Clause
                number={nextNum(base + off + 5)}
                title="Norma aplicable"
            >
                <p>
                    El presente contrato se regirá por la Ley 820 de 2003, el Código Civil colombiano y demás
                    disposiciones aplicables vigentes.
                </p>
            </Clause>

            <Clause
                number={nextNum(base + off + 6)}
                title="Aceptación"
            >
                <p>
                    Las partes declaran haber leído íntegramente el presente contrato, encontrarlo conforme a sus
                    intereses y firmarlo en señal de aceptación, en la ciudad de <strong>{ciudadStr}</strong>, a los{' '}
                    <strong>{parseInt(day, 10)}</strong> días del mes de{' '}
                    <strong>
                        {condiciones.fechaInicio
                            ? new Date(condiciones.fechaInicio + 'T12:00:00').toLocaleString('es-CO', { month: 'long' })
                            : '___________'}
                    </strong>{' '}
                    de <strong>{year}</strong>.
                </p>
            </Clause>
        </div>
    );
}

// ── COMERCIAL template (Código de Comercio) ───────────────────────────────────

function ContractComercial({ formData }: ContractTemplateProps) {
    const { inmueble, arrendador, arrendatario, condiciones } = formData;
    const canonNum = parseInt(condiciones.canonMensual.replace(/\D/g, ''), 10) || 0;
    const depositoNum = parseInt(condiciones.depositoCOP.replace(/\D/g, ''), 10) || 0;
    const fechaStr = formatDate(condiciones.fechaInicio);
    const [year, , day] = condiciones.fechaInicio ? condiciones.fechaInicio.split('-') : ['____', '__', '__'];
    const tipoLabel = inmueble.tipoInmueble || 'INMUEBLE';
    const ciudadStr = inmueble.ciudad || '___________________';
    const esLocal = inmueble.tipoInmueble === 'Local Comercial';
    const phLabel = inmueble.propiedadHorizontal ? ' sometido al régimen de propiedad horizontal' : '';

    const clausesPH = inmueble.propiedadHorizontal ? (
        <Clause
            number="OCTAVA"
            title="Propiedad Horizontal y Reglamento"
        >
            <p>
                El inmueble hace parte de un edificio o centro comercial sometido al régimen de propiedad horizontal. El
                ARRENDATARIO se obliga a conocer y cumplir el reglamento de propiedad horizontal vigente y las
                decisiones de la administración. Las cuotas de administración y expensas comunes ordinarias corren por
                cuenta del ARRENDATARIO, salvo pacto en contrario.
            </p>
        </Clause>
    ) : null;

    const nextNum = (n: number) => {
        const nums = [
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
        return nums[n] ?? String(n);
    };

    const base = 8;
    const off = inmueble.propiedadHorizontal ? 1 : 0;

    return (
        <div className="space-y-1">
            <Clause
                number="PRIMERA"
                title="Objeto del contrato"
            >
                <p>
                    El ARRENDADOR entrega al ARRENDATARIO, a título de arrendamiento, el inmueble tipo{' '}
                    <strong>{tipoLabel}</strong>
                    {phLabel}, ubicado en <strong>{inmueble.direccion || '___________________'}</strong>, ciudad de{' '}
                    <strong>{ciudadStr}</strong>, departamento de{' '}
                    <strong>{inmueble.departamento || '___________________'}</strong>
                    {inmueble.areaMq ? `, con un área aproximada de ${inmueble.areaMq} m²` : ''}, estrato{' '}
                    <strong>{inmueble.estrato || '___'}</strong>.
                </p>
            </Clause>

            {esLocal ? (
                <Clause
                    number="SEGUNDA"
                    title="Actividad comercial autorizada"
                >
                    <p>
                        El ARRENDATARIO destinará el inmueble exclusivamente al desarrollo de la siguiente actividad
                        comercial: <strong>{condiciones.actividadComercial || '___________________'}</strong>. Queda
                        expresamente prohibido el cambio de actividad sin autorización previa y escrita del ARRENDADOR.
                        El ARRENDATARIO será responsable de obtener las licencias, permisos y registros que la ley exija
                        para el ejercicio de dicha actividad.
                    </p>
                </Clause>
            ) : (
                <Clause
                    number="SEGUNDA"
                    title="Destinación del inmueble"
                >
                    <p>
                        El ARRENDATARIO destinará el inmueble exclusivamente para uso de <strong>oficina</strong>. Queda
                        expresamente prohibido el uso residencial o el desarrollo de actividades distintas sin
                        autorización previa y escrita del ARRENDADOR.
                    </p>
                </Clause>
            )}

            <Clause
                number="TERCERA"
                title="Canon de arrendamiento"
            >
                <p>
                    El canon mensual de arrendamiento es de{' '}
                    <strong>
                        {numberToWordsCOP(canonNum)} ({formatCOP(condiciones.canonMensual)} COP)
                    </strong>
                    . El ARRENDATARIO se obliga a pagarlo a más tardar el día <strong>{condiciones.diaPagoMes}</strong>{' '}
                    de cada mes. Las partes podrán acordar libremente el reajuste anual del canon, sin que aplique el
                    límite del IPC previsto en la Ley 820 de 2003, por tratarse de un arrendamiento comercial regido por
                    el Código de Comercio.
                </p>
            </Clause>

            <Clause
                number="CUARTA"
                title="Forma y lugar de pago"
            >
                <p>
                    El canon se pagará por mensualidades anticipadas, a más tardar el día{' '}
                    <strong>{condiciones.diaPagoMes}</strong> de cada mes calendario. El incumplimiento en el pago
                    durante dos (2) periodos consecutivos constituirá causal de terminación unilateral del contrato por
                    parte del ARRENDADOR.
                </p>
            </Clause>

            <Clause
                number="QUINTA"
                title="Duración del contrato"
            >
                <p>
                    El contrato tendrá una duración de <strong>{condiciones.duracionMeses} meses</strong>, contados a
                    partir del <strong>{fechaStr}</strong>. Vencido el término, el contrato podrá prorrogarse por
                    acuerdo escrito entre las partes.
                </p>
            </Clause>

            <Clause
                number="SEXTA"
                title="Depósito de garantía"
            >
                <p>
                    El ARRENDATARIO entrega en calidad de depósito de garantía la suma de{' '}
                    <strong>
                        {numberToWordsCOP(depositoNum)} ({formatCOP(condiciones.depositoCOP)} COP)
                    </strong>
                    . Dicha suma será devuelta al término del contrato, descontando los valores adeudados, perjuicios
                    causados al inmueble y demás obligaciones pendientes del ARRENDATARIO.
                </p>
            </Clause>

            <Clause
                number="SÉPTIMA"
                title="Servicios públicos y administración"
            >
                <p>
                    Los servicios públicos (agua, energía eléctrica, gas, teléfono e internet) y las cuotas de
                    administración, si aplican, corren por cuenta del ARRENDATARIO, salvo pacto en contrario. El
                    ARRENDATARIO no podrá interrumpir el pago de los servicios durante la vigencia del contrato.
                </p>
            </Clause>

            {clausesPH}

            <Clause
                number={nextNum(base + off)}
                title="Obligaciones del arrendador"
            >
                <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li>Entregar el inmueble en buen estado y apto para el uso pactado.</li>
                    <li>Mantener el inmueble en condiciones que permitan el uso convenido.</li>
                    <li>Garantizar el goce pacífico del inmueble al ARRENDATARIO.</li>
                    <li>Realizar las reparaciones locativas mayores que no sean imputables al ARRENDATARIO.</li>
                </ol>
            </Clause>

            <Clause
                number={nextNum(base + off + 1)}
                title="Obligaciones del arrendatario"
            >
                <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li>Pagar el canon de arrendamiento en las fechas y forma pactadas.</li>
                    <li>Usar el inmueble exclusivamente para la actividad autorizada.</li>
                    <li>Conservar el inmueble en buen estado y restituirlo en las mismas condiciones.</li>
                    <li>No subarrendar ni ceder el contrato sin autorización escrita del ARRENDADOR.</li>
                    <li>
                        No realizar adecuaciones, reformas o modificaciones al inmueble sin autorización escrita del
                        ARRENDADOR.
                    </li>
                    {inmueble.propiedadHorizontal && <li>Cumplir el reglamento de propiedad horizontal.</li>}
                    <li>Obtener y mantener vigentes los permisos y licencias para su actividad.</li>
                    <li>Comunicar al ARRENDADOR cualquier daño o novedad que afecte el inmueble.</li>
                </ol>
            </Clause>

            <Clause
                number={nextNum(base + off + 2)}
                title="Mejoras y adecuaciones"
            >
                <p>
                    Las mejoras útiles o de lujo que el ARRENDATARIO realice con autorización escrita del ARRENDADOR
                    quedarán en beneficio del inmueble sin derecho a indemnización, salvo pacto en contrario. Las
                    mejoras necesarias autorizadas serán abonadas al ARRENDATARIO conforme a lo pactado. El ARRENDATARIO
                    deberá restituir el inmueble en el estado en que lo recibió.
                </p>
            </Clause>

            <Clause
                number={nextNum(base + off + 3)}
                title="Terminación anticipada"
            >
                <p>
                    Cualquiera de las partes podrá dar por terminado el contrato antes del vencimiento del término
                    pactado, con un preaviso mínimo de <strong>tres (3) meses</strong> mediante comunicación escrita. El
                    incumplimiento de este preaviso generará el pago de una indemnización equivalente al canon
                    correspondiente al tiempo de preaviso no cumplido.
                </p>
            </Clause>

            <Clause
                number={nextNum(base + off + 4)}
                title="Causales de terminación"
            >
                <p>El presente contrato podrá darse por terminado por:</p>
                <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li>Mutuo acuerdo entre las partes.</li>
                    <li>Mora en el pago de dos (2) o más cánones consecutivos.</li>
                    <li>Cambio de actividad comercial sin autorización del ARRENDADOR.</li>
                    <li>Subarrendamiento o cesión sin autorización escrita del ARRENDADOR.</li>
                    <li>Incumplimiento grave de cualquiera de las obligaciones pactadas.</li>
                    <li>Vencimiento del término pactado sin prórroga.</li>
                </ol>
            </Clause>

            <Clause
                number={nextNum(base + off + 5)}
                title="Resolución de conflictos"
            >
                <p>
                    Las controversias que surjan del presente contrato se resolverán mediante conciliación ante un
                    Centro de Conciliación autorizado. De no llegarse a acuerdo, las partes acudirán a la jurisdicción
                    ordinaria competente en la ciudad de <strong>{ciudadStr}</strong>.
                </p>
            </Clause>

            <Clause
                number={nextNum(base + off + 6)}
                title="Norma aplicable"
            >
                <p>
                    El presente contrato se regirá por el Código de Comercio colombiano, el Código Civil y demás
                    disposiciones legales vigentes aplicables a los contratos de arrendamiento comercial.
                </p>
            </Clause>

            <Clause
                number={nextNum(base + off + 7)}
                title="Aceptación"
            >
                <p>
                    Las partes declaran haber leído íntegramente el presente contrato, encontrarlo conforme a sus
                    intereses y firmarlo en señal de aceptación, en la ciudad de <strong>{ciudadStr}</strong>, a los{' '}
                    <strong>{parseInt(day, 10)}</strong> días del mes de{' '}
                    <strong>
                        {condiciones.fechaInicio
                            ? new Date(condiciones.fechaInicio + 'T12:00:00').toLocaleString('es-CO', { month: 'long' })
                            : '___________'}
                    </strong>{' '}
                    de <strong>{year}</strong>.
                </p>
            </Clause>
        </div>
    );
}

// ── Main router ───────────────────────────────────────────────────────────────

export default function ContractTemplate({ formData, plan = 'free', logoUrl }: ContractTemplateProps) {
    const { inmueble, arrendador, arrendatario, condiciones } = formData;
    const esContratoCom = isComercial(inmueble.tipoInmueble);
    const tipoLabel = inmueble.tipoInmueble || 'INMUEBLE';
    const ciudadStr = inmueble.ciudad || '___________________';
    const fechaStr = formatDate(condiciones.fechaInicio);
    const phTag = inmueble.propiedadHorizontal ? ' en Propiedad Horizontal' : '';
    const isPaid = plan === 'basico' || plan === 'pro';

    return (
        <div
            id="contract-content"
            className="bg-white rounded-2xl p-8 lg:p-10 font-serif text-sm text-slate-800 leading-relaxed"
        >
            {/* Custom logo for paid plans */}
            {isPaid && logoUrl && (
                <div className="flex justify-start mb-6 pb-4 border-b border-slate-200">
                    <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-12 max-w-[180px] object-contain"
                    />
                </div>
            )}

            {/* Header */}
            <h1 className="text-center text-base font-black uppercase text-slate-900 tracking-wide mb-1">
                Contrato de Arrendamiento de {tipoLabel}
                {phTag}
            </h1>
            <p className="text-center text-xs text-slate-500 mb-1">
                {esContratoCom ? 'Régimen: Código de Comercio' : 'Régimen: Ley 820 de 2003'}
            </p>
            <p className="text-center text-sm text-slate-500 mb-8">
                {ciudadStr}, {fechaStr}
            </p>

            {/* Parties */}
            <div className="mb-6 p-5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 mb-3 uppercase text-xs tracking-wider">Partes del contrato</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-bold text-slate-700 mb-1">Arrendador</p>
                        <p>{arrendador.nombreCompleto || '___________________'}</p>
                        <p>
                            {arrendador.tipoDocumento || 'Doc.'} No.{' '}
                            {arrendador.numeroDocumento || '___________________'}
                        </p>
                        <p>Tel. {arrendador.telefono || '___________________'}</p>
                        {arrendador.email && <p>{arrendador.email}</p>}
                    </div>
                    <div>
                        <p className="font-bold text-slate-700 mb-1">Arrendatario</p>
                        <p>{arrendatario.nombreCompleto || '___________________'}</p>
                        <p>
                            {arrendatario.tipoDocumento || 'Doc.'} No.{' '}
                            {arrendatario.numeroDocumento || '___________________'}
                        </p>
                        <p>Tel. {arrendatario.telefono || '___________________'}</p>
                        {arrendatario.email && <p>{arrendatario.email}</p>}
                    </div>
                </div>
            </div>

            {/* Clauses */}
            {esContratoCom ? <ContractComercial formData={formData} /> : <ContractVivienda formData={formData} />}

            {/* Signature block */}
            <div className="mt-12 grid grid-cols-2 gap-12">
                <div className="flex flex-col gap-2">
                    <div className="border-t-2 border-slate-400 pt-3">
                        <p className="font-bold text-slate-900">EL ARRENDADOR</p>
                        <p>{arrendador.nombreCompleto || '___________________'}</p>
                        <p>
                            {arrendador.tipoDocumento || 'Doc.'} No.{' '}
                            {arrendador.numeroDocumento || '___________________'}
                        </p>
                        <p>Tel. {arrendador.telefono || '___________________'}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="border-t-2 border-slate-400 pt-3">
                        <p className="font-bold text-slate-900">EL ARRENDATARIO</p>
                        <p>{arrendatario.nombreCompleto || '___________________'}</p>
                        <p>
                            {arrendatario.tipoDocumento || 'Doc.'} No.{' '}
                            {arrendatario.numeroDocumento || '___________________'}
                        </p>
                        <p>Tel. {arrendatario.telefono || '___________________'}</p>
                    </div>
                </div>
            </div>

            {/* Disclaimer — only on free plan */}
            {!isPaid && (
                <div
                    id="contract-disclaimer"
                    className="mt-10 pt-4 border-t border-slate-200 text-xs text-slate-400 text-center"
                >
                    <p>Documento generado por Lexia · lexia.co</p>
                    <p>
                        Este contrato es una referencia legal. Para mayor seguridad jurídica, consulte con un abogado
                        habilitado.
                    </p>
                </div>
            )}
        </div>
    );
}
