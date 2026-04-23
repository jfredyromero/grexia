import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { TutelaFormData } from '../types';
import { EPS_LIST } from '../types';
import { validateStep2, hasErrors } from '../validation';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import type { SelectOption } from '../../shared/SelectField';

interface Props {
    data: TutelaFormData;
    onChange: (data: TutelaFormData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

const EPS_OPTIONS: SelectOption<string>[] = EPS_LIST.map((eps) => ({ value: eps, label: eps }));

export default function Step2EPS({ data, onChange, onNext, onBack, forceValidate }: Props) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateStep2(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof TutelaFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateStep2(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">La entidad accionada</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Datos de la EPS u entidad de salud que ha negado el servicio
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">EPS accionada</label>
                <SelectField
                    id="nombre-eps"
                    value={data.nombreEPS}
                    onChange={(val) => {
                        onChange({ ...data, nombreEPS: val, otraEPS: '' });
                        if (errors.nombreEPS) setErrors((prev) => ({ ...prev, nombreEPS: '' }));
                    }}
                    options={EPS_OPTIONS}
                    error={errors.nombreEPS}
                />
            </div>

            {data.nombreEPS === 'Otra' && (
                <InputField
                    id="otra-eps"
                    label="Nombre de la entidad"
                    type="text"
                    value={data.otraEPS}
                    onChange={set('otraEPS')}
                    placeholder="Nombre completo de la entidad de salud"
                    error={errors.otraEPS}
                />
            )}

            <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Régimen</p>
                <div className="flex gap-4">
                    {(['contributivo', 'subsidiado'] as const).map((r) => (
                        <label
                            key={r}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="regimen"
                                value={r}
                                checked={data.regimen === r}
                                onChange={() => {
                                    onChange({ ...data, regimen: r });
                                    if (errors.regimen) setErrors((prev) => ({ ...prev, regimen: '' }));
                                }}
                                className="w-4 h-4 accent-primary cursor-pointer"
                            />
                            <span className="text-sm text-slate-700 capitalize">{r}</span>
                        </label>
                    ))}
                </div>
                {errors.regimen && <p className="text-xs text-red-500 mt-1">{errors.regimen}</p>}
            </div>

            <InputField
                id="sede-eps"
                label="Sede / Ciudad de la EPS"
                type="text"
                value={data.sedeEPS}
                onChange={set('sedeEPS')}
                placeholder="Bogotá D.C., Calle 100 # 15-32"
                error={errors.sedeEPS}
            />

            <InputField
                id="correo-eps"
                label={
                    <>
                        Correo de notificación de la EPS <span className="text-slate-400 font-normal">(opcional)</span>
                    </>
                }
                type="email"
                value={data.correoEPS}
                onChange={set('correoEPS')}
                placeholder="notificaciones@eps.com.co"
                error={errors.correoEPS}
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
