import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarCanal } from "./canales";

const h = (s: string) => `hash(${s})`;
test("normalizarCanal", () => {
  assert.deepEqual(normalizarCanal("yape", "+51 987 654 321", h), { valor: "987654321", visible: "987 654 321" });
  assert.deepEqual(normalizarCanal("banco", "191-12345678-0-12", h, "BCP"), { valor: "hash(19112345678012)", visible: "•••• 8012 · BCP" });
  assert.deepEqual(normalizarCanal("instagram", "@Mi.Agencia", h), { valor: "mi.agencia", visible: "@mi.agencia" });
  assert.deepEqual(normalizarCanal("web", "https://www.MiAgencia.pe/tours", h), { valor: "miagencia.pe", visible: "miagencia.pe" });
  assert.ok("error" in normalizarCanal("yape", "12345", h));
  assert.ok("error" in normalizarCanal("banco", "123", h));
  assert.ok("error" in normalizarCanal("web", "javascript:alert(1)", h));
});
