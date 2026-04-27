import type { APIRoute } from 'astro';
import { getSupabase, type SupabaseLike } from '../../../services/supabase';
import { mapTransaccionToResponse } from './confirmar';

export const prerender = false;

const CALENDLY_URL = import.meta.env.CALENDLY_URL as string;

export interface PagoData {
    estado: string;
    nombre: string;
    email: string;
    telefono: string;
    monto: number;
    moneda: string;
    fecha: string;
    banco: string;
    tarjeta: string;
    franquicia: string;
    tipoPago: string;
    cuotas: string;
    transactionId: string;
    descripcion: string;
    codigoAprobacion: string;
    motivoRechazo: string;
    tipoDocumento: string;
    numeroDocumento: string;
    direccion: string;
}

type EstadoPayload = { ok: boolean; calendarUrl?: string; pago?: PagoData; redimido: boolean };

export async function verificarPago(
    ref: string,
    calendarUrl: string,
    deps: { fallback?: boolean; db?: SupabaseLike; fetcher?: typeof fetch } = {}
): Promise<EstadoPayload | null> {
    const db = deps.db ?? getSupabase();
    const fetcher = deps.fetcher ?? fetch;
    const fallback = deps.fallback ?? false;

    // 1. DB first
    try {
        const { data: row } = await db
            .from('transacciones')
            .select(
                'ref_payco, estado, nombre, email, telefono, monto, moneda, fecha_transaccion, banco, tarjeta, franquicia, tipo_pago, cuotas, descripcion, codigo_aprobacion, motivo_rechazo, transaction_id, redimido, tipo_documento, numero_documento, direccion'
            )
            .or(`ref_payco.eq.${ref},ref_hash.eq.${ref}`)
            .maybeSingle();

        if (row) {
            return mapTransaccionToResponse(row, calendarUrl);
        }
    } catch {
        console.warn('[estado] DB lookup failed for ref:', ref);
        if (!fallback) return null;
    }

    // 2. No row in DB — return null unless fallback requested
    if (!fallback) {
        return null;
    }

    // 3. Fallback to ePayco public API (no DB write)
    const res = await fetcher(`https://secure.epayco.co/validation/v1/reference/${ref}`);
    if (!res.ok) throw new Error('epayco_fetch_failed');
    const data = await res.json();
    const d = data.data ?? {};
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
        estado: d.x_transaction_state ?? 'desconocido',
        nombre: [d.x_customer_name, d.x_customer_lastname].filter(Boolean).join(' '),
        email: d.x_customer_email ?? '',
        telefono: d.x_extra1 ?? '',
        monto: d.x_amount ?? 0,
        moneda: d.x_currency_code ?? 'COP',
        fecha: d.x_fecha_transaccion ?? '',
        banco: d.x_bank_name !== 'N/A' ? (d.x_bank_name ?? '') : '',
        tarjeta: d.x_cardnumber !== '*******' ? (d.x_cardnumber ?? '') : '',
        franquicia: FRANQUICIAS[d.x_franchise] ?? d.x_franchise ?? '',
        tipoPago: d.x_type_payment ?? '',
        cuotas: d.x_quotas && d.x_quotas !== '0' && d.x_quotas !== '' ? d.x_quotas : '',
        transactionId: d.x_transaction_id ?? '',
        descripcion: fixEncoding(d.x_description ?? ''),
        codigoAprobacion: d.x_approval_code ?? '',
        motivoRechazo: !ok ? fixEncoding(d.x_response_reason_text ?? '') : '',
        tipoDocumento: d.x_extra2 ?? '',
        numeroDocumento: d.x_extra3 ?? '',
        direccion: d.x_extra4 ?? '',
    };

    return {
        ok,
        calendarUrl: ok ? calendarUrl : undefined,
        pago,
        redimido: false,
    };
}

export async function handleGet(url: URL, deps: { db?: SupabaseLike; fetcher?: typeof fetch } = {}): Promise<Response> {
    const ref = url.searchParams.get('ref');
    if (!ref) {
        return new Response(JSON.stringify({ error: 'ref requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const fallback = url.searchParams.get('fallback') === 'true';

    try {
        const result = await verificarPago(ref, CALENDLY_URL, { ...deps, fallback });
        if (!result) {
            return new Response('{}', {
                status: 202,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'No se pudo verificar el pago' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export const GET: APIRoute = async ({ url }) => handleGet(url);
