import Link from "next/link";
import { notFound } from "next/navigation";
import { QrCode } from "lucide-react";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { Pagina, claseBoton } from "@/components/ui";
import { CASOS, TEXTO_HOME, type Caso } from "@/config/textos";

export function generateStaticParams() {
  return Object.keys(CASOS).map((id) => ({ id }));
}

export default async function CasoDeUso({ params }: PageProps<"/caso/[id]">) {
  const { id } = await params;
  const caso = CASOS[id as Caso];
  if (!caso) notFound();
  return (
    <Pagina>
      <Link href="/" className="flex min-h-11 items-center self-start font-bold">← Inicio</Link>
      <h1 className="text-[2rem] leading-[1.05] font-extrabold">{caso.titulo}</h1>
      <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg">
        {caso.pasos.map((p) => <li key={p}>{p}</li>)}
      </ol>
      <BuscadorVerificar placeholder={caso.placeholder} etiqueta={caso.titulo} autoFocus />
      {id === "van" && <Link href="/escanear" className={claseBoton("secundario", "self-start")}><QrCode aria-hidden className="size-5" /> {TEXTO_HOME.escanear}</Link>}
    </Pagina>
  );
}
