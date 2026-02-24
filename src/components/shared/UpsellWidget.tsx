import { useStore } from '@nanostores/react';
import { PLANS, SESSION_COUNTS } from '../../types/plans';
import { $plan } from '../../stores/plan';

interface UpsellWidgetProps {
    calendarUrl: string;
    isStep5?: boolean;
}

export default function UpsellWidget({ calendarUrl, isStep5 = false }: UpsellWidgetProps) {
    const plan = useStore($plan);
    const onPlanChange = $plan.set.bind($plan);
    const isPaid = plan === 'basico' || plan === 'pro';
    const sessions = SESSION_COUNTS[plan];
    const currentPlan = PLANS.find((p) => p.id === plan)!;

    return (
        <div className="glass-widget rounded-lg p-6 flex flex-col gap-5 sticky top-28">
            {/* Current plan indicator */}
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tu plan</p>
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                        plan === 'free'
                            ? 'bg-slate-100 text-slate-600'
                            : plan === 'basico'
                              ? 'bg-primary/15 text-secondary'
                              : 'bg-primary/10 text-secondary',
                    ].join(' ')}
                >
                    {currentPlan.name}
                </span>
            </div>

            {/* Plan selector pills */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 rounded-xl p-1">
                {PLANS.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => onPlanChange(p.id)}
                        className={[
                            'rounded-lg py-2 text-xs font-semibold transition-all',
                            plan === p.id ? 'bg-white text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-700',
                        ].join(' ')}
                    >
                        {p.name}
                    </button>
                ))}
            </div>

            {/* Plan details */}
            <div>
                <div className="flex items-end gap-1 mb-3">
                    <span className="text-2xl font-black text-secondary">{currentPlan.price}</span>
                    {currentPlan.period && <span className="text-xs text-slate-400 pb-1">{currentPlan.period}</span>}
                </div>
                <ul className="flex flex-col gap-2">
                    {currentPlan.features.map((f) => (
                        <li
                            key={f}
                            className="flex items-center gap-2 text-xs text-slate-600"
                        >
                            <span className="material-symbols-outlined text-primary text-[14px] flex-shrink-0">
                                check_circle
                            </span>
                            {f}
                        </li>
                    ))}
                </ul>
            </div>

            {/* CTA section */}
            {!isPaid ? (
                <>
                    <button
                        onClick={() => onPlanChange('basico')}
                        className="flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover hover:translate-y-[-1px]"
                    >
                        Actualizar a Básico
                        <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                    </button>
                    <p className="text-center text-xs text-slate-400">
                        O suscríbete al Plan Pro por{' '}
                        <button
                            onClick={() => onPlanChange('pro')}
                            className="underline hover:text-secondary"
                        >
                            $119.900/mes
                        </button>
                    </p>
                </>
            ) : (
                <>
                    {isStep5 && sessions > 0 && (
                        <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs font-semibold text-secondary leading-snug flex items-start gap-2">
                            <span className="material-symbols-outlined text-primary text-[16px] flex-shrink-0 mt-0.5">
                                video_call
                            </span>
                            Tienes{' '}
                            <strong>
                                {sessions} sesión{sessions > 1 ? 'es' : ''} virtual{sessions > 1 ? 'es' : ''}
                            </strong>{' '}
                            con nuestro equipo legal incluida{sessions > 1 ? 's' : ''}.
                        </div>
                    )}
                    <a
                        href={calendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 items-center justify-center gap-2 rounded-full bg-secondary px-6 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:translate-y-[-1px]"
                    >
                        Agendar sesión legal
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    </a>
                    <p className="text-center text-xs text-slate-400">
                        {plan === 'basico' ? '1 sesión virtual incluida' : '3 sesiones virtuales / mes'}
                    </p>
                </>
            )}
        </div>
    );
}
