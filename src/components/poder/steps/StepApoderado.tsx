import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { ApoderadoData } from '../types';
import { validateApoderado, hasErrors } from '../validation';
import InputField from '../../shared/InputField';

interface StepApoderadoProps {
    data: ApoderadoData;
    onChange: (data: ApoderadoData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function StepApoderado({ data, onChange, onNext, onBack, forceValidate }: StepApoderadoProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateApoderado(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof ApoderadoData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateApoderado(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El apoderado</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Información del abogado o abogada que actuará en tu nombre.
                </p>
            </div>

            <InputField
                id="apoderado-nombre"
                label="Nombre completo del apoderado"
                type="text"
                value={data.nombreCompleto}
                onChange={set('nombreCompleto')}
                placeholder="Camila Andrea López Vargas"
                error={errors.nombreCompleto}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="apoderado-cc"
                    label="Número de cédula"
                    type="text"
                    inputMode="numeric"
                    value={data.ccApoderado}
                    onChange={set('ccApoderado')}
                    placeholder="52345678"
                    error={errors.ccApoderado}
                />
                <InputField
                    id="apoderado-lugar"
                    label="Lugar de expedición"
                    type="text"
                    value={data.lugarExpedicionApoderado}
                    onChange={set('lugarExpedicionApoderado')}
                    placeholder="Medellín"
                    error={errors.lugarExpedicionApoderado}
                />
            </div>

            <InputField
                id="apoderado-ciudad"
                label="Ciudad de residencia"
                type="text"
                value={data.ciudadApoderado}
                onChange={set('ciudadApoderado')}
                placeholder="Medellín"
                error={errors.ciudadApoderado}
            />

            <InputField
                id="apoderado-tarjeta"
                label="Número de Tarjeta Profesional"
                description="Tarjeta del Consejo Superior de la Judicatura."
                type="text"
                value={data.tarjetaProfesional}
                onChange={set('tarjetaProfesional')}
                placeholder="123456"
                error={errors.tarjetaProfesional}
            />

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
