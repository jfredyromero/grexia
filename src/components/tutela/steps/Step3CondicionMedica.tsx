import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { TutelaFormData } from '../types';
import { TIPO_NEGATIVA_OPTIONS } from '../types';
import { validateStep3, hasErrors } from '../validation';
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

const NEGATIVA_OPTIONS: SelectOption<string>[] = TIPO_NEGATIVA_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
}));

export default function Step3CondicionMedica({ data, onChange, onNext, onBack, forceValidate }: Props) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateStep3(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof TutelaFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateStep3(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    const charCount = data.historiaClinica.length;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Condición médica</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Información sobre tu diagnóstico y el servicio que te fue negado
                </p>
            </div>

            <InputField
                id="diagnostico"
                label="Diagnóstico o condición médica principal"
                type="text"
                value={data.diagnostico}
                onChange={set('diagnostico')}
                placeholder="Ej: Diabetes tipo 2, hipertensión arterial, cáncer de seno"
                error={errors.diagnostico}
            />

            <InputField
                id="servicio-negado"
                label="¿Qué procedimiento, medicamento o examen fue negado?"
                type="text"
                value={data.servicioNegado}
                onChange={set('servicioNegado')}
                placeholder="Ej: Insulina Glargina, resonancia magnética de columna, cirugía de rodilla"
                error={errors.servicioNegado}
            />

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">¿Cómo fue la negativa?</label>
                <SelectField
                    id="tipo-negativa"
                    value={data.tipoNegativa}
                    onChange={(val) => {
                        onChange({ ...data, tipoNegativa: val });
                        if (errors.tipoNegativa) setErrors((prev) => ({ ...prev, tipoNegativa: '' }));
                    }}
                    options={NEGATIVA_OPTIONS}
                    error={errors.tipoNegativa}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="fecha-negativa"
                    className="text-sm font-semibold text-slate-700"
                >
                    Fecha aproximada de la negativa
                </label>
                <input
                    id="fecha-negativa"
                    type="date"
                    value={data.fechaNegativa}
                    onChange={(e) => {
                        onChange({ ...data, fechaNegativa: e.target.value });
                        if (errors.fechaNegativa) setErrors((prev) => ({ ...prev, fechaNegativa: '' }));
                    }}
                    className={[
                        'h-12 w-full rounded-[12px] border px-4 text-sm text-slate-800 outline-none transition-colors',
                        errors.fechaNegativa
                            ? 'border-red-400 bg-red-50 focus:border-red-500'
                            : 'border-slate-200 bg-white focus:border-primary',
                    ].join(' ')}
                />
                {errors.fechaNegativa && <p className="text-xs text-red-500">{errors.fechaNegativa}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="historia-clinica"
                    className="text-sm font-semibold text-slate-700"
                >
                    Descripción de tu historia clínica y situación médica
                </label>
                <p className="text-xs text-slate-500">
                    Describe brevemente tu situación de salud, desde cuándo la padeces y cómo afecta tu vida
                </p>
                <textarea
                    id="historia-clinica"
                    value={data.historiaClinica}
                    onChange={set('historiaClinica')}
                    maxLength={1000}
                    rows={4}
                    placeholder="Ej: Padezco de diabetes tipo 2 desde hace 5 años. Mi médico tratante me prescribió insulina Glargina como parte de mi tratamiento, sin la cual mi glucosa sube a niveles peligrosos. La EPS se ha negado a autorizar dicho medicamento en tres oportunidades..."
                    className={[
                        'w-full rounded-[12px] border px-4 py-3 text-sm text-slate-800 outline-none transition-colors resize-none',
                        errors.historiaClinica
                            ? 'border-red-400 bg-red-50 focus:border-red-500'
                            : 'border-slate-200 bg-white focus:border-primary',
                    ].join(' ')}
                />
                <div className="flex justify-between items-center">
                    {errors.historiaClinica ? (
                        <p className="text-xs text-red-500">{errors.historiaClinica}</p>
                    ) : (
                        <span />
                    )}
                    <span className={`text-xs ${charCount >= 950 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {charCount}/1000
                    </span>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">¿Tienes médico tratante asignado?</p>
                <div className="flex gap-4 mb-3">
                    {(['si', 'no'] as const).map((v) => (
                        <label
                            key={v}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="tiene-medico"
                                value={v}
                                checked={data.tieneMedicoTratante === v}
                                onChange={() => {
                                    onChange({ ...data, tieneMedicoTratante: v, nombreMedico: '' });
                                    if (errors.tieneMedicoTratante)
                                        setErrors((prev) => ({ ...prev, tieneMedicoTratante: '' }));
                                }}
                                className="w-4 h-4 accent-primary cursor-pointer"
                            />
                            <span className="text-sm text-slate-700">{v === 'si' ? 'Sí' : 'No'}</span>
                        </label>
                    ))}
                </div>
                {errors.tieneMedicoTratante && <p className="text-xs text-red-500">{errors.tieneMedicoTratante}</p>}
                {data.tieneMedicoTratante === 'si' && (
                    <InputField
                        id="nombre-medico"
                        label="Nombre del médico tratante"
                        type="text"
                        value={data.nombreMedico}
                        onChange={set('nombreMedico')}
                        placeholder="Dr. Carlos Rodríguez"
                        error={errors.nombreMedico}
                    />
                )}
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
