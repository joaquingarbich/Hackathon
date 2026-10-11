"use client";
import { useState } from "react";
import { Boton, Campo, claseControl } from "@/components/ui";
import { DESTINOS, TEXTO_REPORTE } from "@/config/textos";
import { reducirImagen } from "@/lib/imagen";
import { enviarReporte } from "./acciones";

export function FormularioReporte({ dato, p }: { dato: string; p: string }) {
  const [estado, setEstado] = useState<{ cargando: boolean; error?: string; ok?: boolean }>({ cargando: false });
  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setEstado({ cargando: true });
    const foto = f.get("foto") as File | null;
    if (foto?.size) f.set("foto", await reducirImagen(foto), "reporte.jpg"); else f.delete("foto");
    const r = await enviarReporte(f);
    setEstado(r.ok ? { cargando: false, ok: true } : { cargando: false, error: r.error });
  }
  if (estado.ok) return <p role="status" className="rounded-tarjeta border border-verificado-borde bg-verificado-fondo p-4 text-verificado">{TEXTO_REPORTE.enviado}</p>;
  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <input type="hidden" name="p" value={p} />
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 font-semibold">¿Qué pasó?</legend>
        {TEXTO_REPORTE.motivos.map((m, i) => (
          <label key={m} className="flex min-h-11 items-center gap-3"><input type="radio" name="motivo" value={m} required defaultChecked={i === 0} className="size-5" />{m}</label>
        ))}
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="detalle" className="font-semibold">Detalle (opcional)</label>
        <textarea id="detalle" name="detalle" rows={3} maxLength={800} className={`${claseControl} py-3`} />
      </div>
      <Campo id="dato" name="dato" etiqueta="Dato reportado (placa, número, nombre…)" defaultValue={dato} maxLength={120} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="destino" className="font-semibold">¿Dónde ocurrió? (opcional)</label>
        <select id="destino" name="destino" defaultValue="" className={claseControl}>
          <option value="">Sin indicar</option>
          {DESTINOS.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
        </select>
      </div>
      <Campo id="foto" name="foto" type="file" accept="image/*" etiqueta="Foto (opcional)" ayuda="Captura del anuncio, la van o el comprobante." />
      {estado.error && <p role="alert" className="text-alerta">{estado.error}</p>}
      <Boton type="submit" disabled={estado.cargando}>{estado.cargando ? "Enviando…" : "Enviar reporte"}</Boton>
    </form>
  );
}
