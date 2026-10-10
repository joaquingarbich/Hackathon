// Reglas del dictamen (CHECKTUR_CONTEXTO.md §6). Funciones puras: sin BD, sin fecha implícita.
import { ADVERTENCIA, NOMBRE_AUTORIZACION, OBS_IMAGEN, type CodigoObs, type Estado } from "@/config/textos";
import { REGLAS } from "@/config/reglas";
import type { Tables } from "@/lib/database.types";

export type Advertencia = { nivel: "alerta" | "observacion"; texto: string };
export type Dictamen = { estado: Estado; advertencias: Advertencia[] };

type Prestador = Pick<Tables<"providers">, "tipo" | "ruc" | "clases" | "actividades" | "estado_inscripcion" | "validacion_vence">;
type Autorizacion = Pick<Tables<"authorizations">, "tipo" | "fecha_vencimiento">;
type Ruc = Pick<Tables<"ruc_status">, "estado" | "condicion"> | null;
type Vehiculo = Pick<
  Tables<"vehicles">,
  "estado" | "modalidad" | "habilitacion_vencimiento" | "citv_vencimiento" | "soat_vencimiento"
>;

/** "2026-03-01" → "01/03/2026" */
export const fechaLegible = (iso: string) => iso.split("-").reverse().join("/");

const diasHasta = (iso: string, hoy: string) => (Date.parse(iso) - Date.parse(hoy)) / 86_400_000;

function advertenciasRuc(rucNumero: string | null, ruc: Ruc): Advertencia[] {
  if (!rucNumero) return [{ nivel: "observacion", texto: ADVERTENCIA.sinRuc }];
  if (!ruc) return [{ nivel: "observacion", texto: ADVERTENCIA.rucSinDato }];
  const a: Advertencia[] = [];
  if (ruc.estado !== "ACTIVO") a.push({ nivel: "alerta", texto: ADVERTENCIA.rucNoActivo(ruc.estado) });
  if (ruc.condicion !== "HABIDO") a.push({ nivel: "observacion", texto: ADVERTENCIA.rucNoHabido(ruc.condicion) });
  return a;
}

/** validacionVence: solo para prestadores publicados por validación del admin (no por padrón oficial). */
function estadoDe(advertencias: Advertencia[], validacionVence: string | null, hoy: string): Estado {
  if (advertencias.some((a) => a.nivel === "alerta")) return "alerta";
  if (validacionVence) return validacionVence >= hoy ? "actualizacion" : "no_encontrado"; // caducada: vuelve a revisión
  return advertencias.length ? "observaciones" : "verificado";
}

export function dictamenPrestador(p: Prestador, autorizaciones: Autorizacion[], ruc: Ruc, hoy: string): Dictamen {
  const a = advertenciasRuc(p.ruc, ruc);
  if (p.estado_inscripcion === "suspendida") a.push({ nivel: "alerta", texto: ADVERTENCIA.inscripcionSuspendida });
  if (p.tipo === "agencia" && p.clases.includes("mayorista")) a.push({ nivel: "observacion", texto: ADVERTENCIA.mayorista });

  const tiene = (tipo: string) => autorizaciones.some((x) => x.tipo === tipo);
  if (p.actividades.includes("aventura") && !tiene("certificado_aventura"))
    a.push({ nivel: "observacion", texto: ADVERTENCIA.aventuraSinCertificado });
  if (p.tipo === "guia" && !tiene("carne_guia")) a.push({ nivel: "observacion", texto: ADVERTENCIA.guiaSinCarne });

  for (const aut of autorizaciones) {
    if (!aut.fecha_vencimiento) continue;
    const nombre = NOMBRE_AUTORIZACION[aut.tipo] ?? aut.tipo;
    const dias = diasHasta(aut.fecha_vencimiento, hoy);
    if (dias < 0) a.push({ nivel: "alerta", texto: ADVERTENCIA.autorizacionVencida(nombre, fechaLegible(aut.fecha_vencimiento)) });
    else if (dias <= REGLAS.diasAvisoVencimiento)
      a.push({ nivel: "observacion", texto: ADVERTENCIA.autorizacionPorVencer(nombre, fechaLegible(aut.fecha_vencimiento)) });
  }
  return { estado: estadoDe(a, p.validacion_vence, hoy), advertencias: a };
}

export function dictamenVehiculo(v: Vehiculo, rucNumero: string | null, ruc: Ruc, hoy: string, validacionVence: string | null = null): Dictamen {
  const a = advertenciasRuc(rucNumero, ruc);
  if (v.estado === "cancelado") a.push({ nivel: "alerta", texto: ADVERTENCIA.vehiculoCancelado });
  if (v.habilitacion_vencimiento) {
    const dias = diasHasta(v.habilitacion_vencimiento, hoy);
    const f = fechaLegible(v.habilitacion_vencimiento);
    if (dias < 0) a.push({ nivel: "alerta", texto: ADVERTENCIA.habilitacionVencida(f) });
    else if (dias <= REGLAS.diasAvisoVencimiento) a.push({ nivel: "observacion", texto: ADVERTENCIA.habilitacionPorVencer(f) });
  }
  if (v.modalidad !== "turistico") a.push({ nivel: "observacion", texto: ADVERTENCIA.otraModalidad(v.modalidad) });
  if (v.citv_vencimiento && diasHasta(v.citv_vencimiento, hoy) < 0)
    a.push({ nivel: "observacion", texto: ADVERTENCIA.citvVencido(fechaLegible(v.citv_vencimiento)) });
  if (v.soat_vencimiento && diasHasta(v.soat_vencimiento, hoy) < 0)
    a.push({ nivel: "observacion", texto: ADVERTENCIA.soatVencido(fechaLegible(v.soat_vencimiento)) });
  return { estado: estadoDe(a, validacionVence, hoy), advertencias: a };
}

/** ¿El mejor candidato es claramente "el" buscado? Si no, el usuario elige (nunca en silencio). */
export function coincidenciaClara(similitudes: number[]): boolean {
  const [primero, segundo = 0] = similitudes;
  const b = REGLAS.busqueda;
  return primero !== undefined && primero >= b.umbralCoincidenciaClara && primero - segundo >= b.distanciaMinimaAlSegundo;
}

/** Suma observaciones que no vienen del registro (p. ej. de la imagen consultada). Nunca mejora un estado. */
export function conObservaciones(d: Dictamen, textos: string[]): Dictamen {
  if (!textos.length) return d;
  const advertencias = [...d.advertencias, ...textos.map((texto) => ({ nivel: "observacion" as const, texto }))];
  return { estado: d.estado === "verificado" ? "observaciones" : d.estado, advertencias };
}

/** ?obs=sin_ruc,datos_distintos → textos. Lista blanca: la URL no puede inyectar texto. */
export const observacionesDe = (param: string | string[] | undefined) =>
  String(param ?? "").split(",").filter((c): c is CodigoObs => c in OBS_IMAGEN).map((c) => OBS_IMAGEN[c]);
