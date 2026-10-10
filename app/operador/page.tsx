import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Cargando } from "@/components/dictamen";
import { ChipProceso, InsigniaEstado, Mono, Pagina, Tarjeta } from "@/components/ui";
import { TEXTO_OPERADOR, TIPO_DOCUMENTO, type Estado } from "@/config/textos";
import { exigirUsuario } from "@/lib/sesion";
import { cargarPrestador, hoyLima } from "@/lib/consultas";
import { dictamenPrestador, fechaLegible } from "@/lib/dictamen";
import { supabasePublico } from "@/lib/supabase/publico";
import { salir } from "../ingresar/acciones";
import { FormularioSolicitud } from "./formulario";

// P05 Inicio del proveedor + P07 Documentos (una sola página: aún no hay Unidades ni Perfil, ver PENDIENTE.md).
export default function Operador() {
  return (
    <Suspense fallback={<Cargando />}>
      <Panel />
    </Suspense>
  );
}

const CHIP = { pendiente: "revision", aprobado: "aprobado", rechazado: "corregir" } as const;

/** Lo que ve hoy un turista que consulta este RUC. */
async function estadoPublico(ruc: string): Promise<Estado> {
  await connection();
  const { data } = await supabasePublico().from("providers").select("id").eq("ruc", ruc).limit(1).maybeSingle();
  const d = data && (await cargarPrestador(data.id));
  return d ? dictamenPrestador(d.prestador, d.autorizaciones, d.ruc, hoyLima()).estado : "no_encontrado";
}

async function Panel() {
  const u = await exigirUsuario();
  const { data: solicitudes } = await u.supabase
    .from("submissions")
    .select("id, ruc, tipo_documento, estado, motivo, created_at, vence_el")
    .eq("user_id", u.id)
    .order("created_at", { ascending: false });
  const ruc = solicitudes?.[0]?.ruc;
  const estado = ruc ? await estadoPublico(ruc) : null;

  return (
    <Pagina>
      <div className="flex flex-wrap items-center justify-between gap-3 text-[0.9375rem] text-texto-suave">
        <span className="truncate">{u.email}</span>
        <div className="flex shrink-0 items-center gap-3">
          {u.esAdmin && <Link className="font-bold text-texto" href="/admin">Panel de validación</Link>}
          <form action={salir}><button className="min-h-11 cursor-pointer underline">Salir</button></form>
        </div>
      </div>

      {ruc && estado && (
        <Tarjeta className="flex flex-col gap-2 p-5">
          <span className="text-[0.9375rem] text-texto-suave">RUC <Mono className="font-semibold text-texto">{ruc}</Mono></span>
          <h2 className="font-base text-lg font-bold tracking-normal">Lo que ve hoy un turista</h2>
          <InsigniaEstado estado={estado} />
          {estado === "no_encontrado" && <p className="text-[0.9375rem] text-texto-suave">Sube tu constancia para pasar a «En proceso de actualización».</p>}
        </Tarjeta>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-[2.125rem] leading-[1.05] font-extrabold">Documentos</h1>
        <p className="text-texto-suave">{TEXTO_OPERADOR.ayudaPanel}</p>
      </div>

      {!!solicitudes?.length && (
        <section aria-label="Documentos enviados" className="overflow-hidden rounded-tarjeta border border-separador bg-superficie">
          {solicitudes.map((s) => (
            <div key={s.id} className="flex flex-col gap-1.5 border-b border-separador p-4 last:border-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <b>{TIPO_DOCUMENTO[s.tipo_documento]}</b>
                <ChipProceso tipo={CHIP[s.estado as keyof typeof CHIP] ?? "revision"} />
              </div>
              <p className="text-[0.9375rem] text-texto-suave">RUC <Mono>{s.ruc}</Mono> · enviada el <Mono>{fechaLegible(s.created_at.slice(0, 10))}</Mono></p>
              {s.estado === "aprobado" && s.vence_el && <p className="text-[0.9375rem]">Visible como «En proceso de actualización» hasta el <Mono>{fechaLegible(s.vence_el)}</Mono>.</p>}
              {s.estado === "rechazado" && s.motivo && <p className="text-[0.9375rem] text-observaciones">{s.motivo}</p>}
            </div>
          ))}
        </section>
      )}

      <Tarjeta className="flex flex-col gap-3 p-5">
        <h2 className="text-[1.375rem] font-bold">Subir un documento</h2>
        <FormularioSolicitud usuarioId={u.id} />
        <p className="text-[0.9375rem] text-texto-suave">{TEXTO_OPERADOR.privacidad}</p>
      </Tarjeta>
      <Tarjeta className="bg-relleno text-[0.9375rem]">
        <b>Para que se valide más rápido:</b> mejor el PDF con firma digital. Si es foto: completa, nítida y con el número legible.
      </Tarjeta>
    </Pagina>
  );
}
