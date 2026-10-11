import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BusFront, ChevronRight, FileCheck2, MapPin, UserRound } from "lucide-react";
import { CabeceraDictamen, Cargando, Datos, TituloSeccion, VistaDictamen } from "@/components/dictamen";
import { Badge, Mono, Pagina, Plegable } from "@/components/ui";
import { AccionesFicha, Canales, Foto, iniciales, urlAbsoluta, whatsappOficial } from "@/components/verificacion";
import { NOMBRE_AUTORIZACION, NOMBRE_TIPO, TEXTO_ESTADO, TEXTO_FICHA, nombreDestino } from "@/config/textos";
import { cargarPrestador, fuentes, hoyLima } from "@/lib/consultas";
import { leerAnuncio } from "@/lib/anuncio";
import { dictamenPrestador, fechaLegible } from "@/lib/dictamen";
import { cn } from "@/lib/utils";

// Ficha de verificación de la empresa: estado → identidad (foto, tipo, destinos) → canales oficiales → acciones;
// documentos, vehículos y personal abajo, plegados. Sin precios ni opiniones (el producto es verificar).
export default function Prestador({ params }: PageProps<"/prestador/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} />
    </Suspense>
  );
}

const filaLista = "pulsable flex min-h-14 items-center justify-between gap-3 rounded-xl px-2 text-foreground no-underline hover:bg-muted";

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
    <Pagina className="gap-5 pb-0 sm:pb-10">
      <CabeceraDictamen eyebrow="Empresa" titulo={nombre} detalle={detalle} />
      <VistaDictamen estado={estado} advertencias={advertencias} anuncio={anuncio.textos} fuentes={lista} muestra={p.es_muestra}>
        <div className="grid gap-4 sm:grid-cols-[13rem_1fr]">
          <Foto src={p.foto_url} alt={`Foto o logo de ${nombre}`} texto={iniciales(nombre)} className="bg-card object-contain p-3" />
          <div className="flex flex-col gap-4">
            {p.descripcion && <p className="text-[1.0625rem]">{p.descripcion}</p>}
            {destinos.length > 0 && (
              <div className="flex flex-col gap-2">
                <TituloSeccion className="text-base">{TEXTO_FICHA.destinos}</TituloSeccion>
                <ul className="flex flex-wrap gap-2">
                  {destinos.map((d) => (
                    <li key={d}>
                      <Link href={`/destinos?d=${d}`} className="pulsable inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 font-medium text-foreground no-underline shadow-suave hover:border-input">
                        <MapPin aria-hidden className="size-4 text-primary" />{nombreDestino(d)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {servicios.length > 0 && (
              <div className="flex flex-col gap-2">
                <TituloSeccion className="text-base">{TEXTO_FICHA.servicios}</TituloSeccion>
                <ul className="flex flex-wrap gap-1.5">
                  {servicios.map((s) => <li key={s.nombre}><Badge variant="muted" className="py-1.5 text-[0.875rem] text-foreground">{s.nombre.replace(/\s*\(muestra\)/i, "")}</Badge></li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        <Canales canales={canales} telefono={p.telefono} />
        <AccionesFicha whatsapp={whatsappOficial(canales, p.telefono)} textoCompartir={TEXTO_FICHA.compartirEmpresa(nombre, TEXTO_ESTADO[estado].titulo, url)} datoReporte={nombre} providerId={p.id} />

        <div className="flex flex-col gap-3">
          {vehiculos.length > 0 && (
            <Plegable titulo={<span className="flex items-center gap-2.5"><BusFront aria-hidden className="size-5 text-primary" />{TEXTO_FICHA.vehiculos} <Badge variant="muted">{vehiculos.length}</Badge></span>}>
              <ul className="-mx-2 flex flex-col">
                {vehiculos.map((v) => (
                  <li key={v.id}>
                    <Link href={`/vehiculo/${v.placa}`} className={filaLista}>
                      <span className="flex items-center gap-3">
                        <Mono className="rounded-md border border-foreground/70 bg-card px-2 py-0.5 font-semibold text-foreground">{v.placa.slice(0, 3)}-{v.placa.slice(3)}</Mono>
                        <span className="text-muted-foreground">{v.modalidad === "turistico" ? "Turístico" : v.modalidad}</span>
                      </span>
                      <ChevronRight aria-hidden className="size-5 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Plegable>
          )}
          {personal.length > 0 && (
            <Plegable titulo={<span className="flex items-center gap-2.5"><UserRound aria-hidden className="size-5 text-primary" />{TEXTO_FICHA.personal} <Badge variant="muted">{personal.length}</Badge></span>}>
              <ul className="-mx-2 flex flex-col">
                {personal.map((x) => (
                  <li key={x.id}>
                    <Link href={`/persona/${x.id}`} className={filaLista}>
                      <span><b className="font-semibold">{x.nombre}</b> <span className="text-muted-foreground">· {TEXTO_FICHA.rol[x.rol]}</span></span>
                      <ChevronRight aria-hidden className="size-5 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Plegable>
          )}
          <Plegable titulo={<span className="flex items-center gap-2.5"><FileCheck2 aria-hidden className="size-5 text-primary" />{TEXTO_FICHA.documentos}</span>}>
            <div className="flex flex-col gap-4 text-foreground">
              <Datos titulo="Registro" filas={[
                ["Razón social", p.razon_social],
                ["RUC", p.ruc && <><Mono className="font-semibold">{p.ruc}</Mono>{ruc && <span className="text-muted-foreground"> · {ruc.estado.toLowerCase()} y {ruc.condicion.toLowerCase()}</span>}</>],
                ["Dirección", [p.direccion, p.distrito, p.provincia].filter(Boolean).join(", ")],
              ]} />
              {autorizaciones.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {autorizaciones.map((a, i) => {
                    const vencida = !!a.fecha_vencimiento && a.fecha_vencimiento < hoy;
                    return (
                      <li key={i} className="flex flex-col gap-1 rounded-xl border border-border p-3.5 text-[0.9375rem]">
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <b className="font-semibold">{NOMBRE_AUTORIZACION[a.tipo] ?? a.tipo}</b>
                          <span className={cn("rounded-full px-2.5 py-1 text-[0.8125rem] leading-none font-semibold", vencida ? "bg-alerta-fondo text-alerta" : "bg-verificado-fondo text-verificado")}>{vencida ? "Vencida" : "Vigente"}</span>
                        </span>
                        <span className="text-muted-foreground">
                          {a.entidad_emisora}
                          {a.numero && <> · n.° <Mono>{a.numero}</Mono></>}
                          {a.fecha_emision && <> · emitida <Mono>{fechaLegible(a.fecha_emision)}</Mono></>}
                          {a.fecha_vencimiento ? <> · vence <Mono>{fechaLegible(a.fecha_vencimiento)}</Mono></> : " · vigencia indeterminada"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Plegable>
        </div>
      </VistaDictamen>
      <p className="text-[0.875rem] text-muted-foreground">{TEXTO_FICHA.queSignifica}</p>
    </Pagina>
  );
}
