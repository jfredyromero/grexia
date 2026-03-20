const base = import.meta.env.BASE_URL;

const TEMATICAS = [
    {
        value: 'salud',
        label: 'Salud',
        icon: 'health_and_safety',
        descripcion: 'EPS, medicamentos, procedimientos, exámenes',
        activo: true,
        href: base + 'herramientas/tutela/generar',
    },
    {
        value: 'vivienda',
        label: 'Vivienda',
        icon: 'home',
        descripcion: 'Derecho a vivienda digna',
        activo: false,
    },
    {
        value: 'educacion',
        label: 'Educación',
        icon: 'school',
        descripcion: 'Acceso a educación y permanencia',
        activo: false,
    },
    {
        value: 'trabajo',
        label: 'Trabajo',
        icon: 'work',
        descripcion: 'Derechos laborales fundamentales',
        activo: false,
    },
    {
        value: 'otra',
        label: 'Otra temática',
        icon: 'gavel',
        descripcion: 'Otros derechos fundamentales',
        activo: false,
    },
] as const;

export default function TutelaSelector() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMATICAS.map((t) => {
                if (t.activo) {
                    return (
                        <a
                            key={t.value}
                            href={t.href}
                            className="group relative flex flex-col gap-3 rounded-lg border-2 border-primary bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <span className="material-symbols-outlined text-[22px] text-primary">{t.icon}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-secondary">{t.label}</p>
                                    <p className="text-xs text-slate-500">{t.descripcion}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-auto">
                                Generar tutela
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </div>
                            <span className="absolute top-3 right-3 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                Disponible
                            </span>
                        </a>
                    );
                }

                return (
                    <div
                        key={t.value}
                        className="group relative flex flex-col gap-3 rounded-lg border-2 border-slate-200 bg-slate-50 p-5 opacity-60 cursor-not-allowed select-none"
                        title=""
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                                <span className="material-symbols-outlined text-[22px] text-slate-400">{t.icon}</span>
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-500">{t.label}</p>
                                <p className="text-xs text-slate-400">{t.descripcion}</p>
                            </div>
                        </div>
                        <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            Próximamente
                        </span>

                        {/* Tooltip */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-secondary text-white text-xs rounded-lg px-4 py-3 shadow-xl max-w-[200px] text-center">
                                <p className="font-semibold mb-1">Asesoría personalizada</p>
                                <p className="text-slate-300 mb-2">Esta temática requiere orientación de un experto.</p>
                                <span className="inline-flex items-center gap-1 text-blue-300 font-semibold pointer-events-auto">
                                    Agenda una sesión →
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
