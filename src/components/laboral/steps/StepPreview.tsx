import { useState } from 'react';
import { Button } from '@headlessui/react';
import type { LaboralFormData } from '../types';
import LaboralTerminoFijo from '../html/LaboralTerminoFijo';
import LaboralObraLabor from '../html/LaboralObraLabor';

const base = import.meta.env.BASE_URL;

interface StepPreviewProps {
    formData: LaboralFormData;
    onBack: () => void;
}

async function generatePDF(formData: LaboralFormData): Promise<void> {
    const { pdf } = await import('@react-pdf/renderer');

    let blob: Blob;
    if (formData.tipoContrato === 'termino-fijo') {
        const { default: LaboralTerminoFijoPDF } = await import('../pdf/LaboralTerminoFijo');
        blob = await pdf(<LaboralTerminoFijoPDF formData={formData} />).toBlob();
    } else {
        const { default: LaboralObraLaborPDF } = await import('../pdf/LaboralObraLabor');
        blob = await pdf(<LaboralObraLaborPDF formData={formData} />).toBlob();
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formData.tipoContrato === 'termino-fijo' ? 'contrato-termino-fijo.pdf' : 'contrato-obra-labor.pdf';
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

    const previewId = 'laboral-preview';

    const tipoLabel =
        formData.tipoContrato === 'termino-fijo' ? 'Contrato a Término Fijo' : 'Contrato por Obra o Labor';

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-black text-secondary">Tu contrato está listo</h2>
                    </div>
                    <p className="text-sm text-slate-500">{tipoLabel} · Código Sustantivo del Trabajo</p>
                </div>
                <Button
                    onClick={handleDownload}
                    disabled={loading}
                    className="flex items-center gap-1.5 h-11 px-5 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all cursor-pointer data-disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:translate-y-0 shrink-0"
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

            {/* Error */}
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
                        className="shrink-0 flex items-center gap-1 h-7 px-3 rounded-full bg-red-600 text-white font-semibold data-hover:bg-red-700 transition-colors cursor-pointer data-disabled:opacity-60 data-disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-[13px]">refresh</span>
                        Reintentar
                    </Button>
                </div>
            )}

            {/* Preview */}
            <div
                id={previewId}
                className="border border-slate-200 rounded-lg overflow-hidden shadow-sm"
            >
                {formData.tipoContrato === 'termino-fijo' ? (
                    <LaboralTerminoFijo formData={formData} />
                ) : (
                    <LaboralObraLabor formData={formData} />
                )}
            </div>

            {/* Bottom actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
                <Button
                    onClick={onBack}
                    className="flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 data-hover:bg-slate-50 transition-colors cursor-pointer w-full sm:w-auto justify-center"
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
                        Agendar asesoría
                    </a>
                    <Button
                        onClick={handleDownload}
                        disabled={loading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-12 px-6 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all cursor-pointer data-disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:translate-y-0"
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
