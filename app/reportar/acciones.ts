"use server";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hayCupo } from "@/lib/limite";
import { DESTINOS, TEXTO_LIMITE } from "@/config/textos";

export type ResultadoReporte = { ok: true } | { ok: false; error: string };

export async function enviarReporte(f: FormData): Promise<ResultadoReporte> {
  const quePaso = [String(f.get("motivo") ?? ""), String(f.get("detalle") ?? "")].map((x) => x.trim()).filter(Boolean).join(". ").slice(0, 1000);
  const dato = String(f.get("dato") ?? "").trim().slice(0, 120) || null;
  const p = String(f.get("p") ?? "");
  const destino = String(f.get("destino") ?? "");
  const foto = f.get("foto");
  if (quePaso.length < 5) return { ok: false, error: "Cuéntanos qué pasó." };
  if (!(await hayCupo("reporte"))) return { ok: false, error: TEXTO_LIMITE };

  const db = supabaseAdmin();
  let foto_path: string | null = null;
  if (foto instanceof File && foto.size) {
    if (!foto.type.startsWith("image/") || foto.size > 1.5 * 1024 * 1024) return { ok: false, error: "La foto no es válida." };
    foto_path = `reportes/${randomUUID()}.jpg`; // bucket privado: solo el admin la ve
    const up = await db.storage.from("documentos").upload(foto_path, new Uint8Array(await foto.arrayBuffer()), { contentType: foto.type });
    if (up.error) foto_path = null;
  }
  const { error } = await db.from("reportes").insert({
    que_paso: quePaso, dato,
    provider_id: /^[0-9a-f-]{36}$/i.test(p) ? p : null,
    destino: DESTINOS.some((d) => d.id === destino) ? destino : null,
    foto_path,
  });
  return error ? { ok: false, error: "No se pudo enviar. Intenta de nuevo." } : { ok: true };
}
