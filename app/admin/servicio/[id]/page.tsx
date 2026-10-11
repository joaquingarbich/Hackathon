import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cargando, Datos } from "@/components/dictamen";
import { Pagina, soles } from "@/components/ui";
import { CATEGORIAS, DESTINOS } from "@/config/textos";
import { exigirAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { moderarServicio } from "../../agencias";
import { FormularioDecision } from "../../formulario-decision";

export default function DetalleServicio({ params, searchParams }: PageProps<"/admin/servicio/[id]">) {
  return <Suspense fallback={<Cargando />}><Contenido params={params} searchParams={searchParams} /></Suspense>;
}

async function Contenido({ params, searchParams }: Pick<PageProps<"/admin/servicio/[id]">, "params" | "searchParams">) {
  await exigirAdmin(); // antes de leer con service role
  const { id } = await params;
  const { error } = await searchParams;
  const db = supabaseAdmin();
  const { data: s } = await db.from("services").select("*").eq("id", id).maybeSingle();
  if (!s) notFound();
  const { data: p } = await db.from("providers").select("id, tipo, ruc, nombre_comercial, razon_social").eq("id", s.provider_id).single();
  const itinerario = (s.itinerario ?? []) as { titulo: string; detalle: string }[];
  return (
    <Pagina>
      <Link href="/admin" className="inline-flex min-h-11 items-center gap-1.5 self-start font-medium text-muted-foreground no-underline hover:text-foreground">← Panel</Link>
      <h1 className="text-[1.75rem] leading-[1.1] font-bold">{s.nombre}</h1>
      <p className="text-muted-foreground">De <Link href={`/prestador/${p?.id}`}>{p?.nombre_comercial ?? p?.razon_social}</Link> · RUC {p?.ruc} · estado {s.estado}{s.motivo && ` · ${s.motivo}`}</p>
      <Datos titulo="Ficha" filas={[
        ["Categoría", CATEGORIAS.find((c) => c.id === s.categoria)?.nombre], ["Destino", DESTINOS.find((d) => d.id === s.destino)?.nombre],
        ["Descripción", s.descripcion], ["Duración", s.duracion], ["Horarios", s.salidas], ["Temporada", s.temporada],
        ["Idiomas", s.idiomas.join(", ")], ["Grupo máximo", s.grupo_max], ["Precio", s.precio_ref !== null ? `${soles(s.precio_ref)} ${s.unidad_precio}` : null],
        ["Incluye", s.incluye.join(" · ")], ["No incluye", s.no_incluye.join(" · ")],
        ["Itinerario", itinerario.map((i) => `${i.titulo}${i.detalle ? `: ${i.detalle}` : ""}`).join(" → ")],
        ["Punto de encuentro", s.punto_encuentro], ["Condiciones", s.condiciones],
      ]} />
      {s.estado === "pendiente" && <FormularioDecision accion={moderarServicio} id={s.id} aprobar={{ valor: "publicado", texto: "Publicar en el catálogo" }} error={error === "motivo"} />}
    </Pagina>
  );
}
