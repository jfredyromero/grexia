import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { TutelaFormData } from '../types';
import { CONDICIONES_VULNERABILIDAD } from '../types';
import { validateStep4, hasErrors } from '../validation';
import InputField from '../../shared/InputField';

interface Props {
    data: TutelaFormData;
    onChange: (data: TutelaFormData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function Step4Vulnerabilidad({ data, onChange, onNext, onBack, forceValidate }: Props) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateStep4(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const toggleCondicion = (value: string) => {
        let next: string[];
        if (value === 'ninguna') {
            next = data.condicionesVulnerabilidad.includes('ninguna') ? [] : ['ninguna'];
        } else {
            const sinNinguna = data.condicionesVulnerabilidad.filter((v) => v !== 'ninguna');
            next = sinNinguna.includes(value) ? sinNinguna.filter((v) => v !== value) : [...sinNinguna, value];
        }
        onChange({ ...data, condicionesVulnerabilidad: next });
        if (errors.condicionesVulnerabilidad) setErrors((prev) => ({ ...prev, condicionesVulnerabilidad: '' }));
    };

    const set = (field: keyof TutelaFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateStep4(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    const showDiscapacidad = data.condicionesVulnerabilidad.includes('discapacidad');
    const showZona = data.condicionesVulnerabilidad.includes('zona_dificil');

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Condición de vulnerabilidad</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Identifica si te encuentras en alguna de estas situaciones de especial protección constitucional
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {CONDICIONES_VULNERABILIDAD.map(({ value, label }) => (
                    <label
                        key={value}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <input
                            type="checkbox"
                            checked={data.condicionesVulnerabilidad.includes(value)}
                            onChange={() => toggleCondicion(value)}
                            className="w-4 h-4 accent-primary cursor-pointer rounded"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                            {label}
                        </span>
                    </label>
                ))}
                {errors.condicionesVulnerabilidad && (
                    <p className="text-xs text-red-500">{errors.condicionesVulnerabilidad}</p>
                )}
            </div>

            {showDiscapacidad && (
                <InputField
                    id="tipo-discapacidad"
                    label="Describe el tipo de discapacidad"
                    type="text"
                    value={data.tipoDiscapacidad}
                    onChange={set('tipoDiscapacidad')}
                    placeholder="Ej: discapacidad motriz del miembro inferior derecho"
                    error={errors.tipoDiscapacidad}
                />
            )}

            {showZona && (
                <InputField
                    id="zona-acceso"
                    label="Municipio o vereda de difícil acceso"
                    type="text"
                    value={data.descripcionZonaAcceso}
                    onChange={set('descripcionZonaAcceso')}
                    placeholder="Ej: Vereda La Esperanza, municipio de San José del Guaviare"
                    error={errors.descripcionZonaAcceso}
                />
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
