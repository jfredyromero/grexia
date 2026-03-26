import { useCallback, useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import type { TutelaFormData } from './types';
import { TUTELA_STEPS } from './types';
import {
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    validateStep5,
    validateStep6,
    hasErrors,
} from './validation';
import { $tutelaFormData, $tutelaStep, $tutelaMaxStep } from '../../stores/tutela';
import { generarHechosConIA } from '../../services/geminiHechos';
import StepProgress from '../shared/StepProgress';
import Step1Accionante from './steps/Step1Accionante';
import Step2EPS from './steps/Step2EPS';
import Step3CondicionMedica from './steps/Step3CondicionMedica';
import Step4Vulnerabilidad from './steps/Step4Vulnerabilidad';
import Step5Impacto from './steps/Step5Impacto';
import Step6Pretensiones from './steps/Step6Pretensiones';
import Step7Anexos from './steps/Step7Anexos';
import StepPreview from './steps/StepPreview';

export default function TutelaForm() {
    const formData = useStore($tutelaFormData);
    const currentStep = useStore($tutelaStep);
    const maxStep = useStore($tutelaMaxStep);
    const maxReachedStep = Math.max(currentStep, maxStep);
    const [validateTick, setValidateTick] = useState(0);
    const [hechosIA, setHechosIA] = useState<string | null>(null);
    const [hechosLoading, setHechosLoading] = useState(false);
    const [hechosError, setHechosError] = useState<string | null>(null);

    const update = useCallback((data: TutelaFormData) => {
        $tutelaFormData.set(data);
    }, []);

    const triggerIA = useCallback(() => {
        if (hechosLoading) return;
        setHechosIA(null);
        setHechosError(null);
        setHechosLoading(true);
        generarHechosConIA($tutelaFormData.get())
            .then((texto) => {
                setHechosIA(texto);
            })
            .catch((err: unknown) => {
                const msg = err instanceof Error ? err.message : 'Error desconocido';
                setHechosError(msg);
            })
            .finally(() => {
                setHechosLoading(false);
            });
    }, [hechosLoading]);

    // Fire when already on preview step (e.g. page reload)
    useEffect(() => {
        if (currentStep === TUTELA_STEPS.length && !hechosIA && !hechosLoading) {
            triggerIA();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNext = useCallback(() => {
        const current = $tutelaStep.get();
        const next = Math.min(current + 1, TUTELA_STEPS.length);
        $tutelaStep.set(next);
        $tutelaMaxStep.set(Math.max($tutelaMaxStep.get(), next));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (next === TUTELA_STEPS.length) triggerIA();
    }, [triggerIA]);

    const handleBack = useCallback(() => {
        $tutelaStep.set(Math.max($tutelaStep.get() - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleStepClick = useCallback(
        (n: number) => {
            const current = $tutelaStep.get();
            if (n > current) {
                const data = $tutelaFormData.get();
                const stepValidators: Record<number, () => boolean> = {
                    1: () => hasErrors(validateStep1(data)),
                    2: () => hasErrors(validateStep2(data)),
                    3: () => hasErrors(validateStep3(data)),
                    4: () => hasErrors(validateStep4(data)),
                    5: () => hasErrors(validateStep5(data)),
                    6: () => hasErrors(validateStep6(data)),
                };
                if (stepValidators[current]?.()) {
                    setValidateTick((t) => t + 1);
                    return;
                }
            }
            $tutelaStep.set(n);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (n === TUTELA_STEPS.length) triggerIA();
        },
        [triggerIA]
    );

    const stepContent: Record<number, React.ReactNode> = {
        1: (
            <Step1Accionante
                data={formData}
                onChange={update}
                onNext={handleNext}
                forceValidate={validateTick}
            />
        ),
        2: (
            <Step2EPS
                data={formData}
                onChange={update}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        3: (
            <Step3CondicionMedica
                data={formData}
                onChange={update}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        4: (
            <Step4Vulnerabilidad
                data={formData}
                onChange={update}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        5: (
            <Step5Impacto
                data={formData}
                onChange={update}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        6: (
            <Step6Pretensiones
                data={formData}
                onChange={update}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        7: (
            <Step7Anexos
                data={formData}
                onChange={update}
                onNext={handleNext}
                onBack={handleBack}
            />
        ),
        8: (
            <StepPreview
                formData={formData}
                onBack={handleBack}
                hechosIA={hechosIA}
                hechosLoading={hechosLoading}
                hechosError={hechosError}
            />
        ),
    };

    return (
        <div className="flex flex-col gap-6">
            <StepProgress
                steps={TUTELA_STEPS}
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
