"use server";
import { createHash, randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { extraerComprobante } from "@/lib/vision";
import { verificarComprobante } from "@/lib/resenas";
import { hoyLima } from "@/lib/consultas";
import { SERVICIOS, TEXTO_RESENA } from "@/config/textos";
import { REGLAS } from "@/config/reglas";
import type { Json } from "@/lib/database.types";

const MAX = 1.5 * 1024 * 1024;
const texto = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);

export type Resultado = { ok: true } | { ok: false; error: string };

export async function enviarResena(f: FormData): Promise<Resultado> {
  // ---- validación de entrada (no confiar en el formulario) ----
  const providerId = texto(f, "provider_id", 36);
  const estrellas = Number(f.get("estrellas"));
  const comentario = texto(f, "comentario", REGLAS.maxLargoResena);
  const servicio = texto(f, "servicio", 60);
  const fechaServicio = texto(f, "fecha_servicio", 10);
  const nombre = texto(f, "nombre", 80);
  const correo = texto(f, "correo", 120);
  const celular = texto(f, "celular", 20).replace(/\D/g, "").slice(-9);
  const alias = texto(f, "alias", 40);
  const img = f.get("comprobante");
  const hoy = hoyLima();

  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) return { ok: false, error: "Elige de 1 a 5 estrellas." };
  if (!SERVICIOS.includes(servicio as never)) return { ok: false, error: "Elige el servicio que contrataste." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaServicio) || fechaServicio > hoy) return { ok: false, error: "Indica una fecha de servicio válida (no futura)." };
  if (nombre.length < 2) return { ok: false, error: "Escribe tu nombre completo." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return { ok: false, error: "Escribe un correo válido." };
  if (!/^9\d{8}$/.test(celular)) return { ok: false, error: "Escribe un celular peruano de 9 dígitos." };
  if (f.get("consentimiento") !== "si") return { ok: false, error: "Debes aceptar el tratamiento de tus datos para verificar la opinión." };
  if (!(img instanceof File) || !img.type.startsWith("image/") || img.size > MAX) return { ok: false, error: "Adjunta una foto del comprobante." };

  const db = supabaseAdmin();
  const { data: p } = await db.from("providers").select("id, ruc").eq("id", providerId).maybeSingle();
  if (!p) return { ok: false, error: TEXTO_RESENA.error };
  if (!p.ruc) return { ok: false, error: TEXTO_RESENA.sinRuc };

  // ---- comprobante: leído por Gemini y cruzado con el RUC del prestador ----
  const bytes = new Uint8Array(await img.arrayBuffer());
  // ponytail: sin límite de frecuencia por IP; añadir si se abusa (cada envío consume cuota de Gemini).
  let campos;
  try {
    campos = await extraerComprobante(bytes, img.type);
  } catch (e) {
    console.error("extraerComprobante", e);
    return { ok: false, error: TEXTO_RESENA.error };
  }
  const v = verificarComprobante(campos, p.ruc, fechaServicio, hoy);
  if (!v.aceptado) return { ok: false, error: v.motivo };

  // ---- guardar: archivo privado, reseña pendiente, contacto aparte ----
  const ruta = `resenas/${randomUUID()}.jpg`;
  const up = await db.storage.from("documentos").upload(ruta, bytes, { contentType: img.type });
  if (up.error) return { ok: false, error: TEXTO_RESENA.error };

  const { data: r, error } = await db
    .from("reviews")
    .insert({
      provider_id: p.id,
      estrellas,
      comentario: comentario || null,
      alias: alias || null,
      servicio,
      fecha_servicio: fechaServicio,
      device_hash: createHash("sha256").update(bytes).digest("hex"), // mismo archivo, misma reseña (unique por prestador)
      comprobante_path: ruta,
      comprobante_ruc: campos.ruc_emisor,
      comprobante_serie: campos.serie_numero,
      comprobante_fecha: campos.fecha_emision,
      verificado: true,
      verificacion: { comprobante: campos, chequeos: v.chequeos } as unknown as Json,
      estado: "pendiente",
    })
    .select("id")
    .single();
  if (error) {
    await db.storage.from("documentos").remove([ruta]);
    return { ok: false, error: error.code === "23505" ? TEXTO_RESENA.comprobanteUsado : TEXTO_RESENA.error };
  }
  const c = await db.from("review_contactos").insert({ review_id: r.id, nombre, correo, celular });
  if (c.error) {
    await db.from("reviews").delete().eq("id", r.id); // sin contacto no hay verificación posible
    await db.storage.from("documentos").remove([ruta]);
    return { ok: false, error: TEXTO_RESENA.error };
  }
  return { ok: true };
}

/** Cualquiera puede reportar; la reseña sigue visible hasta que el admin decida (reportar no basta para ocultar). */
export async function reportarResena(id: string): Promise<void> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  await supabaseAdmin().from("reviews").update({ estado: "reportada" }).eq("id", id).eq("estado", "visible");
}
