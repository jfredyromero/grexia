import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type {
    LaboralFormData,
    CondicionesTerminoFijo,
    CondicionesObraLabor,
    JornadaTrabajo,
    FrecuenciaPago,
    MetodoPago,
    UnidadDuracion,
} from '../types';
import { validateCondicionesTerminoFijo, validateCondicionesObraLabor, hasErrors } from '../validation';
import {
    formatCOP,
    numberToWordsCOP,
    JORNADA_OPTIONS,
    UNIDAD_DURACION_OPTIONS,
    FRECUENCIA_PAGO_OPTIONS,
    METODO_PAGO_OPTIONS,
} from '../laboralUtils';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import TextareaField from '../../shared/TextareaField';

interface StepCondicionesProps {
    formData: LaboralFormData;
    onUpdateTerminoFijo: (d: CondicionesTerminoFijo) => void;
    onUpdateObraLabor: (d: CondicionesObraLabor) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
}

export default function StepCondiciones({
    formData,
    onUpdateTerminoFijo,
    onUpdateObraLabor,
    onNext,
    onBack,
    forceValidate,
}: StepCondicionesProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const esFijo = formData.tipoContrato === 'termino-fijo';
    const tf = formData.condicionesTerminoFijo;
    const ol = formData.condicionesObraLabor;

    useEffect(() => {
        if (!forceValidate) return;
        if (esFijo) {
            setErrors(validateCondicionesTerminoFijo(tf));
        } else {
            setErrors(validateCondicionesObraLabor(ol));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const setTf = (field: keyof CondicionesTerminoFijo) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateTerminoFijo({ ...tf, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const setOl =
        (field: keyof CondicionesObraLabor) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            onUpdateObraLabor({ ...ol, [field]: e.target.value });
            if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
        };

    const handleNext = () => {
        const newErrors = esFijo ? validateCondicionesTerminoFijo(tf) : validateCondicionesObraLabor(ol);
        setErrors(newErrors);
        if (!hasErrors(newErrors)) onNext();
    };

    const salarioPreview = (salario: string) => {
        const n = parseInt(salario.replace(/\D/g, ''), 10);
        if (isNaN(n) || n <= 0) return null;
        return `${numberToWordsCOP(n)} (${formatCOP(salario)})`;
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Condiciones laborales</h2>
                <p className="text-sm text-slate-500 mt-1">
                    {esFijo
                        ? 'Detalla las condiciones del contrato a término fijo.'
                        : 'Describe la obra o labor y las condiciones de pago.'}
                </p>
            </div>

            {esFijo ? (
                <>
                    {/* Cargo */}
                    <InputField
                        id="tf-cargo"
                        label="Cargo"
                        type="text"
                        value={tf.cargo}
                        onChange={setTf('cargo')}
                        placeholder="Analista de Sistemas"
                        error={errors.cargo}
                    />

                    {/* Salario */}
                    <div className="flex flex-col gap-1.5">
                        <InputField
                            id="tf-salario"
                            label="Salario mensual (COP)"
                            type="text"
                            inputMode="numeric"
                            value={tf.salario}
                            onChange={setTf('salario')}
                            placeholder="3500000"
                            prefix="$"
                            error={errors.salario}
                        />
                        {salarioPreview(tf.salario) && (
                            <p className="text-xs text-slate-500 pl-1">{salarioPreview(tf.salario)}</p>
                        )}
                    </div>

                    {/* Frecuencia y método de pago */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Frecuencia de pago</label>
                            <SelectField
                                id="tf-frecuencia"
                                value={tf.frecuenciaPago}
                                onChange={(val) => {
                                    onUpdateTerminoFijo({ ...tf, frecuenciaPago: val as FrecuenciaPago });
                                    if (errors.frecuenciaPago) setErrors((prev) => ({ ...prev, frecuenciaPago: '' }));
                                }}
                                options={FRECUENCIA_PAGO_OPTIONS}
                                error={errors.frecuenciaPago}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Método de pago</label>
                            <SelectField
                                id="tf-metodo"
                                value={tf.metodoPago}
                                onChange={(val) => {
                                    onUpdateTerminoFijo({ ...tf, metodoPago: val as MetodoPago, cuentaBancaria: '' });
                                    if (errors.metodoPago)
                                        setErrors((prev) => ({ ...prev, metodoPago: '', cuentaBancaria: '' }));
                                }}
                                options={METODO_PAGO_OPTIONS}
                                error={errors.metodoPago}
                            />
                        </div>
                    </div>

                    {/* Cuenta bancaria — condicional */}
                    {tf.metodoPago === 'transferencia' && (
                        <InputField
                            id="tf-cuenta"
                            label="Número de cuenta bancaria"
                            type="text"
                            inputMode="numeric"
                            value={tf.cuentaBancaria}
                            onChange={setTf('cuentaBancaria')}
                            placeholder="1234567890"
                            error={errors.cuentaBancaria}
                        />
                    )}

                    {/* Jornada */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Jornada de trabajo</label>
                        <SelectField
                            id="tf-jornada"
                            value={tf.jornada}
                            onChange={(val) => {
                                onUpdateTerminoFijo({ ...tf, jornada: val as JornadaTrabajo });
                                if (errors.jornada) setErrors((prev) => ({ ...prev, jornada: '' }));
                            }}
                            options={JORNADA_OPTIONS}
                            error={tf.jornada !== 'otro' ? errors.jornada : undefined}
                        />
                    </div>

                    {/* Banner asesoría — solo si jornada === 'otro' */}
                    {tf.jornada === 'otro' && (
                        <div className="flex items-start gap-3 rounded-[12px] bg-amber-50 border border-amber-200 p-4">
                            <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5">
                                info
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-amber-800">
                                    Esta jornada requiere asesoría legal
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                    Para jornadas especiales o atípicas es necesario redactar el contrato con
                                    acompañamiento profesional.{' '}
                                    <a
                                        href="/asesoria/checkout"
                                        className="underline font-semibold hover:text-amber-900"
                                    >
                                        Agenda una asesoría
                                    </a>{' '}
                                    para continuar.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Lugar de prestación */}
                    <InputField
                        id="tf-lugar"
                        label="Lugar de prestación del servicio"
                        type="text"
                        value={tf.lugarPrestacion}
                        onChange={setTf('lugarPrestacion')}
                        placeholder="Calle 100 No. 15-20, Bogotá D.C."
                        error={errors.lugarPrestacion}
                    />

                    {/* Duración */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                            Duración del contrato
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <InputField
                                id="tf-duracion-num"
                                label=""
                                type="number"
                                min="1"
                                value={tf.duracionNumero}
                                onChange={setTf('duracionNumero')}
                                placeholder="6"
                                error={errors.duracionNumero}
                            />
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <SelectField
                                    id="tf-duracion-unidad"
                                    value={tf.duracionUnidad}
                                    onChange={(val) => {
                                        onUpdateTerminoFijo({ ...tf, duracionUnidad: val as UnidadDuracion });
                                        if (errors.duracionUnidad)
                                            setErrors((prev) => ({ ...prev, duracionUnidad: '' }));
                                    }}
                                    options={UNIDAD_DURACION_OPTIONS}
                                    error={errors.duracionUnidad}
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Descripción de obra */}
                    <TextareaField
                        id="ol-descripcion"
                        label="Descripción de la obra o labor"
                        value={ol.descripcionObra}
                        onChange={(e) => {
                            onUpdateObraLabor({ ...ol, descripcionObra: e.target.value });
                            if (errors.descripcionObra) setErrors((prev) => ({ ...prev, descripcionObra: '' }));
                        }}
                        rows={4}
                        placeholder="Describa detalladamente la obra o labor encomendada, cuándo se entiende finalizada y sus condiciones de aceptación…"
                        error={errors.descripcionObra}
                    />

                    {/* Oficio */}
                    <InputField
                        id="ol-oficio"
                        label="Oficio"
                        type="text"
                        value={ol.oficio}
                        onChange={setOl('oficio')}
                        placeholder="Maestro de obra"
                        error={errors.oficio}
                    />

                    {/* Salario */}
                    <div className="flex flex-col gap-1.5">
                        <InputField
                            id="ol-salario"
                            label="Salario u honorarios (COP)"
                            type="text"
                            inputMode="numeric"
                            value={ol.salario}
                            onChange={setOl('salario')}
                            placeholder="2500000"
                            prefix="$"
                            error={errors.salario}
                        />
                        {salarioPreview(ol.salario) && (
                            <p className="text-xs text-slate-500 pl-1">{salarioPreview(ol.salario)}</p>
                        )}
                    </div>

                    {/* Modalidad de pago */}
                    <InputField
                        id="ol-modalidad"
                        label="Modalidad de pago"
                        type="text"
                        value={ol.modalidadPago}
                        onChange={setOl('modalidadPago')}
                        placeholder="Ej: mensual, al finalizar la obra"
                        error={errors.modalidadPago}
                    />

                    {/* Lugar */}
                    <InputField
                        id="ol-lugar"
                        label="Lugar de prestación"
                        type="text"
                        value={ol.lugar}
                        onChange={setOl('lugar')}
                        placeholder="Carrera 70 No. 10-15, Medellín"
                        error={errors.lugar}
                    />
                </>
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
                    disabled={tf.jornada === 'otro' && esFijo}
                    className="flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all cursor-pointer data-disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:translate-y-0"
                >
                    Ver contrato
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                </Button>
            </div>
        </div>
    );
}
