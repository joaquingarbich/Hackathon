// Refresca la sesión de Supabase en cada request (patrón oficial @supabase/ssr para Next 16 proxy).
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(lista, headers) {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => respuesta.headers.set(k, v));
      },
    },
  });
  // No poner código entre createServerClient y getClaims (puede cerrar sesiones al azar).
  await supabase.auth.getClaims();
  return respuesta;
}
