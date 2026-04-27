import { test, expect } from '@playwright/test';
import { AsesoriaCheckoutPage } from './helpers/AsesoriaCheckoutPage';

const FAKE_CALENDAR_URL = 'https://calendar.google.com/appointments/test-session-grexia';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Checkout (formulario + botón de pago)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Asesoria — Checkout', () => {
    test('muestra el formulario al entrar a /asesoria/checkout', async ({ page }) => {
        const checkout = new AsesoriaCheckoutPage(page);
        await checkout.goto();

        await checkout.assertFormVisible();
        await expect(page.locator('#nombre')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#caso')).toBeVisible();
    });

    test('el botón "Pagar" está visible (SDK mock en window)', async ({ page }) => {
        // Inyectar el mock del SDK antes de cargar la página
        await page.addInitScript(() => {
            Object.defineProperty(window, 'ePayco', {
                value: {
                    checkout: {
                        configure: () => ({
                            open: () => {},
                        }),
                    },
                },
                configurable: true,
            });
        });

        const checkout = new AsesoriaCheckoutPage(page);
        await checkout.goto();

        await checkout.assertPayButtonReady();
        await expect(page.getByTestId('btn-pagar')).toHaveText(/pagar \$59\.900/i);
    });

    test('valida campos requeridos al intentar pagar sin datos', async ({ page }) => {
        await page.addInitScript(() => {
            Object.defineProperty(window, 'ePayco', {
                value: { checkout: { configure: () => ({ open: () => {} }) } },
                configurable: true,
            });
        });

        const checkout = new AsesoriaCheckoutPage(page);
        await checkout.goto();

        await page.getByTestId('btn-pagar').click();

        await expect(page.getByText(/ingresa tu nombre/i)).toBeVisible();
        await expect(page.getByText(/correo electrónico válido/i)).toBeVisible();
    });

    test('llama a ePayco handler.open() con los datos del formulario', async ({ page }) => {
        await page.addInitScript(() => {
            Object.defineProperty(window, 'ePayco', {
                value: {
                    checkout: {
                        configure: () => ({
                            open: (params: unknown) => {
                                (window as unknown as Record<string, unknown>)['__epayco_calls__'] =
                                    (window as unknown as Record<string, unknown[]>)['__epayco_calls__'] ?? [];
                                (window as unknown as Record<string, unknown[]>)['__epayco_calls__'].push(params);
                            },
                        }),
                    },
                },
                configurable: true,
            });
        });

        const checkout = new AsesoriaCheckoutPage(page);
        await checkout.goto();
        await checkout.fillContactForm('Juan Pérez', 'juan@example.com', 'Mi consulta');
        await page.getByTestId('btn-pagar').click();

        const calls = (await page.evaluate(
            () => (window as unknown as Record<string, unknown>)['__epayco_calls__']
        )) as unknown[];
        expect(calls).toHaveLength(1);
        expect(calls[0]).toMatchObject({
            name_billing: 'Juan Pérez',
            email_billing: 'juan@example.com',
            amount: '59900',
        });

        // Verify localStorage was set
        const storedName = await page.evaluate(() => localStorage.getItem('grexia_checkout_name'));
        expect(storedName).toBe('Juan Pérez');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Página de confirmación — verificación de pago con mock
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Asesoria — Confirmacion', () => {
    test('acceso directo sin ref_payco muestra estado fallido', async ({ page }) => {
        const checkout = new AsesoriaCheckoutPage(page);

        await page.route('**/api/pago/estado**', (route) => {
            route.fulfill({ status: 200, body: JSON.stringify({ ok: false, reason: 'Sin referencia' }) });
        });

        await checkout.gotoConfirmacion();

        await expect(page.locator('[data-testid="confirmacion-fallido"]')).toBeVisible({
            timeout: 10_000,
        });
        await expect(page.getByText(/sin completar el pago/i)).toBeVisible();
    });

    test('ref válida y pago aceptado muestra botón "Agendar"', async ({ page }) => {
        const checkout = new AsesoriaCheckoutPage(page);

        await page.route('**/api/pago/estado**', (route) => {
            route.fulfill({
                status: 200,
                body: JSON.stringify({ ok: true, calendarUrl: FAKE_CALENDAR_URL }),
            });
        });

        await checkout.gotoConfirmacion('?ref_payco=TEST_REF_ACEPTADA');

        const btn = page.getByTestId('btn-agendar');
        await expect(btn).toBeVisible({ timeout: 10_000 });
        await expect(btn).toHaveAttribute('href', FAKE_CALENDAR_URL);
    });

    test('ref con pago rechazado muestra mensaje y botón de soporte', async ({ page }) => {
        const checkout = new AsesoriaCheckoutPage(page);

        await page.route('**/api/pago/estado**', (route) => {
            route.fulfill({
                status: 200,
                body: JSON.stringify({ ok: false, reason: 'Rechazada' }),
            });
        });

        await checkout.gotoConfirmacion('?ref_payco=TEST_REF_RECHAZADA');

        await expect(page.locator('[data-testid="confirmacion-fallido"]')).toBeVisible({
            timeout: 10_000,
        });
        await expect(page.getByText(/rechazada/i)).toBeVisible();
        await expect(page.getByTestId('btn-soporte')).toBeVisible();
    });

    test('el link de calendario NO aparece en el HTML estático', async ({ page }) => {
        await page.goto('/asesoria/confirmacion?ref_payco=TEST');

        const html = await page.content();
        expect(html).not.toContain('calendar.google.com/calendar/appointments');
    });
});
