import { describe, it, expect, vi } from 'vitest';
import { handleGet } from '../referencia/[hash]';

const FAKE_CALENDLY_URL = 'https://calendly.com/grexiaco/test';

function makeEpaycoOk(xRefPayco: string, estado = 'Aceptada') {
    return {
        ok: true,
        json: () =>
            Promise.resolve({
                data: {
                    x_ref_payco: xRefPayco,
                    x_transaction_state: estado,
                    x_customer_name: 'Juan',
                    x_customer_lastname: 'Perez',
                    x_customer_email: 'juan@test.com',
                    x_amount: 150000,
                    x_currency_code: 'COP',
                    x_fecha_transaccion: '2026-04-08 10:00:00',
                    x_bank_name: 'N/A',
                    x_cardnumber: '*******',
                    x_franchise: 'VS',
                    x_type_payment: 'TDC',
                    x_quotas: '1',
                    x_transaction_id: 'TXN123',
                    x_description: 'Asesoria juridica',
                    x_approval_code: 'ABC123',
                    x_response_reason_text: '',
                    x_extra1: '3001234567',
                    x_extra2: 'CC',
                    x_extra3: '12345678',
                    x_extra4: 'Calle 1 # 2-3',
                },
            }),
    };
}

describe('handleGet: /api/pago/referencia/[hash]', () => {
    it('retorna x_ref_payco y masked cuando ePayco responde con datos', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoOk('361795375'));
        const res = await handleGet('b95372040abe4e80d8a6e714', { fetcher, calendarUrl: FAKE_CALENDLY_URL });

        expect(res.status).toBe(200);
        const body = (await res.json()) as { x_ref_payco: string; masked: Record<string, unknown> };
        expect(body.x_ref_payco).toBe('361795375');
        expect(body.masked).not.toBeNull();
        expect(fetcher).toHaveBeenCalledWith(
            'https://secure.epayco.co/validation/v1/reference/b95372040abe4e80d8a6e714'
        );
    });

    it('retorna HTTP 404 con error no-encontrado cuando ePayco no retorna x_ref_payco', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: { x_transaction_state: 'Aceptada' } }),
        });
        const res = await handleGet('HASH_NO_XREF', { fetcher });

        expect(res.status).toBe(404);
        const body = (await res.json()) as { error: string };
        expect(body.error).toBe('no-encontrado');
    });

    it('retorna HTTP 404 cuando ePayco retorna x_ref_payco vacío', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: { x_ref_payco: '' } }),
        });
        const res = await handleGet('HASH_EMPTY', { fetcher });

        expect(res.status).toBe(404);
    });

    it('retorna HTTP 502 cuando ePayco responde con error HTTP', async () => {
        const fetcher = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });
        const res = await handleGet('BAD_HASH', { fetcher });

        expect(res.status).toBe(502);
    });

    it('retorna HTTP 502 cuando fetch a ePayco lanza error de red', async () => {
        const fetcher = vi.fn().mockRejectedValue(new Error('Network error'));
        const res = await handleGet('ERR_HASH', { fetcher });

        expect(res.status).toBe(502);
    });

    it('masked.ok es true y masked.calendarUrl presente cuando pago Aceptada', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoOk('361795375', 'Aceptada'));
        const res = await handleGet('HASH_OK', { fetcher, calendarUrl: FAKE_CALENDLY_URL });

        const body = (await res.json()) as { masked: { ok: boolean; calendarUrl?: string } };
        expect(body.masked!.ok).toBe(true);
        expect(body.masked!.calendarUrl).toBe(FAKE_CALENDLY_URL);
    });

    it('masked.ok es false y sin calendarUrl cuando pago Rechazada', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoOk('361795375', 'Rechazada'));
        const res = await handleGet('HASH_FAIL', { fetcher, calendarUrl: FAKE_CALENDLY_URL });

        const body = (await res.json()) as { masked: { ok: boolean; calendarUrl?: string } };
        expect(body.masked!.ok).toBe(false);
        expect(body.masked!.calendarUrl).toBeUndefined();
    });
});
