import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-key';

const hasValidConfig = () => {
  return (
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.includes('supabase.co') &&
    supabaseAnonKey.length > 20
  );
};

if (!hasValidConfig()) {
  console.warn('⚠️ Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase Client initialized');
console.log('   URL:', supabaseUrl ? '✓ configured' : '✗ missing');
console.log('   Key:', supabaseAnonKey ? '✓ configured' : '✗ missing');