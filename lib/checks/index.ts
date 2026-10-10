// Capas de verificación de un documento subido (CHECKTUR_CONTEXTO.md §4). Puras: el contexto lo arma lib/validacion.ts.
// Ninguna capa aprueba sola: el resultado orienta al admin, que decide.
import { REGLAS } from "@/config/reglas";
import { normalizarPlaca, rucValido } from "@/lib/normalizacion";
import type { Extraccion, TipoDocumento } from "@/lib/vision";

export type Resultado = "ok" | "aviso" | "alerta" | "no_evaluado";
export type Capa = { id: string; nombre: string; resultado: Resultado; detalle: string };
export type Confianza = "alta" | "media" | "baja";

export type Contexto = {
  tipo: TipoDocumento;
  ruc: string;
  declarados: { nombre_comercial?: string; placa?: string };
  mime: string;
  bytes: Uint8Array;
  extraccion: Extraccion | null;
  hoy: string;
  sunat: { razon_social: string; estado: string; condicion: string; ubigeo: string | null } | null;
  enPadronOficial: { nombre: string } | null;
  duplicados: { mismoArchivoOtraCuenta: boolean; mismoRucOtraCuenta: boolean };
};

const comparable = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(s a c|e i r l|s r l|s a|sac|eirl|srl|sa)\b/g, " ")
    .replace(/\s+/g, " ").trim();

/** Coincidencia difusa simple: uno contiene al otro una vez normalizados. */
export const mismoNombre = (a: string, b: string) => {
  const x = comparable(a), y = comparable(b);
  return !!x && !!y && (x.includes(y) || y.includes(x));
};

const texto = (bytes: Uint8Array) => new TextDecoder("latin1").decode(bytes);
const esPdf = (mime: string) => mime === "application/pdf";

function extraccion(c: Contexto): Capa {
  const base = { id: "extraccion", nombre: "1. Lectura del documento" };
  return c.extraccion
    ? { ...base, resultado: "ok", detalle: "Campos leídos automáticamente del documento." }
    : { ...base, resultado: "no_evaluado", detalle: "Lectura automática no disponible: revisar el documento a mano." };
}

function estructura(c: Contexto): Capa {
  const base = { id: "estructura", nombre: "2. Forma de documento oficial" };
  const e = c.extraccion;
  if (!e) return { ...base, resultado: "no_evaluado", detalle: "Requiere la lectura del documento." };
  const faltas: string[] = [];
  if (e.tipo === "constancia_agencia") {
    const f = e.campos;
    if (!f.numero_constancia) faltas.push("sin n.° de constancia");
    if (!f.cita_decreto_005_2020) faltas.push("no cita el D.S. 005-2020-MINCETUR");
    if (f.clase && !/minorista|mayorista|operador/i.test(f.clase)) faltas.push(`clase no reconocida («${f.clase}»)`);
    if (f.fecha_emision && f.fecha_emision > c.hoy) faltas.push("fecha de emisión futura");
    if (f.fecha_emision && f.fecha_emision < "2020-06-01") faltas.push("fecha anterior a la norma que cita");
  } else {
    const f = e.campos;
    if (!f.placa) faltas.push("sin placa");
    if (!f.numero_tuc && !f.numero_resolucion) faltas.push("sin n.° de TUC ni de resolución");
  }
  return faltas.length
    ? { ...base, resultado: "alerta", detalle: faltas.join("; ") + "." }
    : { ...base, resultado: "ok", detalle: "Tiene los elementos esperados para este tipo de documento." };
}

function coherencia(c: Contexto): Capa {
  const base = { id: "coherencia", nombre: "3. Coherencia de datos" };
  const p: string[] = [];
  if (!rucValido(c.ruc)) p.push("el RUC declarado no tiene un dígito verificador válido");
  const rucDoc = c.extraccion?.campos.ruc?.replace(/\D/g, "");
  if (rucDoc && rucDoc !== c.ruc) p.push(`el documento dice RUC ${rucDoc}, se declaró ${c.ruc}`);
  if (c.tipo === "tuc") {
    const declarada = c.declarados.placa ? normalizarPlaca(c.declarados.placa) : null;
    if (!declarada) p.push("placa declarada sin formato peruano válido");
    const enDoc = c.extraccion?.tipo === "tuc" && c.extraccion.campos.placa ? normalizarPlaca(c.extraccion.campos.placa) : null;
    if (declarada && enDoc && declarada !== enDoc) p.push(`el documento dice placa ${enDoc}, se declaró ${declarada}`);
  }
  return p.length
    ? { ...base, resultado: "alerta", detalle: p.join("; ") + "." }
    : { ...base, resultado: "ok", detalle: "RUC y datos declarados son consistentes." };
}

