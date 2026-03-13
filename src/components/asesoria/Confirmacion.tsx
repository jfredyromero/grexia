import { useState, useEffect } from 'react';

type Estado =
    | { tipo: 'cargando' }
    | { tipo: 'exito'; calendarUrl: string }
    | { tipo: 'fallido'; reason: string }
    | { tipo: 'error' };

const WHATSAPP_URL = 'https://wa.me/573000000000?text=Hola%2C+tuve+un+problema+verificando+mi+pago+de+asesor%C3%ADa';

export default function Confirmacion() {
    const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref_payco');

        if (!ref) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEstado({ tipo: 'fallido', reason: 'Sin referencia de pago' });
            return;
        }

        fetch(`/api/pago/estado?ref=${encodeURIComponent(ref)}`)
            .then((res) => res.json())
            .then((data: { ok: boolean; calendarUrl?: string; reason?: string; error?: string }) => {
                if (data.ok && data.calendarUrl) {
                    setEstado({ tipo: 'exito', calendarUrl: data.calendarUrl });
                } else {
                    setEstado({ tipo: 'fallido', reason: data.reason ?? data.error ?? 'No verificado' });
                }
            })
            .catch(() => {
                setEstado({ tipo: 'error' });
            });
    }, []);

    if (estado.tipo === 'cargando') {
        return (
            <div
                className="flex flex-col sm:flex-row gap-3 w-full items-center justify-center py-4"
                data-testid="confirmacion-loading"
            >
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm text-slate-500">Verificando tu pago…</span>
            </div>
        );
    }

    if (estado.tipo === 'exito') {
        return (
            <div
                className="flex flex-col sm:flex-row gap-3 w-full"
                data-testid="confirmacion-exito"
            >
                <a
                    href={estado.calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="btn-agendar"
                    className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover hover:-translate-y-px"
                >
                    Agendar fecha y hora
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </a>
                <a
                    href="/"
                    className="flex h-12 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                >
                    Volver al inicio
                </a>
            </div>
        );
    }

    if (estado.tipo === 'fallido') {
        return (
            <div
                className="flex flex-col gap-4 w-full"
                data-testid="confirmacion-fallido"
            >
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
                    <p className="font-semibold">No pudimos verificar tu pago</p>
                    <p className="mt-1 text-amber-700">
                        {estado.reason === 'Sin referencia de pago'
                            ? 'Accediste a esta página sin completar el pago.'
                            : `Estado del pago: ${estado.reason}`}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="btn-soporte"
                        className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-green-600 text-sm font-bold text-white transition-all hover:bg-green-700"
                    >
                        Contactar soporte
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                    </a>
                    <a
                        href="/"
                        className="flex h-12 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                    >
                        Volver al inicio
                    </a>
                </div>
            </div>
        );
    }

    // tipo === 'error'
    return (
        <div
            className="flex flex-col gap-4 w-full"
            data-testid="confirmacion-error"
        >
            <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-800">
                <p className="font-semibold">Error de conexión</p>
                <p className="mt-1 text-red-700">
                    No pudimos conectarnos al servidor. Por favor recarga la página o contáctanos.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                    onClick={() => window.location.reload()}
                    data-testid="btn-reintentar"
                    className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover"
                >
                    Reintentar
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
                <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-green-600 text-sm font-bold text-white transition-all hover:bg-green-700"
                >
                    Contactar soporte
                </a>
            </div>
        </div>
    );
}
