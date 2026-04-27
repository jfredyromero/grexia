import { describe, it, expect, vi, afterEach } from 'vitest';
import { verificarPago, handleGet } from '../estado';
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
    function parseOrFilter(filter: string, r: Record<string, unknown>): boolean {
        return filter.split(',').some((cond) => {
            const firstDot = cond.indexOf('.');
            const col = cond.slice(0, firstDot);
            const rest = cond.slice(firstDot + 1);
            const secondDot = rest.indexOf('.');
            const op = rest.slice(0, secondDot);
            const val = rest.slice(secondDot + 1);
            return op === 'eq' && String(r[col] ?? '') === val;
        });
    }

    function queryBuilder(filtered: typeof rows) {
        return {
            single() {
                const found = filtered[0];
                return Promise.resolve({
                    data: found ?? null,
                    error: found ? null : { code: 'PGRST116' },
                });
            },
            maybeSingle() {
                return Promise.resolve({ data: filtered[0] ?? null, error: null });
            },
        };
    }

    return {
        from() {
            return {
                select() {
                    return {
                        eq(col: string, val: string) {
                            const filtered = rows.filter(
                                (r) => String((r as Record<string, unknown>)[col] ?? '') === val
                            );
                            return queryBuilder(filtered);
                        },
                        or(filter: string) {
                            const filtered = rows.filter((r) => parseOrFilter(filter, r as Record<string, unknown>));
                            return queryBuilder(filtered);
                        },
                    };
                },
                upsert() {
                    return Promise.resolve({ error: null });
                },
                update() {
                    return {
                        eq() {
                            return Promise.resolve({ error: null });
                        },
                    };
                },
                insert() {
                    return Promise.resolve({ error: null });
                },
            };
        },
    } as unknown as SupabaseLike;
}

// ── verificarPago — comportamiento ePayco (requiere fallback: true) ────────────

describe('verificarPago', () => {
    it('retorna ok:true y calendarUrl cuando estado es Aceptada', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Aceptada'));
        const result = await verificarPago('REF123', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
            fallback: true,
        });

        expect(fetcher).toHaveBeenCalledWith('https://secure.epayco.co/validation/v1/reference/REF123');
        expect(result!.ok).toBe(true);
        expect(result!.calendarUrl).toBe(FAKE_CALENDAR);
        expect(result!.pago).toBeDefined();
        expect(result!.pago?.estado).toBe('Aceptada');
    });

    it('retorna ok:false y sin calendarUrl cuando estado no es Aceptada', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Rechazada'));
        const result = await verificarPago('REF456', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
            fallback: true,
        });

        expect(result!.ok).toBe(false);
        expect(result!.calendarUrl).toBeUndefined();
        expect(result!.pago?.estado).toBe('Rechazada');
        expect(result!.pago?.motivoRechazo).toBeDefined();
    });

    it('retorna ok:false cuando pago está pendiente', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Pendiente'));
        const result = await verificarPago('REF789', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
            fallback: true,
        });

        expect(result!.ok).toBe(false);
        expect(result!.calendarUrl).toBeUndefined();
        expect(result!.pago?.estado).toBe('Pendiente');
    });

    it('lanza error cuando fetch a ePayco falla (status no-ok)', async () => {
        const fetcher = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

        await expect(
            verificarPago('REF_BAD', FAKE_CALENDAR, { db: makeFakeDb([]), fetcher, fallback: true })
        ).rejects.toThrow('epayco_fetch_failed');
    });

    it('lanza error cuando fetch rechaza (error de red)', async () => {
        const fetcher = vi.fn().mockRejectedValue(new Error('Network error'));

        await expect(
            verificarPago('REF_NET', FAKE_CALENDAR, { db: makeFakeDb([]), fetcher, fallback: true })
        ).rejects.toThrow();
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
            redimido: false,
        };

        const result = await verificarPago('REF_DB', FAKE_CALENDAR, {
            db: makeFakeDb([dbRow]),
            fetcher,
        });

        expect(fetcher).not.toHaveBeenCalled();
        expect(result!.ok).toBe(true);
        expect(result!.calendarUrl).toBe(FAKE_CALENDAR);
        expect(result!.pago?.nombre).toBe('Ana Lopez');
    });

    it('TS-E2: llama a ePayco cuando ref no está en DB', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Aceptada'));

        const result = await verificarPago('REF_MISS', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
            fallback: true,
        });

        expect(fetcher).toHaveBeenCalledWith('https://secure.epayco.co/validation/v1/reference/REF_MISS');
        expect(result!.ok).toBe(true);
    });
});

// ── makeDbWithInsertSpy ───────────────────────────────────────────────────────

