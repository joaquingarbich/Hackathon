"use server";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hayCupo } from "@/lib/limite";

// Supabase Auth responde en inglés: nunca mostrar su texto crudo.
function errorEnEspanol(m: string) {
  if (/invalid/i.test(m) && /email/i.test(m)) return "Ese correo no es válido. Usa un correo real.";
  if (/already (been )?registered|already exists/i.test(m)) return "No se pudo crear la cuenta con ese correo. Si ya tienes una, usa «Ingresar».";
  if (/password/i.test(m)) return "La contraseña no cumple los requisitos (mínimo 8 caracteres).";
  if (/rate limit|too many/i.test(m)) return "Demasiados intentos. Espera unos minutos.";
  return "La cuenta no se pudo crear. Intenta de nuevo.";
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

const aRegistro = (m: string) => redirect(`/registro?error=${encodeURIComponent(m)}`);

// Sin correo de confirmación: la cuenta se crea ya confirmada con service role. Una cuenta no publica nada
// por sí sola (solo un documento aprobado por el admin), así que no se exige verificar el correo.
export async function registrarse(f: FormData) {
  const c = credenciales(f);
  if (c.password.length < 8) return aRegistro("La contraseña debe tener al menos 8 caracteres.");
  if (c.password !== String(f.get("confirmar") ?? "")) return aRegistro("Las contraseñas no coinciden.");
  if (!(await hayCupo("cuenta"))) return aRegistro("Demasiados intentos. Espera unos minutos.");
  const { error } = await supabaseAdmin().auth.admin.createUser({ ...c, email_confirm: true });
  if (error) return aRegistro(errorEnEspanol(error.message));
  const { error: e2 } = await (await supabaseServidor()).auth.signInWithPassword(c);
  if (e2) redirect(`/ingresar?aviso=${encodeURIComponent("Cuenta creada. Ingresa con tu correo y contraseña.")}`);
  redirect("/operador");
}

export async function salir() {
  await (await supabaseServidor()).auth.signOut();
  redirect("/");
}
