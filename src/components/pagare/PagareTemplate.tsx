import type { PagareFormData, PlanTier } from './types';
import { formatCOP, formatDate, numberToWordsCOP } from './pagareUtils';

interface PagareTemplateProps {
    formData: PagareFormData;
    plan: PlanTier;
    logoUrl?: string;
}

const PERIODO_LABELS: Record<string, string> = {
    mensual: 'mensuales',
    bimestral: 'bimestrales',
    trimestral: 'trimestrales',
};

export default function PagareTemplate({ formData, plan, logoUrl }: PagareTemplateProps) {
    const { acreedor, deudor, obligacion } = formData;
    const isFree = plan === 'free';

    const valorNum = parseInt(obligacion.valorPrincipal.replace(/\D/g, ''), 10) || 0;
    const valorCOP = valorNum > 0 ? formatCOP(obligacion.valorPrincipal) : '$ ___________________';
    const valorLetras =
        valorNum > 0 ? numberToWordsCOP(valorNum).toUpperCase() : '___________________';

    const moraTxt = obligacion.tasaInteresMora
        ? `${obligacion.tasaInteresMora}% mensual`
        : 'la tasa máxima legal vigente certificada por la Superintendencia Financiera de Colombia';

    const rowStyle: React.CSSProperties = {
        display: 'flex',
        gap: '4px',
        marginBottom: '3px',
        fontSize: '10px',
    };
    const lblStyle: React.CSSProperties = { color: '#64748b', minWidth: '72px', flexShrink: 0 };
    const valStyle: React.CSSProperties = { fontWeight: 700, color: '#1e293b' };

    return (
        <div
            className="relative bg-white"
            style={{
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: '11px',
                lineHeight: '1.55',
                color: '#1e293b',
            }}
        >
            {/* Diagonal watermark */}
            {isFree && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: '44%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-42deg)',
                        fontSize: '76px',
                        fontWeight: 900,
                        color: 'rgba(27,48,112,0.055)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        zIndex: 0,
                    }}
                >
                    LEXIA · DRAFT
                </div>
            )}

            <div style={{ position: 'relative', zIndex: 1, padding: '40px 48px' }}>
                {/* ── HEADER ── */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '14px',
                    }}
                >
                    <div>
                        {isFree ? (
                            <div
                                style={{
                                    fontSize: '22px',
                                    fontWeight: 900,
                                    color: '#1b3070',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                LEXIA
                            </div>
                        ) : logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Logo"
                                style={{ height: '48px', objectFit: 'contain' }}
                            />
                        ) : (
                            <div style={{ height: '48px' }} />
                        )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div
                            style={{
                                fontSize: '30px',
                                fontWeight: 900,
                                color: '#1b3070',
                                letterSpacing: '4px',
                                lineHeight: 1,
                            }}
                        >
                            PAGARÉ
                        </div>
                        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                            Título Valor · Código de Comercio de Colombia
                        </div>
                    </div>
                </div>

                <hr
                    style={{ border: 'none', borderTop: '2.5px solid #1b3070', marginBottom: '14px' }}
                />

                {/* ── AMOUNT BOX ── */}
                <div
                    style={{
                        border: '1.5px solid #1b3070',
                        borderRadius: '5px',
                        padding: '12px 16px',
                        backgroundColor: '#eef2ff',
                        marginBottom: '14px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '16px',
                            marginBottom: '10px',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: '8px',
                                    fontWeight: 700,
                                    color: '#1b3070',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '4px',
                                }}
                            >
                                Valor del Pagaré
                            </div>
                            <div
                                style={{
                                    fontSize: '22px',
                                    fontWeight: 900,
                                    color: '#1b3070',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                {valorCOP}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div
                                style={{
                                    fontSize: '8px',
                                    fontWeight: 700,
                                    color: '#1b3070',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '4px',
                                }}
                            >
                                Ciudad y Fecha
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '11px' }}>
                                {obligacion.ciudadSuscripcion || '___________________'}
                                {obligacion.fechaSuscripcion
                                    ? `, ${formatDate(obligacion.fechaSuscripcion)}`
                                    : ', ___________________'}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            paddingTop: '8px',
                            borderTop: '1px dashed #a5b4fc',
                            fontSize: '10px',
                        }}
                    >
                        <span style={{ color: '#64748b', fontWeight: 700 }}>SON:&nbsp;</span>
                        <span style={{ fontStyle: 'italic' }}>
                            {valorLetras} PESOS MONEDA CORRIENTE
                        </span>
                    </div>
                </div>

                {/* ── PARTIES ── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '14px',
                    }}
                >
                    {/* Deudor */}
                    <div
                        style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            padding: '10px 12px',
                            backgroundColor: '#f8fafc',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '8.5px',
                                fontWeight: 900,
                                color: '#1b3070',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                marginBottom: '7px',
                                paddingBottom: '5px',
                                borderBottom: '1px solid #e2e8f0',
                            }}
                        >
                            Deudor(a)
                        </div>
                        <div style={rowStyle}>
                            <span style={lblStyle}>Nombre:</span>
                            <span style={valStyle}>
                                {deudor.nombreCompleto || '___________________'}
                            </span>
                        </div>
                        <div style={rowStyle}>
                            <span style={lblStyle}>{deudor.tipoDocumento || 'Doc.'}:</span>
                            <span style={valStyle}>
                                {deudor.numeroDocumento || '___________________'}
                            </span>
                        </div>
                        <div style={rowStyle}>
                            <span style={lblStyle}>Ciudad:</span>
                            <span style={valStyle}>
                                {deudor.ciudadResidencia || '___________________'}
                            </span>
                        </div>
                        {deudor.telefono && (
                            <div style={rowStyle}>
                                <span style={lblStyle}>Teléfono:</span>
                                <span style={valStyle}>{deudor.telefono}</span>
                            </div>
                        )}
                        {deudor.email && (
                            <div style={rowStyle}>
                                <span style={lblStyle}>Correo:</span>
                                <span style={valStyle}>{deudor.email}</span>
                            </div>
                        )}
                    </div>

                    {/* Acreedor */}
                    <div
                        style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            padding: '10px 12px',
                            backgroundColor: '#f8fafc',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '8.5px',
                                fontWeight: 900,
                                color: '#1b3070',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                marginBottom: '7px',
                                paddingBottom: '5px',
                                borderBottom: '1px solid #e2e8f0',
                            }}
                        >
                            Acreedor(a)
                        </div>
                        <div style={rowStyle}>
                            <span style={lblStyle}>Nombre:</span>
                            <span style={valStyle}>
                                {acreedor.nombreCompleto || '___________________'}
                            </span>
                        </div>
                        <div style={rowStyle}>
                            <span style={lblStyle}>{acreedor.tipoDocumento || 'Doc.'}:</span>
                            <span style={valStyle}>
                                {acreedor.numeroDocumento || '___________________'}
                            </span>
                        </div>
                        {acreedor.telefono && (
                            <div style={rowStyle}>
                                <span style={lblStyle}>Teléfono:</span>
                                <span style={valStyle}>{acreedor.telefono}</span>
                            </div>
                        )}
                        {acreedor.email && (
                            <div style={rowStyle}>
                                <span style={lblStyle}>Correo:</span>
                                <span style={valStyle}>{acreedor.email}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── OBLIGATION TEXT ── */}
                <p style={{ marginBottom: '12px', textAlign: 'justify' }}>
                    Yo, <strong>{deudor.nombreCompleto || '___________________'}</strong>,
                    identificado(a) con {deudor.tipoDocumento || '___'} No.{' '}
                    <strong>{deudor.numeroDocumento || '___________________'}</strong>, residente en{' '}
                    <strong>{deudor.ciudadResidencia || '___________________'}</strong>, me comprometo
                    a pagar incondicionalmente y a la orden de{' '}
                    <strong>{acreedor.nombreCompleto || '___________________'}</strong>,
                    identificado(a) con {acreedor.tipoDocumento || '___'} No.{' '}
                    <strong>{acreedor.numeroDocumento || '___________________'}</strong>, la suma de{' '}
                    <strong>{valorCOP}</strong>{' '}
                    (<em>{valorLetras} PESOS M/L</em>).
                </p>

                {/* ── PAYMENT CONDITIONS ── */}
                <div
                    style={{
                        border: '1px dashed #94a3b8',
                        borderRadius: '4px',
                        padding: '10px 14px',
                        marginBottom: '14px',
                        backgroundColor: '#fafafa',
                    }}
                >
                    <div
                        style={{
                            fontSize: '8.5px',
                            fontWeight: 700,
                            color: '#1b3070',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '6px',
                        }}
                    >
                        Condiciones de Pago
                    </div>
                    {obligacion.modalidadPago === 'unico' && (
                        <p style={{ marginBottom: '6px' }}>
                            Pago único: a más tardar el{' '}
                            <strong>
                                {obligacion.fechaVencimiento
                                    ? formatDate(obligacion.fechaVencimiento)
                                    : '___________________'}
                            </strong>
                            .
                        </p>
                    )}
                    {obligacion.modalidadPago === 'cuotas' &&
                        obligacion.numeroCuotas &&
                        obligacion.periodoCuotas && (
                            <p style={{ marginBottom: '6px' }}>
                                En <strong>{obligacion.numeroCuotas}</strong> cuotas{' '}
                                <strong>
                                    {PERIODO_LABELS[obligacion.periodoCuotas] ||
                                        obligacion.periodoCuotas}
                                </strong>{' '}
                                iguales y consecutivas, a partir del mes siguiente a la fecha de
                                suscripción.
                            </p>
                        )}
                    {!obligacion.modalidadPago && (
                        <p style={{ color: '#94a3b8', marginBottom: '6px' }}>
                            Condiciones de pago por definir.
                        </p>
                    )}
                    <div style={{ fontSize: '10px', marginTop: '4px' }}>
                        <span style={{ color: '#64748b' }}>Intereses de mora: </span>
                        <strong>{moraTxt}</strong>
                    </div>
                </div>

                {/* ── CLAUSES ── */}
                <div style={{ marginBottom: '16px' }}>
                    <div
                        style={{
                            fontSize: '8.5px',
                            fontWeight: 700,
                            color: '#1b3070',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '8px',
                        }}
                    >
                        Cláusulas
                    </div>
                    <p style={{ marginBottom: '6px', textAlign: 'justify' }}>
                        <strong>PRIMERA.</strong> El presente pagaré presta mérito ejecutivo y es
                        exigible conforme a los artículos 621 y siguientes del Código de Comercio de
                        Colombia. El deudor renuncia expresamente al proceso ordinario y se somete al
                        proceso ejecutivo para su cobro.
                    </p>
                    <p style={{ marginBottom: '6px', textAlign: 'justify' }}>
                        <strong>SEGUNDA.</strong> En caso de mora en el pago, el deudor reconocerá
                        intereses moratorios a la tasa de <strong>{moraTxt}</strong>, sin perjuicio
                        del cobro de honorarios de cobranza y costas judiciales a que haya lugar.
                    </p>
                    <p style={{ marginBottom: '6px', textAlign: 'justify' }}>
                        <strong>TERCERA.</strong> El presente pagaré es transferible por endoso,
                        conforme a las normas que regulan los títulos valores en Colombia, sin que sea
                        necesario el consentimiento del deudor para su negociación.
                    </p>
                    <p style={{ textAlign: 'justify' }}>
                        <strong>CUARTA.</strong> Para todos los efectos legales derivados del
                        presente título valor, las partes señalan como domicilio contractual la ciudad
                        de{' '}
                        <strong>{obligacion.ciudadSuscripcion || '___________________'}</strong> y se
                        someten a la jurisdicción de sus jueces competentes.
                    </p>
                </div>

                <hr
                    style={{
                        border: 'none',
                        borderTop: '1px solid #e2e8f0',
                        marginBottom: '24px',
                    }}
                />

                {/* ── SIGNATURES ── */}
                <div
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}
                >
                    <div>
                        <div
                            style={{
                                height: '56px',
                                borderBottom: '1px solid #334155',
                                marginBottom: '8px',
                            }}
                        />
                        <p style={{ fontWeight: 700 }}>
                            {deudor.nombreCompleto || '___________________'}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>
                            DEUDOR · {deudor.tipoDocumento || '___'} {deudor.numeroDocumento || '___'}
                        </p>
                        {deudor.email && (
                            <p style={{ color: '#64748b', fontSize: '10px' }}>{deudor.email}</p>
                        )}
                    </div>
                    <div>
                        <div
                            style={{
                                height: '56px',
                                borderBottom: '1px solid #334155',
                                marginBottom: '8px',
                            }}
                        />
                        <p style={{ fontWeight: 700 }}>
                            {acreedor.nombreCompleto || '___________________'}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>
                            ACREEDOR · {acreedor.tipoDocumento || '___'}{' '}
                            {acreedor.numeroDocumento || '___'}
                        </p>
                        {acreedor.email && (
                            <p style={{ color: '#64748b', fontSize: '10px' }}>{acreedor.email}</p>
                        )}
                    </div>
                </div>

                {/* ── FREE FOOTER ── */}
                {isFree && (
                    <div
                        style={{
                            marginTop: '24px',
                            padding: '10px 14px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '9px',
                            color: '#94a3b8',
                            textAlign: 'center',
                        }}
                    >
                        Documento generado con{' '}
                        <strong style={{ color: '#64748b' }}>Lexia</strong> (plan gratuito).
                        Actualiza tu plan en <strong style={{ color: '#64748b' }}>lexia.co</strong>{' '}
                        para eliminar esta marca de agua y agregar tu logo personalizado.
                    </div>
                )}
            </div>
        </div>
    );
}
