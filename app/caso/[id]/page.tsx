import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, QrCode } from "lucide-react";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { Encabezado, Pagina, Skeleton, Tarjeta, claseBoton } from "@/components/ui";
import { CASOS, TEXTO_HOME, type Caso } from "@/config/textos";

export function generateStaticParams() {
  return Object.keys(CASOS).map((id) => ({ id }));
}

export default function CasoDeUso({ params }: PageProps<"/caso/[id]">) {
  return <Suspense fallback={<Pagina><Skeleton className="h-64 rounded-2xl" /></Pagina>}><Contenido params={params} /></Suspense>;
}

async function Contenido({ params }: Pick<PageProps<"/caso/[id]">, "params">) {
  const { id } = await params;
  const caso = CASOS[id as Caso];
  if (!caso) notFound();
  return (
    <Pagina>
      <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 self-start font-medium text-muted-foreground no-underline hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" /> Inicio
      </Link>
      <Encabezado eyebrow="Paso a paso" titulo={caso.titulo} />
      {/* Los números dicen algo cierto: es una secuencia. */}
      <ol className="escalonado flex flex-col gap-3">
        {caso.pasos.map((p, i) => (
          <li key={p} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-suave">
            <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[0.9375rem] font-semibold text-secondary-foreground">{i + 1}</span>
            <span className="pt-0.5 text-[1.0625rem]">{p}</span>
          </li>
        ))}
      </ol>
      <Tarjeta className="p-3 sm:p-4">
        <BuscadorVerificar placeholder={caso.placeholder} etiqueta={caso.titulo} autoFocus />
      </Tarjeta>
      {id === "van" && <Link href="/escanear" className={claseBoton("secundario", "self-start")}><QrCode aria-hidden /> {TEXTO_HOME.escanear}</Link>}
    </Pagina>
  );
}
