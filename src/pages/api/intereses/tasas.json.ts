import type { APIRoute } from 'astro';
import { TASAS_INTERESES } from '../../../data/tasasIntereses';

export const GET: APIRoute = () => {
    return new Response(JSON.stringify(TASAS_INTERESES), {
        headers: { 'Content-Type': 'application/json' },
    });
};
