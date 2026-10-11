"use client";
// Lector de QR: cámara con BarcodeDetector nativo (Android/Chrome) y jsQR como respaldo (iPhone/Safari); o foto del QR.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { Camera, Images, OctagonAlert, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full max-w-md self-center overflow-hidden rounded-3xl border border-border bg-[linear-gradient(135deg,var(--secondary),var(--muted))] shadow-media sm:self-start">
        <video ref={video} playsInline muted className={cn("size-full object-cover", !activo && "hidden")} />
        {/* Visor: cuatro esquinas que encuadran el QR. */}
        <div aria-hidden className="pointer-events-none absolute inset-[18%]">
          {["top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"].map((c) => (
            <span key={c} className={cn("absolute size-10", activo ? "border-white" : "border-primary", c)} />
          ))}
        </div>
        {!activo && (
          <p className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-5 text-center text-[0.9375rem] font-medium text-secondary-foreground">
            <QrCode aria-hidden className="size-5 shrink-0" /> Apunta al QR del vehículo, del carné o de la vitrina.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" size="lg" variant={activo ? "outline" : "default"} onClick={() => { setMensaje(null); setActivo(!activo); }}>
          <Camera aria-hidden /> {activo ? "Detener cámara" : "Abrir cámara"}
        </Button>
        <input ref={foto} type="file" accept="image/*" className="hidden" onChange={deFoto} aria-hidden tabIndex={-1} />
        <Button type="button" size="lg" variant="outline" onClick={() => foto.current?.click()}>
          <Images aria-hidden /> Foto del QR
        </Button>
      </div>
      {mensaje?.tipo === "error" && (
        <Alert role="alert" variant="peligro" className="entrada"><OctagonAlert aria-hidden /><AlertDescription>{mensaje.texto}</AlertDescription></Alert>
      )}
      {mensaje?.tipo === "ajeno" && (
        <Alert role="alert" variant="peligro" className="entrada">
          <OctagonAlert aria-hidden />
          <AlertTitle>Este QR no es de CheckTur Piura</AlertTitle>
          <AlertDescription>No lo abras si te pide pagar o datos personales. Contenido: <span className="break-all font-mono">{mensaje.texto.slice(0, 160)}</span></AlertDescription>
        </Alert>
      )}
    </div>
  );
}
