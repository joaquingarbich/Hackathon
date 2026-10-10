// Lecturas del catálogo (web cliente). docs/CATALOGO.md
// Regla: solo se listan servicios de proveedores registrados y con dictamen publicable (no "alerta" ni validación caducada).
// Mientras la tabla `services` no exista en la BD (migración pendiente), devuelve { disponible: false }
// y las páginas muestran los proveedores registrados como respaldo.
import { connection } from "next/server";
import { supabasePublico } from "@/lib/supabase/publico";
import { dictamenPrestador } from "@/lib/dictamen";
import { hoyLima } from "@/lib/consultas";
import { REGLAS } from "@/config/reglas";
import { CATEGORIAS, type Categoria, type Estado } from "@/config/textos";
import type { Tables } from "@/lib/database.types";

const db = supabasePublico;
const PUBLICABLES: Estado[] = ["verificado", "observaciones", "actualizacion"];

export type Proveedor = {
  id: string;
  nombre: string;
  tipo: string;
  lugar: string | null;
  telefono: string | null;
  estado: Estado;
  valoracion: Valoracion;
};
export type Valoracion = { promedio: number | null; n: number };
export type TarjetaServicio = Pick<
  Tables<"services">,
  "id" | "nombre" | "categoria" | "destino" | "duracion" | "precio_ref" | "unidad_precio" | "ilustracion"
> & { proveedor: Proveedor };
export type Servicio = Tables<"services"> & { proveedor: Proveedor };

type Filtro = { categoria?: Categoria; destino?: string; q?: string; orden?: "valoradas" | "precio"; limite?: number };

/** ¿El error es "la tabla services aún no existe"? (PostgREST: PGRST205; Postgres: 42P01) */
const faltaTabla = (e: { code?: string } | null) => !!e && (e.code === "PGRST205" || e.code === "42P01");

/** Texto libre seguro para el filtro `or` de PostgREST (sin comas, paréntesis ni comodines). */
const limpiar = (q: string) => q.replace(/[,()%*\\:"'.]/g, " ").trim().slice(0, 60);

/** Proveedores por id (o por tipo, si ids es null) con su estado de dictamen y valoración, ya filtrados a publicables. */
async function proveedores(ids: string[] | null, tipos?: readonly string[]): Promise<Map<string, Proveedor>> {
  await connection(); // hoyLima() usa la fecha actual
  let q = db()
    .from("providers")
    .select("id, tipo, ruc, clases, actividades, estado_inscripcion, validacion_vence, nombre_comercial, razon_social, distrito, provincia, telefono")
    .limit(200);
  if (ids) q = q.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  if (tipos) q = q.in("tipo", [...tipos]);
  const { data: lista, error } = await q;
  if (error) throw error;
  const idsP = lista.map((p) => p.id);
  const rucs = lista.map((p) => p.ruc).filter((r): r is string => !!r);
  const [auts, rucsEstado, resenas] = await Promise.all([
    db().from("authorizations").select("provider_id, tipo, fecha_vencimiento").in("provider_id", idsP),
    rucs.length ? db().from("ruc_status").select("ruc, estado, condicion").in("ruc", rucs) : Promise.resolve({ data: [], error: null }),
    db().from("reviews").select("provider_id, estrellas").in("provider_id", idsP),
  ]);
  const hoy = hoyLima();
  const mapa = new Map<string, Proveedor>();
  for (const p of lista) {
    const ruc = rucsEstado.data?.find((r) => r.ruc === p.ruc) ?? null;
    const { estado } = dictamenPrestador(p, (auts.data ?? []).filter((a) => a.provider_id === p.id), ruc, hoy);
    if (!PUBLICABLES.includes(estado)) continue;
    const propias = (resenas.data ?? []).filter((r) => r.provider_id === p.id);
    const n = propias.length;
    mapa.set(p.id, {
      id: p.id,
      nombre: p.nombre_comercial ?? p.razon_social ?? "Proveedor",
      tipo: p.tipo,
      lugar: p.distrito ?? p.provincia,
      telefono: p.telefono,
      estado,
      valoracion: { n, promedio: n >= REGLAS.minimoResenasParaPromedio ? propias.reduce((a, r) => a + r.estrellas, 0) / n : null },
    });
  }
  return mapa;
}

const ordenar = <T extends { precio_ref: number | null; proveedor: Proveedor }>(lista: T[], orden: Filtro["orden"]) =>
  lista.sort((a, b) =>
    orden === "precio"
      ? (a.precio_ref ?? Infinity) - (b.precio_ref ?? Infinity)
      : (b.proveedor.valoracion.promedio ?? 0) - (a.proveedor.valoracion.promedio ?? 0) || b.proveedor.valoracion.n - a.proveedor.valoracion.n,
  );

export async function listarServicios(f: Filtro = {}): Promise<
  { disponible: true; servicios: TarjetaServicio[] } | { disponible: false; proveedores: Proveedor[] }
> {
  await connection(); // datos en vivo: nunca en el prerender
  let q = db()
    .from("services")
    .select("id, nombre, categoria, destino, duracion, precio_ref, unidad_precio, ilustracion, provider_id")
    .eq("estado", "publicado")
    .limit(f.limite ?? 60);
  if (f.categoria) q = q.eq("categoria", f.categoria);
  if (f.destino) q = q.eq("destino", f.destino);
  const texto = f.q ? limpiar(f.q) : "";
  if (texto) q = q.or(`nombre.ilike.*${texto}*,descripcion.ilike.*${texto}*`);
  const { data, error } = await q;

  if (faltaTabla(error)) {
    const tipos = CATEGORIAS.find((c) => c.id === f.categoria)?.tipos;
    const mapa = await proveedores(null, tipos);
    return { disponible: false, proveedores: [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")) };
  }
  if (error) throw error;

  const mapa = await proveedores([...new Set(data.map((s) => s.provider_id))]);
  const servicios = data.flatMap(({ provider_id, ...s }) => {
    const proveedor = mapa.get(provider_id);
    return proveedor ? [{ ...s, proveedor }] : [];
  });
  return { disponible: true, servicios: ordenar(servicios, f.orden) };
}

/** Ficha completa. null si no existe, no está publicada, la tabla falta o el proveedor no es publicable. */
export async function cargarServicio(id: string): Promise<Servicio | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  await connection();
  const { data, error } = await db().from("services").select("*").eq("id", id).eq("estado", "publicado").maybeSingle();
  if (faltaTabla(error) || !data) return null;
  if (error) throw error;
  const proveedor = (await proveedores([data.provider_id])).get(data.provider_id);
  return proveedor ? { ...data, proveedor } : null;
}

/** Servicios publicados de un proveedor (sección en su dictamen). [] si la tabla falta. */
export async function serviciosDeProveedor(providerId: string) {
  await connection();
  const { data, error } = await db()
    .from("services")
    .select("id, nombre, categoria, destino, duracion, precio_ref, unidad_precio, ilustracion")
    .eq("provider_id", providerId)
    .eq("estado", "publicado")
    .order("nombre");
  if (faltaTabla(error)) return [];
  if (error) throw error;
  return data;
}

/** Cantidad de servicios publicados por destino (portada). Vacío si la tabla falta. */
export async function conteoPorDestino(): Promise<Record<string, number>> {
  await connection();
  const { data, error } = await db().from("services").select("destino").eq("estado", "publicado").limit(1000);
  if (faltaTabla(error)) return {};
  if (error) throw error;
  return data.reduce<Record<string, number>>((a, s) => ({ ...a, [s.destino]: (a[s.destino] ?? 0) + 1 }), {});
}
