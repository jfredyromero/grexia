export type PlanTier = 'free' | 'basico' | 'pro';

export const PLANS = [
    {
        id: 'free' as PlanTier,
        name: 'Gratis',
        price: '$0',
        period: '',
        features: ['Generación ilimitada', 'Marca de agua Lexia'],
    },
    {
        id: 'basico' as PlanTier,
        name: 'Básico',
        price: '$59.900',
        period: 'pago único',
        features: ['Sin marca de agua', 'Logo personalizado', '1 sesión legal'],
    },
    {
        id: 'pro' as PlanTier,
        name: 'Pro',
        price: '$119.900',
        period: '/ mes',
        features: ['Sin marca de agua', 'Logo personalizado', '3 sesiones legales / mes'],
    },
] as const;

export const SESSION_COUNTS: Record<PlanTier, number> = { free: 0, basico: 1, pro: 3 };
