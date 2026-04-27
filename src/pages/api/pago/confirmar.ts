import type { APIRoute } from 'astro';
import { getSupabase } from '../../../services/supabase';
import type { PagoData } from './estado';

export const prerender = false;

// ── validateEpaycoSignature ──────────────────────────────────────────────────

interface SignatureFields {
    p_cust_id_cliente: string;
    p_key: string;
    x_ref_payco: string;
    x_transaction_id: string;
    x_amount: string;
    x_currency_code: string;
}

export async function validateEpaycoSignature(fields: SignatureFields, x_signature: string): Promise<boolean> {
    const { p_cust_id_cliente, p_key, x_ref_payco, x_transaction_id, x_amount, x_currency_code } = fields;

    // Any missing/falsy field → invalid
    if (!p_cust_id_cliente || !p_key || !x_ref_payco || !x_transaction_id || !x_amount || !x_currency_code) {
        return false;
    }

    if (!x_signature) return false;

    const concat = `${p_cust_id_cliente}^${p_key}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`;
    const encoded = new TextEncoder().encode(concat);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computed = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Timing-safe comparison via XOR accumulator — no early return
    if (computed.length !== x_signature.length) return false;
    let diff = 0;
    for (let i = 0; i < computed.length; i++) {
        diff |= computed.charCodeAt(i) ^ x_signature.charCodeAt(i);
    }
    return diff === 0;
}

// ── validateResumenCaso ──────────────────────────────────────────────────────

export function validateResumenCaso(body: unknown): { ref_payco: string; resumen_caso: string } | null {
    if (typeof body !== 'object' || body === null) return null;
    const b = body as Record<string, unknown>;
    const ref_payco = b['ref_payco'];
    const resumen_caso = b['resumen_caso'];

    if (typeof ref_payco !== 'string' || ref_payco.trim() === '') return null;
    if (typeof resumen_caso !== 'string') return null;
    if (resumen_caso.length > 5000) return null;

    return { ref_payco: ref_payco.trim(), resumen_caso };
}

// ── TransaccionRow type ──────────────────────────────────────────────────────

export interface TransaccionRow {
    ref_payco: string;
    transaction_id: string | null;
    estado: string;
    codigo_aprobacion: string | null;
    motivo_rechazo: string | null;
    nombre: string | null;
    email: string | null;
    telefono: string | null;
    monto: number | null;
    moneda: string;
    franquicia: string | null;
    tipo_pago: string | null;
    banco: string | null;
    tarjeta: string | null;
    cuotas: string | null;
    descripcion: string | null;
    fecha_transaccion: string | null;
}

// ── mapTransaccionToResponse ─────────────────────────────────────────────────

export function mapTransaccionToResponse(
    row: TransaccionRow,
    calendarUrl: string
): { ok: boolean; calendarUrl?: string; pago: PagoData } {
    const ok = row.estado === 'Aceptada';

    const FRANQUICIAS: Record<string, string> = {
        VS: 'Visa',
        MC: 'Mastercard',
        AM: 'American Express',
        DN: 'Diners Club',
        PSE: 'PSE',
    };

    const pago: PagoData = {
        estado: row.estado,
        nombre: row.nombre ?? '',
        email: row.email ?? '',
        telefono: row.telefono ?? '',
        monto: row.monto ?? 0,
        moneda: row.moneda,
        fecha: row.fecha_transaccion ?? '',
        banco: row.banco ?? '',
        tarjeta: row.tarjeta ?? '',
        franquicia: FRANQUICIAS[row.franquicia ?? ''] ?? row.franquicia ?? '',
        tipoPago: row.tipo_pago ?? '',
        cuotas: row.cuotas ?? '',
        transactionId: row.transaction_id ?? '',
        descripcion: row.descripcion ?? '',
        codigoAprobacion: row.codigo_aprobacion ?? '',
        motivoRechazo: !ok ? (row.motivo_rechazo ?? '') : '',
    };

    if (ok) {
        return { ok: true, calendarUrl, pago };
    }
    return { ok: false, pago };
}

// ── POST webhook handler ─────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
    const text = await request.text();
    const params = new URLSearchParams(text);

    const p_cust_id_cliente = import.meta.env.EPAYCO_P_CUST_ID as string;
    const p_key = import.meta.env.EPAYCO_P_KEY as string;

    const x_ref_payco = params.get('x_ref_payco') ?? '';
    const x_transaction_id = params.get('x_transaction_id') ?? '';
    const x_amount = params.get('x_amount') ?? '';
    const x_currency_code = params.get('x_currency_code') ?? '';
    const x_signature = params.get('x_signature') ?? '';

    const valid = await validateEpaycoSignature(
        { p_cust_id_cliente, p_key, x_ref_payco, x_transaction_id, x_amount, x_currency_code },
        x_signature
    );

    if (!valid) {
        console.warn('[ePayco webhook] firma inválida — ref:', x_ref_payco);
        return new Response(null, { status: 200 });
    }

    try {
        const db = getSupabase();
        await db.from('transacciones').upsert(
            {
                ref_payco: x_ref_payco,
                transaction_id: params.get('x_transaction_id'),
                estado: params.get('x_transaction_state') ?? 'desconocido',
                nombre: [params.get('x_customer_name'), params.get('x_customer_lastname')].filter(Boolean).join(' '),
                email: params.get('x_customer_email'),
                telefono: params.get('x_extra1'),
                monto: parseFloat(params.get('x_amount') ?? '0'),
                moneda: params.get('x_currency_code') ?? 'COP',
                franquicia: params.get('x_franchise'),
                tipo_pago: params.get('x_type_payment'),
                banco: params.get('x_bank_name') !== 'N/A' ? params.get('x_bank_name') : null,
                tarjeta: params.get('x_cardnumber') !== '*******' ? params.get('x_cardnumber') : null,
                cuotas: params.get('x_quotas') !== '0' ? params.get('x_quotas') : null,
                descripcion: params.get('x_description'),
                codigo_aprobacion: params.get('x_approval_code'),
                motivo_rechazo:
                    params.get('x_transaction_state') !== 'Aceptada' ? params.get('x_response_reason_text') : null,
                fecha_transaccion: params.get('x_fecha_transaccion')
                    ? new Date(params.get('x_fecha_transaccion')!).toISOString()
                    : null,
                raw: Object.fromEntries(params.entries()),
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'ref_payco' }
        );
    } catch (err) {
        console.error('[ePayco webhook] error al guardar transacción:', err);
    }

    return new Response(null, { status: 200 });
};

// ── PATCH handler ────────────────────────────────────────────────────────────

export const PATCH: APIRoute = async ({ request }) => {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'JSON inválido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const validated = validateResumenCaso(body);
    if (!validated) {
        return new Response(JSON.stringify({ error: 'Datos inválidos' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const db = getSupabase();
    const { data, error } = await db
        .from('transacciones')
        .select('id, estado')
        .eq('ref_payco', validated.ref_payco)
        .single();

    if (error || !data) {
        return new Response(JSON.stringify({ error: 'Transacción no encontrada' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (data.estado !== 'Aceptada') {
        return new Response(JSON.stringify({ error: 'El pago no fue aceptado' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    await db
        .from('transacciones')
        .update({ resumen_caso: validated.resumen_caso, updated_at: new Date().toISOString() })
        .eq('ref_payco', validated.ref_payco);

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
