import { useState } from 'react';
import type { CondicionesData, TipoInmueble } from '../types';
import { isComercial } from '../types';
import { validateCondiciones, hasErrors } from '../validation';

interface StepCondicionesProps {
    data: CondicionesData;
    tipoInmueble: TipoInmueble | '';
    onChange: (data: CondicionesData) => void;
    onNext: () => void;
    onBack: () => void;
}

const fieldClass =
    'h-12 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';
const labelClass = 'text-sm font-semibold text-slate-700';
const errorClass = 'text-xs text-red-500 mt-1';

function formatDisplayCOP(raw: string): string {
    const num = parseInt(raw.replace(/\D/g, ''), 10);
    if (isNaN(num) || raw === '') return raw;
    return num.toLocaleString('es-CO');
}

export default function StepCondiciones({ data, tipoInmueble, onChange, onNext, onBack }: StepCondicionesProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const esComercial = isComercial(tipoInmueble);

    const validate = (): boolean => {
        const newErrors = validateCondiciones(data, tipoInmueble);
        setErrors(newErrors);
        return !hasErrors(newErrors);
    };

    const handleNext = () => {
        if (validate()) onNext();
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

            {/* Actividad comercial (solo Local Comercial) */}
            {tipoInmueble === 'Local Comercial' && (
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="actividad"
                    >
                        Actividad comercial permitida
                    </label>
                    <input
                        id="actividad"
                        type="text"
                        value={data.actividadComercial}
                        onChange={(e) => {
                            onChange({ ...data, actividadComercial: e.target.value });
                            if (errors.actividadComercial) setErrors((prev) => ({ ...prev, actividadComercial: '' }));
                        }}
                        placeholder="Ej: Restaurante, tienda de ropa, peluquería..."
                        className={fieldClass}
                    />
                    <p className="text-xs text-slate-500">
                        Actividad que el arrendatario ejercerá en el local. Solo se permite esta actividad.
                    </p>
                    {errors.actividadComercial && <p className={errorClass}>{errors.actividadComercial}</p>}
                </div>
            )}

            {/* Fecha de inicio y duración */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="fecha-inicio"
                    >
                        Fecha de inicio
                    </label>
                    <input
                        id="fecha-inicio"
                        type="date"
                        value={data.fechaInicio}
                        onChange={(e) => {
                            onChange({ ...data, fechaInicio: e.target.value });
                            if (errors.fechaInicio) setErrors((prev) => ({ ...prev, fechaInicio: '' }));
                        }}
                        className={fieldClass}
                    />
                    {errors.fechaInicio && <p className={errorClass}>{errors.fechaInicio}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="duracion"
                    >
                        Duración (meses)
                    </label>
                    <input
                        id="duracion"
                        type="number"
                        min={1}
                        max={120}
                        value={data.duracionMeses}
                        onChange={(e) => onChange({ ...data, duracionMeses: parseInt(e.target.value, 10) || 12 })}
                        className={fieldClass}
                    />
                </div>
            </div>

            {/* Canon y Depósito */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="canon"
                    >
                        Canon mensual (COP)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                            $
                        </span>
                        <input
                            id="canon"
                            type="text"
                            inputMode="numeric"
                            value={formatDisplayCOP(data.canonMensual)}
                            onChange={handleMoneyChange('canonMensual')}
                            placeholder="1.500.000"
                            className={fieldClass + ' pl-8'}
                        />
                    </div>
                    {errors.canonMensual && <p className={errorClass}>{errors.canonMensual}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="deposito"
                    >
                        Depósito de garantía (COP)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                            $
                        </span>
                        <input
                            id="deposito"
                            type="text"
                            inputMode="numeric"
                            value={formatDisplayCOP(data.depositoCOP)}
                            onChange={handleMoneyChange('depositoCOP')}
                            placeholder="3.000.000"
                            className={fieldClass + ' pl-8'}
                        />
                    </div>
                    {errors.depositoCOP && <p className={errorClass}>{errors.depositoCOP}</p>}
                </div>
            </div>

            {/* Día de pago */}
            <div className="flex flex-col gap-1.5">
                <label
                    className={labelClass}
                    htmlFor="dia-pago"
                >
                    Día de pago mensual (1–28)
                </label>
                <div className="flex items-center gap-3">
                    <input
                        id="dia-pago"
                        type="range"
                        min={1}
                        max={28}
                        value={data.diaPagoMes}
                        onChange={(e) => onChange({ ...data, diaPagoMes: parseInt(e.target.value, 10) })}
                        className="flex-1 accent-primary h-2"
                    />
                    <span className="flex h-12 w-16 items-center justify-center rounded-[12px] border border-slate-200 bg-white text-sm font-bold text-secondary">
                        Día {data.diaPagoMes}
                    </span>
                </div>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-2.5 rounded-[12px] bg-primary/5 border border-primary/20 p-4">
                <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">info</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                    {esComercial ? (
                        <>
                            Para contratos comerciales el reajuste del canon se pacta libremente entre las partes,
                            sin límite de IPC. Se rige por el Código de Comercio.
                        </>
                    ) : (
                        <>
                            El depósito equivale normalmente a 1–2 meses de canon. No puede exceder el equivalente
                            a 2 meses de canon según la Ley 820 de 2003 para vivienda urbana.
                        </>
                    )}
                </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 mt-2 border-t border-slate-100">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Anterior
                </button>
                <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-secondary shadow-md shadow-primary/20 hover:bg-primary-hover hover:translate-y-[-1px] transition-all"
                >
                    Ver mi minuta
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
