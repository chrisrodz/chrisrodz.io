import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Create a stub client if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Admin client for server-side operations
export function getServiceSupabase() {
  const serviceKey = import.meta.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    console.warn('Missing Supabase service key');
    return createClient(
      supabaseUrl || 'https://placeholder.supabase.co', 
      'placeholder-service-key'
    );
  }
  return createClient(supabaseUrl || 'https://placeholder.supabase.co', serviceKey);
}