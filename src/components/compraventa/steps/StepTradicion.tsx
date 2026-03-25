import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { TradicionData } from '../types';
import { validateTradicion, hasErrors } from '../validation';
import InputField from '../../shared/InputField';
import SelectField from '../../shared/SelectField';

const TIPO_ACTO_OPTIONS = [
    { value: 'COMPRAVENTA', label: 'Compraventa' },
    { value: 'SUCESION', label: 'Sucesión' },
    { value: 'DONACION', label: 'Donación' },
    { value: 'PRESCRIPCION', label: 'Prescripción' },
    { value: 'PERMUTA', label: 'Permuta' },
];

interface StepTradicionProps {
    data: TradicionData;
    onChange: (data: TradicionData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function StepTradicion({ data, onChange, onNext, onBack, forceValidate }: StepTradicionProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateTradicion(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof TradicionData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateTradicion(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Tradicion del inmueble</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Antecedente de dominio: como adquirio el vendedor el inmueble
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Tipo de acto de adquisicion</label>
                <SelectField
                    id="tradicion-tipo-acto"
                    value={data.tipoActo}
                    onChange={(val) => {
                        onChange({ ...data, tipoActo: val });
                        if (errors.tipoActo) setErrors((prev) => ({ ...prev, tipoActo: '' }));
                    }}
                    options={TIPO_ACTO_OPTIONS}
                    placeholder="Seleccionar tipo de acto..."
                    error={errors.tipoActo}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="tradicion-escritura-nro"
                    label="Numero de escritura publica"
                    type="text"
                    value={data.escrituraNro}
                    onChange={set('escrituraNro')}
                    placeholder="1234"
                    error={errors.escrituraNro}
                />
                <InputField
                    id="tradicion-notaria"
                    label="Notaria"
                    type="text"
                    value={data.notaria}
                    onChange={set('notaria')}
                    placeholder="Notaria 15 de Bogota"
                    error={errors.notaria}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="tradicion-folio"
                    label="Folio de matricula inmobiliaria"
                    type="text"
                    value={data.folioMatricula}
                    onChange={set('folioMatricula')}
                    placeholder="50N-12345678"
                    error={errors.folioMatricula}
                />
                <InputField
                    id="tradicion-ciudad-registro"
                    label="Ciudad de la oficina de registro"
                    type="text"
                    value={data.ciudadRegistro}
                    onChange={set('ciudadRegistro')}
                    placeholder="Bogota"
                    error={errors.ciudadRegistro}
                />
            </div>

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
