"use server";
import { exigirUsuario } from "@/lib/sesion";
import { hayCupo } from "@/lib/limite";
import { TEXTO_LIMITE } from "@/config/textos";
import { rucValido, normalizarPlaca } from "@/lib/normalizacion";
import { procesarSolicitud, type Declarados } from "@/lib/validacion";
import { supabaseAdmin } from "@/lib/supabase/admin";

const RUTA = /^[0-9a-f-]{36}\/[A-Za-z0-9_-]+\.(pdf|jpe?g|png|webp)$/;
const corto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 120) : undefined);

export type ResultadoEnvio = { ok: true } | { ok: false; error: string };

/** El archivo ya se subió desde el navegador a <user_id>/…; aquí se registra y se procesa. */
export async function enviarSolicitud(entrada: {
  ruc: string; tipo: string; ruta: string; nombre_comercial?: string; placa?: string; telefono?: string;
}): Promise<ResultadoEnvio> {
  const u = await exigirUsuario();
  if (!(await hayCupo("documento", u.id))) return { ok: false, error: TEXTO_LIMITE };
  const ruc = String(entrada.ruc ?? "").replace(/\D/g, "");
  if (!rucValido(ruc)) return { ok: false, error: "El RUC no es válido. Revisa los 11 dígitos." };
  if (entrada.tipo !== "constancia_agencia" && entrada.tipo !== "tuc") return { ok: false, error: "Tipo de documento no válido." };
  if (!RUTA.test(entrada.ruta) || !entrada.ruta.startsWith(`${u.id}/`)) return { ok: false, error: "Archivo no válido." };
  const placa = entrada.tipo === "tuc" ? normalizarPlaca(String(entrada.placa ?? "")) : null;
  if (entrada.tipo === "tuc" && !placa) return { ok: false, error: "Indica una placa válida (ej.: ABC-123)." };

  const declarados: Declarados = {
    nombre_comercial: corto(entrada.nombre_comercial),
    telefono: corto(entrada.telefono),
    ...(placa ? { placa } : {}),
  };
  // Solo el servidor crea solicitudes (el operador no tiene INSERT por la API): así nadie se salta esta validación.
  const { data, error } = await supabaseAdmin()
    .from("submissions")
    .insert({ user_id: u.id, ruc, tipo_documento: entrada.tipo, archivo_path: entrada.ruta, datos_declarados: declarados })
    .select("id")
    .single();
  if (error) return { ok: false, error: "La solicitud no se pudo registrar. Intenta de nuevo." };

  try {
    await procesarSolicitud(data.id);
  } catch (e) {
    console.error("procesarSolicitud", data.id, e); // la solicitud queda pendiente; el admin la ve sin capas
  }
  return { ok: true };
}
