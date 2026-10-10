import { test } from "node:test";
import assert from "node:assert/strict";
import { validarPerfil, validarServicio } from "./agencia-validar";

test("perfil", () => {
  const r = validarPerfil({ telefono: "+51 987 654 321", instagram: "@mi.agencia", web: "https://agencia.pe", correo: "a@b.pe" });
  assert.equal(r.ok, true);
  assert.deepEqual(r.ok && r.datos.redes, { instagram: "@mi.agencia" });
  assert.equal(r.ok && r.datos.telefono, "987654321");
  assert.equal(validarPerfil({ telefono: "12345" }).ok, false);
  assert.equal(validarPerfil({ web: "javascript:alert(1)" }).ok, false);
  assert.equal(validarPerfil({ instagram: "a b<script>" }).ok, false);
});

const base = { categoria: "experiencia", nombre: "Tour a Colán", destino: "colan_paita", descripcion: "Un tour de medio día por la playa de Colán con guía.", unidad_precio: "por persona" };

test("servicio", () => {
  const r = validarServicio({ ...base, precio_ref: "60,50", idiomas: ["Español", "Klingon"], incluye: "Guía\n\nAgua", itinerario: "Encuentro: en el malecón" }, "agencia");
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.datos.precio_ref, 60.5);
  assert.deepEqual(r.ok && r.datos.idiomas, ["Español"]);
  assert.deepEqual(r.ok && r.datos.incluye, ["Guía", "Agua"]);
  assert.deepEqual(r.ok && r.datos.itinerario, [{ titulo: "Encuentro", detalle: "en el malecón" }]);
  assert.equal(validarServicio({ ...base, categoria: "hospedaje" }, "agencia").ok, false); // categoría incompatible
  assert.equal(validarServicio({ ...base, destino: "lima" }, "agencia").ok, false);
  assert.equal(validarServicio({ ...base, descripcion: "corta" }, "agencia").ok, false);
  assert.equal(validarServicio({ ...base, grupo_max: "0" }, "agencia").ok, false);
});
