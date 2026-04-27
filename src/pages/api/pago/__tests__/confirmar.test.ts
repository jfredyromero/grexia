import { describe, it, expect, vi } from 'vitest';
import {
    validateEpaycoSignature,
    validateResumenCaso,
    mapTransaccionToResponse,
    extractCalendlyEventId,
    handlePost,
    handlePatch,
    type TransaccionRow,
} from '../confirmar';
import type { SupabaseLike } from '../../../../services/supabase';
import { validateCelular } from '../../../../components/asesoria/Checkout';

// ── Fake DB helper ────────────────────────────────────────────────────────────

function makeFakeDbForConfirmar(
    opts: {
        upsertSpy?: ReturnType<typeof vi.fn>;
        updateSpy?: ReturnType<typeof vi.fn>;
        existingRow?: Partial<TransaccionRow> | null;
    } = {}
): SupabaseLike {
    const upsertSpy = opts.upsertSpy ?? vi.fn().mockResolvedValue({ error: null });
    const updateSpy =
        opts.updateSpy ??
        vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
        });
    const row =
        opts.existingRow !== undefined
            ? opts.existingRow
            : {
                  ref_payco: 'EPY-123',
                  estado: 'Aceptada',
              };

    return {
        from() {
            return {
                select() {
                    return {
                        or() {
                            return {
                                maybeSingle() {
                                    return Promise.resolve({ data: row, error: null });
                                },
                            };
                        },
                        eq() {
                            return {
                                maybeSingle() {
                                    return Promise.resolve({ data: row, error: null });
                                },
                            };
                        },
                    };
                },
                upsert: upsertSpy,
                update: updateSpy,
                insert: vi.fn().mockResolvedValue({ error: null }),
            };
        },
    } as unknown as SupabaseLike;
}

// ── POST helper ───────────────────────────────────────────────────────────────

