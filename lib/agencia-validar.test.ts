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

test("servicio", () => {
  const r = validarServicio({ nombre: "Tour a Colán", destino: "colan_paita" }, "agencia");
  assert.deepEqual(r.ok && r.datos, { categoria: "experiencia", nombre: "Tour a Colán", destino: "colan_paita" });
  assert.equal(validarServicio({ nombre: "Tour a Colán", destino: "lima" }, "agencia").ok, false);
  assert.equal(validarServicio({ nombre: "x", destino: "colan_paita" }, "agencia").ok, false);
  assert.equal(validarServicio({ nombre: "Tour a Colán", destino: "colan_paita" }, "otro").ok, false);
});
