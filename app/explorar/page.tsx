import { Suspense } from "react";
import Link from "next/link";
import { Buscador, TarjetaProveedor, TarjetaServicio, claseRejilla, nombreDestino } from "@/components/catalogo";
import { Contenedor } from "@/components/ui";
import { CATEGORIAS, DESTINOS, TEXTO_CATALOGO, type Categoria } from "@/config/textos";
import { listarServicios } from "@/lib/catalogo";

// W02 Resultados: categoría (c), destino (d), texto (q) y orden (o) en la URL; sin JS funciona igual.
export default function Explorar({ searchParams }: PageProps<"/explorar">) {
  return (
    <Contenedor className="flex flex-col gap-6 py-6 sm:py-8">
      <Suspense fallback={<p role="status" className="text-texto-suave">Cargando catálogo…</p>}>
        <Resultados searchParams={searchParams} />
      </Suspense>
    </Contenedor>
  );
}

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function Resultados({ searchParams }: Pick<PageProps<"/explorar">, "searchParams">) {
  const sp = await searchParams;
  const categoria = CATEGORIAS.find((c) => c.id === uno(sp.c))?.id as Categoria | undefined;
  const destino = DESTINOS.find((d) => d.id === uno(sp.d))?.id;
  const q = uno(sp.q).trim().slice(0, 60);
  const orden = uno(sp.o) === "precio" ? "precio" : "valoradas";
  const r = await listarServicios({ categoria, destino, q, orden });

  const url = (cambios: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const v = { c: categoria, d: destino, q: q || undefined, o: orden === "precio" ? "precio" : undefined, ...cambios };
    for (const [k, x] of Object.entries(v)) if (x) p.set(k, x);
    const s = p.toString();
    return s ? `/explorar?${s}` : "/explorar";
  };
  const titulo = [CATEGORIAS.find((c) => c.id === categoria)?.nombre ?? "Todo el catálogo", destino && `en ${nombreDestino(destino)}`].filter(Boolean).join(" ");
  const n = r.disponible ? r.servicios.length : r.proveedores.length;
  const chip = "inline-flex min-h-11 items-center rounded-full border-[1.5px] px-4 font-bold no-underline";

  return (
    <>
      <h1 className="text-[1.75rem] font-extrabold sm:text-[2.25rem]">{titulo}</h1>
      <Buscador destino={destino} q={q} categoria={categoria} compacto />
      <nav aria-label="Categorías" className="flex flex-wrap gap-2">
        <Link href={url({ c: undefined })} aria-current={!categoria ? "page" : undefined}
          className={`${chip} ${!categoria ? "border-primario bg-primario text-sobre-primario" : "border-borde bg-superficie"}`}>Todo</Link>
        {CATEGORIAS.map((c) => (
          <Link key={c.id} href={url({ c: c.id })} aria-current={categoria === c.id ? "page" : undefined}
            className={`${chip} ${categoria === c.id ? "border-primario bg-primario text-sobre-primario" : "border-borde bg-superficie"}`}>
            {c.nombre}
          </Link>
        ))}
      </nav>

      {!r.disponible && <p className="rounded-control bg-relleno p-3 text-texto-suave">{TEXTO_CATALOGO.respaldoAviso}</p>}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold" role="status">
          {n} {r.disponible ? (n === 1 ? "servicio" : "servicios") : n === 1 ? "proveedor" : "proveedores"}
          {r.disponible && <span className="font-normal text-texto-suave"> · {orden === "precio" ? "menor precio primero" : "mejor valorados primero"}</span>}
        </p>
        {r.disponible && (
          <Link href={url({ o: orden === "precio" ? undefined : "precio" })} className="flex min-h-11 items-center font-bold">
            Ordenar por {orden === "precio" ? "valoración" : "precio"}
          </Link>
        )}
      </div>

      {n === 0 ? (
        <p className="text-texto-suave">{TEXTO_CATALOGO.sinResultados}</p>
      ) : (
        <div className={claseRejilla}>
          {r.disponible ? r.servicios.map((s) => <TarjetaServicio key={s.id} s={s} />) : r.proveedores.map((p) => <TarjetaProveedor key={p.id} p={p} />)}
        </div>
      )}
      {r.disponible && <p className="text-[0.875rem] text-texto-suave">{TEXTO_CATALOGO.precioNota}</p>}
    </>
  );
}
