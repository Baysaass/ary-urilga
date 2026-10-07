import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Safe environment variable resolution for both Vite client bundle and Node.js runtime
const envUrl = (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined')
  ? import.meta.env.VITE_SUPABASE_URL
  : (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : undefined);

const envKey = (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined')
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : undefined);

const supabaseUrl = (envUrl || '').trim();
const supabaseAnonKey = (envKey || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Returns a stable, anonymous device/guest ID stored in localStorage.
 * This is used to track reactions and gifts per device without requiring login.
 */
export function getGuestDeviceId(): string {
  const STORAGE_KEY = 'mhw_device_guest_id_v1';
  try {
    if (typeof localStorage === 'undefined') return 'guest-server';
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'guest-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'guest-temp-' + Math.random().toString(36).substring(2, 9);
  }
}
