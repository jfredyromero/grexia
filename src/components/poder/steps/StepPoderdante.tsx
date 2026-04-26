import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { PoderdanteData } from '../types';
import { validatePoderdante, hasErrors } from '../validation';
import InputField from '../../shared/InputField';

interface StepPoderdanteProps {
    data: PoderdanteData;
    hasInmueble: boolean;
    onChange: (data: PoderdanteData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function StepPoderdante({
    data,
    hasInmueble,
    onChange,
    onNext,
    onBack,
    forceValidate,
}: StepPoderdanteProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validatePoderdante(data, hasInmueble));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof PoderdanteData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validatePoderdante(data, hasInmueble);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El poderdante</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Información de la persona que otorga el poder. Es decir, tú o quien te representa.
                </p>
            </div>

            <InputField
                id="poderdante-nombre"
                label="Nombre completo"
                type="text"
                value={data.nombreCompleto}
                onChange={set('nombreCompleto')}
                placeholder="Andrés Felipe Ramírez Torres"
                error={errors.nombreCompleto}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="poderdante-cc"
                    label="Número de cédula"
                    type="text"
                    inputMode="numeric"
                    value={data.ccPoderdante}
                    onChange={set('ccPoderdante')}
                    placeholder="1098765432"
                    error={errors.ccPoderdante}
                />
                <InputField
                    id="poderdante-lugar"
                    label="Lugar de expedición"
                    type="text"
                    value={data.lugarExpedicionPoderdante}
                    onChange={set('lugarExpedicionPoderdante')}
                    placeholder="Bogotá D.C."
                    error={errors.lugarExpedicionPoderdante}
                />
            </div>

            <InputField
                id="poderdante-ciudad"
                label="Ciudad de domicilio"
                type="text"
                value={data.ciudadPoderdante}
                onChange={set('ciudadPoderdante')}
                placeholder="Bogotá D.C."
                error={errors.ciudadPoderdante}
            />

            {hasInmueble && (
                <>
                    <div className="border-t border-slate-100 pt-2">
                        <h3 className="text-sm font-bold text-secondary">Datos del inmueble</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Como el proceso involucra un inmueble, necesitamos su dirección y matrícula.
                        </p>
                    </div>

                    <InputField
                        id="poderdante-direccion-inmueble"
                        label="Dirección del inmueble"
                        type="text"
                        value={data.direccionInmueble}
                        onChange={set('direccionInmueble')}
                        placeholder="Calle 100 No. 15-20, Apto 502"
                        error={errors.direccionInmueble}
                    />

                    <InputField
                        id="poderdante-matricula"
                        label="Matrícula inmobiliaria"
                        type="text"
                        value={data.matriculaInmobiliaria}
                        onChange={set('matriculaInmobiliaria')}
                        placeholder="050C-1234567"
                        error={errors.matriculaInmobiliaria}
                    />
                </>
            )}

            <div className="flex justify-between pt-4 mt-2 border-t border-slate-100">
                <Button
                    onClick={onBack}
                    className="flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 data-hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Anterior
                </Button>
                <Button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all cursor-pointer"
                >
                    Continuar
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
            </div>
        </div>
    );
}
