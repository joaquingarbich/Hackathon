// Cara de la agencia: qué proveedores administra una cuenta. Lecturas con service role SIEMPRE tras verificar sesión.
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { exigirUsuario } from "@/lib/sesion";

export async function misProveedores(userId: string) {
  const db = supabaseAdmin();
  const { data: cuentas } = await db.from("proveedor_cuentas").select("provider_id").eq("user_id", userId);
  const ids = (cuentas ?? []).map((c) => c.provider_id);
  if (!ids.length) return [];
  const { data } = await db.from("providers").select("id, tipo, ruc, nombre_comercial, razon_social").in("id", ids);
  return data ?? [];
}

/** La cuenta en sesión administra este proveedor; si no, vuelve a /operador. */
export async function exigirDueno(providerId: string) {
  const u = await exigirUsuario();
  if (!/^[0-9a-f-]{36}$/i.test(providerId)) redirect("/operador");
  const db = supabaseAdmin();
  const { data: cuenta } = await db.from("proveedor_cuentas").select("provider_id").eq("provider_id", providerId).eq("user_id", u.id).maybeSingle();
  if (!cuenta) redirect("/operador");
  const { data: proveedor } = await db.from("providers").select("*").eq("id", providerId).single();
  if (!proveedor) redirect("/operador");
  return { u, proveedor, db };
}
