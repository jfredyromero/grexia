import type { APIRoute } from 'astro';
import type { PagoData } from '../estado';

export const prerender = false;

const CALENDLY_URL = import.meta.env.CALENDLY_URL as string;

type MaskedData = { ok: boolean; calendarUrl?: string; pago: PagoData; redimido: false };

export interface ReferenciaResponse {
    x_ref_payco: string | null;
    masked: MaskedData | null;
}

function buildPagoFromEpayco(d: Record<string, unknown>): { ok: boolean; pago: PagoData } {
    const ok = d.x_transaction_state === 'Aceptada';

    const fixEncoding = (str: string) => {
        try {
            return decodeURIComponent(escape(str));
        } catch {
            return str;
        }
    };

    const FRANQUICIAS: Record<string, string> = {
        VS: 'Visa',
        MC: 'Mastercard',
        AM: 'American Express',
        DN: 'Diners Club',
        PSE: 'PSE',
    };

    const pago: PagoData = {
        estado: (d.x_transaction_state as string) ?? 'desconocido',
        nombre: ([d.x_customer_name, d.x_customer_lastname] as string[]).filter(Boolean).join(' '),
        email: (d.x_customer_email as string) ?? '',
        telefono: (d.x_extra1 as string) ?? '',
        monto: (d.x_amount as number) ?? 0,
        moneda: (d.x_currency_code as string) ?? 'COP',
        fecha: (d.x_fecha_transaccion as string) ?? '',
        banco: d.x_bank_name !== 'N/A' ? ((d.x_bank_name as string) ?? '') : '',
        tarjeta: d.x_cardnumber !== '*******' ? ((d.x_cardnumber as string) ?? '') : '',
        franquicia: FRANQUICIAS[d.x_franchise as string] ?? (d.x_franchise as string) ?? '',
        tipoPago: (d.x_type_payment as string) ?? '',
        cuotas: d.x_quotas && d.x_quotas !== '0' && d.x_quotas !== '' ? (d.x_quotas as string) : '',
        transactionId: (d.x_transaction_id as string) ?? '',
        descripcion: fixEncoding((d.x_description as string) ?? ''),
        codigoAprobacion: (d.x_approval_code as string) ?? '',
        motivoRechazo: !ok ? fixEncoding((d.x_response_reason_text as string) ?? '') : '',
        tipoDocumento: (d.x_extra2 as string) ?? '',
        numeroDocumento: (d.x_extra3 as string) ?? '',
        direccion: (d.x_extra4 as string) ?? '',
    };

    return { ok, pago };
}

export async function handleGet(
    hash: string,
    deps: { fetcher?: typeof fetch; calendarUrl?: string } = {}
): Promise<Response> {
    const fetcher = deps.fetcher ?? fetch;
    const calendarUrl = deps.calendarUrl ?? CALENDLY_URL;

    if (!hash) {
        return new Response(JSON.stringify({ error: 'hash requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const res = await fetcher(`https://secure.epayco.co/validation/v1/reference/${hash}`);
        if (!res.ok) {
            return new Response(JSON.stringify({ error: 'ePayco no disponible' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const json = await res.json();
        const d = (json?.data ?? {}) as Record<string, unknown>;
        const xRefPayco: string = (d.x_ref_payco as string) ?? '';

        if (!xRefPayco) {
            return new Response(JSON.stringify({ error: 'no-encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { ok, pago } = buildPagoFromEpayco(d);
        const masked: MaskedData = {
            ok,
            pago,
            redimido: false,
            ...(ok ? { calendarUrl } : {}),
        };

        return new Response(JSON.stringify({ x_ref_payco: xRefPayco, masked }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch {
        return new Response(JSON.stringify({ error: 'ePayco no disponible' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export const GET: APIRoute = ({ params }) => handleGet(params.hash ?? '', {});
