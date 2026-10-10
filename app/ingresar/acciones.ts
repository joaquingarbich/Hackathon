"use server";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/server";

// Supabase Auth responde en inglés: nunca mostrar su texto crudo.
function errorEnEspanol(m: string) {
  if (/invalid/i.test(m) && /email/i.test(m)) return "Ese correo no es válido. Usa un correo real.";
  if (/already registered|already exists/i.test(m)) return "Ya existe una cuenta con ese correo. Usa «Ingresar».";
  if (/password/i.test(m)) return "La contraseña no cumple los requisitos (mínimo 8 caracteres).";
  if (/rate limit|too many/i.test(m)) return "Demasiados intentos. Espera unos minutos.";
  return "No pudimos crear la cuenta. Intenta de nuevo.";
}

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
  if (error) redirect(`/ingresar?error=${encodeURIComponent(errorEnEspanol(error.message))}`);
  if (!data.session) redirect(`/ingresar?aviso=${encodeURIComponent("Te enviamos un correo para confirmar tu cuenta.")}`);
  redirect("/operador");
}

export async function salir() {
  await (await supabaseServidor()).auth.signOut();
  redirect("/");
}
