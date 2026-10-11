import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Building2, ChevronRight, Eye, FileText, Lightbulb, LogOut, ShieldCheck, Upload } from "lucide-react";
import { Cargando, TituloSeccion } from "@/components/dictamen";
import { Alert, AlertDescription, Button, ChipProceso, Encabezado, InsigniaEstado, Mono, Pagina, Tarjeta } from "@/components/ui";
import { TEXTO_OPERADOR, TIPO_DOCUMENTO, type Estado } from "@/config/textos";
import { exigirUsuario } from "@/lib/sesion";
import { cargarPrestador, hoyLima } from "@/lib/consultas";
import { dictamenPrestador, fechaLegible } from "@/lib/dictamen";
import { supabasePublico } from "@/lib/supabase/publico";
import { salir } from "../ingresar/acciones";
import { FormularioSolicitud } from "./formulario";
import { misProveedores } from "@/lib/agencia";
import { NOMBRE_TIPO, TEXTO_AGENCIA } from "@/config/textos";

// Inicio de la empresa: lo que ve el turista, sus agencias y los documentos enviados.
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
  const agencias = await misProveedores(u.id);
  const ruc = solicitudes?.[0]?.ruc;
  const estado = ruc ? await estadoPublico(ruc) : null;

  return (
    <Pagina>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-2 text-[0.9375rem] shadow-suave">
        <span className="min-w-0 truncate text-muted-foreground">{u.email}</span>
        <div className="flex shrink-0 items-center gap-1">
          {u.esAdmin && <Link className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 font-semibold no-underline hover:bg-muted" href="/admin"><ShieldCheck aria-hidden className="size-4" /> Panel de validación</Link>}
          <form action={salir}><Button variant="ghost" size="sm"><LogOut aria-hidden /> Salir</Button></form>
        </div>
      </div>

      <Encabezado eyebrow="Para empresas" titulo="Tu panel" bajada={TEXTO_OPERADOR.ayudaPanel} />

      {ruc && estado && (
        <Tarjeta className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <TituloSeccion className="flex items-center gap-2"><Eye aria-hidden className="size-5 text-primary" />Lo que ve hoy un turista</TituloSeccion>
            <span className="text-[0.875rem] text-muted-foreground">RUC <Mono className="font-semibold text-foreground">{ruc}</Mono></span>
          </div>
          <InsigniaEstado estado={estado} className="text-[0.9375rem]" />
          {estado === "no_encontrado" && <p className="text-[0.9375rem] text-muted-foreground">Sube tu constancia para pasar a «En proceso de actualización».</p>}
        </Tarjeta>
      )}

      <section aria-labelledby="t-agencias" className="flex flex-col gap-3">
        <TituloSeccion id="t-agencias">{TEXTO_AGENCIA.tuAgencia}</TituloSeccion>
        {!agencias.length && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-input/60 bg-card px-6 py-8 text-center">
            <Building2 aria-hidden className="size-8 text-muted-foreground" />
            <p className="text-[0.9375rem] text-muted-foreground">{TEXTO_AGENCIA.sinAgencia}</p>
          </div>
        )}
        <ul className="flex flex-col gap-2">
          {agencias.map((a) => (
            <li key={a.id}>
              <Link href={`/operador/agencia/${a.id}`} className="pulsable elevable flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-foreground no-underline shadow-suave">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><Building2 aria-hidden className="size-6" /></span>
                <span className="flex min-w-0 flex-col">
                  <b className="font-semibold">{a.nombre_comercial ?? a.razon_social}</b>
                  <span className="text-[0.875rem] text-muted-foreground">{NOMBRE_TIPO[a.tipo]} · RUC <Mono>{a.ruc}</Mono> · perfil, canales, vehículos y personal</span>
                </span>
                <ChevronRight aria-hidden className="ml-auto size-5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="t-docs" className="flex flex-col gap-3">
        <TituloSeccion id="t-docs">Documentos enviados</TituloSeccion>
        {!solicitudes?.length && <p className="text-[0.9375rem] text-muted-foreground">Aún no enviaste documentos.</p>}
        {!!solicitudes?.length && (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-suave">
            {solicitudes.map((s) => (
              <li key={s.id} className="flex gap-3 p-4">
                <FileText aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <b className="font-semibold">{TIPO_DOCUMENTO[s.tipo_documento]}</b>
                    <ChipProceso tipo={CHIP[s.estado as keyof typeof CHIP] ?? "revision"} />
                  </div>
                  <p className="text-[0.875rem] text-muted-foreground">RUC <Mono>{s.ruc}</Mono> · enviada el <Mono>{fechaLegible(s.created_at.slice(0, 10))}</Mono></p>
                  {s.estado === "aprobado" && s.vence_el && <p className="text-[0.9375rem]">Visible como «En proceso de actualización» hasta el <Mono>{fechaLegible(s.vence_el)}</Mono>.</p>}
                  {s.estado === "rechazado" && s.motivo && <p className="rounded-lg bg-observaciones-fondo px-3 py-2 text-[0.9375rem] text-observaciones">{s.motivo}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Tarjeta aria-labelledby="t-subir" className="flex flex-col gap-4">
        <TituloSeccion id="t-subir" className="flex items-center gap-2"><Upload aria-hidden className="size-5 text-primary" />Subir un documento</TituloSeccion>
        <FormularioSolicitud usuarioId={u.id} />
        <p className="text-[0.875rem] text-muted-foreground">{TEXTO_OPERADOR.privacidad}</p>
      </Tarjeta>
      <Alert variant="info">
        <Lightbulb aria-hidden />
        <AlertDescription><b>Para que se valide más rápido:</b> mejor el PDF con firma digital. Si es foto: completa, nítida y con el número legible.</AlertDescription>
      </Alert>
    </Pagina>
  );
}
