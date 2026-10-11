import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import { Cargando } from "@/components/dictamen";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { InsigniaEstado, Pagina, claseBoton } from "@/components/ui";
import { DESTINOS, NOMBRE_TIPO, TEXTO_HOME, nombreDestino } from "@/config/textos";
import { empresasPorDestino } from "@/lib/consultas";

// Directorio (secundario): empresas formales por destino, para contactarlas por su canal oficial.
// Sin precios, sin reseñas, sin rankings.
const TIPOS = ["agencia", "transporte_terrestre", "hospedaje", "restaurante", "guia"];
const chip = "inline-flex min-h-11 items-center rounded-full border px-4 text-[0.9375rem] font-semibold no-underline";

export default function Destinos({ searchParams }: PageProps<"/destinos">) {
  return (
    <Pagina>
      <div className="flex flex-col gap-1">
        <h1 className="text-[2.125rem] leading-[1.05] font-extrabold">{TEXTO_HOME.porDestino}</h1>
        <p className="text-texto-suave">{TEXTO_HOME.porDestinoAyuda}</p>
      </div>
      <Suspense fallback={<Cargando />}><Directorio searchParams={searchParams} /></Suspense>
    </Pagina>
  );
}

async function Directorio({ searchParams }: Pick<PageProps<"/destinos">, "searchParams">) {
  const sp = await searchParams;
  const d = DESTINOS.find((x) => x.id === sp.d)?.id;
  const t = TIPOS.includes(String(sp.t)) ? String(sp.t) : undefined;
  const empresas = d ? await empresasPorDestino(d, t) : [];
  return (
    <>
      <nav aria-label="Destinos" className="flex flex-wrap gap-2">
        {DESTINOS.map((x) => (
          <Link key={x.id} href={`/destinos?d=${x.id}`} aria-current={d === x.id ? "page" : undefined}
            className={`${chip} ${d === x.id ? "border-primario bg-primario text-sobre-primario" : "border-separador bg-superficie"}`}>{x.nombre}</Link>
        ))}
      </nav>
      {d && (
        <>
          <nav aria-label="Tipo de empresa" className="flex flex-wrap gap-2">
            <Link href={`/destinos?d=${d}`} aria-current={!t ? "page" : undefined} className={`${chip} ${!t ? "bg-relleno" : "border-separador"}`}>Todas</Link>
            {TIPOS.map((x) => (
              <Link key={x} href={`/destinos?d=${d}&t=${x}`} aria-current={t === x ? "page" : undefined} className={`${chip} ${t === x ? "bg-relleno" : "border-separador"}`}>{NOMBRE_TIPO[x]}</Link>
            ))}
          </nav>
          {!empresas.length && <p className="text-texto-suave">Aún no hay empresas verificadas registradas para {nombreDestino(d)}{t ? ` en «${NOMBRE_TIPO[t]}»` : ""}.</p>}
          <ul className="flex flex-col gap-2.5">
            {empresas.map((e) => (
              <li key={e.id} className="flex flex-col gap-2 rounded-tarjeta border border-separador bg-superficie p-4">
                <Link href={`/prestador/${e.id}`} className="flex items-start justify-between gap-3 no-underline">
                  <span className="flex flex-col gap-1">
                    <b className="text-lg">{e.nombre}</b>
                    <span className="text-[0.9375rem] text-texto-suave">{[NOMBRE_TIPO[e.tipo], e.lugar].filter(Boolean).join(" · ")}</span>
                    <InsigniaEstado estado={e.estado} />
                    {e.servicios.length > 0 && <span className="text-[0.9375rem]">{e.servicios.join(" · ")}</span>}
                  </span>
                  <ChevronRight aria-hidden className="mt-1 size-5 shrink-0" />
                </Link>
                {e.whatsapp && (
                  <a href={`https://wa.me/51${e.whatsapp}`} target="_blank" rel="noreferrer" className={claseBoton("secundario", "self-start")}>
                    <MessageCircle aria-hidden className="size-5" /> WhatsApp oficial
                  </a>
                )}
              </li>
            ))}
          </ul>
          <section aria-labelledby="t-ofrecieron" className="flex flex-col gap-2 rounded-tarjeta border border-separador bg-superficie p-4">
            <h2 id="t-ofrecieron" className="font-base text-lg font-bold tracking-normal">¿Te ofrecieron algo en {nombreDestino(d)} que no está aquí?</h2>
            <BuscadorVerificar destino={d} etiqueta={`Verificar una oferta en ${nombreDestino(d)}`} />
          </section>
        </>
      )}
    </>
  );
}
