import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { PlanTier } from '../types/plans';

export const $plan = persistentAtom<PlanTier>('lexia_plan', 'free', {
    encode: (v) => v,
    decode: (v) => (v === 'basico' || v === 'pro' ? v : 'free'),
});

export const $logoUrl = atom<string>('');
