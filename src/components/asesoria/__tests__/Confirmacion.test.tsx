import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Confirmacion from '../Confirmacion';

const FAKE_CALENDLY_URL = 'https://calendly.com/grexiaco/test-session';

// ── Location mock ─────────────────────────────────────────────────────────────

function setSearch(search: string) {
    Object.defineProperty(window, 'location', {
        value: { ...window.location, search },
        writable: true,
    });
}

// ── Fetch mock helpers ────────────────────────────────────────────────────────

function mockFetchOk(extra: Record<string, unknown> = {}) {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({ ok: true, calendarUrl: FAKE_CALENDLY_URL, ...extra }),
        })
    );
}

function mockFetch202() {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            status: 202,
            json: () => Promise.resolve({}),
        })
    );
}

function mockFetchFailed(reason = 'Rechazada') {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({ ok: false, pago: { estado: reason, monto: 0 } }),
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

        expect(fetch).toHaveBeenCalledWith('/api/pago/estado?ref=TEST_REF_123');
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

    it('T5.2 muestra loading durante polls de 202, luego fallido tras fallback', async () => {
        vi.useFakeTimers();
        vi.stubGlobal(
            'fetch',
            vi
                .fn()
                .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
                .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
                .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
                .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
                .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
                .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
                .mockResolvedValue({
                    status: 200,
                    json: () => Promise.resolve({ ok: false, pago: { estado: 'Rechazada', monto: 0 } }),
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

    it('T3.2 tras 5 polls de 202, llama GET con ?fallback=true', async () => {
        vi.useFakeTimers();

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValue({
                status: 200,
                json: () => Promise.resolve({ ok: false, pago: { estado: 'Rechazada', monto: 0 } }),
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
        expect(fallbackCall).toBeDefined();
    });

    it('T3.3 sendResumenPatch NO se llama cuando GET retorna 202', async () => {
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

    it('T3.4 sendResumenPatch se llama cuando fallback retorna HTTP 200', async () => {
        vi.useFakeTimers();
        localStorage.setItem('grexia_checkout_notes', 'Notas de fallback');

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({ status: 202, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({ ok: true, calendarUrl: FAKE_CALENDLY_URL }),
            })
            .mockResolvedValue({ ok: true }); // PATCH response

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

        const patchCall = (fetchMock.mock.calls as [string, RequestInit][]).find(
            (c) => c[0] === '/api/pago/confirmar' && c[1]?.method === 'PATCH'
        );
        expect(patchCall).toBeDefined();
        expect(JSON.parse(patchCall![1].body as string).resumen_caso).toBe('Notas de fallback');
    });

    it('T3.5 sendResumenPatch se llama cuando GET inicial retorna HTTP 200', async () => {
        localStorage.setItem('grexia_checkout_notes', 'Notas iniciales');

        vi.stubGlobal(
            'fetch',
            vi
                .fn()
                .mockResolvedValueOnce({
                    status: 200,
                    json: () => Promise.resolve({ ok: true, calendarUrl: FAKE_CALENDLY_URL }),
                })
                .mockResolvedValueOnce({ ok: true })
        );

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-exito');

        const fetchMock = fetch as unknown as MockInstance;
        const patchCall = fetchMock.mock.calls.find(
            (c: unknown[]) => c[0] === '/api/pago/confirmar' && (c[1] as { method?: string })?.method === 'PATCH'
        );
        expect(patchCall).toBeDefined();
        expect(JSON.parse((patchCall![1] as { body: string }).body).resumen_caso).toBe('Notas iniciales');
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

        vi.stubGlobal(
            'fetch',
            vi
                .fn()
                .mockResolvedValueOnce({
                    status: 200,
                    json: () => Promise.resolve({ ok: false, pago: { estado: 'Rechazada', monto: 0 } }),
                })
                .mockResolvedValueOnce({ ok: true })
        );

        render(<Confirmacion />);

        await screen.findByTestId('confirmacion-fallido');

        const fetchMock = fetch as unknown as MockInstance;
        expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
        const patchCall = fetchMock.mock.calls.find(
            (c: unknown[]) => c[0] === '/api/pago/confirmar' && (c[1] as { method?: string })?.method === 'PATCH'
        );
        expect(patchCall).toBeDefined();
        expect(JSON.parse((patchCall![1] as { body: string }).body).resumen_caso).toBe('Notas del caso fallido');
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
