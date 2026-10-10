// Flujo del operador en el servidor, con service role: el operador nunca escribe capas, confianza ni hash.
import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { correrCapas } from "@/lib/checks";
import { extraerDocumento, type TipoDocumento } from "@/lib/vision";
import { normalizarPlaca } from "@/lib/normalizacion";
import { REGLAS } from "@/config/reglas";
import type { Json } from "@/lib/database.types";

const hoy = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
const sumarDias = (iso: string, dias: number) => new Date(Date.parse(iso) + dias * 86_400_000).toISOString().slice(0, 10);

export type Declarados = { nombre_comercial?: string; placa?: string; telefono?: string };

/** Corre las capas sobre una solicitud recién creada y guarda el resultado para el admin. */
export async function procesarSolicitud(id: string) {
  const db = supabaseAdmin();
  const { data: s, error } = await db.from("submissions").select("*").eq("id", id).single();
  if (error) throw error;

  const { data: archivo, error: e2 } = await db.storage.from("documentos").download(s.archivo_path);
  if (e2) throw e2;
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  const tipo = s.tipo_documento as TipoDocumento;

  const [extraccion, sunat, oficial, mismoArchivo, mismoRuc] = await Promise.all([
    extraerDocumento(bytes, archivo.type, tipo),
    db.from("ruc_status").select("razon_social, estado, condicion, ubigeo").eq("ruc", s.ruc).maybeSingle(),
    db.from("providers").select("nombre_comercial, razon_social").eq("ruc", s.ruc).neq("source_id", "checktur_validacion").limit(1).maybeSingle(),
    db.from("submissions").select("id", { count: "exact", head: true }).eq("hash", hash).neq("user_id", s.user_id),
    db.from("submissions").select("id", { count: "exact", head: true }).eq("ruc", s.ruc).neq("user_id", s.user_id),
  ]);

  const { capas, confianza } = correrCapas({
    tipo,
    ruc: s.ruc,
    declarados: s.datos_declarados as Declarados,
    mime: archivo.type,
    bytes,
    extraccion,
    hoy: hoy(),
    sunat: sunat.data,
    enPadronOficial: oficial.data ? { nombre: oficial.data.nombre_comercial ?? oficial.data.razon_social ?? s.ruc } : null,
    duplicados: { mismoArchivoOtraCuenta: (mismoArchivo.count ?? 0) > 0, mismoRucOtraCuenta: (mismoRuc.count ?? 0) > 0 },
  });

  const { error: e3 } = await db
    .from("submissions")
    .update({ hash, campos_extraidos: extraccion as unknown as Json, resultado_capas: capas as unknown as Json, confianza })
    .eq("id", id);
  if (e3) throw e3;
}

/** Al aprobar: el prestador (y la unidad, si es TUC) pasa a ser consultable como "En proceso de actualización". */
export async function publicarValidacion(id: string) {
  const db = supabaseAdmin();
  const { data: s, error } = await db.from("submissions").select("*").eq("id", id).single();
  if (error) throw error;
  const vence = sumarDias(hoy(), REGLAS.diasValidacionAnticipada);
  const d = s.datos_declarados as Declarados;
  const ext = (s.campos_extraidos ?? null) as { campos?: Record<string, string | null> } | null;
  const sunat = (await db.from("ruc_status").select("razon_social, source_id").eq("ruc", s.ruc).maybeSingle()).data;
  const esMuestra = sunat?.source_id === "muestra";

  const { data: existentes } = await db.from("providers").select("id, source_id").eq("ruc", s.ruc);
  if (existentes?.some((p) => p.source_id !== "checktur_validacion")) return; // ya figura oficialmente: el documento solo confirma

  let proveedorId = existentes?.[0]?.id;
  if (proveedorId) {
    await db.from("providers").update({ validacion_vence: vence }).eq("id", proveedorId);
  } else {
    const { data: nuevo, error: e2 } = await db
      .from("providers")
      .insert({
        tipo: s.tipo_documento === "tuc" ? "transporte_terrestre" : "agencia",
        ruc: s.ruc,
        razon_social: ext?.campos?.razon_social ?? sunat?.razon_social ?? null,
        nombre_comercial: d.nombre_comercial ?? ext?.campos?.nombre_comercial ?? null,
        telefono: d.telefono ?? null,
        clases: ext?.campos?.clase ? [ext.campos.clase.toLowerCase().replace("operador de turismo", "operador")] : [],
        source_id: "checktur_validacion",
        validacion_vence: vence,
        es_muestra: esMuestra,
      })
      .select("id")
      .single();
    if (e2) throw e2;
    proveedorId = nuevo.id;
  }

  if (s.tipo_documento === "constancia_agencia") {
    await db.from("authorizations").insert({
      provider_id: proveedorId,
      tipo: "constancia_dircetur",
      entidad_emisora: ext?.campos?.entidad_emisora ?? "DIRCETUR (constancia presentada)",
      numero: ext?.campos?.numero_constancia ?? null,
      fecha_emision: ext?.campos?.fecha_emision ?? null,
      source_id: "checktur_validacion",
    });
  } else {
    const placa = normalizarPlaca(d.placa ?? ext?.campos?.placa ?? "");
    if (placa)
      await db.from("vehicles").upsert(
        {
          provider_id: proveedorId,
          placa,
          modalidad: "turistico",
          tuc_numero: ext?.campos?.numero_tuc ?? null,
          habilitacion_vencimiento: ext?.campos?.habilitacion_vencimiento ?? null,
          es_muestra: esMuestra,
          source_id: "checktur_validacion",
        },
        { onConflict: "placa", ignoreDuplicates: true },
      );
  }
  await db.from("sources").update({ fecha_corte: hoy() }).eq("id", "checktur_validacion");
}
