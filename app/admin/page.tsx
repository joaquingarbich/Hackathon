import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Cargando } from "@/components/dictamen";
import { ChipProceso, Mono, Pagina } from "@/components/ui";
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
    <Pagina>
      <div className="flex flex-col gap-1">
        <h1 className="text-[2.125rem] leading-[1.05] font-extrabold">Panel de validación</h1>
        <p className="text-texto-suave">Documentos de proveedores y opiniones con comprobante.</p>
      </div>
      <h2 className="text-[1.375rem] font-bold">Documentos · pendientes {pendientes?.length ?? 0}</h2>
      {!pendientes?.length && <p className="text-texto-suave">No hay documentos pendientes.</p>}
      <ul className="overflow-hidden rounded-tarjeta border border-separador bg-superficie empty:hidden">
        {pendientes?.map((s) => (
          <li key={s.id} className="border-b border-separador last:border-0">
            <Link href={`/admin/${s.id}`} className="flex items-center justify-between gap-3 p-4 no-underline hover:bg-relleno">
              <span className="flex flex-col gap-1">
                <b className="text-lg">{(s.datos_declarados as { nombre_comercial?: string }).nombre_comercial ?? "Sin nombre"}</b>
                <span className="text-[0.9375rem] text-texto-suave">{TIPO_DOCUMENTO[s.tipo_documento]} · RUC <Mono>{s.ruc}</Mono></span>
                <span className="flex flex-wrap items-center gap-2 text-[0.9375rem] text-texto-suave">
                  <InsigniaConfianza confianza={s.confianza} /> <Mono>{fechaLegible(s.created_at.slice(0, 10))}</Mono>
                </span>
              </span>
              <ChevronRight aria-hidden className="size-5 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-2 text-[1.375rem] font-bold">Opiniones · por revisar {resenas?.length ?? 0}</h2>
      {!resenas?.length && <p className="text-texto-suave">No hay opiniones pendientes ni reportadas.</p>}
      <ul className="overflow-hidden rounded-tarjeta border border-separador bg-superficie empty:hidden">
        {resenas?.map((r) => (
          <li key={r.id} className="border-b border-separador last:border-0">
            <Link href={`/admin/resena/${r.id}`} className="flex items-center justify-between gap-3 p-4 no-underline hover:bg-relleno">
              <span className="flex flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <b>{r.estrellas} de 5</b>
                  <ChipProceso tipo={r.estado === "reportada" ? "corregir" : "revision"} texto={r.estado === "reportada" ? "Reportada" : "Pendiente"} />
                </span>
                <span className="text-[0.9375rem] text-texto-suave">{r.comentario?.slice(0, 80) ?? "Sin comentario"} · <Mono>{fechaLegible(r.created_at.slice(0, 10))}</Mono></span>
              </span>
              <ChevronRight aria-hidden className="size-5 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-[0.875rem] text-texto-suave">Datos de muestra · empresas ficticias.</p>
      <Link href="/operador" className="flex min-h-11 items-center self-start font-bold">← Volver</Link>
    </Pagina>
  );
}
