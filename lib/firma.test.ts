import { test } from "node:test";
import assert from "node:assert/strict";
import { firmar, firmaValida } from "./firma";

process.env.SUPABASE_SERVICE_ROLE_KEY ??= "clave-de-prueba"; // la clave se lee al firmar, no al importar

test("firma canónica", () => {
  const f = firmar({ d: "consulta:a:1", o: [], nf: false });
  assert.equal(firmaValida({ d: "consulta:a:1", o: [], nf: false }, f), true);
  assert.equal(firmaValida({ d: "consulta:a", o: [], nf: true }, f), false); // los ':' del texto no permiten reinterpretar
  assert.equal(firmaValida({ d: "consulta:a:1", o: ["sin_ruc"], nf: false }, f), false);
  assert.equal(firmaValida({ d: "consulta:a:1", o: [], nf: false }, "x"), false);
  assert.equal(firmaValida({ d: "consulta:a:1", o: [], nf: false }, undefined), false);
});
