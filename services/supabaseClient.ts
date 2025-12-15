import { createClient } from '@supabase/supabase-js';

// Configuració de Supabase
const supabaseUrl = 'https://mmccrbuetauvzkypalbi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY2NyYnVldGF1dnpreXBnbGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyNjk1MjIsImV4cCI6MjA0OTg0NTUyMn0.jlFKiZCxyp78dbcMXjdUgzXmRey3br0estMc6fisN44';

// Validar que les variables d'entorn existeixen
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Crear i exportar el client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase client initialized:', supabaseUrl);

// Helper per verificar si Supabase està configurat
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Helper per obtenir la URL de Supabase
export const getSupabaseUrl = (): string => {
  return supabaseUrl;
};

// Helper per obtenir la clau anònima
export const getSupabaseAnonKey = (): string => {
  return supabaseAnonKey;
};