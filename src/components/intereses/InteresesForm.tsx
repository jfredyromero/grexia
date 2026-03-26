import { useCallback, useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import type { InteresesFormData } from './types';
import { INTERESES_STEPS } from './types';
import { validateObligacion, hasErrors } from './validation';
import { calcularIntereses } from './interesesUtils';
import type { ResultadoLiquidacion, TasaEntry } from './interesesUtils';
import { $interesesFormData, $interesesStep, $interesesMaxStep } from '../../stores/intereses';
import StepProgress from '../shared/StepProgress';
import StepObligacion from './steps/StepObligacion';
import StepPreview from './steps/StepPreview';

const BASE_URL = import.meta.env.BASE_URL ?? '/';
const TASAS_URL = BASE_URL.replace(/\/$/, '') + '/api/intereses/tasas.json';

export default function InteresesForm() {
    const formData = useStore($interesesFormData);
    const currentStep = useStore($interesesStep);
    const maxStep = useStore($interesesMaxStep);
    const maxReachedStep = Math.max(currentStep, maxStep);
    const [validateTick, setValidateTick] = useState(0);
    const [tasas, setTasas] = useState<TasaEntry[]>([]);
    const [resultado, setResultado] = useState<ResultadoLiquidacion | null>(null);

    useEffect(() => {
        fetch(TASAS_URL)
            .then((r) => r.json())
            .then((data: TasaEntry[]) => setTasas(data));
    }, []);

    // Recalcula automáticamente si se carga en step 2 sin resultado (ej. recarga de página)
    useEffect(() => {
        if (currentStep !== 2 || resultado !== null || tasas.length === 0) return;
        const data = $interesesFormData.get();
        if (hasErrors(validateObligacion(data))) {
            $interesesStep.set(1);
            return;
        }
        const capital = parseInt(data.capital, 10);
        const tipo = data.tipoInteres as 'corriente' | 'moratorio';
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResultado(calcularIntereses(capital, tipo, data.fechaIniciaMora, data.fechaPago, tasas));
    }, [currentStep, resultado, tasas]);

    const updateForm = useCallback((data: InteresesFormData) => {
        $interesesFormData.set(data);
    }, []);

    const handleNext = useCallback(() => {
        const data = $interesesFormData.get();
        const capital = parseInt(data.capital, 10);
        const tipo = data.tipoInteres as 'corriente' | 'moratorio';
        const r = calcularIntereses(capital, tipo, data.fechaIniciaMora, data.fechaPago, tasas);
        setResultado(r);

        const next = Math.min($interesesStep.get() + 1, INTERESES_STEPS.length);
        $interesesStep.set(next);
        $interesesMaxStep.set(Math.max($interesesMaxStep.get(), next));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [tasas]);

    const handleBack = useCallback(() => {
        $interesesStep.set(Math.max($interesesStep.get() - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleStepClick = useCallback((n: number) => {
        const current = $interesesStep.get();
        if (n > current) {
            if (hasErrors(validateObligacion($interesesFormData.get()))) {
                setValidateTick((t) => t + 1);
                return;
            }
        }
        $interesesStep.set(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const stepContent: Record<number, React.ReactNode> = {
        1: (
            <StepObligacion
                data={formData}
                onChange={updateForm}
                onNext={handleNext}
                forceValidate={validateTick}
            />
        ),
        2: resultado ? (
            <StepPreview
                formData={formData}
                resultado={resultado}
                onBack={handleBack}
            />
        ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <span className="material-symbols-outlined text-[40px] text-slate-300">calculate</span>
                <p className="text-slate-500 text-sm">Calculando intereses...</p>
            </div>
        ),
    };

    return (
        <div className="flex flex-col gap-6">
            <StepProgress
                steps={INTERESES_STEPS}
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
