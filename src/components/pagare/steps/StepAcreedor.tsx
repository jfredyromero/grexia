import { useState } from 'react';
import { Button } from '@headlessui/react';
import type { AcreedorData, TipoDocPersona } from '../types';
import { TIPOS_DOC_PERSONA, DOC_LABELS } from '../types';
import { validateAcreedor, hasErrors } from '../validation';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import type { SelectOption } from '../../shared/SelectField';

interface StepAcreedorProps {
    data: AcreedorData;
    onChange: (data: AcreedorData) => void;
    onNext: () => void;
}

const DOC_OPTIONS: SelectOption<TipoDocPersona>[] = TIPOS_DOC_PERSONA.map((tipo) => ({
    value: tipo,
    label: DOC_LABELS[tipo],
}));

export default function StepAcreedor({ data, onChange, onNext }: StepAcreedorProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const set = (field: keyof AcreedorData) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

            <InputField
                id="acreedor-nombre"
                label="Nombre completo o razón social"
                type="text"
                value={data.nombreCompleto}
                onChange={set('nombreCompleto')}
                placeholder="Juan Carlos Gómez Martínez"
                error={errors.nombreCompleto}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tipo de documento</label>
                    <SelectField
                        id="acreedor-tipo-doc"
                        value={data.tipoDocumento}
                        onChange={(val) => {
                            onChange({ ...data, tipoDocumento: val as TipoDocPersona });
                            if (errors.tipoDocumento) setErrors((prev) => ({ ...prev, tipoDocumento: '' }));
                        }}
                        options={DOC_OPTIONS}
                        error={errors.tipoDocumento}
                    />
                </div>
                <div className="sm:col-span-2">
                    <InputField
                        id="acreedor-num-doc"
                        label="Número de documento"
                        type="text"
                        inputMode="numeric"
                        value={data.numeroDocumento}
                        onChange={set('numeroDocumento')}
                        placeholder="1234567890"
                        error={errors.numeroDocumento}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="acreedor-tel"
                    label="Teléfono de contacto"
                    type="tel"
                    value={data.telefono}
                    onChange={set('telefono')}
                    placeholder="300 123 4567"
                    error={errors.telefono}
                />
                <InputField
                    id="acreedor-email"
                    label={
                        <>
                            Correo electrónico <span className="text-slate-400 font-normal">(opcional)</span>
                        </>
                    }
                    type="email"
                    value={data.email}
                    onChange={set('email')}
                    placeholder="correo@ejemplo.com"
                    error={errors.email}
                />
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
                <Button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all"
                >
                    Continuar
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
            </div>
        </div>
    );
}
