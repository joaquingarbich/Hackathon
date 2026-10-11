// Validación pura de lo que envía una agencia (perfil y servicios). El formulario no es frontera de seguridad.
import { CATEGORIAS, DESTINOS, REDES } from "@/config/textos";

export type Campos = Record<string, string | string[] | undefined>;
type Ok<T> = { ok: true; datos: T } | { ok: false; error: string };

const t = (v: Campos[string], max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type Perfil = {
  descripcion: string | null; telefono: string | null; correo: string | null; web: string | null;
  direccion: string | null; distrito: string | null; redes: Record<string, string>;
};

export function validarPerfil(c: Campos): Ok<Perfil> {
  const telefono = t(c.telefono, 20).replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, "");
  if (telefono && !/^9\d{8}$/.test(telefono)) return { ok: false, error: "El teléfono debe ser un celular peruano de 9 dígitos (se usa para WhatsApp)." };
  const correo = t(c.correo, 120);
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return { ok: false, error: "Escribe un correo válido." };
  const web = t(c.web, 200);
  if (web && !/^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]{2,}$/i.test(web)) return { ok: false, error: "La web debe empezar con https://" };
  const redes: Record<string, string> = {};
  for (const r of REDES) {
    const u = t(c[r], 40).replace(/^@/, "");
    if (!u) continue;
    if (!/^[A-Za-z0-9._]{2,30}$/.test(u)) return { ok: false, error: `Cuenta de ${r} no válida: solo letras, números, punto y guion bajo.` };
    redes[r] = `@${u}`;
  }
  return {
    ok: true,
    datos: {
      descripcion: t(c.descripcion, 1000) || null, telefono: telefono || null, correo: correo || null, web: web || null,
      direccion: t(c.direccion, 150) || null, distrito: t(c.distrito, 60) || null, redes,
    },
  };
}

// El turista solo ve el nombre y el destino del servicio: no se piden más datos.
export type ServicioNuevo = { categoria: string; nombre: string; destino: string };

/** La categoría sale del tipo de proveedor (una agencia publica experiencias, un hospedaje hospedajes…). */
export function validarServicio(c: Campos, tipoProveedor: string): Ok<ServicioNuevo> {
  const cat = CATEGORIAS.find((x) => (x.tipos as readonly string[]).includes(tipoProveedor));
  if (!cat) return { ok: false, error: "Tu tipo de registro aún no admite servicios." };
  const nombre = t(c.nombre, 120);
  if (nombre.length < 3) return { ok: false, error: "Escribe el nombre del servicio." };
  if (!DESTINOS.some((d) => d.id === c.destino)) return { ok: false, error: "Elige el destino." };
  return { ok: true, datos: { categoria: cat.id, nombre, destino: String(c.destino) } };
}
