import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { INITIAL_PAGARE_DATA } from '../../types';
import StepAcreedor from '../StepAcreedor';
import StepDeudor from '../StepDeudor';
import StepObligacion from '../StepObligacion';

const noop = vi.fn();

describe('forceValidate — muestra errores al intentar saltar step inválido', () => {
    describe('StepAcreedor', () => {
        it('no muestra errores con forceValidate=0', () => {
            render(
                <StepAcreedor
                    data={INITIAL_PAGARE_DATA.acreedor}
                    onChange={noop}
                    onNext={noop}
                    forceValidate={0}
                />
            );
            expect(screen.queryByText('El nombre es requerido.')).toBeNull();
        });

        it('muestra errores cuando forceValidate cambia a > 0', () => {
            const { rerender } = render(
                <StepAcreedor
                    data={INITIAL_PAGARE_DATA.acreedor}
                    onChange={noop}
                    onNext={noop}
                    forceValidate={0}
                />
            );
            rerender(
                <StepAcreedor
                    data={INITIAL_PAGARE_DATA.acreedor}
                    onChange={noop}
                    onNext={noop}
                    forceValidate={1}
                />
            );
            expect(screen.getByText('El nombre es requerido.')).toBeTruthy();
        });

        it('muestra errores en intentos sucesivos (tick incrementa)', () => {
            const { rerender } = render(
                <StepAcreedor
                    data={INITIAL_PAGARE_DATA.acreedor}
                    onChange={noop}
                    onNext={noop}
                    forceValidate={1}
                />
            );
            rerender(
                <StepAcreedor
                    data={INITIAL_PAGARE_DATA.acreedor}
                    onChange={noop}
                    onNext={noop}
                    forceValidate={2}
                />
            );
            expect(screen.getByText('El nombre es requerido.')).toBeTruthy();
        });
    });

    describe('StepDeudor', () => {
        it('no muestra errores con forceValidate=0', () => {
            render(
                <StepDeudor
                    data={INITIAL_PAGARE_DATA.deudor}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={0}
                />
            );
            expect(screen.queryByText('El nombre es requerido.')).toBeNull();
        });

        it('muestra errores cuando forceValidate cambia a > 0', () => {
            const { rerender } = render(
                <StepDeudor
                    data={INITIAL_PAGARE_DATA.deudor}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={0}
                />
            );
            rerender(
                <StepDeudor
                    data={INITIAL_PAGARE_DATA.deudor}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={1}
                />
            );
            expect(screen.getByText('El nombre es requerido.')).toBeTruthy();
        });
    });

    describe('StepObligacion', () => {
        it('no muestra errores con forceValidate=0', () => {
            render(
                <StepObligacion
                    data={INITIAL_PAGARE_DATA.obligacion}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={0}
                />
            );
            expect(screen.queryByText('El valor es requerido.')).toBeNull();
        });

        it('muestra errores cuando forceValidate cambia a > 0', () => {
            const { rerender } = render(
                <StepObligacion
                    data={INITIAL_PAGARE_DATA.obligacion}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={0}
                />
            );
            rerender(
                <StepObligacion
                    data={INITIAL_PAGARE_DATA.obligacion}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={1}
                />
            );
            expect(screen.getByText('El valor es requerido.')).toBeTruthy();
        });
    });
});
