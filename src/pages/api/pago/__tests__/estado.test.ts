import { describe, it, expect, vi } from 'vitest';
import { verificarPago, handleGet } from '../estado';
import type { SupabaseLike } from '../../../../services/supabase';
import type { TransaccionRow } from '../confirmar';

const FAKE_CALENDAR = 'https://calendar.google.com/appointments/test';

function makeFakeDb(rows: Array<{ ref_payco: string } & Partial<TransaccionRow>> = []): SupabaseLike {
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
                        or() {
                            return queryBuilder([]);
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

const DB_ROW: { ref_payco: string } & Partial<TransaccionRow> = {
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

// ── verificarPago ─────────────────────────────────────────────────────────────

describe('verificarPago', () => {
    it('retorna datos cuando el row existe en DB por ref_payco', async () => {
        const result = await verificarPago('REF_DB', FAKE_CALENDAR, { db: makeFakeDb([DB_ROW]) });

        expect(result).not.toBeNull();
        expect(result!.ok).toBe(true);
        expect(result!.calendarUrl).toBe(FAKE_CALENDAR);
        expect(result!.pago?.nombre).toBe('Ana Lopez');
    });

    it('retorna null cuando no hay row en DB', async () => {
        const result = await verificarPago('REF_MISS', FAKE_CALENDAR, { db: makeFakeDb([]) });

        expect(result).toBeNull();
    });

    it('solo busca por ref_payco — ref_hash no es criterio de busqueda', async () => {
        // Row con ref_payco 'PRIVATE_REF'. Buscar por otro string no encuentra nada.
        const result = await verificarPago('PUBLIC_HASH', FAKE_CALENDAR, { db: makeFakeDb([DB_ROW]) });

        expect(result).toBeNull();
    });

    it('retorna ok:false cuando estado es Rechazada', async () => {
        const failRow = {
            ...DB_ROW,
            ref_payco: 'REF_FAIL',
            estado: 'Rechazada',
            motivo_rechazo: 'Fondos insuficientes',
        };
        const result = await verificarPago('REF_FAIL', FAKE_CALENDAR, { db: makeFakeDb([failRow]) });

        expect(result!.ok).toBe(false);
        expect(result!.calendarUrl).toBeUndefined();
    });

    it('no contiene campo source en el resultado', async () => {
        const result = await verificarPago('REF_DB', FAKE_CALENDAR, { db: makeFakeDb([DB_ROW]) });

        expect((result as Record<string, unknown>)?.source).toBeUndefined();
    });
});

// ── handleGet ─────────────────────────────────────────────────────────────────

describe('handleGet', () => {
    it('retorna HTTP 200 cuando el row existe en DB', async () => {
        const response = await handleGet('REF_DB', { db: makeFakeDb([DB_ROW]) });

        expect(response.status).toBe(200);
        const body = (await response.json()) as { ok: boolean };
        expect(body.ok).toBe(true);
    });

    it('retorna HTTP 202 con body {} cuando no hay row en DB', async () => {
        const response = await handleGet('REF_202', { db: makeFakeDb([]) });

        expect(response.status).toBe(202);
        const body = await response.json();
        expect(body).toEqual({});
    });

    it('retorna HTTP 400 cuando ref está vacío', async () => {
        const response = await handleGet('', { db: makeFakeDb([]) });

        expect(response.status).toBe(400);
    });

    it('retorna HTTP 202 si no hay row (sin parámetros extra)', async () => {
        const response = await handleGet('REF_X', { db: makeFakeDb([]) });

        expect(response.status).toBe(202);
    });
});
