// Vista del dictamen: sello (estado + fuente + corte) → advertencias → contenido → consejos → fuentes.
import type { ReactNode } from "react";
import { FlaskConical, Lightbulb, OctagonAlert, TriangleAlert, ImageIcon } from "lucide-react";
import { Plegable, Sello, Skeleton, Tarjeta } from "@/components/ui";
import { CONSEJO, TEXTO_ESTADO, type Estado } from "@/config/textos";
import { fechaLegible, type Advertencia } from "@/lib/dictamen";
import { cn } from "@/lib/utils";

type Fuente = { id: string; nombre: string; url: string | null; fecha_corte: string };

/** Etiqueta corta de la fuente para el pie del sello. */
function siglas(f: Fuente) {
  const t = `${f.id} ${f.nombre}`.toLowerCase();
  if (t.includes("mincetur") || t.includes("dircetur")) return "MINCETUR";
  if (t.includes("sunat")) return "SUNAT";
  if (t.includes("mtc") || t.includes("transporte") || t.includes("municipal")) return "MTC / municipalidad";
  if (t.includes("validacion")) return "Validación CheckTur";
  if (t.includes("muestra")) return "Datos de muestra";
  return f.nombre;
}

/** Título de sección dentro de la ficha. */
export function TituloSeccion({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return <h2 id={id} className={cn("text-[1.1875rem] font-semibold tracking-tight", className)}>{children}</h2>;
}

export function VistaDictamen({
  estado, advertencias = [], anuncio = [], fuentes, consejos = [], muestra = false, children,
}: {
  estado: Estado;
  advertencias?: Advertencia[];
  anuncio?: string[]; // observaciones de la imagen consultada: aparte, no cambian el estado oficial
  fuentes: Fuente[];
  consejos?: readonly string[];
  muestra?: boolean;
  children?: ReactNode;
}) {
  const corte = fuentes.find((f) => f.id !== "checktur_validacion")?.fecha_corte; // corte de padrones oficiales
  const resumen = TEXTO_ESTADO[estado].resumen.replace("{fecha}", corte ? fechaLegible(corte) : "la última actualización");
  const nombresFuentes = [...new Set(fuentes.map(siglas))].join(" · ");
  return (
    <article className="flex flex-col gap-5">
      <Sello estado={estado} resumen={resumen} fuentes={nombresFuentes} corte={corte && fechaLegible(corte)} />

      {muestra && (
        <p className="flex items-center gap-2 self-start rounded-full bg-muted px-3 py-1.5 text-[0.8125rem] font-medium text-muted-foreground">
          <FlaskConical aria-hidden className="size-4 shrink-0" />
          Datos de muestra ficticios, solo para demostración
        </p>
      )}

      {advertencias.length > 0 && (
        <Tarjeta aria-labelledby="t-adv" className="flex flex-col gap-3">
          <TituloSeccion id="t-adv">Lo que debes saber</TituloSeccion>
          <ul className="flex flex-col gap-2">
            {advertencias.map((a) => {
              const alerta = a.nivel === "alerta";
              return (
                <li key={a.texto} className={cn("flex gap-3 rounded-xl px-3.5 py-3", alerta ? "bg-alerta-fondo text-alerta" : "bg-observaciones-fondo text-observaciones")}>
                  {alerta
                    ? <OctagonAlert aria-label="Alerta" className="mt-0.5 size-5 shrink-0" />
                    : <TriangleAlert aria-label="Observación" className="mt-0.5 size-5 shrink-0" />}
                  <span className="font-medium">{a.texto}</span>
                </li>
              );
            })}
          </ul>
        </Tarjeta>
      )}

      {anuncio.length > 0 && (
        <Tarjeta aria-labelledby="t-anuncio" className="flex flex-col gap-3 border-observaciones-borde/40">
          <div className="flex flex-col gap-1">
            <TituloSeccion id="t-anuncio" className="flex items-center gap-2"><ImageIcon aria-hidden className="size-5 text-muted-foreground" />Sobre el anuncio que consultaste</TituloSeccion>
            <p className="text-[0.875rem] text-muted-foreground">Se refiere a la imagen que subiste, no al registro oficial.</p>
          </div>
          <ul className="flex flex-col gap-2">
            {anuncio.map((t) => (
              <li key={t} className="flex gap-3 rounded-xl bg-observaciones-fondo px-3.5 py-3 text-observaciones">
                <TriangleAlert aria-label="Observación" className="mt-0.5 size-5 shrink-0" />
                <span className="font-medium">{t}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      {children}

      <Tarjeta aria-labelledby="t-antes" className="flex flex-col gap-3 bg-secondary/60 shadow-none">
        <TituloSeccion id="t-antes" className="flex items-center gap-2"><Lightbulb aria-hidden className="size-5 text-primary" />Antes de contratar</TituloSeccion>
        <ul className="flex flex-col gap-2">
          {[...consejos, CONSEJO.ambulatorio].map((c) => (
            <li key={c} className="flex gap-2.5 text-[0.9375rem]"><span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{c}</li>
          ))}
        </ul>
      </Tarjeta>

      <Plegable titulo="Fuentes y fechas de corte">
        <ul className="flex flex-col gap-2">
          {fuentes.map((f) => (
            <li key={f.id} className="flex flex-wrap justify-between gap-x-3">
              {f.url ? <a href={f.url} target="_blank" rel="noreferrer">{f.nombre}</a> : <span className="text-foreground">{f.nombre}</span>}
              <span>corte <span className="font-mono tabular-nums">{fechaLegible(f.fecha_corte)}</span></span>
            </li>
          ))}
        </ul>
      </Plegable>
    </article>
  );
}

/** Lista de datos etiqueta → valor; omite los vacíos. */
export function Datos({ titulo, filas }: { titulo: string; filas: [string, ReactNode][] }) {
  const visibles = filas.filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!visibles.length) return null;
  return (
    <section className="flex flex-col gap-2.5">
      <TituloSeccion>{titulo}</TituloSeccion>
      <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-suave">
        {visibles.map(([k, v]) => (
          <div key={k} className="grid gap-0.5 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
            <dt className="text-[0.875rem] text-muted-foreground">{k}</dt>
            <dd className="break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Cabecera del dictamen: nombre grande + tipo. */
export function CabeceraDictamen({ titulo, detalle, eyebrow }: { titulo: ReactNode; detalle?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <header className="flex flex-col gap-1.5">
      {eyebrow && <span className="text-[0.8125rem] font-semibold tracking-wide text-enlace uppercase">{eyebrow}</span>}
      <h1 className="text-[1.875rem] leading-[1.1] font-bold break-words sm:text-[2.25rem]">{titulo}</h1>
      {detalle && <p className="text-[1.0625rem] text-muted-foreground">{detalle}</p>}
    </header>
  );
}

/** Esqueleto del resultado: algo aparece al instante mientras se consultan los registros. */
export const Cargando = () => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10" role="status" aria-live="polite">
    <span className="sr-only">Consultando registros…</span>
    <Skeleton className="h-9 w-2/3 rounded-xl" />
    <Skeleton className="h-5 w-1/3 rounded-lg" />
    <Skeleton className="h-52 rounded-3xl" />
    <Skeleton className="h-28 rounded-2xl" />
  </div>
);
