import { useState } from 'react';
import { Button } from '@headlessui/react';
import type { TutelaFormData } from '../types';
import TutelaSaludTemplate from '../html/TutelaSalud';

const base = import.meta.env.BASE_URL;

interface Props {
    formData: TutelaFormData;
    onBack: () => void;
    hechosIA: string | null;
    hechosLoading: boolean;
    hechosError: string | null;
}

async function generatePDF(formData: TutelaFormData, hechosIA: string | null): Promise<void> {
    const [{ pdf }, { default: TutelaPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../pdf/TutelaSalud'),
    ]);

    const blob = await pdf(
        <TutelaPDF
            formData={formData}
            hechosIA={hechosIA}
        />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tutela-salud.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export default function StepPreview({ formData, onBack, hechosIA, hechosLoading, hechosError }: Props) {
    const [loading, setLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const handleDownload = async () => {
        setLoading(true);
        setPdfError(null);
        try {
            await generatePDF(formData, hechosIA);
        } catch (err) {
            console.error('PDF generation failed:', err);
            setPdfError(err instanceof Error ? err.message : 'Error desconocido al generar el PDF.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-secondary">Tu tutela está lista</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Acción de Tutela · Art. 86 Constitución Política de Colombia
                    </p>
                </div>
                <Button
                    onClick={handleDownload}
                    disabled={loading}
                    className="flex items-center gap-1.5 h-11 px-5 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all data-disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:translate-y-0 shrink-0 cursor-pointer"
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
                        className="shrink-0 flex items-center gap-1 h-7 px-3 rounded-full bg-red-600 text-white font-semibold data-hover:bg-red-700 transition-colors data-disabled:opacity-60 data-disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[13px]">refresh</span>
                        Reintentar
                    </Button>
                </div>
            )}

            {hechosLoading && (
                <div className="flex items-center gap-2 rounded-[12px] bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs text-blue-700">
                    <span className="material-symbols-outlined text-[16px] animate-spin shrink-0">
                        progress_activity
                    </span>
                    <span>
                        <strong>Redactando hechos con IA…</strong> Los hechos se están generando automáticamente con
                        Gemini. La vista previa se actualizará al terminar.
                    </span>
                </div>
            )}

            {!hechosLoading && hechosIA && (
                <div className="flex items-center gap-2 rounded-[12px] bg-green-50 border border-green-200 px-4 py-2.5 text-xs text-green-700">
                    <span className="material-symbols-outlined text-[16px] shrink-0">auto_awesome</span>
                    <span>
                        <strong>Hechos redactados con IA.</strong> La sección de hechos fue generada automáticamente con
                        Gemini 2.5 Flash-Lite y ya está incluida en el PDF.
                    </span>
                </div>
            )}

            {!hechosLoading && hechosError && (
                <div className="flex items-center gap-2 rounded-[12px] bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-700">
                    <span className="material-symbols-outlined text-[16px] shrink-0">warning</span>
                    <span>
                        <strong>No se pudo usar IA.</strong> Se usará la redacción estándar. ({hechosError})
                    </span>
                </div>
            )}

            <div
                id="tutela-preview"
                className="border border-slate-200 rounded-lg overflow-hidden shadow-sm"
            >
                <TutelaSaludTemplate
                    formData={formData}
                    hechosIA={hechosIA}
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
                <Button
                    onClick={onBack}
                    className="flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 data-hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Modificar datos
                </Button>
                <div className="flex gap-3 w-full sm:w-auto">
                    <a
                        href={base + 'asesoria/checkout'}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-12 px-6 rounded-full bg-secondary text-sm font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        Agendar asesoría
                    </a>
                    <Button
                        onClick={handleDownload}
                        disabled={loading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-12 px-6 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 data-hover:bg-primary-hover data-hover:-translate-y-px transition-all data-disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:translate-y-0 cursor-pointer"
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
