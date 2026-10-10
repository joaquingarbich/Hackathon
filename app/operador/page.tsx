import { Suspense } from "react";
import Link from "next/link";
import { Cargando } from "@/components/dictamen";
import { Tarjeta } from "@/components/ui";
import { TEXTO_OPERADOR, TIPO_DOCUMENTO } from "@/config/textos";
import { exigirUsuario } from "@/lib/sesion";
import { fechaLegible } from "@/lib/dictamen";
import { salir } from "../ingresar/acciones";
import { FormularioSolicitud } from "./formulario";

export default function Operador() {
  return (
    <Suspense fallback={<Cargando />}>
      <Panel />
    </Suspense>
  );
}

async function Panel() {
  const u = await exigirUsuario();
  const { data: solicitudes } = await u.supabase
    .from("submissions")
    .select("id, ruc, tipo_documento, estado, motivo, created_at, vence_el")
    .eq("user_id", u.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between gap-3 text-sm text-texto-suave">
        <span className="truncate">{u.email}</span>
        <div className="flex shrink-0 items-center gap-3">
          {u.esAdmin && <Link className="underline" href="/admin">Panel de revisión</Link>}
          <form action={salir}><button className="min-h-11 cursor-pointer underline">Salir</button></form>
        </div>
      </div>
      <h1 className="text-2xl font-semibold">{TEXTO_OPERADOR.tituloPanel}</h1>
      <p className="text-texto-suave">{TEXTO_OPERADOR.ayudaPanel}</p>
      <Tarjeta>
        <FormularioSolicitud usuarioId={u.id} />
        <p className="mt-3 text-sm text-texto-suave">{TEXTO_OPERADOR.privacidad}</p>
      </Tarjeta>
      {!!solicitudes?.length && (
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold">Tus solicitudes</h2>
          {solicitudes.map((s) => (
            <Tarjeta key={s.id} className="text-sm">
              <p className="font-semibold">{TEXTO_OPERADOR.estadoSolicitud[s.estado] ?? s.estado} · RUC {s.ruc}</p>
              <p className="text-texto-suave">{TIPO_DOCUMENTO[s.tipo_documento]} · enviada {fechaLegible(s.created_at.slice(0, 10))}</p>
              {s.estado === "aprobado" && s.vence_el && <p>Visible como «En proceso de actualización» hasta el {fechaLegible(s.vence_el)}.</p>}
              {s.estado === "rechazado" && s.motivo && <p className="text-alerta">Motivo: {s.motivo}</p>}
            </Tarjeta>
          ))}
        </section>
      )}
      <Link href="/" className="min-h-11 self-start underline">Volver a consultar</Link>
    </>
  );
}
