import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Cargando, Datos, VistaDictamen } from "@/components/dictamen";
import { NOMBRE_AUTORIZACION, NOMBRE_TIPO } from "@/config/textos";
import { cargarPrestador, fuentes, hoyLima } from "@/lib/consultas";
import { conObservaciones, dictamenPrestador, fechaLegible, observacionesDe } from "@/lib/dictamen";

export default function Prestador({ params, searchParams }: PageProps<"/prestador/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Contenido({ params, searchParams }: Pick<PageProps<"/prestador/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  const obs = observacionesDe((await searchParams).obs);
  await connection();
  const [datos, lista] = await Promise.all([cargarPrestador(id), fuentes()]);
  if (!datos) notFound();
  const { prestador: p, autorizaciones, ruc } = datos;
  const { estado, advertencias } = conObservaciones(dictamenPrestador(p, autorizaciones, ruc, hoyLima()), obs);
  const redes = Object.values((p.redes ?? {}) as Record<string, string>).join(" · ");

  return (
    <>
      <h1 className="text-2xl font-semibold">{p.nombre_comercial ?? p.razon_social}</h1>
      <VistaDictamen estado={estado} advertencias={advertencias} fuentes={lista} muestra={p.es_muestra}>
        <Datos
          titulo="Datos del prestador"
          filas={[
            ["Tipo", NOMBRE_TIPO[p.tipo] ?? p.tipo],
            ["Clase", p.clases.join(", ")],
            ["Razón social", p.razon_social],
            ["RUC", p.ruc],
            ["Actividades", p.actividades.join(", ").replaceAll("_", " ")],
            ["Dirección", [p.direccion, p.distrito, p.provincia].filter(Boolean).join(", ")],
            ["Teléfono", p.telefono && <a className="underline" href={`tel:${p.telefono}`}>{p.telefono}</a>],
            ["Correo", p.correo],
            ["Web", p.web],
            ["Redes", redes],
          ]}
        />
        {autorizaciones.length > 0 && (
          <Datos
            titulo="Autorizaciones"
            filas={autorizaciones.map((a) => [
              NOMBRE_AUTORIZACION[a.tipo] ?? a.tipo,
              [
                a.entidad_emisora,
                a.numero && `N.° ${a.numero}`,
                a.fecha_emision && `emitida ${fechaLegible(a.fecha_emision)}`,
                a.fecha_vencimiento ? `vence ${fechaLegible(a.fecha_vencimiento)}` : "vigencia indeterminada",
              ].filter(Boolean).join(" · "),
            ])}
          />
        )}
      </VistaDictamen>
    </>
  );
}