function makeDbWithInsertSpy(insertSpy: ReturnType<typeof vi.fn>): SupabaseLike {
    return {
        from() {
            return {
                select() {
                    return {
                        or() {
                            return { maybeSingle: () => Promise.resolve({ data: null, error: null }) };
                        },
                        eq() {
                            return { maybeSingle: () => Promise.resolve({ data: null, error: null }) };
                        },
                    };
                },
                upsert() {
                    return Promise.resolve({ error: null });
                },
                update() {
                    return { eq: () => Promise.resolve({ error: null }) };
                },
                insert: insertSpy,
            };
        },
    } as unknown as SupabaseLike;
}

// ── pago-v4: T1.1 / T1.3 — null cuando sin fallback y sin row ────────────────

describe('verificarPago: pago-v4 — null cuando sin fallback y sin row', () => {
    it('T1.1 retorna null cuando no hay row en DB y fallback es false', async () => {
        const fetcher = vi.fn();
        const result = await verificarPago('REF_NOROW', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
            fallback: false,
        });
        expect(result).toBeNull();
    });

    it('T1.3 no llama fetcher ni insert cuando sin fallback y sin row', async () => {
        const fetcher = vi.fn();
        const insertSpy = vi.fn().mockResolvedValue({ error: null });
        const db = makeDbWithInsertSpy(insertSpy);

        await verificarPago('REF_NOROW2', FAKE_CALENDAR, {
            db,
            fetcher,
            fallback: false,
        });

        expect(fetcher).not.toHaveBeenCalled();
        expect(insertSpy).not.toHaveBeenCalled();
    });
});

// ── pago-v4: T1.2 / T1.5 — handleGet HTTP status ────────────────────────────

describe('handleGet: pago-v4', () => {
    it('T1.2 retorna HTTP 202 con body {} cuando sin fallback y sin row', async () => {
        const url = new URL('http://localhost/api/pago/estado?ref=REF_202');
        const response = await handleGet(url, { db: makeFakeDb([]) });
        expect(response.status).toBe(202);
        const body = await response.json();
        expect(body).toEqual({});
    });

    it('T1.5 retorna HTTP 200 cuando fallback=true y sin row en DB', async () => {
        const url = new URL('http://localhost/api/pago/estado?ref=REF_FB&fallback=true');
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Aceptada'));
        const response = await handleGet(url, { db: makeFakeDb([]), fetcher });
        expect(response.status).toBe(200);
    });
});

// ── pago-v4: T1.4 / T1.4b — fallback=true llama ePayco sin persistir ─────────

describe('verificarPago: pago-v4 — fallback=true llama ePayco sin persistir', () => {
    it('T1.4 con fallback=true y sin row: llama ePayco y retorna datos no nulos', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Aceptada'));
        const result = await verificarPago('REF_FB2', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
            fallback: true,
        });
        expect(fetcher).toHaveBeenCalledWith('https://secure.epayco.co/validation/v1/reference/REF_FB2');
        expect(result).not.toBeNull();
        expect(result?.ok).toBe(true);
    });

    it('T1.4b con fallback=true y sin row: NO llama insert en DB', async () => {
        const insertSpy = vi.fn().mockResolvedValue({ error: null });
        const db = makeDbWithInsertSpy(insertSpy);
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Aceptada'));

        await verificarPago('REF_FB3', FAKE_CALENDAR, {
            db,
            fetcher,
            fallback: true,
        });

        expect(insertSpy).not.toHaveBeenCalled();
    });
});

// ── pago-v4: T1.6 — response sin campo source ────────────────────────────────

describe('verificarPago: pago-v4 — response sin campo source', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('T1.6 DB hit: result no contiene campo source', async () => {
        const dbRow: { ref_payco: string } & Partial<TransaccionRow> = {
            ref_payco: 'REF_NOSRC',
            estado: 'Aceptada',
            nombre: 'Test User',
            email: 'test@test.com',
            telefono: '',
            monto: 50000,
            moneda: 'COP',
            franquicia: 'VS',
            tipo_pago: 'TDC',
            banco: null,
            tarjeta: null,
            cuotas: null,
            descripcion: 'Test',
            codigo_aprobacion: 'X',
            motivo_rechazo: null,
            transaction_id: 'T',
            fecha_transaccion: '2026-04-01T00:00:00Z',
            redimido: false,
        };

        const result = await verificarPago('REF_NOSRC', FAKE_CALENDAR, {
            db: makeFakeDb([dbRow]),
            fetcher: vi.fn(),
        });

        expect((result as Record<string, unknown>)?.source).toBeUndefined();
    });

    it('T1.6b fallback=true: result no contiene campo source', async () => {
        const fetcher = vi.fn().mockResolvedValue(makeEpaycoResponse('Aceptada'));
        const result = await verificarPago('REF_NOSRC2', FAKE_CALENDAR, {
            db: makeFakeDb([]),
            fetcher,
            fallback: true,
        });

        expect((result as Record<string, unknown>)?.source).toBeUndefined();
    });
});
