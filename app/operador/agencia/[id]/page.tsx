import { Suspense } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Cargando } from "@/components/dictamen";
import { Boton, Campo, ChipProceso, Mono, Pagina, Tarjeta, Textarea, Aviso, Button, Encabezado, Label, claseBoton } from "@/components/ui";
import { NOMBRE_TIPO, REDES, TEXTO_AGENCIA, DESTINOS } from "@/config/textos";
import { exigirDueno } from "@/lib/agencia";
import type { Perfil } from "@/lib/agencia-validar";
import { proponerPerfil, retirarServicio } from "./acciones";
import { FormularioServicio } from "./formulario-servicio";
import { SeccionesVerificables, Vencimientos } from "./secciones";
import { hoyLima } from "@/lib/consultas";

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
  const [{ data: canalesTodos }, { data: vehiculosTodos }, { data: personalTodo }, { data: destinosSel }, { data: auts }] = await Promise.all([
    db.from("canales").select("id, tipo, visible, estado, motivo").eq("provider_id", id).order("created_at"),
    db.from("vehicles").select("id, placa, aprobacion, motivo, source_id, soat_vencimiento, citv_vencimiento, habilitacion_vencimiento").eq("provider_id", id).order("placa"),
    db.from("personal").select("id, nombre, rol, dni_ultimos3, estado, motivo, carne_vence").eq("provider_id", id).order("nombre"),
    db.from("empresa_destinos").select("destino").eq("provider_id", id),
    db.from("authorizations").select("tipo, fecha_vencimiento").eq("provider_id", id),
  ]);
  const verificables = {
    providerId: id, hoy: hoyLima(), destinos: (destinosSel ?? []).map((d) => d.destino),
    canales: canalesTodos ?? [], vehiculos: vehiculosTodos ?? [], personal: personalTodo ?? [], autorizaciones: auts ?? [],
  };
  const [{ data: servicios }, { data: cambio }] = await Promise.all([
    db.from("services").select("id, nombre, categoria, destino, precio_ref, unidad_precio, estado, motivo").eq("provider_id", id).order("created_at", { ascending: false }),
    db.from("proveedor_cambios").select("datos, estado, motivo, created_at").eq("provider_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  // El formulario muestra lo propuesto si hay un cambio en revisión; si no, lo publicado.
  const enRevision = cambio?.estado === "pendiente" ? (cambio.datos as Perfil) : null;
  const v = enRevision ?? { descripcion: p.descripcion, telefono: p.telefono, correo: p.correo, web: p.web, direccion: p.direccion, distrito: p.distrito, redes: (p.redes ?? {}) as Record<string, string> };

  return (
    <Pagina>
      <Link href="/operador" className="inline-flex min-h-11 items-center gap-1.5 self-start font-medium text-muted-foreground no-underline hover:text-foreground">← Tu panel</Link>
      <Encabezado eyebrow={NOMBRE_TIPO[p.tipo]} titulo={p.nombre_comercial ?? p.razon_social} bajada={<>RUC <Mono>{p.ruc}</Mono></>}>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Link href={`/prestador/${p.id}`} className={claseBoton("secundario")}><Eye aria-hidden /> Ver como turista</Link>
        </div>
      </Encabezado>

      <Vencimientos {...verificables} />
      <SeccionesVerificables {...verificables} />

      <Tarjeta id="perfil" className="flex flex-col gap-4">
        <h2 className="text-[1.1875rem] font-semibold tracking-tight">{TEXTO_AGENCIA.perfil}</h2>
        <p className="text-[0.9375rem] text-muted-foreground">{TEXTO_AGENCIA.ayudaPerfil}</p>
        {enRevision && <ChipProceso tipo="revision" texto={TEXTO_AGENCIA.cambioPendiente} />}
        {cambio?.estado === "rechazado" && cambio.motivo && <p className="rounded-lg bg-observaciones-fondo px-3 py-2 text-[0.9375rem] text-observaciones">Último cambio no aprobado: {cambio.motivo}</p>}
        {ok === "perfil" && <Aviso tipo="ok">{TEXTO_AGENCIA.enviado}</Aviso>}
        {error && <Aviso tipo="error">{String(error)}</Aviso>}
        <form action={proponerPerfil.bind(null, p.id)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descripcion">Presentación</Label>
            <Textarea id="descripcion" name="descripcion" rows={4} maxLength={1000} defaultValue={v.descripcion ?? ""} />
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
        <h2 className="text-[1.1875rem] font-semibold tracking-tight">{TEXTO_AGENCIA.servicios}</h2>
        <p className="text-[0.9375rem] text-muted-foreground">{TEXTO_AGENCIA.ayudaServicios}</p>
        {!!servicios?.length && (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-suave">
            {servicios.map((s) => (
              <li key={s.id} className="flex flex-col gap-1.5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b className="font-semibold">{s.nombre}</b>
                  <ChipProceso tipo={CHIP[s.estado as keyof typeof CHIP] ?? "revision"} texto={TEXTO_AGENCIA.estadoServicio[s.estado]} />
                </div>
                <p className="text-[0.9375rem] text-muted-foreground">
                  {DESTINOS.find((d) => d.id === s.destino)?.nombre}
                  {s.estado === "publicado" && <> · <Link href={`/prestador/${p.id}`}>ver en tu ficha</Link></>}
                </p>
                {s.estado === "rechazado" && s.motivo && <p className="text-[0.9375rem] text-observaciones">{s.motivo}</p>}
                <form action={retirarServicio.bind(null, p.id, s.id)}>
                  <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground">Retirar</Button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <Tarjeta className="flex flex-col gap-3 bg-muted/40 shadow-none">
          <h3 className="text-[1.0625rem] font-semibold">Nuevo servicio</h3>
          <FormularioServicio providerId={p.id} tipo={p.tipo} />
        </Tarjeta>
      </section>
    </Pagina>
  );
}
