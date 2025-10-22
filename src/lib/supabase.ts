import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

export const isSupabaseConfigured = config.database.isConfigured();

// Only create client if properly configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(config.database.url!, config.database.anonKey!, {
      auth: {
        flowType: 'pkce', // Recommended for SSR
      },
    })
  : null;

// Admin client for server-side operations
export function getServiceSupabase(): SupabaseClient | null {
  if (!config.database.isConfigured() || !config.database.hasServiceKey()) {
    return null;
  }

  return createClient(config.database.url!, config.database.serviceKey!);
}
