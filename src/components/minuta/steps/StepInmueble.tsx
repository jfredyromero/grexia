import { useState } from 'react';
import type { InmuebleData, TipoInmueble } from '../types';
import { DEPARTAMENTOS } from '../types';
import { validateInmueble, hasErrors } from '../validation';

interface StepInmuebleProps {
    data: InmuebleData;
    onChange: (data: InmuebleData) => void;
    onNext: () => void;
}

const TIPOS_INMUEBLE: { tipo: TipoInmueble; icon: string; label: string }[] = [
    { tipo: 'Apartamento', icon: 'apartment', label: 'Apartamento' },
    { tipo: 'Casa', icon: 'home', label: 'Casa' },
    { tipo: 'Local Comercial', icon: 'storefront', label: 'Local Comercial' },
    { tipo: 'Oficina', icon: 'business_center', label: 'Oficina' },
];

const ESTRATOS = ['1', '2', '3', '4', '5', '6'];

const fieldClass =
    'h-12 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';
const labelClass = 'text-sm font-semibold text-slate-700';
const errorClass = 'text-xs text-red-500 mt-1';

export default function StepInmueble({ data, onChange, onNext }: StepInmuebleProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const set = (field: keyof InmuebleData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validate = (): boolean => {
        const newErrors = validateInmueble(data);
        setErrors(newErrors);
        return !hasErrors(newErrors);
    };

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
                <label className={labelClass}>Tipo de inmueble</label>
                <div className="grid grid-cols-2 gap-2">
                    {TIPOS_INMUEBLE.map(({ tipo, icon, label }) => {
                        const selected = data.tipoInmueble === tipo;
                        return (
                            <button
                                key={tipo}
                                type="button"
                                onClick={() => {
                                    onChange({ ...data, tipoInmueble: tipo });
                                    if (errors.tipoInmueble) setErrors((prev) => ({ ...prev, tipoInmueble: '' }));
                                }}
                                className={[
                                    'h-14 rounded-[12px] border text-sm font-semibold transition-all flex items-center justify-center gap-2',
                                    selected
                                        ? 'border-secondary bg-secondary text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                                ].join(' ')}
                            >
                                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                                {label}
                            </button>
                        );
                    })}
                </div>
                {errors.tipoInmueble && <p className={errorClass}>{errors.tipoInmueble}</p>}
            </div>

            {/* Propiedad Horizontal toggle — visible when type is selected */}
            {data.tipoInmueble && (
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>¿Está en propiedad horizontal?</label>
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
                                <button
                                    key={String(val)}
                                    type="button"
                                    onClick={() => onChange({ ...data, propiedadHorizontal: val })}
                                    className={[
                                        'h-12 rounded-[12px] border text-sm font-semibold transition-all flex items-center justify-center gap-2',
                                        selected
                                            ? 'border-secondary bg-secondary text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                                    ].join(' ')}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Dirección */}
            <div className="flex flex-col gap-1.5">
                <label
                    className={labelClass}
                    htmlFor="direccion"
                >
                    Dirección completa
                </label>
                <input
                    id="direccion"
                    type="text"
                    value={data.direccion}
                    onChange={set('direccion')}
                    placeholder="Calle 45 # 23-15, Apto 301"
                    className={fieldClass}
                />
                {errors.direccion && <p className={errorClass}>{errors.direccion}</p>}
            </div>

            {/* Ciudad y Departamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="ciudad"
                    >
                        Ciudad
                    </label>
                    <input
                        id="ciudad"
                        type="text"
                        value={data.ciudad}
                        onChange={set('ciudad')}
                        placeholder="Bogotá, Medellín, Cali..."
                        className={fieldClass}
                    />
                    {errors.ciudad && <p className={errorClass}>{errors.ciudad}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="departamento"
                    >
                        Departamento
                    </label>
                    <select
                        id="departamento"
                        value={data.departamento}
                        onChange={set('departamento')}
                        className={fieldClass}
                    >
                        <option value="">Seleccionar...</option>
                        {DEPARTAMENTOS.map((dep) => (
                            <option
                                key={dep}
                                value={dep}
                            >
                                {dep}
                            </option>
                        ))}
                    </select>
                    {errors.departamento && <p className={errorClass}>{errors.departamento}</p>}
                </div>
            </div>

            {/* Estrato y Área */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="estrato"
                    >
                        Estrato socioeconómico
                    </label>
                    <select
                        id="estrato"
                        value={data.estrato}
                        onChange={set('estrato')}
                        className={fieldClass}
                    >
                        {ESTRATOS.map((e) => (
                            <option
                                key={e}
                                value={e}
                            >
                                Estrato {e}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="areaMq"
                    >
                        Área (m²)
                    </label>
                    <input
                        id="areaMq"
                        type="text"
                        inputMode="numeric"
                        value={data.areaMq}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '');
                            onChange({ ...data, areaMq: raw });
                            if (errors.areaMq) setErrors((prev) => ({ ...prev, areaMq: '' }));
                        }}
                        placeholder="65"
                        className={fieldClass}
                    />
                    {errors.areaMq && <p className={errorClass}>{errors.areaMq}</p>}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
                <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-secondary shadow-md shadow-primary/20 hover:bg-primary-hover hover:translate-y-[-1px] transition-all"
                >
                    Continuar
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
