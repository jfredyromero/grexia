import { useCallback, useState } from 'react';
import { useStore } from '@nanostores/react';
import type { TipoProceso, PoderdanteData, ApoderadoData, ProcesoData } from './types';
import { PODER_STEPS, INITIAL_PODER_DATA, tipoProcesoHasInmueble, tipoProcesoHasDemandados } from './types';
import { validateTipoProceso, validatePoderdante, validateApoderado, validateProceso, hasErrors } from './validation';
import { $poderFormData, $poderStep, $poderMaxStep } from '../../stores/poder';
import StepProgress from '../shared/StepProgress';
import StepTipoProceso from './steps/StepTipoProceso';
import StepPoderdante from './steps/StepPoderdante';
import StepApoderado from './steps/StepApoderado';
import StepProceso from './steps/StepProceso';
import StepPreview from './steps/StepPreview';

export default function PoderForm() {
    const formData = useStore($poderFormData);
    const currentStep = useStore($poderStep);
    const maxStep = useStore($poderMaxStep);
    const maxReachedStep = Math.max(currentStep, maxStep);
    const [validateTick, setValidateTick] = useState(0);

    const hasInmueble = tipoProcesoHasInmueble(formData.tipoProceso);
    const hasDemandados = tipoProcesoHasDemandados(formData.tipoProceso);

    const updateTipoProceso = useCallback((tipo: TipoProceso) => {
        const current = $poderFormData.get();
        // Si cambia el tipo, resetear los campos condicionales para evitar datos huérfanos
        if (current.tipoProceso !== tipo) {
            $poderFormData.set({
                ...current,
                tipoProceso: tipo,
                poderdante: {
                    ...current.poderdante,
                    direccionInmueble: '',
                    matriculaInmobiliaria: '',
                },
                proceso: {
                    demandados: [''],
                    objetoPoder: '',
                },
            });
        } else {
            $poderFormData.set({ ...current, tipoProceso: tipo });
        }
    }, []);

    const updatePoderdante = useCallback((data: PoderdanteData) => {
        $poderFormData.set({ ...$poderFormData.get(), poderdante: data });
    }, []);

    const updateApoderado = useCallback((data: ApoderadoData) => {
        $poderFormData.set({ ...$poderFormData.get(), apoderado: data });
    }, []);

    const updateProceso = useCallback((data: ProcesoData) => {
        $poderFormData.set({ ...$poderFormData.get(), proceso: data });
    }, []);

    const handleNext = useCallback(() => {
        const next = Math.min($poderStep.get() + 1, PODER_STEPS.length);
        $poderStep.set(next);
        $poderMaxStep.set(Math.max($poderMaxStep.get(), next));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBack = useCallback(() => {
        $poderStep.set(Math.max($poderStep.get() - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleStepClick = useCallback((n: number) => {
        const current = $poderStep.get();
        if (n > current) {
            const data = $poderFormData.get();
            const inmueble = tipoProcesoHasInmueble(data.tipoProceso);
            const demandados = tipoProcesoHasDemandados(data.tipoProceso);
            const stepValidators: Record<number, () => boolean> = {
                1: () => hasErrors(validateTipoProceso(data.tipoProceso)),
                2: () => hasErrors(validatePoderdante(data.poderdante, inmueble)),
                3: () => hasErrors(validateApoderado(data.apoderado)),
                4: () => hasErrors(validateProceso(data.proceso, demandados)),
            };
            if (stepValidators[current]?.()) {
                setValidateTick((t) => t + 1);
                return;
            }
        }
        $poderStep.set(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Si por alguna corrupción el store no tiene poderdante o apoderado, fallback al initial.
    // Esto previene crashes ante datos parcialmente corruptos en localStorage.
    const safeFormData = {
        tipoProceso: formData.tipoProceso ?? '',
        poderdante: formData.poderdante ?? INITIAL_PODER_DATA.poderdante,
        apoderado: formData.apoderado ?? INITIAL_PODER_DATA.apoderado,
        proceso: formData.proceso ?? INITIAL_PODER_DATA.proceso,
    };

    const stepContent: Record<number, React.ReactNode> = {
        1: (
            <StepTipoProceso
                data={safeFormData.tipoProceso}
                onChange={updateTipoProceso}
                onNext={handleNext}
                forceValidate={validateTick}
            />
        ),
        2: (
            <StepPoderdante
                data={safeFormData.poderdante}
                hasInmueble={hasInmueble}
                onChange={updatePoderdante}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        3: (
            <StepApoderado
                data={safeFormData.apoderado}
                onChange={updateApoderado}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        4: (
            <StepProceso
                data={safeFormData.proceso}
                hasDemandados={hasDemandados}
                onChange={updateProceso}
                onNext={handleNext}
                onBack={handleBack}
                forceValidate={validateTick}
            />
        ),
        5: (
            <StepPreview
                formData={safeFormData}
                onBack={handleBack}
            />
        ),
    };

    return (
        <div className="flex flex-col gap-6">
            <StepProgress
                steps={PODER_STEPS}
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
