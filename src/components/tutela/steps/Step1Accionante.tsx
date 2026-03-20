import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { TutelaFormData } from '../types';
import { validateStep1, hasErrors } from '../validation';
import InputField from '../../shared/InputField';

interface Props {
    data: TutelaFormData;
    onChange: (data: TutelaFormData) => void;
    onNext: () => void;
    forceValidate?: number;
}

const base = import.meta.env.BASE_URL;

export default function Step1Accionante({ data, onChange, onNext, forceValidate }: Props) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateStep1(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof TutelaFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateStep1(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Tus datos</h2>
                <p className="text-sm text-slate-500 mt-1">
                    La tutela se presenta en nombre propio. Si necesitas actuar en nombre de otra persona,{' '}
                    <a
                        href={base + 'asesoria/checkout'}
                        className="text-primary font-semibold hover:underline cursor-pointer"
                    >
                        agenda una asesoría personalizada
                    </a>
                    .
                </p>
            </div>

            <InputField
                id="nombre-completo"
                label="Nombre completo"
                type="text"
                value={data.nombreCompleto}
                onChange={set('nombreCompleto')}
                placeholder="María Camila Torres Gómez"
                error={errors.nombreCompleto}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="cedula"
                    label="Número de cédula"
                    type="text"
                    inputMode="numeric"
                    value={data.cedula}
                    onChange={set('cedula')}
                    placeholder="1023456789"
                    error={errors.cedula}
                />
                <InputField
                    id="ciudad"
                    label="Ciudad de domicilio"
                    type="text"
                    value={data.ciudad}
                    onChange={set('ciudad')}
                    placeholder="Bogotá D.C."
                    error={errors.ciudad}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="telefono"
                    label="Teléfono / Celular"
                    type="tel"
                    value={data.telefono}
                    onChange={set('telefono')}
                    placeholder="300 123 4567"
                    error={errors.telefono}
                />
                <InputField
                    id="correo"
                    label="Correo electrónico"
                    type="email"
                    value={data.correo}
                    onChange={set('correo')}
                    placeholder="correo@ejemplo.com"
                    error={errors.correo}
                />
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
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
