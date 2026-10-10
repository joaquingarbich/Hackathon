import { createClient } from "@supabase/supabase-js";

/** Cliente con service role: salta RLS. Solo en scripts y código de servidor, nunca en el navegador. */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (ver .env.example)");
  return createClient(url, key, { auth: { persistSession: false } });
}
