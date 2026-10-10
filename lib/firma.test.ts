import { test } from "node:test";
import assert from "node:assert/strict";
import { firmar, firmaValida } from "./firma";

process.env.SUPABASE_SERVICE_ROLE_KEY ??= "clave-de-prueba"; // la clave se lee al firmar, no al importar

test("firma", () => {
  const f = firmar("prestador:abc:sin_ruc");
  assert.equal(firmaValida("prestador:abc:sin_ruc", f), true);
  assert.equal(firmaValida("prestador:abc:sin_ruc,datos_distintos", f), false); // no se puede añadir obs
  assert.equal(firmaValida("prestador:otro:sin_ruc", f), false); // ni moverla a otro prestador
  assert.equal(firmaValida("prestador:abc:sin_ruc", undefined), false);
  assert.equal(firmaValida("prestador:abc:sin_ruc", "x"), false);
});
