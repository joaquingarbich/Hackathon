// Piezas comunes de las fichas de verificación (empresa, vehículo, persona, /v/[id]).
import Link from "next/link";
import { headers } from "next/headers";
import { AtSign, CreditCard, Flag, Globe, MessageCircle, Phone, Share2, Smartphone, Wallet, type LucideIcon } from "lucide-react";
import { BarraAccion, Mono, claseBoton } from "@/components/ui";
import { TituloSeccion } from "@/components/dictamen";
import { NOMBRE_CANAL, TEXTO_FICHA } from "@/config/textos";
import { cn } from "@/lib/utils";

/** URL absoluta de esta ficha (para compartir por WhatsApp). */
export async function urlAbsoluta(ruta: string) {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}${ruta}`;
}

/** Foto para comparar con lo que se tiene enfrente. Sin foto registrada no se muestra nada
 *  (los registros oficiales del MTC/MINCETUR no traen fotos; solo las sube la empresa). */
export function Foto({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element -- fotos subidas a Storage público, tamaño variable
  return <img src={src} alt={alt} className={cn("aspect-[4/3] w-full rounded-2xl border border-border bg-muted object-cover shadow-suave", className)} />;
}


type Canal = { id: string; tipo: string; visible: string };

/** Número para el botón de WhatsApp oficial: canal WhatsApp aprobado o, si no, el celular del padrón. */
export function whatsappOficial(canales: Canal[], telefono: string | null) {
  const w = canales.find((c) => c.tipo === "whatsapp")?.visible.replace(/\D/g, "");
  const t = telefono?.replace(/\D/g, "").slice(-9);
  return w ?? (t && /^9\d{8}$/.test(t) ? t : null);
}

const ICONO_CANAL: Record<string, LucideIcon> = {
  whatsapp: MessageCircle, telefono: Phone, yape: Smartphone, plin: Smartphone, banco: CreditCard,
  instagram: AtSign, facebook: AtSign, tiktok: AtSign, web: Globe,
};

export function Canales({ canales, telefono }: { canales: Canal[]; telefono: string | null }) {
  const filas = canales.length ? canales : telefono ? [{ id: "padron", tipo: "telefono", visible: telefono }] : [];
  if (!filas.length) return null;
  return (
    <section aria-labelledby="t-canales" className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <TituloSeccion id="t-canales">{TEXTO_FICHA.canales}</TituloSeccion>
        <p className="text-[0.875rem] text-muted-foreground">{TEXTO_FICHA.canalesAyuda}</p>
      </div>
      <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-suave">
        {filas.map((c) => {
          const Icono = ICONO_CANAL[c.tipo] ?? Wallet;
          return (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <dt className="flex items-center gap-3 text-muted-foreground">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><Icono aria-hidden className="size-4.5" /></span>
                {NOMBRE_CANAL[c.tipo] ?? c.tipo}
              </dt>
              <dd className="ml-auto min-w-0 text-right font-semibold break-all"><Mono>{c.visible}</Mono></dd>
            </div>
          );
        })}
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
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a href={`https://wa.me/?text=${encodeURIComponent(textoCompartir)}`} target="_blank" rel="noreferrer" className={claseBoton("secundario")}>
          <Share2 aria-hidden /> {TEXTO_FICHA.compartir}
        </a>
        <Link href={reportar} className={claseBoton("secundario", "text-alerta hover:text-alerta")}><Flag aria-hidden /> {TEXTO_FICHA.reportar}</Link>
      </div>
      {whatsapp && (
        <BarraAccion>
          <div className="flex gap-2">
            <a href={`https://wa.me/51${whatsapp}`} target="_blank" rel="noreferrer" className={claseBoton("primario", "flex-1 sm:flex-none")}>
              <MessageCircle aria-hidden /> <span className="sm:hidden">WhatsApp oficial</span><span className="hidden sm:inline">{TEXTO_FICHA.whatsappOficial}</span>
            </a>
            <a href={`tel:+51${whatsapp}`} aria-label={TEXTO_FICHA.llamarOficial} className={claseBoton("secundario", "w-13 shrink-0 px-0 sm:w-auto sm:px-5")}>
              <Phone aria-hidden /> <span className="hidden sm:inline">{TEXTO_FICHA.llamarOficial}</span>
            </a>
          </div>
        </BarraAccion>
      )}
    </>
  );
}

/** Placa peruana a tamaño grande, para comparar con la que se tiene enfrente. */
export function Placa({ placa, className }: { placa: string; className?: string }) {
  const legible = `${placa.slice(0, 3)}-${placa.slice(3)}`;
  return (
    <span role="img" aria-label={`Placa ${legible}`} className={cn("inline-flex w-fit flex-col items-stretch overflow-hidden rounded-xl border-2 border-foreground bg-white text-[#0b1324] shadow-media", className)}>
      <span aria-hidden className="bg-primary px-3 py-0.5 text-center text-[0.8125rem] font-bold tracking-[0.35em] text-white">PERÚ</span>
      <Mono className="px-5 pt-1 pb-1.5 text-center text-[2.5rem] leading-none font-semibold tracking-wider sm:text-[3rem]">{legible}</Mono>
    </span>
  );
}
