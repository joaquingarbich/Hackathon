import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Phone } from "lucide-react";
import { CabeceraDictamen, Cargando, Datos, VistaDictamen } from "@/components/dictamen";
import { BarraAccion, Mono, Pagina, Plegable, claseBoton, soles } from "@/components/ui";
import { BotonGuardar } from "@/components/guardados";
import { nombreDestino } from "@/components/catalogo";
import { NOMBRE_AUTORIZACION, NOMBRE_TIPO, TEXTO_CATALOGO } from "@/config/textos";
import { cargarPrestador, fuentes, hoyLima } from "@/lib/consultas";
import { serviciosDeProveedor } from "@/lib/catalogo";
import { leerAnuncio } from "@/lib/anuncio";
import { Opiniones } from "@/components/opiniones";
import { dictamenPrestador, fechaLegible } from "@/lib/dictamen";

// C03 Dictamen del proveedor: sello, datos, autorizaciones, servicios publicados y opiniones (aparte).
export default function Prestador({ params }: PageProps<"/prestador/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: Pick<PageProps<"/prestador/[id]">, "params">) {
  const { id } = await params;
  const anuncio = await leerAnuncio(`prestador:${id}`); // cookie del navegador que subió la imagen; nunca de la URL
  await connection();
  const [datos, lista, servicios] = await Promise.all([cargarPrestador(id), fuentes(), serviciosDeProveedor(id)]);
  if (!datos) notFound();
  const { prestador: p, autorizaciones, ruc } = datos;
  const hoy = hoyLima();
  const { estado, advertencias } = dictamenPrestador(p, autorizaciones, ruc, hoy);
  const redes = Object.values((p.redes ?? {}) as Record<string, string>).join(" · ");
  const nombre = p.nombre_comercial ?? p.razon_social ?? "Proveedor";
  const detalle = [NOMBRE_TIPO[p.tipo] ?? p.tipo, ...p.clases.map((c) => c.charAt(0).toUpperCase() + c.slice(1))].join(" · ");

  return (
    <Pagina className="gap-5 pb-0 sm:pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CabeceraDictamen titulo={nombre} detalle={detalle} />
        <BotonGuardar item={{ href: `/prestador/${p.id}`, nombre, detalle: [NOMBRE_TIPO[p.tipo], p.distrito ?? p.provincia].filter(Boolean).join(" · ") }} />
      </div>
      <VistaDictamen estado={estado} advertencias={advertencias} anuncio={anuncio.textos} fuentes={lista} muestra={p.es_muestra}>
        <Datos
          titulo="Datos del proveedor"
          filas={[
            ["Razón social", p.razon_social],
            ["RUC", p.ruc && <><Mono className="font-semibold">{p.ruc}</Mono>{ruc && <span className="text-texto-suave"> · {ruc.estado.toLowerCase()} y {ruc.condicion.toLowerCase()}</span>}</>],
            ["Actividades", p.actividades.join(", ").replaceAll("_", " ")],
            ["Dirección", [p.direccion, p.distrito, p.provincia].filter(Boolean).join(", ")],
            ["Teléfono registrado", p.telefono && <a href={`tel:${p.telefono}`}><Mono>{p.telefono}</Mono></a>],
            ["Correo", p.correo],
            ["Web", p.web],
            ["Redes registradas", redes],
          ]}
        />
        {autorizaciones.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[1.375rem] font-bold">Autorizaciones</h2>
            {autorizaciones.map((a, i) => {
              const vencida = !!a.fecha_vencimiento && a.fecha_vencimiento < hoy;
              return (
                <Plegable key={i} abierto={i === 0} titulo={NOMBRE_AUTORIZACION[a.tipo] ?? a.tipo}
                  extra={<span className={`text-[0.9375rem] font-bold ${vencida ? "text-alerta" : "text-verificado"}`}>{vencida ? "Vencida" : "Vigente"}</span>}>
                  {a.entidad_emisora}
                  {a.numero && <> · n.° <Mono>{a.numero}</Mono></>}
                  {a.fecha_emision && <> · emitida <Mono>{fechaLegible(a.fecha_emision)}</Mono></>}
                  {a.fecha_vencimiento ? <> · vence <Mono>{fechaLegible(a.fecha_vencimiento)}</Mono></> : " · vigencia indeterminada"}
                </Plegable>
              );
            })}
          </section>
        )}
        {servicios.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[1.375rem] font-bold">{TEXTO_CATALOGO.experienciasDelProveedor}</h2>
            <ul className="overflow-hidden rounded-tarjeta border border-separador bg-superficie">
              {servicios.map((s) => (
                <li key={s.id} className="border-b border-separador last:border-0">
                  <Link href={`/experiencia/${s.id}`} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 no-underline hover:bg-relleno">
                    <span className="flex flex-col"><b>{s.nombre}</b><span className="text-[0.9375rem] text-texto-suave">{[nombreDestino(s.destino), s.duracion].filter(Boolean).join(" · ")}</span></span>
                    {s.precio_ref !== null && <span className="shrink-0 font-bold">{soles(s.precio_ref)}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </VistaDictamen>
      <Opiniones providerId={p.id} puedeOpinar={!!p.ruc} />
      <p className="text-[0.9375rem] text-texto-suave"><b className="text-texto">¿Qué significa “Verificado”?</b> Que figura en un registro oficial vigente. No mide la calidad del servicio; para eso están las opiniones.</p>
      {p.telefono && (
        <BarraAccion>
          <a href={`tel:${p.telefono}`} className={claseBoton("primario", "w-full sm:w-auto")}><Phone aria-hidden className="size-5" /> Contactar por canal oficial</a>
        </BarraAccion>
      )}
    </Pagina>
  );
}
