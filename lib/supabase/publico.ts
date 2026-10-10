import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/** Cliente anónimo sin cookies: lecturas públicas del turista (padrones, búsqueda) desde el servidor. */
export const supabasePublico = () =>
  createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });
