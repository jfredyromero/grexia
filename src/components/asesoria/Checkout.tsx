import { useState, useRef, useEffect, type FormEvent } from 'react';
import InputField from '../shared/InputField';
// import SelectField from '../shared/SelectField';
// import type { SelectOption } from '../shared/SelectField';
import TextareaField from '../shared/TextareaField';
import Button from '../shared/Button';

// type TipoDoc = 'cc' | 'ce' | 'nit' | 'passport';

// const TIPOS_DOC: SelectOption<TipoDoc>[] = [
//     { value: 'cc', label: 'CC' },
//     { value: 'ce', label: 'CE' },
//     { value: 'nit', label: 'NIT' },
//     { value: 'passport', label: 'Pasaporte' },
// ];

const EPAYCO_KEY = import.meta.env.PUBLIC_EPAYCO_P_KEY as string;
const IS_TEST = import.meta.env.PUBLIC_EPAYCO_TEST !== 'false';
const BASE = import.meta.env.BASE_URL; // siempre termina en /
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
    // celular?: string;
    // tipoDoc?: string;
    // cedula?: string;
}

export default function Checkout() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    // const [celular, setCelular] = useState('');
    // const [tipoDoc, setTipoDoc] = useState<TipoDoc | ''>('');
    // const [cedula, setCedula] = useState('');
    const [caso, setCaso] = useState('');
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
        // if (!/^\d{10}$/.test(celular.replace(/\s/g, ''))) errs.celular = 'Ingresa un celular de 10 dígitos';
        // if (!tipoDoc) errs.tipoDoc = 'Selecciona el tipo de documento';
        // if (!/^\d{6,12}$/.test(cedula.replace(/\s/g, ''))) errs.cedula = 'Ingresa un número de documento válido';
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
        // localStorage.setItem('grexia_checkout_celular', celular.trim());
        // localStorage.setItem('grexia_checkout_cedula', cedula.trim());
        localStorage.setItem('grexia_checkout_notes', caso.trim());

        handlerRef.current?.open({
            name: 'Asesoría legal Grexia',
            description: 'Sesión virtual con abogado',
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
            // mobilephone_billing: celular.trim(),
            // number_doc_billing: cedula.trim(),
            // type_doc_billing: tipoDoc,
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

                {/* <InputField
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
                /> */}

                {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                            Tipo de documento <span className="text-red-500">*</span>
                        </label>
                        <SelectField
                            id="tipo-doc"
                            value={tipoDoc}
                            onChange={setTipoDoc}
                            options={TIPOS_DOC}
                            placeholder="Seleccionar..."
                            error={errors.tipoDoc}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <InputField
                            label={
                                <>
                                    Número de documento <span className="text-red-500">*</span>
                                </>
                            }
                            id="cedula"
                            name="cedula"
                            type="text"
                            inputMode="numeric"
                            placeholder="1234567890"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            error={errors.cedula}
                        />
                    </div>
                </div> */}

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
