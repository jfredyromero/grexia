import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { VendedorData } from '../types';
import { validateVendedor, hasErrors } from '../validation';
import ColombiaLocationSelect from '../../shared/ColombiaLocationSelect';
import InputField from '../../shared/InputField';

interface StepVendedorProps {
    data: VendedorData;
    onChange: (data: VendedorData) => void;
    onNext: () => void;
    forceValidate?: number;
}

export default function StepVendedor({ data, onChange, onNext, forceValidate }: StepVendedorProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateVendedor(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof VendedorData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateVendedor(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El vendedor</h2>
                <p className="text-sm text-slate-500 mt-1">Datos del promitente vendedor del inmueble</p>
            </div>

            <InputField
                id="vendedor-nombre"
                label="Nombre completo"
                type="text"
                value={data.nombre}
                onChange={set('nombre')}
                placeholder="Juan Carlos Gomez Martinez"
                error={errors.nombre}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="vendedor-cc"
                    label="Cedula de ciudadania"
                    type="text"
                    inputMode="numeric"
                    value={data.cc}
                    onChange={set('cc')}
                    placeholder="1234567890"
                    error={errors.cc}
                />
                <InputField
                    id="vendedor-cc-expedida"
                    label="Expedida en"
                    type="text"
                    value={data.ccExpedidaEn}
                    onChange={set('ccExpedidaEn')}
                    placeholder="Bogota"
                    error={errors.ccExpedidaEn}
                />
            </div>

            <ColombiaLocationSelect
                idPrefix="vendedor-domicilio"
                cityLabel="Ciudad de domicilio"
                value={data.ciudad}
                departmentValue={data.departamento}
                onChange={(city) => {
                    onChange({ ...data, ciudad: city });
                    if (errors.ciudad) setErrors((prev) => ({ ...prev, ciudad: '' }));
                }}
                onDepartmentChange={(dept) => onChange({ ...data, departamento: dept })}
                error={errors.ciudad}
            />

            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
                <Button
                    onClick={handleNext}
                    className="cursor-pointer flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all"
                >
                    Continuar
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
            </div>
        </div>
    );
}
