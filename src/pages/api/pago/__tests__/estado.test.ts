import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verificarPago } from '../estado';

const FAKE_KEY = 'PRIVATE_TEST_KEY';
const FAKE_CALENDAR = 'https://calendar.google.com/appointments/test';

function makeEpaycoResponse(estado: string, ok = true) {
    return {
        ok,
        json: () => Promise.resolve({ data: { estado } }),
    };
}

beforeEach(() => {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(makeEpaycoResponse('Aceptada'))
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('verificarPago', () => {
    it('retorna ok:true y calendarUrl cuando estado es Aceptada', async () => {
        const result = await verificarPago('REF123', FAKE_KEY, FAKE_CALENDAR);

        expect(fetch).toHaveBeenCalledWith(
            `https://api.epayco.co/payment/payload/${FAKE_KEY}/REF123`
        );
        expect(result).toEqual({ ok: true, calendarUrl: FAKE_CALENDAR, reason: undefined });
    });

    it('retorna ok:false y reason cuando estado no es Aceptada', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(makeEpaycoResponse('Rechazada'))
        );

        const result = await verificarPago('REF456', FAKE_KEY, FAKE_CALENDAR);

        expect(result).toEqual({ ok: false, calendarUrl: undefined, reason: 'Rechazada' });
    });

    it('retorna ok:false con reason "Pendiente" cuando pago está pendiente', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(makeEpaycoResponse('Pendiente'))
        );

        const result = await verificarPago('REF789', FAKE_KEY, FAKE_CALENDAR);

        expect(result.ok).toBe(false);
        expect(result.reason).toBe('Pendiente');
        expect(result.calendarUrl).toBeUndefined();
    });

    it('lanza error cuando fetch a ePayco falla (status no-ok)', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) })
        );

        await expect(verificarPago('REF_BAD', FAKE_KEY, FAKE_CALENDAR)).rejects.toThrow(
            'epayco_fetch_failed'
        );
    });

    it('lanza error cuando fetch rechaza (error de red)', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockRejectedValue(new Error('Network error'))
        );

        await expect(verificarPago('REF_NET', FAKE_KEY, FAKE_CALENDAR)).rejects.toThrow();
    });
});
