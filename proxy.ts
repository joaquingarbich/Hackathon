import type { NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/proxy";

export const proxy = (request: NextRequest) => actualizarSesion(request);

// Solo las zonas con sesión; las páginas del turista no la necesitan.
export const config = { matcher: ["/operador/:path*", "/admin/:path*", "/ingresar", "/registro"] };
