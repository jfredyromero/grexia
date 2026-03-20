import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { TutelaFormData } from '../types';
import { validateStep5, hasErrors } from '../validation';

interface Props {
    data: TutelaFormData;
    onChange: (data: TutelaFormData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function Step5Impacto({ data, onChange, onNext, onBack, forceValidate }: Props) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateStep5(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const setField = (field: keyof TutelaFormData) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors = validateStep5(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Impacto en tu vida</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Describe cómo la negativa de la EPS afecta tu salud, trabajo y familia
                </p>
            </div>

            {/* Impacto salud */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="impacto-salud"
                    className="text-sm font-semibold text-slate-700"
                >
                    ¿Cómo afecta la negativa tu salud y vida diaria?
                </label>
                <textarea
                    id="impacto-salud"
                    value={data.impactoSaludVida}
                    onChange={setField('impactoSaludVida')}
                    maxLength={800}
                    rows={4}
                    placeholder="Ej: Sin la insulina mi nivel de glucosa se eleva de forma peligrosa, lo que me ha llevado a urgencias en dos ocasiones. No puedo realizar mis actividades cotidianas con normalidad y mi estado de salud se deteriora progresivamente..."
                    className={[
                        'w-full rounded-[12px] border px-4 py-3 text-sm text-slate-800 outline-none transition-colors resize-none',
                        errors.impactoSaludVida
                            ? 'border-red-400 bg-red-50 focus:border-red-500'
                            : 'border-slate-200 bg-white focus:border-primary',
                    ].join(' ')}
                />
                <div className="flex justify-between">
                    {errors.impactoSaludVida ? (
                        <p className="text-xs text-red-500">{errors.impactoSaludVida}</p>
                    ) : (
                        <span />
                    )}
                    <span className="text-xs text-slate-400">{data.impactoSaludVida.length}/800</span>
                </div>
            </div>

            {/* Impacto trabajo */}
            <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">¿Afecta tu trabajo o actividad económica?</p>
                <div className="flex gap-4 mb-3">
                    {(['si', 'no'] as const).map((v) => (
                        <label
                            key={v}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="afecta-trabajo"
                                value={v}
                                checked={data.afectaTrabajo === v}
                                onChange={() => {
                                    onChange({ ...data, afectaTrabajo: v, descripcionImpactoTrabajo: '' });
                                    if (errors.afectaTrabajo) setErrors((prev) => ({ ...prev, afectaTrabajo: '' }));
                                }}
                                className="w-4 h-4 accent-primary cursor-pointer"
                            />
                            <span className="text-sm text-slate-700">{v === 'si' ? 'Sí' : 'No'}</span>
                        </label>
                    ))}
                </div>
                {errors.afectaTrabajo && <p className="text-xs text-red-500 mb-2">{errors.afectaTrabajo}</p>}
                {data.afectaTrabajo === 'si' && (
                    <div className="flex flex-col gap-1.5">
                        <textarea
                            value={data.descripcionImpactoTrabajo}
                            onChange={setField('descripcionImpactoTrabajo')}
                            maxLength={400}
                            rows={3}
                            placeholder="Ej: Trabajo como conductor y el deterioro de mi salud me ha impedido ejercer mi actividad laboral, afectando el sustento de mi familia..."
                            className={[
                                'w-full rounded-[12px] border px-4 py-3 text-sm text-slate-800 outline-none transition-colors resize-none',
                                errors.descripcionImpactoTrabajo
                                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                                    : 'border-slate-200 bg-white focus:border-primary',
                            ].join(' ')}
                        />
                        <div className="flex justify-between">
                            {errors.descripcionImpactoTrabajo ? (
                                <p className="text-xs text-red-500">{errors.descripcionImpactoTrabajo}</p>
                            ) : (
                                <span />
                            )}
                            <span className="text-xs text-slate-400">{data.descripcionImpactoTrabajo.length}/400</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Impacto familia */}
            <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">¿Afecta tu vida familiar?</p>
                <div className="flex gap-4 mb-3">
                    {(['si', 'no'] as const).map((v) => (
                        <label
                            key={v}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="afecta-familia"
                                value={v}
                                checked={data.afectaFamilia === v}
                                onChange={() => {
                                    onChange({ ...data, afectaFamilia: v, descripcionImpactoFamilia: '' });
                                    if (errors.afectaFamilia) setErrors((prev) => ({ ...prev, afectaFamilia: '' }));
                                }}
                                className="w-4 h-4 accent-primary cursor-pointer"
                            />
                            <span className="text-sm text-slate-700">{v === 'si' ? 'Sí' : 'No'}</span>
                        </label>
                    ))}
                </div>
                {errors.afectaFamilia && <p className="text-xs text-red-500 mb-2">{errors.afectaFamilia}</p>}
                {data.afectaFamilia === 'si' && (
                    <div className="flex flex-col gap-1.5">
                        <textarea
                            value={data.descripcionImpactoFamilia}
                            onChange={setField('descripcionImpactoFamilia')}
                            maxLength={400}
                            rows={3}
                            placeholder="Ej: Soy madre cabeza de hogar y el deterioro de mi salud me impide cuidar adecuadamente a mis hijos menores de edad..."
                            className={[
                                'w-full rounded-[12px] border px-4 py-3 text-sm text-slate-800 outline-none transition-colors resize-none',
                                errors.descripcionImpactoFamilia
                                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                                    : 'border-slate-200 bg-white focus:border-primary',
                            ].join(' ')}
                        />
                        <div className="flex justify-between">
                            {errors.descripcionImpactoFamilia ? (
                                <p className="text-xs text-red-500">{errors.descripcionImpactoFamilia}</p>
                            ) : (
                                <span />
                            )}
                            <span className="text-xs text-slate-400">{data.descripcionImpactoFamilia.length}/400</span>
                        </div>
                    </div>
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
