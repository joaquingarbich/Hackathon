import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, TriangleAlert, ExternalLink } from "lucide-react";
import { Cargando, Datos } from "@/components/dictamen";
import { Boton, Tarjeta } from "@/components/ui";
import { exigirAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fechaLegible } from "@/lib/dictamen";
import type { Chequeo } from "@/lib/resenas";
import type { CamposComprobante } from "@/lib/vision";
import { moderarResena } from "../acciones";

export default function DetalleResena({ params, searchParams }: PageProps<"/admin/resena/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Contenido({ params, searchParams }: Pick<PageProps<"/admin/resena/[id]">, "params" | "searchParams">) {
  await exigirAdmin(); // antes de cualquier lectura con service role
  const { id } = await params;
  const { error: errorForm } = await searchParams;
  const db = supabaseAdmin();
  const { data: r } = await db.from("reviews").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();
  const [{ data: contacto }, { data: p }, firmada] = await Promise.all([
    db.from("review_contactos").select("nombre, correo, celular, consentimiento_at").eq("review_id", id).maybeSingle(),
    db.from("providers").select("id, ruc, nombre_comercial, razon_social").eq("id", r.provider_id).single(),
    r.comprobante_path ? db.storage.from("documentos").createSignedUrl(r.comprobante_path, 600) : Promise.resolve({ data: null }),
  ]);
  const v = (r.verificacion ?? {}) as { comprobante?: CamposComprobante; chequeos?: Chequeo[] };

  return (
    <>
      <Link href="/admin" className="min-h-11 self-start underline">← Cola de revisión</Link>
      <h1 className="text-2xl font-semibold">Opinión sobre {p?.nombre_comercial ?? p?.razon_social}</h1>
      <p className="text-texto-suave">Estado: {r.estado}{r.motivo && ` · ${r.motivo}`}</p>

      <Datos titulo="Opinión" filas={[
        ["Estrellas", `${r.estrellas} de 5`], ["Comentario", r.comentario], ["Alias", r.alias ?? "Usuario verificado"],
        ["Servicio", r.servicio], ["Fecha del servicio", r.fecha_servicio && fechaLegible(r.fecha_servicio)],
      ]} />

      <Tarjeta className="flex flex-col gap-3">
        <h2 className="font-semibold">Comprobante</h2>
        {firmada.data?.signedUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal, no optimizable */}
            <img src={firmada.data.signedUrl} alt="Comprobante de pago subido" className="max-h-[480px] w-full rounded-control border border-borde object-contain" />
            <a href={firmada.data.signedUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 underline">
              Abrir en tamaño completo <ExternalLink aria-hidden className="size-4" />
            </a>
          </>
        )}
        <ul className="flex flex-col gap-2">
          {(v.chequeos ?? []).map((c) => (
            <li key={c.texto} className="flex gap-2">
              {c.ok ? <CircleCheck aria-label="Correcto" className="mt-0.5 size-5 shrink-0 text-verificado" /> : <TriangleAlert aria-label="Revisar" className="mt-0.5 size-5 shrink-0 text-observaciones" />}
              <span className="text-sm">{c.texto}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-texto-suave">Prestador: RUC {p?.ruc} · Emisor leído: {v.comprobante?.razon_social_emisor ?? "—"}</p>
      </Tarjeta>

      <Datos titulo="Contacto (privado)" filas={[
        ["Nombre", contacto?.nombre], ["Correo", contacto?.correo && <a className="underline" href={`mailto:${contacto.correo}`}>{contacto.correo}</a>],
        ["Celular", contacto?.celular && <a className="underline" href={`tel:${contacto.celular}`}>{contacto.celular}</a>],
        ["Consentimiento", contacto?.consentimiento_at?.slice(0, 10)],
      ]} />

      {(r.estado === "pendiente" || r.estado === "reportada" || r.estado === "visible") && (
        <Tarjeta>
          <form action={moderarResena} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={r.id} />
            <label htmlFor="motivo" className="font-semibold">Motivo (obligatorio para rechazar u ocultar)</label>
            <textarea id="motivo" name="motivo" maxLength={500} rows={2} className="rounded-control border border-borde bg-superficie p-3" />
            {errorForm === "motivo" && <p role="alert" className="text-alerta">Indica el motivo.</p>}
            {r.estado === "pendiente" && <>
              <Boton name="accion" value="publicar">Publicar</Boton>
              <Boton name="accion" value="rechazar" variante="secundario">Rechazar</Boton>
            </>}
            {r.estado === "reportada" && <Boton name="accion" value="mantener">Mantener publicada</Boton>}
            {r.estado !== "pendiente" && <Boton name="accion" value="ocultar" variante="secundario">Ocultar</Boton>}
          </form>
        </Tarjeta>
      )}
    </>
  );
}
