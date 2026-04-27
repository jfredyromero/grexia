import { useState, useEffect } from 'react';
import type { PagoData } from '../../pages/api/pago/estado';

declare global {
    interface Window {
        Calendly?: {
            initPopupWidget: (options: { url: string }) => void;
        };
    }
}

const WHATSAPP_URL = 'https://wa.me/573014822371?text=Hola%2C+tuve+un+problema+con+mi+pago+de+asesor%C3%ADa';
const BASE = import.meta.env.BASE_URL;
const CHECKOUT_URL = `${BASE}asesoria/checkout`;

const NA_VALUES = new Set(['na', 'n/a', 'na na', 'n.a.', '-']);

function formatMonto(monto: number, moneda: string) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: moneda,
        maximumFractionDigits: 0,
    }).format(monto);
}

function formatFecha(fecha: string) {
    if (!fecha) return '';
    const d = new Date(fecha.replace(' ', 'T'));
    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'America/Bogota',
    }).format(d);
}

function esValorValido(v: string | undefined | null): boolean {
    return !!v && !NA_VALUES.has(v.trim().toLowerCase());
}

type PageEstado =
    | { tipo: 'loading' }
    | { tipo: 'exito'; calendarUrl: string; pago?: PagoData }
    | { tipo: 'fallido'; motivo: string; pago?: PagoData }
    | { tipo: 'error' };

