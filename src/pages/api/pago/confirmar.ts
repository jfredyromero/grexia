import type { APIRoute } from 'astro';
import { getSupabase, type SupabaseLike } from '../../../services/supabase';
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

export function validateResumenCaso(
    body: unknown
): { ref_payco: string; ref_hash: string; resumen_caso: string } | null {
    if (typeof body !== 'object' || body === null) return null;
    const b = body as Record<string, unknown>;
    const ref_payco = b['ref_payco'];
    const ref_hash = b['ref_hash'];
    const resumen_caso = b['resumen_caso'];

    if (typeof ref_payco !== 'string' || ref_payco.trim() === '') return null;
    if (typeof ref_hash !== 'string' || ref_hash.trim() === '') return null;
    if (typeof resumen_caso !== 'string') return null;

    return { ref_payco: ref_payco.trim(), ref_hash: ref_hash.trim(), resumen_caso };
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
    redimido: boolean;
    tipo_documento?: string | null;
    numero_documento?: string | null;
    direccion?: string | null;
}

// ── tryFixEncoding ───────────────────────────────────────────────────────────
// ePayco sends UTF-8 text but some gateways store it with Latin-1 mis-mapping.
// Re-interpret each char as a raw byte and decode as UTF-8 to recover accented chars.
function tryFixEncoding(s: string | null | undefined): string {
    if (!s) return '';
    if (!/[\xC0-\xFF]/.test(s)) return s;
    try {
        return new TextDecoder().decode(new Uint8Array([...s].map((c) => c.charCodeAt(0))));
    } catch {
        return s;
    }
}

// ── mapTransaccionToResponse ─────────────────────────────────────────────────

export function mapTransaccionToResponse(
    row: TransaccionRow,
    calendarUrl: string
): { ok: boolean; calendarUrl?: string; pago: PagoData; redimido: boolean } {
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
        descripcion: tryFixEncoding(row.descripcion),
        codigoAprobacion: row.codigo_aprobacion ?? '',
        motivoRechazo: !ok ? (row.motivo_rechazo ?? '') : '',
        tipoDocumento: row.tipo_documento ?? '',
        numeroDocumento: row.numero_documento ?? '',
        direccion: row.direccion ?? '',
    };

    if (ok) {
        return { ok: true, calendarUrl, pago, redimido: row.redimido };
    }
    return { ok: false, pago, redimido: row.redimido };
}

// ── extractCalendlyEventId ────────────────────────────────────────────────────

export function extractCalendlyEventId(uri: string): string | null {
    if (!uri) return null;
    const segments = uri.split('/');
    const id = segments[segments.length - 1];
    return id && id.length > 0 ? id : null;
}

// ── handlePost (testable core logic) ─────────────────────────────────────────

export async function handlePost(
    request: Request,
    deps: { db?: SupabaseLike; signatureValid?: boolean } = {}
): Promise<Response> {
    const text = await request.text();
    const params = new URLSearchParams(text);

    const x_ref_payco = params.get('x_ref_payco') ?? '';
    const x_transaction_id = params.get('x_transaction_id') ?? '';
    const x_amount = params.get('x_amount') ?? '';
    const x_currency_code = params.get('x_currency_code') ?? '';
    const x_signature = params.get('x_signature') ?? '';

    let valid: boolean;
    if (deps.signatureValid !== undefined) {
        valid = deps.signatureValid;
    } else {
        const p_cust_id_cliente = import.meta.env.EPAYCO_P_CUST_ID as string;
        const p_key = import.meta.env.EPAYCO_P_KEY as string;
        valid = await validateEpaycoSignature(
            { p_cust_id_cliente, p_key, x_ref_payco, x_transaction_id, x_amount, x_currency_code },
            x_signature
        );
        if (!valid) {
            console.warn('[ePayco webhook] firma inválida — ref:', x_ref_payco, {
                p_cust_id_cliente_set: !!p_cust_id_cliente,
                p_key_set: !!p_key,
                p_key_prefix: p_key ? p_key.slice(0, 6) + '…' : 'MISSING',
                x_ref_payco,
                x_transaction_id,
                x_amount,
                x_currency_code,
                x_signature_received: x_signature,
            });
        }
    }

    if (!valid) {
        return new Response(null, { status: 200 });
    }

    try {
        const db = deps.db ?? getSupabase();
        const { error } = await db.from('transacciones').upsert(
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
                tipo_documento: params.get('x_extra2') || null,
                numero_documento: params.get('x_extra3') || null,
                direccion: params.get('x_extra4') || null,
                es_prueba:
                    params.get('x_test_request') === '1' ||
                    (params.get('x_test_request') ?? '').toUpperCase() === 'TRUE',
                raw: Object.fromEntries(params.entries()),
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'ref_payco' }
        );
        if (error) {
            console.error('[ePayco webhook] upsert falló — ref:', x_ref_payco, error);
        }
    } catch (err) {
        console.error('[ePayco webhook] error inesperado al guardar transacción:', err);
    }

    return new Response(null, { status: 200 });
}

