// Firma HMAC para datos que el servidor guarda en el navegador (cookie del anuncio consultado).
// Se firma un JSON: forma canónica, sin ambigüedad entre campos.
import { createHmac, timingSafeEqual } from "node:crypto";

// ponytail: clave derivada de la service role (siempre presente en el servidor); usar un secreto propio si se rota esa key.
const clave = () => createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!).update("checktur:anuncio").digest();

export const firmar = (datos: unknown) => createHmac("sha256", clave()).update(JSON.stringify(datos)).digest("base64url");

export function firmaValida(datos: unknown, firma: unknown): boolean {
  if (typeof firma !== "string") return false;
  const a = Buffer.from(firmar(datos)), b = Buffer.from(firma);
  return a.length === b.length && timingSafeEqual(a, b);
}
