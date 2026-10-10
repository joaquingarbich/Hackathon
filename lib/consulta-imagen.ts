// Consulta por imagen: campos leídos → a quién corresponde → URL del dictamen con observaciones del anuncio.
// Prioridad de identificación (§5): RUC > placa > cuenta de redes / teléfono > nombre.
import { supabasePublico } from "@/lib/supabase/publico";
import { resolver, registrarConsulta, type Resolucion } from "@/lib/consultas";
import type { CamposConsulta } from "@/lib/vision";
import type { CodigoObs } from "@/config/textos";
import { firmar } from "@/lib/firma";

const db = supabasePublico;
// Los parámetros que alteran el dictamen van firmados (ver lib/firma.ts y las páginas que los leen).
const aPrestadorUrl = (id: string, obs: CodigoObs[]) =>
  obs.length ? `/prestador/${id}?obs=${obs.join(",")}&f=${firmar(`prestador:${id}:${obs.join(",")}`)}` : `/prestador/${id}`;
const aConsultaUrl = (q: string, obs: CodigoObs[], noEncontrado: boolean) => {
  const nf = noEncontrado ? "1" : "";
  if (!obs.length && !nf) return `/consulta?q=${encodeURIComponent(q)}`;
  return `/consulta?q=${encodeURIComponent(q)}${nf && "&nf=1"}${obs.length ? `&obs=${obs.join(",")}` : ""}&f=${firmar(`consulta:${q}:${nf}:${obs.join(",")}`)}`;
};

/** ¿El anuncio contradice lo registrado? (posible suplantación de un prestador formal) */
async function datosDistintos(id: string, c: CamposConsulta) {
  const { data: p } = await db().from("providers").select("ruc, telefono, redes").eq("id", id).maybeSingle();
  if (!p) return false;
  const tel = p.telefono?.replace(/\D/g, "").slice(-9);
  const redes = JSON.stringify(p.redes ?? {}).toLowerCase();
  return (
    (!!c.ruc && !!p.ruc && c.ruc !== p.ruc) ||
    (!!tel && c.telefonos.length > 0 && !c.telefonos.some((t) => t.slice(-9) === tel)) ||
    (!!c.usuario_red && redes !== "{}" && !redes.includes(c.usuario_red))
  );
}

export async function urlParaImagen(c: CamposConsulta): Promise<string | null> {
  const obs: CodigoObs[] = c.tipo_imagen === "red_social" && !c.muestra_ruc_o_constancia ? ["sin_ruc"] : [];
  const tipoEntrada = c.tipo_imagen === "red_social" ? "red_social" : "logo";
  const registrar = (r: Resolucion, valor: string) =>
    registrarConsulta({ tipo: "nombre", valor }, r, r.tipo, tipoEntrada);

  const aPrestador = async (id: string, valor: string) => {
    if (await datosDistintos(id, c)) obs.push("datos_distintos");
    await registrar({ tipo: "prestador", id }, valor);
    return aPrestadorUrl(id, obs);
  };

  if (c.ruc) {
    const r = await resolver({ tipo: "ruc", valor: c.ruc });
    if (r.tipo === "prestador") return aPrestador(r.id, c.ruc);
    if (r.tipo === "candidatos") return aConsultaUrl(c.ruc, obs, false);
  }
  if (c.placa) {
    const r = await resolver({ tipo: "placa", valor: c.placa });
    if (r.tipo === "vehiculo") { await registrar(r, c.placa); return `/vehiculo/${r.placa}`; }
  }
  if (c.usuario_red || c.telefonos.length) {
    const { data } = await db().rpc("buscar_por_contacto", { usuario: c.usuario_red ?? "", telefono: c.telefonos[0] ?? "" });
    if (data?.length === 1) return aPrestador(data[0].id, c.usuario_red ?? c.telefonos[0]);
  }
  if (c.nombre_comercial) {
    const r = await resolver({ tipo: "nombre", valor: c.nombre_comercial });
    if (r.tipo === "prestador") return aPrestador(r.id, c.nombre_comercial);
    await registrar(r, c.nombre_comercial);
    return aConsultaUrl(c.nombre_comercial, obs, r.tipo !== "candidatos");
  }
  const algo = c.ruc ?? c.placa ?? c.usuario_red ?? c.telefonos[0];
  return algo ? aConsultaUrl(algo, obs, true) : null;
}
