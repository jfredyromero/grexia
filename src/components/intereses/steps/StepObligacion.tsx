import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { InteresesFormData, TipoInteres } from '../types';
import { validateObligacion, hasErrors } from '../validation';
import InputField from '../../shared/InputField';
import { formatCOPInput } from '../interesesUtils';

interface StepObligacionProps {
    data: InteresesFormData;
    onChange: (data: InteresesFormData) => void;
    onNext: () => void;
    forceValidate?: number;
}

const TIPOS: { value: TipoInteres; label: string; desc: string }[] = [
    { value: 'corriente', label: 'Corriente', desc: 'Tasa certificada Superfinanciera' },
    { value: 'moratorio', label: 'Moratorio', desc: 'Tasa corriente × 1.5 (usura)' },
];

export default function StepObligacion({ data, onChange, onNext, forceValidate }: StepObligacionProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateObligacion(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof InteresesFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const setTipo = (tipo: TipoInteres) => {
        onChange({ ...data, tipoInteres: tipo });
        if (errors.tipoInteres) setErrors((prev) => ({ ...prev, tipoInteres: '' }));
    };

    const handleNext = () => {
        const newErrors = validateObligacion(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    const errorClass = 'text-xs text-red-500 mt-1';

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">La obligación</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Ingresa los datos de la obligación para liquidar los intereses
                </p>
            </div>

            {/* Capital */}
            <InputField
                id="int-capital"
                label="Capital (COP)"
                type="text"
                inputMode="numeric"
                value={data.capital ? formatCOPInput(data.capital) : ''}
                onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    onChange({ ...data, capital: raw });
                    if (errors.capital) setErrors((prev) => ({ ...prev, capital: '' }));
                }}
                placeholder="5.000.000"
                prefix="$"
                error={errors.capital}
            />

            {/* Tipo de interés */}
            <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-700">Tipo de interés</p>
                <div className="grid grid-cols-2 gap-3">
                    {TIPOS.map((t) => (
                        <Button
                            key={t.value}
                            onClick={() => setTipo(t.value)}
                            className={[
                                'flex flex-col gap-1 rounded-[12px] border-2 p-4 text-left transition-all cursor-pointer',
                                data.tipoInteres === t.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 bg-white data-hover:border-slate-300',
                            ].join(' ')}
                        >
                            <span
                                className={`text-sm font-bold ${data.tipoInteres === t.value ? 'text-secondary' : 'text-slate-700'}`}
                            >
                                {t.label}
                            </span>
                            <span className="text-xs text-slate-500">{t.desc}</span>
                        </Button>
                    ))}
                </div>
                {errors.tipoInteres && <p className={errorClass}>{errors.tipoInteres}</p>}
            </div>

            {/* Fecha inicio de mora */}
            <InputField
                id="int-fecha-inicio"
                label="Fecha inicio de mora"
                type="date"
                value={data.fechaIniciaMora}
                onChange={set('fechaIniciaMora')}
                error={errors.fechaIniciaMora}
                description="Día siguiente al vencimiento de la obligación"
            />

            {/* Fecha de pago */}
            <InputField
                id="int-fecha-pago"
                label="Fecha de pago"
                type="date"
                value={data.fechaPago}
                onChange={set('fechaPago')}
                error={errors.fechaPago}
            />

            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
                <Button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all cursor-pointer"
                >
                    Calcular intereses
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
            </div>
        </div>
    );
}
