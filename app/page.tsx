import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Bus, Camera, Database, Fingerprint, Landmark, MapPin, Megaphone, QrCode, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { Alert, AlertDescription, Contenedor, Skeleton } from "@/components/ui";
import { CASOS, CONSEJO, DESTINOS, TEXTO_HOME, TEXTO_VERIFICAR, type Caso } from "@/config/textos";
import { supabasePublico } from "@/lib/supabase/publico";

// Home: VERIFICAR es el núcleo. Buscador arriba, accesos por foto/QR, casos de uso; el directorio va al final.
const ICONO_CASO: Record<Caso, LucideIcon> = { calle: Megaphone, yape: Wallet, van: Bus };
const FUENTES = [
  { Icono: Landmark, texto: "SUNAT · estado del RUC" },
  { Icono: Database, texto: "MINCETUR y DIRCETUR Piura" },
  { Icono: Fingerprint, texto: "Canales que cada empresa registró" },
];

const accion = "pulsable elevable group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-foreground no-underline shadow-suave";
const tile = "flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground";

export default function Inicio() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(120%_80%_at_50%_-10%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_70%)]">
        <Contenedor className="flex flex-col items-center gap-6 pt-10 pb-12 text-center sm:pt-16 sm:pb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-[0.8125rem] font-medium text-muted-foreground shadow-suave">
            <span aria-hidden className="size-1.5 rounded-full bg-verificado-borde" /> Registros oficiales de Piura
          </span>
          <div className="flex max-w-3xl flex-col gap-3">
            <h1 className="text-[2.25rem] leading-[1.05] font-bold tracking-[-0.035em] sm:text-[3.5rem]">
              {TEXTO_VERIFICAR.titulo.replace(" o subir", "")}<span className="text-primary"> o subir</span>
            </h1>
            <p className="mx-auto max-w-[56ch] text-[1.0625rem] text-muted-foreground sm:text-lg">{TEXTO_HOME.bajada}</p>
          </div>

          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-3 text-left shadow-media sm:p-4">
            <BuscadorVerificar />
          </div>

          <div className="grid w-full max-w-2xl gap-3 text-left sm:grid-cols-2">
            <Link href="/escanear" className={accion}>
              <span className={tile}><QrCode aria-hidden className="size-6" /></span>
              <span className="flex min-w-0 flex-col"><b className="font-semibold">{TEXTO_HOME.escanear}</b><span className="text-[0.875rem] text-muted-foreground">{TEXTO_HOME.escanearAyuda}</span></span>
              <ArrowRight aria-hidden className="ml-auto size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link href="/verificar" className={accion}>
              <span className={tile}><Camera aria-hidden className="size-6" /></span>
              <span className="flex min-w-0 flex-col"><b className="font-semibold">{TEXTO_HOME.foto}</b><span className="text-[0.875rem] text-muted-foreground">{TEXTO_HOME.fotoAyuda}</span></span>
              <ArrowRight aria-hidden className="ml-auto size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ul aria-label="Con qué se contrasta" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[0.875rem] text-muted-foreground">
            {FUENTES.map(({ Icono, texto }) => <li key={texto} className="flex items-center gap-2"><Icono aria-hidden className="size-4 text-primary" />{texto}</li>)}
          </ul>
        </Contenedor>
      </section>

      <Contenedor className="flex flex-col gap-14 py-12 sm:py-16">
        <section aria-labelledby="t-casos" className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 id="t-casos" className="text-[1.5rem] font-bold sm:text-[1.75rem]">{TEXTO_HOME.casos}</h2>
            <p className="text-muted-foreground">Te guiamos paso a paso según lo que tienes enfrente.</p>
          </div>
          <ul className="escalonado grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(CASOS) as Caso[]).map((c) => {
              const Icono = ICONO_CASO[c];
              return (
                <li key={c}>
                  <Link href={`/caso/${c}`} className={`${accion} h-full sm:flex-col sm:items-start sm:gap-6 sm:p-5`}>
                    <span className={tile}><Icono aria-hidden className="size-6" /></span>
                    <span className="flex flex-1 items-center justify-between gap-3 sm:w-full sm:items-end">
                      <b className="text-[1.0625rem] leading-snug font-semibold">{CASOS[c].titulo}</b>
                      <ArrowRight aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/destinos" className={`${accion} h-full sm:flex-col sm:items-start sm:gap-6 sm:p-5`}>
                <span className={tile}><MapPin aria-hidden className="size-6" /></span>
                <span className="flex flex-1 items-center justify-between gap-3 sm:w-full sm:items-end">
                  <b className="text-[1.0625rem] leading-snug font-semibold">{TEXTO_HOME.destinoCaso}</b>
                  <ArrowRight aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                </span>
              </Link>
            </li>
          </ul>
          <Alert variant="aviso">
            <ShieldCheck aria-hidden />
            <AlertDescription>{CONSEJO.ambulatorio}</AlertDescription>
          </Alert>
        </section>

        <section aria-labelledby="t-destinos" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="t-destinos" className="text-[1.5rem] font-bold sm:text-[1.75rem]">{TEXTO_HOME.porDestino}</h2>
              <p className="max-w-[60ch] text-muted-foreground">{TEXTO_HOME.porDestinoAyuda}</p>
            </div>
            <Link href="/destinos" className="inline-flex min-h-11 items-center gap-1.5 font-semibold no-underline hover:underline">Ver directorio <ArrowRight aria-hidden className="size-4" /></Link>
          </div>
          <Suspense fallback={<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{DESTINOS.map((d) => <li key={d.id}><Skeleton className="h-[5.5rem] rounded-2xl" /></li>)}</ul>}>
            <Destinos />
          </Suspense>
        </section>
      </Contenedor>
    </>
  );
}

async function Destinos() {
  await connection();
  const { data } = await supabasePublico().from("empresa_destinos").select("destino");
  const conteo = (data ?? []).reduce<Record<string, number>>((m, d) => ({ ...m, [d.destino]: (m[d.destino] ?? 0) + 1 }), {});
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {DESTINOS.map((d) => (
        <li key={d.id}>
          <Link href={`/destinos?d=${d.id}`} className="pulsable elevable flex min-h-[5.5rem] flex-col justify-between gap-2 rounded-2xl border border-border bg-card p-4 text-foreground no-underline shadow-suave">
            <span className="flex items-center gap-1.5 font-semibold"><MapPin aria-hidden className="size-4 shrink-0 text-primary" />{d.nombre}</span>
            <span className="text-[0.875rem] text-muted-foreground">{conteo[d.id] ? TEXTO_HOME.empresas(conteo[d.id]) : "Sin empresas aún"}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
