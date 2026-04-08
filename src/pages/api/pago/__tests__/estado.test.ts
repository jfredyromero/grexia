import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verificarPago } from '../estado';

const FAKE_CALENDAR = 'https://calendar.google.com/appointments/test';

function makeEpaycoResponse(estado: string, ok = true) {
    return {
        ok,
        json: () =>
            Promise.resolve({
                data: {
                    x_transaction_state: estado,
                    x_customer_name: 'Juan',
                    x_customer_lastname: 'Perez',
                    x_customer_email: 'juan@test.com',
                    x_amount: 150000,
                    x_currency_code: 'COP',
                    x_fecha_transaccion: '2026-04-08',
                    x_bank_name: 'Bancolombia',
                    x_cardnumber: '**** **** **** 1234',
                    x_franchise: 'VS',
                    x_type_payment: 'TDC',
                    x_quotas: '1',
                    x_transaction_id: 'TXN123',
                    x_description: 'Asesoria juridica',
                    x_approval_code: 'ABC123',
                    x_response_reason_text: '',
                },
            }),
    };
}

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeEpaycoResponse('Aceptada')));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('verificarPago', () => {
    it('retorna ok:true y calendarUrl cuando estado es Aceptada', async () => {
        const result = await verificarPago('REF123', FAKE_CALENDAR);

        expect(fetch).toHaveBeenCalledWith('https://secure.epayco.co/validation/v1/reference/REF123');
        expect(result.ok).toBe(true);
        expect(result.calendarUrl).toBe(FAKE_CALENDAR);
        expect(result.pago).toBeDefined();
        expect(result.pago?.estado).toBe('Aceptada');
    });

    it('retorna ok:false y sin calendarUrl cuando estado no es Aceptada', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeEpaycoResponse('Rechazada')));

        const result = await verificarPago('REF456', FAKE_CALENDAR);

        expect(result.ok).toBe(false);
        expect(result.calendarUrl).toBeUndefined();
        expect(result.pago?.estado).toBe('Rechazada');
        expect(result.pago?.motivoRechazo).toBeDefined();
    });

    it('retorna ok:false cuando pago está pendiente', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeEpaycoResponse('Pendiente')));

        const result = await verificarPago('REF789', FAKE_CALENDAR);

        expect(result.ok).toBe(false);
        expect(result.calendarUrl).toBeUndefined();
        expect(result.pago?.estado).toBe('Pendiente');
    });

    it('lanza error cuando fetch a ePayco falla (status no-ok)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) }));

        await expect(verificarPago('REF_BAD', FAKE_CALENDAR)).rejects.toThrow('epayco_fetch_failed');
    });

    it('lanza error cuando fetch rechaza (error de red)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

        await expect(verificarPago('REF_NET', FAKE_CALENDAR)).rejects.toThrow();
    });
});
