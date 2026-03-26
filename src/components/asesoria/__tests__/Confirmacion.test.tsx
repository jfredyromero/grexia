import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Confirmacion from '../Confirmacion';

const FAKE_CALENDAR = 'https://calendar.google.com/appointments/test-session';

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
            json: () => Promise.resolve({ ok: true, calendarUrl: FAKE_CALENDAR }),
        })
    );
}

function mockFetchFailed(reason = 'Rechazada') {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ ok: false, reason }),
        })
    );
}

function mockFetchNetworkError() {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
}

beforeEach(() => {
    setSearch('?ref_payco=TEST_REF_123');
    mockFetchOk();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Confirmacion', () => {
    it('muestra spinner mientras carga', () => {
        // fetch nunca resuelve durante este test
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));

        render(<Confirmacion />);

        expect(screen.getByTestId('confirmacion-loading')).toBeInTheDocument();
        expect(screen.getByText(/verificando tu pago/i)).toBeInTheDocument();
    });

    it('muestra botón "Agendar" con la URL correcta cuando pago es Aceptado', async () => {
        render(<Confirmacion />);

        const btn = await screen.findByTestId('btn-agendar');
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('href', FAKE_CALENDAR);
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
        expect(screen.getByText(/no pudimos verificar tu pago/i)).toBeInTheDocument();
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
});
