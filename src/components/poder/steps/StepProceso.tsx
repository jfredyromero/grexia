import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { ProcesoData } from '../types';
import { validateProceso, hasErrors } from '../validation';
import { addDemandado, removeDemandado, updateDemandado, DEMANDADOS_MAX_COUNT } from '../poderUtils';
import InputField from '../../shared/InputField';
import TextareaField from '../../shared/TextareaField';

interface StepProcesoProps {
    data: ProcesoData;
    hasDemandados: boolean;
    onChange: (data: ProcesoData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function StepProceso({
    data,
    hasDemandados,
    onChange,
    onNext,
    onBack,
    forceValidate,
}: StepProcesoProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateProceso(data, hasDemandados));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const handleAdd = () => {
        onChange({ ...data, demandados: addDemandado(data.demandados) });
    };

    const handleRemove = (index: number) => {
        onChange({ ...data, demandados: removeDemandado(data.demandados, index) });
        if (errors.demandados) setErrors((prev) => ({ ...prev, demandados: '' }));
    };

    const handleUpdate = (index: number, value: string) => {
        onChange({ ...data, demandados: updateDemandado(data.demandados, index, value) });
        if (errors.demandados) setErrors((prev) => ({ ...prev, demandados: '' }));
    };

    const handleObjeto = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({ ...data, objetoPoder: e.target.value });
        if (errors.objetoPoder) setErrors((prev) => ({ ...prev, objetoPoder: '' }));
    };

    const handleNext = () => {
        const newErrors = validateProceso(data, hasDemandados);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    const canAddMore = data.demandados.length < DEMANDADOS_MAX_COUNT;
    const onlyOneDemandado = data.demandados.length === 1;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Detalles del proceso</h2>
                <p className="text-sm text-slate-500 mt-1">
                    {hasDemandados
                        ? 'Indica las personas o entidades en contra de quienes se adelantará el proceso.'
                        : 'Describe en pocas palabras los actos específicos que autoriza este poder.'}
                </p>
            </div>

            {hasDemandados ? (
                <>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold text-slate-700">Demandados</label>
                        {data.demandados.map((d, i) => (
                            <div
                                key={i}
                                className="flex gap-2 items-start"
                            >
                                <div className="flex-1">
                                    <InputField
                                        id={`demandado-${i}`}
                                        label=""
                                        type="text"
                                        value={d}
                                        onChange={(e) => handleUpdate(i, e.target.value)}
                                        placeholder={`Demandado ${i + 1}`}
                                    />
                                </div>
                                {!onlyOneDemandado && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(i)}
                                        aria-label={`Eliminar demandado ${i + 1}`}
                                        className="h-12 w-12 rounded-full border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}

                        {errors.demandados && <p className="text-xs text-red-500">{errors.demandados}</p>}

                        <Button
                            onClick={handleAdd}
                            disabled={!canAddMore}
                            className="self-start flex items-center gap-1.5 h-10 px-4 rounded-full border border-dashed border-slate-300 text-xs font-semibold text-slate-600 data-hover:bg-slate-50 data-hover:border-slate-400 transition-colors cursor-pointer data-disabled:opacity-50 data-disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            Agregar demandado
                        </Button>
                    </div>
                </>
            ) : (
                <TextareaField
                    id="objeto-poder"
                    label="Objeto del poder"
                    description="¿Qué actos específicos se autorizan? Sé claro y conciso."
                    value={data.objetoPoder}
                    onChange={handleObjeto}
                    rows={4}
                    placeholder="Ej. Adelantar la escrituración del inmueble y firmar todos los documentos necesarios ante la Notaría Tercera del Círculo de Bogotá."
                    error={errors.objetoPoder}
                />
            )}

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
                    Ver poder
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                </Button>
            </div>
        </div>
    );
}
