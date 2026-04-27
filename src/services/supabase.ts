import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

export type SupabaseLike = Pick<SupabaseClient<Database>, 'from'>;

let instance: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
    if (instance) return instance;

    const url = import.meta.env.SUPABASE_URL as string | undefined;
    const key = import.meta.env.SUPABASE_SERVICE_KEY as string | undefined;

    if (!url) throw new Error('SUPABASE_URL is not set');
    if (!key) throw new Error('SUPABASE_SERVICE_KEY is not set');

    instance = createClient<Database>(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    return instance;
}
