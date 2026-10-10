import { test } from "node:test";
import assert from "node:assert/strict";
import { rucValido, normalizarPlaca, clasificarEntrada } from "./normalizacion";

test("rucValido", () => {
  assert.equal(rucValido("20131312955"), true); // SUNAT, RUC público
  assert.equal(rucValido("20131312956"), false); // dígito verificador alterado
  assert.equal(rucValido("30131312955"), false); // prefijo inválido
  assert.equal(rucValido("2013131295"), false);
});

test("normalizarPlaca", () => {
  assert.equal(normalizarPlaca("abc-123"), "ABC123");
  assert.equal(normalizarPlaca("A1B 234"), "A1B234");
  assert.equal(normalizarPlaca("ABCDEF"), null);
  assert.equal(normalizarPlaca("AB-12"), null);
  assert.equal(normalizarPlaca("123ABC"), null);
});

test("clasificarEntrada", () => {
  assert.deepEqual(clasificarEntrada("20131312955"), { tipo: "ruc", valor: "20131312955" });
  assert.deepEqual(clasificarEntrada("mue-001"), { tipo: "placa", valor: "MUE001" });
  assert.deepEqual(clasificarEntrada("Vaca Loca Tours"), { tipo: "nombre", valor: "Vaca Loca Tours" });
  assert.deepEqual(clasificarEntrada("Tours1"), { tipo: "nombre", valor: "Tours1" }); // 6 alfanuméricos pero no termina en 3 dígitos
});