function sunat(c: Contexto): Capa {
  const base = { id: "sunat", nombre: "4. Cruce con SUNAT" };
  const s = c.sunat;
  if (!s) return { ...base, resultado: "aviso", detalle: "El RUC no está en el padrón SUNAT cargado (puede faltar cargarlo)." };
  const p: string[] = [];
  let r: Resultado = "ok";
  if (s.estado !== "ACTIVO") { p.push(`estado ${s.estado}`); r = "alerta"; }
  if (s.condicion !== "HABIDO") { p.push(`condición ${s.condicion}`); r = "alerta"; }
  if (s.ubigeo && !s.ubigeo.startsWith(REGLAS.ubigeoDepartamento)) { p.push("domicilio fiscal fuera de Piura"); if (r === "ok") r = "aviso"; }
  const rsDoc = c.extraccion?.campos.razon_social;
  if (rsDoc && !mismoNombre(rsDoc, s.razon_social)) { p.push(`razón social del documento («${rsDoc}») no coincide con SUNAT`); r = "alerta"; }
  return { ...base, resultado: r, detalle: `${s.razon_social}: ${p.length ? p.join("; ") : "ACTIVO y HABIDO"}.` };
}

function padron(c: Contexto): Capa {
  const base = { id: "padron", nombre: "5. Cruce con padrón oficial" };
  return c.enPadronOficial
    ? { ...base, resultado: "aviso", detalle: `Ya figura en el padrón oficial como «${c.enPadronOficial.nombre}»: el documento solo confirma.` }
    : { ...base, resultado: "ok", detalle: "Aún no figura en el padrón oficial (es el caso que este flujo cubre)." };
}

function firma(c: Contexto): Capa {
  const base = { id: "firma", nombre: "6. Firma digital" };
  if (!esPdf(c.mime)) return { ...base, resultado: "no_evaluado", detalle: "Es una imagen: no puede llevar firma digital." };
  const t = texto(c.bytes);
  // ponytail: detecta que hay firma, no la valida criptográficamente; validar en Firma Perú (gob.pe/22271).
  return /\/ByteRange\s*\[/.test(t) && /\/Type\s*\/Sig\b|\/FT\s*\/Sig\b/.test(t)
    ? { ...base, resultado: "ok", detalle: "El PDF contiene una firma digital. Validarla en Firma Perú (gob.pe/22271)." }
    : { ...base, resultado: "aviso", detalle: "El PDF no contiene firma digital." };
}

function qr(): Capa {
  // ponytail: sin decodificar QR en v1 (el formato oficial de constancia no lo exige). Añadir cuando las muestras de Piura lo traigan.
  return { id: "qr", nombre: "7. Código QR / verificación", resultado: "no_evaluado", detalle: "No evaluado automáticamente: si el documento trae QR, abrirlo y confirmar que apunta a un dominio .gob.pe." };
}

function manipulacion(c: Contexto): Capa {
  const base = { id: "manipulacion", nombre: "8. Señales de edición o duplicado" };
  const p: string[] = [];
  let r: Resultado = "ok";
  if (c.duplicados.mismoArchivoOtraCuenta) { p.push("el mismo archivo ya fue subido por otra cuenta"); r = "alerta"; }
  if (c.duplicados.mismoRucOtraCuenta) { p.push("otra cuenta ya presentó una solicitud para este RUC"); if (r === "ok") r = "aviso"; }
  if (esPdf(c.mime)) {
    const productor = texto(c.bytes).match(/\/(?:Producer|Creator)\s*\(([^)]{1,80})\)/)?.[1];
    if (productor && /photoshop|gimp|canva|ilovepdf|smallpdf|sejda|word|pages|libreoffice/i.test(productor)) {
      p.push(`creado o editado con «${productor}»`);
      if (r === "ok") r = "aviso";
    }
  }
  return { ...base, resultado: r, detalle: p.length ? p.join("; ") + "." : "Sin señales de duplicado ni de edición en metadatos." };
}

export function correrCapas(c: Contexto): { capas: Capa[]; confianza: Confianza } {
  const capas = [extraccion(c), estructura(c), coherencia(c), sunat(c), padron(c), firma(c), qr(), manipulacion(c)];
  const r = (id: string) => capas.find((x) => x.id === id)!.resultado;
  let confianza: Confianza = "media";
  if (capas.some((x) => x.resultado === "alerta")) confianza = "baja";
  else if (r("sunat") === "ok" && r("firma") === "ok" && r("estructura") === "ok") confianza = "alta";
  return { capas, confianza };
}
