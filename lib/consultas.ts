// Lecturas del flujo del turista. Todo pasa por RLS como anon.
import { supabasePublico } from "@/lib/supabase/publico";
import { REGLAS } from "@/config/reglas";
import type { Entrada } from "@/lib/normalizacion";
import { coincidenciaClara, dictamenPrestador } from "@/lib/dictamen";
import { DESTINOS, type Estado } from "@/config/textos";
import type { Tables } from "@/lib/database.types";
import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CANALES_CELULAR } from "@/lib/canales";

const db = supabasePublico;

// T se infiere de la unión éxito/error de supabase-js (no declarar `T | null` aquí: daría never).
function lista<T>(r: { data: T; error: unknown }): NonNullable<T> {
  if (r.error) throw r.error;
  return (r.data ?? []) as NonNullable<T>;
}

function uno<T>(r: { data: T; error: unknown }): T {
  if (r.error) throw r.error;
  return r.data;
}

export const fuentes = async () =>
  lista(await db().from("sources").select("id, nombre, url, fecha_corte").order("fecha_corte", { ascending: false }));

const rucStatus = async (ruc: string | null) =>
  ruc ? uno(await db().from("ruc_status").select("ruc, razon_social, estado, condicion").eq("ruc", ruc).maybeSingle()) : null;

export async function cargarPrestador(id: string) {
  const prestador = uno(await db().from("providers").select("*").eq("id", id).maybeSingle());
  if (!prestador) return null;
  // Todo lo verificable de la empresa (solo lo aprobado: RLS).
  const [autorizaciones, ruc, vehiculos, personal, canales, destinos, servicios] = await Promise.all([
    db().from("authorizations").select("tipo, entidad_emisora, numero, fecha_emision, fecha_vencimiento").eq("provider_id", id).then(lista),
    rucStatus(prestador.ruc),
    db().from("vehicles").select("id, placa, foto_url, modalidad, estado, soat_vencimiento, citv_vencimiento, habilitacion_vencimiento").eq("provider_id", id).order("placa").then(lista),
    db().from("personal").select("id, nombre, rol, dni_ultimos3, foto_url, carne_numero, carne_vence").eq("provider_id", id).order("nombre").then(lista),
    db().from("canales").select("id, tipo, visible").eq("provider_id", id).then(lista),
    db().from("empresa_destinos").select("destino").eq("provider_id", id).then(lista),
    db().from("services").select("id, nombre, categoria").eq("provider_id", id).eq("estado", "publicado").then(lista),
  ]);
  return { prestador, autorizaciones, ruc, vehiculos, personal, canales, destinos: destinos.map((d) => d.destino), servicios };
}

export type EmpresaCanal = { id: string; nombre: string; tipo: string; canales: string[] };

/** ¿A qué empresa pertenece este celular (WhatsApp/Yape/Plin/teléfono) o cuenta bancaria?
 *  Con service role: canales.valor no es legible por la API. Solo devuelve datos públicos. */
async function empresasPorCanal(entrada: { tipo: "celular" | "banco"; valor: string }): Promise<EmpresaCanal[]> {
  const admin = supabaseAdmin();
  const valor = entrada.tipo === "banco" ? createHash("sha256").update(entrada.valor).digest("hex") : entrada.valor;
  const tipos = entrada.tipo === "banco" ? ["banco"] : CANALES_CELULAR;
  const { data: cs } = await admin.from("canales").select("provider_id, tipo").eq("estado", "aprobado").eq("valor", valor).in("tipo", tipos);
  const porEmpresa = new Map<string, Set<string>>();
  for (const c of cs ?? []) porEmpresa.set(c.provider_id, (porEmpresa.get(c.provider_id) ?? new Set()).add(c.tipo));
  if (entrada.tipo === "celular") {
    // Teléfono registrado en el padrón (proveedores anteriores a la tabla de canales)
    const { data: legado } = await db().rpc("buscar_por_contacto", { usuario: "", telefono: entrada.valor });
    for (const l of legado ?? []) porEmpresa.set(l.id, (porEmpresa.get(l.id) ?? new Set()).add("telefono"));
  }
  if (!porEmpresa.size) return [];
  const { data: ps } = await db().from("providers").select("id, nombre_comercial, razon_social, tipo").in("id", [...porEmpresa.keys()]);
  return (ps ?? []).map((p) => ({ id: p.id, nombre: p.nombre_comercial ?? p.razon_social ?? "Empresa", tipo: p.tipo, canales: [...porEmpresa.get(p.id)!] }));
}

export async function cargarVehiculo(placa: string) {
  const vehiculo = uno(await db().from("vehicles").select("*").eq("placa", placa).maybeSingle());
  if (!vehiculo) return null;
  const prestador = uno(
    await db().from("providers").select("id, tipo, ruc, razon_social, nombre_comercial, telefono, validacion_vence").eq("id", vehiculo.provider_id).maybeSingle(),
  );
  if (!prestador) return null;
  const [ruc, canales] = await Promise.all([
    rucStatus(prestador.ruc),
    db().from("canales").select("id, tipo, visible").eq("provider_id", prestador.id).then(lista),
  ]);
  return { vehiculo, prestador, ruc, canales };
}