export default function Confirmacion() {
    const [estado, setEstado] = useState<PageEstado>(() => {
        const ref = new URLSearchParams(window.location.search).get('ref_payco');
        return ref ? { tipo: 'loading' } : { tipo: 'fallido', motivo: 'sin-ref' };
    });
    const [agendado, setAgendado] = useState(() => {
        const ref = new URLSearchParams(window.location.search).get('ref_payco');
        return ref ? !!localStorage.getItem(`booked_${ref}`) : false;
    });

    useEffect(() => {
        const ref = new URLSearchParams(window.location.search).get('ref_payco');
        if (!ref) return;

        fetch(`/api/pago/estado?ref=${ref}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.ok && data.calendarUrl) {
                    document.title = '¡Pago exitoso! · Grexia';
                    setEstado({ tipo: 'exito', calendarUrl: data.calendarUrl, pago: data.pago });

                    const notas = localStorage.getItem('grexia_checkout_notes');
                    if (notas?.trim() && ref) {
                        fetch('/api/pago/confirmar', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ref_payco: ref, resumen_caso: notas.trim() }),
                        }).catch(() => {});
                    }
                } else {
                    setEstado({
                        tipo: 'fallido',
                        motivo: data.pago?.estado ?? 'desconocido',
                        pago: data.pago,
                    });
                }
            })
            .catch(() => setEstado({ tipo: 'error' }));

        const handleMessage = (e: MessageEvent) => {
            if (e.data?.event === 'calendly.event_scheduled') {
                localStorage.setItem(`booked_${ref}`, '1');
                setAgendado(true);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    function handleAgendar(calendlyUrl: string) {
        window.Calendly?.initPopupWidget({ url: calendlyUrl });
    }

    // ── Loading ──────────────────────────────────────────────────────────────
    if (estado.tipo === 'loading') {
        return (
            <div
                data-testid="confirmacion-loading"
                className="flex items-center justify-center min-h-[calc(100vh-4rem)]"
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
                    <p className="text-sm text-slate-500">Verificando tu pago...</p>
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (estado.tipo === 'error') {
        return (
            <div
                data-testid="confirmacion-error"
                className="flex items-center justify-center min-h-[calc(100vh-4rem)]"
            >
                <div className="mx-auto max-w-md w-full px-6 flex flex-col items-center gap-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                        <span
                            className="material-symbols-outlined text-red-500 text-[48px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            error
                        </span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-secondary">Error de conexión</h1>
                        <p className="mt-2 text-slate-500 leading-relaxed">
                            No pudimos verificar tu pago. Por favor recarga la página o contáctanos.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            data-testid="btn-reintentar"
                            onClick={() => window.location.reload()}
                            className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover"
                        >
                            Reintentar
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                        </button>
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-full bg-green-600 text-sm font-bold text-white transition-all hover:bg-green-700"
                        >
                            Contactar soporte
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // ── Fallido ──────────────────────────────────────────────────────────────
    if (estado.tipo === 'fallido') {
        const filas =
            estado.pago && estado.pago.monto > 0
                ? [
                      { label: 'Nombre', value: estado.pago.nombre },
                      { label: 'Correo', value: estado.pago.email },
                      { label: 'Monto', value: formatMonto(estado.pago.monto, estado.pago.moneda) },
                      { label: 'Fecha', value: formatFecha(estado.pago.fecha) },
                      { label: 'Medio de pago', value: estado.pago.franquicia },
                      { label: 'Estado', value: estado.pago.estado },
                      { label: 'Motivo', value: estado.pago.motivoRechazo },
                      { label: 'ID transacción', value: estado.pago.transactionId },
                  ].filter((f) => esValorValido(f.value))
                : [];

        return (
            <div
                data-testid="confirmacion-fallido"
                className="mx-auto max-w-5xl w-full px-6 py-12 lg:py-20 lg:grid lg:grid-cols-5 lg:gap-12 lg:items-center flex flex-col gap-8"
            >
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100">
                            <span
                                className="material-symbols-outlined text-amber-500 text-[32px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                warning
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-secondary">Pago no completado</h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {estado.motivo === 'sin-ref'
                                    ? 'Accediste a esta página sin completar el pago.'
                                    : estado.motivo === 'Pendiente'
                                      ? 'Tu pago está pendiente de confirmación.'
                                      : estado.pago?.motivoRechazo
                                        ? estado.pago.motivoRechazo
                                        : `El pago fue ${estado.motivo.toLowerCase()}. No se realizó ningún cobro.`}
                            </p>
                        </div>
                    </div>

                    {filas.length > 0 && (
                        <div className="rounded-lg py-2 bg-white border border-slate-200 shadow-sm divide-y divide-slate-100">
                            {filas.map((f) => (
                                <div
                                    key={f.label}
                                    className="flex justify-between gap-4 px-5 py-3 text-sm"
                                >
                                    <span className="text-slate-500 shrink-0">{f.label}</span>
                                    <span className="text-secondary font-medium text-right">{f.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 lg:sticky lg:top-28 flex flex-col gap-4">
                    {estado.motivo === 'Pendiente' && (
                        <button
                            onClick={() => window.location.reload()}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover"
                        >
                            Verificar nuevamente
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                        </button>
                    )}
                    <a
                        data-testid="btn-soporte"
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-green-600 text-sm font-bold text-white transition-all hover:bg-green-700"
                    >
                        Contactar soporte
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                    </a>
                    <a
                        href={CHECKOUT_URL}
                        className="flex h-14 w-full items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                    >
                        Intentar de nuevo
                    </a>
                </div>
            </div>
        );
    }

    // ── Éxito ────────────────────────────────────────────────────────────────
    const p = estado.pago;
    const esPSE = p?.tipoPago === 'pse';
    const filasExito = p
        ? [
              { label: 'Nombre', value: p.nombre },
              { label: 'Correo', value: p.email },
              { label: 'Descripción', value: p.descripcion },
              { label: 'Monto', value: formatMonto(p.monto, p.moneda) },
              { label: 'Fecha', value: formatFecha(p.fecha) },
              { label: 'Medio de pago', value: p.franquicia },
              ...(!esPSE
                  ? [
                        { label: 'Banco', value: p.banco },
                        { label: 'Tarjeta', value: p.tarjeta },
                        { label: 'Cuotas', value: p.cuotas },
                    ]
                  : []),
              { label: 'Aprobación', value: p.codigoAprobacion },
              { label: 'ID transacción', value: p.transactionId },
          ].filter((f) => esValorValido(f.value))
        : [];

    return (
        <div
            data-testid="confirmacion-exito"
            className="mx-auto max-w-5xl w-full px-6 py-12 lg:py-20 flex flex-col gap-6"
        >
            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span
                        className="material-symbols-outlined text-primary text-[32px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        check_circle
                    </span>
                </div>
                <div>
                    <h1 className="text-2xl font-black text-secondary">¡Pago exitoso!</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {p?.nombre
                            ? `Hola ${p.nombre.split(' ')[0]}, tu sesión está confirmada.`
                            : 'Tu sesión de asesoría legal está confirmada.'}
                    </p>
                </div>
            </div>

            <div className="lg:grid lg:grid-cols-5 lg:gap-8 lg:items-start flex flex-col gap-6">
                {filasExito.length > 0 && (
                    <div className="lg:col-span-3 rounded-lg py-2 bg-white border border-slate-200 shadow-sm divide-y divide-slate-100">
                        {filasExito.map((f) => (
                            <div
                                key={f.label}
                                className="flex justify-between gap-4 px-5 py-3 text-sm"
                            >
                                <span className="text-slate-500 shrink-0">{f.label}</span>
                                <span className="text-secondary font-medium text-right">{f.value}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="lg:col-span-2 lg:sticky lg:top-28 flex flex-col gap-4">
                    <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
                        <h2 className="text-sm font-bold text-secondary uppercase tracking-wide">Próximos pasos</h2>
                        <ol className="flex flex-col gap-3">
                            {[
                                {
                                    icon: 'calendar_month',
                                    text: 'Elige la fecha y hora de tu sesión en el calendario.',
                                },
                                {
                                    icon: 'email',
                                    text: 'Recibirás un email de confirmación con el enlace de videollamada.',
                                },
                                {
                                    icon: 'video_call',
                                    text: 'Conéctate 5 minutos antes de la sesión.',
                                },
                            ].map((step, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3"
                                >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary mt-0.5">
                                        {i + 1}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                                            {step.icon}
                                        </span>
                                        {step.text}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <button
                        data-testid="btn-agendar"
                        data-calendly-url={estado.calendarUrl}
                        type="button"
                        onClick={() => handleAgendar(estado.calendarUrl)}
                        disabled={agendado}
                        className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white shadow-md shadow-primary/20 transition-all ${
                            agendado
                                ? 'bg-primary opacity-50 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary-hover hover:-translate-y-px cursor-pointer'
                        }`}
                    >
                        {agendado ? (
                            <>
                                Sesión agendada
                                <span
                                    className="material-symbols-outlined text-[18px]"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    check_circle
                                </span>
                            </>
                        ) : (
                            <>
                                Agendar fecha y hora
                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                            </>
                        )}
                    </button>

                    <a
                        href={BASE}
                        className="flex h-14 w-full items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                    >
                        Volver al inicio
                    </a>

                    {p?.email && (
                        <p className="text-xs text-center text-slate-400 px-2">
                            Enviamos los detalles a <strong className="text-slate-500">{p.email}</strong>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
