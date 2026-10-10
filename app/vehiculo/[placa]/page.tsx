import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Cargando, Datos, VistaDictamen } from "@/components/dictamen";
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
    <>
      <h1 className="text-2xl font-semibold">Unidad {placaLegible}</h1>
      <VistaDictamen estado={estado} advertencias={advertencias} fuentes={lista} consejos={[CONSEJO.vehiculo]} muestra={v.es_muestra}>
        <Datos
          titulo="Empresa titular"
          filas={[
            ["Nombre", <Link key="p" className="underline" href={`/prestador/${p.id}`}>{p.nombre_comercial ?? p.razon_social}</Link>],
            ["Razón social", p.razon_social],
            ["RUC", p.ruc],
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
    </>
  );
}