export type Resolucion =
  | { tipo: "prestador"; id: string }
  | { tipo: "vehiculo"; placa: string }
  | { tipo: "candidatos"; lista: Candidato[] }
  | { tipo: "canal"; canal: "celular" | "banco"; empresas: EmpresaCanal[] }
  | { tipo: "no_encontrado"; ruc: Awaited<ReturnType<typeof rucStatus>>; parecidos?: Candidato[] };
type Candidato = { id: string; nombre_comercial: string | null; razon_social: string | null; tipo: string; ruc: string | null };

/** Entrada del turista → qué mostrar. Varias coincidencias parecidas: elige el usuario. */
export async function resolver(entrada: Entrada): Promise<Resolucion> {
  if (entrada.tipo === "placa") {
    const v = uno(await db().from("vehicles").select("placa").eq("placa", entrada.valor).maybeSingle());
    return v ? { tipo: "vehiculo", placa: v.placa } : { tipo: "no_encontrado", ruc: null };
  }
  if (entrada.tipo === "celular" || entrada.tipo === "banco")
    return { tipo: "canal", canal: entrada.tipo, empresas: await empresasPorCanal(entrada) };
  if (entrada.tipo === "ruc") {
    const encontrados = lista(await db().from("providers").select("id, nombre_comercial, razon_social, tipo, ruc").eq("ruc", entrada.valor));
    if (encontrados.length === 1) return { tipo: "prestador", id: encontrados[0].id };
    if (encontrados.length > 1) return { tipo: "candidatos", lista: encontrados };
    return { tipo: "no_encontrado", ruc: await rucStatus(entrada.valor) };
  }
  const b = REGLAS.busqueda;
  const candidatos = lista(
    await db().rpc("buscar_prestadores", { q: entrada.valor, umbral: b.umbralSimilitud, limite: b.maxCandidatos }),
  );
  if (coincidenciaClara(candidatos.map((c) => c.similitud))) return { tipo: "prestador", id: candidatos[0].id };
  if (candidatos.length) return { tipo: "candidatos", lista: candidatos };
  // Nada parecido al umbral normal: sugerencias más lejanas ("¿quizás buscabas…?", posible suplantación)
  const parecidos = lista(await db().rpc("buscar_prestadores", { q: entrada.valor, umbral: b.umbralSugerencia, limite: b.maxCandidatos }));
  return { tipo: "no_encontrado", ruc: null, parecidos };
}

/** Registro anónimo de la consulta (sin datos del turista). Nunca rompe la respuesta. */
export async function registrarConsulta(entrada: Entrada, r: Resolucion, estado?: string, tipoEntrada?: "logo" | "red_social" | "qr", destino?: string) {
  const { error } = await db().from("lookups").insert({
    tipo_entrada: tipoEntrada ?? entrada.tipo,
    // Cuenta bancaria: nunca completa en el registro.
    entrada_normalizada: entrada.tipo === "banco" ? `•••• ${entrada.valor.slice(-4)}` : entrada.valor.slice(0, 120),
    destino: destino ?? null,
    provider_id: r.tipo === "prestador" ? r.id : null,
    estado_resultado: estado ?? (r.tipo === "canal" && !r.empresas.length ? "no_encontrado" : r.tipo),
  });
  if (error) console.error("lookups:", error.message);
}

/** Fecha de hoy en Perú, AAAA-MM-DD. */
export const hoyLima = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });

/** ¿De qué es este id de QR? Empresa, vehículo o persona (solo lo aprobado y público). */
export async function resolverQr(id: string): Promise<string | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [p, v, x] = await Promise.all([
    db().from("providers").select("id").eq("id", id).maybeSingle(),
    db().from("vehicles").select("placa").eq("id", id).maybeSingle(),
    db().from("personal").select("id").eq("id", id).maybeSingle(),
  ]);
  if (p.data) return `/prestador/${id}`;
  if (v.data) return `/vehiculo/${v.data.placa}`;
  if (x.data) return `/persona/${id}`;
  return null;
}

export async function cargarPersona(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const persona = uno(await db().from("personal").select("id, provider_id, nombre, rol, dni_ultimos3, foto_url, carne_numero, carne_vence").eq("id", id).maybeSingle());
  if (!persona) return null;
  const empresa = await cargarPrestador(persona.provider_id);
  return empresa ? { persona, ...empresa } : null;
}

export type EmpresaDirectorio = { id: string; nombre: string; tipo: string; lugar: string | null; estado: Estado; servicios: string[]; whatsapp: string | null };

