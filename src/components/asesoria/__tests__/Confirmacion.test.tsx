import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Confirmacion from '../Confirmacion';

const FAKE_CALENDLY_URL = 'https://calendly.com/grexiaco/test-session';
const FAKE_PRIV_REF = 'PRIV_REF_001';

const FAKE_PAGO_OK = {
    estado: 'Aceptada',
    nombre: 'Test User',
    email: 'test@test.com',
    telefono: '3001234567',
    monto: 150000,
    moneda: 'COP',
    fecha: '2026-04-08',
    banco: '',
    tarjeta: '',
    franquicia: 'Visa',
    tipoPago: 'TDC',
    cuotas: '1',
    transactionId: 'TXN001',
    descripcion: 'Asesoría',
    codigoAprobacion: 'APR001',
    motivoRechazo: '',
    tipoDocumento: '',
    numeroDocumento: '',
    direccion: '',
};

const EMPTY_PAGO = {
    estado: 'Rechazada',
    nombre: '',
    email: '',
    telefono: '',
    monto: 0,
    moneda: 'COP',
    fecha: '',
    banco: '',
    tarjeta: '',
    franquicia: '',
    tipoPago: '',
    cuotas: '',
    transactionId: '',
    descripcion: '',
    codigoAprobacion: '',
    motivoRechazo: '',
    tipoDocumento: '',
    numeroDocumento: '',
    direccion: '',
};

// ── Location mock ─────────────────────────────────────────────────────────────

function setSearch(search: string) {
    Object.defineProperty(window, 'location', {
        value: { ...window.location, search },
        writable: true,
    });
}

// ── Fetch mock helpers ─────────────────────────────────────────────────────────
// All helpers use URL-routing: /referencia/ → Step 1, /estado → Step 2, /confirmar → PATCH

function mockFetchOk(estadoExtra: Record<string, unknown> = {}) {
    vi.stubGlobal(
        'fetch',
        vi.fn((url: string) => {
            if ((url as string).includes('/api/pago/referencia/')) {
                return Promise.resolve({
                    status: 200,
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            x_ref_payco: FAKE_PRIV_REF,
                            masked: { ok: true, pago: FAKE_PAGO_OK, calendarUrl: FAKE_CALENDLY_URL, redimido: false },
                        }),
                });
            }
            if ((url as string).includes('/api/pago/estado')) {
                return Promise.resolve({
                    status: 200,
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            ok: true,
                            calendarUrl: FAKE_CALENDLY_URL,
                            pago: FAKE_PAGO_OK,
                            redimido: false,
                            ...estadoExtra,
                        }),
                });
            }
            return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve({ ok: true }) });
        })
    );
}

function mockFetch202() {
    vi.stubGlobal(
        'fetch',
        vi.fn((url: string) => {
            if ((url as string).includes('/api/pago/referencia/')) {
                return Promise.resolve({
                    status: 200,
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            x_ref_payco: FAKE_PRIV_REF,
                            masked: { ok: false, pago: EMPTY_PAGO, redimido: false },
                        }),
                });
            }
            return Promise.resolve({ status: 202, ok: false, json: () => Promise.resolve({}) });
        })
    );
}

function mockFetchFailed(reason = 'Rechazada') {
    vi.stubGlobal(
        'fetch',
        vi.fn((url: string) => {
            if ((url as string).includes('/api/pago/referencia/')) {
                return Promise.resolve({
                    status: 200,
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            x_ref_payco: FAKE_PRIV_REF,
                            masked: { ok: false, pago: { ...EMPTY_PAGO, estado: reason }, redimido: false },
                        }),
                });
            }
            if ((url as string).includes('/api/pago/estado')) {
                return Promise.resolve({
                    status: 200,
                    ok: true,
                    json: () => Promise.resolve({ ok: false, pago: { estado: reason, monto: 0 } }),
                });
            }
            return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve({ ok: true }) });
        })
    );
}

function mockFetchNetworkError() {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
}

beforeEach(() => {
    setSearch('?ref_payco=TEST_REF_123');
    localStorage.clear();
    mockFetchOk();
});

afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Confirmacion', () => {
    it('muestra spinner mientras carga', () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => new Promise(() => {}))
        );

        render(<Confirmacion />);

        expect(screen.getByTestId('confirmacion-loading')).toBeInTheDocument();
        expect(screen.getByText(/verificando tu pago/i)).toBeInTheDocument();
    });

    it('muestra botón "Agendar" con la URL de Calendly correcta cuando pago es Aceptado', async () => {
        render(<Confirmacion />);

        const btn = await screen.findByTestId('btn-agendar');
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('data-calendly-url', FAKE_CALENDLY_URL);
        expect(screen.getByTestId('confirmacion-exito')).toBeInTheDocument();
    });

    it('llama al endpoint con la ref_payco correcta', async () => {
        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-exito');

        expect(fetch).toHaveBeenCalledWith('/api/pago/referencia/TEST_REF_123');
        expect(fetch).toHaveBeenCalledWith(`/api/pago/estado/${FAKE_PRIV_REF}`);
    });

    it('muestra mensaje de pago fallido cuando estado no es Aceptada', async () => {
        mockFetchFailed('Rechazada');

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-fallido');
        expect(screen.getByText(/pago no completado/i)).toBeInTheDocument();
        expect(screen.getByText(/rechazada/i)).toBeInTheDocument();
        expect(screen.getByTestId('btn-soporte')).toBeInTheDocument();
    });

    it('muestra mensaje de sin referencia cuando no hay ref_payco en URL', async () => {
        setSearch('');

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-fallido');
        expect(screen.getByText(/sin completar el pago/i)).toBeInTheDocument();
    });

    it('muestra mensaje de error de conexión y botón reintentar cuando fetch falla', async () => {
        mockFetchNetworkError();

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-error');
        expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
        expect(screen.getByTestId('btn-reintentar')).toBeInTheDocument();
    });

    it('al hacer click en Reintentar recarga la página', async () => {
        mockFetchNetworkError();
        const reloadMock = vi.fn();
        Object.defineProperty(window, 'location', {
            value: { ...window.location, reload: reloadMock, search: '?ref_payco=X' },
            writable: true,
        });

        render(<Confirmacion />);

        const btn = await screen.findByTestId('btn-reintentar');
        await userEvent.click(btn);

        await waitFor(() => expect(reloadMock).toHaveBeenCalled());
    });

    it('deshabilita el botón al recibir evento calendly.event_scheduled', async () => {
        render(<Confirmacion />);

        await screen.findByTestId('btn-agendar');

        window.dispatchEvent(
            new MessageEvent('message', {
                data: { event: 'calendly.event_scheduled' },
            })
        );

        await waitFor(() => {
            expect(screen.getByTestId('btn-agendar')).toBeDisabled();
        });
        expect(screen.getByText(/sesión agendada/i)).toBeInTheDocument();
    });

    it('botón inicia deshabilitado cuando fetch retorna redimido: true', async () => {
        mockFetchOk({ redimido: true });

        render(<Confirmacion />);

        const btn = await screen.findByTestId('btn-agendar');
        expect(btn).toBeDisabled();
        expect(screen.getByText(/sesión agendada/i)).toBeInTheDocument();
    });
});

// ── T5: polling — loading y polling muestran la misma pantalla ───────────────

describe('Confirmacion: polling universal', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
        localStorage.clear();
    });

    it('T5.1 muestra loading cuando GET retorna HTTP 202', async () => {
        mockFetch202();
        render(<Confirmacion />);
        await screen.findByTestId('confirmacion-loading');
        expect(screen.getByTestId('confirmacion-loading')).toBeInTheDocument();
    });

    it('T5.2 muestra loading durante polls de 202, luego datos enmascarados', async () => {
        vi.useFakeTimers();
        vi.stubGlobal(
            'fetch',
            vi.fn((url: string) => {
                if ((url as string).includes('/api/pago/referencia/')) {
                    return Promise.resolve({
                        status: 200,
                        ok: true,
                        json: () =>
                            Promise.resolve({
                                x_ref_payco: 'PRIV_T52',
                                masked: { ok: false, pago: { ...EMPTY_PAGO, estado: 'Rechazada' }, redimido: false },
                            }),
                    });
                }
                return Promise.resolve({ status: 202, ok: false, json: () => Promise.resolve({}) });
            })
        );

        render(<Confirmacion />);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(screen.getByTestId('confirmacion-loading')).toBeInTheDocument();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(5 * 5000 + 500);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
        });

        expect(screen.getByTestId('confirmacion-fallido')).toBeInTheDocument();
    });
});

// ── T3: pago-v4 — comportamiento HTTP 202 / fallback ─────────────────────────

