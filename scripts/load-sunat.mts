// Carga el padrón reducido del RUC (SUNAT) en ruc_status.
// Uso: npm run load:sunat -- data/raw/padron_reducido_ruc.txt [fecha_corte AAAA-MM-DD]
// Formato [VERIFICAR al descargar]: texto latin1, separado por "|", cabecera en la 1.ª línea:
// RUC|NOMBRE O RAZÓN SOCIAL|ESTADO DEL CONTRIBUYENTE|CONDICIÓN DE DOMICILIO|UBIGEO|...
// Guarda: todo ubigeo de Piura (20xxxx) + cualquier RUC presente en providers.
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { supabaseAdmin } from "../lib/supabase/admin.ts";
import { REGLAS } from "../config/reglas.ts";

const [archivo, fechaCorte = new Date().toISOString().slice(0, 10)] = process.argv.slice(2);
if (!archivo) throw new Error("Falta la ruta al archivo del padrón");

const db = supabaseAdmin();
const { data: provs, error } = await db.from("providers").select("ruc").not("ruc", "is", null);
if (error) throw error;
const rucsProviders = new Set(provs.map((p) => p.ruc));

await db.from("sources").upsert({
  id: "sunat_padron",
  nombre: "Padrón reducido del RUC (SUNAT)",
  url: "https://orientacion.sunat.gob.pe/padron-reducido-del-ruc-para-descarga",
  fecha_corte: fechaCorte,
});

let lote: object[] = [];
let total = 0;
const enviar = async () => {
  if (!lote.length) return;
  const { error } = await db.from("ruc_status").upsert(lote);
  if (error) throw error;
  total += lote.length;
  lote = [];
  process.stdout.write(`\r${total} filas`);
};

const lineas = createInterface({ input: createReadStream(archivo, { encoding: "latin1" }) });
let cabecera = true;
for await (const linea of lineas) {
  if (cabecera) { cabecera = false; continue; }
  const [ruc, razon_social, estado, condicion, ubigeo] = linea.split("|").map((c) => c.trim());
  if (!ruc || (!ubigeo?.startsWith(REGLAS.ubigeoDepartamento) && !rucsProviders.has(ruc))) continue;
  lote.push({ ruc, razon_social, estado, condicion, ubigeo, source_id: "sunat_padron" });
  if (lote.length === 1000) await enviar();
}
await enviar();
await db.from("sources").update({ n_registros: total }).eq("id", "sunat_padron");
console.log(`\nListo: ${total} RUC cargados con corte ${fechaCorte}`);
