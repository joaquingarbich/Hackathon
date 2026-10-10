// Firma HMAC de los parámetros que cambian un dictamen (obs, nf). Sin firma válida se ignoran:
// así nadie puede compartir un enlace que muestre a un prestador formal con advertencias falsas.
import { createHmac, timingSafeEqual } from "node:crypto";

// ponytail: clave derivada de la service role (siempre presente en el servidor); usar un secreto propio si se rota esa key.
const clave = () => createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!).update("checktur:obs").digest();

export const firmar = (contenido: string) => createHmac("sha256", clave()).update(contenido).digest("base64url").slice(0, 22);

export function firmaValida(contenido: string, firma: unknown): boolean {
  if (typeof firma !== "string") return false;
  const a = Buffer.from(firmar(contenido)), b = Buffer.from(firma);
  return a.length === b.length && timingSafeEqual(a, b);
}
