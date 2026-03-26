import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AsesoriaCheckoutPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/asesoria/checkout');
        // client:only="react" — wait for React to hydrate
        await this.page.waitForSelector('[data-testid="checkout-form"]', { timeout: 10_000 });
    }

    async gotoConfirmacion(search = '') {
        await this.page.goto(`/asesoria/confirmacion${search}`);
    }

    async fillContactForm(nombre: string, email: string, caso?: string) {
        await this.page.fill('#nombre', nombre);
        await this.page.fill('#email', email);
        if (caso) await this.page.fill('#caso', caso);
    }

    async assertFormVisible() {
        await expect(this.page.locator('[data-testid="checkout-form"]')).toBeVisible();
    }

    async assertPayButtonReady() {
        const btn = this.page.getByTestId('btn-pagar');
        await expect(btn).toBeVisible();
        await expect(btn).not.toBeDisabled();
    }

    async assertPayButtonLoading() {
        await expect(this.page.getByText(/cargando/i)).toBeVisible();
    }
}
