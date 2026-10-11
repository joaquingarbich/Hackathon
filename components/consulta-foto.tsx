"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Images, OctagonAlert, ShieldCheck } from "lucide-react";
import { TEXTO_FOTO } from "@/config/textos";
import { consultarImagen } from "@/app/acciones";
import { reducirImagen } from "@/lib/imagen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { RESORTE, SALIDA } from "@/components/movimiento";
import { cn } from "@/lib/utils";

// Dos entradas: cámara (letrero, logo, placa) y galería (captura de un anuncio o perfil).
// Mientras se lee la imagen: barra de progreso indeterminada + aviso en región viva, botones bloqueados.
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

  const boton = cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 flex-1 justify-start bg-card sm:flex-none");
  return (
    <div className="flex flex-col gap-3" aria-busy={estado.cargando}>
      <input ref={camara} type="file" accept="image/*" capture="environment" className="hidden" onChange={elegido} aria-hidden tabIndex={-1} />
      <input ref={galeria} type="file" accept="image/*" className="hidden" onChange={elegido} aria-hidden tabIndex={-1} />
      <div className="flex flex-wrap gap-2">
        <motion.button type="button" whileTap={{ scale: 0.97 }} transition={RESORTE} className={boton} disabled={estado.cargando} onClick={() => camara.current?.click()}>
          <Camera aria-hidden /> Tomar foto
        </motion.button>
        <motion.button type="button" whileTap={{ scale: 0.97 }} transition={RESORTE} className={boton} disabled={estado.cargando} onClick={() => galeria.current?.click()}>
          <Images aria-hidden /> Subir captura
        </motion.button>
      </div>
      <div role="status" aria-live="polite" className="flex min-h-6 flex-col gap-2 text-[0.875rem]">
        <AnimatePresence mode="wait" initial={false}>
          {estado.cargando ? (
            <motion.div key="leyendo" className="flex flex-col gap-2" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: SALIDA }}>
              <span className="font-medium text-secondary-foreground">{TEXTO_FOTO.leyendo}</span>
              <span aria-hidden className="relative h-1 w-full overflow-hidden rounded-full bg-secondary">
                <motion.span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary"
                  animate={{ x: ["-100%", "300%"] }} transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }} />
              </span>
            </motion.div>
          ) : (
            <motion.span key="nota" className="flex items-center gap-2 text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <ShieldCheck aria-hidden className="size-4" /> Letrero, logo, placa o anuncio. La imagen no se guarda.
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {estado.error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: SALIDA }}>
            <Alert role="alert" variant="peligro"><OctagonAlert aria-hidden /><AlertDescription>{estado.error}</AlertDescription></Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
