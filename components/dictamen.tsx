// Vista del dictamen (C03/C04/C05): sello (estado + fuente + corte) → advertencias → datos → fuentes → consejos.
import type { ReactNode } from "react";
import { OctagonAlert, TriangleAlert, FlaskConical } from "lucide-react";
import { Plegable, Sello, Tarjeta } from "@/components/ui";
import { CONSEJO, TEXTO_ESTADO, type Estado } from "@/config/textos";
import { fechaLegible, type Advertencia } from "@/lib/dictamen";

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
        <p className="flex items-center gap-2 rounded-control bg-relleno px-3 py-2 text-[0.9375rem] text-texto-suave">
          <FlaskConical aria-hidden className="size-4 shrink-0" />
          Datos de muestra ficticios, solo para demostración.
        </p>
      )}

      {advertencias.length > 0 && (
        <Tarjeta aria-labelledby="t-adv">
          <h2 id="t-adv" className="mb-2.5 text-[1.375rem] font-bold">Lo que debes saber</h2>
          <ul className="flex flex-col gap-2.5">
            {advertencias.map((a) => (
              <li key={a.texto} className={`flex gap-2 ${a.nivel === "alerta" ? "text-alerta" : "text-observaciones"}`}>
                {a.nivel === "alerta"
                  ? <OctagonAlert aria-label="Alerta" className="mt-0.5 size-5 shrink-0" />
                  : <TriangleAlert aria-label="Observación" className="mt-0.5 size-5 shrink-0" />}
                <span>{a.texto}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      {anuncio.length > 0 && (
        <Tarjeta aria-labelledby="t-anuncio" className="border-observaciones-borde">
          <h2 id="t-anuncio" className="text-[1.375rem] font-bold">Sobre el anuncio que consultaste</h2>
          <p className="mb-2.5 text-[0.9375rem] text-texto-suave">Esto se refiere a la imagen que subiste, no al registro oficial.</p>
          <ul className="flex flex-col gap-2.5">
            {anuncio.map((t) => (
              <li key={t} className="flex gap-2 text-observaciones">
                <TriangleAlert aria-label="Observación" className="mt-0.5 size-5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      {children}

      <Tarjeta aria-labelledby="t-antes">
        <h2 id="t-antes" className="mb-2 text-[1.375rem] font-bold">Antes de contratar</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-texto-suave">
          {[...consejos, CONSEJO.ambulatorio].map((c) => <li key={c}>{c}</li>)}
        </ul>
      </Tarjeta>

      <Plegable titulo="Fuentes y fechas de corte">
        <ul className="flex flex-col gap-1">
          {fuentes.map((f) => (
            <li key={f.id}>
              {f.url ? <a href={f.url} target="_blank" rel="noreferrer">{f.nombre}</a> : f.nombre}
              {" · corte "}<span className="font-mono">{fechaLegible(f.fecha_corte)}</span>
            </li>
          ))}
        </ul>
      </Plegable>
    </article>
  );
}

/** Lista de datos etiqueta → valor (etiqueta encima); omite los vacíos. */
export function Datos({ titulo, filas }: { titulo: string; filas: [string, ReactNode][] }) {
  const visibles = filas.filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!visibles.length) return null;
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-[1.375rem] font-bold">{titulo}</h2>
      <dl className="overflow-hidden rounded-tarjeta border border-separador bg-superficie">
        {visibles.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 border-b border-separador px-4 py-3 last:border-0">
            <dt className="text-[0.9375rem] text-texto-suave">{k}</dt>
            <dd className="break-words text-[1.0625rem]">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Cabecera del dictamen: nombre grande + tipo. */
export function CabeceraDictamen({ titulo, detalle }: { titulo: ReactNode; detalle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-[2.125rem] leading-[1.05] font-extrabold">{titulo}</h1>
      {detalle && <p className="text-[1.0625rem] text-texto-suave">{detalle}</p>}
    </div>
  );
}

export const Cargando = () => (
  <div className="mx-auto w-full max-w-2xl px-4 py-6"><p className="text-texto-suave" role="status">Consultando registros…</p></div>
);
