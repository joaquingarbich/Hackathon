import { test } from "node:test";
import assert from "node:assert/strict";
import { dictamenPrestador, dictamenVehiculo, coincidenciaClara, vencimientos } from "./dictamen";

const HOY = "2026-10-10";
const OK = { estado: "ACTIVO", condicion: "HABIDO" };
const agencia = { tipo: "agencia", ruc: "20999999922", clases: ["minorista"], actividades: [] as string[], estado_inscripcion: "vigente", validacion_vence: null as string | null };
const vehiculo = { estado: "habilitado", modalidad: "turistico", habilitacion_vencimiento: "2034-02-01", citv_vencimiento: "2027-03-15", soat_vencimiento: "2027-01-10" };

test("prestador", () => {
  assert.equal(dictamenPrestador(agencia, [], OK, HOY).estado, "verificado");
  assert.equal(dictamenPrestador({ ...agencia, clases: ["mayorista"] }, [], OK, HOY).estado, "observaciones");
  assert.equal(dictamenPrestador({ ...agencia, clases: ["minorista", "mayorista", "operador"] }, [], OK, HOY).estado, dictamenPrestador(agencia, [], OK, HOY).estado); // mayorista + minorista: sin advertencia
  assert.equal(dictamenPrestador(agencia, [], { estado: "BAJA DE OFICIO", condicion: "HABIDO" }, HOY).estado, "alerta");
  assert.equal(dictamenPrestador(agencia, [], null, HOY).estado, "verificado"); // sin dato SUNAT: manda el padrón MINCETUR/MTC
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


test("flota: SOAT vencido de una unidad → empresa con observaciones", () => {
  const unidad = { placa: "MUE005", soat_vencimiento: "2026-08-31", citv_vencimiento: "2027-02-01" };
  assert.equal(dictamenPrestador(agencia, [], OK, HOY, { vehiculos: [unidad] }).estado, "observaciones");
  assert.equal(dictamenPrestador(agencia, [], OK, HOY, { vehiculos: [{ ...unidad, soat_vencimiento: "2027-08-31" }] }).estado, "verificado");
  assert.equal(dictamenPrestador(agencia, [], OK, HOY, { personal: [{ nombre: "Ana", carne_vence: "2026-01-01" }] }).estado, "observaciones");
});

test("vencimientos del panel", () => {
  const v = vencimientos([
    { que: "SOAT MUE005", fecha: "2026-08-31" },
    { que: "CITV MUE001", fecha: "2026-10-25" },
    { que: "SOAT MUE001", fecha: "2027-01-10" },
    { que: "Constancia", fecha: null },
  ], HOY);
  assert.deepEqual(v.map((x) => [x.que, x.estado]), [["SOAT MUE005", "vencido"], ["CITV MUE001", "por_vencer"]]);
});

test("en actualización con un documento vencido → con observaciones", () => {
  const validada = { ...agencia, validacion_vence: "2026-12-31" };
  assert.equal(dictamenPrestador(validada, [], OK, HOY).estado, "actualizacion");
  assert.equal(dictamenPrestador(validada, [], OK, HOY, { vehiculos: [{ placa: "MUE007", soat_vencimiento: "2026-09-01", citv_vencimiento: null }] }).estado, "observaciones");
});
