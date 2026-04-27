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
    franquicia: string; // 'VS', 'MC', 'PSE', etc.
    tipoPago: string; // 'TDC' | 'pse' | ...
    cuotas: string;
    transactionId: string;
    descripcion: string;
    codigoAprobacion: string;
    motivoRechazo: string;
}

/** Verifica el estado de un pago.
 *  Primero consulta la DB; si no existe, cae a ePayco y guarda el resultado.
 *  Exportada para permitir unit tests sin importar Astro. */
export async function verificarPago(
    ref: string,
    calendarUrl: string,
    deps: { db?: SupabaseLike; fetcher?: typeof fetch } = {}
): Promise<{ ok: boolean; calendarUrl?: string; pago?: PagoData }> {
    const db = deps.db ?? getSupabase();
    const fetcher = deps.fetcher ?? fetch;

    // 1. Try DB first
    const { data: row } = await db
        .from('transacciones')
        .select(
            'ref_payco, estado, nombre, email, telefono, monto, moneda, fecha_transaccion, banco, tarjeta, franquicia, tipo_pago, cuotas, descripcion, codigo_aprobacion, motivo_rechazo, transaction_id'
        )
        .eq('ref_payco', ref)
        .single();

    if (row) {
        return mapTransaccionToResponse(row, calendarUrl);
    }

    // 2. Fall back to ePayco API
    const res = await fetcher(`https://secure.epayco.co/validation/v1/reference/${ref}`);
    if (!res.ok) throw new Error('epayco_fetch_failed');
    const data = await res.json();
    const d = data.data ?? {};
    const ok = d.x_transaction_state === 'Aceptada';

    // ePayco devuelve la descripción con encoding latin-1 interpretado como UTF-8
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
    };

    // 3. Upsert to DB (best-effort)
    void Promise.resolve(
        db.from('transacciones').upsert(
            {
                ref_payco: ref,
                transaction_id: d.x_transaction_id ?? null,
                estado: d.x_transaction_state ?? 'desconocido',
                nombre: pago.nombre,
                email: pago.email,
                telefono: pago.telefono,
                monto: pago.monto,
                moneda: pago.moneda,
                franquicia: d.x_franchise ?? null,
                tipo_pago: pago.tipoPago,
                banco: d.x_bank_name !== 'N/A' ? (d.x_bank_name ?? null) : null,
                tarjeta: d.x_cardnumber !== '*******' ? (d.x_cardnumber ?? null) : null,
                cuotas: d.x_quotas && d.x_quotas !== '0' ? d.x_quotas : null,
                descripcion: pago.descripcion,
                codigo_aprobacion: pago.codigoAprobacion,
                motivo_rechazo: !ok ? pago.motivoRechazo : null,
                fecha_transaccion: d.x_fecha_transaccion ? new Date(d.x_fecha_transaccion).toISOString() : null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'ref_payco' }
        )
    ).catch(() => {});

    return {
        ok,
        calendarUrl: ok ? calendarUrl : undefined,
        pago,
    };
}

export const GET: APIRoute = async ({ url }) => {
    const ref = url.searchParams.get('ref');
    if (!ref) {
        return new Response(JSON.stringify({ error: 'ref requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const result = await verificarPago(ref, CALENDLY_URL);
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
};