/** Directorio por destino: empresas que DECLARARON atenderlo, con estado publicable (no "alerta" ni validación caducada). */
export async function empresasPorDestino(destino: string, tipo?: string): Promise<EmpresaDirectorio[]> {
  const ids = lista(await db().from("empresa_destinos").select("provider_id").eq("destino", destino)).map((d) => d.provider_id);
  if (!ids.length) return [];
  let q = db().from("providers").select("*").in("id", ids);
  if (tipo) q = q.eq("tipo", tipo);
  return armarDirectorio(lista(await q));
}

const sinTildes = (t: string | null) => (t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
/** "LOS ORGANOS" (padrón en mayúsculas) → "Los Organos"; lo demás queda igual. */
const legible = (t: string | null) => (t && t === t.toUpperCase() ? t.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : t);
const PROVINCIAS = ["piura", "sullana", "talara", "paita", "sechura", "morropon", "ayabaca", "huancabamba"];

/**
 * Empresas registradas con local en los distritos del destino que NO declararon destinos en CheckTur
 * (p. ej. las cargadas del Directorio MINCETUR). Pueden atenderlo aunque no lo hayan declarado.
 */
export async function empresasDeLaZona(destino: string, tipo?: string): Promise<EmpresaDirectorio[]> {
  const d = DESTINOS.find((x) => x.id === destino);
  if (!d) return [];
  const zona: readonly string[] = d.distritos;
  const conDestinos = new Set(lista(await db().from("empresa_destinos").select("provider_id")).map((x) => x.provider_id));
  let q = db().from("providers").select("id, distrito, provincia").limit(2000);
  if (tipo) q = q.eq("tipo", tipo);
  const candidatos = lista(await q).filter((p) => {
    if (conDestinos.has(p.id)) return false;
    const prov = sinTildes(p.provincia);
    // La provincia solo cuenta si no es una provincia (filas del padrón con columnas corridas, p. ej. "MANCORA").
    return zona.includes(sinTildes(p.distrito)) || (!PROVINCIAS.includes(prov) && zona.includes(prov));
  });
  if (!candidatos.length) return [];
  return armarDirectorio(lista(await db().from("providers").select("*").in("id", candidatos.map((p) => p.id))));
}

/** Estado (reusa dictamenPrestador), servicios y WhatsApp oficial de cada empresa; solo las publicables. */
async function armarDirectorio(ps: Tables<"providers">[]): Promise<EmpresaDirectorio[]> {
  if (!ps.length) return [];
  const ids = ps.map((p) => p.id);
  const rucs = ps.map((p) => p.ruc).filter((r): r is string => !!r);
  const [auts, rucsEst, vehs, pers, cans, servs] = await Promise.all([
    db().from("authorizations").select("provider_id, tipo, fecha_vencimiento").in("provider_id", ids).then(lista),
    rucs.length ? db().from("ruc_status").select("ruc, estado, condicion").in("ruc", rucs).then(lista) : Promise.resolve([]),
    db().from("vehicles").select("provider_id, placa, soat_vencimiento, citv_vencimiento").in("provider_id", ids).then(lista),
    db().from("personal").select("provider_id, nombre, carne_vence").in("provider_id", ids).then(lista),
    db().from("canales").select("provider_id, tipo, visible").in("provider_id", ids).eq("tipo", "whatsapp").then(lista),
    db().from("services").select("provider_id, nombre").in("provider_id", ids).eq("estado", "publicado").then(lista),
  ]);
  const hoy = hoyLima();
  const de = <T extends { provider_id: string }>(xs: T[], id: string) => xs.filter((x) => x.provider_id === id);
  return ps
    .map((p) => {
      const { estado } = dictamenPrestador(p, de(auts, p.id), rucsEst.find((r) => r.ruc === p.ruc) ?? null, hoy, { vehiculos: de(vehs, p.id), personal: de(pers, p.id) });
      const tel = p.telefono?.replace(/\D/g, "").slice(-9);
      return {
        id: p.id, nombre: p.nombre_comercial ?? p.razon_social ?? "Empresa", tipo: p.tipo, lugar: legible(p.distrito ?? p.provincia), estado,
        servicios: de(servs, p.id).map((s) => s.nombre.replace(/\s*\(muestra\)/i, "")),
        whatsapp: de(cans, p.id)[0]?.visible.replace(/\D/g, "") ?? (tel && /^9\d{8}$/.test(tel) ? tel : null),
      };
    })
    .filter((e) => e.estado === "verificado" || e.estado === "observaciones" || e.estado === "actualizacion")
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

/** Cuántas empresas declararon cada destino (para el selector del directorio). */
export async function conteoPorDestino(): Promise<Record<string, number>> {
  const filas = lista(await db().from("empresa_destinos").select("destino"));
  return filas.reduce<Record<string, number>>((m, d) => ({ ...m, [d.destino]: (m[d.destino] ?? 0) + 1 }), {});
}
