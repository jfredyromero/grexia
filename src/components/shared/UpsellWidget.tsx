const ASESORIA_FEATURES = ['Sesión virtual de 60 min', 'Abogado especialista en tu área', 'Resuelve todas tus dudas'];
const base = import.meta.env.BASE_URL;

export default function UpsellWidget() {
    return (
        <div className="flex flex-col gap-4 sticky top-28">
            {/* Asesoría puntual */}
            <div className="relative flex flex-col gap-4 rounded-lg bg-secondary shadow-xl shadow-secondary/25 ring-2 ring-primary p-6 overflow-hidden">
                <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

                <div className="relative">
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                        ★ Recomendado
                    </span>
                    <h3 className="mt-3 text-xl font-black text-white">Asesoría puntual</h3>
                    <p className="mt-0.5 text-sm text-slate-300">Habla con un abogado hoy.</p>
                </div>

                <div className="relative flex items-end gap-1.5">
                    <span className="text-3xl font-black text-white">$59.900</span>
                    <span className="text-sm text-slate-300 pb-0.5">COP · sesión</span>
                </div>

                <ul className="relative flex flex-col gap-2">
                    {ASESORIA_FEATURES.map((f) => (
                        <li
                            key={f}
                            className="flex items-center gap-2 text-sm text-slate-300"
                        >
                            <span className="material-symbols-outlined text-blue-400 text-[16px] shrink-0">
                                check_circle
                            </span>
                            {f}
                        </li>
                    ))}
                </ul>

                <a
                    href={base + 'asesoria/checkout'}
                    className="relative mt-auto flex h-11 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover hover:-translate-y-px"
                >
                    Agendar sesión
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </a>
            </div>
        </div>
    );
}
