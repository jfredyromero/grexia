import { useEffect, useState } from 'react';
import { Button } from '@headlessui/react';
import type { TipoContrato } from '../types';
import { validateTipoContrato, hasErrors } from '../validation';

interface StepTipoContratoProps {
    data: TipoContrato | '';
    onChange: (tipo: TipoContrato) => void;
    onNext: () => void;
    forceValidate?: number;
}

const OPTIONS: Array<{
    value: TipoContrato;
    icon: string;
    title: string;
    subtitle: string;
    description: string;
}> = [
    {
        value: 'termino-fijo',
        icon: 'calendar_month',
        title: 'Contrato a Término Fijo',
        subtitle: 'Duración definida, renovable',
        description:
            'Para relaciones laborales con una fecha de inicio y fin determinada, prorrogables automáticamente.',
    },
    {
        value: 'obra-labor',
        icon: 'construction',
        title: 'Contrato por Obra o Labor',
        subtitle: 'Duración por la ejecución de la obra',
        description:
            'Para vincular trabajadores en una obra o labor específica. El contrato termina al concluir la tarea.',
    },
];

export default function StepTipoContrato({ data, onChange, onNext, forceValidate }: StepTipoContratoProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateTipoContrato(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const handleSelect = (tipo: TipoContrato) => {
        onChange(tipo);
        if (errors.tipoContrato) setErrors({});
    };

    const handleNext = () => {
        const newErrors = validateTipoContrato(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">¿Qué tipo de contrato necesitas?</h2>
                <p className="text-sm text-slate-500 mt-1">Selecciona el tipo de contrato laboral que deseas generar</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {OPTIONS.map((opt) => {
                    const isSelected = data === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={`flex flex-col gap-3 rounded-[16px] border-2 p-5 text-left transition-all cursor-pointer ${
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <span
                                className={`material-symbols-outlined text-[32px] ${isSelected ? 'text-primary' : 'text-slate-400'}`}
                            >
                                {opt.icon}
                            </span>
                            <div>
                                <p className={`font-bold text-sm ${isSelected ? 'text-secondary' : 'text-slate-700'}`}>
                                    {opt.title}
                                </p>
                                <p
                                    className={`text-xs mt-0.5 font-semibold ${isSelected ? 'text-primary' : 'text-slate-400'}`}
                                >
                                    {opt.subtitle}
                                </p>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{opt.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {errors.tipoContrato && <p className="text-xs text-red-500">{errors.tipoContrato}</p>}

            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
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
