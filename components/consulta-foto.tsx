"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Boton } from "@/components/ui";
import { TEXTO_APP, TEXTO_FOTO } from "@/config/textos";
import { consultarImagen } from "@/app/acciones";

/** Reduce la foto en el navegador (las de celular pesan 3-8 MB): menos datos móviles y bajo el límite de las Server Actions. */
async function reducir(archivo: File, lado = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(archivo);
  const k = Math.min(1, lado / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error("toBlob"))), "image/jpeg", 0.85));
}

export function ConsultaFoto() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<{ cargando: boolean; error?: string }>({ cargando: false });

  async function elegido(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setEstado({ cargando: true });
    try {
      const f = new FormData();
      f.set("imagen", await reducir(archivo), "consulta.jpg");
      const r = await consultarImagen(f);
      if ("error" in r) return setEstado({ cargando: false, error: r.error });
      router.push(r.url);
    } catch {
      setEstado({ cargando: false, error: TEXTO_FOTO.error });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Sin `capture`: en el celular ofrece cámara o galería (para capturas de redes). */}
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={elegido} aria-hidden tabIndex={-1} />
      <Boton type="button" variante="secundario" disabled={estado.cargando} onClick={() => input.current?.click()}>
        <Camera aria-hidden className="size-5" />
        {estado.cargando ? TEXTO_FOTO.leyendo : TEXTO_APP.botonFoto}
      </Boton>
      <p className="text-sm text-texto-suave">{TEXTO_FOTO.ayuda}</p>
      {estado.error && <p role="alert" className="text-alerta">{estado.error}</p>}
    </div>
  );
}
