import { createClient } from '@supabase/supabase-js';

// Usar import.meta.env para Vite (NO process.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar configuración
const hasValidConfig = () => {
  return (
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.includes('supabase.co') &&
    supabaseAnonKey.length > 20
  );
};

if (!hasValidConfig()) {
  console.warn(
    '⚠️ Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment.'
  );
}

// Cliente de Supabase
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

console.log('✅ Supabase Client initialized');
console.log('   URL:', supabaseUrl ? '✓ configured' : '✗ missing');
console.log('   Key:', supabaseAnonKey ? '✓ configured' : '✗ missing');