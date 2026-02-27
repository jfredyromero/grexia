import { useState } from 'react';
import type { ObligacionData, ModalidadPago, PeriodoCuotas } from '../types';
import { validateObligacion, hasErrors } from '../validation';
import ColombiaLocationSelect from '../../shared/ColombiaLocationSelect';

interface StepObligacionProps {
    data: ObligacionData;
    onChange: (data: ObligacionData) => void;
    onNext: () => void;
    onBack: () => void;
}

const fieldClass =
    'h-12 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';
const labelClass = 'text-sm font-semibold text-slate-700';
const errorClass = 'text-xs text-red-500 mt-1';

const PERIODOS: { value: PeriodoCuotas; label: string }[] = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'bimestral', label: 'Bimestral' },
    { value: 'trimestral', label: 'Trimestral' },
];

function formatCOPInput(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('es-CO').format(parseInt(digits, 10));
}

export default function StepObligacion({ data, onChange, onNext, onBack }: StepObligacionProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const set = (field: keyof ObligacionData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        onChange({ ...data, valorPrincipal: raw });
        if (errors.valorPrincipal) setErrors((prev) => ({ ...prev, valorPrincipal: '' }));
    };

    const setModalidad = (modalidad: ModalidadPago) => {
        onChange({
            ...data,
            modalidadPago: modalidad,
            fechaVencimiento: '',
            numeroCuotas: '',
            periodoCuotas: '',
        });
        if (errors.modalidadPago) setErrors((prev) => ({ ...prev, modalidadPago: '' }));
    };

    const handleNext = () => {
        const newErrors = validateObligacion(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    const isUnico = data.modalidadPago === 'unico';
    const isCuotas = data.modalidadPago === 'cuotas';

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">La obligación</h2>
                <p className="text-sm text-slate-500 mt-1">Detalles del monto y condiciones de pago del pagaré</p>
            </div>

            {/* Valor principal */}
            <div className="flex flex-col gap-1.5">
                <label
                    className={labelClass}
                    htmlFor="obligacion-valor"
                >
                    Valor del pagaré (COP)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                        $
                    </span>
                    <input
                        id="obligacion-valor"
                        type="text"
                        inputMode="numeric"
                        value={data.valorPrincipal ? formatCOPInput(data.valorPrincipal) : ''}
                        onChange={handleValorChange}
                        placeholder="1.000.000"
                        className={`${fieldClass} pl-8`}
                    />
                </div>
                {errors.valorPrincipal && <p className={errorClass}>{errors.valorPrincipal}</p>}
            </div>

            {/* Fecha de suscripción */}
            <div className="flex flex-col gap-1.5">
                <label
                    className={labelClass}
                    htmlFor="obligacion-fecha-suscripcion"
                >
                    Fecha de suscripción del pagaré
                </label>
                <input
                    id="obligacion-fecha-suscripcion"
                    type="date"
                    value={data.fechaSuscripcion}
                    onChange={set('fechaSuscripcion')}
                    className={fieldClass}
                />
                {errors.fechaSuscripcion && <p className={errorClass}>{errors.fechaSuscripcion}</p>}
            </div>

            {/* Modalidad de pago */}
            <div className="flex flex-col gap-2">
                <p className={labelClass}>Modalidad de pago</p>
                <div className="grid grid-cols-2 gap-3">
                    {(['unico', 'cuotas'] as ModalidadPago[]).map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setModalidad(m)}
                            className={[
                                'flex flex-col gap-1 rounded-[12px] border-2 p-4 text-left transition-all',
                                data.modalidadPago === m
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 bg-white hover:border-slate-300',
                            ].join(' ')}
                        >
                            <span
                                className={`text-sm font-bold ${data.modalidadPago === m ? 'text-secondary' : 'text-slate-700'}`}
                            >
                                {m === 'unico' ? 'Pago único' : 'Por cuotas'}
                            </span>
                            <span className="text-xs text-slate-500">
                                {m === 'unico' ? 'Todo en una sola fecha' : 'Pagos periódicos parciales'}
                            </span>
                        </button>
                    ))}
                </div>
                {errors.modalidadPago && <p className={errorClass}>{errors.modalidadPago}</p>}
            </div>

            {/* Pago único: fecha de vencimiento */}
            {isUnico && (
                <div className="flex flex-col gap-1.5">
                    <label
                        className={labelClass}
                        htmlFor="obligacion-fecha-vencimiento"
                    >
                        Fecha de vencimiento
                    </label>
                    <input
                        id="obligacion-fecha-vencimiento"
                        type="date"
                        value={data.fechaVencimiento}
                        onChange={set('fechaVencimiento')}
                        className={fieldClass}
                    />
                    {errors.fechaVencimiento && <p className={errorClass}>{errors.fechaVencimiento}</p>}
                </div>
            )}

            {/* Por cuotas: número y período */}
            {isCuotas && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label
                            className={labelClass}
                            htmlFor="obligacion-num-cuotas"
                        >
                            Número de cuotas
                        </label>
                        <input
                            id="obligacion-num-cuotas"
                            type="number"
                            min="2"
                            max="360"
                            value={data.numeroCuotas}
                            onChange={set('numeroCuotas')}
                            placeholder="12"
                            className={fieldClass}
                        />
                        {errors.numeroCuotas && <p className={errorClass}>{errors.numeroCuotas}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label
                            className={labelClass}
                            htmlFor="obligacion-periodo"
                        >
                            Período de pago
                        </label>
                        <select
                            id="obligacion-periodo"
                            value={data.periodoCuotas}
                            onChange={set('periodoCuotas')}
                            className={fieldClass}
                        >
                            <option value="">Seleccionar...</option>
                            {PERIODOS.map((p) => (
                                <option
                                    key={p.value}
                                    value={p.value}
                                >
                                    {p.label}
                                </option>
                            ))}
                        </select>
                        {errors.periodoCuotas && <p className={errorClass}>{errors.periodoCuotas}</p>}
                    </div>
                </div>
            )}

            {/* Ciudad de suscripción */}
            <ColombiaLocationSelect
                idPrefix="obligacion-ciudad"
                cityLabel="Ciudad de suscripción"
                value={data.ciudadSuscripcion}
                onChange={(city) => {
                    onChange({ ...data, ciudadSuscripcion: city });
                    if (errors.ciudadSuscripcion) setErrors((prev) => ({ ...prev, ciudadSuscripcion: '' }));
                }}
                error={errors.ciudadSuscripcion}
            />

            {/* Tasa de interés de mora (opcional) */}
            <div className="flex flex-col gap-1.5">
                <label
                    className={labelClass}
                    htmlFor="obligacion-mora"
                >
                    Tasa de interés de mora <span className="text-slate-400 font-normal">(opcional, %)</span>
                </label>
                <div className="relative">
                    <input
                        id="obligacion-mora"
                        type="text"
                        inputMode="decimal"
                        value={data.tasaInteresMora}
                        onChange={set('tasaInteresMora')}
                        placeholder="Ej: 1.5"
                        className={`${fieldClass} pr-10`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                        %
                    </span>
                </div>
                <p className="text-xs text-slate-400">Si se deja vacío, se aplicará la tasa máxima legal vigente.</p>
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
                    className="flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-hover hover:-translate-y-px transition-all"
                >
                    Ver pagaré
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
