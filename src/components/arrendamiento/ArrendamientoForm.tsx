import { useCallback, useState } from 'react';
import { useStore } from '@nanostores/react';
import type { InmuebleData, ArrendadorData, ArrendatarioData, CoarrendatarioData, CondicionesData } from './types';
import { STEPS } from './types';
import {
    validateInmueble,
    validateArrendador,
    validateArrendatario,
    validateCoarrendatario,
    validateCondiciones,
    hasErrors,
} from './validation';
import { $arrendamientoFormData, $arrendamientoStep, $arrendamientoMaxStep } from '../../stores/arrendamiento';
import StepProgress from '../shared/StepProgress';
import StepInmueble from './steps/StepInmueble';
import StepArrendador from './steps/StepArrendador';
import StepArrendatario from './steps/StepArrendatario';
import StepCondiciones from './steps/StepCondiciones';
import StepPreview from './steps/StepPreview';

export default function ArrendamientoForm() {
    const formData = useStore($arrendamientoFormData);
    const currentStep = useStore($arrendamientoStep);
    const maxStep = useStore($arrendamientoMaxStep);
    const maxReachedStep = Math.max(currentStep, maxStep);
    const [validateTick, setValidateTick] = useState(0);

    const updateInmueble = useCallback((data: InmuebleData) => {
        $arrendamientoFormData.set({ ...$arrendamientoFormData.get(), inmueble: data });
    }, []);

    const updateArrendador = useCallback((data: ArrendadorData) => {
        $arrendamientoFormData.set({ ...$arrendamientoFormData.get(), arrendador: data });
    }, []);

    const updateArrendatario = useCallback((data: ArrendatarioData) => {
        $arrendamientoFormData.set({ ...$arrendamientoFormData.get(), arrendatario: data });
    }, []);

    const updateCoarrendatario = useCallback((data: CoarrendatarioData | undefined) => {
        $arrendamientoFormData.set({ ...$arrendamientoFormData.get(), coarrendatario: data });
    }, []);

    const updateCondiciones = useCallback((data: CondicionesData) => {
        $arrendamientoFormData.set({ ...$arrendamientoFormData.get(), condiciones: data });
    }, []);

    const handleNext = useCallback(() => {
        const next = Math.min($arrendamientoStep.get() + 1, STEPS.length);
        $arrendamientoStep.set(next);
        $arrendamientoMaxStep.set(Math.max($arrendamientoMaxStep.get(), next));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBack = useCallback(() => {
        $arrendamientoStep.set(Math.max($arrendamientoStep.get() - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleStepClick = useCallback((n: number) => {
        const current = $arrendamientoStep.get();
        if (n > current) {
            const data = $arrendamientoFormData.get();
            const stepValidators: Record<number, () => boolean> = {
                1: () => hasErrors(validateInmueble(data.inmueble)),
                2: () => hasErrors(validateArrendador(data.arrendador)),
                3: () => {
                    if (hasErrors(validateArrendatario(data.arrendatario))) return true;
                    if (data.coarrendatario && hasErrors(validateCoarrendatario(data.coarrendatario))) return true;
                    return false;
                },
                4: () => hasErrors(validateCondiciones(data.condiciones, data.inmueble.tipoInmueble)),
            };
            if (stepValidators[current]?.()) {
                setValidateTick((t) => t + 1);
                return;
            }
        }
        $arrendamientoStep.set(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const stepContent: Record<number, React.ReactNode> = {
        1: (
            <StepInmueble
                data={formData.inmueble}
                onChange={updateInmueble}
                onNext={handleNext}
                forceValidate={validateTick}
            />
        ),
        2: (
            <StepArrendador
                data={formData.arrendador}
                onChange={updateArrendador}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        3: (
            <StepArrendatario
                data={formData.arrendatario}
                onChange={updateArrendatario}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
                coarrendatario={formData.coarrendatario}
                onCoarrendatarioChange={updateCoarrendatario}
            />
        ),
        4: (
            <StepCondiciones
                data={formData.condiciones}
                tipoInmueble={formData.inmueble.tipoInmueble}
                onChange={updateCondiciones}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        5: (
            <StepPreview
                formData={formData}
                onBack={handleBack}
            />
        ),
    };

    return (
        <div className="flex flex-col gap-6">
            <StepProgress
                steps={STEPS}
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
