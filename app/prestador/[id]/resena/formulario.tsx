"use client";
import { useState } from "react";
import { Star, Upload } from "lucide-react";
import { Boton, Campo } from "@/components/ui";
import { SERVICIOS, TEXTO_RESENA } from "@/config/textos";
import { reducirImagen } from "@/lib/imagen";
import { enviarResena } from "./acciones";

export function FormularioResena({ providerId, hoy }: { providerId: string; hoy: string }) {
  const [estrellas, setEstrellas] = useState(0);
  const [estado, setEstado] = useState<{ cargando: boolean; error?: string; ok?: boolean }>({ cargando: false });

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!estrellas) return setEstado({ cargando: false, error: "Elige de 1 a 5 estrellas." });
    const archivo = f.get("comprobante") as File | null;
    if (!archivo?.size) return setEstado({ cargando: false, error: "Adjunta una foto del comprobante." });
    setEstado({ cargando: true });
    try {
      f.set("comprobante", await reducirImagen(archivo), "comprobante.jpg");
      f.set("estrellas", String(estrellas));
      f.set("provider_id", providerId);
      const r = await enviarResena(f);
      setEstado(r.ok ? { cargando: false, ok: true } : { cargando: false, error: r.error });
    } catch {
      setEstado({ cargando: false, error: TEXTO_RESENA.error });
    }
  }

  if (estado.ok) return <p role="status" className="rounded-control border border-verificado-borde bg-verificado-fondo p-4 text-verificado">{TEXTO_RESENA.enviado}</p>;

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-1.5">
        <legend className="font-semibold">Calificación</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setEstrellas(n)} aria-label={`${n} de 5 estrellas`} aria-pressed={estrellas === n}
              className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-control">
              <Star aria-hidden className={`size-8 ${n <= estrellas ? "fill-observaciones-borde text-observaciones" : "text-borde"}`} />
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="comentario" className="font-semibold">Comentario (opcional)</label>
        <textarea id="comentario" name="comentario" maxLength={500} rows={4} className="rounded-control border border-borde bg-superficie p-3" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="servicio" className="font-semibold">Servicio contratado</label>
        <select id="servicio" name="servicio" required defaultValue="" className="min-h-12 rounded-control border border-borde bg-superficie px-3">
          <option value="" disabled>Elige una opción</option>
          {SERVICIOS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <Campo id="fecha_servicio" name="fecha_servicio" type="date" max={hoy} etiqueta="Fecha del servicio" required />
      <Campo id="comprobante" name="comprobante" type="file" accept="image/*" etiqueta="Foto del comprobante (boleta, factura o ticket)" ayuda="Debe verse el RUC del emisor, la serie y número y la fecha." required />

      <fieldset className="flex flex-col gap-3 rounded-tarjeta border border-borde p-4">
        <legend className="px-1 font-semibold">Tus datos de contacto (privados)</legend>
        <p className="text-sm text-texto-suave">Solo los ve el revisor, por si necesita confirmar la compra.</p>
        <Campo id="nombre" name="nombre" etiqueta="Nombre completo" autoComplete="name" maxLength={80} required />
        <Campo id="correo" name="correo" type="email" etiqueta="Correo" autoComplete="email" maxLength={120} required />
        <Campo id="celular" name="celular" type="tel" inputMode="numeric" etiqueta="Celular" ayuda="9 dígitos" autoComplete="tel" maxLength={12} required />
        <Campo id="alias" name="alias" etiqueta="Alias público (opcional)" ayuda="Así aparecerá tu opinión. Si lo dejas vacío: «Usuario verificado»." maxLength={40} />
      </fieldset>

      <label className="flex gap-3 text-sm">
        <input type="checkbox" name="consentimiento" value="si" required className="mt-1 size-5 shrink-0" />
        <span>{TEXTO_RESENA.consentimiento}</span>
      </label>

      {estado.error && <p role="alert" className="text-alerta">{estado.error}</p>}
      <Boton type="submit" disabled={estado.cargando}>
        <Upload aria-hidden className="size-5" />
        {estado.cargando ? "Verificando comprobante…" : "Enviar para revisión"}
      </Boton>
    </form>
  );
}
