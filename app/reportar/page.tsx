import { Suspense } from "react";
import { Cargando } from "@/components/dictamen";
import { Pagina, Tarjeta } from "@/components/ui";
import { TEXTO_REPORTE } from "@/config/textos";
import { FormularioReporte } from "./formulario";

export default function Reportar({ searchParams }: PageProps<"/reportar">) {
  return (
    <Pagina>
      <div className="flex flex-col gap-1">
        <h1 className="text-[2.125rem] leading-[1.05] font-extrabold">{TEXTO_REPORTE.titulo}</h1>
        <p className="text-texto-suave">{TEXTO_REPORTE.ayuda}</p>
      </div>
      <Tarjeta className="p-5">
        <Suspense fallback={<Cargando />}><Formulario searchParams={searchParams} /></Suspense>
      </Tarjeta>
      <section aria-labelledby="t-acudir" className="flex flex-col gap-2">
        <h2 id="t-acudir" className="text-[1.375rem] font-bold">Dónde acudir</h2>
        <ul className="flex flex-col gap-3">
          {TEXTO_REPORTE.dondeAcudir.map((d) => <li key={d.quien}><b>{d.quien}</b><br /><span className="text-texto-suave">{d.como}</span></li>)}
        </ul>
      </section>
    </Pagina>
  );
}

async function Formulario({ searchParams }: Pick<PageProps<"/reportar">, "searchParams">) {
  const sp = await searchParams;
  return <FormularioReporte dato={String(sp.dato ?? "").slice(0, 120)} p={String(sp.p ?? "")} />;
}