describe('Confirmacion: pago-v4 polling HTTP 202', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
        localStorage.clear();
    });

    it('T3.2 tras 5 polls de 202, NO llama GET con ?fallback=true', async () => {
        vi.useFakeTimers();

        const fetchMock = vi.fn((url: string) => {
            if ((url as string).includes('/api/pago/referencia/')) {
                return Promise.resolve({
                    status: 200,
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            x_ref_payco: 'PRIV_T32',
                            masked: {
                                ok: false,
                                pago: {
                                    estado: 'Rechazada',
                                    monto: 0,
                                    nombre: '',
                                    email: '',
                                    moneda: 'COP',
                                    franquicia: '',
                                    tipoPago: '',
                                    banco: '',
                                    tarjeta: '',
                                    cuotas: '',
                                    transactionId: '',
                                    descripcion: '',
                                    codigoAprobacion: '',
                                    motivoRechazo: '',
                                    fecha: '',
                                    tipoDocumento: '',
                                    numeroDocumento: '',
                                    direccion: '',
                                },
                                redimido: false,
                            },
                        }),
                });
            }
            return Promise.resolve({ status: 202, ok: false, json: () => Promise.resolve({}) });
        });

        vi.stubGlobal('fetch', fetchMock);

        render(<Confirmacion />);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(5 * 5000 + 500);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
        });

        const allCalls = fetchMock.mock.calls as [string, ...unknown[]][];
        const fallbackCall = allCalls.find((c) => (c[0] as string).includes('fallback=true'));
        expect(fallbackCall).toBeUndefined();
    });

    it('T3.3 sendResumenPatch NO se llama cuando /estado retorna 202', async () => {
        localStorage.setItem('grexia_checkout_notes', 'Notas de prueba');

        mockFetch202();

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-loading');

        const fetchMock = fetch as unknown as MockInstance;
        const patchCall = fetchMock.mock.calls.find(
            (c: unknown[]) => c[0] === '/api/pago/confirmar' && (c[1] as { method?: string })?.method === 'PATCH'
        );
        expect(patchCall).toBeUndefined();
    });

    it('T3.4 tras 5 polls de 202, NO llama PATCH aunque haya notas en localStorage', async () => {
        vi.useFakeTimers();
        localStorage.setItem('grexia_checkout_notes', 'Notas de fallback');

        const fetchMock = vi.fn((url: string) => {
            if ((url as string).includes('/api/pago/referencia/')) {
                return Promise.resolve({
                    status: 200,
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            x_ref_payco: 'PRIV_T34',
                            masked: {
                                ok: false,
                                pago: {
                                    estado: 'Rechazada',
                                    monto: 0,
                                    nombre: '',
                                    email: '',
                                    moneda: 'COP',
                                    franquicia: '',
                                    tipoPago: '',
                                    banco: '',
                                    tarjeta: '',
                                    cuotas: '',
                                    transactionId: '',
                                    descripcion: '',
                                    codigoAprobacion: '',
                                    motivoRechazo: '',
                                    fecha: '',
                                    tipoDocumento: '',
                                    numeroDocumento: '',
                                    direccion: '',
                                },
                                redimido: false,
                            },
                        }),
                });
            }
            return Promise.resolve({ status: 202, ok: false, json: () => Promise.resolve({}) });
        });

        vi.stubGlobal('fetch', fetchMock);

        render(<Confirmacion />);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(5 * 5000 + 500);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
        });

        const patchCalls = (fetchMock.mock.calls as unknown as [string, RequestInit][]).filter(
            (c) => c[0] === '/api/pago/confirmar' && c[1]?.method === 'PATCH'
        );
        expect(patchCalls).toHaveLength(0);
    });

    it('T3.5 sendResumenPatch se llama cuando GET inicial retorna HTTP 200', async () => {
        localStorage.setItem('grexia_checkout_notes', 'Notas iniciales');
        localStorage.setItem('grexia_checkout_patch_done', 'false');

        vi.stubGlobal(
            'fetch',
            vi.fn((url: string) => {
                if ((url as string).includes('/api/pago/referencia/')) {
                    return Promise.resolve({
                        status: 200,
                        ok: true,
                        json: () =>
                            Promise.resolve({
                                x_ref_payco: FAKE_PRIV_REF,
                                masked: {
                                    ok: true,
                                    pago: FAKE_PAGO_OK,
                                    calendarUrl: FAKE_CALENDLY_URL,
                                    redimido: false,
                                },
                            }),
                    });
                }
                if ((url as string).includes('/api/pago/estado')) {
                    return Promise.resolve({
                        status: 200,
                        ok: true,
                        json: () => Promise.resolve({ ok: true, calendarUrl: FAKE_CALENDLY_URL }),
                    });
                }
                return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve({ ok: true }) });
            })
        );

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-exito');

        const fetchMock = fetch as unknown as MockInstance;
        const patchCall = fetchMock.mock.calls.find(
            (c: unknown[]) => c[0] === '/api/pago/confirmar' && (c[1] as { method?: string })?.method === 'PATCH'
        );
        expect(patchCall).toBeDefined();
        const patchBody = JSON.parse((patchCall![1] as { body: string }).body) as Record<string, string>;
        expect(patchBody.resumen_caso).toBe('Notas iniciales');
        expect(patchBody.ref_hash).toBe('TEST_REF_123');
        expect(patchBody.ref_payco).toBe(FAKE_PRIV_REF);
    });
});

