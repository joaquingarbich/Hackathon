import { Suspense } from "react";
import Link from "next/link";
import { Cargando } from "@/components/dictamen";
import { Boton, Campo, ChipProceso, Mono, Pagina, Tarjeta, claseControl, soles } from "@/components/ui";
import { NOMBRE_TIPO, REDES, TEXTO_AGENCIA, DESTINOS } from "@/config/textos";
import { exigirDueno } from "@/lib/agencia";
import type { Perfil } from "@/lib/agencia-validar";
import { proponerPerfil, retirarServicio } from "./acciones";
import { FormularioServicio } from "./formulario-servicio";

const CHIP = { pendiente: "revision", publicado: "aprobado", rechazado: "corregir" } as const;

export default function Agencia({ params, searchParams }: PageProps<"/operador/agencia/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Contenido({ params, searchParams }: Pick<PageProps<"/operador/agencia/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const { proveedor: p, db } = await exigirDueno(id);
  const [{ data: servicios }, { data: cambio }] = await Promise.all([
    db.from("services").select("id, nombre, categoria, destino, precio_ref, unidad_precio, estado, motivo").eq("provider_id", id).order("created_at", { ascending: false }),
    db.from("proveedor_cambios").select("datos, estado, motivo, created_at").eq("provider_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  // El formulario muestra lo propuesto si hay un cambio en revisión; si no, lo publicado.
  const enRevision = cambio?.estado === "pendiente" ? (cambio.datos as Perfil) : null;
  const v = enRevision ?? { descripcion: p.descripcion, telefono: p.telefono, correo: p.correo, web: p.web, direccion: p.direccion, distrito: p.distrito, redes: (p.redes ?? {}) as Record<string, string> };

  return (
    <Pagina>
      <Link href="/operador" className="flex min-h-11 items-center self-start font-bold">← Documentos</Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-[2.125rem] leading-[1.05] font-extrabold">{p.nombre_comercial ?? p.razon_social}</h1>
        <p className="text-texto-suave">{NOMBRE_TIPO[p.tipo]} · RUC <Mono>{p.ruc}</Mono> · <Link href={`/prestador/${p.id}`}>ver como turista</Link></p>
      </div>

      <Tarjeta id="perfil" className="flex flex-col gap-4 p-5">
        <h2 className="text-[1.375rem] font-bold">{TEXTO_AGENCIA.perfil}</h2>
        <p className="text-[0.9375rem] text-texto-suave">{TEXTO_AGENCIA.ayudaPerfil}</p>
        {enRevision && <ChipProceso tipo="revision" texto={TEXTO_AGENCIA.cambioPendiente} />}
        {cambio?.estado === "rechazado" && cambio.motivo && <p className="text-observaciones">Último cambio no aprobado: {cambio.motivo}</p>}
        {ok === "perfil" && <p role="status" className="text-verificado">{TEXTO_AGENCIA.enviado}</p>}
        {error && <p role="alert" className="text-alerta">{String(error)}</p>}
        <form action={proponerPerfil.bind(null, p.id)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="descripcion" className="font-semibold">Presentación</label>
            <textarea id="descripcion" name="descripcion" rows={4} maxLength={1000} defaultValue={v.descripcion ?? ""} className={`${claseControl} py-3`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="telefono" name="telefono" type="tel" etiqueta="Celular (WhatsApp)" defaultValue={v.telefono ?? ""} maxLength={15} />
            <Campo id="correo" name="correo" type="email" etiqueta="Correo" defaultValue={v.correo ?? ""} maxLength={120} />
            <Campo id="web" name="web" type="url" etiqueta="Web" placeholder="https://" defaultValue={v.web ?? ""} maxLength={200} />
            <Campo id="distrito" name="distrito" etiqueta="Distrito" defaultValue={v.distrito ?? ""} maxLength={60} />
          </div>
          <Campo id="direccion" name="direccion" etiqueta="Dirección del local" defaultValue={v.direccion ?? ""} maxLength={150} />
          <div className="grid gap-4 sm:grid-cols-3">
            {REDES.map((r) => <Campo key={r} id={r} name={r} etiqueta={r[0].toUpperCase() + r.slice(1)} placeholder="@cuenta" defaultValue={v.redes?.[r] ?? ""} maxLength={31} />)}
          </div>
          <Boton type="submit" className="self-start">Enviar cambios para revisión</Boton>
        </form>
      </Tarjeta>

      <section id="servicios" className="flex flex-col gap-3">
        <h2 className="text-[1.375rem] font-bold">{TEXTO_AGENCIA.servicios}</h2>
        <p className="text-[0.9375rem] text-texto-suave">{TEXTO_AGENCIA.ayudaServicios}</p>
        {!!servicios?.length && (
          <ul className="overflow-hidden rounded-tarjeta border border-separador bg-superficie">
            {servicios.map((s) => (
              <li key={s.id} className="flex flex-col gap-1.5 border-b border-separador p-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b>{s.nombre}</b>
                  <ChipProceso tipo={CHIP[s.estado as keyof typeof CHIP] ?? "revision"} texto={TEXTO_AGENCIA.estadoServicio[s.estado]} />
                </div>
                <p className="text-[0.9375rem] text-texto-suave">
                  {DESTINOS.find((d) => d.id === s.destino)?.nombre}{s.precio_ref !== null && ` · ${soles(s.precio_ref)} ${s.unidad_precio}`}
                  {s.estado === "publicado" && <> · <Link href={`/experiencia/${s.id}`}>ver en el catálogo</Link></>}
                </p>
                {s.estado === "rechazado" && s.motivo && <p className="text-[0.9375rem] text-observaciones">{s.motivo}</p>}
                <form action={retirarServicio.bind(null, p.id, s.id)}>
                  <button className="min-h-11 cursor-pointer text-[0.9375rem] text-texto-suave underline">Retirar</button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <Tarjeta className="flex flex-col gap-3 p-5">
          <h3 className="text-lg font-bold">Nuevo servicio</h3>
          <FormularioServicio providerId={p.id} tipo={p.tipo} />
        </Tarjeta>
      </section>
    </Pagina>
  );
}
