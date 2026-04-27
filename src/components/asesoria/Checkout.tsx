import { useState, useRef, useEffect, type FormEvent } from 'react';
import InputField from '../shared/InputField';
import TextareaField from '../shared/TextareaField';
import Button from '../shared/Button';
import SelectField, { type SelectOption } from '../shared/SelectField';

type TipoDoc = 'CC' | 'CE' | 'NIT' | 'Pasaporte';

const TIPO_DOC_OPTIONS: SelectOption<TipoDoc>[] = [
    { value: 'CC', label: 'Cédula de ciudadanía' },
    { value: 'CE', label: 'Cédula de extranjería' },
    { value: 'NIT', label: 'NIT' },
    { value: 'Pasaporte', label: 'Pasaporte' },
];

export function validateCelular(value: string): boolean {
    return /^\d{10}$/.test(value);
}

const EPAYCO_KEY = import.meta.env.PUBLIC_EPAYCO_P_KEY as string;
const IS_TEST = import.meta.env.PUBLIC_EPAYCO_TEST !== 'false';
const BASE = import.meta.env.BASE_URL;
const RESPONSE_URL = `${import.meta.env.SITE}${BASE}asesoria/confirmacion`;
const CONFIRMATION_URL = `${import.meta.env.SITE}${BASE}api/pago/confirmar`;

interface EpaycoHandler {
    open: (params: Record<string, string | string[]>) => void;
}

declare global {
    interface Window {
        ePayco?: {
            checkout: {
                configure: (config: { key: string; test: boolean }) => EpaycoHandler;
            };
        };
    }
}

interface Errors {
    nombre?: string;
    email?: string;
    celular?: string;
    tipoDoc?: string;
    numDoc?: string;
    direccion?: string;
}

export default function Checkout() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [caso, setCaso] = useState('');
    const [tipoDoc, setTipoDoc] = useState<TipoDoc | ''>('');
    const [numDoc, setNumDoc] = useState('');
    const [direccion, setDireccion] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [sdkReady, setSdkReady] = useState(false);
    const handlerRef = useRef<EpaycoHandler | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.ePayco) {
                clearInterval(interval);
                handlerRef.current = window.ePayco.checkout.configure({
                    key: EPAYCO_KEY,
                    test: IS_TEST,
                });
                setSdkReady(true);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    function validate(): Errors {
        const errs: Errors = {};
        if (!nombre.trim()) errs.nombre = 'Ingresa tu nombre completo';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Ingresa un correo electrónico válido';
        if (!validateCelular(celular.trim())) errs.celular = 'Ingresa un número de celular válido (10 dígitos)';
        if (!tipoDoc) errs.tipoDoc = 'Selecciona el tipo de documento';
        if (!numDoc.trim()) errs.numDoc = 'Ingresa tu número de documento';
        if (!direccion.trim()) errs.direccion = 'Ingresa tu dirección';
        return errs;
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setErrors({});
        localStorage.setItem('grexia_checkout_name', nombre.trim());
        localStorage.setItem('grexia_checkout_email', email.trim());
        localStorage.setItem('grexia_checkout_celular', celular.trim());
        localStorage.setItem('grexia_checkout_notes', caso.trim());
        localStorage.setItem('grexia_checkout_patch_done', 'false');
        localStorage.setItem('grexia_checkout_tipo_doc', tipoDoc);
        localStorage.setItem('grexia_checkout_num_doc', numDoc.trim());
        localStorage.setItem('grexia_checkout_direccion', direccion.trim());

        handlerRef.current?.open({
            name: 'Asesoría legal Grexia',
            description: 'Asesoría Virtual con Abogado Especialista',
            currency: 'cop',
            amount: '59900',
            tax_base: '59900',
            tax: '0',
            tax_ico: '0',
            country: 'CO',
            lang: 'es',
            external: 'false',
            response: RESPONSE_URL,
            confirmation: CONFIRMATION_URL,
            email_billing: email.trim(),
            name_billing: nombre.trim(),
            mobilephone_billing: celular.trim(),
            extra1: celular.trim(),
            extra2: tipoDoc,
            extra3: numDoc.trim(),
            extra4: direccion.trim(),
            id_billing: numDoc.trim(),
            type_doc_billing: tipoDoc,
            address_billing: direccion.trim(),
            type_person_billing: tipoDoc === 'NIT' ? 'J' : 'N',
            methodsDisable: ['CASH', 'SP'],
        });
    }

    return (
        <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-black text-secondary mb-1">Tus datos</h2>
            <p className="text-sm text-slate-500 mb-6">Para que el abogado llegue preparado a tu sesión.</p>

            <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-5"
                data-testid="checkout-form"
            >
                <InputField
                    label={
                        <>
                            Nombre completo <span className="text-red-500">*</span>
                        </>
                    }
                    id="nombre"
                    name="nombre"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    error={errors.nombre}
                />

                <InputField
                    label={
                        <>
                            Correo electrónico <span className="text-red-500">*</span>
                        </>
                    }
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                />

                <InputField
                    label={
                        <>
                            Número de celular <span className="text-red-500">*</span>
                        </>
                    }
                    id="celular"
                    name="celular"
                    type="tel"
                    autoComplete="tel"
                    placeholder="3001234567"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    error={errors.celular}
                />

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="tipoDoc"
                        className="text-sm font-medium text-slate-700"
                    >
                        Tipo de documento <span className="text-red-500">*</span>
                    </label>
                    <SelectField<TipoDoc>
                        id="tipoDoc"
                        value={tipoDoc}
                        onChange={(v) => setTipoDoc(v)}
                        options={TIPO_DOC_OPTIONS}
                        placeholder="Tipo de documento"
                        error={errors.tipoDoc}
                    />
                </div>

                <InputField
                    label={
                        <>
                            Número de documento <span className="text-red-500">*</span>
                        </>
                    }
                    id="numDoc"
                    name="numDoc"
                    type="text"
                    placeholder="Número de documento"
                    value={numDoc}
                    onChange={(e) => setNumDoc(e.target.value)}
                    error={errors.numDoc}
                />

                <InputField
                    label={
                        <>
                            Dirección <span className="text-red-500">*</span>
                        </>
                    }
                    id="direccion"
                    name="direccion"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Ej: Calle 1 # 2-3, Bogotá"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    error={errors.direccion}
                />

                <TextareaField
                    label={
                        <>
                            Cuéntanos tu caso con detalle <span className="text-slate-400 font-normal">(opcional)</span>
                        </>
                    }
                    id="caso"
                    name="caso"
                    rows={3}
                    placeholder="Ej: Necesito revisar un contrato de arrendamiento comercial antes de firmarlo…"
                    value={caso}
                    onChange={(e) => setCaso(e.target.value)}
                />

                <Button
                    type="submit"
                    disabled={!sdkReady}
                    data-testid="btn-pagar"
                    className="w-full"
                >
                    {sdkReady ? (
                        <>
                            Pagar $59.900 COP
                            <span className="material-symbols-outlined text-[18px]">lock</span>
                        </>
                    ) : (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Cargando…
                        </>
                    )}
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 -mt-2">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Pago seguro · Procesado por ePayco
                </p>
            </form>
        </div>
    );
}