// ── T6: sendResumenPatch para fallidos ────────────────────────────────────────

describe('Confirmacion: sendResumenPatch para fallidos', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        localStorage.clear();
    });

    it('T6.1 llama sendResumenPatch cuando GET retorna HTTP 200 y el pago es fallido', async () => {
        localStorage.setItem('grexia_checkout_notes', 'Notas del caso fallido');
        localStorage.setItem('grexia_checkout_patch_done', 'false');

        vi.stubGlobal(
            'fetch',
            vi.fn((url: string) => {
                if ((url as string).includes('/api/pago/referencia/')) {
                    return Promise.resolve({
                        status: 200,
                        ok: true,
                        json: () =>
                            Promise.resolve({
                                x_ref_payco: FAKE_PRIV_REF,
                                masked: { ok: false, pago: { ...EMPTY_PAGO, estado: 'Rechazada' }, redimido: false },
                            }),
                    });
                }
                if ((url as string).includes('/api/pago/estado')) {
                    return Promise.resolve({
                        status: 200,
                        ok: true,
                        json: () => Promise.resolve({ ok: false, pago: { estado: 'Rechazada', monto: 0 } }),
                    });
                }
                return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve({ ok: true }) });
            })
        );

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-fallido');

        const fetchMock = fetch as unknown as MockInstance;
        const patchCall = fetchMock.mock.calls.find(
            (c: unknown[]) => c[0] === '/api/pago/confirmar' && (c[1] as { method?: string })?.method === 'PATCH'
        );
        expect(patchCall).toBeDefined();
        const patchBody = JSON.parse((patchCall![1] as { body: string }).body) as Record<string, string>;
        expect(patchBody.resumen_caso).toBe('Notas del caso fallido');
        expect(patchBody.ref_hash).toBe('TEST_REF_123');
        expect(patchBody.ref_payco).toBe(FAKE_PRIV_REF);
    });
});

// ── T7: sin localStorage para agendado ───────────────────────────────────────

describe('Confirmacion: sin localStorage para agendado', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        localStorage.clear();
    });

    it('T7.1 agendado inicia false aunque LS tenga booked_ key cuando data.redimido es false', async () => {
        localStorage.setItem('booked_TEST_REF_123', '1');
        mockFetchOk({ redimido: false });

        render(<Confirmacion />);

        const btn = await screen.findByTestId('btn-agendar');
        expect(btn).not.toBeDisabled();
    });

    it('T7.2 calendly.event_scheduled no guarda en localStorage', async () => {
        render(<Confirmacion />);
        await screen.findByTestId('btn-agendar');

        window.dispatchEvent(new MessageEvent('message', { data: { event: 'calendly.event_scheduled' } }));

        await waitFor(() => {
            expect(screen.getByTestId('btn-agendar')).toBeDisabled();
        });
        expect(localStorage.getItem('booked_TEST_REF_123')).toBeNull();
    });
});

// ── V6: pago-v6 — estado no-encontrado, flag LS, botones mobile ──────────────

