import { useState, useEffect, useRef } from 'react';
import type { PagoData } from '../../pages/api/pago/estado';
import { extractCalendlyEventId } from '../../pages/api/pago/confirmar';

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
const MAX_POLLS = 5;

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
    | { tipo: 'no-encontrado' }
    | { tipo: 'error' };

type EstadoPayload = { ok: boolean; calendarUrl?: string; pago?: PagoData; redimido?: boolean };

export default function Confirmacion() {
    const [estado, setEstado] = useState<PageEstado>(() => {
        const ref = new URLSearchParams(window.location.search).get('ref_payco');
        return ref ? { tipo: 'loading' } : { tipo: 'fallido', motivo: 'sin-ref' };
    });
    const [agendado, setAgendado] = useState(false);
    const [savedNotes] = useState(() => localStorage.getItem('grexia_checkout_notes') ?? '');

    const pollCount = useRef(0);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const refHash = new URLSearchParams(window.location.search).get('ref_payco') ?? '';
        if (!refHash) return;

        const xRefRef = { current: '' };

        function sendRegistroPatch(refPayco: string): void {
            if (localStorage.getItem('grexia_checkout_patch_done') !== 'false') return;
            const notas = localStorage.getItem('grexia_checkout_notes');
            const body: Record<string, unknown> = { ref_payco: refPayco, ref_hash: refHash };
            if (notas?.trim()) body.resumen_caso = notas.trim();
            fetch('/api/pago/confirmar', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
                .then((r) => {
                    if (r.ok) {
                        localStorage.removeItem('grexia_checkout_patch_done');
                        localStorage.removeItem('grexia_checkout_notes');
                        localStorage.removeItem('grexia_checkout_name');
                        localStorage.removeItem('grexia_checkout_email');
                        localStorage.removeItem('grexia_checkout_celular');
                        localStorage.removeItem('grexia_checkout_tipo_doc');
                        localStorage.removeItem('grexia_checkout_num_doc');
                        localStorage.removeItem('grexia_checkout_direccion');
                    }
                })
                .catch(() => {});
        }

        function resolve(data: EstadoPayload): void {
            if (data.redimido) setAgendado(true);
            if (data.ok && data.calendarUrl) {
                document.title = '¡Pago exitoso! · Grexia';
                setEstado({ tipo: 'exito', calendarUrl: data.calendarUrl, pago: data.pago });
            } else {
                setEstado({ tipo: 'fallido', motivo: data.pago?.estado ?? 'desconocido', pago: data.pago });
            }
        }

        function startPolling(xRefPayco: string, masked: EstadoPayload): void {
            pollIntervalRef.current = setInterval(() => {
                pollCount.current += 1;
                const isLast = pollCount.current >= MAX_POLLS;

                fetch(`/api/pago/estado/${xRefPayco}`)
                    .then(async (pollRes) => {
                        if (pollRes.status !== 202 || isLast) {
                            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

                            if (pollRes.status === 202) {
                                resolve(masked);
                            } else {
                                sendRegistroPatch(xRefPayco);
                                resolve(await pollRes.json());
                            }
                        }
                    })
                    .catch(() => {
                        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                        setEstado({ tipo: 'error' });
                    });
            }, 5000);
        }

        fetch(`/api/pago/referencia/${refHash}`)
            .then(async (res) => {
                if (res.status === 404) {
                    setEstado({ tipo: 'no-encontrado' });
                    return;
                }
                if (!res.ok) {
                    setEstado({ tipo: 'error' });
                    return;
                }
                const data = (await res.json()) as { x_ref_payco: string | null; masked: EstadoPayload | null };

                if (!data.x_ref_payco) {
                    setEstado({ tipo: 'no-encontrado' });
                    return;
                }

                const xRefPayco = data.x_ref_payco;
                const masked = data.masked!;
                xRefRef.current = xRefPayco;

                fetch(`/api/pago/estado/${xRefPayco}`)
                    .then(async (res) => {
                        if (res.status === 202) {
                            startPolling(xRefPayco, masked);
                        } else {
                            sendRegistroPatch(xRefPayco);
                            resolve(await res.json());
                        }
                    })
                    .catch(() => setEstado({ tipo: 'error' }));
            })
            .catch(() => setEstado({ tipo: 'error' }));

        const handleMessage = (e: MessageEvent) => {
            if (e.data?.event === 'calendly.event_scheduled') {
                setAgendado(true);
                const eventUri: string = (e.data?.payload?.event?.uri as string) ?? '';
                const calendlyEventId = extractCalendlyEventId(eventUri);
                fetch('/api/pago/confirmar', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ref_payco: xRefRef.current || refHash,
                        redimido: true,
                        ...(calendlyEventId ? { calendly_event_id: calendlyEventId } : {}),
                    }),
                }).catch(() => {});
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    function handleAgendar(calendlyUrl: string) {
        const pago = estado.tipo === 'exito' ? estado.pago : undefined;
        const qs = new URLSearchParams();
        if (pago?.nombre) qs.set('name', pago.nombre);
        if (pago?.email) qs.set('email', pago.email);
        if (savedNotes) qs.set('a1', savedNotes);
        const query = qs.toString();
        const url = query ? `${calendlyUrl}?${query}` : calendlyUrl;
        window.Calendly?.initPopupWidget({ url });
    }

    // ── Loading (cubre también el estado de polling) ───────────────────────────
    if (estado.tipo === 'loading') {
        return (
            <div
                data-testid="confirmacion-loading"
                className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-8"
            >
                <style>{`
                    @keyframes ldr-float {
                        0%, 100% { transform: rotate(2deg) translateY(0px); }
                        50%       { transform: rotate(3deg) translateY(-14px); }
                    }
                    @keyframes ldr-float-back {
                        0%, 100% { transform: rotate(-5deg) translateY(0px); }
                        50%       { transform: rotate(-6deg) translateY(-10px); }
                    }
                    @keyframes ldr-shimmer {
                        0%   { background-position: -400px 0; }
                        100% { background-position:  400px 0; }
                    }
                    @keyframes ldr-progress {
                        0%   { transform: translateX(-100%); }
                        100% { transform: translateX(600%); }
                    }
                    .ldr-card      { animation: ldr-float        3s ease-in-out         infinite; }
                    .ldr-card-back { animation: ldr-float-back   3s ease-in-out 0.15s   infinite; }
                    .ldr-line {
                        background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
                        background-size: 400px 100%;
                        animation: ldr-shimmer 1.6s ease-in-out infinite;
                    }
                    .ldr-progress { width: 18%; animation: ldr-progress 1.8s ease-in-out infinite; }
                `}</style>

                {/* px-10 pt-10 dan espacio a la rotación; pb-4 acerca el badge */}
                <div className="flex flex-col items-center gap-5 p-10">
                    {/* Documento flotando */}
                    <div className="relative w-56">
                        {/* Tarjeta trasera */}
                        <div className="ldr-card-back absolute inset-0 rounded-lg bg-primary/10" />

                        {/* Tarjeta principal */}
                        <div className="ldr-card relative z-10 rounded-lg bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                                <span
                                    className="text-xs font-black uppercase tracking-widest text-primary"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    Grexia
                                </span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                    PDF
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="ldr-line mb-1.5 h-2 w-3/4 rounded-full" />
                                <div className="ldr-line h-2 w-1/2 rounded-full" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="ldr-line h-1.5 w-full rounded-full" />
                                <div className="ldr-line h-1.5 w-full rounded-full" />
                                <div className="ldr-line h-1.5 w-4/5 rounded-full" />
                                <div className="ldr-line h-1.5 w-full rounded-full" />
                                <div className="ldr-line h-1.5 w-3/4 rounded-full" />
                                <div className="ldr-line h-1.5 w-full rounded-full" />
                            </div>

                            <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                                <div>
                                    <div className="ldr-line mb-1 h-1 w-16 rounded-full" />
                                    <div className="ldr-line h-1 w-12 rounded-full" />
                                </div>
                                <div>
                                    <div className="ldr-line mb-1 h-1 w-16 rounded-full" />
                                    <div className="ldr-line h-1 w-12 rounded-full" />
                                </div>
                            </div>

                            <div className="mt-3 flex justify-center">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
                                    grexia.co
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full space-y-4 flex flex-col items-center">
                        <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full ldr-progress"></div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-secondary mb-2">Verificando tu pago...</h2>
                            <div className="text-[11px] text-primary/50 font-semibold tracking-widest uppercase mt-4">
                                GREXIA.CO
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── No encontrado ────────────────────────────────────────────────────────
    if (estado.tipo === 'no-encontrado') {
        return (
            <div
                data-testid="confirmacion-no-encontrado"
                className="flex items-center justify-center min-h-[calc(100vh-4rem)]"
            >
                <div className="mx-auto max-w-md w-full px-6 flex flex-col items-center gap-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                        <span
                            className="material-symbols-outlined text-amber-500 text-[48px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            search_off
                        </span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-secondary">Referencia no encontrada</h1>
                        <p className="mt-2 text-slate-500 leading-relaxed">
                            No encontramos un pago asociado a este enlace. Verifica que el enlace sea correcto o
                            contáctanos.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-14 w-full items-center justify-center gap-1.5 rounded-full bg-green-600 text-sm font-bold text-white transition-all hover:bg-green-700"
                        >
                            Contactar soporte
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                        </a>
                        <a
                            href={CHECKOUT_URL}
                            className="flex h-14 w-full items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                        >
                            Ir al checkout
                        </a>
                    </div>
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
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            data-testid="btn-reintentar"
                            onClick={() => window.location.reload()}
                            className="flex h-14 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover"
                        >
                            Reintentar
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                        </button>
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-14 w-full items-center justify-center gap-1.5 rounded-full bg-green-600 text-sm font-bold text-white transition-all hover:bg-green-700"
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
