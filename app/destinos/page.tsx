import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, Info, MapPin, MessageCircle, SearchX } from "lucide-react";
import { Cargando, TituloSeccion } from "@/components/dictamen";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { Alert, AlertDescription, AlertTitle, Encabezado, InsigniaEstado, Skeleton, Tarjeta, claseBoton } from "@/components/ui";
import { DESTINOS, NOMBRE_TIPO, TEXTO_DESTINOS, TEXTO_HOME, nombreDestino } from "@/config/textos";
import { conteoPorDestino, empresasPorDestino, type EmpresaDirectorio } from "@/lib/consultas";
import { cn } from "@/lib/utils";

// Directorio (secundario): empresas registradas por destino, para contactarlas por su canal oficial.
// Sin precios, sin reseñas, sin rankings. Solo empresas REGISTRADAS en CheckTur que declararon el destino (extra del verificador)
const TIPOS = ["agencia", "transporte_terrestre", "hospedaje", "restaurante", "guia"];

export default function Destinos({ searchParams }: PageProps<"/destinos">) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <Suspense fallback={<Cargando />}><Directorio searchParams={searchParams} /></Suspense>
    </div>
  );
}

function AvisoDeclarados({ corto = false }: { corto?: boolean }) {
  return (
    <Alert variant="info">
      <Info aria-hidden />
      <AlertTitle>{TEXTO_DESTINOS.aviso}</AlertTitle>
      <AlertDescription>{corto ? TEXTO_DESTINOS.avisoCorto : TEXTO_DESTINOS.avisoDetalle}</AlertDescription>
    </Alert>
  );
}

async function Directorio({ searchParams }: Pick<PageProps<"/destinos">, "searchParams">) {
  const sp = await searchParams;
  const d = DESTINOS.find((x) => x.id === sp.d);
  const t = TIPOS.includes(String(sp.t)) ? String(sp.t) : undefined;

  if (!d) return <Selector />;

  const declaradas = await empresasPorDestino(d.id, t);
  return (
    <>
      <Link href="/destinos" className="inline-flex min-h-11 items-center gap-1.5 self-start font-medium text-muted-foreground no-underline hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" /> {TEXTO_DESTINOS.cambiar}
      </Link>
      <Encabezado eyebrow="Destino" titulo={d.nombre} />
      <AvisoDeclarados corto />

      <nav aria-label="Tipo de empresa" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[undefined, ...TIPOS].map((x) => {
          const activo = t === x;
          return (
            <Link key={x ?? "todas"} href={x ? `/destinos?d=${d.id}&t=${x}` : `/destinos?d=${d.id}`} aria-current={activo ? "page" : undefined}
              className={cn("pulsable inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-[0.9375rem] font-medium no-underline", activo ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {x ? NOMBRE_TIPO[x] : "Todas"}
            </Link>
          );
        })}
      </nav>

      <section aria-labelledby="t-declararon" className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <TituloSeccion id="t-declararon">{TEXTO_DESTINOS.declararon(d.nombre)} <span className="font-normal text-muted-foreground">· {declaradas.length}</span></TituloSeccion>
          <p className="text-[0.875rem] text-muted-foreground">{TEXTO_DESTINOS.declararonAyuda}</p>
        </div>
        {declaradas.length ? <ListaEmpresas empresas={declaradas} /> : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-input/60 bg-card px-6 py-8 text-center">
            <SearchX aria-hidden className="size-7 text-muted-foreground" />
            <p className="text-[0.9375rem] text-muted-foreground">{TEXTO_DESTINOS.sinDeclarar(d.nombre)}{t ? ` (${NOMBRE_TIPO[t]})` : ""}</p>
          </div>
        )}
      </section>


      <Tarjeta aria-labelledby="t-ofrecieron" className="flex flex-col gap-3 bg-secondary/50 shadow-none">
        <h2 id="t-ofrecieron" className="text-[1.0625rem] font-semibold">{TEXTO_DESTINOS.buscarOtra(nombreDestino(d.id))}</h2>
        <BuscadorVerificar destino={d.id} etiqueta={`Verificar una oferta en ${d.nombre}`} />
      </Tarjeta>
    </>
  );
}

/** Sin destino elegido: tarjetas grandes con cuántas empresas declararon cada uno. */
async function Selector() {
  return (
    <>
      <Encabezado eyebrow="Directorio" titulo={TEXTO_HOME.porDestino} bajada={TEXTO_HOME.porDestinoAyuda} />
      <section aria-labelledby="t-elegir" className="flex flex-col gap-3">
        <TituloSeccion id="t-elegir">{TEXTO_DESTINOS.elegir}</TituloSeccion>
        <Suspense fallback={<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{DESTINOS.map((x) => <li key={x.id}><Skeleton className="h-24 rounded-2xl" /></li>)}</ul>}>
          <GrillaDestinos />
        </Suspense>
      </section>
      <AvisoDeclarados />
    </>
  );
}

async function GrillaDestinos() {
  const conteo = await conteoPorDestino();
  return (
    <ul className="escalonado grid grid-cols-2 gap-3 sm:grid-cols-3">
      {DESTINOS.map((x) => (
        <li key={x.id}>
          <Link href={`/destinos?d=${x.id}`} className="pulsable elevable flex h-full min-h-24 flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-foreground no-underline shadow-suave">
            <span className="flex items-start gap-2 font-semibold leading-snug"><MapPin aria-hidden className="mt-0.5 size-4.5 shrink-0 text-primary" />{x.nombre}</span>
            <span className="text-[0.8125rem] text-muted-foreground">{conteo[x.id] ? `${TEXTO_HOME.empresas(conteo[x.id])} lo declararon` : "Aún sin empresas registradas"}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Tarjeta entera = enlace a la ficha completa; el WhatsApp oficial va aparte (sin enlaces anidados). */
function ListaEmpresas({ empresas, sinDeclarar = false }: { empresas: EmpresaDirectorio[]; sinDeclarar?: boolean }) {
  return (
    <ul className="escalonado grid gap-3 sm:grid-cols-2">
      {empresas.map((e) => (
        <li key={e.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-suave">
          <Link href={`/prestador/${e.id}`} className="group flex flex-1 flex-col gap-2 p-4 text-foreground no-underline hover:bg-muted/50">
            <span className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><Building2 aria-hidden className="size-5" /></span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <b className="leading-snug font-semibold group-hover:underline">{e.nombre}</b>
                <span className="text-[0.875rem] text-muted-foreground">{[NOMBRE_TIPO[e.tipo], e.lugar].filter(Boolean).join(" · ")}</span>
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <InsigniaEstado estado={e.estado} />
              {sinDeclarar && <span className="rounded-full bg-muted px-2.5 py-1 text-[0.8125rem] leading-none font-medium text-muted-foreground">Destinos sin declarar</span>}
            </span>
            {e.servicios.length > 0 && <span className="text-[0.875rem] text-muted-foreground">{e.servicios.join(" · ")}</span>}
            <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[0.9375rem] font-semibold text-enlace">{TEXTO_DESTINOS.verDetalle} <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" /></span>
          </Link>
          {e.whatsapp && (
            <div className="border-t border-border px-4 py-3">
              <a href={`https://wa.me/51${e.whatsapp}`} target="_blank" rel="noreferrer" className={claseBoton("secundario", "h-11 w-full")}>
                <MessageCircle aria-hidden /> WhatsApp oficial
              </a>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
