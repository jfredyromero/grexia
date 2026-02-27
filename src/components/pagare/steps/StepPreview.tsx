import { useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import type { PagareFormData, PlanTier } from '../types';
import PagareTemplate from '../PagareTemplate';
import { $plan, $logoUrl } from '../../../stores/plan';

interface StepPreviewProps {
    formData: PagareFormData;
    onBack: () => void;
}

async function generatePDF(formData: PagareFormData, plan: PlanTier, logoUrl: string): Promise<void> {
    const [{ pdf }, { default: PagarePDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../PagarePDF'),
    ]);

    const blob = await pdf(
        <PagarePDF
            formData={formData}
            plan={plan}
            logoUrl={logoUrl}
        />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pagare.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

const PLAN_LABELS: Record<PlanTier, { label: string; color: string }> = {
    free: { label: 'Plan Gratuito', color: 'bg-slate-100 text-slate-600' },
    empresarial: { label: 'Plan Empresarial', color: 'bg-secondary text-primary font-bold' },
};

export default function StepPreview({ formData, onBack }: StepPreviewProps) {
    const plan = useStore($plan);
    const logoUrl = useStore($logoUrl);
    const onLogoChange = $logoUrl.set.bind($logoUrl);
    const [loading, setLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const isPaid = plan === 'empresarial';
    const planInfo = PLAN_LABELS[plan];

    const handleDownload = async () => {
        setLoading(true);
        setPdfError(null);
        try {
            await generatePDF(formData, plan, logoUrl);
        } catch (err) {
            console.error('PDF generation failed:', err);
            setPdfError(err instanceof Error ? err.message : 'Error desconocido al generar el PDF.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            onLogoChange((ev.target?.result as string) ?? '');
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-black text-secondary">Tu pagaré está listo</h2>
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${planInfo.color}`}
                        >
                            {planInfo.label}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">Título Valor · Código de Comercio de Colombia</p>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="flex items-center gap-1.5 h-11 px-5 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-hover hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 shrink-0"
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
                </button>
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
                    <button
                        onClick={handleDownload}
                        disabled={loading}
                        className="shrink-0 flex items-center gap-1 h-7 px-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-[13px]">refresh</span>
                        Reintentar
                    </button>
                </div>
            )}

            {/* Plan upgrade banner (free) */}
            {plan === 'free' && (
                <div className="flex items-center justify-between gap-3 rounded-[12px] bg-slate-50 border border-slate-200 p-4">
                    <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-amber-500 text-[20px] shrink-0 mt-0.5">
                            info
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            <strong>Plan Gratuito:</strong> el PDF incluye la marca de agua de Lexia. ¿Tienes dudas
                            sobre tu pagaré? Habla con un abogado.
                        </p>
                    </div>
                    <a
                        href="/asesoria/checkout"
                        className="shrink-0 flex items-center gap-1 h-8 px-4 rounded-full bg-secondary text-xs font-bold text-white hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                        Agendar
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                    </a>
                </div>
            )}

            {/* Logo upload (paid plans) */}
            {isPaid && (
                <div className="flex flex-col gap-3 rounded-[12px] bg-primary/5 border border-primary/20 p-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">add_photo_alternate</span>
                        <p className="text-sm font-semibold text-secondary">Logo personalizado</p>
                        <span className="text-xs text-slate-400">(opcional)</span>
                    </div>
                    {logoUrl ? (
                        <div className="flex items-center gap-3">
                            <img
                                src={logoUrl}
                                alt="Logo"
                                className="h-10 max-w-30 object-contain rounded border border-slate-200 bg-white p-1"
                            />
                            <button
                                onClick={() => {
                                    onLogoChange('');
                                    if (logoInputRef.current) logoInputRef.current.value = '';
                                }}
                                className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                                Quitar logo
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => logoInputRef.current?.click()}
                                className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-dashed border-primary/50 text-xs font-semibold text-secondary hover:bg-primary/10 transition-colors w-fit"
                            >
                                <span className="material-symbols-outlined text-[16px]">upload</span>
                                Subir logo (PNG, JPG)
                            </button>
                            <p className="text-xs text-slate-400">Aparecerá en el encabezado del pagaré.</p>
                        </>
                    )}
                    <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleLogoUpload}
                    />
                </div>
            )}

            {/* Pagaré preview */}
            <div
                id="pagare-preview"
                className="border border-slate-200 rounded-lg overflow-hidden shadow-sm"
            >
                <PagareTemplate
                    formData={formData}
                    plan={plan}
                    logoUrl={logoUrl}
                />
            </div>

            {/* Bottom actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 h-12 px-6 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Modificar datos
                </button>
                <div className="flex gap-3 w-full sm:w-auto">
                    <a
                        href="/asesoria/checkout"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-12 px-6 rounded-full bg-secondary text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        Agendar asesoría
                    </a>
                    <button
                        onClick={handleDownload}
                        disabled={loading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-12 px-6 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-hover hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
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
                    </button>
                </div>
            </div>
        </div>
    );
}
