import { useCallback, useState } from 'react';
import { useStore } from '@nanostores/react';
import type { AcreedorData, DeudorData, ObligacionData } from './types';
import { PAGARE_STEPS } from './types';
import { validateAcreedor, validateDeudor, validateObligacion, hasErrors } from './validation';
import { $pagareFormData, $pagareStep, $pagareMaxStep } from '../../stores/pagare';
import StepProgress from '../shared/StepProgress';
import UpsellWidget from '../shared/UpsellWidget';
import StepAcreedor from './steps/StepAcreedor';
import StepDeudor from './steps/StepDeudor';
import StepObligacion from './steps/StepObligacion';
import StepPreview from './steps/StepPreview';

export default function PagareForm() {
    const formData = useStore($pagareFormData);
    const currentStep = useStore($pagareStep);
    const maxStep = useStore($pagareMaxStep);
    const maxReachedStep = Math.max(currentStep, maxStep);
    const [validateTick, setValidateTick] = useState(0);

    const updateAcreedor = useCallback((data: AcreedorData) => {
        $pagareFormData.set({ ...$pagareFormData.get(), acreedor: data });
    }, []);

    const updateDeudor = useCallback((data: DeudorData) => {
        $pagareFormData.set({ ...$pagareFormData.get(), deudor: data });
    }, []);

    const updateObligacion = useCallback((data: ObligacionData) => {
        $pagareFormData.set({ ...$pagareFormData.get(), obligacion: data });
    }, []);

    const handleNext = useCallback(() => {
        const next = Math.min($pagareStep.get() + 1, PAGARE_STEPS.length);
        $pagareStep.set(next);
        $pagareMaxStep.set(Math.max($pagareMaxStep.get(), next));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBack = useCallback(() => {
        $pagareStep.set(Math.max($pagareStep.get() - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleStepClick = useCallback((n: number) => {
        const current = $pagareStep.get();
        if (n > current) {
            const data = $pagareFormData.get();
            const stepValidators: Record<number, () => boolean> = {
                1: () => hasErrors(validateAcreedor(data.acreedor)),
                2: () => hasErrors(validateDeudor(data.deudor)),
                3: () => hasErrors(validateObligacion(data.obligacion)),
            };
            if (stepValidators[current]?.()) {
                setValidateTick((t) => t + 1);
                return;
            }
        }
        $pagareStep.set(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const isLastStep = currentStep === PAGARE_STEPS.length;

    const stepContent: Record<number, React.ReactNode> = {
        1: (
            <StepAcreedor
                data={formData.acreedor}
                onChange={updateAcreedor}
                onNext={handleNext}
                forceValidate={validateTick}
            />
        ),
        2: (
            <StepDeudor
                data={formData.deudor}
                onChange={updateDeudor}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        3: (
            <StepObligacion
                data={formData.obligacion}
                onChange={updateObligacion}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        4: (
            <StepPreview
                formData={formData}
                onBack={handleBack}
            />
        ),
    };

    return (
        <div
            className={['grid grid-cols-1 items-start gap-8', isLastStep ? 'lg:grid-cols-5' : 'lg:grid-cols-3'].join(
                ' '
            )}
        >
            {/* Main form column */}
            <div className={['flex flex-col gap-6', isLastStep ? 'lg:col-span-3' : 'lg:col-span-2'].join(' ')}>
                <StepProgress
                    steps={PAGARE_STEPS}
                    currentStep={currentStep}
                    maxReachedStep={maxReachedStep}
                    onStepClick={handleStepClick}
                />
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 sm:p-8">
                    {stepContent[currentStep]}
                </div>
            </div>

            {/* Sidebar: upsell widget */}
            <aside
                className={[
                    'no-print',
                    'lg:sticky lg:top-[50vh] lg:-translate-y-1/2',
                    isLastStep ? 'lg:col-span-2' : '',
                ].join(' ')}
            >
                <UpsellWidget />
            </aside>
        </div>
    );
}