async function makePostRequest(params: Record<string, string>): Promise<Request> {
    const body = new URLSearchParams(params).toString();
    return new Request('http://localhost/api/pago/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
}

async function makePatchRequest(body: Record<string, unknown>): Promise<Request> {
    return new Request('http://localhost/api/pago/confirmar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

// SHA-256 of 'p123^key456^REF001^TXN001^59900^COP'
const EXPECTED_SIG = 'daf98ab0135fe4689258f6ed7e8df8e5c3b1a43912bb66a5678bc08335ed3618';

describe('validateEpaycoSignature', () => {
    it('retorna true con firma correcta', async () => {
        const result = await validateEpaycoSignature(
            {
                p_cust_id_cliente: 'p123',
                p_key: 'key456',
                x_ref_payco: 'REF001',
                x_transaction_id: 'TXN001',
                x_amount: '59900',
                x_currency_code: 'COP',
            },
            EXPECTED_SIG
        );
        expect(result).toBe(true);
    });

    it('retorna false cuando el monto está adulterado', async () => {
        const result = await validateEpaycoSignature(
            {
                p_cust_id_cliente: 'p123',
                p_key: 'key456',
                x_ref_payco: 'REF001',
                x_transaction_id: 'TXN001',
                x_amount: '99999',
                x_currency_code: 'COP',
            },
            EXPECTED_SIG
        );
        expect(result).toBe(false);
    });

    it('retorna false con hash incorrecto', async () => {
        const result = await validateEpaycoSignature(
            {
                p_cust_id_cliente: 'p123',
                p_key: 'key456',
                x_ref_payco: 'REF001',
                x_transaction_id: 'TXN001',
                x_amount: '59900',
                x_currency_code: 'COP',
            },
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        );
        expect(result).toBe(false);
    });

    it('retorna false con hash vacío', async () => {
        const result = await validateEpaycoSignature(
            {
                p_cust_id_cliente: 'p123',
                p_key: 'key456',
                x_ref_payco: 'REF001',
                x_transaction_id: 'TXN001',
                x_amount: '59900',
                x_currency_code: 'COP',
            },
            ''
        );
        expect(result).toBe(false);
    });

    it('retorna false cuando falta p_cust_id_cliente (undefined)', async () => {
        const result = await validateEpaycoSignature(
            {
                p_cust_id_cliente: undefined as unknown as string,
                p_key: 'key456',
                x_ref_payco: 'REF001',
                x_transaction_id: 'TXN001',
                x_amount: '59900',
                x_currency_code: 'COP',
            },
            EXPECTED_SIG
        );
        expect(result).toBe(false);
    });
});

describe('validateResumenCaso', () => {
    it('retorna objeto válido con datos correctos', () => {
        const result = validateResumenCaso({ ref_payco: 'REF001', ref_hash: 'HASH001', resumen_caso: 'Mi caso' });
        expect(result).toEqual({ ref_payco: 'REF001', ref_hash: 'HASH001', resumen_caso: 'Mi caso' });
    });

    it('acepta resumen_caso largo sin límite de caracteres', () => {
        const largo = 'x'.repeat(10000);
        const result = validateResumenCaso({ ref_payco: 'REF001', ref_hash: 'HASH001', resumen_caso: largo });
        expect(result).not.toBeNull();
        expect(result!.resumen_caso).toBe(largo);
    });

    it('retorna null cuando ref_hash está ausente', () => {
        const result = validateResumenCaso({ ref_payco: 'REF001', resumen_caso: 'Mi caso' });
        expect(result).toBeNull();
    });

    it('retorna null cuando ref_hash está vacío', () => {
        const result = validateResumenCaso({ ref_payco: 'REF001', ref_hash: '', resumen_caso: 'Mi caso' });
        expect(result).toBeNull();
    });

    it('retorna null cuando ref_payco está vacío', () => {
        const result = validateResumenCaso({ ref_payco: '', ref_hash: 'HASH001', resumen_caso: 'Mi caso' });
        expect(result).toBeNull();
    });

    it('retorna null cuando ref_payco es undefined', () => {
        const result = validateResumenCaso({ ref_payco: undefined, ref_hash: 'HASH001', resumen_caso: 'Mi caso' });
        expect(result).toBeNull();
    });

    it('retorna objeto válido con resumen_caso vacío', () => {
        const result = validateResumenCaso({ ref_payco: 'REF001', ref_hash: 'HASH001', resumen_caso: '' });
        expect(result).toEqual({ ref_payco: 'REF001', ref_hash: 'HASH001', resumen_caso: '' });
    });
});

const FAKE_CALENDAR = 'https://calendar.google.com/appointments/fake';

function makeRow(overrides: Partial<TransaccionRow> = {}): TransaccionRow {
    return {
        ref_payco: 'REF001',
        transaction_id: 'TXN001',
        estado: 'Aceptada',
        codigo_aprobacion: 'APR001',
        motivo_rechazo: null,
        nombre: 'Juan Perez',
        email: 'juan@test.com',
        telefono: '3001234567',
        monto: 59900,
        moneda: 'COP',
        franquicia: 'VS',
        tipo_pago: 'TDC',
        banco: 'Bancolombia',
        tarjeta: '**** 1234',
        cuotas: '1',
        descripcion: 'Asesoría legal',
        fecha_transaccion: '2026-04-08T00:00:00Z',
        redimido: false,
        ...overrides,
    };
}

describe('mapTransaccionToResponse', () => {
    it('retorna ok:true y calendarUrl cuando estado es Aceptada', () => {
        const result = mapTransaccionToResponse(makeRow({ estado: 'Aceptada' }), FAKE_CALENDAR);
        expect(result.ok).toBe(true);
        expect(result.calendarUrl).toBe(FAKE_CALENDAR);
    });

    it('retorna ok:false y sin calendarUrl cuando estado es Rechazada', () => {
        const result = mapTransaccionToResponse(makeRow({ estado: 'Rechazada' }), FAKE_CALENDAR);
        expect(result.ok).toBe(false);
        expect(result.calendarUrl).toBeUndefined();
    });

    it('retorna ok:false cuando estado es Pendiente', () => {
        const result = mapTransaccionToResponse(makeRow({ estado: 'Pendiente' }), FAKE_CALENDAR);
        expect(result.ok).toBe(false);
        expect(result.calendarUrl).toBeUndefined();
    });

    it('pago incluye campo telefono', () => {
        const result = mapTransaccionToResponse(makeRow({ telefono: '3001234567' }), FAKE_CALENDAR);
        expect(result.pago.telefono).toBe('3001234567');
    });

    it('calendarUrl ausente del resultado cuando ok:false', () => {
        const result = mapTransaccionToResponse(makeRow({ estado: 'Rechazada' }), FAKE_CALENDAR);
        expect('calendarUrl' in result).toBe(false);
    });
});

describe('validateCelular', () => {
    it('acepta número de 10 dígitos válido', () => {
        expect(validateCelular('3001234567')).toBe(true);
    });

    it('rechaza número con prefijo internacional', () => {
        expect(validateCelular('573001234567')).toBe(false);
    });

    it('rechaza número con espacios', () => {
        expect(validateCelular('300 123 4567')).toBe(false);
    });

    it('rechaza número de 9 dígitos', () => {
        expect(validateCelular('300123456')).toBe(false);
    });

    it('rechaza número de 11 dígitos', () => {
        expect(validateCelular('30012345678')).toBe(false);
    });

    it('rechaza número con letras', () => {
        expect(validateCelular('300123456a')).toBe(false);
    });
});

// ── handlePost: extra fields (T2) ─────────────────────────────────────────────

describe('handlePost: extra fields en upsert', () => {
    it('incluye tipo_documento, numero_documento y direccion cuando vienen en el body', async () => {
        const upsertSpy = vi.fn().mockResolvedValue({ error: null });
        const db = makeFakeDbForConfirmar({ upsertSpy });

        const req = await makePostRequest({
            x_ref_payco: 'REF-POST',
            x_transaction_id: 'TXN-POST',
            x_amount: '59900',
            x_currency_code: 'COP',
            x_transaction_state: 'Aceptada',
            x_extra2: 'CC',
            x_extra3: '12345678',
            x_extra4: 'Calle 1 #2-3',
            // skip signature validation — using injected signatureValid: true
        });

        await handlePost(req, { db, signatureValid: true });

        expect(upsertSpy).toHaveBeenCalledOnce();
        const upsertArg = upsertSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(upsertArg.tipo_documento).toBe('CC');
        expect(upsertArg.numero_documento).toBe('12345678');
        expect(upsertArg.direccion).toBe('Calle 1 #2-3');
    });
});

// ── handlePatch: calendly_event_id (T3) ───────────────────────────────────────

describe('handlePatch: calendly_event_id', () => {
    it('incluye calendly_event_id en el update cuando viene válido', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({ updateSpy });

        const req = await makePatchRequest({
            ref_payco: 'EPY-123',
            redimido: true,
            calendly_event_id: 'abc-123-def',
        });

        const res = await handlePatch(req, { db });

        expect(res.status).toBe(200);
        expect(updateSpy).toHaveBeenCalledOnce();
        const updateArg = updateSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(updateArg.calendly_event_id).toBe('abc-123-def');
        expect(updateArg.redimido).toBe(true);
    });

    it('NO incluye calendly_event_id cuando no viene en el body', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({ updateSpy });

        const req = await makePatchRequest({
            ref_payco: 'EPY-123',
            redimido: true,
        });

        const res = await handlePatch(req, { db });

        expect(res.status).toBe(200);
        const updateArg = updateSpy.mock.calls[0][0] as Record<string, unknown>;
        expect('calendly_event_id' in updateArg).toBe(false);
        expect(updateArg.redimido).toBe(true);
    });

    it('ignora calendly_event_id que supera 100 caracteres y retorna 200', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({ updateSpy });

        const req = await makePatchRequest({
            ref_payco: 'EPY-123',
            redimido: true,
            calendly_event_id: 'a'.repeat(101),
        });

        const res = await handlePatch(req, { db });

        expect(res.status).toBe(200);
        const updateArg = updateSpy.mock.calls[0][0] as Record<string, unknown>;
        expect('calendly_event_id' in updateArg).toBe(false);
    });
});

