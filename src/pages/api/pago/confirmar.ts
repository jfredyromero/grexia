import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    console.log('[ePayco webhook]', JSON.stringify(body));
    return new Response(null, { status: 200 });
};
