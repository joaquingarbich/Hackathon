"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Images } from "lucide-react";
import { TEXTO_FOTO } from "@/config/textos";
import { consultarImagen } from "@/app/acciones";
import { reducirImagen } from "@/lib/imagen";

// C01: dos entradas — cámara (letrero, logo, placa) y galería (captura de un anuncio o perfil).
export function ConsultaFoto() {
  const router = useRouter();
  const camara = useRef<HTMLInputElement>(null);
  const galeria = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<{ cargando: boolean; error?: string }>({ cargando: false });

  async function elegido(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setEstado({ cargando: true });
    try {
      const f = new FormData();
      f.set("imagen", await reducirImagen(archivo), "consulta.jpg");
      const r = await consultarImagen(f);
      if ("error" in r) return setEstado({ cargando: false, error: r.error });
      router.push(r.url);
    } catch {
      setEstado({ cargando: false, error: TEXTO_FOTO.error });
    }
  }

  const opcion =
    "flex min-h-[4.5rem] w-full cursor-pointer items-center gap-3.5 rounded-tarjeta border-[1.5px] border-borde bg-superficie px-4 text-left disabled:cursor-not-allowed disabled:opacity-60";
  return (
    <div className="flex flex-col gap-2.5" aria-busy={estado.cargando}>
      <input ref={camara} type="file" accept="image/*" capture="environment" className="hidden" onChange={elegido} aria-hidden tabIndex={-1} />
      <input ref={galeria} type="file" accept="image/*" className="hidden" onChange={elegido} aria-hidden tabIndex={-1} />
      <button type="button" className={opcion} disabled={estado.cargando} onClick={() => camara.current?.click()}>
        <Camera aria-hidden className="size-6 shrink-0" />
        <span className="flex flex-col">
          <b>{estado.cargando ? TEXTO_FOTO.leyendo : "Tomar foto"}</b>
          <span className="text-[0.9375rem] text-texto-suave">Logo, letrero o placa de la unidad</span>
        </span>
      </button>
      <button type="button" className={opcion} disabled={estado.cargando} onClick={() => galeria.current?.click()}>
        <Images aria-hidden className="size-6 shrink-0" />
        <span className="flex flex-col">
          <b>Elegir captura</b>
          <span className="text-[0.9375rem] text-texto-suave">Anuncio o perfil de redes sociales</span>
        </span>
      </button>
      <p className="text-[0.875rem] text-texto-suave">La imagen no se guarda.</p>
      {estado.error && <p role="alert" className="text-alerta">{estado.error}</p>}
    </div>
  );
}