// ── extractCalendlyEventId (T4) ───────────────────────────────────────────────

describe('extractCalendlyEventId', () => {
    it('extrae el id del último segmento de una URI de Calendly', () => {
        expect(extractCalendlyEventId('https://api.calendly.com/scheduled_events/abc-123-def')).toBe('abc-123-def');
    });

    it('retorna null para string vacío', () => {
        expect(extractCalendlyEventId('')).toBeNull();
    });

    it('retorna null cuando el último segmento está vacío (trailing slash)', () => {
        expect(extractCalendlyEventId('https://api.calendly.com/')).toBeNull();
    });

    it('retorna el string completo cuando no tiene separadores de path', () => {
        expect(extractCalendlyEventId('hello')).toBe('hello');
    });
});

// ── T1: handlePost — es_prueba ────────────────────────────────────────────────

describe('handlePost: es_prueba', () => {
    it('guarda es_prueba: true cuando x_test_request es 1', async () => {
        const upsertSpy = vi.fn().mockResolvedValue({ error: null });
        const db = makeFakeDbForConfirmar({ upsertSpy });
        const req = await makePostRequest({
            x_ref_payco: 'REF-TEST',
            x_transaction_id: 'TXN-TEST',
            x_amount: '59900',
            x_currency_code: 'COP',
            x_transaction_state: 'Aceptada',
            x_test_request: '1',
        });
        await handlePost(req, { db, signatureValid: true });
        expect(upsertSpy).toHaveBeenCalledOnce();
        const arg = upsertSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(arg.es_prueba).toBe(true);
    });

    it('guarda es_prueba: false cuando x_test_request está ausente', async () => {
        const upsertSpy = vi.fn().mockResolvedValue({ error: null });
        const db = makeFakeDbForConfirmar({ upsertSpy });
        const req = await makePostRequest({
            x_ref_payco: 'REF-PROD',
            x_transaction_id: 'TXN-PROD',
            x_amount: '59900',
            x_currency_code: 'COP',
            x_transaction_state: 'Aceptada',
        });
        await handlePost(req, { db, signatureValid: true });
        const arg = upsertSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(arg.es_prueba).toBe(false);
    });

    it('guarda es_prueba: true cuando x_test_request es TRUE (string de ePayco)', async () => {
        const upsertSpy = vi.fn().mockResolvedValue({ error: null });
        const db = makeFakeDbForConfirmar({ upsertSpy });
        const req = await makePostRequest({
            x_ref_payco: 'REF-TEST-TRUE',
            x_transaction_id: 'TXN-TEST-TRUE',
            x_amount: '59900',
            x_currency_code: 'COP',
            x_transaction_state: 'Rechazada',
            x_test_request: 'TRUE',
        });
        await handlePost(req, { db, signatureValid: true });
        expect(upsertSpy).toHaveBeenCalledOnce();
        const arg = upsertSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(arg.es_prueba).toBe(true);
    });
});

