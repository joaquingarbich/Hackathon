import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CabeceraDictamen, Cargando, Datos, VistaDictamen } from "@/components/dictamen";
import { Mono, Pagina } from "@/components/ui";
import { AccionesFicha, Foto, iniciales, urlAbsoluta, whatsappOficial } from "@/components/verificacion";
import { TEXTO_ESTADO, TEXTO_FICHA } from "@/config/textos";
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
    <Pagina className="gap-5 pb-0 sm:pb-6">
      <CabeceraDictamen titulo={x.nombre} detalle={`${rol} de ${nombreEmpresa}`} />
      <VistaDictamen estado={estado} advertencias={advertencias} fuentes={lista} muestra={p.es_muestra}>
        <Foto src={x.foto_url} alt={`Foto de ${x.nombre}`} texto={iniciales(x.nombre)} className="sm:max-w-sm" />
        <Datos titulo="Identificación" filas={[
          ["Nombre", x.nombre],
          ["Rol", rol],
          ["DNI", <Mono key="d">•••••{x.dni_ultimos3}</Mono>],
          ["Carné de guía", x.carne_numero && <><Mono>{x.carne_numero}</Mono>{x.carne_vence && <> · vence <Mono>{fechaLegible(x.carne_vence)}</Mono></>}</>],
          ["Empresa", <Link key="e" href={`/prestador/${p.id}`} className="font-bold">{nombreEmpresa}</Link>],
          ["Estado de la empresa", TEXTO_ESTADO[empresa.estado].titulo],
        ]} />
        <AccionesFicha whatsapp={whatsappOficial(canales, p.telefono)} textoCompartir={TEXTO_FICHA.compartirPersona(x.nombre, rol.toLowerCase(), nombreEmpresa, await urlAbsoluta(`/v/${x.id}`))} datoReporte={`${rol}: ${x.nombre}`} providerId={p.id} />
      </VistaDictamen>
      <p className="text-[0.9375rem] text-texto-suave">Compara la foto y el nombre con la persona que tienes enfrente. Si no coinciden, no le pagues y repórtalo.</p>
    </Pagina>
  );
}
