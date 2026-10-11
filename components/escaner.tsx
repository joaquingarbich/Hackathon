"use client";
// Lector de QR: cámara con BarcodeDetector nativo (Android/Chrome) y jsQR como respaldo (iPhone/Safari); o foto del QR.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { Camera, Images } from "lucide-react";
import { claseBoton } from "@/components/ui";

type Detector = { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> };
declare global { interface Window { BarcodeDetector?: new (o: { formats: string[] }) => Detector } }

/** Solo abre QR de CheckTur (/v/<id> en este mismo sitio); cualquier otro se muestra, sin abrirlo. */
function destinoCheckTur(texto: string): string | null {
  try {
    const u = new URL(texto);
    return u.host === window.location.host && /^\/v\/[0-9a-f-]{36}$/i.test(u.pathname) ? u.pathname : null;
  } catch { return null; }
}

export function Escaner() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const foto = useRef<HTMLInputElement>(null);
  const [activo, setActivo] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "ajeno"; texto: string } | null>(null);

  function leido(texto: string) {
    const d = destinoCheckTur(texto);
    if (d) return router.push(d);
    setMensaje({ tipo: "ajeno", texto });
  }

  function leerCanvas(fuente: CanvasImageSource, w: number, h: number) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(fuente, 0, 0, w, h);
    return jsQR(ctx.getImageData(0, 0, w, h).data, w, h)?.data ?? null;
  }

  useEffect(() => {
    if (!activo) return;
    let parar = false;
    let stream: MediaStream | null = null;
    const detector = window.BarcodeDetector ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const v = video.current!;
        v.srcObject = stream;
        await v.play();
        while (!parar) {
          if (v.readyState >= 2) {
            const texto = detector
              ? (await detector.detect(v))[0]?.rawValue ?? null
              : leerCanvas(v, v.videoWidth, v.videoHeight);
            if (texto) { parar = true; leido(texto); break; }
          }
          await new Promise((r) => setTimeout(r, 250));
        }
      } catch {
        setMensaje({ tipo: "error", texto: "No se pudo abrir la cámara. Da permiso a la cámara o usa «Foto del QR»." });
        setActivo(false);
      }
    })();
    return () => { parar = true; stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- leido usa router estable
  }, [activo]);

  async function deFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    const bmp = await createImageBitmap(archivo);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const texto = leerCanvas(bmp, Math.round(bmp.width * k), Math.round(bmp.height * k));
    if (texto) leido(texto);
    else setMensaje({ tipo: "error", texto: "No se encontró un QR en la foto. Acércate y que se vea completo y nítido." });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-tarjeta border border-separador bg-relleno">
        <video ref={video} playsInline muted className={`size-full object-cover ${activo ? "" : "hidden"}`} />
        {!activo && <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-texto-suave">Apunta la cámara al QR del vehículo, del carné o de la vitrina.</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => { setMensaje(null); setActivo(!activo); }} className={claseBoton("primario")}>
          <Camera aria-hidden className="size-5" /> {activo ? "Detener cámara" : "Abrir cámara"}
        </button>
        <input ref={foto} type="file" accept="image/*" className="hidden" onChange={deFoto} aria-hidden tabIndex={-1} />
        <button type="button" onClick={() => foto.current?.click()} className={claseBoton("secundario")}>
          <Images aria-hidden className="size-5" /> Foto del QR
        </button>
      </div>
      {mensaje?.tipo === "error" && <p role="alert" className="text-alerta">{mensaje.texto}</p>}
      {mensaje?.tipo === "ajeno" && (
        <div role="alert" className="flex flex-col gap-1 rounded-tarjeta border border-alerta-borde bg-alerta-fondo p-4 text-alerta">
          <b>Este QR no es de CheckTur Piura.</b>
          <span>No lo abras si te pide pagar o datos personales. Contenido: <span className="break-all font-mono">{mensaje.texto.slice(0, 160)}</span></span>
        </div>
      )}
    </div>
  );
}
