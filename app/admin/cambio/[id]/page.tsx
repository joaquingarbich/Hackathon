import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cargando } from "@/components/dictamen";
import { Mono, Pagina, Tarjeta } from "@/components/ui";
import { exigirAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Perfil } from "@/lib/agencia-validar";
import { resolverCambio } from "../../agencias";
import { FormularioDecision } from "../../formulario-decision";

export default function DetalleCambio({ params, searchParams }: PageProps<"/admin/cambio/[id]">) {
  return <Suspense fallback={<Cargando />}><Contenido params={params} searchParams={searchParams} /></Suspense>;
}

const CAMPOS: [keyof Perfil, string][] = [["descripcion", "Presentación"], ["telefono", "Celular (WhatsApp)"], ["correo", "Correo"], ["web", "Web"], ["direccion", "Dirección"], ["distrito", "Distrito"], ["redes", "Redes"]];
const mostrar = (v: unknown) => (v && typeof v === "object" ? Object.values(v).join(" · ") : String(v ?? "")) || "—";

async function Contenido({ params, searchParams }: Pick<PageProps<"/admin/cambio/[id]">, "params" | "searchParams">) {
  await exigirAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const db = supabaseAdmin();
  const { data: c } = await db.from("proveedor_cambios").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();
  const { data: p } = await db.from("providers").select("*").eq("id", c.provider_id).single();
  const nuevo = c.datos as Perfil;
  const actual: Record<string, unknown> = { ...p, redes: p?.redes };
  return (
    <Pagina>
      <Link href="/admin" className="inline-flex min-h-11 items-center gap-1.5 self-start font-medium text-muted-foreground no-underline hover:text-foreground">← Panel</Link>
      <h1 className="text-[1.75rem] leading-[1.1] font-bold">Cambio de perfil · {p?.nombre_comercial ?? p?.razon_social}</h1>
      <p className="text-muted-foreground">RUC <Mono>{p?.ruc}</Mono> · estado {c.estado}{c.motivo && ` · ${c.motivo}`}</p>
      <Tarjeta>
        <p className="mb-3 text-[0.9375rem] text-muted-foreground">Revisa sobre todo el <b>celular</b> y las <b>redes</b>: el catálogo los usa para el contacto por WhatsApp. Ante la duda, llama al número que ya figura.</p>
        <dl className="flex flex-col gap-3">
          {CAMPOS.map(([k, etiqueta]) => {
            const antes = mostrar(actual[k]), despues = mostrar(nuevo[k]);
            const cambia = antes !== despues;
            return (
              <div key={k} className={cambia ? "rounded-xl bg-observaciones-fondo p-2" : "p-2"}>
                <dt className="text-[0.9375rem] font-semibold">{etiqueta}{cambia && " · cambia"}</dt>
                <dd className="text-[0.9375rem]">{cambia ? <><s className="text-muted-foreground">{antes}</s> → <b>{despues}</b></> : despues}</dd>
              </div>
            );
          })}
        </dl>
      </Tarjeta>
      {c.estado === "pendiente" && <FormularioDecision accion={resolverCambio} id={c.id} aprobar={{ valor: "aprobado", texto: "Aprobar y publicar el perfil" }} error={error === "motivo"} />}
    </Pagina>
  );
}
