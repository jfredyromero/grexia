import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkout from '../Checkout';

const PROPS = {
    epaycoKey: 'TEST_KEY',
    isTest: 'true',
    responseUrl: 'https://grexia.co/asesoria/confirmacion',
    confirmationUrl: 'https://grexia.co/api/pago/confirmar',
};

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
    // @ts-expect-error cleanup
    delete window.ePayco;
    vi.restoreAllMocks();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fillAndSubmit(nombre = 'Juan Pérez', email = 'juan@example.com') {
    await userEvent.type(screen.getByLabelText(/nombre completo/i), nombre);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), email);
    await userEvent.click(screen.getByTestId('btn-pagar'));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Checkout', () => {
    it('renderiza el formulario con campos de nombre y email', () => {
        render(<Checkout {...PROPS} />);

        expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cuéntanos tu caso/i)).toBeInTheDocument();
    });

    it('el botón "Pagar" está habilitado cuando el SDK está disponible en window', () => {
        render(<Checkout {...PROPS} />);

        const btn = screen.getByTestId('btn-pagar');
        expect(btn).not.toBeDisabled();
        expect(btn).toHaveTextContent(/pagar/i);
    });

    it('muestra error si nombre está vacío al intentar pagar', async () => {
        render(<Checkout {...PROPS} />);

        await userEvent.type(screen.getByLabelText(/correo/i), 'a@b.com');
        await userEvent.click(screen.getByTestId('btn-pagar'));

        expect(screen.getByText(/ingresa tu nombre/i)).toBeInTheDocument();
        expect(openMock).not.toHaveBeenCalled();
    });

    it('muestra error si email es inválido', async () => {
        render(<Checkout {...PROPS} />);

        await userEvent.type(screen.getByLabelText(/nombre/i), 'Juan');
        await userEvent.type(screen.getByLabelText(/correo/i), 'no-es-un-email');
        await userEvent.click(screen.getByTestId('btn-pagar'));

        expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
        expect(openMock).not.toHaveBeenCalled();
    });

    it('llama a handler.open() con datos correctos al enviar el formulario válido', async () => {
        render(<Checkout {...PROPS} />);

        await fillAndSubmit('Ana García', 'ana@example.com');

        expect(openMock).toHaveBeenCalledOnce();
        expect(openMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name_billing: 'Ana García',
                email_billing: 'ana@example.com',
                amount: '59900',
                currency: 'cop',
                response: PROPS.responseUrl,
                confirmation: PROPS.confirmationUrl,
                methodsDisable: ['CASH', 'SP'],
            })
        );
    });

    it('guarda nombre y email en localStorage antes de abrir el modal', async () => {
        render(<Checkout {...PROPS} />);

        await fillAndSubmit('Carlos López', 'carlos@example.com');

        expect(localStorage.getItem('grexia_checkout_name')).toBe('Carlos López');
        expect(localStorage.getItem('grexia_checkout_email')).toBe('carlos@example.com');
    });

    it('configura el SDK con la key y el modo test correctos', () => {
        render(<Checkout {...PROPS} />);

        expect(configureMock).toHaveBeenCalledWith({
            key: 'TEST_KEY',
            test: true,
        });
    });

    it('limpia errores al corregir los campos y reenviar', async () => {
        render(<Checkout {...PROPS} />);

        // Primer intento sin datos → errores
        await userEvent.click(screen.getByTestId('btn-pagar'));
        expect(screen.getByText(/ingresa tu nombre/i)).toBeInTheDocument();

        // Corregir y reenviar
        await userEvent.type(screen.getByLabelText(/nombre/i), 'María');
        await userEvent.type(screen.getByLabelText(/correo/i), 'maria@example.com');
        await userEvent.click(screen.getByTestId('btn-pagar'));

        await waitFor(() => expect(screen.queryByText(/ingresa tu nombre/i)).not.toBeInTheDocument());
        expect(openMock).toHaveBeenCalledOnce();
    });
});
