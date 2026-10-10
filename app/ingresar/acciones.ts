"use server";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/server";

const credenciales = (f: FormData) => ({
  email: String(f.get("email") ?? "").trim(),
  password: String(f.get("password") ?? ""),
});

export async function ingresar(f: FormData) {
  const { error } = await (await supabaseServidor()).auth.signInWithPassword(credenciales(f));
  if (error) redirect(`/ingresar?error=${encodeURIComponent("Correo o contraseña incorrectos.")}`);
  redirect("/operador");
}

export async function registrarse(f: FormData) {
  const c = credenciales(f);
  if (c.password.length < 8) redirect(`/ingresar?error=${encodeURIComponent("La contraseña debe tener al menos 8 caracteres.")}`);
  const { data, error } = await (await supabaseServidor()).auth.signUp(c);
  if (error) redirect(`/ingresar?error=${encodeURIComponent(error.message)}`);
  if (!data.session) redirect(`/ingresar?aviso=${encodeURIComponent("Te enviamos un correo para confirmar tu cuenta.")}`);
  redirect("/operador");
}

export async function salir() {
  await (await supabaseServidor()).auth.signOut();
  redirect("/");
}
