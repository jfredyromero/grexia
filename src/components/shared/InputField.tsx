import { Field, Label, Input, Description } from '@headlessui/react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: React.ReactNode;
    error?: string;
    description?: string;
    prefix?: string;
    suffix?: string;
}

const inputClass =
    'h-12 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none data-focus:ring-2 data-focus:ring-primary/50 data-focus:border-primary data-invalid:border-red-400 data-invalid:ring-2 data-invalid:ring-red-400/20 data-disabled:opacity-50 data-disabled:cursor-not-allowed transition-colors';

export default function InputField({
    label,
    error,
    description,
    prefix,
    suffix,
    className,
    ...props
}: InputFieldProps) {
    return (
        <Field className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold text-slate-700">{label}</Label>
            {description && <Description className="text-xs text-slate-500 -mt-0.5">{description}</Description>}
            {prefix || suffix ? (
                <div className="relative">
                    {prefix && (
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                            {prefix}
                        </span>
                    )}
                    <Input
                        {...props}
                        invalid={!!error}
                        className={`${inputClass}${prefix ? ' pl-8' : ''}${suffix ? ' pr-10' : ''}${className ? ` ${className}` : ''}`}
                    />
                    {suffix && (
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                            {suffix}
                        </span>
                    )}
                </div>
            ) : (
                <Input
                    {...props}
                    invalid={!!error}
                    className={`${inputClass}${className ? ` ${className}` : ''}`}
                />
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </Field>
    );
}
