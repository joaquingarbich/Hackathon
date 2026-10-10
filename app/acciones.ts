"use server";
import { extraerConsulta } from "@/lib/vision";
import { destinoParaImagen } from "@/lib/consulta-imagen";
import { guardarAnuncio } from "@/lib/anuncio";
import { TEXTO_FOTO } from "@/config/textos";

const MAX = 1.5 * 1024 * 1024; // el navegador ya la reduce a ~1600px JPEG

export async function consultarImagen(f: FormData): Promise<{ url: string } | { error: string }> {
  const img = f.get("imagen");
  if (!(img instanceof File) || !img.type.startsWith("image/") || img.size > MAX) return { error: TEXTO_FOTO.error };
  // ponytail: sin límite de frecuencia por IP; añadir si se abusa de la cuota gratuita de Gemini.
  try {
    const campos = await extraerConsulta(new Uint8Array(await img.arrayBuffer()), img.type);
    if (!campos.legible) return { error: TEXTO_FOTO.ilegible };
    const d = await destinoParaImagen(campos);
    if (!d) return { error: TEXTO_FOTO.ilegible };
    if (d.obs.length || d.noEncontrado) await guardarAnuncio(d.destino, d.obs, d.noEncontrado);
    return { url: d.url };
  } catch (e) {
    console.error("consultarImagen", e);
    return { error: TEXTO_FOTO.error };
  }
}
