"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Images, LoaderCircle, OctagonAlert, ShieldCheck } from "lucide-react";
import { TEXTO_FOTO } from "@/config/textos";
import { consultarImagen } from "@/app/acciones";
import { reducirImagen } from "@/lib/imagen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Dos entradas — cámara (letrero, logo, placa) y galería (captura de un anuncio o perfil).
// Mientras se lee la imagen: aviso en una región viva (el lector de pantalla lo anuncia) y botones bloqueados.
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

  const opcion = "pulsable elevable group flex min-h-[5.5rem] w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-suave disabled:cursor-not-allowed disabled:opacity-60";
  const tile = "flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground";
  return (
    <div className="flex flex-col gap-3" aria-busy={estado.cargando}>
      <input ref={camara} type="file" accept="image/*" capture="environment" className="hidden" onChange={elegido} aria-hidden tabIndex={-1} />
      <input ref={galeria} type="file" accept="image/*" className="hidden" onChange={elegido} aria-hidden tabIndex={-1} />
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className={opcion} disabled={estado.cargando} onClick={() => camara.current?.click()}>
          <span className={tile}><Camera aria-hidden className="size-6" /></span>
          <span className="flex flex-col">
            <b className="font-semibold">Tomar foto</b>
            <span className="text-[0.875rem] text-muted-foreground">Logo, letrero o placa de la unidad</span>
          </span>
        </button>
        <button type="button" className={opcion} disabled={estado.cargando} onClick={() => galeria.current?.click()}>
          <span className={tile}><Images aria-hidden className="size-6" /></span>
          <span className="flex flex-col">
            <b className="font-semibold">Elegir captura</b>
            <span className="text-[0.875rem] text-muted-foreground">Anuncio o perfil de redes sociales</span>
          </span>
        </button>
      </div>
      <p role="status" aria-live="polite" className={cn("flex items-center gap-2 text-[0.875rem]", estado.cargando ? "font-medium text-secondary-foreground" : "text-muted-foreground")}>
        {estado.cargando
          ? <><LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" /> {TEXTO_FOTO.leyendo}</>
          : <><ShieldCheck aria-hidden className="size-4" /> La imagen no se guarda.</>}
      </p>
      {estado.error && (
        <Alert role="alert" variant="peligro" className="entrada"><OctagonAlert aria-hidden /><AlertDescription>{estado.error}</AlertDescription></Alert>
      )}
    </div>
  );
}