// ── handlePatch (testable core logic) ────────────────────────────────────────

export async function handlePatch(
    request: Request,
    deps: { db?: SupabaseLike; fetcher?: typeof fetch } = {}
): Promise<Response> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'JSON inválido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const b = body as Record<string, unknown>;
    const rawRef =
        typeof b['ref_payco'] === 'number'
            ? String(b['ref_payco'])
            : typeof b['ref_payco'] === 'string'
              ? b['ref_payco'].trim()
              : '';
    if (!rawRef) {
        return new Response(JSON.stringify({ error: 'ref_payco requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const isRedimido = b['redimido'] === true;

    const refHash = !isRedimido ? (typeof b['ref_hash'] === 'string' ? b['ref_hash'].trim() : '') : '';
    if (!isRedimido && !refHash) {
        return new Response(JSON.stringify({ error: 'ref_hash requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const resumenCaso = !isRedimido && typeof b['resumen_caso'] === 'string' ? (b['resumen_caso'] as string) : null;

    const db = deps.db ?? getSupabase();
    const ref = rawRef;
    const { data, error } = await db
        .from('transacciones')
        .select('ref_payco, estado')
        .or(`ref_payco.eq.${ref},ref_hash.eq.${ref}`)
        .maybeSingle();

    if (error || !data) {
        return new Response(JSON.stringify({ error: 'Transacción no encontrada' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (isRedimido) {
        if (data.estado !== 'Aceptada') {
            return new Response(JSON.stringify({ error: 'El pago no fue aceptado' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const rawCalendlyId = typeof b['calendly_event_id'] === 'string' ? b['calendly_event_id'].trim() : null;
        const calendlyId =
            rawCalendlyId && rawCalendlyId.length <= 100 && /^[\w-]+$/.test(rawCalendlyId) ? rawCalendlyId : null;

        const calFetcher = deps.fetcher ?? fetch;
        const apiKey = import.meta.env.CALENDLY_API_KEY as string | undefined;
        let fechaReunion: string | null = null;

        if (calendlyId && (deps.fetcher || apiKey)) {
            try {
                const res = await calFetcher(`https://api.calendly.com/scheduled_events/${calendlyId}`, {
                    headers: { Authorization: `Bearer ${apiKey ?? ''}` },
                });
                if (res.ok) {
                    const payload = (await res.json()) as { resource?: { start_time?: string } };
                    fechaReunion = payload.resource?.start_time ?? null;
                }
            } catch {
                console.warn('[Calendly] no se pudo obtener start_time para:', calendlyId);
            }
        }

        await db
            .from('transacciones')
            .update({
                redimido: true,
                ...(calendlyId ? { calendly_event_id: calendlyId } : {}),
                ...(fechaReunion ? { fecha_reunion: fechaReunion } : {}),
                updated_at: new Date().toISOString(),
            })
            .eq('ref_payco', data.ref_payco);
    } else {
        await db
            .from('transacciones')
            .update({
                ref_hash: refHash,
                ...(resumenCaso !== null ? { resumen_caso: resumenCaso } : {}),
                updated_at: new Date().toISOString(),
            })
            .eq('ref_payco', data.ref_payco);
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

// ── POST webhook handler ─────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => handlePost(request);

// ── PATCH handler ────────────────────────────────────────────────────────────

export const PATCH: APIRoute = async ({ request }) => handlePatch(request);
