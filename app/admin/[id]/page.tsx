import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, CircleHelp, OctagonAlert, TriangleAlert, ExternalLink } from "lucide-react";
import { Cargando, Datos } from "@/components/dictamen";
import { Boton, Mono, Pagina, Plegable, Tarjeta, claseControl } from "@/components/ui";
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
  const grupos = {
    revisar: capas.filter((c) => c.resultado === "aviso" || c.resultado === "alerta"),
    cumplen: capas.filter((c) => c.resultado === "ok"),
    noAplica: capas.filter((c) => c.resultado === "no_evaluado"),
  };

  return (
    <Pagina>
      <Link href="/admin" className="flex min-h-11 items-center self-start font-bold">← Documentos</Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-[2.125rem] leading-[1.05] font-extrabold">{d.nombre_comercial ?? "Sin nombre"}</h1>
        <p className="text-[1.0625rem] text-texto-suave">{TIPO_DOCUMENTO[s.tipo_documento]} · RUC <Mono>{s.ruc}</Mono></p>
      </div>

      <Tarjeta className="flex flex-col gap-2">
        <h2 className="font-base text-lg font-bold tracking-normal">Confianza del documento</h2>
        <InsigniaConfianza confianza={s.confianza} />
        {capas.length > 0 && (
          <p className="text-[0.9375rem] text-texto-suave">
            {grupos.cumplen.length} capas cumplen, {grupos.revisar.length} piden tu revisión, {grupos.noAplica.length} no aplican.
          </p>
        )}
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3">
        <h2 className="text-[1.375rem] font-bold">Documento</h2>
        {firmada?.signedUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal, no optimizable */}
            {esImagen && <img src={firmada.signedUrl} alt="Documento subido por el proveedor" className="max-h-[480px] w-full rounded-control border border-separador object-contain" />}
            <a href={firmada.signedUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 font-bold">
              Ver documento completo <ExternalLink aria-hidden className="size-4" />
            </a>
          </>
        )}
      </Tarjeta>

      <Datos titulo="Declarado por el proveedor" filas={Object.entries(d).map(([k, v]) => [k.replace("_", " "), v])} />
      {ext?.campos && (
        <Datos titulo="Leído del documento" filas={Object.entries(ext.campos).map(([k, v]) => [k.replaceAll("_", " "), String(v ?? "—")])} />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-[1.375rem] font-bold">Capas de verificación</h2>
        {!capas.length && <p className="text-texto-suave">Aún no procesado (revisar el documento a mano).</p>}
        {([["Por revisar", grupos.revisar], ["Cumplen", grupos.cumplen], ["No aplica", grupos.noAplica]] as const).map(([t, lista]) =>
          lista.length ? (
            <Tarjeta key={t} className="flex flex-col gap-3">
              <h3 className="font-base text-lg font-bold tracking-normal">{t} · {lista.length}</h3>
              <ul className="flex flex-col gap-3">
                {lista.map((c) => (
                  <li key={c.id} className="flex gap-2">
                    {ICONO[c.resultado]}
                    <span><b className="block">{c.nombre}</b><span className="text-[0.9375rem] text-texto-suave">{c.detalle}</span></span>
                  </li>
                ))}
              </ul>
            </Tarjeta>
          ) : null,
        )}
      </section>

      {s.estado === "pendiente" ? (
        <Tarjeta className="p-5">
          <form action={resolver} className="flex flex-col gap-3">
            <h2 className="text-[1.375rem] font-bold">Decisión</h2>
            <input type="hidden" name="id" value={s.id} />
            <Boton name="decision" value="aprobado">Aprobar · pasa a «En proceso» por 60 días</Boton>
            <label htmlFor="motivo" className="mt-2 text-[0.9375rem] font-bold">Motivo para el proveedor <span className="font-normal text-texto-suave">(obligatorio para pedir corrección)</span></label>
            <textarea id="motivo" name="motivo" maxLength={500} rows={3} aria-describedby="motivo-ayuda" className={`${claseControl} py-2.5`} />
            <p id="motivo-ayuda" className="text-[0.875rem] text-texto-suave">Lo verá tal cual. Queda registrado con tu usuario y la fecha.</p>
            {errorForm === "motivo" && <p role="alert" className="text-alerta">Indica el motivo.</p>}
            <Boton name="decision" value="rechazado" variante="secundario">Pedir corrección</Boton>
          </form>
        </Tarjeta>
      ) : (
        <Plegable titulo={`Resuelta: ${s.estado}`} abierto>
          <p>{s.motivo ?? "Sin motivo registrado."} · <Mono>{s.revisado_at?.slice(0, 10)}</Mono></p>
        </Plegable>
      )}
    </Pagina>
  );
}
