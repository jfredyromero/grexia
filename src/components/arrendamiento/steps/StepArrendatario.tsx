import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { ArrendatarioData, TipoDocArrendatario } from '../types';
import { validateArrendatario, hasErrors } from '../validation';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import type { SelectOption } from '../../shared/SelectField';

interface StepArrendatarioProps {
    data: ArrendatarioData;
    onChange: (data: ArrendatarioData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

const DOC_OPTIONS: SelectOption<TipoDocArrendatario>[] = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'Pasaporte', label: 'Pasaporte' },
];

export default function StepArrendatario({ data, onChange, onNext, onBack, forceValidate }: StepArrendatarioProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateArrendatario(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof ArrendatarioData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateArrendatario(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El arrendatario</h2>
                <p className="text-sm text-slate-500 mt-1">Información de quien recibirá el inmueble en arriendo</p>
            </div>

            <InputField
                id="arrendatario-nombre"
                label="Nombre completo"
                type="text"
                value={data.nombreCompleto}
                onChange={set('nombreCompleto')}
                placeholder="María Fernanda López Castro"
                error={errors.nombreCompleto}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tipo de documento</label>
                    <SelectField
                        id="arrendatario-tipo-doc"
                        value={data.tipoDocumento}
                        onChange={(val) => {
                            onChange({ ...data, tipoDocumento: val as TipoDocArrendatario });
                            if (errors.tipoDocumento) setErrors((prev) => ({ ...prev, tipoDocumento: '' }));
                        }}
                        options={DOC_OPTIONS}
                        error={errors.tipoDocumento}
                    />
                </div>
                <div className="sm:col-span-2">
                    <InputField
                        id="arrendatario-num-doc"
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
                    id="arrendatario-tel"
                    label="Teléfono de contacto"
                    type="tel"
                    value={data.telefono}
                    onChange={set('telefono')}
                    placeholder="310 987 6543"
                    error={errors.telefono}
                />
                <InputField
                    id="arrendatario-email"
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
