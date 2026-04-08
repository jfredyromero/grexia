import type { APIRoute } from 'astro';

export const prerender = false;

const CALENDLY_URL = import.meta.env.CALENDLY_URL as string;

export interface PagoData {
    estado: string;
    nombre: string;
    email: string;
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

/** Verifica el estado de un pago con la API de ePayco.
 *  Exportada para permitir unit tests sin importar Astro. */
export async function verificarPago(
    ref: string,
    calendarUrl: string
): Promise<{ ok: boolean; calendarUrl?: string; pago?: PagoData }> {
    const res = await fetch(`https://secure.epayco.co/validation/v1/reference/${ref}`);
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
        console.log(error);
        return new Response(JSON.stringify({ error: 'No se pudo verificar el pago' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
