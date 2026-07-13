import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// A harmless placeholder keeps the public prototype renderable until the
// project variables are configured. Auth/database actions are disabled by the
// UI whenever isSupabaseConfigured is false.
const clientUrl = supabaseUrl || 'https://placeholder.supabase.co';
const clientKey = supabasePublishableKey || 'placeholder-publishable-key';

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
