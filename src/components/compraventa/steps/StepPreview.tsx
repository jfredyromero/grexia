import { useState } from 'react';
const base = import.meta.env.BASE_URL;
import { Button } from '@headlessui/react';
import type { CompraventaFormData } from '../types';
import CompraventaTemplate from '../CompraventaTemplate';

interface StepPreviewProps {
    formData: CompraventaFormData;
    onBack: () => void;
}

async function generatePDF(formData: CompraventaFormData): Promise<void> {
    const [{ pdf }, { default: CompraventaPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../CompraventaPDF'),
    ]);

    const blob = await pdf(<CompraventaPDF formData={formData} />).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promesa-compraventa.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export default function StepPreview({ formData, onBack }: StepPreviewProps) {
    const [loading, setLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const handleDownload = async () => {
        setLoading(true);
        setPdfError(null);
        try {
            await generatePDF(formData);
        } catch (err) {
            console.error('PDF generation failed:', err);
            setPdfError(err instanceof Error ? err.message : 'Error desconocido al generar el PDF.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-black text-secondary">Tu promesa de compraventa esta lista</h2>
                    </div>
                    <p className="text-sm text-slate-500">Promesa de Compraventa de Bien Inmueble</p>
                </div>
                <Button
                    onClick={handleDownload}
                    disabled={loading}
                    className="cursor-pointer flex items-center gap-1.5 h-11 px-5 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all data-disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:translate-y-0 shrink-0"
                >
                    {loading ? (
                        <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">
                                progress_activity
                            </span>
                            Generando...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Descargar PDF
                        </>
                    )}
                </Button>
            </div>

            {/* PDF error notice */}
            {pdfError && (
                <div className="flex items-start justify-between gap-3 rounded-[12px] bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                    <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                        <span>
                            <strong>No se pudo generar el PDF.</strong> {pdfError} Por favor intenta de nuevo.
                        </span>
                    </div>
                    <Button
                        onClick={handleDownload}
                        disabled={loading}
                        className="cursor-pointer shrink-0 flex items-center gap-1 h-7 px-3 rounded-full bg-red-600 text-white font-semibold data-hover:bg-red-700 transition-colors data-disabled:opacity-60 data-disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-[13px]">refresh</span>
                        Reintentar
                    </Button>
                </div>
            )}

            {/* Compraventa preview */}
            <div
                id="compraventa-preview"
                className="border border-slate-200 rounded-lg overflow-hidden shadow-sm"
            >
                <CompraventaTemplate formData={formData} />
            </div>

            {/* Bottom actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
                <Button
                    onClick={onBack}
                    className="cursor-pointer flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 data-hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Modificar datos
                </Button>
                <div className="flex gap-3 w-full sm:w-auto">
                    <a
                        href={base + 'asesoria/checkout'}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-12 px-6 rounded-full bg-secondary text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        Agendar asesoria
                    </a>
                    <Button
                        onClick={handleDownload}
                        disabled={loading}
                        className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-12 px-6 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all data-disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:translate-y-0"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">
                                    progress_activity
                                </span>
                                Generando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Descargar PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
