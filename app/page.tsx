import { Suspense } from "react";
import Link from "next/link";
import { Camera, ChevronRight, MapPin, QrCode, ShieldCheck } from "lucide-react";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { Contenedor } from "@/components/ui";
import { CASOS, CONSEJO, DESTINOS, TEXTO_HOME, TEXTO_VERIFICAR } from "@/config/textos";
import { supabasePublico } from "@/lib/supabase/publico";
import { connection } from "next/server";

// Home: VERIFICAR es el núcleo. El directorio por destino es secundario (solo para encontrar empresas formales).
const botonGrande = "flex min-h-[4.5rem] items-center gap-3.5 rounded-tarjeta border-[1.5px] border-borde bg-superficie px-4 no-underline hover:bg-relleno";

export default function Inicio() {
  return (
    <Contenedor className="flex flex-col gap-8 pt-6 pb-16 sm:pt-10">
      <section aria-labelledby="t-verificar" className="flex max-w-2xl flex-col gap-3">
        <h1 id="t-verificar" className="flex items-center gap-2.5 text-[2rem] leading-[1.05] font-extrabold sm:text-[2.75rem]">
          <ShieldCheck aria-hidden className="size-9 shrink-0" strokeWidth={2.2} /> {TEXTO_VERIFICAR.titulo}
        </h1>
        <p className="text-lg text-texto-suave">{TEXTO_HOME.bajada}</p>
        <BuscadorVerificar />
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Link href="/escanear" className={botonGrande}>
            <QrCode aria-hidden className="size-7 shrink-0" />
            <span className="flex flex-col"><b className="text-lg">{TEXTO_HOME.escanear}</b><span className="text-[0.9375rem] text-texto-suave">{TEXTO_HOME.escanearAyuda}</span></span>
          </Link>
          <Link href="/verificar" className={botonGrande}>
            <Camera aria-hidden className="size-7 shrink-0" />
            <span className="flex flex-col"><b className="text-lg">{TEXTO_HOME.foto}</b><span className="text-[0.9375rem] text-texto-suave">{TEXTO_HOME.fotoAyuda}</span></span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="t-casos" className="flex flex-col gap-3">
        <h2 id="t-casos" className="text-[1.375rem] font-bold">{TEXTO_HOME.casos}</h2>
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(CASOS) as (keyof typeof CASOS)[]).map((c) => (
            <li key={c}><Link href={`/caso/${c}`} className={`${botonGrande} h-full justify-between`}><b>{CASOS[c].titulo}</b><ChevronRight aria-hidden className="size-5 shrink-0" /></Link></li>
          ))}
          <li><Link href="/destinos" className={`${botonGrande} h-full justify-between`}><b>{TEXTO_HOME.destinoCaso}</b><ChevronRight aria-hidden className="size-5 shrink-0" /></Link></li>
        </ul>
        <p className="text-[0.9375rem] text-texto-suave">{CONSEJO.ambulatorio}</p>
      </section>

      <section aria-labelledby="t-destinos" className="flex flex-col gap-3">
        <h2 id="t-destinos" className="text-[1.375rem] font-bold">{TEXTO_HOME.porDestino}</h2>
        <p className="text-texto-suave">{TEXTO_HOME.porDestinoAyuda}</p>
        <Suspense fallback={<GrillaDestinos conteo={{}} />}>
          <Destinos />
        </Suspense>
      </section>
    </Contenedor>
  );
}

async function Destinos() {
  await connection();
  const { data } = await supabasePublico().from("empresa_destinos").select("destino");
  const conteo = (data ?? []).reduce<Record<string, number>>((m, d) => ({ ...m, [d.destino]: (m[d.destino] ?? 0) + 1 }), {});
  return <GrillaDestinos conteo={conteo} />;
}

function GrillaDestinos({ conteo }: { conteo: Record<string, number> }) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      {DESTINOS.map((d) => (
        <li key={d.id}>
          <Link href={`/destinos?d=${d.id}`} className="flex min-h-16 flex-col justify-center rounded-tarjeta border border-separador bg-superficie px-4 py-3 no-underline hover:bg-relleno">
            <span className="flex items-center gap-1.5 font-bold"><MapPin aria-hidden className="size-4 shrink-0" />{d.nombre}</span>
            {conteo[d.id] ? <span className="text-[0.9375rem] text-texto-suave">{TEXTO_HOME.empresas(conteo[d.id])}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
