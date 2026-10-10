// Vista del dictamen: estado (color+ícono+texto) → advertencias → datos → fuentes → consejos.
import type { ReactNode } from "react";
import { OctagonAlert, TriangleAlert, FlaskConical } from "lucide-react";
import { InsigniaEstado, Plegable, Tarjeta } from "@/components/ui";
import { CONSEJO, TEXTO_ESTADO, type Estado } from "@/config/textos";
import { fechaLegible, type Advertencia } from "@/lib/dictamen";

type Fuente = { id: string; nombre: string; url: string | null; fecha_corte: string };

export function VistaDictamen({
  estado, advertencias = [], fuentes, consejos = [], muestra = false, children,
}: {
  estado: Estado;
  advertencias?: Advertencia[];
  fuentes: Fuente[];
  consejos?: readonly string[];
  muestra?: boolean;
  children?: ReactNode;
}) {
  const corte = fuentes[0]?.fecha_corte;
  const resumen = TEXTO_ESTADO[estado].resumen.replace("{fecha}", corte ? fechaLegible(corte) : "la última actualización");
  return (
    <article className="flex flex-col gap-4">
      <InsigniaEstado estado={estado} grande />
      <p className="text-lg">{resumen}</p>

      {muestra && (
        <p className="flex items-center gap-2 rounded-control border border-borde bg-no-encontrado-fondo px-3 py-2 text-sm text-texto-suave">
          <FlaskConical aria-hidden className="size-4 shrink-0" />
          Datos de muestra ficticios, solo para demostración.
        </p>
      )}

      {advertencias.length > 0 && (
        <Tarjeta aria-labelledby="t-adv">
          <h2 id="t-adv" className="mb-2 font-semibold">Lo que debes saber</h2>
          <ul className="flex flex-col gap-2">
            {advertencias.map((a) => (
              <li key={a.texto} className={`flex gap-2 ${a.nivel === "alerta" ? "text-alerta" : "text-observaciones"}`}>
                {a.nivel === "alerta"
                  ? <OctagonAlert aria-label="Alerta" className="mt-1 size-5 shrink-0" />
                  : <TriangleAlert aria-label="Observación" className="mt-1 size-5 shrink-0" />}
                <span>{a.texto}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      {children}

      <Plegable titulo="Fuentes consultadas">
        <ul className="flex flex-col gap-1 text-sm">
          {fuentes.map((f) => (
            <li key={f.id}>
              {f.url ? <a className="underline" href={f.url} target="_blank" rel="noreferrer">{f.nombre}</a> : f.nombre}
              {" — corte al "}{fechaLegible(f.fecha_corte)}
            </li>
          ))}
        </ul>
      </Plegable>

      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-texto-suave">
        {[...consejos, CONSEJO.ambulatorio].map((c) => <li key={c}>{c}</li>)}
      </ul>
    </article>
  );
}

/** Lista de datos etiqueta → valor; omite los vacíos. */
export function Datos({ titulo, filas }: { titulo: string; filas: [string, ReactNode][] }) {
  const visibles = filas.filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!visibles.length) return null;
  return (
    <Tarjeta>
      <h2 className="mb-2 font-semibold">{titulo}</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {visibles.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-texto-suave">{k}</dt>
            <dd className="break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </Tarjeta>
  );
}

export const Cargando = () => <p className="text-texto-suave" role="status">Consultando registros…</p>;
