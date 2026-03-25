import { useState, useEffect } from 'react';
import { Button, Switch } from '@headlessui/react';
import type { EscrituraData } from '../types';
import { validateEscritura, hasErrors } from '../validation';
import ColombiaLocationSelect from '../../shared/ColombiaLocationSelect';
import InputField from '../../shared/InputField';
import SelectField from '../../shared/SelectField';

const GASTOS_OPTIONS = [
    { value: 'por partes iguales entre comprador y vendedor', label: 'Por partes iguales' },
    { value: 'a cargo del comprador', label: 'A cargo del comprador' },
    { value: 'a cargo del vendedor', label: 'A cargo del vendedor' },
];

interface StepEscrituraProps {
    data: EscrituraData;
    onChange: (data: EscrituraData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function StepEscritura({ data, onChange, onNext, onBack, forceValidate }: StepEscrituraProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateEscritura(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof EscrituraData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateEscritura(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Escritura publica y gastos</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Notaria, fecha, distribucion de gastos y domicilio contractual
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="escritura-notaria"
                    label="Notaria para la escritura"
                    type="text"
                    value={data.notaria}
                    onChange={set('notaria')}
                    placeholder="Notaria 15 de Bogota"
                    error={errors.notaria}
                />
                <InputField
                    id="escritura-fecha"
                    label="Fecha de otorgamiento de escritura"
                    type="date"
                    value={data.fecha}
                    onChange={set('fecha')}
                    error={errors.fecha}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Distribucion de gastos</label>
                <SelectField
                    id="escritura-gastos"
                    value={data.gastosDistribucion}
                    onChange={(val) => {
                        onChange({ ...data, gastosDistribucion: val });
                        if (errors.gastosDistribucion) setErrors((prev) => ({ ...prev, gastosDistribucion: '' }));
                    }}
                    options={GASTOS_OPTIONS}
                    placeholder="Seleccionar distribucion..."
                    error={errors.gastosDistribucion}
                />
            </div>

            <ColombiaLocationSelect
                idPrefix="escritura-domicilio"
                cityLabel="Ciudad de domicilio contractual"
                value={data.domicilioCiudad}
                departmentValue={data.domicilioDepartamento}
                onChange={(city) => {
                    onChange({ ...data, domicilioCiudad: city });
                    if (errors.domicilioCiudad) setErrors((prev) => ({ ...prev, domicilioCiudad: '' }));
                }}
                onDepartmentChange={(dept) => onChange({ ...data, domicilioDepartamento: dept })}
                error={errors.domicilioCiudad}
            />

            {/* ── Toggle testigo ── */}
            <div className="flex items-center gap-3 pt-2">
                <Switch
                    checked={data.incluyeTestigo}
                    onChange={(checked: boolean) => {
                        onChange({
                            ...data,
                            incluyeTestigo: checked,
                            testigoNombre: checked ? data.testigoNombre : '',
                            testigoCC: checked ? data.testigoCC : '',
                        });
                    }}
                    className={[
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                        data.incluyeTestigo ? 'bg-primary' : 'bg-slate-200',
                    ].join(' ')}
                >
                    <span
                        className={[
                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                            data.incluyeTestigo ? 'translate-x-5' : 'translate-x-0',
                        ].join(' ')}
                    />
                </Switch>
                <span className="text-sm font-semibold text-slate-700">Incluir testigo</span>
            </div>

            {data.incluyeTestigo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                        id="testigo-nombre"
                        label="Nombre del testigo"
                        type="text"
                        value={data.testigoNombre}
                        onChange={set('testigoNombre')}
                        placeholder="Pedro Ramirez Lopez"
                        error={errors.testigoNombre}
                    />
                    <InputField
                        id="testigo-cc"
                        label="Cedula del testigo"
                        type="text"
                        inputMode="numeric"
                        value={data.testigoCC}
                        onChange={set('testigoCC')}
                        placeholder="5555666777"
                        error={errors.testigoCC}
                    />
                </div>
            )}

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
                    Ver promesa
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
            </div>
        </div>
    );
}
