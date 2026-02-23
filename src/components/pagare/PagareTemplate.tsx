import type { PagareFormData, PlanTier } from './types';
import { formatCOP, formatDate, numberToWordsCOP } from './pagareUtils';

interface PagareTemplateProps {
    formData: PagareFormData;
    plan: PlanTier;
    logoUrl?: string;
}

export default function PagareTemplate({ formData, plan, logoUrl }: PagareTemplateProps) {
    const { acreedor, deudor, obligacion } = formData;
    const showWatermark = plan === 'free';

    const valorNum = parseInt(obligacion.valorPrincipal.replace(/\D/g, ''), 10) || 0;
    const valorCOP = formatCOP(obligacion.valorPrincipal);
    const valorLetras = valorNum > 0 ? numberToWordsCOP(valorNum) : '___________________';

    const periodoLabel: Record<string, string> = {
        mensual: 'mensuales',
        bimestral: 'bimestrales',
        trimestral: 'trimestrales',
    };

    const moraTxt = obligacion.tasaInteresMora
        ? `${obligacion.tasaInteresMora}% mensual`
        : 'la tasa máxima legal vigente certificada por la Superintendencia Financiera de Colombia';

    return (
        <div
            className="relative bg-white text-slate-900 font-serif"
            style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '12px', lineHeight: '1.6' }}
        >
            {/* Watermark */}
            {showWatermark && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                        fontSize: '64px',
                        fontWeight: 900,
                        color: 'rgba(27,48,112,0.07)',
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
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        {logoUrl && plan !== 'free' ? (
                            <img src={logoUrl} alt="Logo" style={{ height: '48px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ fontSize: '20px', fontWeight: 900, color: '#1b3070', letterSpacing: '-0.5px' }}>
                                LEXIA
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#1b3070' }}>
                            PAGARÉ
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                            Título Valor · Código de Comercio colombiano
                        </div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '2px solid #1b3070', marginBottom: '24px' }} />

                {/* City & Date */}
                <p style={{ marginBottom: '20px' }}>
                    En <strong>{obligacion.ciudadSuscripcion || '___________________'}</strong>, el{' '}
                    <strong>{obligacion.fechaSuscripcion ? formatDate(obligacion.fechaSuscripcion) : '___________________'}</strong>.
                </p>

                {/* Obligation paragraph */}
                <p style={{ marginBottom: '16px', textAlign: 'justify' }}>
                    Yo, <strong>{deudor.nombreCompleto || '___________________'}</strong>, identificado(a) con{' '}
                    {deudor.tipoDocumento || '___'} No.{' '}
                    <strong>{deudor.numeroDocumento || '___________________'}</strong>, residente en{' '}
                    <strong>{deudor.ciudadResidencia || '___________________'}</strong>{deudor.telefono ? `, teléfono ${deudor.telefono}` : ''},
                    me comprometo a pagar incondicionalmente a la orden de{' '}
                    <strong>{acreedor.nombreCompleto || '___________________'}</strong>, identificado(a) con{' '}
                    {acreedor.tipoDocumento || '___'} No.{' '}
                    <strong>{acreedor.numeroDocumento || '___________________'}</strong>{acreedor.telefono ? `, teléfono ${acreedor.telefono}` : ''},
                    la suma de{' '}
                    <strong>{valorCOP}</strong> ({valorLetras}).
                </p>

                {/* Payment terms */}
                <p style={{ marginBottom: '16px', textAlign: 'justify' }}>
                    {obligacion.modalidadPago === 'unico' && (
                        <>
                            El pago se realizará en su totalidad a más tardar el{' '}
                            <strong>
                                {obligacion.fechaVencimiento
                                    ? formatDate(obligacion.fechaVencimiento)
                                    : '___________________'}
                            </strong>.
                        </>
                    )}
                    {obligacion.modalidadPago === 'cuotas' && obligacion.numeroCuotas && obligacion.periodoCuotas && (
                        <>
                            El pago se realizará en <strong>{obligacion.numeroCuotas}</strong> cuotas{' '}
                            {periodoLabel[obligacion.periodoCuotas] || obligacion.periodoCuotas} iguales y consecutivas, a partir del mes siguiente a la fecha de suscripción del presente documento.
                        </>
                    )}
                    {!obligacion.modalidadPago && (
                        <>
                            Las condiciones de pago se determinarán conforme a lo acordado entre las partes.
                        </>
                    )}
                </p>

                {/* Mora clause */}
                <p style={{ marginBottom: '16px', textAlign: 'justify' }}>
                    En caso de mora en el pago, el deudor reconocerá intereses moratorios a la tasa de{' '}
                    <strong>{moraTxt}</strong>, sin perjuicio del cobro de honorarios de cobranza y costas judiciales a que haya lugar.
                </p>

                {/* Transfer clause */}
                <p style={{ marginBottom: '16px', textAlign: 'justify' }}>
                    El presente pagaré es transferible por endoso y presta mérito ejecutivo conforme a los artículos 621 y siguientes del Código de Comercio de Colombia. El deudor renuncia a los trámites del proceso ordinario y se somete al proceso ejecutivo para su cobro.
                </p>

                {/* Legal note */}
                <p style={{ marginBottom: '32px', textAlign: 'justify' }}>
                    Para todos los efectos legales derivados del presente título valor, las partes señalan como domicilio contractual la ciudad de{' '}
                    <strong>{obligacion.ciudadSuscripcion || '___________________'}</strong>.
                </p>

                {/* Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '48px' }}>
                    <div>
                        <div style={{ borderTop: '1px solid #334155', paddingTop: '8px' }}>
                            <p style={{ fontWeight: 700 }}>
                                {acreedor.nombreCompleto || '___________________'}
                            </p>
                            <p style={{ color: '#64748b', marginTop: '2px' }}>
                                Acreedor · {acreedor.tipoDocumento || '___'} {acreedor.numeroDocumento || '___'}
                            </p>
                            {acreedor.email && (
                                <p style={{ color: '#64748b', fontSize: '11px' }}>{acreedor.email}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <div style={{ borderTop: '1px solid #334155', paddingTop: '8px' }}>
                            <p style={{ fontWeight: 700 }}>
                                {deudor.nombreCompleto || '___________________'}
                            </p>
                            <p style={{ color: '#64748b', marginTop: '2px' }}>
                                Deudor · {deudor.tipoDocumento || '___'} {deudor.numeroDocumento || '___'}
                            </p>
                            {deudor.email && (
                                <p style={{ color: '#64748b', fontSize: '11px' }}>{deudor.email}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {showWatermark && (
                    <div style={{ marginTop: '32px', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>
                        Documento generado con Lexia (plan gratuito). Actualiza tu plan en lexia.co para eliminar esta marca de agua.
                    </div>
                )}
            </div>
        </div>
    );
}