// ── T2: handlePatch — fecha_reunion via Calendly API ─────────────────────────

describe('handlePatch: fecha_reunion', () => {
    it('guarda fecha_reunion cuando Calendly API retorna start_time', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({ updateSpy });
        const calendlyFetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ resource: { start_time: '2026-05-01T10:00:00Z' } }),
        });
        const req = await makePatchRequest({ ref_payco: 'EPY-123', redimido: true, calendly_event_id: 'abc-uuid' });
        const res = await handlePatch(req, { db, fetcher: calendlyFetcher });
        expect(res.status).toBe(200);
        const updateArg = updateSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(updateArg.fecha_reunion).toBe('2026-05-01T10:00:00Z');
    });

    it('retorna 200 aunque la Calendly API falle', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({ updateSpy });
        const calendlyFetcher = vi.fn().mockRejectedValue(new Error('API error'));
        const req = await makePatchRequest({ ref_payco: 'EPY-123', redimido: true, calendly_event_id: 'abc-uuid' });
        const res = await handlePatch(req, { db, fetcher: calendlyFetcher });
        expect(res.status).toBe(200);
        expect(updateSpy).toHaveBeenCalledOnce();
    });
});

// ── T3: handlePatch — resumen_caso permitido para cualquier estado ────────────

describe('handlePatch: resumen_caso sin 409 para estado no Aceptada', () => {
    it('guarda resumen_caso aunque el estado sea Rechazada', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({
            existingRow: { ref_payco: 'EPY-123', estado: 'Rechazada' },
            updateSpy,
        });
        const req = await makePatchRequest({
            ref_payco: 'EPY-123',
            ref_hash: 'HASH123',
            resumen_caso: 'Notas del caso fallido',
        });
        const res = await handlePatch(req, { db });
        expect(res.status).toBe(200);
        const body = (await res.json()) as Record<string, unknown>;
        expect(body.ok).toBe(true);
        const updateArg = updateSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(updateArg.resumen_caso).toBe('Notas del caso fallido');
    });
});

