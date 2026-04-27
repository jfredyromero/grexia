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

const SELECT_FIELDS =
    'ref_payco, estado, nombre, email, telefono, monto, moneda, fecha_transaccion, banco, tarjeta, franquicia, tipo_pago, cuotas, descripcion, codigo_aprobacion, motivo_rechazo, transaction_id, redimido, tipo_documento, numero_documento, direccion';

export async function verificarPago(
    ref: string,
    calendarUrl: string,
    deps: { db?: SupabaseLike } = {}
): Promise<EstadoPayload | null> {
    const db = deps.db ?? getSupabase();

    try {
        const { data: row } = await db.from('transacciones').select(SELECT_FIELDS).eq('ref_payco', ref).maybeSingle();

        if (row) {
            return mapTransaccionToResponse(row, calendarUrl);
        }
        return null;
    } catch {
        console.warn('[estado] DB lookup failed for ref:', ref);
        return null;
    }
}

export async function handleGet(ref: string, deps: { db?: SupabaseLike } = {}): Promise<Response> {
    if (!ref) {
        return new Response(JSON.stringify({ error: 'ref requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const result = await verificarPago(ref, CALENDLY_URL, deps);
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
}
