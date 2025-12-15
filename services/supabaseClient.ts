import { createClient } from '@supabase/supabase-js';

// Configuració de Supabase
const supabaseUrl = 'https://mmccrbuetauvzkypglbi.supabase.co';

// ANON KEY - Segura per usar al client (lectura pública)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY2NyYnVldGF1dnpreXBnbGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyNjk1MjIsImV4cCI6MjA0OTg0NTUyMn0.jlFKiZCxyp78dbcMXjdUgzXmRey3br0estMc6fisN44';

// SERVICE ROLE KEY - Només des de variables d'entorn (escriptura admin)
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Validar que les variables d'entorn existeixen
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL no configurada');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY no configurada');
}

// Client públic - Per lectura i operacions de usuari normal
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin - Per sincronització i operacions privilegiades
// IMPORTANT: Només usar al servidor o a variables d'entorn protegides
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : supabase; // Fallback a client públic si no està configurada

console.log('✅ Supabase initialized:', supabaseUrl);
console.log('✅ ANON KEY configured:', !!supabaseAnonKey);
console.log('✅ SERVICE ROLE KEY configured:', !!supabaseServiceRoleKey);