import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { ObligacionData, ModalidadPago, PeriodoCuotas } from '../types';
import { validateObligacion, hasErrors } from '../validation';
import ColombiaLocationSelect from '../../shared/ColombiaLocationSelect';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import type { SelectOption } from '../../shared/SelectField';

interface StepObligacionProps {
    data: ObligacionData;
    onChange: (data: ObligacionData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

const PERIODOS: SelectOption<PeriodoCuotas>[] = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'bimestral', label: 'Bimestral' },
    { value: 'trimestral', label: 'Trimestral' },
];

function formatCOPInput(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('es-CO').format(parseInt(digits, 10));
}

export default function StepObligacion({ data, onChange, onNext, onBack, forceValidate }: StepObligacionProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateObligacion(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof ObligacionData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const setModalidad = (modalidad: ModalidadPago) => {
        onChange({ ...data, modalidadPago: modalidad, fechaVencimiento: '', numeroCuotas: '', periodoCuotas: '' });
        if (errors.modalidadPago) setErrors((prev) => ({ ...prev, modalidadPago: '' }));
    };

    const handleNext = () => {
        const newErrors = validateObligacion(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    const isUnico = data.modalidadPago === 'unico';
    const isCuotas = data.modalidadPago === 'cuotas';
    const errorClass = 'text-xs text-red-500 mt-1';

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">La obligación</h2>
                <p className="text-sm text-slate-500 mt-1">Detalles del monto y condiciones de pago del pagaré</p>
            </div>

            <InputField
                id="obligacion-valor"
                label="Valor del pagaré (COP)"
                type="text"
                inputMode="numeric"
                value={data.valorPrincipal ? formatCOPInput(data.valorPrincipal) : ''}
                onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    onChange({ ...data, valorPrincipal: raw });
                    if (errors.valorPrincipal) setErrors((prev) => ({ ...prev, valorPrincipal: '' }));
                }}
                placeholder="1.000.000"
                prefix="$"
                error={errors.valorPrincipal}
            />

            <InputField
                id="obligacion-fecha-suscripcion"
                label="Fecha de suscripción del pagaré"
                type="date"
                value={data.fechaSuscripcion}
                onChange={set('fechaSuscripcion')}
                error={errors.fechaSuscripcion}
            />

            {/* Modalidad de pago */}
            <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-700">Modalidad de pago</p>
                <div className="grid grid-cols-2 gap-3">
                    {(['unico', 'cuotas'] as ModalidadPago[]).map((m) => (
                        <Button
                            key={m}
                            onClick={() => setModalidad(m)}
                            className={[
                                'flex flex-col gap-1 rounded-[12px] border-2 p-4 text-left transition-all',
                                data.modalidadPago === m
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 bg-white data-hover:border-slate-300',
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
                        </Button>
                    ))}
                </div>
                {errors.modalidadPago && <p className={errorClass}>{errors.modalidadPago}</p>}
            </div>

            {isUnico && (
                <InputField
                    id="obligacion-fecha-vencimiento"
                    label="Fecha de vencimiento"
                    type="date"
                    value={data.fechaVencimiento}
                    onChange={set('fechaVencimiento')}
                    error={errors.fechaVencimiento}
                />
            )}

            {isCuotas && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                        id="obligacion-num-cuotas"
                        label="Número de cuotas"
                        type="number"
                        min="2"
                        max="360"
                        value={data.numeroCuotas}
                        onChange={set('numeroCuotas')}
                        placeholder="12"
                        error={errors.numeroCuotas}
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Período de pago</label>
                        <SelectField
                            id="obligacion-periodo"
                            value={data.periodoCuotas}
                            onChange={(val) => {
                                onChange({ ...data, periodoCuotas: val as PeriodoCuotas });
                                if (errors.periodoCuotas) setErrors((prev) => ({ ...prev, periodoCuotas: '' }));
                            }}
                            options={PERIODOS}
                            error={errors.periodoCuotas}
                        />
                    </div>
                </div>
            )}

            <ColombiaLocationSelect
                idPrefix="obligacion-ciudad"
                cityLabel="Ciudad de suscripción"
                value={data.ciudadSuscripcion}
                departmentValue={data.departamentoSuscripcion}
                onChange={(city) => {
                    onChange({ ...data, ciudadSuscripcion: city });
                    if (errors.ciudadSuscripcion) setErrors((prev) => ({ ...prev, ciudadSuscripcion: '' }));
                }}
                onDepartmentChange={(dept) => onChange({ ...data, departamentoSuscripcion: dept })}
                error={errors.ciudadSuscripcion}
            />

            <InputField
                id="obligacion-tasa-nominal"
                label={
                    <>
                        Tasa de interés mensual <span className="text-slate-400 font-normal">(opcional, %)</span>
                    </>
                }
                type="text"
                inputMode="decimal"
                value={data.tasaInteresNominal}
                onChange={set('tasaInteresNominal')}
                placeholder="Ej: 1.5"
                suffix="%"
                description="Intereses corrientes sobre el capital. Si se deja vacío, quedará en blanco para diligenciar manualmente."
            />

            <InputField
                id="obligacion-mora"
                label={
                    <>
                        Tasa de interés de mora <span className="text-slate-400 font-normal">(opcional, %)</span>
                    </>
                }
                type="text"
                inputMode="decimal"
                value={data.tasaInteresMora}
                onChange={set('tasaInteresMora')}
                placeholder="Ej: 1.5"
                suffix="%"
                description="Si se deja vacío, se aplicará la tasa máxima legal vigente."
            />

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
                    Ver pagaré
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
            </div>
        </div>
    );
}
