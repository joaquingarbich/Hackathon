"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Boton, Campo } from "@/components/ui";
import { TIPO_DOCUMENTO } from "@/config/textos";
import { supabaseNavegador } from "@/lib/supabase/client";
import { enviarSolicitud } from "./acciones";

const MAX = 10 * 1024 * 1024;
const EXT: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function FormularioSolicitud({ usuarioId }: { usuarioId: string }) {
  const router = useRouter();
  const [tipo, setTipo] = useState("constancia_agencia");
  const [estado, setEstado] = useState<{ cargando: boolean; error?: string; ok?: boolean }>({ cargando: false });

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const archivo = f.get("archivo") as File | null;
    if (!archivo || !archivo.size) return setEstado({ cargando: false, error: "Adjunta el documento." });
    if (!EXT[archivo.type]) return setEstado({ cargando: false, error: "Formato no admitido: usa PDF, JPG, PNG o WebP." });
    if (archivo.size > MAX) return setEstado({ cargando: false, error: "El archivo supera los 10 MB." });

    setEstado({ cargando: true });
    const ruta = `${usuarioId}/${crypto.randomUUID()}.${EXT[archivo.type]}`;
    const subida = await supabaseNavegador().storage.from("documentos").upload(ruta, archivo, { contentType: archivo.type });
    if (subida.error) return setEstado({ cargando: false, error: "No pudimos subir el archivo. Intenta de nuevo." });

    const r = await enviarSolicitud({
      ruc: String(f.get("ruc")), tipo, ruta,
      nombre_comercial: String(f.get("nombre_comercial") ?? ""),
      placa: String(f.get("placa") ?? ""),
      telefono: String(f.get("telefono") ?? ""),
    });
    if (!r.ok) return setEstado({ cargando: false, error: r.error });
    setEstado({ cargando: false, ok: true });
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tipo" className="font-semibold">Documento</label>
        <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className="min-h-12 rounded-control border border-borde bg-superficie px-3">
          {Object.entries(TIPO_DOCUMENTO).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      </div>
      <Campo id="ruc" name="ruc" etiqueta="RUC de la empresa" inputMode="numeric" maxLength={11} required />
      <Campo id="nombre_comercial" name="nombre_comercial" etiqueta="Nombre comercial" maxLength={120} />
      {tipo === "tuc" && <Campo id="placa" name="placa" etiqueta="Placa de la unidad" ayuda="Ej.: ABC-123" maxLength={7} required />}
      <Campo id="telefono" name="telefono" type="tel" etiqueta="Teléfono de contacto" maxLength={20} />
      <Campo id="archivo" name="archivo" type="file" etiqueta="Archivo (PDF o foto, máx. 10 MB)" accept="application/pdf,image/jpeg,image/png,image/webp" required />
      {estado.error && <p role="alert" className="text-alerta">{estado.error}</p>}
      {estado.ok && <p role="status" className="text-verificado">Recibimos tu documento. Un revisor lo validará.</p>}
      <Boton type="submit" disabled={estado.cargando}>
        <Upload aria-hidden className="size-5" />
        {estado.cargando ? "Enviando…" : "Enviar para validación"}
      </Boton>
    </form>
  );
}
