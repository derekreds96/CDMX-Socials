import { createClient } from "@supabase/supabase-js";

// Antes de que pegues tus llaves reales de Supabase en .env.local, usamos un
// placeholder para que el proyecto arranque y compile igual — las páginas ya
// están escritas para caer en datos de ejemplo si la llamada real falla.
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-key";

// Cliente público (respeta RLS) — para el catálogo, páginas de evento, etc.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY
);

// Cliente con permisos de servidor (ignora RLS) — SOLO en rutas /api,
// nunca lo importes en un componente que corra en el navegador.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || PLACEHOLDER_KEY
  );
}
