import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Cargando } from "@/components/dictamen";
import { Tarjeta } from "@/components/ui";
import { CATEGORIAS, NOMBRE_TIPO } from "@/config/textos";
import { supabasePublico } from "@/lib/supabase/publico";

// ponytail: filtra por tipo/actividades de providers; pasar a una tabla `services` (PENDIENTE.md) cuando las agencias registren su catálogo.
export default function Explorar({ searchParams }: PageProps<"/explorar">) {
  return (
    <>
      <h1 className="text-2xl font-semibold">Explorar por servicio</h1>
      <p className="text-texto-suave">Elige qué buscas y revisa a los prestadores registrados. Abre cada uno para ver su dictamen de formalidad.</p>
      <Suspense fallback={<Cargando />}>
        <Resultados searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Resultados({ searchParams }: Pick<PageProps<"/explorar">, "searchParams">) {
  const { c: elegida } = await searchParams;
  const sel = CATEGORIAS.find((c) => c.id === elegida) ?? null;
  let q = supabasePublico().from("providers").select("id, tipo, nombre_comercial, razon_social, distrito, provincia, actividades").order("nombre_comercial").limit(50);
  if (sel && "tipo" in sel) q = q.eq("tipo", sel.tipo);
  if (sel && "actividad" in sel) q = q.contains("actividades", [sel.actividad]);
  const { data } = sel ? await q : { data: [] };

  return (
    <>
      <nav aria-label="Categorías" className="flex flex-wrap gap-2">
        {CATEGORIAS.map((c) => (
          <Link key={c.id} href={`/explorar?c=${c.id}`} aria-current={sel?.id === c.id ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${sel?.id === c.id ? "border-primario bg-primario text-sobre-primario" : "border-borde bg-superficie hover:bg-fondo"}`}>
            {c.nombre}
          </Link>
        ))}
      </nav>
      {sel && !data?.length && <p className="text-texto-suave">Aún no hay prestadores registrados en «{sel.nombre}».</p>}
      <ul className="flex flex-col gap-2">
        {data?.map((p) => (
          <li key={p.id}>
            <Link href={`/prestador/${p.id}`} className="block">
              <Tarjeta className="flex items-center justify-between gap-3 transition-colors duration-200 hover:bg-fondo">
                <span>
                  <span className="block font-semibold">{p.nombre_comercial ?? p.razon_social}</span>
                  <span className="block text-sm text-texto-suave">
                    {[NOMBRE_TIPO[p.tipo], p.distrito ?? p.provincia, p.actividades.join(", ").replaceAll("_", " ")].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0" />
              </Tarjeta>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
