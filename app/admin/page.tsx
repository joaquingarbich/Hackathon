import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Cargando } from "@/components/dictamen";
import { Tarjeta } from "@/components/ui";
import { TIPO_DOCUMENTO } from "@/config/textos";
import { exigirAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fechaLegible } from "@/lib/dictamen";
import { InsigniaConfianza } from "./confianza";

export default function Admin() {
  return (
    <Suspense fallback={<Cargando />}>
      <Cola />
    </Suspense>
  );
}

async function Cola() {
  const admin = await exigirAdmin();
  const { data: pendientes } = await admin.supabase
    .from("submissions")
    .select("id, ruc, tipo_documento, confianza, created_at, datos_declarados")
    .eq("estado", "pendiente")
    .order("created_at");
  // Opiniones: datos de verificación sin acceso por API; se leen con service role tras exigirAdmin().
  const { data: resenas } = await supabaseAdmin()
    .from("reviews")
    .select("id, estrellas, comentario, estado, created_at")
    .in("estado", ["pendiente", "reportada"])
    .order("created_at");

  return (
    <>
      <h1 className="text-2xl font-semibold">Solicitudes por revisar</h1>
      {!pendientes?.length && <p className="text-texto-suave">No hay solicitudes pendientes.</p>}
      <ul className="flex flex-col gap-2">
        {pendientes?.map((s) => (
          <li key={s.id}>
            <Link href={`/admin/${s.id}`} className="block">
              <Tarjeta className="flex items-center justify-between gap-3 transition-colors duration-200 hover:bg-fondo">
                <span className="flex flex-col gap-1">
                  <span className="font-semibold">
                    {(s.datos_declarados as { nombre_comercial?: string }).nombre_comercial ?? "Sin nombre"} · RUC {s.ruc}
                  </span>
                  <span className="text-sm text-texto-suave">{TIPO_DOCUMENTO[s.tipo_documento]} · {fechaLegible(s.created_at.slice(0, 10))}</span>
                  <InsigniaConfianza confianza={s.confianza} />
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0" />
              </Tarjeta>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-4 text-xl font-semibold">Opiniones por revisar</h2>
      {!resenas?.length && <p className="text-texto-suave">No hay opiniones pendientes ni reportadas.</p>}
      <ul className="flex flex-col gap-2">
        {resenas?.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/resena/${r.id}`} className="block">
              <Tarjeta className="flex items-center justify-between gap-3 transition-colors duration-200 hover:bg-fondo">
                <span className="flex flex-col gap-1">
                  <span className="font-semibold">{r.estrellas}★ · {r.estado === "reportada" ? "Reportada" : "Pendiente"}</span>
                  <span className="text-sm text-texto-suave">{r.comentario?.slice(0, 80) ?? "Sin comentario"} · {fechaLegible(r.created_at.slice(0, 10))}</span>
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0" />
              </Tarjeta>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/operador" className="min-h-11 self-start underline">Volver</Link>
    </>
  );
}
