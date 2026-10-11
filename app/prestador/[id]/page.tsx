import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ChevronRight } from "lucide-react";
import { CabeceraDictamen, Cargando, Datos, VistaDictamen } from "@/components/dictamen";
import { Mono, Pagina, Plegable } from "@/components/ui";
import { AccionesFicha, Canales, Foto, iniciales, urlAbsoluta, whatsappOficial } from "@/components/verificacion";
import { NOMBRE_AUTORIZACION, NOMBRE_TIPO, TEXTO_ESTADO, TEXTO_FICHA, nombreDestino } from "@/config/textos";
import { cargarPrestador, fuentes, hoyLima } from "@/lib/consultas";
import { leerAnuncio } from "@/lib/anuncio";
import { dictamenPrestador, fechaLegible } from "@/lib/dictamen";

// Ficha de verificación de la empresa: estado → identidad (foto, tipo, destinos) → canales oficiales → acciones;
// documentos, vehículos y personal abajo, plegados. Sin precios ni opiniones (el producto es verificar).
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
  const [datos, lista] = await Promise.all([cargarPrestador(id), fuentes()]);
  if (!datos) notFound();
  const { prestador: p, autorizaciones, ruc, vehiculos, personal, canales, destinos, servicios } = datos;
  const hoy = hoyLima();
  const { estado, advertencias } = dictamenPrestador(p, autorizaciones, ruc, hoy, { vehiculos, personal });
  const nombre = p.nombre_comercial ?? p.razon_social ?? "Empresa";
  const detalle = [NOMBRE_TIPO[p.tipo] ?? p.tipo, ...p.clases.map((c) => c.charAt(0).toUpperCase() + c.slice(1))].join(" · ");
  const url = await urlAbsoluta(`/v/${p.id}`);

  return (
    <Pagina className="gap-5 pb-0 sm:pb-6">
      <CabeceraDictamen titulo={nombre} detalle={detalle} />
      <VistaDictamen estado={estado} advertencias={advertencias} anuncio={anuncio.textos} fuentes={lista} muestra={p.es_muestra}>
        <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
          <Foto src={p.foto_url} alt={`Foto o logo de ${nombre}`} texto={iniciales(nombre)} />
          <div className="flex flex-col gap-3">
            {p.descripcion && <p>{p.descripcion}</p>}
            {destinos.length > 0 && (
              <div>
                <h2 className="mb-1.5 font-base text-lg font-bold tracking-normal">{TEXTO_FICHA.destinos}</h2>
                <ul className="flex flex-wrap gap-2">
                  {destinos.map((d) => <li key={d}><Link href={`/destinos?d=${d}`} className="inline-flex min-h-11 items-center rounded-full border border-separador bg-superficie px-4 font-semibold no-underline">{nombreDestino(d)}</Link></li>)}
                </ul>
              </div>
            )}
            {servicios.length > 0 && <p className="text-[0.9375rem] text-texto-suave"><b className="text-texto">{TEXTO_FICHA.servicios}:</b> {servicios.map((s) => s.nombre.replace(/\s*\(muestra\)/i, "")).join(" · ")}</p>}
          </div>
        </div>

        <Canales canales={canales} telefono={p.telefono} />
        <AccionesFicha whatsapp={whatsappOficial(canales, p.telefono)} textoCompartir={TEXTO_FICHA.compartirEmpresa(nombre, TEXTO_ESTADO[estado].titulo, url)} datoReporte={nombre} providerId={p.id} />

        {vehiculos.length > 0 && (
          <Plegable titulo={`${TEXTO_FICHA.vehiculos} (${vehiculos.length})`}>
            <ul className="flex flex-col">
              {vehiculos.map((v) => (
                <li key={v.id}>
                  <Link href={`/vehiculo/${v.placa}`} className="flex min-h-12 items-center justify-between gap-3 no-underline">
                    <span><Mono className="font-bold">{v.placa.slice(0, 3)}-{v.placa.slice(3)}</Mono> <span className="text-texto-suave">· {v.modalidad === "turistico" ? "turístico" : v.modalidad}</span></span>
                    <ChevronRight aria-hidden className="size-5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Plegable>
        )}
        {personal.length > 0 && (
          <Plegable titulo={`${TEXTO_FICHA.personal} (${personal.length})`}>
            <ul className="flex flex-col">
              {personal.map((x) => (
                <li key={x.id}>
                  <Link href={`/persona/${x.id}`} className="flex min-h-12 items-center justify-between gap-3 no-underline">
                    <span><b>{x.nombre}</b> <span className="text-texto-suave">· {TEXTO_FICHA.rol[x.rol]}</span></span>
                    <ChevronRight aria-hidden className="size-5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Plegable>
        )}
        <Plegable titulo={TEXTO_FICHA.documentos}>
          <div className="flex flex-col gap-4">
            <Datos titulo="Registro" filas={[
              ["Razón social", p.razon_social],
              ["RUC", p.ruc && <><Mono className="font-semibold">{p.ruc}</Mono>{ruc && <span className="text-texto-suave"> · {ruc.estado.toLowerCase()} y {ruc.condicion.toLowerCase()}</span>}</>],
              ["Dirección", [p.direccion, p.distrito, p.provincia].filter(Boolean).join(", ")],
            ]} />
            {autorizaciones.map((a, i) => {
              const vencida = !!a.fecha_vencimiento && a.fecha_vencimiento < hoy;
              return (
                <p key={i} className="text-[0.9375rem]">
                  <b>{NOMBRE_AUTORIZACION[a.tipo] ?? a.tipo}</b> <span className={`font-bold ${vencida ? "text-alerta" : "text-verificado"}`}>· {vencida ? "Vencida" : "Vigente"}</span><br />
                  {a.entidad_emisora}
                  {a.numero && <> · n.° <Mono>{a.numero}</Mono></>}
                  {a.fecha_emision && <> · emitida <Mono>{fechaLegible(a.fecha_emision)}</Mono></>}
                  {a.fecha_vencimiento ? <> · vence <Mono>{fechaLegible(a.fecha_vencimiento)}</Mono></> : " · vigencia indeterminada"}
                </p>
              );
            })}
          </div>
        </Plegable>
      </VistaDictamen>
      <p className="text-[0.9375rem] text-texto-suave">{TEXTO_FICHA.queSignifica}</p>
    </Pagina>
  );
}
