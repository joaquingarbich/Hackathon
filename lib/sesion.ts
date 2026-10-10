// Quién es el usuario de esta request. La autorización real la hace RLS; esto decide qué mostrar y protege las acciones.
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/server";

export async function usuarioActual() {
  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getClaims();
  const c = data?.claims;
  if (!c?.sub) return null;
  return {
    supabase,
    id: c.sub,
    email: (c.email as string | undefined) ?? "",
    esAdmin: (c.app_metadata as { rol?: string } | undefined)?.rol === "admin", // app_metadata: no editable por el usuario
  };
}

export async function exigirUsuario() {
  const u = await usuarioActual();
  if (!u) redirect("/ingresar");
  return u;
}

export async function exigirAdmin() {
  const u = await exigirUsuario();
  if (!u.esAdmin) redirect("/operador");
  return u;
}
