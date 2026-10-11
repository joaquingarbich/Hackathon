// Carga los padrones OFICIALES (base de la verificación): Directorio MINCETUR (agencias) y resoluciones
// de transporte turístico (MTC, GORE Piura - DRTC, Municipalidad). Idempotente: re-correr con exports nuevos
// actualiza sin duplicar. No toca lo que las empresas declaran en CheckTur (canales fuente 'empresa', etc.).
// Uso: npm run load:padrones -- mincetur_agencias_piura_AAAAMMDD.csv placas_turismo_piura_AAAAMMDD.csv
import { readFileSync } from "node:fs";
import { supabaseAdmin } from "../lib/supabase/admin.ts";
import { normalizarPlaca, rucValido } from "../lib/normalizacion.ts";

const [csvMincetur, csvMtc] = process.argv.slice(2);
if (!csvMincetur || !csvMtc) throw new Error("Uso: npm run load:padrones -- <mincetur.csv> <placas_mtc.csv>");
const db = supabaseAdmin();

/** CSV mínimo (RFC 4180: comillas, comas y saltos dentro de comillas). */
function leerCsv(ruta: string): Record<string, string>[] {
  const t = readFileSync(ruta, "utf8").replace(/^﻿/, "");
  const filas: string[][] = [];
  let fila: string[] = [], campo = "", comillas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (comillas) {
      if (c === '"' && t[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      fila.push(campo); campo = "";
      if (fila.some((x) => x.trim())) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); if (fila.some((x) => x.trim())) filas.push(fila); }
  const [cab, ...resto] = filas;
  return resto.map((f) => Object.fromEntries(cab.map((k, i) => [k.trim(), (f[i] ?? "").trim()])));
}

const nulo = (v: string) => (v ? v : null);
const clave = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const sumarAnios = (iso: string, n: number) => { const [a, m, d] = iso.split("-").map(Number); return `${a + n}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; };
/** "972503429 / 905984477" → celulares peruanos de 9 dígitos (los fijos quedan solo como teléfono visible). */
const celulares = (t: string) => [...new Set((t.match(/\d[\d\s-]{5,}\d/g) ?? []).map((x) => x.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, "")).filter((x) => /^9\d{8}$/.test(x)))];
const visible = (d: string) => `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;

async function ok<T>(p: PromiseLike<{ data: T; error: { message: string } | null }>): Promise<NonNullable<T>> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data as NonNullable<T>;
}

// ---------- 1) Directorio MINCETUR: agencias ----------
const mincetur = leerCsv(csvMincetur);
const corteMincetur = mincetur[0]?.fecha_corte?.slice(0, 10);
await ok(db.from("sources").update({ fecha_corte: corteMincetur, n_registros: mincetur.length }).eq("id", "mincetur_directorio"));

const existentes = await ok(db.from("providers").select("id, ruc, razon_social, source_id"));
const porRuc = new Map(existentes.filter((p) => p.ruc).map((p) => [p.ruc!, p.id]));
const porNombre = new Map(existentes.map((p) => [clave(p.razon_social ?? ""), p.id]));

let agencias = 0, canalesMincetur = 0;
for (const r of mincetur) {
  const cl = r.clasificacion.toLowerCase();
  const clases = [cl.includes("minorista") && "minorista", cl.includes("mayorista") && "mayorista", cl.includes("operador") && "operador"].filter(Boolean) as string[];
  const mod = r.modalidad.toLowerCase();
  const fila = {
    tipo: "agencia", ruc: r.ruc, razon_social: r.razon_social, nombre_comercial: nulo(r.nombre_comercial), clases,
    modalidad: mod.includes("presencial") && mod.includes("digital") ? "presencial_digital" : mod.includes("digital") ? "digital" : mod ? "presencial" : null,
    direccion: nulo(r.direccion), distrito: nulo(r.distrito), provincia: nulo(r.provincia),
    telefono: nulo(r.telefono), correo: nulo(r.correo), web: nulo(r.web),
    estado_inscripcion: /suspend/i.test(r.estado_inscripcion) ? "suspendida" : "vigente",
    es_muestra: false, source_id: "mincetur_directorio",
  };
  let id = porRuc.get(r.ruc);
  if (id) await ok(db.from("providers").update(fila).eq("id", id));
  else {
    id = (await ok(db.from("providers").insert(fila).select("id").single())).id;
    porRuc.set(r.ruc, id); porNombre.set(clave(r.razon_social), id);
  }
  agencias++;
  // Constancia: se reemplazan las de esta fuente
  await ok(db.from("authorizations").delete().eq("provider_id", id).eq("source_id", "mincetur_directorio"));
  if (r.numero_constancia)
    await ok(db.from("authorizations").insert({
      provider_id: id, tipo: "constancia_dircetur", entidad_emisora: "DIRCETUR Piura", numero: r.numero_constancia,
      fecha_emision: nulo(r.fecha_expedicion), fecha_vencimiento: null, source_id: "mincetur_directorio", url_fuente: nulo(r.url_fuente),
    }));
  // Celulares del Directorio como canal OFICIAL (fuente mincetur), para buscar por número
  await ok(db.from("canales").delete().eq("provider_id", id).eq("fuente", "mincetur"));
  for (const c of celulares(r.telefono)) {
    const { error } = await db.from("canales").insert({ provider_id: id, tipo: "telefono", valor: c, visible: visible(c), estado: "aprobado", fuente: "mincetur" });
    if (!error) canalesMincetur++; // mismo número en dos agencias: el índice único deja el primero
  }
}

// ---------- 2) MTC / GORE / Municipalidad: placas y autorizaciones ----------
const mtc = leerCsv(csvMtc);
const corteMtc = mtc[0]?.fecha_corte?.slice(0, 10);
await ok(db.from("sources").update({ fecha_corte: corteMtc, n_registros: mtc.length }).eq("id", "mtc_resoluciones"));

const sinEmpresa: string[] = [];
const autorizacionesVistas = new Set<string>();
let placas = 0, empresasNuevas = 0;
for (const r of mtc) {
  const placa = normalizarPlaca(r.placa);
  if (!placa || !r.empresa) { sinEmpresa.push(`${r.placa} (${r.emisor} ${r.numero_resolucion})`); continue; }
  // Empresa: por RUC; si no trae RUC, por razón social normalizada; si no existe, se crea como transporte
  let id = (r.ruc && porRuc.get(r.ruc)) || porNombre.get(clave(r.empresa));
  if (!id) {
    id = (await ok(db.from("providers").insert({
      tipo: "transporte_terrestre", ruc: r.ruc && rucValido(r.ruc) ? r.ruc : nulo(r.ruc), razon_social: r.empresa,
      direccion: nulo(r.domicilio.slice(0, 200)), provincia: nulo(r.provincia_piura), es_muestra: false, source_id: "mtc_resoluciones",
    }).select("id").single())).id;
    if (r.ruc) porRuc.set(r.ruc, id);
    porNombre.set(clave(r.empresa), id);
    empresasNuevas++;
  }
  const anios = Number(r.vigencia_anios);
  const vence = r.fecha_resolucion && anios ? sumarAnios(r.fecha_resolucion, anios) : null;
  const numero = `${r.numero_resolucion}${r.expediente ? ` (exp. ${r.expediente})` : ""}`;
  // Autorización de la empresa (una por resolución): se reemplazan las de esta fuente la primera vez que se ve la empresa
  const claveAut = `${id}|${r.numero_resolucion}|${r.emisor}`;
  if (!autorizacionesVistas.has(claveAut)) {
    if (![...autorizacionesVistas].some((k) => k.startsWith(`${id}|`)))
      await ok(db.from("authorizations").delete().eq("provider_id", id).eq("source_id", "mtc_resoluciones"));
    autorizacionesVistas.add(claveAut);
    await ok(db.from("authorizations").insert({
      provider_id: id, tipo: "autorizacion_transporte", entidad_emisora: r.emisor, numero, fecha_emision: nulo(r.fecha_resolucion),
      fecha_vencimiento: vence, source_id: "mtc_resoluciones", url_fuente: r.url_fuente.startsWith("https://") ? r.url_fuente : null,
    }));
  }
  // Vehículo: manda el MTC (aprobado por ser registro oficial); por placa
  const vehiculo = {
    provider_id: id, placa, modalidad: r.modalidad || "turistico", ambito: (["nacional", "regional", "provincial"].includes(r.ambito) ? r.ambito : null),
    estado: "habilitado", habilitacion_vencimiento: vence, autorizacion_mtc: `${r.emisor} · R. ${r.numero_resolucion}`.slice(0, 60),
    aprobacion: "aprobado", es_muestra: false, source_id: "mtc_resoluciones",
  };
  const { data: previo } = await db.from("vehicles").select("id").eq("placa", placa).eq("source_id", "mtc_resoluciones").maybeSingle();
  if (previo) await ok(db.from("vehicles").update(vehiculo).eq("id", previo.id));
  else {
    // Si una empresa la había declarado y aprobado en CheckTur, el registro oficial la reemplaza
    await ok(db.from("vehicles").update({ aprobacion: "rechazado", motivo: "La placa figura en el registro oficial del MTC." }).eq("placa", placa).eq("aprobacion", "aprobado"));
    await ok(db.from("vehicles").insert(vehiculo));
  }
  placas++;
}

console.log(`MINCETUR: ${agencias} agencias (corte ${corteMincetur}), ${canalesMincetur} celulares oficiales`);
console.log(`MTC: ${placas} placas, ${empresasNuevas} empresas de transporte nuevas (corte ${corteMtc})`);
if (sinEmpresa.length) console.log(`Omitidas (sin empresa en el registro): ${sinEmpresa.join(", ")}`);
