import { Suspense } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ScanFace } from "lucide-react";
import { CabeceraDictamen, Cargando, Datos, VistaDictamen } from "@/components/dictamen";
import { Alert, AlertDescription, InsigniaEstado, Mono, Pagina } from "@/components/ui";
import { AccionesFicha, Foto, urlAbsoluta, whatsappOficial } from "@/components/verificacion";
import { TEXTO_FICHA } from "@/config/textos";
import { cargarPersona, fuentes, hoyLima } from "@/lib/consultas";
import { dictamenPrestador, fechaLegible } from "@/lib/dictamen";

// Ficha de una persona del personal (guía, conductor, vendedor): foto grande para comparar con quien tienes enfrente.
export default function Persona({ params }: PageProps<"/persona/[id]">) {
  return <Suspense fallback={<Cargando />}><Contenido params={params} /></Suspense>;
}

async function Contenido({ params }: Pick<PageProps<"/persona/[id]">, "params">) {
  const { id } = await params;
  await connection();
  const [d, lista] = await Promise.all([cargarPersona(id), fuentes()]);
  if (!d) notFound();
  const { persona: x, prestador: p, autorizaciones, ruc, vehiculos, personal, canales } = d;
  const hoy = hoyLima();
  const empresa = dictamenPrestador(p, autorizaciones, ruc, hoy, { vehiculos, personal });
  const carneVencido = !!x.carne_vence && x.carne_vence < hoy;
  const advertencias = carneVencido ? [{ nivel: "observacion" as const, texto: `Su carné de guía venció el ${fechaLegible(x.carne_vence!)}.` }] : [];
  const estado = empresa.estado === "verificado" && carneVencido ? "observaciones" : empresa.estado;
  const nombreEmpresa = p.nombre_comercial ?? p.razon_social ?? "Empresa";
  const rol = TEXTO_FICHA.rol[x.rol];
  return (
    <Pagina className="gap-5 pb-0 sm:pb-10">
      <div className={cn("grid items-center gap-4", x.foto_url && "sm:grid-cols-[12rem_1fr]")}>
        <Foto src={x.foto_url} alt={`Foto de ${x.nombre}`} className="aspect-square max-w-48 sm:max-w-none" />
        <CabeceraDictamen eyebrow={rol} titulo={x.nombre} detalle={<>de <Link href={`/prestador/${p.id}`} className="inline-flex min-h-11 items-center font-semibold">{nombreEmpresa}</Link></>} />
      </div>
      <Alert variant="info">
        <ScanFace aria-hidden />
        <AlertDescription>Compara la foto y el nombre con la persona que tienes enfrente. Si no coinciden, no le pagues y repórtalo.</AlertDescription>
      </Alert>
      <VistaDictamen estado={estado} advertencias={advertencias} fuentes={lista} muestra={p.es_muestra}>
        <Datos titulo="Identificación" filas={[
          ["Nombre", x.nombre],
          ["Rol", rol],
          ["DNI", <Mono key="d">•••••{x.dni_ultimos3}</Mono>],
          ["Carné de guía", x.carne_numero && <><Mono>{x.carne_numero}</Mono>{x.carne_vence && <> · vence <Mono>{fechaLegible(x.carne_vence)}</Mono></>}</>],
          ["Empresa", <Link key="e" href={`/prestador/${p.id}`} className="inline-flex min-h-11 items-center font-semibold">{nombreEmpresa}</Link>],
          ["Estado de la empresa", <InsigniaEstado key="s" estado={empresa.estado} />],
        ]} />
        <AccionesFicha whatsapp={whatsappOficial(canales, p.telefono)} textoCompartir={TEXTO_FICHA.compartirPersona(x.nombre, rol.toLowerCase(), nombreEmpresa, await urlAbsoluta(`/v/${x.id}`))} datoReporte={`${rol}: ${x.nombre}`} providerId={p.id} />
      </VistaDictamen>
    </Pagina>
  );
}
