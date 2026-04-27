import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkout from '../Checkout';

// ── ePayco SDK mock ───────────────────────────────────────────────────────────

const openMock = vi.fn();
const configureMock = vi.fn(() => ({ open: openMock }));

function installSdkMock() {
    Object.defineProperty(window, 'ePayco', {
        value: { checkout: { configure: configureMock } },
        writable: true,
        configurable: true,
    });
}

beforeEach(() => {
    installSdkMock();
    openMock.mockClear();
    configureMock.mockClear();
});

afterEach(() => {
    delete window.ePayco;
    vi.restoreAllMocks();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Espera que el SDK esté listo (intervalo de 100 ms) y rellena el formulario. */
async function fillAndSubmit(nombre = 'Juan Pérez', email = 'juan@example.com', celular = '3001234567') {
    await userEvent.type(screen.getByLabelText(/nombre completo/i), nombre);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), email);
    await userEvent.type(screen.getByLabelText(/número de celular/i), celular);
    await userEvent.selectOptions(screen.getByLabelText(/tipo de documento/i), 'CC');
    await userEvent.type(screen.getByLabelText(/número de documento/i), '12345678');
    await userEvent.type(screen.getByLabelText(/dirección/i), 'Calle 1 # 2-3, Bogotá');
    await waitFor(() => expect(screen.getByTestId('btn-pagar')).not.toBeDisabled());
    await userEvent.click(screen.getByTestId('btn-pagar'));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Checkout', () => {
    it('renderiza el formulario con campos de nombre, email y celular', () => {
        render(<Checkout />);

        expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/número de celular/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cuéntanos tu caso/i)).toBeInTheDocument();
    });

    it('el botón "Pagar" se habilita cuando el SDK está disponible en window', async () => {
        render(<Checkout />);

        await waitFor(() => expect(screen.getByTestId('btn-pagar')).not.toBeDisabled());
        expect(screen.getByTestId('btn-pagar')).toHaveTextContent(/pagar/i);
    });

    it('muestra error si nombre está vacío al intentar pagar', async () => {
        render(<Checkout />);

        await waitFor(() => expect(screen.getByTestId('btn-pagar')).not.toBeDisabled());
        await userEvent.type(screen.getByLabelText(/correo/i), 'a@b.com');
        await userEvent.type(screen.getByLabelText(/número de celular/i), '3001234567');
        await userEvent.click(screen.getByTestId('btn-pagar'));

        expect(screen.getByText(/ingresa tu nombre/i)).toBeInTheDocument();
        expect(openMock).not.toHaveBeenCalled();
    });

    it('muestra error si email es inválido', async () => {
        render(<Checkout />);

        await waitFor(() => expect(screen.getByTestId('btn-pagar')).not.toBeDisabled());
        await userEvent.type(screen.getByLabelText(/nombre/i), 'Juan');
        await userEvent.type(screen.getByLabelText(/correo/i), 'no-es-un-email');
        await userEvent.type(screen.getByLabelText(/número de celular/i), '3001234567');
        await userEvent.click(screen.getByTestId('btn-pagar'));

        expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
        expect(openMock).not.toHaveBeenCalled();
    });

    it('llama a handler.open() con datos correctos al enviar el formulario válido', async () => {
        render(<Checkout />);

        await fillAndSubmit('Ana García', 'ana@example.com');

        expect(openMock).toHaveBeenCalledOnce();
        expect(openMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name_billing: 'Ana García',
                email_billing: 'ana@example.com',
                amount: '59900',
                currency: 'cop',
                methodsDisable: ['CASH', 'SP'],
            })
        );
    });

    it('guarda nombre, email y celular en localStorage antes de abrir el modal', async () => {
        render(<Checkout />);

        await fillAndSubmit('Carlos López', 'carlos@example.com', '3009876543');

        expect(localStorage.getItem('grexia_checkout_name')).toBe('Carlos López');
        expect(localStorage.getItem('grexia_checkout_email')).toBe('carlos@example.com');
        expect(localStorage.getItem('grexia_checkout_celular')).toBe('3009876543');
    });

    it('configura el SDK con la key y el modo test al detectar window.ePayco', async () => {
        render(<Checkout />);

        await waitFor(() => expect(configureMock).toHaveBeenCalledOnce());
        expect(configureMock).toHaveBeenCalledWith(expect.objectContaining({ test: expect.any(Boolean) }));
    });

    it('limpia errores al corregir los campos y reenviar', async () => {
        render(<Checkout />);

        await waitFor(() => expect(screen.getByTestId('btn-pagar')).not.toBeDisabled());

        // Primer intento sin datos → errores
        await userEvent.click(screen.getByTestId('btn-pagar'));
        expect(screen.getByText(/ingresa tu nombre/i)).toBeInTheDocument();

        // Corregir y reenviar
        await userEvent.type(screen.getByLabelText(/nombre/i), 'María');
        await userEvent.type(screen.getByLabelText(/correo/i), 'maria@example.com');
        await userEvent.type(screen.getByLabelText(/número de celular/i), '3001234567');
        await userEvent.selectOptions(screen.getByLabelText(/tipo de documento/i), 'CC');
        await userEvent.type(screen.getByLabelText(/número de documento/i), '12345678');
        await userEvent.type(screen.getByLabelText(/dirección/i), 'Calle 1 # 2-3');
        await userEvent.click(screen.getByTestId('btn-pagar'));

        await waitFor(() => expect(screen.queryByText(/ingresa tu nombre/i)).not.toBeInTheDocument());
        expect(openMock).toHaveBeenCalledOnce();
    });
});