describe('Confirmacion: pago-v6', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        localStorage.clear();
    });

    it('V6.1 muestra estado no-encontrado cuando /referencia retorna 404', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn((url: string) => {
                if ((url as string).includes('/api/pago/referencia/')) {
                    return Promise.resolve({
                        status: 404,
                        ok: false,
                        json: () => Promise.resolve({ error: 'no-encontrado' }),
                    });
                }
                return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve({ ok: true }) });
            })
        );

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-no-encontrado');
        expect(screen.getByText(/referencia no encontrada/i)).toBeInTheDocument();
    });

    it('V6.2 muestra error de conexión (no no-encontrado) cuando /referencia retorna 502', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn((url: string) => {
                if ((url as string).includes('/api/pago/referencia/')) {
                    return Promise.resolve({
                        status: 502,
                        ok: false,
                        json: () => Promise.resolve({ error: 'ePayco no disponible' }),
                    });
                }
                return Promise.resolve({ status: 200, ok: true, json: () => Promise.resolve({ ok: true }) });
            })
        );

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-error');
        expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
    });

    it('V6.3 NO llama PATCH cuando grexia_checkout_patch_done es true', async () => {
        localStorage.setItem('grexia_checkout_patch_done', 'true');
        localStorage.setItem('grexia_checkout_notes', 'Notas que no deben enviarse');

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-exito');

        const fetchMock = fetch as unknown as import('vitest').MockInstance;
        const patchCall = fetchMock.mock.calls.find(
            (c: unknown[]) => c[0] === '/api/pago/confirmar' && (c[1] as { method?: string })?.method === 'PATCH'
        );
        expect(patchCall).toBeUndefined();
    });

    it('V6.4 llama PATCH aunque notas estén vacías cuando grexia_checkout_patch_done es false', async () => {
        localStorage.setItem('grexia_checkout_patch_done', 'false');

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-exito');

        const fetchMock = fetch as unknown as import('vitest').MockInstance;
        const patchCall = fetchMock.mock.calls.find(
            (c: unknown[]) => c[0] === '/api/pago/confirmar' && (c[1] as { method?: string })?.method === 'PATCH'
        );
        expect(patchCall).toBeDefined();
        const patchBody = JSON.parse((patchCall![1] as { body: string }).body) as Record<string, unknown>;
        expect(patchBody.ref_hash).toBe('TEST_REF_123');
        expect(patchBody.ref_payco).toBe(FAKE_PRIV_REF);
        expect('resumen_caso' in patchBody).toBe(false);
    });
});

// ── V5: pago-v5 — flujo dos pasos (referencia → estado) ──────────────────────

describe('Confirmacion: pago-v5 flujo dos pasos', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
        localStorage.clear();
    });

    it('V5.1 llama primero a /api/pago/referencia/{hash} antes que a /api/pago/estado', async () => {
        const calls: string[] = [];
        vi.stubGlobal(
            'fetch',
            vi.fn((url: string) => {
                calls.push(url as string);
                if ((url as string).includes('/api/pago/referencia/')) {
                    return Promise.resolve({
                        status: 200,
                        ok: true,
                        json: () =>
                            Promise.resolve({
                                x_ref_payco: 'PRIV_V5',
                                masked: {
                                    ok: true,
                                    pago: {
                                        estado: 'Aceptada',
                                        monto: 150000,
                                        nombre: 'Test',
                                        email: 't@t.com',
                                        moneda: 'COP',
                                        franquicia: 'Visa',
                                        tipoPago: 'TDC',
                                        banco: '',
                                        tarjeta: '',
                                        cuotas: '1',
                                        transactionId: 'TXN',
                                        descripcion: 'Asesoría',
                                        codigoAprobacion: 'APR',
                                        motivoRechazo: '',
                                        fecha: '2026-04-08',
                                        tipoDocumento: '',
                                        numeroDocumento: '',
                                        direccion: '',
                                    },
                                    calendarUrl: FAKE_CALENDLY_URL,
                                    redimido: false,
                                },
                            }),
                    });
                }
                return Promise.resolve({
                    status: 200,
                    ok: true,
                    json: () => Promise.resolve({ ok: true, calendarUrl: FAKE_CALENDLY_URL }),
                });
            })
        );

        render(<Confirmacion />);
        await screen.findByTestId('confirmacion-exito');

        expect(calls[0]).toContain('/api/pago/referencia/TEST_REF_123');
    });

    it('V5.2 muestra pantalla no-encontrado cuando /referencia retorna 404', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn((url: string) => {
                if ((url as string).includes('/api/pago/referencia/')) {
                    return Promise.resolve({
                        status: 404,
                        ok: false,
                        json: () => Promise.resolve({ error: 'no-encontrado' }),
                    });
                }
                return Promise.resolve({
                    status: 200,
                    ok: true,
                    json: () => Promise.resolve({ ok: true, calendarUrl: FAKE_CALENDLY_URL }),
                });
            })
        );

        render(<Confirmacion />);
        await screen.findByTestId('confirmacion-no-encontrado');
    });
});

// ── T8: vista de carga unificada ──────────────────────────────────────────────

describe('Confirmacion: vista de carga', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('T8.1 muestra la misma pantalla de carga durante polling (202) que durante loading inicial', async () => {
        mockFetch202();

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-loading');
        expect(screen.getByText(/verificando tu pago/i)).toBeInTheDocument();
    });
});
