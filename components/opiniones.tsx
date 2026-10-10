// Bloque público de opiniones: separado del dictamen y rotulado como no oficial (CHECKTUR_CONTEXTO.md §6).
import Link from "next/link";
import { BadgeCheck, Flag, MessageSquarePlus, Star } from "lucide-react";
import { TEXTO_RESENA } from "@/config/textos";
import { REGLAS } from "@/config/reglas";
import { fechaLegible } from "@/lib/dictamen";
import { supabasePublico } from "@/lib/supabase/publico";
import { reportarResena } from "@/app/prestador/[id]/resena/acciones";

function Estrellas({ n, clase = "size-4" }: { n: number; clase?: string }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${n.toFixed(1).replace(".0", "")} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden className={`${clase} ${i <= Math.round(n) ? "fill-estrella text-estrella" : "text-borde"}`} />
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
    <section aria-labelledby="t-opiniones" className="flex flex-col gap-3 rounded-tarjeta bg-relleno p-4">
      <div className="flex flex-col gap-0.5">
        <h2 id="t-opiniones" className="text-[1.375rem] font-bold">{TEXTO_RESENA.tituloBloque}</h2>
        <p className="text-[0.9375rem] text-texto-suave">{TEXTO_RESENA.aclaracion}</p>
      </div>
      {promedio !== null && (
        <p className="flex items-baseline gap-2.5">
          <span className="font-titulo text-[2rem] font-extrabold">{promedio.toFixed(1).replace(".", ",")}</span>
          <Estrellas n={promedio} clase="size-5" />
          <span className="text-[0.9375rem] text-texto-suave">{lista.length} opiniones</span>
        </p>
      )}
      {!lista.length && <p className="text-texto-suave">{TEXTO_RESENA.sinResenas}</p>}
      {lista.length > 0 && promedio === null && <p className="text-[0.9375rem] text-texto-suave">{TEXTO_RESENA.pocasParaPromedio(lista.length, min)}</p>}
      <ul className="flex flex-col gap-3">
        {lista.slice(0, REGLAS.resenas.mostrarUltimas).map((r) => (
          <li key={r.id} className="flex flex-col gap-1.5 rounded-control bg-superficie p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <Estrellas n={r.estrellas} />
              <span className="font-semibold">{r.alias ?? "Usuario verificado"}</span>
            </div>
            {r.verificado && (
              <span className="inline-flex items-center gap-1 text-[0.9375rem] text-verificado">
                <BadgeCheck aria-hidden className="size-4" /> {TEXTO_RESENA.sello}
              </span>
            )}
            {r.comentario && <p className="text-[1.0625rem] leading-snug">{r.comentario}</p>}
            <p className="text-[0.9375rem] text-texto-suave">
              {[r.servicio, r.fecha_servicio && fechaLegible(r.fecha_servicio)].filter(Boolean).join(" · ")}
            </p>
            {r.respuesta_prestador && <p className="border-l-2 border-separador pl-3 text-[0.9375rem]">Respuesta del proveedor: {r.respuesta_prestador}</p>}
            <form action={reportarResena.bind(null, r.id)}>
              <button className="inline-flex min-h-11 cursor-pointer items-center gap-1 text-[0.9375rem] text-texto-suave underline">
                <Flag aria-hidden className="size-4" /> {TEXTO_RESENA.reportar}
              </button>
            </form>
          </li>
        ))}
      </ul>
      {puedeOpinar && (
        <Link href={`/prestador/${providerId}/resena`} className="inline-flex min-h-11 items-center gap-2 self-start font-bold">
          <MessageSquarePlus aria-hidden className="size-5" /> {TEXTO_RESENA.dejar}
        </Link>
      )}
    </section>
  );
}
