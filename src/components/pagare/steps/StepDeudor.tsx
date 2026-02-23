import { useState } from 'react';
import type { DeudorData } from '../types';
import { TIPOS_DOC_PERSONA, DOC_LABELS } from '../types';
import { validateDeudor, hasErrors } from '../validation';

interface StepDeudorProps {
    data: DeudorData;
    onChange: (data: DeudorData) => void;
    onNext: () => void;
    onBack: () => void;
}

const fieldClass =
    'h-12 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';
const labelClass = 'text-sm font-semibold text-slate-700';
const errorClass = 'text-xs text-red-500 mt-1';

export default function StepDeudor({ data, onChange, onNext, onBack }: StepDeudorProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const set = (field: keyof DeudorData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateDeudor(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El deudor</h2>
                <p className="text-sm text-slate-500 mt-1">Información de quien se compromete a pagar</p>
            </div>

            {/* Nombre completo */}
            <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="deudor-nombre">
                    Nombre completo o razón social
                </label>
                <input
                    id="deudor-nombre"
                    type="text"
                    value={data.nombreCompleto}
                    onChange={set('nombreCompleto')}
                    placeholder="María Fernanda López Ruiz"
                    className={fieldClass}
                />
                {errors.nombreCompleto && <p className={errorClass}>{errors.nombreCompleto}</p>}
            </div>

            {/* Tipo y número de documento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass} htmlFor="deudor-tipo-doc">
                        Tipo de documento
                    </label>
                    <select
                        id="deudor-tipo-doc"
                        value={data.tipoDocumento}
                        onChange={set('tipoDocumento')}
                        className={fieldClass}
                    >
                        <option value="">Seleccionar...</option>
                        {TIPOS_DOC_PERSONA.map((tipo) => (
                            <option key={tipo} value={tipo}>
                                {DOC_LABELS[tipo]}
                            </option>
                        ))}
                    </select>
                    {errors.tipoDocumento && <p className={errorClass}>{errors.tipoDocumento}</p>}
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className={labelClass} htmlFor="deudor-num-doc">
                        Número de documento
                    </label>
                    <input
                        id="deudor-num-doc"
                        type="text"
                        inputMode="numeric"
                        value={data.numeroDocumento}
                        onChange={set('numeroDocumento')}
                        placeholder="9876543210"
                        className={fieldClass}
                    />
                    {errors.numeroDocumento && <p className={errorClass}>{errors.numeroDocumento}</p>}
                </div>
            </div>

            {/* Teléfono y email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass} htmlFor="deudor-tel">
                        Teléfono de contacto
                    </label>
                    <input
                        id="deudor-tel"
                        type="tel"
                        value={data.telefono}
                        onChange={set('telefono')}
                        placeholder="310 987 6543"
                        className={fieldClass}
                    />
                    {errors.telefono && <p className={errorClass}>{errors.telefono}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass} htmlFor="deudor-email">
                        Correo electrónico{' '}
                        <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                        id="deudor-email"
                        type="email"
                        value={data.email}
                        onChange={set('email')}
                        placeholder="correo@ejemplo.com"
                        className={fieldClass}
                    />
                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                </div>
            </div>

            {/* Ciudad de residencia */}
            <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="deudor-ciudad">
                    Ciudad de residencia
                </label>
                <input
                    id="deudor-ciudad"
                    type="text"
                    value={data.ciudadResidencia}
                    onChange={set('ciudadResidencia')}
                    placeholder="Bogotá D.C."
                    className={fieldClass}
                />
                {errors.ciudadResidencia && <p className={errorClass}>{errors.ciudadResidencia}</p>}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 mt-2 border-t border-slate-100">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Anterior
                </button>
                <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-hover hover:translate-y-[-1px] transition-all"
                >
                    Continuar
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
