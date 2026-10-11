import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CabeceraDictamen, Cargando, Datos, VistaDictamen } from "@/components/dictamen";
import { Mono, Pagina } from "@/components/ui";
import { CONSEJO, TEXTO_ESTADO, TEXTO_FICHA } from "@/config/textos";
import { AccionesFicha, Foto, urlAbsoluta, whatsappOficial } from "@/components/verificacion";
import { OtraEmpresa } from "@/components/otra-empresa";
import { cargarVehiculo, fuentes, hoyLima } from "@/lib/consultas";
import { dictamenVehiculo, fechaLegible } from "@/lib/dictamen";

export default function Vehiculo({ params, searchParams }: PageProps<"/vehiculo/[placa]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} searchParams={searchParams} />
    </Suspense>
  );
}

const f = (iso: string | null) => (iso ? fechaLegible(iso) : null);

async function Contenido({ params, searchParams }: Pick<PageProps<"/vehiculo/[placa]">, "params" | "searchParams">) {
  const { placa } = await params;
  const dicha = String((await searchParams).empresa ?? "").trim().slice(0, 80);
  await connection();
  const [datos, lista] = await Promise.all([cargarVehiculo(placa.toUpperCase()), fuentes()]);
  if (!datos) notFound();
  const { vehiculo: v, prestador: p, ruc, canales } = datos;
  const { estado, advertencias } = dictamenVehiculo(v, p.ruc, ruc, hoyLima(), p.validacion_vence);
  const placaLegible = `${v.placa.slice(0, 3)}-${v.placa.slice(3)}`;
  const empresa = p.nombre_comercial ?? p.razon_social ?? "Empresa";
  const url = await urlAbsoluta(`/v/${v.id}`);

  return (
    <Pagina className="gap-5">
      <div className="flex flex-col gap-3">
        <span className="flex w-fit flex-col items-center rounded-chip border-2 border-primario bg-superficie px-4 pt-0.5 pb-1">
          <span className="text-[0.6875rem] font-bold tracking-[0.2em] text-texto-suave">PERÚ</span>
          <Mono className="text-[1.75rem] leading-none font-semibold">{placaLegible}</Mono>
        </span>
        <CabeceraDictamen titulo={`Unidad ${placaLegible}`} detalle={[p.nombre_comercial ?? p.razon_social, v.modalidad === "turistico" ? "turístico" : v.modalidad].filter(Boolean).join(" · ")} />
      </div>
      <VistaDictamen estado={estado} advertencias={advertencias} fuentes={lista} consejos={[CONSEJO.vehiculo]} muestra={v.es_muestra}>
        <Foto src={v.foto_url} alt={`Foto de la unidad ${placaLegible}`} texto={placaLegible} className="sm:max-w-md" />
        <OtraEmpresa accion={`/vehiculo/${v.placa}`} dato={`la placa ${placaLegible}`} titulares={[empresa]} dicha={dicha || undefined} />
        <AccionesFicha whatsapp={whatsappOficial(canales, p.telefono)} textoCompartir={TEXTO_FICHA.compartirVehiculo(placaLegible, empresa, TEXTO_ESTADO[estado].titulo, url)} datoReporte={`Placa ${placaLegible}`} providerId={p.id} />
        <Datos
          titulo="Empresa titular"
          filas={[
            ["Nombre", <Link key="p" className="font-bold" href={`/prestador/${p.id}`}>{p.nombre_comercial ?? p.razon_social}</Link>],
            ["Razón social", p.razon_social],
            ["RUC", p.ruc && <Mono key="r">{p.ruc}</Mono>],
            ["Teléfono", p.telefono],
          ]}
        />
        <Datos
          titulo="Habilitación de la unidad"
          filas={[
            ["Modalidad", v.modalidad === "turistico" ? "Transporte turístico" : v.modalidad],
            ["Ámbito", v.ambito],
            ["Estado", v.estado],
            ["TUC", v.tuc_numero],
            ["Autorización MTC", v.autorizacion_mtc],
            ["Habilitación vence", f(v.habilitacion_vencimiento)],
            ["CITV vence", f(v.citv_vencimiento)],
            ["SOAT vence", f(v.soat_vencimiento)],
          ]}
        />
      </VistaDictamen>
      <p className="text-[0.9375rem] text-texto-suave">¿El dato parece desactualizado? Consulta la fuente oficial indicada en «Fuentes y fechas de corte».</p>
    </Pagina>
  );
}
