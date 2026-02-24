import { useState, useCallback } from 'react';
import type { PagareFormData, AcreedorData, DeudorData, ObligacionData } from './types';
import { INITIAL_PAGARE_DATA, PAGARE_STEPS } from './types';
import StepProgress from '../shared/StepProgress';
import UpsellWidget from '../shared/UpsellWidget';
import StepAcreedor from './steps/StepAcreedor';
import StepDeudor from './steps/StepDeudor';
import StepObligacion from './steps/StepObligacion';
import StepPreview from './steps/StepPreview';

const CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/YOUR_PLACEHOLDER';

export default function PagareForm() {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<PagareFormData>(INITIAL_PAGARE_DATA);

    const updateAcreedor = useCallback((data: AcreedorData) => {
        setFormData((prev) => ({ ...prev, acreedor: data }));
    }, []);

    const updateDeudor = useCallback((data: DeudorData) => {
        setFormData((prev) => ({ ...prev, deudor: data }));
    }, []);

    const updateObligacion = useCallback((data: ObligacionData) => {
        setFormData((prev) => ({ ...prev, obligacion: data }));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentStep((s) => Math.min(s + 1, PAGARE_STEPS.length));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBack = useCallback(() => {
        setCurrentStep((s) => Math.max(s - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const isLastStep = currentStep === PAGARE_STEPS.length;

    const stepContent: Record<number, React.ReactNode> = {
        1: (
            <StepAcreedor
                data={formData.acreedor}
                onChange={updateAcreedor}
                onNext={handleNext}
            />
        ),
        2: (
            <StepDeudor
                data={formData.deudor}
                onChange={updateDeudor}
                onNext={handleNext}
                onBack={handleBack}
            />
        ),
        3: (
            <StepObligacion
                data={formData.obligacion}
                onChange={updateObligacion}
                onNext={handleNext}
                onBack={handleBack}
            />
        ),
        4: (
            <StepPreview
                formData={formData}
                onBack={handleBack}
                calendarUrl={CALENDAR_URL}
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
                <UpsellWidget
                    calendarUrl={CALENDAR_URL}
                    isStep5={isLastStep}
                />
            </aside>
        </div>
    );
}
