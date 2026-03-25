import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { CompradorData } from '../types';
import { validateComprador, hasErrors } from '../validation';
import ColombiaLocationSelect from '../../shared/ColombiaLocationSelect';
import InputField from '../../shared/InputField';

interface StepCompradorProps {
    data: CompradorData;
    onChange: (data: CompradorData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function StepComprador({ data, onChange, onNext, onBack, forceValidate }: StepCompradorProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateComprador(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof CompradorData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateComprador(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El comprador</h2>
                <p className="text-sm text-slate-500 mt-1">Datos del promitente comprador del inmueble</p>
            </div>

            <InputField
                id="comprador-nombre"
                label="Nombre completo"
                type="text"
                value={data.nombre}
                onChange={set('nombre')}
                placeholder="Maria Fernanda Lopez Castro"
                error={errors.nombre}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="comprador-cc"
                    label="Cedula de ciudadania"
                    type="text"
                    inputMode="numeric"
                    value={data.cc}
                    onChange={set('cc')}
                    placeholder="9876543210"
                    error={errors.cc}
                />
                <InputField
                    id="comprador-cc-expedida"
                    label="Expedida en"
                    type="text"
                    value={data.ccExpedidaEn}
                    onChange={set('ccExpedidaEn')}
                    placeholder="Medellin"
                    error={errors.ccExpedidaEn}
                />
            </div>

            <ColombiaLocationSelect
                idPrefix="comprador-domicilio"
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

            <div className="flex justify-between pt-4 mt-2 border-t border-slate-100">
                <Button
                    onClick={onBack}
                    className="cursor-pointer flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 data-hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Anterior
                </Button>
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
