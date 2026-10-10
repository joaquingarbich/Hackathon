// Límite de frecuencia (cuota de Gemini). Contador en Postgres: funciona entre instancias serverless.
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { REGLAS } from "@/config/reglas";

export type Accion = keyof typeof REGLAS.limites;

/** true si aún hay cupo para esta acción y este origen (IP o usuario). Si la BD falla, deja pasar: no rompe la app. */
export async function hayCupo(accion: Accion, usuarioId?: string): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "sin-ip";
  const quien = createHash("sha256").update(usuarioId ?? ip).digest("base64url").slice(0, 22); // nunca la IP en claro
  const { maximo, ventanaSeg } = REGLAS.limites[accion];
  const { data, error } = await supabaseAdmin().rpc("consumir_cupo", { p_clave: `${accion}:${quien}`, p_ventana_seg: ventanaSeg });
  if (error) { console.error("limite", error.message); return true; }
  return (data ?? 0) <= maximo;
}
