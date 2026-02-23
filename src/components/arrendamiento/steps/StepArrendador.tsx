import { useState } from 'react';
import type { ArrendadorData, TipoDocArrendador } from '../types';
import { validateArrendador, hasErrors } from '../validation';

interface StepArrendadorProps {
    data: ArrendadorData;
    onChange: (data: ArrendadorData) => void;
    onNext: () => void;
    onBack: () => void;
}

const TIPOS_DOC: TipoDocArrendador[] = ['CC', 'CE', 'NIT'];
const DOC_LABELS: Record<TipoDocArrendador, string> = {
    CC: 'Cédula de Ciudadanía',
    CE: 'Cédula de Extranjería',
    NIT: 'NIT',
};

const fieldClass =
    'h-12 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';
const labelClass = 'text-sm font-semibold text-slate-700';
const errorClass = 'text-xs text-red-500 mt-1';

export default function StepArrendador({ data, onChange, onNext, onBack }: StepArrendadorProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const set = (field: keyof ArrendadorData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validate = (): boolean => {
        const newErrors = validateArrendador(data);
        setErrors(newErrors);
        return !hasErrors(newErrors);
    };

    const handleNext = () => {
        if (validate()) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El arrendador</h2>
                <p className="text-sm text-slate-500 mt-1">Información de quien entrega el inmueble en arriendo</p>
            </div>

            {/* Nombre completo */}
            <div className="flex flex-col gap-1.5">
                <label
                    className={labelClass}
                    htmlFor="arrendador-nombre"
                >
                    Nombre completo o razón social
                </label>
                <input
                    id="arrendador-nombre"
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
                        htmlFor="arrendador-tipo-doc"
                    >
                        Tipo de documento
                    </label>
                    <select
                        id="arrendador-tipo-doc"
                        value={data.tipoDocumento}
                        onChange={set('tipoDocumento')}
                        className={fieldClass}
                    >
                        <option value="">Seleccionar...</option>
                        {TIPOS_DOC.map((tipo) => (
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
                        htmlFor="arrendador-num-doc"
                    >
                        Número de documento
                    </label>
                    <input
                        id="arrendador-num-doc"
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
                        htmlFor="arrendador-tel"
                    >
                        Teléfono de contacto
                    </label>
                    <input
                        id="arrendador-tel"
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
                        htmlFor="arrendador-email"
                    >
                        Correo electrónico <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                        id="arrendador-email"
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
