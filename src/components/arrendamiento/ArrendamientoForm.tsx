import { useState, useCallback } from 'react';
import type { ArrendamientoFormData, InmuebleData, ArrendadorData, ArrendatarioData, CondicionesData } from './types';
import { INITIAL_FORM_DATA, STEPS } from './types';
import StepProgress from '../shared/StepProgress';
import UpsellWidget from '../shared/UpsellWidget';
import StepInmueble from './steps/StepInmueble';
import StepArrendador from './steps/StepArrendador';
import StepArrendatario from './steps/StepArrendatario';
import StepCondiciones from './steps/StepCondiciones';
import StepPreview from './steps/StepPreview';

export default function ArrendamientoForm() {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<ArrendamientoFormData>(INITIAL_FORM_DATA);

    const updateInmueble = useCallback((data: InmuebleData) => {
        setFormData((prev) => ({ ...prev, inmueble: data }));
    }, []);

    const updateArrendador = useCallback((data: ArrendadorData) => {
        setFormData((prev) => ({ ...prev, arrendador: data }));
    }, []);

    const updateArrendatario = useCallback((data: ArrendatarioData) => {
        setFormData((prev) => ({ ...prev, arrendatario: data }));
    }, []);

    const updateCondiciones = useCallback((data: CondicionesData) => {
        setFormData((prev) => ({ ...prev, condiciones: data }));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentStep((s) => Math.min(s + 1, 5));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBack = useCallback(() => {
        setCurrentStep((s) => Math.max(s - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const isStep5 = currentStep === 5;

    const stepContent: Record<number, React.ReactNode> = {
        1: (
            <StepInmueble
                data={formData.inmueble}
                onChange={updateInmueble}
                onNext={handleNext}
            />
        ),
        2: (
            <StepArrendador
                data={formData.arrendador}
                onChange={updateArrendador}
                onNext={handleNext}
                onBack={handleBack}
            />
        ),
        3: (
            <StepArrendatario
                data={formData.arrendatario}
                onChange={updateArrendatario}
                onNext={handleNext}
                onBack={handleBack}
            />
        ),
        4: (
            <StepCondiciones
                data={formData.condiciones}
                tipoInmueble={formData.inmueble.tipoInmueble}
                onChange={updateCondiciones}
                onNext={handleNext}
                onBack={handleBack}
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
        <div
            className={['grid grid-cols-1 items-start gap-8', isStep5 ? 'lg:grid-cols-5' : 'lg:grid-cols-3'].join(' ')}
        >
            {/* Main form column */}
            <div className={['flex flex-col gap-6', isStep5 ? 'lg:col-span-3' : 'lg:col-span-2'].join(' ')}>
                {/* Step progress */}
                <StepProgress
                    steps={STEPS}
                    currentStep={currentStep}
                />

                {/* Step card */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 sm:p-8">
                    {stepContent[currentStep]}
                </div>
            </div>

            {/* Sidebar: upsell widget */}
            <aside
                className={[
                    'no-print',
                    'lg:sticky lg:top-[50vh] lg:-translate-y-1/2',
                    isStep5 ? 'lg:col-span-2' : '',
                ].join(' ')}
            >
                <UpsellWidget />
            </aside>
        </div>
    );
}
