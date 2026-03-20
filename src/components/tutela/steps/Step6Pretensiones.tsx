import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { TutelaFormData } from '../types';
import { TIPO_PRETENSION_OPTIONS } from '../types';
import { validateStep6, hasErrors } from '../validation';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import type { SelectOption } from '../../shared/SelectField';

interface Props {
    data: TutelaFormData;
    onChange: (data: TutelaFormData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

const PRETENSION_OPTIONS: SelectOption<string>[] = TIPO_PRETENSION_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
}));

export default function Step6Pretensiones({ data, onChange, onNext, onBack, forceValidate }: Props) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateStep6(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof TutelaFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateStep6(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Lo que solicitas</h2>
                <p className="text-sm text-slate-500 mt-1">Define qué le pedirás al juez que ordene a la EPS</p>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">¿Qué solicitas que el juez ordene?</label>
                <SelectField
                    id="tipo-pretension"
                    value={data.tipoPretension}
                    onChange={(val) => {
                        onChange({ ...data, tipoPretension: val, otraPretension: '' });
                        if (errors.tipoPretension) setErrors((prev) => ({ ...prev, tipoPretension: '' }));
                    }}
                    options={PRETENSION_OPTIONS}
                    error={errors.tipoPretension}
                />
            </div>

            {data.tipoPretension === 'otro' && (
                <InputField
                    id="otra-pretension"
                    label="Describe lo que solicitas"
                    type="text"
                    value={data.otraPretension}
                    onChange={set('otraPretension')}
                    placeholder="Ej: Traslado de EPS, cobertura de tratamiento experimental"
                    error={errors.otraPretension}
                />
            )}

            <InputField
                id="detalle-especifico"
                label="Detalle específico de lo solicitado"
                type="text"
                value={data.detalleEspecifico}
                onChange={set('detalleEspecifico')}
                placeholder="Ej: Insulina Glargina 100 UI/mL, 5 cartuchos mensuales, prescrita por el Dr. Rodríguez"
                error={errors.detalleEspecifico}
            />

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="num-solicitudes"
                    className="text-sm font-semibold text-slate-700"
                >
                    ¿Cuántas veces has solicitado esto a la EPS sin obtener respuesta favorable?
                </label>
                <input
                    id="num-solicitudes"
                    type="number"
                    min={1}
                    value={data.numeroSolicitudes}
                    onChange={(e) => {
                        onChange({ ...data, numeroSolicitudes: parseInt(e.target.value) || 1 });
                        if (errors.numeroSolicitudes) setErrors((prev) => ({ ...prev, numeroSolicitudes: '' }));
                    }}
                    className={[
                        'h-12 w-full rounded-[12px] border px-4 text-sm text-slate-800 outline-none transition-colors',
                        errors.numeroSolicitudes
                            ? 'border-red-400 bg-red-50 focus:border-red-500'
                            : 'border-slate-200 bg-white focus:border-primary',
                    ].join(' ')}
                />
                {errors.numeroSolicitudes && <p className="text-xs text-red-500">{errors.numeroSolicitudes}</p>}
            </div>

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
