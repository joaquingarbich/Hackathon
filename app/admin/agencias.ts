"use server";
// Moderación de lo que envían las agencias: servicios del catálogo y cambios de perfil.
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Perfil } from "@/lib/agencia-validar";

const revision = (adminId: string) => ({ revisor: adminId, revisado_at: new Date().toISOString() });

export async function moderarServicio(f: FormData) {
  const admin = await exigirAdmin(); // el formulario no es frontera de seguridad
  const id = String(f.get("id") ?? "");
  const decision = String(f.get("decision") ?? "");
  const motivo = String(f.get("motivo") ?? "").trim().slice(0, 500);
  if (decision !== "publicado" && decision !== "rechazado") redirect(`/admin/servicio/${id}`);
  if (decision === "rechazado" && !motivo) redirect(`/admin/servicio/${id}?error=motivo`);
  const { data } = await supabaseAdmin()
    .from("services")
    .update({ estado: decision, motivo: motivo || null, ...revision(admin.id) })
    .eq("id", id)
    .eq("estado", "pendiente")
    .select("id");
  if (!data?.length) redirect(`/admin/servicio/${id}`); // ya resuelto
  console.info(`[auditoria] ${admin.email} servicio ${decision} ${id}`);
  redirect("/admin");
}

export async function resolverCambio(f: FormData) {
  const admin = await exigirAdmin();
  const id = String(f.get("id") ?? "");
  const decision = String(f.get("decision") ?? "");
  const motivo = String(f.get("motivo") ?? "").trim().slice(0, 500);
  if (decision !== "aprobado" && decision !== "rechazado") redirect(`/admin/cambio/${id}`);
  if (decision === "rechazado" && !motivo) redirect(`/admin/cambio/${id}?error=motivo`);
  const db = supabaseAdmin();
  const { data } = await db
    .from("proveedor_cambios")
    .update({ estado: decision, motivo: motivo || null, ...revision(admin.id) })
    .eq("id", id)
    .eq("estado", "pendiente")
    .select("provider_id, datos");
  if (!data?.length) redirect(`/admin/cambio/${id}`); // solo aplica quien lo pasó de pendiente a aprobado
  if (decision === "aprobado") {
    const d = data[0].datos as Perfil;
    const { error } = await db.from("providers").update({
      descripcion: d.descripcion, telefono: d.telefono, correo: d.correo, web: d.web, direccion: d.direccion, distrito: d.distrito, redes: d.redes,
    }).eq("id", data[0].provider_id);
    if (error) throw error;
  }
  console.info(`[auditoria] ${admin.email} cambio de perfil ${decision} ${id}`);
  redirect("/admin");
}
