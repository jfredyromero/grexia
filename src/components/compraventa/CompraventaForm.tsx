import { useCallback, useState } from 'react';
import { useStore } from '@nanostores/react';
import type { VendedorData, CompradorData, InmuebleData, TradicionData, EconomicoData, EscrituraData } from './types';
import { COMPRAVENTA_STEPS } from './types';
import {
    validateVendedor,
    validateComprador,
    validateInmueble,
    validateTradicion,
    validateEconomico,
    validateEscritura,
    hasErrors,
} from './validation';
import { $compraventaFormData, $compraventaStep, $compraventaMaxStep } from '../../stores/compraventa';
import StepProgress from '../shared/StepProgress';
import StepVendedor from './steps/StepVendedor';
import StepComprador from './steps/StepComprador';
import StepInmueble from './steps/StepInmueble';
import StepTradicion from './steps/StepTradicion';
import StepEconomico from './steps/StepEconomico';
import StepEscritura from './steps/StepEscritura';
import StepPreview from './steps/StepPreview';

export default function CompraventaForm() {
    const formData = useStore($compraventaFormData);
    const currentStep = useStore($compraventaStep);
    const maxStep = useStore($compraventaMaxStep);
    const maxReachedStep = Math.max(currentStep, maxStep);
    const [validateTick, setValidateTick] = useState(0);

    const updateVendedor = useCallback((data: VendedorData) => {
        $compraventaFormData.set({ ...$compraventaFormData.get(), vendedor: data });
    }, []);

    const updateComprador = useCallback((data: CompradorData) => {
        $compraventaFormData.set({ ...$compraventaFormData.get(), comprador: data });
    }, []);

    const updateInmueble = useCallback((data: InmuebleData) => {
        $compraventaFormData.set({ ...$compraventaFormData.get(), inmueble: data });
    }, []);

    const updateTradicion = useCallback((data: TradicionData) => {
        $compraventaFormData.set({ ...$compraventaFormData.get(), tradicion: data });
    }, []);

    const updateEconomico = useCallback((data: EconomicoData) => {
        $compraventaFormData.set({ ...$compraventaFormData.get(), economico: data });
    }, []);

    const updateEscritura = useCallback((data: EscrituraData) => {
        $compraventaFormData.set({ ...$compraventaFormData.get(), escritura: data });
    }, []);

    const handleNext = useCallback(() => {
        const next = Math.min($compraventaStep.get() + 1, COMPRAVENTA_STEPS.length);
        $compraventaStep.set(next);
        $compraventaMaxStep.set(Math.max($compraventaMaxStep.get(), next));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBack = useCallback(() => {
        $compraventaStep.set(Math.max($compraventaStep.get() - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleStepClick = useCallback((n: number) => {
        const current = $compraventaStep.get();
        if (n > current) {
            const data = $compraventaFormData.get();
            const stepValidators: Record<number, () => boolean> = {
                1: () => hasErrors(validateVendedor(data.vendedor)),
                2: () => hasErrors(validateComprador(data.comprador)),
                3: () => hasErrors(validateInmueble(data.inmueble)),
                4: () => hasErrors(validateTradicion(data.tradicion)),
                5: () => hasErrors(validateEconomico(data.economico)),
                6: () => hasErrors(validateEscritura(data.escritura)),
            };
            if (stepValidators[current]?.()) {
                setValidateTick((t) => t + 1);
                return;
            }
        }
        $compraventaStep.set(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const stepContent: Record<number, React.ReactNode> = {
        1: (
            <StepVendedor
                data={formData.vendedor}
                onChange={updateVendedor}
                onNext={handleNext}
                forceValidate={validateTick}
            />
        ),
        2: (
            <StepComprador
                data={formData.comprador}
                onChange={updateComprador}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        3: (
            <StepInmueble
                data={formData.inmueble}
                onChange={updateInmueble}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        4: (
            <StepTradicion
                data={formData.tradicion}
                onChange={updateTradicion}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        5: (
            <StepEconomico
                data={formData.economico}
                onChange={updateEconomico}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        6: (
            <StepEscritura
                data={formData.escritura}
                onChange={updateEscritura}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        7: (
            <StepPreview
                formData={formData}
                onBack={handleBack}
            />
        ),
    };

    return (
        <div className="flex flex-col gap-6">
            <StepProgress
                steps={COMPRAVENTA_STEPS}
                currentStep={currentStep}
                maxReachedStep={maxReachedStep}
                onStepClick={handleStepClick}
            />
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 sm:p-8">
                {stepContent[currentStep]}
            </div>
        </div>
    );
}
