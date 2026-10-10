import { test } from "node:test";
import assert from "node:assert/strict";
import { verificarComprobante } from "./resenas";
import { normalizarSerie, type CamposComprobante } from "./vision";

const HOY = "2026-10-10";
const RUC = "20999999949";
const c: CamposComprobante = { es_comprobante: true, tipo: "boleta", ruc_emisor: RUC, razon_social_emisor: "X", serie_numero: "B001-123", fecha_emision: "2026-10-05", total: "S/ 60.00" };

test("acepta solo comprobantes del mismo RUC, legibles y recientes", () => {
  assert.equal(verificarComprobante(c, RUC, "2026-10-05", HOY).aceptado, true);
  assert.equal(verificarComprobante({ ...c, ruc_emisor: "20999999922" }, RUC, "2026-10-05", HOY).aceptado, false);
  assert.equal(verificarComprobante({ ...c, es_comprobante: false }, RUC, "2026-10-05", HOY).aceptado, false);
  assert.equal(verificarComprobante({ ...c, serie_numero: null }, RUC, "2026-10-05", HOY).aceptado, false);
  assert.equal(verificarComprobante({ ...c, fecha_emision: "2026-12-01" }, RUC, "2026-10-05", HOY).aceptado, false);
  assert.equal(verificarComprobante({ ...c, fecha_emision: "2025-01-01" }, RUC, "2026-10-05", HOY).aceptado, false);
});

test("fecha de servicio lejana: se acepta pero queda marcada para el admin", () => {
  const v = verificarComprobante(c, RUC, "2026-01-01", HOY);
  assert.equal(v.aceptado, true);
  assert.equal(v.aceptado && v.chequeos.some((x) => !x.ok), true);
});

test("normalizarSerie", () => {
  assert.equal(normalizarSerie("b001 - 00012345"), "B001-12345");
  assert.equal(normalizarSerie("B001-12345"), "B001-12345");
  assert.equal(normalizarSerie("F001-0000001"), "F001-1");
  assert.equal(normalizarSerie("cualquier cosa"), null);
});