// ── T4: handlePatch — ref_hash guardado junto con resumen_caso ────────────────

describe('handlePatch: ref_hash guardado con resumen_caso', () => {
    it('guarda resumen_caso y ref_hash cuando ambos vienen en el body', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({ updateSpy });
        const req = await makePatchRequest({
            ref_payco: 'EPY-123',
            ref_hash: 'HASH123',
            resumen_caso: 'Detalles del caso',
        });
        const res = await handlePatch(req, { db });
        expect(res.status).toBe(200);
        const updateArg = updateSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(updateArg.resumen_caso).toBe('Detalles del caso');
        expect(updateArg.ref_hash).toBe('HASH123');
    });

    it('retorna 400 cuando ref_hash está ausente en resumen_caso PATCH', async () => {
        const db = makeFakeDbForConfirmar({});
        const req = await makePatchRequest({ ref_payco: 'EPY-123', resumen_caso: 'Detalles del caso' });
        const res = await handlePatch(req, { db });
        expect(res.status).toBe(400);
    });
});

// ── T5: handlePatch — coerción numérica de ref_payco ─────────────────────────

describe('handlePatch: coerción numérica de ref_payco', () => {
    it('acepta ref_payco como número y retorna 200', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({ updateSpy });
        const req = await makePatchRequest({
            ref_payco: 363771858,
            ref_hash: 'abc123',
            resumen_caso: 'Caso de prueba',
        });
        const res = await handlePatch(req, { db });
        expect(res.status).toBe(200);
        const body = (await res.json()) as Record<string, unknown>;
        expect(body.ok).toBe(true);
    });

    it('acepta ref_payco numérico para redimido: true', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({ updateSpy });
        const req = await makePatchRequest({ ref_payco: 363771858, redimido: true });
        const res = await handlePatch(req, { db });
        expect(res.status).toBe(200);
    });
});

// ── T6: handlePatch — PATCH sin resumen_caso guarda solo ref_hash ─────────────

describe('handlePatch: PATCH sin resumen_caso', () => {
    it('retorna 200 y guarda solo ref_hash cuando resumen_caso está ausente', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({ updateSpy });
        const req = await makePatchRequest({ ref_payco: 'EPY-123', ref_hash: 'HASH456' });
        const res = await handlePatch(req, { db });
        expect(res.status).toBe(200);
        const updateArg = updateSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(updateArg.ref_hash).toBe('HASH456');
        expect('resumen_caso' in updateArg).toBe(false);
    });

    it('incluye resumen_caso en el update cuando viene en el body', async () => {
        const updateEqSpy = vi.fn().mockResolvedValue({ error: null });
        const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy });
        const db = makeFakeDbForConfirmar({ updateSpy });
        const req = await makePatchRequest({ ref_payco: 'EPY-123', ref_hash: 'HASH456', resumen_caso: 'Mi caso' });
        const res = await handlePatch(req, { db });
        expect(res.status).toBe(200);
        const updateArg = updateSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(updateArg.ref_hash).toBe('HASH456');
        expect(updateArg.resumen_caso).toBe('Mi caso');
    });
});
