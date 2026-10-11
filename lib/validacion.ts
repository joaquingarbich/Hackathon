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
  if (s.estado !== "aprobado") throw new Error(`Solicitud ${id} no está aprobada`);
  const vence = sumarDias(hoy(), REGLAS.diasValidacionAnticipada);
  const d = s.datos_declarados as Declarados;
  const ext = (s.campos_extraidos ?? null) as { campos?: Record<string, string | null> } | null;
  const sunat = (await db.from("ruc_status").select("razon_social, source_id").eq("ruc", s.ruc).maybeSingle()).data;
  const esMuestra = sunat?.source_id === "muestra";

  const { data: existentes } = await db.from("providers").select("id, source_id").eq("ruc", s.ruc);
  const oficial = existentes?.find((p) => p.source_id !== "checktur_validacion");
  if (oficial) return vincularCuenta(oficial.id, s.user_id); // ya figura oficialmente: el documento solo confirma y da acceso al perfil

  let proveedorId = existentes?.[0]?.id;
  if (proveedorId) {
    await db.from("providers").update({ validacion_vence: vence }).eq("id", proveedorId);
  } else {
    const { data: nuevo, error: e2 } = await db
      .from("providers")
      .insert({
        tipo: s.tipo_documento === "tuc" ? "transporte_terrestre" : "agencia",
        ruc: s.ruc,
        // Solo datos con respaldo (SUNAT o leídos del documento). Lo declarado por el operador (nombre, teléfono)
        // no se publica: permitiría suplantar a una agencia conocida. El admin lo ve solo como referencia.
        razon_social: sunat?.razon_social ?? ext?.campos?.razon_social ?? null,
        nombre_comercial: ext?.campos?.nombre_comercial ?? null,
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
    const placa = normalizarPlaca(d.placa ?? ext?.campos?.placa ?? ""); // la placa declarada ya se cruzó con el documento (capa 3)
    // La placa es única solo entre aprobadas: si ya hay una aprobada (de cualquiera), no se duplica.
    const { data: yaAprobada } = placa ? await db.from("vehicles").select("id").eq("placa", placa).eq("aprobacion", "aprobado").maybeSingle() : { data: null };
    if (placa && !yaAprobada)
      await db.from("vehicles").insert({
        provider_id: proveedorId,
        placa,
        modalidad: "turistico",
        tuc_numero: ext?.campos?.numero_tuc ?? null,
        habilitacion_vencimiento: ext?.campos?.habilitacion_vencimiento ?? null,
        es_muestra: esMuestra,
        source_id: "checktur_validacion",
      });
  }
  await db.from("sources").update({ fecha_corte: hoy() }).eq("id", "checktur_validacion");
  await vincularCuenta(proveedorId!, s.user_id);
}

/** Documento aprobado = prueba de que la cuenta representa a ese RUC: administra su perfil y servicios.
 *  Un dueño por proveedor (el primero aprobado); otro reclamo lo resuelve el admin a mano. */
async function vincularCuenta(providerId: string, userId: string) {
  const { error } = await supabaseAdmin()
    .from("proveedor_cuentas")
    .upsert({ provider_id: providerId, user_id: userId }, { onConflict: "provider_id", ignoreDuplicates: true });
  if (error) throw error;
}
