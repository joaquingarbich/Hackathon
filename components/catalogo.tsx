// Piezas del catálogo (mockups W01/W02): buscador, tarjetas de servicio y de proveedor.
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Ilustracion, claveIlustracion } from "@/components/ilustracion";
import { BotonGuardar } from "@/components/guardados";
import { InsigniaEstado, NotaValoracion, claseControl, claseBoton, etiquetaValoracion, soles } from "@/components/ui";
import { CATEGORIAS, DESTINOS, ETIQUETA_CATALOGO, NOMBRE_TIPO, TEXTO_CATALOGO } from "@/config/textos";
import type { Proveedor, TarjetaServicio as Tarjeta } from "@/lib/catalogo";

export const nombreDestino = (id: string | null | undefined) => DESTINOS.find((d) => d.id === id)?.nombre ?? id ?? "";

/** Buscador GET → /explorar. Sin JS funciona igual. */
export function Buscador({ destino = "", q = "", categoria = "", compacto = false }: { destino?: string; q?: string; categoria?: string; compacto?: boolean }) {
  return (
    <form role="search" action="/explorar" className={`flex flex-wrap items-end gap-2.5 rounded-[1.125rem] border-2 border-primario bg-superficie p-3 ${compacto ? "" : "shadow-sm"}`}>
      {categoria && <input type="hidden" name="c" value={categoria} />}
      <div className="flex min-w-[12rem] flex-[1_1_13rem] flex-col gap-1">
        <label htmlFor="b-destino" className="text-[0.9375rem] font-bold">{TEXTO_CATALOGO.destino}</label>
        <select id="b-destino" name="d" defaultValue={destino} className={claseControl}>
          <option value="">{TEXTO_CATALOGO.todoPiura}</option>
          {DESTINOS.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
        </select>
      </div>
      <div className="flex min-w-[12rem] flex-[1_1_13rem] flex-col gap-1">
        <label htmlFor="b-q" className="text-[0.9375rem] font-bold">{TEXTO_CATALOGO.queHacer}</label>
        <input id="b-q" name="q" type="search" defaultValue={q} placeholder={TEXTO_CATALOGO.queHacerEjemplo} maxLength={60} className={claseControl} />
      </div>
      <button className={claseBoton("primario", "flex-[1_1_100%] px-8 sm:flex-none")}>{TEXTO_CATALOGO.buscar}</button>
    </form>
  );
}

export function TarjetaServicio({ s }: { s: Tarjeta }) {
  const href = `/experiencia/${s.id}`;
  const lugar = nombreDestino(s.destino);
  const etiqueta = ETIQUETA_CATALOGO[s.proveedor.estado];
  const { promedio, n } = s.proveedor.valoracion;
  return (
    <Link href={href} className="group flex flex-col overflow-hidden rounded-tarjeta border border-separador bg-superficie no-underline transition-shadow duration-200 hover:shadow-md">
      <div className="relative h-[10.5rem]">
        <Ilustracion clave={claveIlustracion(s.ilustracion, s.categoria, s.destino)} etiqueta={s.nombre} />
        <BotonGuardar flotante item={{ href, nombre: s.nombre, detalle: `${s.proveedor.nombre} · ${lugar}` }} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <b className="text-lg leading-snug group-hover:underline">{s.nombre}</b>
        <span className="text-[0.9375rem] text-texto-suave">{[s.proveedor.nombre, lugar, s.duracion].filter(Boolean).join(" · ")}</span>
        {etiqueta && <span><InsigniaEstado estado={s.proveedor.estado} texto={etiqueta} /></span>}
        {promedio !== null && (
          <span className="flex items-center gap-2 text-[0.9375rem]">
            <NotaValoracion promedio={promedio} /> {etiquetaValoracion(promedio)} · {n}
          </span>
        )}
        {s.precio_ref !== null && (
          <span className="mt-auto pt-1.5">
            <b className="text-xl">{soles(s.precio_ref)}</b> <span className="text-[0.9375rem] text-texto-suave">{s.unidad_precio}</span>
          </span>
        )}
      </div>
    </Link>
  );
}

/** Respaldo mientras no hay tabla services: el proveedor registrado, que abre su dictamen. */
export function TarjetaProveedor({ p }: { p: Proveedor }) {
  const href = `/prestador/${p.id}`;
  const etiqueta = ETIQUETA_CATALOGO[p.estado];
  const categoria = CATEGORIAS.find((c) => (c.tipos as readonly string[]).includes(p.tipo))?.id;
  return (
    <Link href={href} className="group flex flex-col overflow-hidden rounded-tarjeta border border-separador bg-superficie no-underline transition-shadow duration-200 hover:shadow-md">
      <div className="relative h-32">
        <Ilustracion clave={claveIlustracion(null, categoria, null)} etiqueta={p.nombre} />
        <BotonGuardar flotante item={{ href, nombre: p.nombre, detalle: [NOMBRE_TIPO[p.tipo], p.lugar].filter(Boolean).join(" · ") }} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <b className="text-lg leading-snug group-hover:underline">{p.nombre}</b>
        <span className="text-[0.9375rem] text-texto-suave">{[NOMBRE_TIPO[p.tipo], p.lugar].filter(Boolean).join(" · ")}</span>
        {etiqueta && <span><InsigniaEstado estado={p.estado} texto={etiqueta} /></span>}
        <span className="mt-auto flex items-center gap-1 pt-1.5 font-bold">{TEXTO_CATALOGO.verProveedor} <ChevronRight aria-hidden className="size-4" /></span>
      </div>
    </Link>
  );
}

export const claseRejilla = "grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-5";
