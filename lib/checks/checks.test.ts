import { test } from "node:test";
import assert from "node:assert/strict";
import { correrCapas, mismoNombre, type Contexto } from "./index";

const base: Contexto = {
  tipo: "constancia_agencia",
  ruc: "20999999931",
  declarados: { nombre_comercial: "Tours Ejemplo Máncora" },
  mime: "image/png",
  bytes: new Uint8Array(),
  extraccion: null,
  hoy: "2026-10-10",
  sunat: { razon_social: "TOURS EJEMPLO MANCORA S.A.C. (MUESTRA)", estado: "ACTIVO", condicion: "HABIDO", ubigeo: "200704" },
  enPadronOficial: null,
  duplicados: { mismoArchivoOtraCuenta: false, mismoRucOtraCuenta: false },
};
const capa = (c: Contexto, id: string) => correrCapas(c).capas.find((x) => x.id === id)!;

test("sin extracción: media, nunca alta", () => {
  const r = correrCapas(base);
  assert.equal(r.confianza, "media");
  assert.equal(capa(base, "estructura").resultado, "no_evaluado");
});

test("RUC inválido o de baja → baja", () => {
  assert.equal(correrCapas({ ...base, ruc: "20999999930" }).confianza, "baja");
  assert.equal(correrCapas({ ...base, sunat: { ...base.sunat!, estado: "BAJA DE OFICIO" } }).confianza, "baja");
});

test("duplicado de archivo → alerta", () => {
  assert.equal(capa({ ...base, duplicados: { mismoArchivoOtraCuenta: true, mismoRucOtraCuenta: false } }, "manipulacion").resultado, "alerta");
});

test("PDF firmado + extracción coherente → alta", () => {
  const pdf = new TextEncoder().encode("%PDF-1.7 /Type /Sig /ByteRange [0 10 20 30] /Producer (Firma Peru)");
  const c: Contexto = {
    ...base, mime: "application/pdf", bytes: pdf,
    extraccion: {
      tipo: "constancia_agencia", certeza: {},
      campos: { numero_constancia: "001-2026", nombre_comercial: "Tours Ejemplo Máncora", razon_social: "Tours Ejemplo Mancora SAC (muestra)", ruc: "20999999931", clase: "Minorista", modalidad: "presencial", direccion: null, fecha_emision: "2026-10-01", entidad_emisora: "DIRCETUR Piura", cita_decreto_005_2020: true },
    },
  };
  assert.equal(correrCapas(c).confianza, "alta");
  assert.equal(capa({ ...c, extraccion: { ...c.extraccion!, campos: { ...c.extraccion!.campos, ruc: "20111111111" } } as Contexto["extraccion"] }, "coherencia").resultado, "alerta");
});

test("PDF editado con Canva → aviso", () => {
  const pdf = new TextEncoder().encode("%PDF-1.4 /Producer (Canva)");
  assert.equal(capa({ ...base, mime: "application/pdf", bytes: pdf }, "manipulacion").resultado, "aviso");
});

test("mismoNombre", () => {
  assert.equal(mismoNombre("Tours Ejemplo Máncora S.A.C.", "TOURS EJEMPLO MANCORA SAC"), true);
  assert.equal(mismoNombre("Otra Empresa", "TOURS EJEMPLO MANCORA SAC"), false);
});
