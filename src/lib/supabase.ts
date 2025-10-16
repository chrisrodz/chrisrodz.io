import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Use process.env for SSR compatibility (import.meta.env doesn't work reliably in SSR shared modules)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Check if Supabase is configured (validates URL format)
const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey;

// Only create client if properly configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        flowType: 'pkce', // Recommended for SSR
      },
    })
  : null;

// Admin client for server-side operations
export function getServiceSupabase(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!isValidUrl(supabaseUrl) || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl!, serviceKey);
}
