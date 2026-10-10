// Prueba de punta a punta del flujo operador → admin → turista contra el proyecto Supabase real.
// Requiere la app corriendo en :3456 (npx next start -p 3456) y SUPABASE_SERVICE_ROLE_KEY en .env.local.
// Crea 2 usuarios de prueba (*@checktur.test) y BORRA todo lo que crea al terminar, pase o falle.
// Uso: npm run e2e
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../lib/supabase/admin.ts";
import { procesarSolicitud, publicarValidacion } from "../lib/validacion.ts";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!, PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const RUC = "20999999931"; // Tours Ejemplo Máncora (muestra): caso gris → azul
const admin = supabaseAdmin();
const pass = "Prueba-" + crypto.randomUUID();
const log = (ok: boolean, m: string) => { console.log(`${ok ? "OK  " : "FAIL"} ${m}`); if (!ok) process.exitCode = 1; };
const creados: { usuarios: string[]; archivos: string[] } = { usuarios: [], archivos: [] };

async function usuario(email: string, rol?: string) {
  const { data, error } = await admin.auth.admin.createUser({ email, password: pass, email_confirm: true, app_metadata: rol ? { rol } : {} });
  if (error) throw error;
  creados.usuarios.push(data.user.id);
  const c = createClient(URL, PUB, { auth: { persistSession: false } });
  const s = await c.auth.signInWithPassword({ email, password: pass });
  if (s.error) throw s.error;
  return { id: data.user.id, c };
}

try {
  const pagina = async () => (await fetch(`http://localhost:3456/consulta?q=${RUC}`)).text();
  log((await pagina()).includes("No encontrado"), "antes: Tours Ejemplo Máncora sale «No encontrado»");

  const op = await usuario("operador.prueba@checktur.test");
  const ad = await usuario("admin.prueba@checktur.test", "admin");

  // Subida directa a Storage con la sesión del operador (igual que el navegador)
  const pdf = new Uint8Array(readFileSync("data/muestras/constancia-mancora.pdf")); // constancia ficticia (Anexo III)
  const ruta = `${op.id}/${crypto.randomUUID()}.pdf`;
  const up = await op.c.storage.from("documentos").upload(ruta, pdf, { contentType: "application/pdf" });
  creados.archivos.push(ruta);
  log(!up.error, `operador sube a su carpeta ${up.error?.message ?? ""}`);
  const ajena = await op.c.storage.from("documentos").upload(`${ad.id}/x.pdf`, pdf, { contentType: "application/pdf" });
  log(!!ajena.error, "operador NO puede subir a carpeta ajena");
  const html = await op.c.storage.from("documentos").upload(`${op.id}/x.html`, new TextEncoder().encode("<script>"), { contentType: "text/html" });
  log(!!html.error, "bucket rechaza tipos no permitidos (text/html)");

  // Inserción directa por la API: debe fallar (revoke)
  const directa = await op.c.from("submissions").insert({ ruc: RUC, tipo_documento: "constancia_agencia", archivo_path: ruta });
  log(!!directa.error, "operador NO puede insertar solicitudes directo por la API");

  // Lo que hace la Server Action tras validar
  const { data: sol, error: eIns } = await admin.from("submissions")
    .insert({ user_id: op.id, ruc: RUC, tipo_documento: "constancia_agencia", archivo_path: ruta, datos_declarados: { nombre_comercial: "Vaca Loca Tours", telefono: "999999999" } })
    .select("id").single();
  if (eIns) throw eIns;
  await procesarSolicitud(sol.id);
  const { data: p } = await op.c.from("submissions").select("hash, confianza, resultado_capas, estado").eq("id", sol.id).single();
  const capas = (p?.resultado_capas ?? []) as { id: string; resultado: string; detalle: string }[];
  log(!!p?.hash && capas.length === 8, `capas procesadas: confianza ${p?.confianza}`);
  for (const c of capas) console.log(`       ${c.resultado.padEnd(11)} ${c.id}: ${c.detalle}`);
  const esperado = process.env.GEMINI_API_KEY
    ? { extraccion: "ok", estructura: "ok", coherencia: "ok", sunat: "ok", padron: "ok" }
    : { extraccion: "no_evaluado", sunat: "ok", padron: "ok" };
  for (const [id, r] of Object.entries(esperado)) log(capas.find((c) => c.id === id)?.resultado === r, `capa ${id} = ${r}`);

  // El operador no puede aprobarse
  const auto = await op.c.from("submissions").update({ estado: "aprobado" }).eq("id", sol.id).select("id");
  log(!auto.data?.length, "operador NO puede aprobar su propia solicitud");

  // El admin aprueba con su sesión (RLS) — misma lógica que app/admin/acciones.ts
  const vence = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);
  const ap = await ad.c.from("submissions").update({ estado: "aprobado", revisor: ad.id, revisado_at: new Date().toISOString(), vence_el: vence })
    .eq("id", sol.id).eq("estado", "pendiente").select("id");
  log(ap.data?.length === 1, "admin aprueba (RLS)");
  await publicarValidacion(sol.id);
  const reap = await ad.c.from("submissions").update({ estado: "rechazado" }).eq("id", sol.id).eq("estado", "pendiente").select("id");
  log(!reap.data?.length, "una solicitud ya resuelta no se vuelve a resolver (TOCTOU)");

  const { data: prov } = await admin.from("providers").select("id, nombre_comercial, razon_social, telefono, validacion_vence").eq("ruc", RUC).single();
  log(prov?.nombre_comercial !== "Vaca Loca Tours" && !prov?.telefono, `publicado sin datos declarados: «${prov?.nombre_comercial ?? prov?.razon_social}», tel ${prov?.telefono ?? "—"}`);

  const despues = await (await fetch(`http://localhost:3456/prestador/${prov!.id}`)).text();
  log(despues.includes("En proceso de actualización"), "después: el turista lo ve «En proceso de actualización»");
} finally {
  // Limpieza: todo lo creado por esta prueba
  await admin.from("authorizations").delete().eq("source_id", "checktur_validacion").in("provider_id",
    ((await admin.from("providers").select("id").eq("ruc", RUC).eq("source_id", "checktur_validacion")).data ?? []).map((x) => x.id));
  await admin.from("providers").delete().eq("ruc", RUC).eq("source_id", "checktur_validacion");
  await admin.from("submissions").delete().in("user_id", creados.usuarios);
  if (creados.archivos.length) await admin.storage.from("documentos").remove(creados.archivos);
  for (const u of creados.usuarios) await admin.auth.admin.deleteUser(u);
  const quedan = await admin.from("providers").select("id", { count: "exact", head: true }).eq("ruc", RUC);
  console.log(`limpieza: ${creados.usuarios.length} usuarios borrados, providers con RUC de prueba restantes: ${quedan.count}`);
}
