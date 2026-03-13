import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { INITIAL_INTERESES_DATA } from '../../types';
import StepObligacion from '../StepObligacion';

const noop = vi.fn();

describe('forceValidate — StepObligacion', () => {
    it('no muestra errores con forceValidate=0', () => {
        render(
            <StepObligacion
                data={INITIAL_INTERESES_DATA}
                onChange={noop}
                onNext={noop}
                forceValidate={0}
            />
        );
        expect(screen.queryByText('El capital debe ser mayor a cero.')).toBeNull();
        expect(screen.queryByText('Selecciona el tipo de interés.')).toBeNull();
    });

    it('muestra errores cuando forceValidate cambia a > 0', () => {
        const { rerender } = render(
            <StepObligacion
                data={INITIAL_INTERESES_DATA}
                onChange={noop}
                onNext={noop}
                forceValidate={0}
            />
        );
        rerender(
            <StepObligacion
                data={INITIAL_INTERESES_DATA}
                onChange={noop}
                onNext={noop}
                forceValidate={1}
            />
        );
        expect(screen.getByText('El capital debe ser mayor a cero.')).toBeTruthy();
        expect(screen.getByText('Selecciona el tipo de interés.')).toBeTruthy();
    });

    it('muestra errores en intentos sucesivos (tick incrementa)', () => {
        const { rerender } = render(
            <StepObligacion
                data={INITIAL_INTERESES_DATA}
                onChange={noop}
                onNext={noop}
                forceValidate={1}
            />
        );
        rerender(
            <StepObligacion
                data={INITIAL_INTERESES_DATA}
                onChange={noop}
                onNext={noop}
                forceValidate={2}
            />
        );
        expect(screen.getByText('El capital debe ser mayor a cero.')).toBeTruthy();
    });
});
