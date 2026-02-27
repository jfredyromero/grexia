import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';

export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
}

interface SelectFieldProps<T extends string> {
    id?: string;
    value: T | '';
    onChange: (value: T | '') => void;
    options: SelectOption<T>[];
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

export default function SelectField<T extends string>({
    id,
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    disabled,
    error,
}: SelectFieldProps<T>) {
    const selected = options.find((o) => o.value === value) ?? null;

    return (
        <div className="flex flex-col gap-1.5">
            <Listbox
                value={value}
                onChange={onChange}
                disabled={disabled}
            >
                <ListboxButton
                    id={id}
                    className="group flex h-12 w-full items-center justify-between rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-left transition-colors focus:outline-none data-open:border-primary data-open:ring-2 data-open:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
                        {selected?.label ?? placeholder}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200 group-data-open:rotate-180">
                        expand_more
                    </span>
                </ListboxButton>
                <ListboxOptions
                    anchor="bottom start"
                    modal={false}
                    className="z-50 mt-1 w-[var(--button-width)] rounded-[8px] border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto focus:outline-none empty:invisible"
                >
                    {options.map((opt) => (
                        <ListboxOption
                            key={opt.value}
                            value={opt.value}
                            className="cursor-pointer select-none px-4 py-2.5 text-sm text-slate-700 data-focus:bg-slate-50 data-selected:font-semibold data-selected:text-secondary"
                        >
                            {opt.label}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
