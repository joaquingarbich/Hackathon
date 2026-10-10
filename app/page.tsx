import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Buscador, TarjetaProveedor, TarjetaServicio, claseRejilla } from "@/components/catalogo";
import { Ilustracion } from "@/components/ilustracion";
import { Contenedor, claseBoton } from "@/components/ui";
import { DESTINOS, TEXTO_CATALOGO } from "@/config/textos";
import { conteoPorDestino, listarServicios } from "@/lib/catalogo";

// W01 Inicio: el catálogo es lo principal; el verificador queda como franja secundaria.
export default function Inicio() {
  return (
    <>
      <section className="bg-portada text-sobre-portada">
        <Contenedor className="flex flex-wrap items-center gap-10 pt-10 pb-24 lg:pt-12">
          <div className="flex flex-[1_1_28rem] flex-col gap-3.5">
            <h1 className="text-[2.125rem] font-extrabold tracking-[-0.03em] sm:text-[3.25rem] sm:leading-[1.02]">{TEXTO_CATALOGO.titular}</h1>
            <p className="text-lg leading-normal text-sobre-portada-suave sm:text-[1.1875rem]">{TEXTO_CATALOGO.bajada}</p>
          </div>
          <div className="hidden h-64 flex-[1_1_25rem] overflow-hidden rounded-sello md:block">
            <Ilustracion clave="ballenas" etiqueta="cola de ballena frente a Los Órganos" />
          </div>
        </Contenedor>
      </section>

      <Contenedor className="-mt-14 flex flex-col gap-2.5">
        <Buscador />
        <details className="max-w-3xl">
          <summary className="flex min-h-11 cursor-pointer items-start gap-2 py-2">
            <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
            <span>{TEXTO_CATALOGO.garantia} <u className="font-bold">{TEXTO_CATALOGO.comoSeRevisa}</u></span>
          </summary>
          <p className="pb-2 pl-7 text-[0.9375rem] text-texto-suave">{TEXTO_CATALOGO.comoSeRevisaTexto}</p>
        </details>
      </Contenedor>

      <Contenedor className="flex flex-col gap-12 pt-8 pb-16">
        <Suspense fallback={<p role="status" className="text-texto-suave">Cargando catálogo…</p>}>
          <Catalogo />
        </Suspense>

        <section aria-labelledby="t-verificar" className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-tarjeta border border-separador bg-superficie px-6 py-5">
          <ShieldCheck aria-hidden className="size-8 shrink-0" strokeWidth={1.8} />
          <div className="flex flex-[1_1_26rem] flex-col gap-1">
            <h2 id="t-verificar" className="font-base text-lg font-bold tracking-normal">{TEXTO_CATALOGO.verificarTitulo}</h2>
            <p className="text-texto-suave">{TEXTO_CATALOGO.verificarTexto}</p>
          </div>
          <Link href="/verificar" className={claseBoton("secundario", "border-primario")}>{TEXTO_CATALOGO.verificarBoton}</Link>
        </section>
      </Contenedor>
    </>
  );
}

async function Catalogo() {
  const [r, conteo] = await Promise.all([listarServicios({ orden: "valoradas", limite: 60 }), conteoPorDestino()]);
  const top = r.disponible ? r.servicios.slice(0, 4) : [];
  return (
    <>
      <section aria-labelledby="t-destinos" className="flex flex-col gap-4">
        <h2 id="t-destinos" className="text-[1.375rem] font-bold sm:text-[2rem]">{TEXTO_CATALOGO.destinos}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
          {DESTINOS.map((d) => (
            <Link key={d.id} href={`/explorar?d=${d.id}`} className="flex flex-col gap-1.5 no-underline">
              <div className="h-28 overflow-hidden rounded-[0.875rem] sm:h-36"><Ilustracion clave={d.id} etiqueta={d.nombre} /></div>
              <b className="text-lg">{d.nombre}</b>
              {conteo[d.id] ? <span className="text-[0.9375rem] text-texto-suave">{conteo[d.id]} {conteo[d.id] === 1 ? "servicio" : "servicios"}</span> : null}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="t-top" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="t-top" className="text-[1.375rem] font-bold sm:text-[2rem]">{r.disponible ? TEXTO_CATALOGO.mejorValoradas : "Proveedores registrados"}</h2>
          <Link href="/explorar" className="flex min-h-11 items-center font-bold">{TEXTO_CATALOGO.verTodas}</Link>
        </div>
        {!r.disponible && <p className="text-texto-suave">{TEXTO_CATALOGO.respaldoAviso}</p>}
        <div className={claseRejilla}>
          {r.disponible
            ? top.map((s) => <TarjetaServicio key={s.id} s={s} />)
            : r.proveedores.slice(0, 8).map((p) => <TarjetaProveedor key={p.id} p={p} />)}
        </div>
      </section>
    </>
  );
}
