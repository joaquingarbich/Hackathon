import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Cargando } from "@/components/dictamen";
import { Tarjeta } from "@/components/ui";
import { TEXTO_RESENA } from "@/config/textos";
import { hoyLima } from "@/lib/consultas";
import { supabasePublico } from "@/lib/supabase/publico";
import { FormularioResena } from "./formulario";

export default function Resena({ params }: PageProps<"/prestador/[id]/resena">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: Pick<PageProps<"/prestador/[id]/resena">, "params">) {
  const { id } = await params;
  await connection();
  const { data: p } = await supabasePublico().from("providers").select("id, ruc, nombre_comercial, razon_social").eq("id", id).maybeSingle();
  if (!p) notFound();
  return (
    <>
      <Link href={`/prestador/${p.id}`} className="min-h-11 self-start underline">← Volver al dictamen</Link>
      <h1 className="text-2xl font-semibold">{TEXTO_RESENA.tituloFormulario}: {p.nombre_comercial ?? p.razon_social}</h1>
      <p className="text-texto-suave">{TEXTO_RESENA.ayudaFormulario}</p>
      <Tarjeta>{p.ruc ? <FormularioResena providerId={p.id} hoy={hoyLima()} /> : <p>{TEXTO_RESENA.sinRuc}</p>}</Tarjeta>
    </>
  );
}
