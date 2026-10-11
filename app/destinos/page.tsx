import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, MessageCircle, SearchX } from "lucide-react";
import { Cargando } from "@/components/dictamen";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { Encabezado, InsigniaEstado, Tarjeta, claseBoton } from "@/components/ui";
import { DESTINOS, NOMBRE_TIPO, TEXTO_HOME, nombreDestino } from "@/config/textos";
import { empresasPorDestino } from "@/lib/consultas";
import { cn } from "@/lib/utils";

// Directorio (secundario): empresas formales por destino, para contactarlas por su canal oficial.
// Sin precios, sin reseñas, sin rankings.
const TIPOS = ["agencia", "transporte_terrestre", "hospedaje", "restaurante", "guia"];
const chip = "pulsable inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[0.9375rem] font-medium no-underline";
const chipActivo = "border-primary bg-primary text-primary-foreground shadow-marca";
const chipInactivo = "border-border bg-card text-foreground shadow-suave hover:border-input";

export default function Destinos({ searchParams }: PageProps<"/destinos">) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <Encabezado eyebrow="Directorio" titulo={TEXTO_HOME.porDestino} bajada={TEXTO_HOME.porDestinoAyuda} />
      <Suspense fallback={<Cargando />}><Directorio searchParams={searchParams} /></Suspense>
    </div>
  );
}

async function Directorio({ searchParams }: Pick<PageProps<"/destinos">, "searchParams">) {
  const sp = await searchParams;
  const d = DESTINOS.find((x) => x.id === sp.d)?.id;
  const t = TIPOS.includes(String(sp.t)) ? String(sp.t) : undefined;
  const empresas = d ? await empresasPorDestino(d, t) : [];
  return (
    <>
      <nav aria-label="Destinos" className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-1 pb-3 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {DESTINOS.map((x) => (
          <Link key={x.id} href={`/destinos?d=${x.id}`} aria-current={d === x.id ? "page" : undefined} className={cn(chip, d === x.id ? chipActivo : chipInactivo)}>
            <MapPin aria-hidden className="size-4" />{x.nombre}
          </Link>
        ))}
      </nav>
      {!d && <p className="text-muted-foreground">Elige un destino para ver las empresas registradas que lo atienden.</p>}
      {d && (
        <>
          <nav aria-label="Tipo de empresa" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {[undefined, ...TIPOS].map((x) => {
              const activo = t === x;
              return (
                <Link key={x ?? "todas"} href={x ? `/destinos?d=${d}&t=${x}` : `/destinos?d=${d}`} aria-current={activo ? "page" : undefined}
                  className={cn("pulsable inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-[0.9375rem] font-medium no-underline", activo ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  {x ? NOMBRE_TIPO[x] : "Todas"}
                </Link>
              );
            })}
          </nav>
          <p className="text-[0.9375rem] text-muted-foreground" role="status">
            {empresas.length} {empresas.length === 1 ? "empresa registrada" : "empresas registradas"} en {nombreDestino(d)}{t ? ` · ${NOMBRE_TIPO[t]}` : ""}
          </p>
          {!empresas.length && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-input/60 bg-card px-6 py-10 text-center">
              <SearchX aria-hidden className="size-8 text-muted-foreground" />
              <p className="font-semibold">Aún no hay empresas registradas aquí</p>
              <p className="text-[0.9375rem] text-muted-foreground">Prueba con otro tipo o destino, o verifica una oferta con el buscador de abajo.</p>
            </div>
          )}
          <ul className="escalonado grid gap-3 sm:grid-cols-2">
            {empresas.map((e) => (
              <li key={e.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-suave">
                <Link href={`/prestador/${e.id}`} className="group flex items-start justify-between gap-3 text-foreground no-underline">
                  <span className="flex flex-col gap-1.5">
                    <b className="text-[1.0625rem] leading-snug font-semibold group-hover:underline">{e.nombre}</b>
                    <span className="text-[0.875rem] text-muted-foreground">{[NOMBRE_TIPO[e.tipo], e.lugar].filter(Boolean).join(" · ")}</span>
                    <InsigniaEstado estado={e.estado} />
                    {e.servicios.length > 0 && <span className="text-[0.875rem] text-muted-foreground">{e.servicios.join(" · ")}</span>}
                  </span>
                  <ChevronRight aria-hidden className="mt-1 size-5 shrink-0 text-muted-foreground" />
                </Link>
                {e.whatsapp && (
                  <a href={`https://wa.me/51${e.whatsapp}`} target="_blank" rel="noreferrer" className={claseBoton("secundario", "mt-auto h-11 w-full sm:w-auto sm:self-start")}>
                    <MessageCircle aria-hidden /> WhatsApp oficial
                  </a>
                )}
              </li>
            ))}
          </ul>
          <Tarjeta aria-labelledby="t-ofrecieron" className="flex flex-col gap-3 bg-secondary/50 shadow-none">
            <h2 id="t-ofrecieron" className="text-[1.0625rem] font-semibold">¿Te ofrecieron algo en {nombreDestino(d)} que no está aquí?</h2>
            <BuscadorVerificar destino={d} etiqueta={`Verificar una oferta en ${nombreDestino(d)}`} />
          </Tarjeta>
        </>
      )}
    </>
  );
}
