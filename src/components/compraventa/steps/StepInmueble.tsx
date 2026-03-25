import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { InmuebleData } from '../types';
import { validateInmueble, hasErrors } from '../validation';
import InputField from '../../shared/InputField';
import ColombiaLocationSelect from '../../shared/ColombiaLocationSelect';

interface StepInmuebleProps {
    data: InmuebleData;
    onChange: (data: InmuebleData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function StepInmueble({ data, onChange, onNext, onBack, forceValidate }: StepInmuebleProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateInmueble(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof InmuebleData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateInmueble(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El inmueble</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Datos del bien inmueble objeto de la promesa de compraventa
                </p>
            </div>

            <InputField
                id="inmueble-direccion"
                label="Direccion completa"
                type="text"
                value={data.direccion}
                onChange={set('direccion')}
                placeholder="Calle 100 #15-20 Apto 501, Conjunto Residencial Los Pinos"
                error={errors.direccion}
            />

            <ColombiaLocationSelect
                idPrefix="inmueble-ubicacion"
                cityLabel="Ciudad del inmueble"
                value={data.ciudad}
                departmentValue={data.departamento}
                onChange={(city) => {
                    onChange({ ...data, ciudad: city });
                    if (errors.ciudad) setErrors((prev) => ({ ...prev, ciudad: '' }));
                }}
                onDepartmentChange={(dept) => onChange({ ...data, departamento: dept })}
                error={errors.ciudad}
            />

            <InputField
                id="inmueble-area"
                label="Area (m2)"
                type="text"
                inputMode="numeric"
                value={data.area}
                onChange={set('area')}
                placeholder="85"
                suffix="m2"
                error={errors.area}
            />

            <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Linderos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                        id="inmueble-lindero-norte"
                        label="Norte"
                        type="text"
                        value={data.linderoNorte}
                        onChange={set('linderoNorte')}
                        placeholder="Apto 502"
                        error={errors.linderoNorte}
                    />
                    <InputField
                        id="inmueble-lindero-sur"
                        label="Sur"
                        type="text"
                        value={data.linderoSur}
                        onChange={set('linderoSur')}
                        placeholder="Zona comun"
                        error={errors.linderoSur}
                    />
                    <InputField
                        id="inmueble-lindero-oriente"
                        label="Oriente"
                        type="text"
                        value={data.linderoOriente}
                        onChange={set('linderoOriente')}
                        placeholder="Fachada exterior"
                        error={errors.linderoOriente}
                    />
                    <InputField
                        id="inmueble-lindero-occidente"
                        label="Occidente"
                        type="text"
                        value={data.linderoOccidente}
                        onChange={set('linderoOccidente')}
                        placeholder="Apto 503"
                        error={errors.linderoOccidente}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="inmueble-matricula"
                    label="Matricula inmobiliaria"
                    type="text"
                    value={data.matricula}
                    onChange={set('matricula')}
                    placeholder="50N-12345678"
                    error={errors.matricula}
                />
                <InputField
                    id="inmueble-cedula-catastral"
                    label="Cedula catastral"
                    type="text"
                    value={data.cedulaCatastral}
                    onChange={set('cedulaCatastral')}
                    placeholder="01-02-0304-0005-000"
                    error={errors.cedulaCatastral}
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
