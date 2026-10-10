"use server";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/sesion";
import { publicarValidacion } from "@/lib/validacion";
import { REGLAS } from "@/config/reglas";

const hoy = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });

export async function resolver(f: FormData) {
  const admin = await exigirAdmin(); // el formulario no es frontera de seguridad: se verifica aquí y en RLS
  const id = String(f.get("id") ?? "");
  const decision = f.get("decision");
  const motivo = String(f.get("motivo") ?? "").trim().slice(0, 500);
  if (decision !== "aprobado" && decision !== "rechazado") redirect(`/admin/${id}`);
  if (decision === "rechazado" && !motivo) redirect(`/admin/${id}?error=motivo`);

  const vence = new Date(Date.now() + REGLAS.diasValidacionAnticipada * 86_400_000).toISOString().slice(0, 10);
  const { error } = await admin.supabase
    .from("submissions")
    .update({
      estado: decision,
      motivo: motivo || null,
      revisor: admin.id, // auditoría: quién, cuándo y con qué evidencia (resultado_capas queda guardado)
      revisado_at: new Date().toISOString(),
      vence_el: decision === "aprobado" ? vence : null,
    })
    .eq("id", id)
    .eq("estado", "pendiente");
  if (error) throw error;
  if (decision === "aprobado") await publicarValidacion(id);
  console.info(`[auditoria] ${hoy()} ${admin.email} ${decision} ${id}`);
  redirect("/admin");
}
