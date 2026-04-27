import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type SupabaseLike = Pick<SupabaseClient, 'from'>;

let instance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (instance) return instance;

    const url = import.meta.env.SUPABASE_URL as string | undefined;
    const key = import.meta.env.SUPABASE_SERVICE_KEY as string | undefined;

    if (!url) throw new Error('SUPABASE_URL is not set');
    if (!key) throw new Error('SUPABASE_SERVICE_KEY is not set');

    instance = createClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    return instance;
}
