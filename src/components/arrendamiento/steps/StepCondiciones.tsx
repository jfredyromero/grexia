import { useState } from 'react';
import { Button } from '@headlessui/react';
import type { CondicionesData, TipoInmueble } from '../types';
import { isComercial } from '../types';
import { validateCondiciones, hasErrors } from '../validation';
import InputField from '../../shared/InputField';

interface StepCondicionesProps {
    data: CondicionesData;
    tipoInmueble: TipoInmueble | '';
    onChange: (data: CondicionesData) => void;
    onNext: () => void;
    onBack: () => void;
}

function formatDisplayCOP(raw: string): string {
    const num = parseInt(raw.replace(/\D/g, ''), 10);
    if (isNaN(num) || raw === '') return raw;
    return num.toLocaleString('es-CO');
}

export default function StepCondiciones({ data, tipoInmueble, onChange, onNext, onBack }: StepCondicionesProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const esComercial = isComercial(tipoInmueble);

    const handleNext = () => {
        const newErrors = validateCondiciones(data, tipoInmueble);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    const handleMoneyChange = (field: 'canonMensual' | 'depositoCOP') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        onChange({ ...data, [field]: raw });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Condiciones del contrato</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Define los términos económicos y vigencia del arrendamiento
                </p>
            </div>

            {tipoInmueble === 'Local Comercial' && (
                <InputField
                    id="actividad"
                    label="Actividad comercial permitida"
                    type="text"
                    value={data.actividadComercial}
                    onChange={(e) => {
                        onChange({ ...data, actividadComercial: e.target.value });
                        if (errors.actividadComercial) setErrors((prev) => ({ ...prev, actividadComercial: '' }));
                    }}
                    placeholder="Ej: Restaurante, tienda de ropa, peluquería..."
                    description="Actividad que el arrendatario ejercerá en el local. Solo se permite esta actividad."
                    error={errors.actividadComercial}
                />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="fecha-inicio"
                    label="Fecha de inicio"
                    type="date"
                    value={data.fechaInicio}
                    onChange={(e) => {
                        onChange({ ...data, fechaInicio: e.target.value });
                        if (errors.fechaInicio) setErrors((prev) => ({ ...prev, fechaInicio: '' }));
                    }}
                    error={errors.fechaInicio}
                />
                <InputField
                    id="duracion"
                    label="Duración (meses)"
                    type="number"
                    min={1}
                    max={120}
                    value={String(data.duracionMeses)}
                    onChange={(e) => onChange({ ...data, duracionMeses: parseInt(e.target.value, 10) || 12 })}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="canon"
                    label="Canon mensual (COP)"
                    type="text"
                    inputMode="numeric"
                    value={formatDisplayCOP(data.canonMensual)}
                    onChange={handleMoneyChange('canonMensual')}
                    placeholder="1.500.000"
                    prefix="$"
                    error={errors.canonMensual}
                />
                <InputField
                    id="deposito"
                    label="Depósito de garantía (COP)"
                    type="text"
                    inputMode="numeric"
                    value={formatDisplayCOP(data.depositoCOP)}
                    onChange={handleMoneyChange('depositoCOP')}
                    placeholder="3.000.000"
                    prefix="$"
                    error={errors.depositoCOP}
                />
            </div>

            {/* Día de pago */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Día de pago mensual (1–28)</label>
                <div className="flex items-center gap-3">
                    <input
                        id="dia-pago"
                        type="range"
                        min={1}
                        max={28}
                        value={data.diaPagoMes}
                        onChange={(e) => onChange({ ...data, diaPagoMes: parseInt(e.target.value, 10) })}
                        className="h-2 flex-1 accent-primary"
                    />
                    <span className="flex h-12 w-16 items-center justify-center rounded-[12px] border border-slate-200 bg-white text-sm font-bold text-secondary">
                        Día {data.diaPagoMes}
                    </span>
                </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg bg-primary/5 border border-primary/20 p-4">
                <span className="material-symbols-outlined shrink-0 mt-0.5 text-[20px] text-primary">info</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                    {esComercial ? (
                        <>
                            Para contratos comerciales el reajuste del canon se pacta libremente entre las partes, sin
                            límite de IPC. Se rige por el Código de Comercio.
                        </>
                    ) : (
                        <>
                            El depósito equivale normalmente a 1–2 meses de canon. No puede exceder el equivalente a 2
                            meses de canon según la Ley 820 de 2003 para vivienda urbana.
                        </>
                    )}
                </p>
            </div>

            <div className="flex justify-between pt-4 mt-2 border-t border-slate-100">
                <Button
                    onClick={onBack}
                    className="flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 data-hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Anterior
                </Button>
                <Button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all"
                >
                    Ver mi contrato
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
            </div>
        </div>
    );
}
