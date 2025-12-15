import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-key';

const hasValidConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && url.length > 0 && key.length > 0;
};

if (!hasValidConfig()) {
  console.warn('⚠️ Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase Client initialized');
console.log('   URL:', supabaseUrl ? '✓ configured' : '✗ missing');
console.log('   Key:', supabaseAnonKey ? '✓ configured' : '✗ missing');
