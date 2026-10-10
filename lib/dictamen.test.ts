import { test } from "node:test";
import assert from "node:assert/strict";
import { dictamenPrestador, dictamenVehiculo, coincidenciaClara } from "./dictamen";

const HOY = "2026-10-10";
const OK = { estado: "ACTIVO", condicion: "HABIDO" };
const agencia = { tipo: "agencia", ruc: "20999999922", clases: ["minorista"], actividades: [] as string[], estado_inscripcion: "vigente", validacion_vence: null as string | null };
const vehiculo = { estado: "habilitado", modalidad: "turistico", habilitacion_vencimiento: "2034-02-01", citv_vencimiento: "2027-03-15", soat_vencimiento: "2027-01-10" };

test("prestador", () => {
  assert.equal(dictamenPrestador(agencia, [], OK, HOY).estado, "verificado");
  assert.equal(dictamenPrestador({ ...agencia, clases: ["mayorista"] }, [], OK, HOY).estado, "observaciones");
  assert.equal(dictamenPrestador(agencia, [], { estado: "BAJA DE OFICIO", condicion: "HABIDO" }, HOY).estado, "alerta");
  assert.equal(dictamenPrestador(agencia, [], null, HOY).estado, "observaciones"); // sin dato SUNAT no es verde
  assert.equal(dictamenPrestador({ ...agencia, estado_inscripcion: "suspendida" }, [], OK, HOY).estado, "alerta");
  const aventura = { ...agencia, actividades: ["aventura"] };
  assert.equal(dictamenPrestador(aventura, [], OK, HOY).estado, "observaciones");
  assert.equal(dictamenPrestador(aventura, [{ tipo: "certificado_aventura", fecha_vencimiento: null }], OK, HOY).estado, "verificado");
  assert.equal(dictamenPrestador(agencia, [{ tipo: "autorizacion_transporte", fecha_vencimiento: "2026-01-01" }], OK, HOY).estado, "alerta");
  assert.equal(dictamenPrestador(agencia, [{ tipo: "autorizacion_transporte", fecha_vencimiento: "2026-10-30" }], OK, HOY).estado, "observaciones");
});

test("validación anticipada (azul) y su caducidad", () => {
  assert.equal(dictamenPrestador({ ...agencia, validacion_vence: "2026-12-09" }, [], OK, HOY).estado, "actualizacion");
  assert.equal(dictamenPrestador({ ...agencia, validacion_vence: "2026-10-01" }, [], OK, HOY).estado, "no_encontrado");
  assert.equal(dictamenPrestador({ ...agencia, validacion_vence: "2026-12-09" }, [], { estado: "BAJA DE OFICIO", condicion: "HABIDO" }, HOY).estado, "alerta");
});

test("vehículo (casos del seed)", () => {
  assert.equal(dictamenVehiculo(vehiculo, "20999999906", OK, HOY).estado, "verificado"); // MUE001
  assert.equal(dictamenVehiculo({ ...vehiculo, habilitacion_vencimiento: "2026-03-01" }, "20999999906", OK, HOY).estado, "alerta"); // MUE002
  assert.equal(dictamenVehiculo({ ...vehiculo, modalidad: "trabajadores" }, "20999999906", OK, HOY).estado, "observaciones"); // MUE003
  assert.equal(dictamenVehiculo({ ...vehiculo, estado: "cancelado" }, "20999999914", OK, HOY).estado, "alerta"); // MUE004
  assert.equal(dictamenVehiculo({ ...vehiculo, soat_vencimiento: "2026-08-31" }, "20999999914", OK, HOY).estado, "observaciones"); // MUE005
});

test("coincidenciaClara", () => {
  assert.equal(coincidenciaClara([1, 0.57]), true);
  assert.equal(coincidenciaClara([0.9, 0.85]), false); // dos parecidos: elige el usuario
  assert.equal(coincidenciaClara([0.69]), false);
  assert.equal(coincidenciaClara([]), false);
});

