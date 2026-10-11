import { Suspense } from "react";
import { Building, Landmark, Info, Siren } from "lucide-react";
import { TituloSeccion } from "@/components/dictamen";
import { Encabezado, Pagina, Skeleton, Tarjeta } from "@/components/ui";
import { TEXTO_REPORTE } from "@/config/textos";
import { FormularioReporte } from "./formulario";

const ICONOS = [Siren, Landmark, Building, Info];

export default function Reportar({ searchParams }: PageProps<"/reportar">) {
  return (
    <Pagina>
      <Encabezado eyebrow="Reporte" titulo={TEXTO_REPORTE.titulo} bajada={TEXTO_REPORTE.ayuda} />
      <Tarjeta>
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}><Formulario searchParams={searchParams} /></Suspense>
      </Tarjeta>
      <section aria-labelledby="t-acudir" className="flex flex-col gap-3">
        <TituloSeccion id="t-acudir">Dónde acudir</TituloSeccion>
        <ul className="grid gap-3 sm:grid-cols-2">
          {TEXTO_REPORTE.dondeAcudir.map((d, i) => {
            const Icono = ICONOS[i] ?? Info;
            return (
              <li key={d.quien} className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-suave">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><Icono aria-hidden className="size-5" /></span>
                <span className="flex flex-col gap-0.5"><b className="font-semibold leading-snug">{d.quien}</b><span className="text-[0.875rem] text-muted-foreground">{d.como}</span></span>
              </li>
            );
          })}
        </ul>
      </section>
    </Pagina>
  );
}

async function Formulario({ searchParams }: Pick<PageProps<"/reportar">, "searchParams">) {
  const sp = await searchParams;
  return <FormularioReporte dato={String(sp.dato ?? "").slice(0, 120)} p={String(sp.p ?? "")} />;
}
