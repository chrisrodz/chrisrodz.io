import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

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
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client for server-side operations
export function getServiceSupabase(): SupabaseClient | null {
  const serviceKey = import.meta.env.SUPABASE_SERVICE_KEY;

  if (!isValidUrl(supabaseUrl) || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
}