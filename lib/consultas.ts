// Lecturas del flujo del turista. Todo pasa por RLS como anon.
import { supabasePublico } from "@/lib/supabase/publico";
import { REGLAS } from "@/config/reglas";
import type { Entrada } from "@/lib/normalizacion";
import { coincidenciaClara } from "@/lib/dictamen";

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
  const [autorizaciones, ruc] = await Promise.all([
    db().from("authorizations").select("tipo, entidad_emisora, numero, fecha_emision, fecha_vencimiento").eq("provider_id", id).then(lista),
    rucStatus(prestador.ruc),
  ]);
  return { prestador, autorizaciones, ruc };
}

export async function cargarVehiculo(placa: string) {
  const vehiculo = uno(await db().from("vehicles").select("*").eq("placa", placa).maybeSingle());
  if (!vehiculo) return null;
  const prestador = uno(
    await db().from("providers").select("id, tipo, ruc, razon_social, nombre_comercial, telefono").eq("id", vehiculo.provider_id).maybeSingle(),
  );
  if (!prestador) return null;
  return { vehiculo, prestador, ruc: await rucStatus(prestador.ruc) };
}

export type Resolucion =
  | { tipo: "prestador"; id: string }
  | { tipo: "vehiculo"; placa: string }
  | { tipo: "candidatos"; lista: { id: string; nombre_comercial: string | null; razon_social: string | null; tipo: string; ruc: string | null }[] }
  | { tipo: "no_encontrado"; ruc: Awaited<ReturnType<typeof rucStatus>> };

/** Entrada del turista → qué mostrar. Varias coincidencias parecidas: elige el usuario. */
export async function resolver(entrada: Entrada): Promise<Resolucion> {
  if (entrada.tipo === "placa") {
    const v = uno(await db().from("vehicles").select("placa").eq("placa", entrada.valor).maybeSingle());
    return v ? { tipo: "vehiculo", placa: v.placa } : { tipo: "no_encontrado", ruc: null };
  }
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
  return candidatos.length ? { tipo: "candidatos", lista: candidatos } : { tipo: "no_encontrado", ruc: null };
}

/** Registro anónimo de la consulta (sin datos del turista). Nunca rompe la respuesta. */
export async function registrarConsulta(entrada: Entrada, r: Resolucion, estado?: string) {
  const { error } = await db().from("lookups").insert({
    tipo_entrada: entrada.tipo,
    entrada_normalizada: entrada.valor.slice(0, 120),
    provider_id: r.tipo === "prestador" ? r.id : null,
    estado_resultado: estado ?? r.tipo,
  });
  if (error) console.error("lookups:", error.message);
}

/** Fecha de hoy en Perú, AAAA-MM-DD. */
export const hoyLima = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
