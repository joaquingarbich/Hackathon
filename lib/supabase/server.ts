import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServidor() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: no puede escribir cookies; el refresco de sesión lo hará el proxy (Fase 3).
        }
      },
    },
  });
}
