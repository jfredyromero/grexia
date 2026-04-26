import { useEffect, useState } from 'react';
import { Button } from '@headlessui/react';
import type { TipoProceso } from '../types';
import { TIPOS_PROCESO } from '../types';
import { validateTipoProceso, hasErrors } from '../validation';

interface StepTipoProcesoProps {
    data: TipoProceso | '';
    onChange: (tipo: TipoProceso) => void;
    onNext: () => void;
    forceValidate?: number;
}

const base = import.meta.env.BASE_URL;

export default function StepTipoProceso({ data, onChange, onNext, forceValidate }: StepTipoProcesoProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateTipoProceso(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const handleSelect = (tipo: TipoProceso) => {
        onChange(tipo);
        if (errors.tipoProceso) setErrors({});
    };

    const handleNext = () => {
        const newErrors = validateTipoProceso(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">¿Para qué tipo de proceso necesitas el poder?</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Elige el tipo de proceso. Esto adapta el formulario y el documento final.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIPOS_PROCESO.map((opt) => {
                    const isSelected = data === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={`flex items-start gap-3 rounded-[16px] border-2 p-4 text-left transition-all cursor-pointer ${
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <span
                                className={`material-symbols-outlined text-[28px] shrink-0 ${
                                    isSelected ? 'text-primary' : 'text-slate-400'
                                }`}
                            >
                                {opt.icon}
                            </span>
                            <div>
                                <p className={`font-bold text-sm ${isSelected ? 'text-secondary' : 'text-slate-700'}`}>
                                    {opt.label}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {errors.tipoProceso && <p className="text-xs text-red-500">{errors.tipoProceso}</p>}

            {/* Banner asesoría */}
            <div className="flex items-start gap-3 rounded-[12px] bg-amber-50 border border-amber-200 p-4">
                <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5">info</span>
                <div>
                    <p className="text-sm font-semibold text-amber-800">¿Tu proceso no está en la lista?</p>
                    <p className="text-xs text-amber-700 mt-1">
                        Para casos especiales o con condiciones particulares, te recomendamos una asesoría legal
                        personalizada.{' '}
                        <a
                            href={base + 'asesoria/checkout'}
                            className="underline font-semibold hover:text-amber-900"
                        >
                            Agenda una asesoría
                        </a>
                        .
                    </p>
                </div>
            </div>

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
