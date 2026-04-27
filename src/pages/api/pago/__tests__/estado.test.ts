import { describe, it, expect, vi } from 'vitest';
import { verificarPago } from '../estado';
import type { SupabaseLike } from '../../../../services/supabase';
import type { TransaccionRow } from '../confirmar';

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

function makeFakeDb(rows: Array<{ ref_payco: string } & Partial<TransaccionRow>> = []): SupabaseLike {
    return {
        from() {
            return {
                select() {
                    return {
                        eq(_col: string, val: string) {
                            return {
                                single() {
                                    const found = rows.find((r) => r.ref_payco === val);
                                    return Promise.resolve({
                                        data: found ?? null,
                                        error: found ? null : { code: 'PGRST116' },
                                    });
                                },
                            };
                        },
                    };
                },
                upsert() {
                    return Promise.resolve({ error: null });
                },
            };
        },
    } as unknown as SupabaseLike;
}

describe('verificarPago', () => {
    it('retorna ok:true y calendarUrl cuando estado es Aceptada', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Aceptada'));
        const result = await verificarPago('REF123', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
        });

        expect(fetcher).toHaveBeenCalledWith('https://secure.epayco.co/validation/v1/reference/REF123');
        expect(result.ok).toBe(true);
        expect(result.calendarUrl).toBe(FAKE_CALENDAR);
        expect(result.pago).toBeDefined();
        expect(result.pago?.estado).toBe('Aceptada');
    });

    it('retorna ok:false y sin calendarUrl cuando estado no es Aceptada', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Rechazada'));
        const result = await verificarPago('REF456', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
        });

        expect(result.ok).toBe(false);
        expect(result.calendarUrl).toBeUndefined();
        expect(result.pago?.estado).toBe('Rechazada');
        expect(result.pago?.motivoRechazo).toBeDefined();
    });

    it('retorna ok:false cuando pago está pendiente', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Pendiente'));
        const result = await verificarPago('REF789', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
        });

        expect(result.ok).toBe(false);
        expect(result.calendarUrl).toBeUndefined();
        expect(result.pago?.estado).toBe('Pendiente');
    });

    it('lanza error cuando fetch a ePayco falla (status no-ok)', async () => {
        const fetcher = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

        await expect(verificarPago('REF_BAD', FAKE_CALENDAR, { db: makeFakeDb([]), fetcher })).rejects.toThrow(
            'epayco_fetch_failed'
        );
    });

    it('lanza error cuando fetch rechaza (error de red)', async () => {
        const fetcher = vi.fn().mockRejectedValue(new Error('Network error'));

        await expect(verificarPago('REF_NET', FAKE_CALENDAR, { db: makeFakeDb([]), fetcher })).rejects.toThrow();
    });

    it('TS-E1: usa datos de DB cuando la ref existe — no llama a ePayco', async () => {
        const fetcher = vi.fn();
        const dbRow: { ref_payco: string } & Partial<TransaccionRow> = {
            ref_payco: 'REF_DB',
            estado: 'Aceptada',
            nombre: 'Ana Lopez',
            email: 'ana@test.com',
            telefono: '3009876543',
            monto: 59900,
            moneda: 'COP',
            franquicia: 'MC',
            tipo_pago: 'TDC',
            banco: null,
            tarjeta: '**** 5678',
            cuotas: '1',
            descripcion: 'Asesoría',
            codigo_aprobacion: 'XYZ',
            motivo_rechazo: null,
            transaction_id: 'TXN_DB',
            fecha_transaccion: '2026-04-08T00:00:00Z',
        };

        const result = await verificarPago('REF_DB', FAKE_CALENDAR, {
            db: makeFakeDb([dbRow]),
            fetcher,
        });

        expect(fetcher).not.toHaveBeenCalled();
        expect(result.ok).toBe(true);
        expect(result.calendarUrl).toBe(FAKE_CALENDAR);
        expect(result.pago?.nombre).toBe('Ana Lopez');
    });

    it('TS-E2: llama a ePayco cuando ref no está en DB', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Aceptada'));

        const result = await verificarPago('REF_MISS', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
        });

        expect(fetcher).toHaveBeenCalledWith('https://secure.epayco.co/validation/v1/reference/REF_MISS');
        expect(result.ok).toBe(true);
    });
});
