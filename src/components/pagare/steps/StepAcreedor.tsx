import { useState } from 'react';
import type { AcreedorData } from '../types';
import { TIPOS_DOC_PERSONA, DOC_LABELS } from '../types';
import { validateAcreedor, hasErrors } from '../validation';

interface StepAcreedorProps {
    data: AcreedorData;
    onChange: (data: AcreedorData) => void;
    onNext: () => void;
}

const fieldClass =
    'h-12 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';
const labelClass = 'text-sm font-semibold text-slate-700';
const errorClass = 'text-xs text-red-500 mt-1';

export default function StepAcreedor({ data, onChange, onNext }: StepAcreedorProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const set = (field: keyof AcreedorData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateAcreedor(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El acreedor</h2>
                <p className="text-sm text-slate-500 mt-1">Información de quien otorga el crédito y recibirá el pago</p>
            </div>

            {/* Nombre completo */}
            <div className="flex flex-col gap-1.5">
                <label
                    className={labelClass}
                    htmlFor="acreedor-nombre"
                >
                    Nombre completo o razón social
                </label>
                <input
                    id="acreedor-nombre"
                    type="text"
                    value={data.nombreCompleto}
                    onChange={set('nombreCompleto')}
                    placeholder="Juan Carlos Gómez Martínez"
                    className={fieldClass}
                />
                {errors.nombreCompleto && <p className={errorClass}>{errors.nombreCompleto}</p>}
            </div>

            {/* Tipo y número de documento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="acreedor-tipo-doc"
                    >
                        Tipo de documento
                    </label>
                    <select
                        id="acreedor-tipo-doc"
                        value={data.tipoDocumento}
                        onChange={set('tipoDocumento')}
                        className={fieldClass}
                    >
                        <option value="">Seleccionar...</option>
                        {TIPOS_DOC_PERSONA.map((tipo) => (
                            <option
                                key={tipo}
                                value={tipo}
                            >
                                {DOC_LABELS[tipo]}
                            </option>
                        ))}
                    </select>
                    {errors.tipoDocumento && <p className={errorClass}>{errors.tipoDocumento}</p>}
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label
                        className={labelClass}
                        htmlFor="acreedor-num-doc"
                    >
                        Número de documento
                    </label>
                    <input
                        id="acreedor-num-doc"
                        type="text"
                        inputMode="numeric"
                        value={data.numeroDocumento}
                        onChange={set('numeroDocumento')}
                        placeholder="1234567890"
                        className={fieldClass}
                    />
                    {errors.numeroDocumento && <p className={errorClass}>{errors.numeroDocumento}</p>}
                </div>
            </div>

            {/* Teléfono y email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="acreedor-tel"
                    >
                        Teléfono de contacto
                    </label>
                    <input
                        id="acreedor-tel"
                        type="tel"
                        value={data.telefono}
                        onChange={set('telefono')}
                        placeholder="300 123 4567"
                        className={fieldClass}
                    />
                    {errors.telefono && <p className={errorClass}>{errors.telefono}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="acreedor-email"
                    >
                        Correo electrónico <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                        id="acreedor-email"
                        type="email"
                        value={data.email}
                        onChange={set('email')}
                        placeholder="correo@ejemplo.com"
                        className={fieldClass}
                    />
                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
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
