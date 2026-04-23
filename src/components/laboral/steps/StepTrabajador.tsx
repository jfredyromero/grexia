import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { TrabajadorData, TipoDocTrabajador } from '../types';
import { TIPOS_DOC_TRABAJADOR, DOC_LABELS } from '../types';
import { validateTrabajador, hasErrors } from '../validation';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import type { SelectOption } from '../../shared/SelectField';

interface StepTrabajadorProps {
    data: TrabajadorData;
    onChange: (data: TrabajadorData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

const DOC_OPTIONS: SelectOption<TipoDocTrabajador>[] = TIPOS_DOC_TRABAJADOR.map((tipo) => ({
    value: tipo,
    label: DOC_LABELS[tipo],
}));

export default function StepTrabajador({ data, onChange, onNext, onBack, forceValidate }: StepTrabajadorProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateTrabajador(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof TrabajadorData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateTrabajador(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El trabajador</h2>
                <p className="text-sm text-slate-500 mt-1">Información de la persona que prestará sus servicios.</p>
            </div>

            <InputField
                id="trabajador-nombre"
                label="Nombre completo"
                type="text"
                value={data.nombreCompleto}
                onChange={set('nombreCompleto')}
                placeholder="María Fernanda López Torres"
                error={errors.nombreCompleto}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tipo de documento</label>
                    <SelectField
                        id="trabajador-tipo-doc"
                        value={data.tipoDocumento}
                        onChange={(val) => {
                            onChange({ ...data, tipoDocumento: val as TipoDocTrabajador });
                            if (errors.tipoDocumento) setErrors((prev) => ({ ...prev, tipoDocumento: '' }));
                        }}
                        options={DOC_OPTIONS}
                        error={errors.tipoDocumento}
                    />
                </div>
                <div className="sm:col-span-2">
                    <InputField
                        id="trabajador-num-doc"
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

            <InputField
                id="trabajador-ciudad"
                label="Ciudad de residencia"
                type="text"
                value={data.ciudad}
                onChange={set('ciudad')}
                placeholder="Bogotá D.C."
                error={errors.ciudad}
            />

            <InputField
                id="trabajador-direccion"
                label="Dirección de residencia"
                type="text"
                value={data.direccion}
                onChange={set('direccion')}
                placeholder="Carrera 15 No. 80-22 Apt 301"
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
