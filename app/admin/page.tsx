import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { salirAdmin } from "../ingresar/acciones";
import { Cargando } from "@/components/dictamen";
import { Button, ChipProceso, Mono, Pagina, Tarjeta } from "@/components/ui";
import { TIPO_DOCUMENTO } from "@/config/textos";
import { exigirAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fechaLegible } from "@/lib/dictamen";
import { InsigniaConfianza } from "./confianza";
import { Fiscalizacion } from "./fiscalizacion";
import { DESTINOS } from "@/config/textos";

/** ISO de hace n días (fuera del render: Date.now() es impuro). */
const haceDias = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export default function Admin({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Cola searchParams={searchParams} />
    </Suspense>
  );
}

async function Cola({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const admin = await exigirAdmin();
  const sp = await searchParams;
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
  const db = supabaseAdmin();
  const [{ data: servicios }, { data: cambios }, { data: consultas }] = await Promise.all([
    db.from("services").select("id, nombre, created_at, provider_id").eq("estado", "pendiente").order("created_at"),
    db.from("proveedor_cambios").select("id, created_at, provider_id").eq("estado", "pendiente").order("created_at"),
    db.from("lookups").select("tipo_entrada, estado_resultado").gte("created_at", haceDias(7)).limit(5000),
  ]);
  const ids = [...new Set([...(servicios ?? []), ...(cambios ?? [])].map((x) => x.provider_id))];
  const { data: nombres } = ids.length ? await db.from("providers").select("id, nombre_comercial, razon_social").in("id", ids) : { data: [] };
  const cuenta = (k: "tipo_entrada" | "estado_resultado") =>
    Object.entries((consultas ?? []).reduce<Record<string, number>>((m, c) => ({ ...m, [c[k] ?? "—"]: (m[c[k] ?? "—"] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const nombreDe = (x: { provider_id: string }) => {
    const p = nombres?.find((n) => n.id === x.provider_id);
    return p?.nombre_comercial ?? p?.razon_social ?? "Proveedor";
  };

  return (
    <Pagina>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-2 text-[0.9375rem] shadow-suave">
        <span className="min-w-0 truncate text-muted-foreground">Revisor · {admin.email}</span>
        <form action={salirAdmin}><Button variant="ghost" size="sm"><LogOut aria-hidden /> Salir</Button></form>
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-[1.875rem] leading-[1.1] font-bold sm:text-[2.25rem]">Panel de validación</h1>
        <p className="text-muted-foreground">Documentos, altas de canales, vehículos y personal, reportes de turistas y búsquedas sin resultado.</p>
      </div>
      <h2 className="text-[1.1875rem] font-semibold tracking-tight">Documentos · pendientes {pendientes?.length ?? 0}</h2>
      {!pendientes?.length && <p className="text-muted-foreground">No hay documentos pendientes.</p>}
      <ul className="overflow-hidden rounded-2xl border border-border bg-card empty:hidden">
        {pendientes?.map((s) => (
          <li key={s.id} className="border-b border-border last:border-0">
            <Link href={`/admin/${s.id}`} className="flex items-center justify-between gap-3 p-4 no-underline hover:bg-muted">
              <span className="flex flex-col gap-1">
                <b className="text-lg">{(s.datos_declarados as { nombre_comercial?: string }).nombre_comercial ?? "Sin nombre"}</b>
                <span className="text-[0.9375rem] text-muted-foreground">{TIPO_DOCUMENTO[s.tipo_documento]} · RUC <Mono>{s.ruc}</Mono></span>
                <span className="flex flex-wrap items-center gap-2 text-[0.9375rem] text-muted-foreground">
                  <InsigniaConfianza confianza={s.confianza} /> <Mono>{fechaLegible(s.created_at.slice(0, 10))}</Mono>
                </span>
              </span>
              <ChevronRight aria-hidden className="size-5 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-2 text-[1.1875rem] font-semibold tracking-tight">Opiniones · por revisar {resenas?.length ?? 0}</h2>
      {!resenas?.length && <p className="text-muted-foreground">No hay opiniones pendientes ni reportadas.</p>}
      <ul className="overflow-hidden rounded-2xl border border-border bg-card empty:hidden">
        {resenas?.map((r) => (
          <li key={r.id} className="border-b border-border last:border-0">
            <Link href={`/admin/resena/${r.id}`} className="flex items-center justify-between gap-3 p-4 no-underline hover:bg-muted">
              <span className="flex flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <b>{r.estrellas} de 5</b>
                  <ChipProceso tipo={r.estado === "reportada" ? "corregir" : "revision"} texto={r.estado === "reportada" ? "Reportada" : "Pendiente"} />
                </span>
                <span className="text-[0.9375rem] text-muted-foreground">{r.comentario?.slice(0, 80) ?? "Sin comentario"} · <Mono>{fechaLegible(r.created_at.slice(0, 10))}</Mono></span>
              </span>
              <ChevronRight aria-hidden className="size-5 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-2 text-[1.1875rem] font-semibold tracking-tight">Servicios · por publicar {servicios?.length ?? 0}</h2>
      {!servicios?.length && <p className="text-muted-foreground">No hay servicios pendientes.</p>}
      <ul className="overflow-hidden rounded-2xl border border-border bg-card empty:hidden">
        {servicios?.map((x) => (
          <li key={x.id} className="border-b border-border last:border-0">
            <Link href={`/admin/servicio/${x.id}`} className="flex items-center justify-between gap-3 p-4 no-underline hover:bg-muted">
              <span className="flex flex-col gap-1"><b>{x.nombre}</b><span className="text-[0.9375rem] text-muted-foreground">{nombreDe(x)} · <Mono>{fechaLegible(x.created_at.slice(0, 10))}</Mono></span></span>
              <ChevronRight aria-hidden className="size-5 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-2 text-[1.1875rem] font-semibold tracking-tight">Perfiles · cambios por aprobar {cambios?.length ?? 0}</h2>
      {!cambios?.length && <p className="text-muted-foreground">No hay cambios de perfil pendientes.</p>}
      <ul className="overflow-hidden rounded-2xl border border-border bg-card empty:hidden">
        {cambios?.map((x) => (
          <li key={x.id} className="border-b border-border last:border-0">
            <Link href={`/admin/cambio/${x.id}`} className="flex items-center justify-between gap-3 p-4 no-underline hover:bg-muted">
              <span className="flex flex-col gap-1"><b>{nombreDe(x)}</b><span className="text-[0.9375rem] text-muted-foreground">Contacto, redes o presentación · <Mono>{fechaLegible(x.created_at.slice(0, 10))}</Mono></span></span>
              <ChevronRight aria-hidden className="size-5 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-2 text-[1.1875rem] font-semibold tracking-tight">Consultas · últimos 7 días {consultas?.length ?? 0}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["tipo_entrada", "estado_resultado"] as const).map((k) => (
          <Tarjeta key={k} className="p-4">
            <h3 className="mb-2 font-semibold">{k === "tipo_entrada" ? "Por tipo de búsqueda" : "Por resultado"}</h3>
            <ul className="flex flex-col gap-1 text-[0.9375rem]">
              {cuenta(k).map(([n, c]) => <li key={n} className="flex justify-between gap-3"><span>{n.replaceAll("_", " ")}</span><Mono>{c}</Mono></li>)}
              {!consultas?.length && <li className="text-muted-foreground">Sin consultas.</li>}
            </ul>
          </Tarjeta>
        ))}
      </div>
      <Fiscalizacion destino={DESTINOS.some((d) => d.id === sp.d) ? String(sp.d) : undefined} error={typeof sp.error === "string" ? sp.error : undefined} />
    </Pagina>
  );
}
