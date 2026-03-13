import { Field, Label, Textarea, Description } from '@headlessui/react';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: React.ReactNode;
    error?: string;
    description?: string;
}

export default function TextareaField({ label, error, description, className, ...props }: TextareaFieldProps) {
    return (
        <Field className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold text-slate-700">{label}</Label>
            {description && <Description className="text-xs text-slate-500 -mt-0.5">{description}</Description>}
            <Textarea
                {...props}
                invalid={!!error}
                className={`w-full rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none field-sizing-content transition-colors focus:outline-none data-focus:ring-2 data-focus:ring-primary/50 data-focus:border-primary data-invalid:border-red-400 data-invalid:ring-2 data-invalid:ring-red-400/20 data-disabled:opacity-50 data-disabled:cursor-not-allowed${className ? ` ${className}` : ''}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </Field>
    );
}
