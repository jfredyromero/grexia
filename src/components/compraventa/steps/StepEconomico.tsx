import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { EconomicoData } from '../types';
import { validateEconomico, hasErrors } from '../validation';
import { formatCOPInput } from '../compraventaUtils';
import InputField from '../../shared/InputField';
import SelectField from '../../shared/SelectField';

const FORMA_PAGO_OPTIONS = [
    {
        value: 'Pago de contado al momento de la firma de la escritura publica',
        label: 'Contado al momento de la escritura',
    },
    {
        value: '50% al momento de la firma de la promesa y 50% al momento del otorgamiento de la escritura publica',
        label: '50% al firmar la promesa — 50% al otorgar la escritura',
    },
    {
        value: '30% al momento de la firma de la promesa y 70% al momento del otorgamiento de la escritura publica',
        label: '30% al firmar la promesa — 70% al otorgar la escritura',
    },
    {
        value: '10% como arras confirmatorias al momento de la firma de la promesa y el saldo restante al momento del otorgamiento de la escritura publica',
        label: '10% como arras al firmar — saldo restante al otorgar la escritura',
    },
];

interface StepEconomicoProps {
    data: EconomicoData;
    onChange: (data: EconomicoData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function StepEconomico({ data, onChange, onNext, onBack, forceValidate }: StepEconomicoProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateEconomico(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const handleNext = () => {
        const newErrors = validateEconomico(data);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Condiciones economicas</h2>
                <p className="text-sm text-slate-500 mt-1">Precio, forma de pago, arras y clausula penal</p>
            </div>

            <InputField
                id="economico-precio"
                label="Precio total del inmueble (COP)"
                type="text"
                inputMode="numeric"
                value={data.precioTotal ? formatCOPInput(data.precioTotal) : ''}
                onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    onChange({ ...data, precioTotal: raw });
                    if (errors.precioTotal) setErrors((prev) => ({ ...prev, precioTotal: '' }));
                }}
                placeholder="350.000.000"
                prefix="$"
                error={errors.precioTotal}
            />

            <InputField
                id="economico-incluye"
                label={
                    <>
                        El precio incluye <span className="text-slate-400 font-normal">(opcional)</span>
                    </>
                }
                type="text"
                value={data.precioIncluyeDescripcion}
                onChange={(e) => onChange({ ...data, precioIncluyeDescripcion: e.target.value })}
                placeholder="parqueadero y deposito"
                description="Si el precio incluye bienes adicionales, describelos aqui"
            />

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Forma de pago</label>
                <SelectField
                    id="economico-forma-pago"
                    value={data.formaDePago}
                    onChange={(val) => {
                        onChange({ ...data, formaDePago: val });
                        if (errors.formaDePago) setErrors((prev) => ({ ...prev, formaDePago: '' }));
                    }}
                    options={FORMA_PAGO_OPTIONS}
                    placeholder="Seleccionar forma de pago..."
                    error={errors.formaDePago}
                />
                <p className="text-xs text-slate-400">
                    ¿Necesitas un acuerdo de pago personalizado?{' '}
                    <span className="text-primary font-medium">Agenda una asesoria en grexia.co</span>
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="economico-arras"
                    label="Valor de las arras (COP)"
                    type="text"
                    inputMode="numeric"
                    value={data.arrasValor ? formatCOPInput(data.arrasValor) : ''}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        onChange({ ...data, arrasValor: raw });
                        if (errors.arrasValor) setErrors((prev) => ({ ...prev, arrasValor: '' }));
                    }}
                    placeholder="35.000.000"
                    prefix="$"
                    error={errors.arrasValor}
                />
                <InputField
                    id="economico-clausula-penal"
                    label="Valor clausula penal (COP)"
                    type="text"
                    inputMode="numeric"
                    value={data.clausulaPenalValor ? formatCOPInput(data.clausulaPenalValor) : ''}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        onChange({ ...data, clausulaPenalValor: raw });
                        if (errors.clausulaPenalValor) setErrors((prev) => ({ ...prev, clausulaPenalValor: '' }));
                    }}
                    placeholder="35.000.000"
                    prefix="$"
                    error={errors.clausulaPenalValor}
                />
            </div>

            <div className="flex justify-between pt-4 mt-2 border-t border-slate-100">
                <Button
                    onClick={onBack}
                    className="cursor-pointer flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 data-hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Anterior
                </Button>
                <Button
                    onClick={handleNext}
                    className="cursor-pointer flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all"
                >
                    Continuar
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
            </div>
        </div>
    );
}
