import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

function mockFetchOk() {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ ok: true, calendarUrl: FAKE_CALENDLY_URL }),
        })
    );
}

function mockFetchFailed(reason = 'Rechazada') {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
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

    it('deshabilita el botón y guarda en localStorage al recibir evento calendly.event_scheduled', async () => {
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
        expect(localStorage.getItem('booked_TEST_REF_123')).toBe('1');
    });

    it('botón inicia deshabilitado si la ref ya está en localStorage', async () => {
        localStorage.setItem('booked_TEST_REF_123', '1');

        render(<Confirmacion />);

        const btn = await screen.findByTestId('btn-agendar');
        expect(btn).toBeDisabled();
        expect(screen.getByText(/sesión agendada/i)).toBeInTheDocument();
    });
});
