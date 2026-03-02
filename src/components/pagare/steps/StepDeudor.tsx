import { useState } from 'react';
import { Button } from '@headlessui/react';
import type { DeudorData, TipoDocPersona } from '../types';
import { TIPOS_DOC_PERSONA, DOC_LABELS } from '../types';
import { validateDeudor, hasErrors } from '../validation';
import ColombiaLocationSelect from '../../shared/ColombiaLocationSelect';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import type { SelectOption } from '../../shared/SelectField';

interface StepDeudorProps {
    data: DeudorData;
    onChange: (data: DeudorData) => void;
    onNext: () => void;
    onBack: () => void;
}

const DOC_OPTIONS: SelectOption<TipoDocPersona>[] = TIPOS_DOC_PERSONA.map((tipo) => ({
    value: tipo,
    label: DOC_LABELS[tipo],
}));

export default function StepDeudor({ data, onChange, onNext, onBack }: StepDeudorProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const set = (field: keyof DeudorData) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

            <InputField
                id="deudor-nombre"
                label="Nombre completo o razón social"
                type="text"
                value={data.nombreCompleto}
                onChange={set('nombreCompleto')}
                placeholder="María Fernanda López Ruiz"
                error={errors.nombreCompleto}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tipo de documento</label>
                    <SelectField
                        id="deudor-tipo-doc"
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
                        id="deudor-num-doc"
                        label="Número de documento"
                        type="text"
                        inputMode="numeric"
                        value={data.numeroDocumento}
                        onChange={set('numeroDocumento')}
                        placeholder="9876543210"
                        error={errors.numeroDocumento}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="deudor-tel"
                    label="Teléfono de contacto"
                    type="tel"
                    value={data.telefono}
                    onChange={set('telefono')}
                    placeholder="310 987 6543"
                    error={errors.telefono}
                />
                <InputField
                    id="deudor-email"
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

            <ColombiaLocationSelect
                idPrefix="deudor-ciudad"
                cityLabel="Ciudad de residencia"
                value={data.ciudadResidencia}
                onChange={(city) => {
                    onChange({ ...data, ciudadResidencia: city });
                    if (errors.ciudadResidencia) setErrors((prev) => ({ ...prev, ciudadResidencia: '' }));
                }}
                error={errors.ciudadResidencia}
            />

            <div className="flex justify-between pt-4 mt-2 border-t border-slate-100">
                <Button
                    onClick={onBack}
                    className="flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 data-hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Anterior
                </Button>
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
