// Validación pura de lo que envía una agencia (perfil y servicios). El formulario no es frontera de seguridad.
import { CATEGORIAS, DESTINOS, IDIOMAS, REDES, UNIDADES_PRECIO } from "@/config/textos";

export type Campos = Record<string, string | string[] | undefined>;
type Ok<T> = { ok: true; datos: T } | { ok: false; error: string };

const t = (v: Campos[string], max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const lineas = (v: Campos[string], maxItems: number, maxLargo: number) =>
  t(v, 4000).split("\n").map((l) => l.trim().slice(0, maxLargo)).filter(Boolean).slice(0, maxItems);
const lista = (v: Campos[string]) => (Array.isArray(v) ? v : typeof v === "string" && v ? [v] : []);

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

export type ServicioNuevo = {
  categoria: string; nombre: string; destino: string; descripcion: string; duracion: string | null; salidas: string | null;
  temporada: string | null; idiomas: string[]; grupo_max: number | null; incluye: string[]; no_incluye: string[];
  itinerario: { titulo: string; detalle: string }[]; punto_encuentro: string | null; condiciones: string | null;
  precio_ref: number | null; unidad_precio: string;
};

/** tipoProveedor: solo categorías compatibles (una agencia no publica hospedajes, un hospedaje no publica tours). */
export function validarServicio(c: Campos, tipoProveedor: string): Ok<ServicioNuevo> {
  const cat = CATEGORIAS.find((x) => x.id === c.categoria);
  if (!cat) return { ok: false, error: "Elige la categoría del servicio." };
  if (!(cat.tipos as readonly string[]).includes(tipoProveedor)) return { ok: false, error: `Tu tipo de registro no permite publicar en «${cat.nombre}».` };
  const nombre = t(c.nombre, 120);
  if (nombre.length < 3) return { ok: false, error: "Escribe el nombre del servicio." };
  if (!DESTINOS.some((d) => d.id === c.destino)) return { ok: false, error: "Elige el destino." };
  const descripcion = t(c.descripcion, 1500);
  if (descripcion.length < 20) return { ok: false, error: "Describe el servicio (al menos 20 caracteres)." };
  const grupo = t(c.grupo_max, 4) ? Number(t(c.grupo_max, 4)) : null;
  if (grupo !== null && (!Number.isInteger(grupo) || grupo < 1 || grupo > 500)) return { ok: false, error: "Grupo máximo: un número entre 1 y 500." };
  const precioTxt = t(c.precio_ref, 10).replace(",", ".");
  const precio = precioTxt ? Number(precioTxt) : null;
  if (precio !== null && (!Number.isFinite(precio) || precio < 0 || precio > 99999)) return { ok: false, error: "Precio referencial no válido." };
  const unidad = t(c.unidad_precio, 20);
  if (!UNIDADES_PRECIO.includes(unidad as never)) return { ok: false, error: "Elige la unidad del precio." };
  const idiomas = lista(c.idiomas).filter((i) => IDIOMAS.includes(i as never));
  return {
    ok: true,
    datos: {
      categoria: cat.id, nombre, destino: String(c.destino), descripcion,
      duracion: t(c.duracion, 40) || null, salidas: t(c.salidas, 80) || null, temporada: t(c.temporada, 60) || null,
      idiomas, grupo_max: grupo, incluye: lineas(c.incluye, 10, 80), no_incluye: lineas(c.no_incluye, 10, 80),
      // "Título: detalle" por línea
      itinerario: lineas(c.itinerario, 10, 160).map((l) => { const [a, ...b] = l.split(":"); return { titulo: a.trim(), detalle: b.join(":").trim() }; }),
      punto_encuentro: t(c.punto_encuentro, 200) || null, condiciones: t(c.condiciones, 500) || null,
      precio_ref: precio, unidad_precio: unidad,
    },
  };
}
