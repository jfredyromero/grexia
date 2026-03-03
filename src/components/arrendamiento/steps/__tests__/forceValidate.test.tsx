import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { INITIAL_FORM_DATA } from '../../types';
import StepInmueble from '../StepInmueble';
import StepArrendador from '../StepArrendador';
import StepArrendatario from '../StepArrendatario';
import StepCondiciones from '../StepCondiciones';

const noop = vi.fn();

describe('forceValidate — muestra errores al intentar saltar step inválido', () => {
    describe('StepInmueble', () => {
        it('no muestra errores con forceValidate=0', () => {
            render(
                <StepInmueble
                    data={INITIAL_FORM_DATA.inmueble}
                    onChange={noop}
                    onNext={noop}
                    forceValidate={0}
                />
            );
            expect(screen.queryByText('Campo requerido')).toBeNull();
            expect(screen.queryByText('Selecciona el tipo de inmueble')).toBeNull();
        });

        it('muestra errores cuando forceValidate cambia a > 0', () => {
            const { rerender } = render(
                <StepInmueble
                    data={INITIAL_FORM_DATA.inmueble}
                    onChange={noop}
                    onNext={noop}
                    forceValidate={0}
                />
            );
            rerender(
                <StepInmueble
                    data={INITIAL_FORM_DATA.inmueble}
                    onChange={noop}
                    onNext={noop}
                    forceValidate={1}
                />
            );
            expect(screen.getByText('Selecciona el tipo de inmueble')).toBeTruthy();
            expect(screen.getAllByText('Campo requerido').length).toBeGreaterThan(0);
        });

        it('muestra errores en intentos sucesivos (tick incrementa)', () => {
            const { rerender } = render(
                <StepInmueble
                    data={INITIAL_FORM_DATA.inmueble}
                    onChange={noop}
                    onNext={noop}
                    forceValidate={1}
                />
            );
            rerender(
                <StepInmueble
                    data={INITIAL_FORM_DATA.inmueble}
                    onChange={noop}
                    onNext={noop}
                    forceValidate={2}
                />
            );
            expect(screen.getByText('Selecciona el tipo de inmueble')).toBeTruthy();
        });
    });

    describe('StepArrendador', () => {
        it('no muestra errores con forceValidate=0', () => {
            render(
                <StepArrendador
                    data={INITIAL_FORM_DATA.arrendador}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={0}
                />
            );
            expect(screen.queryByText('Campo requerido')).toBeNull();
        });

        it('muestra errores cuando forceValidate cambia a > 0', () => {
            const { rerender } = render(
                <StepArrendador
                    data={INITIAL_FORM_DATA.arrendador}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={0}
                />
            );
            rerender(
                <StepArrendador
                    data={INITIAL_FORM_DATA.arrendador}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={1}
                />
            );
            expect(screen.getAllByText('Campo requerido').length).toBeGreaterThan(0);
        });
    });

    describe('StepArrendatario', () => {
        it('no muestra errores con forceValidate=0', () => {
            render(
                <StepArrendatario
                    data={INITIAL_FORM_DATA.arrendatario}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={0}
                />
            );
            expect(screen.queryByText('Campo requerido')).toBeNull();
        });

        it('muestra errores cuando forceValidate cambia a > 0', () => {
            const { rerender } = render(
                <StepArrendatario
                    data={INITIAL_FORM_DATA.arrendatario}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={0}
                />
            );
            rerender(
                <StepArrendatario
                    data={INITIAL_FORM_DATA.arrendatario}
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={1}
                />
            );
            expect(screen.getAllByText('Campo requerido').length).toBeGreaterThan(0);
        });
    });

    describe('StepCondiciones', () => {
        it('no muestra errores con forceValidate=0', () => {
            render(
                <StepCondiciones
                    data={INITIAL_FORM_DATA.condiciones}
                    tipoInmueble="Apartamento"
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={0}
                />
            );
            expect(screen.queryByText('Campo requerido')).toBeNull();
        });

        it('muestra errores cuando forceValidate cambia a > 0', () => {
            const { rerender } = render(
                <StepCondiciones
                    data={INITIAL_FORM_DATA.condiciones}
                    tipoInmueble="Apartamento"
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={0}
                />
            );
            rerender(
                <StepCondiciones
                    data={INITIAL_FORM_DATA.condiciones}
                    tipoInmueble="Apartamento"
                    onChange={noop}
                    onNext={noop}
                    onBack={noop}
                    forceValidate={1}
                />
            );
            expect(screen.getAllByText('Campo requerido').length).toBeGreaterThan(0);
        });
    });
});
