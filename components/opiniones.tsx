// Bloque público de opiniones: separado del dictamen y rotulado como no oficial (CHECKTUR_CONTEXTO.md §6).
import Link from "next/link";
import { BadgeCheck, Flag, MessageSquarePlus, Star } from "lucide-react";
import { Tarjeta } from "@/components/ui";
import { TEXTO_RESENA } from "@/config/textos";
import { REGLAS } from "@/config/reglas";
import { fechaLegible } from "@/lib/dictamen";
import { supabasePublico } from "@/lib/supabase/publico";
import { reportarResena } from "@/app/prestador/[id]/resena/acciones";

function Estrellas({ n, clase = "size-4" }: { n: number; clase?: string }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${n.toFixed(1).replace(".0", "")} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden className={`${clase} ${i <= Math.round(n) ? "fill-observaciones-borde text-observaciones" : "text-borde"}`} />
      ))}
    </span>
  );
}

export async function Opiniones({ providerId, puedeOpinar }: { providerId: string; puedeOpinar: boolean }) {
  // Columnas públicas explícitas (select("*") falla para anon por diseño: los datos de verificación no se exponen).
  const { data } = await supabasePublico()
    .from("reviews")
    .select("id, estrellas, comentario, alias, servicio, fecha_servicio, verificado, respuesta_prestador, created_at")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });
  const lista = data ?? [];
  const min = REGLAS.minimoResenasParaPromedio;
  const promedio = lista.length >= min ? lista.reduce((a, r) => a + r.estrellas, 0) / lista.length : null;

  return (
    <Tarjeta aria-labelledby="t-opiniones" className="flex flex-col gap-3">
      <div>
        <h2 id="t-opiniones" className="font-semibold">{TEXTO_RESENA.tituloBloque}</h2>
        <p className="text-sm text-texto-suave">{TEXTO_RESENA.aclaracion}</p>
      </div>
      {promedio !== null && (
        <p className="flex items-center gap-2">
          <span className="font-titulo text-2xl font-semibold">{promedio.toFixed(1)}</span>
          <Estrellas n={promedio} clase="size-5" />
          <span className="text-sm text-texto-suave">({lista.length})</span>
        </p>
      )}
      {!lista.length && <p className="text-texto-suave">{TEXTO_RESENA.sinResenas}</p>}
      {lista.length > 0 && promedio === null && <p className="text-sm text-texto-suave">{TEXTO_RESENA.pocasParaPromedio(lista.length, min)}</p>}
      <ul className="flex flex-col gap-3">
        {lista.slice(0, REGLAS.resenas.mostrarUltimas).map((r) => (
          <li key={r.id} className="flex flex-col gap-1 border-t border-borde pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <Estrellas n={r.estrellas} />
              <span className="font-semibold">{r.alias ?? "Usuario verificado"}</span>
            </div>
            {r.verificado && (
              <span className="inline-flex items-center gap-1 text-sm text-verificado">
                <BadgeCheck aria-hidden className="size-4" /> {TEXTO_RESENA.sello}
              </span>
            )}
            {r.comentario && <p>{r.comentario}</p>}
            <p className="text-sm text-texto-suave">
              {[r.servicio, r.fecha_servicio && fechaLegible(r.fecha_servicio)].filter(Boolean).join(" · ")}
            </p>
            {r.respuesta_prestador && <p className="border-l-2 border-borde pl-3 text-sm">Respuesta del prestador: {r.respuesta_prestador}</p>}
            <form action={reportarResena.bind(null, r.id)}>
              <button className="inline-flex min-h-11 cursor-pointer items-center gap-1 text-sm text-texto-suave underline">
                <Flag aria-hidden className="size-4" /> {TEXTO_RESENA.reportar}
              </button>
            </form>
          </li>
        ))}
      </ul>
      {puedeOpinar && (
        <Link href={`/prestador/${providerId}/resena`} className="inline-flex min-h-11 items-center gap-2 self-start font-semibold underline">
          <MessageSquarePlus aria-hidden className="size-5" /> {TEXTO_RESENA.dejar}
        </Link>
      )}
    </Tarjeta>
  );
}
