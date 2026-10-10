import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, CircleHelp, OctagonAlert, TriangleAlert, ExternalLink } from "lucide-react";
import { Cargando, Datos } from "@/components/dictamen";
import { Boton, Plegable, Tarjeta } from "@/components/ui";
import { TIPO_DOCUMENTO } from "@/config/textos";
import { exigirAdmin } from "@/lib/sesion";
import type { Capa } from "@/lib/checks";
import { InsigniaConfianza } from "../confianza";
import { resolver } from "../acciones";

export default function Detalle({ params, searchParams }: PageProps<"/admin/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} searchParams={searchParams} />
    </Suspense>
  );
}

const ICONO = {
  ok: <CircleCheck aria-label="Correcto" className="mt-0.5 size-5 shrink-0 text-verificado" />,
  aviso: <TriangleAlert aria-label="Aviso" className="mt-0.5 size-5 shrink-0 text-observaciones" />,
  alerta: <OctagonAlert aria-label="Alerta" className="mt-0.5 size-5 shrink-0 text-alerta" />,
  no_evaluado: <CircleHelp aria-label="No evaluado" className="mt-0.5 size-5 shrink-0 text-no-encontrado" />,
};

async function Contenido({ params, searchParams }: Pick<PageProps<"/admin/[id]">, "params" | "searchParams">) {
  const admin = await exigirAdmin();
  const { id } = await params;
  const { error: errorForm } = await searchParams;
  const { data: s } = await admin.supabase.from("submissions").select("*").eq("id", id).maybeSingle();
  if (!s) notFound();
  const { data: firmada } = await admin.supabase.storage.from("documentos").createSignedUrl(s.archivo_path, 600);
  const esImagen = /\.(jpe?g|png|webp)$/.test(s.archivo_path);
  const d = s.datos_declarados as Record<string, string>;
  const ext = s.campos_extraidos as { campos?: Record<string, unknown> } | null;
  const capas = (s.resultado_capas ?? []) as Capa[];

  return (
    <>
      <Link href="/admin" className="min-h-11 self-start underline">← Cola de revisión</Link>
      <h1 className="text-2xl font-semibold">{d.nombre_comercial ?? "Sin nombre"} · RUC {s.ruc}</h1>
      <InsigniaConfianza confianza={s.confianza} />

      <Tarjeta className="flex flex-col gap-3">
        <h2 className="font-semibold">Documento</h2>
        <p className="text-sm text-texto-suave">{TIPO_DOCUMENTO[s.tipo_documento]}</p>
        {firmada?.signedUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal, no optimizable */}
            {esImagen && <img src={firmada.signedUrl} alt="Documento subido por el operador" className="max-h-[480px] w-full rounded-control border border-borde object-contain" />}
            <a href={firmada.signedUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 underline">
              Abrir documento <ExternalLink aria-hidden className="size-4" />
            </a>
          </>
        )}
      </Tarjeta>

      <Datos titulo="Declarado por el operador" filas={Object.entries(d).map(([k, v]) => [k.replace("_", " "), v])} />
      {ext?.campos && (
        <Datos titulo="Leído del documento" filas={Object.entries(ext.campos).map(([k, v]) => [k.replaceAll("_", " "), String(v ?? "—")])} />
      )}

      <Tarjeta>
        <h2 className="mb-2 font-semibold">Capas de verificación</h2>
        {!capas.length && <p className="text-texto-suave">Aún no procesado (revisar el documento a mano).</p>}
        <ul className="flex flex-col gap-3">
          {capas.map((c) => (
            <li key={c.id} className="flex gap-2">
              {ICONO[c.resultado]}
              <span><span className="block font-semibold">{c.nombre}</span><span className="text-sm">{c.detalle}</span></span>
            </li>
          ))}
        </ul>
      </Tarjeta>

      {s.estado === "pendiente" ? (
        <Tarjeta>
          <form action={resolver} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={s.id} />
            <label htmlFor="motivo" className="font-semibold">Motivo (obligatorio para rechazar)</label>
            <textarea id="motivo" name="motivo" maxLength={500} rows={3} className="rounded-control border border-borde bg-superficie p-3" />
            {errorForm === "motivo" && <p role="alert" className="text-alerta">Indica el motivo del rechazo.</p>}
            <Boton name="decision" value="aprobado">Aprobar: publicar como «En proceso de actualización»</Boton>
            <Boton name="decision" value="rechazado" variante="secundario">Rechazar</Boton>
          </form>
        </Tarjeta>
      ) : (
        <Plegable titulo={`Resuelta: ${s.estado}`} abierto>
          <p className="text-sm">{s.motivo ?? "Sin motivo registrado."} · {s.revisado_at?.slice(0, 10)}</p>
        </Plegable>
      )}
    </>
  );
}
