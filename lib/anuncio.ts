// Observaciones del anuncio/imagen consultada. NO viajan en la URL ni cambian el estado oficial:
// van en una cookie httpOnly firmada, de 10 minutos, solo en el navegador de quien subió la imagen.
// Así nadie puede compartir un enlace que muestre advertencias sobre un prestador formal.
import { cookies } from "next/headers";
import { firmar, firmaValida } from "@/lib/firma";
import { OBS_IMAGEN, type CodigoObs } from "@/config/textos";

const NOMBRE = "checktur_anuncio";
const DURACION_S = 600;
type Datos = { d: string; o: CodigoObs[]; nf: boolean; e: number }; // destino, observaciones, no-encontrado, expira

export async function guardarAnuncio(destino: string, obs: CodigoObs[], noEncontrado: boolean) {
  const datos: Datos = { d: destino, o: obs, nf: noEncontrado, e: Math.floor(Date.now() / 1000) + DURACION_S };
  const valor = `${Buffer.from(JSON.stringify(datos)).toString("base64url")}.${firmar(datos)}`;
  (await cookies()).set(NOMBRE, valor, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: DURACION_S, path: "/" });
}

/** Lo guardado para este destino exacto ("prestador:<id>" o "consulta:<q>"), si la firma es válida y no expiró. */
export async function leerAnuncio(destino: string): Promise<{ textos: string[]; noEncontrado: boolean }> {
  const vacio = { textos: [], noEncontrado: false };
  const [b64, firma] = ((await cookies()).get(NOMBRE)?.value ?? "").split(".");
  if (!b64 || !firma) return vacio;
  let datos: Datos;
  try { datos = JSON.parse(Buffer.from(b64, "base64url").toString()); } catch { return vacio; }
  if (!firmaValida(datos, firma) || datos.d !== destino || datos.e < Date.now() / 1000) return vacio;
  return { textos: datos.o.filter((c) => c in OBS_IMAGEN).map((c) => OBS_IMAGEN[c]), noEncontrado: datos.nf === true };
}
