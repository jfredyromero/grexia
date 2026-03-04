import { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import type { ArrendatarioData, CoarrendatarioData, TipoDocArrendatario } from '../types';
import { validateArrendatario, validateCoarrendatario, hasErrors } from '../validation';
import SelectField from '../../shared/SelectField';
import InputField from '../../shared/InputField';
import type { SelectOption } from '../../shared/SelectField';

interface StepArrendatarioProps {
    data: ArrendatarioData;
    onChange: (data: ArrendatarioData) => void;
    onNext: () => void;
    onBack: () => void;
    forceValidate?: number;
    coarrendatario?: CoarrendatarioData;
    onCoarrendatarioChange: (data: CoarrendatarioData | undefined) => void;
}

const DOC_OPTIONS: SelectOption<TipoDocArrendatario>[] = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'Pasaporte', label: 'Pasaporte' },
];

const EMPTY_COARRENDATARIO: CoarrendatarioData = {
    nombreCompleto: '',
    tipoDocumento: '',
    numeroDocumento: '',
    telefono: '',
    email: '',
};

export default function StepArrendatario({
    data,
    onChange,
    onNext,
    onBack,
    forceValidate,
    coarrendatario,
    onCoarrendatarioChange,
}: StepArrendatarioProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [coErrors, setCoErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!forceValidate) return;
        setErrors(validateArrendatario(data));
        if (coarrendatario) setCoErrors(validateCoarrendatario(coarrendatario));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceValidate]);

    const set = (field: keyof ArrendatarioData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: e.target.value });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const setCoarrendatario = (field: keyof CoarrendatarioData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onCoarrendatarioChange({ ...(coarrendatario ?? EMPTY_COARRENDATARIO), [field]: e.target.value });
        if (coErrors[field]) setCoErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleToggleCoarrendatario = () => {
        if (coarrendatario) {
            onCoarrendatarioChange(undefined);
            setCoErrors({});
        } else {
            onCoarrendatarioChange(EMPTY_COARRENDATARIO);
        }
    };

    const handleNext = () => {
        const newErrors = validateArrendatario(data);
        const newCoErrors = coarrendatario ? validateCoarrendatario(coarrendatario) : {};
        setErrors(newErrors);
        setCoErrors(newCoErrors);
        if (!hasErrors(newErrors) && !hasErrors(newCoErrors)) onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">El arrendatario</h2>
                <p className="text-sm text-slate-500 mt-1">Información de quien recibirá el inmueble en arriendo</p>
            </div>

            <InputField
                id="arrendatario-nombre"
                label="Nombre completo"
                type="text"
                value={data.nombreCompleto}
                onChange={set('nombreCompleto')}
                placeholder="María Fernanda López Castro"
                error={errors.nombreCompleto}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tipo de documento</label>
                    <SelectField
                        id="arrendatario-tipo-doc"
                        value={data.tipoDocumento}
                        onChange={(val) => {
                            onChange({ ...data, tipoDocumento: val as TipoDocArrendatario });
                            if (errors.tipoDocumento) setErrors((prev) => ({ ...prev, tipoDocumento: '' }));
                        }}
                        options={DOC_OPTIONS}
                        error={errors.tipoDocumento}
                    />
                </div>
                <div className="sm:col-span-2">
                    <InputField
                        id="arrendatario-num-doc"
                        label="Número de documento"
                        type="text"
                        inputMode="numeric"
                        value={data.numeroDocumento}
                        onChange={set('numeroDocumento')}
                        placeholder="1234567890"
                        error={errors.numeroDocumento}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    id="arrendatario-tel"
                    label="Teléfono de contacto"
                    type="tel"
                    value={data.telefono}
                    onChange={set('telefono')}
                    placeholder="310 987 6543"
                    error={errors.telefono}
                />
                <InputField
                    id="arrendatario-email"
                    label={
                        <>
                            Correo electrónico <span className="text-slate-400 font-normal">(opcional)</span>
                        </>
                    }
                    type="email"
                    value={data.email}
                    onChange={set('email')}
                    placeholder="correo@ejemplo.com"
                    error={errors.email}
                />
            </div>

            {/* ── Coarrendatario toggle ── */}
            <div className="pt-2 border-t border-slate-100">
                <button
                    type="button"
                    onClick={handleToggleCoarrendatario}
                    className="flex items-center gap-3 w-full text-left"
                >
                    <div
                        className={[
                            'relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0',
                            coarrendatario ? 'bg-primary' : 'bg-slate-200',
                        ].join(' ')}
                    >
                        <span
                            className={[
                                'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                                coarrendatario ? 'translate-x-5' : 'translate-x-0',
                            ].join(' ')}
                        />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700">Agregar coarrendatario</p>
                        <p className="text-xs text-slate-500">
                            Persona que responde solidariamente por las obligaciones del contrato
                        </p>
                    </div>
                </button>
            </div>

            {/* ── Coarrendatario fields ── */}
            {coarrendatario && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Coarrendatario</p>

                    <InputField
                        id="coarrendatario-nombre"
                        label="Nombre completo"
                        type="text"
                        value={coarrendatario.nombreCompleto}
                        onChange={setCoarrendatario('nombreCompleto')}
                        placeholder="Carlos Ruiz Gómez"
                        error={coErrors.nombreCompleto}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Tipo de documento</label>
                            <SelectField
                                id="coarrendatario-tipo-doc"
                                value={coarrendatario.tipoDocumento}
                                onChange={(val) => {
                                    onCoarrendatarioChange({
                                        ...coarrendatario,
                                        tipoDocumento: val as TipoDocArrendatario,
                                    });
                                    if (coErrors.tipoDocumento)
                                        setCoErrors((prev) => ({ ...prev, tipoDocumento: '' }));
                                }}
                                options={DOC_OPTIONS}
                                error={coErrors.tipoDocumento}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <InputField
                                id="coarrendatario-num-doc"
                                label="Número de documento"
                                type="text"
                                inputMode="numeric"
                                value={coarrendatario.numeroDocumento}
                                onChange={setCoarrendatario('numeroDocumento')}
                                placeholder="1234567890"
                                error={coErrors.numeroDocumento}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            id="coarrendatario-tel"
                            label="Teléfono de contacto"
                            type="tel"
                            value={coarrendatario.telefono}
                            onChange={setCoarrendatario('telefono')}
                            placeholder="320 555 1234"
                            error={coErrors.telefono}
                        />
                        <InputField
                            id="coarrendatario-email"
                            label={
                                <>
                                    Correo electrónico{' '}
                                    <span className="text-slate-400 font-normal">(opcional)</span>
                                </>
                            }
                            type="email"
                            value={coarrendatario.email}
                            onChange={setCoarrendatario('email')}
                            placeholder="correo@ejemplo.com"
                            error={coErrors.email}
                        />
                    </div>
                </div>
            )}

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
                    Continuar
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
            </div>
        </div>
    );
}
