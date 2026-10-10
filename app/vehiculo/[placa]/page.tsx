import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CabeceraDictamen, Cargando, Datos, VistaDictamen } from "@/components/dictamen";
import { Mono, Pagina } from "@/components/ui";
import { CONSEJO } from "@/config/textos";
import { cargarVehiculo, fuentes, hoyLima } from "@/lib/consultas";
import { dictamenVehiculo, fechaLegible } from "@/lib/dictamen";

export default function Vehiculo({ params }: PageProps<"/vehiculo/[placa]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} />
    </Suspense>
  );
}

const f = (iso: string | null) => (iso ? fechaLegible(iso) : null);

async function Contenido({ params }: Pick<PageProps<"/vehiculo/[placa]">, "params">) {
  const { placa } = await params;
  await connection();
  const [datos, lista] = await Promise.all([cargarVehiculo(placa.toUpperCase()), fuentes()]);
  if (!datos) notFound();
  const { vehiculo: v, prestador: p, ruc } = datos;
  const { estado, advertencias } = dictamenVehiculo(v, p.ruc, ruc, hoyLima(), p.validacion_vence);
  const placaLegible = `${v.placa.slice(0, 3)}-${v.placa.slice(3)}`;

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
