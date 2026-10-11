// Piezas comunes de las fichas de verificación (empresa, vehículo, persona, /v/[id]).
import Link from "next/link";
import { headers } from "next/headers";
import { Flag, MessageCircle, Phone, Share2 } from "lucide-react";
import { BarraAccion, Mono, claseBoton } from "@/components/ui";
import { NOMBRE_CANAL, TEXTO_FICHA } from "@/config/textos";

/** URL absoluta de esta ficha (para compartir por WhatsApp). */
export async function urlAbsoluta(ruta: string) {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}${ruta}`;
}

/** Foto grande para comparar con lo que se tiene enfrente (evita QR fotocopiados). Sin foto: iniciales. */
export function Foto({ src, alt, texto, className = "" }: { src: string | null; alt: string; texto: string; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- fotos subidas a Storage público, tamaño variable
    <img src={src} alt={alt} className={`aspect-[4/3] w-full rounded-tarjeta border border-separador bg-relleno object-cover ${className}`} />
  ) : (
    <div role="img" aria-label={`${alt} (sin foto registrada)`} className={`flex aspect-[4/3] w-full items-center justify-center rounded-tarjeta border border-dashed border-separador bg-relleno text-4xl font-extrabold text-texto-suave ${className}`}>
      {texto}
    </div>
  );
}

export const iniciales = (n: string) => n.split(/\s+/).filter((p) => !/^\(|muestra/i.test(p)).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

type Canal = { id: string; tipo: string; visible: string };

/** Número para el botón de WhatsApp oficial: canal WhatsApp aprobado o, si no, el celular del padrón. */
export function whatsappOficial(canales: Canal[], telefono: string | null) {
  const w = canales.find((c) => c.tipo === "whatsapp")?.visible.replace(/\D/g, "");
  const t = telefono?.replace(/\D/g, "").slice(-9);
  return w ?? (t && /^9\d{8}$/.test(t) ? t : null);
}

export function Canales({ canales, telefono }: { canales: Canal[]; telefono: string | null }) {
  const filas = canales.length ? canales : telefono ? [{ id: "padron", tipo: "telefono", visible: telefono }] : [];
  if (!filas.length) return null;
  return (
    <section aria-labelledby="t-canales" className="flex flex-col gap-2">
      <h2 id="t-canales" className="text-[1.375rem] font-bold">{TEXTO_FICHA.canales}</h2>
      <p className="text-[0.9375rem] text-texto-suave">{TEXTO_FICHA.canalesAyuda}</p>
      <dl className="overflow-hidden rounded-tarjeta border border-separador bg-superficie">
        {filas.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 border-b border-separador px-4 py-3 last:border-0">
            <dt className="text-texto-suave">{NOMBRE_CANAL[c.tipo] ?? c.tipo}</dt>
            <dd className="font-semibold"><Mono>{c.visible}</Mono></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function AccionesFicha({ whatsapp, textoCompartir, datoReporte, providerId }: {
  whatsapp: string | null; textoCompartir: string; datoReporte: string; providerId?: string;
}) {
  const reportar = `/reportar?dato=${encodeURIComponent(datoReporte)}${providerId ? `&p=${providerId}` : ""}`;
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(textoCompartir)}`} target="_blank" rel="noreferrer" className={claseBoton("secundario")}>
          <Share2 aria-hidden className="size-5" /> {TEXTO_FICHA.compartir}
        </a>
        <Link href={reportar} className={claseBoton("secundario")}><Flag aria-hidden className="size-5" /> {TEXTO_FICHA.reportar}</Link>
      </div>
      {whatsapp && (
        <BarraAccion>
          <a href={`https://wa.me/51${whatsapp}`} target="_blank" rel="noreferrer" className={claseBoton("primario", "w-full sm:w-auto")}>
            <MessageCircle aria-hidden className="size-5" /> {TEXTO_FICHA.whatsappOficial}
          </a>
          <a href={`tel:+51${whatsapp}`} className={claseBoton("secundario", "w-full sm:w-auto")}><Phone aria-hidden className="size-5" /> {TEXTO_FICHA.llamarOficial}</a>
        </BarraAccion>
      )}
    </>
  );
}
