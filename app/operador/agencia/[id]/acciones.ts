"use server";
import { redirect } from "next/navigation";
import { exigirDueno } from "@/lib/agencia";
import { validarPerfil, validarServicio, type Campos } from "@/lib/agencia-validar";
import type { Json } from "@/lib/database.types";

const campos = (f: FormData): Campos => {
  const c: Campos = {};
  for (const k of new Set(f.keys())) { const v = f.getAll(k).map(String); c[k] = v.length > 1 ? v : v[0]; }
  return c;
};

/** El cambio de perfil NO se aplica: queda pendiente para el admin. */
export async function proponerPerfil(providerId: string, f: FormData) {
  const { u, db } = await exigirDueno(providerId);
  const r = validarPerfil(campos(f));
  const volver = `/operador/agencia/${providerId}`;
  if (!r.ok) redirect(`${volver}?error=${encodeURIComponent(r.error)}#perfil`);
  // Un solo cambio pendiente por proveedor: el nuevo reemplaza al anterior.
  await db.from("proveedor_cambios").delete().eq("provider_id", providerId).eq("estado", "pendiente");
  const { error } = await db.from("proveedor_cambios").insert({ provider_id: providerId, user_id: u.id, datos: r.datos as unknown as Json });
  if (error) redirect(`${volver}?error=${encodeURIComponent("No se pudo enviar. Intenta de nuevo.")}#perfil`);
  redirect(`${volver}?ok=perfil#perfil`);
}

export type ResultadoServicio = { ok: true } | { ok: false; error: string };

/** Alta de servicio: entra como «pendiente»; solo el admin lo publica. */
export async function crearServicio(providerId: string, f: FormData): Promise<ResultadoServicio> {
  const { proveedor, db } = await exigirDueno(providerId);
  const r = validarServicio(campos(f), proveedor.tipo);
  if (!r.ok) return r;
  const { error } = await db.from("services").insert({
    ...r.datos, provider_id: providerId, estado: "pendiente", es_muestra: proveedor.es_muestra, itinerario: r.datos.itinerario as unknown as Json,
  });
  return error ? { ok: false, error: "No se pudo guardar el servicio. Intenta de nuevo." } : { ok: true };
}

/** La agencia puede retirar un servicio suyo (pendiente, publicado o rechazado). */
export async function retirarServicio(providerId: string, servicioId: string) {
  const { db } = await exigirDueno(providerId);
  await db.from("services").delete().eq("id", servicioId).eq("provider_id", providerId);
  redirect(`/operador/agencia/${providerId}#servicios`);
}
