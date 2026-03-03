import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { InmuebleData, TipoInmueble } from '../types';
import { validateInmueble, hasErrors } from '../validation';
import ColombiaLocationSelect from '../../shared/ColombiaLocationSelect';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import type { SelectOption } from '../../shared/SelectField';

interface StepInmuebleProps {
    data: InmuebleData;
    onChange: (data: InmuebleData) => void;
    onNext: () => void;
    forceValidate?: number;
}

const TIPOS_INMUEBLE: { tipo: TipoInmueble; icon: string; label: string }[] = [
    { tipo: 'Apartamento', icon: 'apartment', label: 'Apartamento' },
    { tipo: 'Casa', icon: 'home', label: 'Casa' },
    { tipo: 'Local Comercial', icon: 'storefront', label: 'Local Comercial' },
    { tipo: 'Oficina', icon: 'business_center', label: 'Oficina' },
];

const ESTRATO_OPTIONS: SelectOption[] = ['1', '2', '3', '4', '5', '6'].map((e) => ({
    value: e,
    label: `Estrato ${e}`,
}));

export default function StepInmueble({ data, onChange, onNext, forceValidate }: StepInmuebleProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors = validateInmueble(data);
        setErrors(newErrors);
        return !hasErrors(newErrors);
    };

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateInmueble(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const handleNext = () => {
        if (validate()) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El inmueble</h2>
                <p className="text-sm text-slate-500 mt-1">Información básica sobre la propiedad a arrendar</p>
            </div>

            {/* Tipo de inmueble */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Tipo de inmueble</label>
                <div className="grid grid-cols-2 gap-2">
                    {TIPOS_INMUEBLE.map(({ tipo, icon, label }) => {
                        const selected = data.tipoInmueble === tipo;
                        return (
                            <Button
                                key={tipo}
                                onClick={() => {
                                    onChange({ ...data, tipoInmueble: tipo });
                                    if (errors.tipoInmueble) setErrors((prev) => ({ ...prev, tipoInmueble: '' }));
                                }}
                                className={[
                                    'h-14 rounded-[12px] border text-sm font-semibold transition-all flex items-center justify-center gap-2',
                                    selected
                                        ? 'border-secondary bg-secondary text-white'
                                        : 'border-slate-200 bg-white text-slate-600 data-hover:border-slate-300 data-hover:bg-slate-50',
                                ].join(' ')}
                            >
                                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                                {label}
                            </Button>
                        );
                    })}
                </div>
                {errors.tipoInmueble && <p className="text-xs text-red-500 mt-1">{errors.tipoInmueble}</p>}
            </div>

            {/* Propiedad Horizontal toggle — visible when type is selected */}
            {data.tipoInmueble && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">¿Está en propiedad horizontal?</label>
                    <p className="text-xs text-slate-500 -mt-0.5">
                        Edificios, conjuntos o centros comerciales con reglamento y cuota de administración
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        {(
                            [
                                { val: true, label: 'Sí, es en PH', icon: 'domain' },
                                { val: false, label: 'No, es independiente', icon: 'cottage' },
                            ] as const
                        ).map(({ val, label, icon }) => {
                            const selected = data.propiedadHorizontal === val;
                            return (
                                <Button
                                    key={String(val)}
                                    onClick={() => onChange({ ...data, propiedadHorizontal: val })}
                                    className={[
                                        'h-12 rounded-[12px] border text-sm font-semibold transition-all flex items-center justify-center gap-2',
                                        selected
                                            ? 'border-secondary bg-secondary text-white'
                                            : 'border-slate-200 bg-white text-slate-600 data-hover:border-slate-300 data-hover:bg-slate-50',
                                    ].join(' ')}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                    {label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Dirección */}
            <InputField
                id="direccion"
                label="Dirección completa"
                type="text"
                value={data.direccion}
                onChange={(e) => {
                    onChange({ ...data, direccion: e.target.value });
                    if (errors.direccion) setErrors((prev) => ({ ...prev, direccion: '' }));
                }}
                placeholder="Calle 45 # 23-15, Apto 301"
                error={errors.direccion}
            />

            {/* Ciudad y Departamento */}
            <ColombiaLocationSelect
                idPrefix="inmueble-ciudad"
                cityLabel="Ciudad / Municipio"
                value={data.ciudad}
                departmentValue={data.departamento}
                onChange={(city) => {
                    onChange({ ...data, ciudad: city });
                    if (errors.ciudad) setErrors((prev) => ({ ...prev, ciudad: '' }));
                }}
                onDepartmentChange={(dept) => {
                    onChange({ ...data, departamento: dept });
                    if (errors.departamento) setErrors((prev) => ({ ...prev, departamento: '' }));
                }}
                error={errors.ciudad}
            />

            {/* Estrato y Área */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Estrato socioeconómico</label>
                    <SelectField
                        id="estrato"
                        value={data.estrato}
                        onChange={(val) => {
                            onChange({ ...data, estrato: val });
                            if (errors.estrato) setErrors((prev) => ({ ...prev, estrato: '' }));
                        }}
                        options={ESTRATO_OPTIONS}
                    />
                </div>
                <InputField
                    id="areaMq"
                    label="Área (m²)"
                    type="text"
                    inputMode="numeric"
                    value={data.areaMq}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        onChange({ ...data, areaMq: raw });
                        if (errors.areaMq) setErrors((prev) => ({ ...prev, areaMq: '' }));
                    }}
                    placeholder="65"
                    error={errors.areaMq}
                />
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
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
