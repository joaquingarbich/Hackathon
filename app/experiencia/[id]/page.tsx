import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import { Ilustracion, claveIlustracion } from "@/components/ilustracion";
import { BotonGuardar } from "@/components/guardados";
import { PanelConsulta } from "@/components/consulta-proveedor";
import { Opiniones } from "@/components/opiniones";
import { nombreDestino } from "@/components/catalogo";
import { Contenedor, InsigniaEstado, NotaValoracion, etiquetaValoracion } from "@/components/ui";
import { ETIQUETA_CATALOGO, TEXTO_CATALOGO, TEXTO_ESTADO } from "@/config/textos";
import { cargarServicio } from "@/lib/catalogo";
import { hoyLima } from "@/lib/consultas";

// W04 Experiencia: ficha del servicio + "Ofrecido por" con su estado + panel de consulta (WhatsApp / llamada).
export default function Experiencia({ params }: PageProps<"/experiencia/[id]">) {
  return (
    <Suspense fallback={<Contenedor className="py-8"><p role="status" className="text-texto-suave">Cargando…</p></Contenedor>}>
      <Ficha params={params} />
    </Suspense>
  );
}

type Paso = { titulo?: string; detalle?: string };

async function Ficha({ params }: Pick<PageProps<"/experiencia/[id]">, "params">) {
  const { id } = await params;
  const s = await cargarServicio(id);
  if (!s) notFound();
  const p = s.proveedor;
  const lugar = nombreDestino(s.destino);
  const itinerario = (Array.isArray(s.itinerario) ? s.itinerario : []) as Paso[];
  const clave = claveIlustracion(s.ilustracion, s.categoria, s.destino);
  const datos = [
    ["Duración", s.duracion],
    ["Horario", s.salidas],
    ["Temporada", s.temporada],
    ["Idiomas", s.idiomas.join(", ")],
    ["Grupo", s.grupo_max && `Hasta ${s.grupo_max} ${s.grupo_max === 1 ? "persona" : "personas"}`],
  ].filter(([, v]) => v) as [string, string][];
  const h2 = "text-[1.375rem] font-bold sm:text-[1.75rem]";

  return (
    <Contenedor className="flex flex-col gap-6 pt-5 pb-28 md:pb-16">
      <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1 text-[0.9375rem] text-texto-suave">
        <Link href="/">Inicio</Link><ChevronRight aria-hidden className="size-4" />
        <Link href={`/explorar?d=${s.destino}`}>{lugar}</Link><ChevronRight aria-hidden className="size-4" />
        <span aria-current="page" className="text-texto">{s.nombre}</span>
      </nav>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="max-w-4xl text-[2rem] font-extrabold sm:text-[2.75rem]">{s.nombre}</h1>
          <BotonGuardar item={{ href: `/experiencia/${s.id}`, nombre: s.nombre, detalle: `${p.nombre} · ${lugar}` }} />
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {p.valoracion.promedio !== null && (
            <a href="#t-opiniones" className="flex min-h-11 items-center gap-2 no-underline">
              <NotaValoracion promedio={p.valoracion.promedio} />
              <span><b>{etiquetaValoracion(p.valoracion.promedio)}</b> · {p.valoracion.n} opiniones</span>
            </a>
          )}
          <span>{TEXTO_CATALOGO.ofrecidoPor} <Link href={`/prestador/${p.id}`} className="font-bold">{p.nombre}</Link> · {lugar}</span>
        </div>
        <details className="self-start">
          <summary className="flex min-h-11 cursor-pointer items-center">
            <InsigniaEstado estado={p.estado} texto={`${ETIQUETA_CATALOGO[p.estado] ?? TEXTO_ESTADO[p.estado].titulo} · ${TEXTO_CATALOGO.queEs}`} />
          </summary>
          <div className="mt-1.5 max-w-md rounded-control border-[1.5px] border-borde bg-superficie p-3.5 text-[0.9375rem]">
            {TEXTO_ESTADO[p.estado].resumen.replace(" {fecha}", "")}{" "}
            <Link href={`/prestador/${p.id}`} className="font-bold">{TEXTO_CATALOGO.verDictamen}</Link>
          </div>
        </details>
      </div>

      <div className="h-56 overflow-hidden rounded-[1.125rem] sm:h-72">
        <Ilustracion clave={clave} etiqueta={s.nombre} />
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-7">
          {datos.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]">
              {datos.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 rounded-[0.875rem] border border-separador bg-superficie p-3.5">
                  <dt className="text-[0.875rem] text-texto-suave">{k}</dt>
                  <dd className="text-[1.0625rem] font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {s.descripcion && <p className="max-w-3xl text-lg leading-relaxed">{s.descripcion}</p>}

          {(s.incluye.length > 0 || s.no_incluye.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[[TEXTO_CATALOGO.incluye, s.incluye], [TEXTO_CATALOGO.noIncluye, s.no_incluye]].map(([t, l]) =>
                (l as string[]).length ? (
                  <section key={t as string} className="flex flex-col gap-2.5 rounded-tarjeta border border-separador bg-superficie p-4.5">
                    <h2 className="text-xl font-bold">{t as string}</h2>
                    <ul className="list-disc pl-5 leading-relaxed">{(l as string[]).map((x) => <li key={x}>{x}</li>)}</ul>
                  </section>
                ) : null,
              )}
            </div>
          )}

          {itinerario.length > 0 && (
            <section aria-labelledby="t-iti" className="flex flex-col gap-3">
              <h2 id="t-iti" className={h2}>{TEXTO_CATALOGO.itinerario}</h2>
              <ol className="flex list-decimal flex-col gap-2.5 pl-6 text-[1.0625rem]">
                {itinerario.map((x, i) => <li key={i}><b>{x.titulo}</b>{x.detalle && ` · ${x.detalle}`}</li>)}
              </ol>
            </section>
          )}

          {s.punto_encuentro && (
            <section aria-labelledby="t-pe" className="flex flex-wrap overflow-hidden rounded-tarjeta border border-separador bg-superficie">
              <div className="h-40 flex-[1_1_16rem]"><Ilustracion clave={s.destino} etiqueta={`mapa de ${lugar}`} /></div>
              <div className="flex flex-[1_1_16rem] flex-col gap-1.5 p-4.5">
                <h2 id="t-pe" className="text-xl font-bold">{TEXTO_CATALOGO.puntoEncuentro}</h2>
                <p>{s.punto_encuentro}</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.punto_encuentro}, Piura, Perú`)}`} target="_blank" rel="noreferrer"
                  className="flex min-h-11 items-center gap-1.5 font-bold"><MapPin aria-hidden className="size-4" /> {TEXTO_CATALOGO.abrirMapa}</a>
              </div>
            </section>
          )}

          {s.condiciones && (
            <section aria-labelledby="t-cond" className="flex flex-col gap-2">
              <h2 id="t-cond" className={h2}>{TEXTO_CATALOGO.condiciones}</h2>
              <p className="text-[1.0625rem]">{s.condiciones}</p>
            </section>
          )}

          <Opiniones providerId={p.id} puedeOpinar />
        </div>

        <div className="md:w-[22.5rem] md:shrink-0">
          <PanelConsulta servicio={s.nombre} precio={s.precio_ref} unidad={s.unidad_precio} telefono={p.telefono} hoy={hoyLima()} />
        </div>
      </div>
    </Contenedor>
  );
}
