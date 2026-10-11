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

export type Resultado = { error?: string; destino?: string };

// Devuelven el destino en vez de redirect(): el formulario navega con carga completa, porque el router del
// navegador recuerda que /operador o /admin redirigían al login y volvía a mostrar el formulario.
export async function ingresar(_: Resultado, f: FormData): Promise<Resultado> {
  const { error } = await (await supabaseServidor()).auth.signInWithPassword(credenciales(f));
  return error ? { error: "Correo o contraseña incorrectos." } : { destino: "/operador" };
}

/** Login aparte del panel de revisión: solo entra una cuenta con rol admin. */
export async function ingresarAdmin(_: Resultado, f: FormData): Promise<Resultado> {
  const supabase = await supabaseServidor();
  const { data, error } = await supabase.auth.signInWithPassword(credenciales(f));
  if (!error && data.user.app_metadata?.rol === "admin") return { destino: "/admin" };
  if (!error) await supabase.auth.signOut();
  return { error: "Correo o contraseña incorrectos, o la cuenta no es de revisor." };
}

// Sin correo de confirmación: la cuenta se crea ya confirmada con service role. Una cuenta no publica nada
// por sí sola (solo un documento aprobado por el admin), así que no se exige verificar el correo.
export async function registrarse(_: Resultado, f: FormData): Promise<Resultado> {
  const c = credenciales(f);
  if (c.password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (c.password !== String(f.get("confirmar") ?? "")) return { error: "Las contraseñas no coinciden." };
  if (!(await hayCupo("cuenta"))) return { error: "Demasiados intentos. Espera unos minutos." };
  const { error } = await supabaseAdmin().auth.admin.createUser({ ...c, email_confirm: true });
  if (error) return { error: errorEnEspanol(error.message) };
  const { error: e2 } = await (await supabaseServidor()).auth.signInWithPassword(c);
  return { destino: e2 ? "/ingresar" : "/operador" };
}

export async function salir() {
  await (await supabaseServidor()).auth.signOut();
  redirect("/");
}

export async function salirAdmin() {
  await (await supabaseServidor()).auth.signOut();
  redirect("/admin/ingresar");
}
