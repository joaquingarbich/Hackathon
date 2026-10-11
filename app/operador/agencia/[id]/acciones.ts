"use server";
import { redirect } from "next/navigation";
import { exigirDueno } from "@/lib/agencia";
import { validarPerfil, validarServicio, type Campos } from "@/lib/agencia-validar";
import type { Json } from "@/lib/database.types";
import { createHash } from "node:crypto";
import { DESTINOS } from "@/config/textos";
import { normalizarCanal, TIPOS_CANAL, type TipoCanal } from "@/lib/canales";
import { normalizarPlaca } from "@/lib/normalizacion";

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

// ---------- registro de lo verificable: destinos, canales, vehículos, personal ----------
// Destinos: se aplican directo (no son sensibles). Canales, vehículos y personal: entran "pendiente"
// y el admin los aprueba (un Yape "registrado" es la señal de confianza del producto).

export type Resultado = { ok: true } | { ok: false; error: string };
const fallo = (error: string): Resultado => ({ ok: false, error });
const MAX_FOTO = 1.5 * 1024 * 1024;

async function subirFoto(db: Awaited<ReturnType<typeof exigirDueno>>["db"], providerId: string, f: FormData): Promise<string | null | "error"> {
  const foto = f.get("foto");
  if (!(foto instanceof File) || !foto.size) return null;
  if (!foto.type.startsWith("image/") || foto.size > MAX_FOTO) return "error";
  const ruta = `${providerId}/${crypto.randomUUID()}.jpg`;
  const up = await db.storage.from("fotos").upload(ruta, new Uint8Array(await foto.arrayBuffer()), { contentType: foto.type });
  return up.error ? "error" : db.storage.from("fotos").getPublicUrl(ruta).data.publicUrl;
}

const fecha = (f: FormData, k: string) => { const v = String(f.get(k) ?? ""); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null; };

export async function guardarDestinos(providerId: string, f: FormData) {
  const { db } = await exigirDueno(providerId);
  const elegidos = f.getAll("destino").map(String).filter((d) => DESTINOS.some((x) => x.id === d));
  await db.from("empresa_destinos").delete().eq("provider_id", providerId);
  if (elegidos.length) await db.from("empresa_destinos").insert(elegidos.map((destino) => ({ provider_id: providerId, destino })));
  redirect(`/operador/agencia/${providerId}?ok=destinos#destinos`);
}

export async function crearCanal(providerId: string, f: FormData): Promise<Resultado> {
  const { db } = await exigirDueno(providerId);
  const tipo = String(f.get("tipo") ?? "") as TipoCanal;
  if (!TIPOS_CANAL.includes(tipo)) return fallo("Elige el tipo de canal.");
  const n = normalizarCanal(tipo, String(f.get("valor") ?? ""), (s) => createHash("sha256").update(s).digest("hex"), String(f.get("etiqueta") ?? ""));
  if ("error" in n) return fallo(n.error);
  // ¿Ya está aprobado para OTRA empresa? (un número/cuenta no puede ser de dos)
  const { data: ajeno } = await db.from("canales").select("provider_id").eq("tipo", tipo).eq("valor", n.valor).eq("estado", "aprobado").neq("provider_id", providerId).limit(1);
  if (ajeno?.length) return fallo("Ese número o cuenta ya figura registrado por otra empresa. Si es tuyo, escribe al revisor.");
  const { error } = await db.from("canales").insert({ provider_id: providerId, tipo, valor: n.valor, visible: n.visible });
  return error ? fallo("No se pudo guardar. Intenta de nuevo.") : { ok: true };
}

export async function crearVehiculo(providerId: string, f: FormData): Promise<Resultado> {
  const { db, proveedor } = await exigirDueno(providerId);
  const placa = normalizarPlaca(String(f.get("placa") ?? ""));
  if (!placa) return fallo("Placa no válida (formato ABC-123).");
  const soat = fecha(f, "soat_vencimiento"), citv = fecha(f, "citv_vencimiento"), hab = fecha(f, "habilitacion_vencimiento");
  if (!soat || !citv) return fallo("Indica las fechas de vencimiento del SOAT y de la revisión técnica.");
  const foto = await subirFoto(db, providerId, f);
  if (foto === "error") return fallo("La foto no es válida (máx. 1,5 MB).");
  const { error } = await db.from("vehicles").insert({
    provider_id: providerId, placa, modalidad: "turistico", estado: "habilitado", aprobacion: "pendiente",
    autorizacion_mtc: String(f.get("autorizacion_mtc") ?? "").trim().slice(0, 60) || null,
    tuc_numero: String(f.get("tuc_numero") ?? "").trim().slice(0, 40) || null,
    soat_vencimiento: soat, citv_vencimiento: citv, habilitacion_vencimiento: hab,
    foto_url: foto, es_muestra: proveedor.es_muestra, source_id: "checktur_validacion",
  });
  if (error?.code === "23505") return fallo("Esa placa ya está registrada. Si la unidad es tuya, escribe al revisor.");
  return error ? fallo("No se pudo guardar. Intenta de nuevo.") : { ok: true };
}

export async function crearPersonal(providerId: string, f: FormData): Promise<Resultado> {
  const { db } = await exigirDueno(providerId);
  const nombre = String(f.get("nombre") ?? "").trim().slice(0, 80);
  const rol = String(f.get("rol") ?? "");
  const dni3 = String(f.get("dni_ultimos3") ?? "").replace(/\D/g, "");
  if (nombre.length < 3) return fallo("Escribe el nombre completo.");
  if (!["guia", "conductor", "vendedor", "otro"].includes(rol)) return fallo("Elige el rol.");
  if (!/^\d{3}$/.test(dni3)) return fallo("Escribe solo los 3 últimos dígitos del DNI.");
  const foto = await subirFoto(db, providerId, f);
  if (foto === "error") return fallo("La foto no es válida (máx. 1,5 MB).");
  const { error } = await db.from("personal").insert({
    provider_id: providerId, nombre, rol, dni_ultimos3: dni3, foto_url: foto,
    carne_numero: String(f.get("carne_numero") ?? "").trim().slice(0, 30) || null, carne_vence: fecha(f, "carne_vence"),
  });
  return error ? fallo("No se pudo guardar. Intenta de nuevo.") : { ok: true };
}

const TABLAS_RETIRABLES = { canales: "canales", vehiculos: "vehicles", personal: "personal" } as const;

export async function retirar(providerId: string, que: keyof typeof TABLAS_RETIRABLES, id: string) {
  const { db } = await exigirDueno(providerId);
  await db.from(TABLAS_RETIRABLES[que]).delete().eq("id", id).eq("provider_id", providerId);
  redirect(`/operador/agencia/${providerId}#${que}`);
}
