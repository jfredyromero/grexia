import { Button } from '@headlessui/react';
import type { TutelaFormData } from '../types';
import { DOCUMENTOS_GUIA } from '../types';

interface Props {
    data: TutelaFormData;
    onChange: (data: TutelaFormData) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function Step7Anexos({ data, onChange, onNext, onBack }: Props) {
    const toggleDocumento = (value: string) => {
        const next = data.documentosGuia.includes(value)
            ? data.documentosGuia.filter((v) => v !== value)
            : [...data.documentosGuia, value];
        onChange({ ...data, documentosGuia: next });
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-secondary">Anexos y pruebas</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Marca los documentos que tienes disponibles para acompañar tu tutela
                </p>
            </div>

            <div className="flex flex-col gap-2.5">
                {DOCUMENTOS_GUIA.map(({ value, label }) => (
                    <label
                        key={value}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <input
                            type="checkbox"
                            checked={data.documentosGuia.includes(value)}
                            onChange={() => toggleDocumento(value)}
                            className="w-4 h-4 accent-primary cursor-pointer rounded"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                            {label}
                        </span>
                    </label>
                ))}
            </div>

            <div className="flex justify-between pt-4 mt-2 border-t border-slate-100">
                <Button
                    onClick={onBack}
                    className="flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 data-hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Anterior
                </Button>
                <Button
                    onClick={onNext}
                    className="flex items-center gap-1.5 h-12 px-8 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all cursor-pointer"
                >
                    Ver tutela
                    <span className="material-symbols-outlined text-[18px]">preview</span>
                </Button>
            </div>
        </div>
    );
}
