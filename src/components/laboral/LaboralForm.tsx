import { useCallback, useState } from 'react';
import { useStore } from '@nanostores/react';
import type {
    TipoContrato,
    EmpleadorData,
    TrabajadorData,
    CondicionesTerminoFijo,
    CondicionesObraLabor,
} from './types';
import { LABORAL_STEPS } from './types';
import {
    validateTipoContrato,
    validateEmpleador,
    validateTrabajador,
    validateCondicionesTerminoFijo,
    validateCondicionesObraLabor,
    hasErrors,
} from './validation';
import { $laboralFormData, $laboralStep, $laboralMaxStep } from '../../stores/laboral';
import StepProgress from '../shared/StepProgress';
import StepTipoContrato from './steps/StepTipoContrato';
import StepEmpleador from './steps/StepEmpleador';
import StepTrabajador from './steps/StepTrabajador';
import StepCondiciones from './steps/StepCondiciones';
import StepPreview from './steps/StepPreview';

export default function LaboralForm() {
    const formData = useStore($laboralFormData);
    const currentStep = useStore($laboralStep);
    const maxStep = useStore($laboralMaxStep);
    const maxReachedStep = Math.max(currentStep, maxStep);
    const [validateTick, setValidateTick] = useState(0);

    const updateTipoContrato = useCallback((tipo: TipoContrato) => {
        $laboralFormData.set({ ...$laboralFormData.get(), tipoContrato: tipo });
    }, []);

    const updateEmpleador = useCallback((data: EmpleadorData) => {
        $laboralFormData.set({ ...$laboralFormData.get(), empleador: data });
    }, []);

    const updateTrabajador = useCallback((data: TrabajadorData) => {
        $laboralFormData.set({ ...$laboralFormData.get(), trabajador: data });
    }, []);

    const updateCondicionesTerminoFijo = useCallback((data: CondicionesTerminoFijo) => {
        $laboralFormData.set({ ...$laboralFormData.get(), condicionesTerminoFijo: data });
    }, []);

    const updateCondicionesObraLabor = useCallback((data: CondicionesObraLabor) => {
        $laboralFormData.set({ ...$laboralFormData.get(), condicionesObraLabor: data });
    }, []);

    const handleNext = useCallback(() => {
        const next = Math.min($laboralStep.get() + 1, LABORAL_STEPS.length);
        $laboralStep.set(next);
        $laboralMaxStep.set(Math.max($laboralMaxStep.get(), next));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBack = useCallback(() => {
        $laboralStep.set(Math.max($laboralStep.get() - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleStepClick = useCallback((n: number) => {
        const current = $laboralStep.get();
        if (n > current) {
            const data = $laboralFormData.get();
            const stepValidators: Record<number, () => boolean> = {
                1: () => hasErrors(validateTipoContrato(data.tipoContrato)),
                2: () => hasErrors(validateEmpleador(data.empleador)),
                3: () => hasErrors(validateTrabajador(data.trabajador)),
                4: () =>
                    data.tipoContrato === 'termino-fijo'
                        ? hasErrors(validateCondicionesTerminoFijo(data.condicionesTerminoFijo))
                        : hasErrors(validateCondicionesObraLabor(data.condicionesObraLabor)),
            };
            if (stepValidators[current]?.()) {
                setValidateTick((t) => t + 1);
                return;
            }
        }
        $laboralStep.set(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const stepContent: Record<number, React.ReactNode> = {
        1: (
            <StepTipoContrato
                data={formData.tipoContrato}
                onChange={updateTipoContrato}
                onNext={handleNext}
                forceValidate={validateTick}
            />
        ),
        2: (
            <StepEmpleador
                data={formData.empleador}
                onChange={updateEmpleador}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        3: (
            <StepTrabajador
                data={formData.trabajador}
                onChange={updateTrabajador}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        4: (
            <StepCondiciones
                formData={formData}
                onUpdateTerminoFijo={updateCondicionesTerminoFijo}
                onUpdateObraLabor={updateCondicionesObraLabor}
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
                steps={LABORAL_STEPS}
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
