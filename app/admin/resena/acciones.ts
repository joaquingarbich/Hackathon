"use server";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DESTINO: Record<string, string> = { publicar: "visible", rechazar: "rechazada", ocultar: "oculta", mantener: "visible" };
const DESDE: Record<string, string[]> = { publicar: ["pendiente"], rechazar: ["pendiente"], ocultar: ["reportada", "visible"], mantener: ["reportada"] };

export async function moderarResena(f: FormData) {
  const admin = await exigirAdmin(); // el formulario no es frontera de seguridad
  const id = String(f.get("id") ?? "");
  const accion = String(f.get("accion") ?? "");
  const motivo = String(f.get("motivo") ?? "").trim().slice(0, 500);
  if (!DESTINO[accion]) redirect(`/admin/resena/${id}`);
  if ((accion === "rechazar" || accion === "ocultar") && !motivo) redirect(`/admin/resena/${id}?error=motivo`);

  const { data } = await supabaseAdmin()
    .from("reviews")
    .update({ estado: DESTINO[accion], motivo: motivo || null, revisor: admin.id, revisado_at: new Date().toISOString() })
    .eq("id", id)
    .in("estado", DESDE[accion]) // solo transiciones válidas desde el estado actual
    .select("id");
  if (!data?.length) redirect(`/admin/resena/${id}`);
  console.info(`[auditoria] ${admin.email} reseña ${accion} ${id}`);
  redirect("/admin");
}
