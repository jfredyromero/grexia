import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { EmpleadorData, TipoDocEmpleador } from '../types';
import { TIPOS_DOC_EMPLEADOR, DOC_LABELS } from '../types';
import { validateEmpleador, hasErrors } from '../validation';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import type { SelectOption } from '../../shared/SelectField';

interface StepEmpleadorProps {
    data: EmpleadorData;
    onChange: (data: EmpleadorData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

const DOC_OPTIONS: SelectOption<TipoDocEmpleador>[] = TIPOS_DOC_EMPLEADOR.map((tipo) => ({
    value: tipo,
    label: DOC_LABELS[tipo],
}));

export default function StepEmpleador({ data, onChange, onNext, onBack, forceValidate }: StepEmpleadorProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateEmpleador(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof EmpleadorData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateEmpleador(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El empleador</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Información de quien contrata. Puede ser una persona natural o una empresa.
                </p>
            </div>

            <InputField
                id="empleador-nombre"
                label="Nombre completo o razón social"
                type="text"
                value={data.nombreCompleto}
                onChange={set('nombreCompleto')}
                placeholder="Juan García o Empresa S.A.S."
                error={errors.nombreCompleto}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tipo de documento</label>
                    <SelectField
                        id="empleador-tipo-doc"
                        value={data.tipoDocumento}
                        onChange={(val) => {
                            onChange({ ...data, tipoDocumento: val as TipoDocEmpleador });
                            if (errors.tipoDocumento) setErrors((prev) => ({ ...prev, tipoDocumento: '' }));
                        }}
                        options={DOC_OPTIONS}
                        error={errors.tipoDocumento}
                    />
                </div>
                <div className="sm:col-span-2">
                    <InputField
                        id="empleador-num-doc"
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

            <InputField
                id="empleador-ciudad"
                label="Ciudad"
                type="text"
                value={data.ciudad}
                onChange={set('ciudad')}
                placeholder="Bogotá D.C."
                error={errors.ciudad}
            />

            <InputField
                id="empleador-direccion"
                label="Dirección"
                type="text"
                value={data.direccion}
                onChange={set('direccion')}
                placeholder="Calle 100 No. 15-20"
                error={errors.direccion}
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
