import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StepProgress from '../StepProgress';

const TEST_STEPS = [
    { number: 1, label: 'Primero' },
    { number: 2, label: 'Segundo' },
    { number: 3, label: 'Tercero' },
    { number: 4, label: 'Cuarto' },
] as const;

describe('StepProgress — onStepClick (sin maxReachedStep)', () => {
    it('step completado (< currentStep) llama onStepClick(n) al hacer click', async () => {
        const onStepClick = vi.fn();
        render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={3}
                onStepClick={onStepClick}
            />
        );
        const btns = screen.getAllByRole('button', { name: /Ir al paso 1/i });
        await userEvent.click(btns[0]);
        expect(onStepClick).toHaveBeenCalledWith(1);
    });

    it('step activo es un botón disabled', () => {
        render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={2}
                onStepClick={vi.fn()}
            />
        );
        const activeBtns = screen
            .queryAllByRole('button')
            .filter((el) => el.getAttribute('aria-label')?.includes('Ir al paso 2'));
        expect(activeBtns.length).toBeGreaterThan(0);
        activeBtns.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('step futuro no visitado es un botón disabled (maxReachedStep defaults to currentStep)', () => {
        render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={1}
                onStepClick={vi.fn()}
            />
        );
        const futureBtns = screen.queryAllByRole('button', { name: /Ir al paso (2|3|4)/i });
        expect(futureBtns.length).toBeGreaterThan(0);
        futureBtns.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('sin onStepClick todos los botones están disabled', () => {
        render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={3}
            />
        );
        const btns = screen.queryAllByRole('button');
        expect(btns.length).toBeGreaterThan(0);
        btns.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('step completado tiene cursor-pointer en desktop', () => {
        const onStepClick = vi.fn();
        render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={3}
                onStepClick={onStepClick}
            />
        );
        const btns = screen.getAllByRole('button', { name: /Ir al paso 1/i });
        const hasPointer = btns.some((btn) => btn.className.includes('cursor-pointer'));
        expect(hasPointer).toBe(true);
    });

    it('múltiples steps completados tienen sus propios botones', async () => {
        const onStepClick = vi.fn();
        render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={4}
                onStepClick={onStepClick}
            />
        );
        const btns1 = screen.getAllByRole('button', { name: /Ir al paso 1/i });
        const btns2 = screen.getAllByRole('button', { name: /Ir al paso 2/i });
        await userEvent.click(btns1[0]);
        expect(onStepClick).toHaveBeenCalledWith(1);
        await userEvent.click(btns2[0]);
        expect(onStepClick).toHaveBeenCalledWith(2);
    });
});

describe('StepProgress — maxReachedStep', () => {
    it('step futuro visitado (> currentStep, <= maxReachedStep) es un botón clickeable', async () => {
        const onStepClick = vi.fn();
        // currentStep=1, maxReachedStep=3 → steps 2 y 3 son accesibles aunque sean "futuros"
        render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={1}
                maxReachedStep={3}
                onStepClick={onStepClick}
            />
        );
        const btns2 = screen.getAllByRole('button', { name: /Ir al paso 2/i });
        await userEvent.click(btns2[0]);
        expect(onStepClick).toHaveBeenCalledWith(2);

        const btns3 = screen.getAllByRole('button', { name: /Ir al paso 3/i });
        await userEvent.click(btns3[0]);
        expect(onStepClick).toHaveBeenCalledWith(3);
    });

    it('step fuera de maxReachedStep es un botón disabled', () => {
        render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={1}
                maxReachedStep={2}
                onStepClick={vi.fn()}
            />
        );
        // Step 3 y 4 están más allá de maxReachedStep=2
        const lockedBtns = screen.queryAllByRole('button', { name: /Ir al paso (3|4)/i });
        expect(lockedBtns.length).toBeGreaterThan(0);
        lockedBtns.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('step futuro no visitado tiene cursor-not-allowed', () => {
        const { container } = render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={2}
                maxReachedStep={2}
                onStepClick={vi.fn()}
            />
        );
        // Steps 3 y 4 están bloqueados
        const lockedEls = container.querySelectorAll('.cursor-not-allowed');
        expect(lockedEls.length).toBeGreaterThan(0);
    });

    it('step activo es un botón disabled sin cursor-not-allowed', () => {
        const { container } = render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={2}
                maxReachedStep={2}
                onStepClick={vi.fn()}
            />
        );
        const activeBtns = screen
            .queryAllByRole('button')
            .filter((el) => el.getAttribute('aria-label')?.includes('Ir al paso 2'));
        // Step activo es un botón disabled
        expect(activeBtns.length).toBeGreaterThan(0);
        activeBtns.forEach((btn) => expect(btn).toBeDisabled());
        // El step activo no tiene cursor-not-allowed (usa cursor-default)
        const lockedEls = Array.from(container.querySelectorAll('.cursor-not-allowed'));
        const activeHasLocked = lockedEls.some((el) => el.textContent?.includes('Segundo'));
        expect(activeHasLocked).toBe(false);
    });

    it('step completado (< currentStep) sigue siendo accesible con maxReachedStep mayor', async () => {
        const onStepClick = vi.fn();
        render(
            <StepProgress
                steps={TEST_STEPS}
                currentStep={3}
                maxReachedStep={4}
                onStepClick={onStepClick}
            />
        );
        // Step 4 es futuro pero fue visitado → botón
        const btns4 = screen.getAllByRole('button', { name: /Ir al paso 4/i });
        await userEvent.click(btns4[0]);
        expect(onStepClick).toHaveBeenCalledWith(4);
    });
});
