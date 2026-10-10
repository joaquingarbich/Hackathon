// Prueba e2e de opiniones en navegador real (Chrome instalado + playwright-core, sin descargar navegadores).
// Requiere: app en :3456 (npx next start -p 3456), .env.local con SUPABASE_SERVICE_ROLE_KEY y GEMINI_API_KEY.
// Instalar una vez fuera del proyecto: cd /tmp/pw && npm i playwright-core@1.50.1 @supabase/supabase-js@2.117.3
// Uso: NODE_PATH=/tmp/pw/node_modules node scripts/e2e-resenas.mjs   — borra todo lo que crea al terminar.
import { chromium } from "playwright-core";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const M = "data/muestras/";
const COLAN = "00000000-0000-4000-a000-000000000005";
const B = "http://localhost:3456";
const ok = (c, m) => { console.log(`${c ? "OK  " : "FAIL"} ${m}`); if (!c) process.exitCode = 1; };
const creado = { usuario: null };
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });

async function enviar(page, archivo) {
  await page.goto(`${B}/prestador/${COLAN}/resena`);
  await page.getByRole("button", { name: "4 de 5 estrellas" }).click();
  await page.fill("#comentario", "Muy buena experiencia, guía puntual. (prueba automática)");
  await page.selectOption("#servicio", { index: 3 });
  await page.fill("#fecha_servicio", "2026-10-05");
  await page.setInputFiles("#comprobante", M + archivo);
  await page.fill("#nombre", "Persona de Prueba");
  await page.fill("#correo", "prueba@checktur.test");
  await page.fill("#celular", "987654321");
  await page.fill("#alias", "Prueba E2E");
  await page.check('input[name="consentimiento"]');
  await page.getByRole("button", { name: "Enviar para revisión" }).click();
  await page.waitForSelector('main p[role="status"], main p[role="alert"]', { timeout: 60000 });
  return (await page.textContent('main p[role="status"], main p[role="alert"]')).trim();
}

try {
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })).newPage();
  const ajeno = await enviar(page, "boleta-otro.png");
  ok(ajeno.includes("20999999922") && ajeno.includes("no es el de este prestador"), `RUC ajeno rechazado: «${ajeno}»`);
  const bueno = await enviar(page, "boleta-colan.png");
  ok(bueno.includes("Recibimos tu opinión"), `comprobante correcto aceptado: «${bueno.slice(0, 60)}…»`);
  const repetido = await enviar(page, "boleta-colan.png");
  ok(repetido.includes("ya se usó"), `mismo comprobante rechazado: «${repetido}»`);

  const { data: rs } = await admin.from("reviews").select("id, estado, comprobante_serie, verificado").eq("provider_id", COLAN).neq("estado", "oculta");
  ok(rs?.length === 1 && rs[0].estado === "pendiente" && rs[0].comprobante_serie === "B001-123", `en BD: 1 pendiente, serie ${rs?.[0]?.comprobante_serie}`);
  await page.goto(`${B}/prestador/${COLAN}`);
  ok(!(await page.textContent("main")).includes("Prueba E2E"), "pendiente NO se ve en público");

  // Admin modera desde la UI
  const pass = "Prueba-" + crypto.randomUUID();
  const u = await admin.auth.admin.createUser({ email: "admin.prueba@checktur.test", password: pass, email_confirm: true, app_metadata: { rol: "admin" } });
  creado.usuario = u.data.user.id;
  const ap = await (await browser.newContext()).newPage();
  await ap.goto(`${B}/ingresar`);
  await ap.fill("#email", "admin.prueba@checktur.test"); await ap.fill("#password", pass);
  await ap.getByRole("button", { name: "Ingresar" }).click(); await ap.waitForURL(/operador/);
  await ap.goto(`${B}/admin`);
  await ap.getByText("Opiniones por revisar").waitFor();
  await ap.click(`a[href="/admin/resena/${rs[0].id}"]`);
  await ap.getByText("Contacto (privado)").waitFor();
  const det = await ap.textContent("main");
  ok(det.includes("987654321") && det.includes("RUC emisor 20999999949 = RUC del prestador"), "admin ve contacto privado y chequeos");
  await ap.getByRole("button", { name: "Publicar" }).click(); await ap.waitForURL(`${B}/admin`);

  await page.goto(`${B}/prestador/${COLAN}`);
  const pub = await page.textContent("main");
  ok(pub.includes("Prueba E2E") && pub.includes("Compra verificada con comprobante") && pub.includes("Opiniones de usuarios"), "publicada con sello, en bloque aparte");
  ok(!pub.includes("987654321") && !pub.includes("prueba@checktur.test") && !pub.includes("Persona de Prueba"), "datos de contacto NO públicos");
  ok(pub.includes("Verificado con observaciones"), "el dictamen oficial no cambia por la opinión");
  await page.screenshot({ path: ".capturas/movil-opiniones.png", fullPage: true });

  // API pública: contactos y comprobante inaccesibles
  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  ok(!!(await anon.from("review_contactos").select("*")).error, "anon no lee review_contactos");
  ok(!!(await anon.from("reviews").select("comprobante_path, device_hash")).error, "anon no lee comprobante ni hash");
  ok(!!(await anon.from("reviews").insert({ provider_id: COLAN, estrellas: 5, device_hash: "x" })).error, "anon no inserta reseñas por API");

  // Reportar: sigue visible, aparece en la cola
  await page.getByRole("button", { name: "Reportar" }).first().click();
  await page.waitForTimeout(1500);
  const { data: rep } = await admin.from("reviews").select("estado").eq("id", rs[0].id).single();
  await page.goto(`${B}/prestador/${COLAN}`);
  ok(rep?.estado === "reportada" && (await page.textContent("main")).includes("Prueba E2E"), "reportada: sigue visible hasta que decida el admin");
} finally {
  const { data: rs } = await admin.from("reviews").select("id, comprobante_path").eq("provider_id", COLAN).like("comentario", "%(prueba automática)%");
  for (const r of rs ?? []) { if (r.comprobante_path) await admin.storage.from("documentos").remove([r.comprobante_path]); await admin.from("reviews").delete().eq("id", r.id); }
  if (creado.usuario) await admin.auth.admin.deleteUser(creado.usuario);
  console.log(`limpieza: ${rs?.length ?? 0} reseñas de prueba borradas${creado.usuario ? ", 1 usuario" : ""}`);
  await browser.close();
}
