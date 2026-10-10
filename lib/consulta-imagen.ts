// Consulta por imagen: campos leídos → a quién corresponde → URL del dictamen con observaciones del anuncio.
// Prioridad de identificación (§5): RUC > placa > cuenta de redes / teléfono > nombre.
import { supabasePublico } from "@/lib/supabase/publico";
import { resolver, registrarConsulta, type Resolucion } from "@/lib/consultas";
import type { CamposConsulta } from "@/lib/vision";
import type { CodigoObs } from "@/config/textos";

const db = supabasePublico;
const conObs = (url: string, obs: CodigoObs[]) =>
  obs.length ? `${url}${url.includes("?") ? "&" : "?"}obs=${obs.join(",")}` : url;

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
    return conObs(`/prestador/${id}`, obs);
  };

  if (c.ruc) {
    const r = await resolver({ tipo: "ruc", valor: c.ruc });
    if (r.tipo === "prestador") return aPrestador(r.id, c.ruc);
    if (r.tipo === "candidatos") return conObs(`/consulta?q=${c.ruc}`, obs);
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
    const q = encodeURIComponent(c.nombre_comercial);
    return conObs(r.tipo === "candidatos" ? `/consulta?q=${q}` : `/consulta?q=${q}&nf=1`, obs);
  }
  const algo = c.ruc ?? c.placa ?? c.usuario_red ?? c.telefonos[0];
  return algo ? conObs(`/consulta?q=${encodeURIComponent(algo)}&nf=1`, obs) : null;
}
