"use client";
import { useState } from "react";
import { CircleCheck, OctagonAlert, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Button, Campo, Label, NativeSelect, NativeSelectOption, RadioGroup, RadioGroupItem, Textarea } from "@/components/ui";
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
  if (estado.ok)
    return (
      <Alert role="status" variant="exito" className="entrada">
        <CircleCheck aria-hidden />
        <AlertTitle>Reporte enviado</AlertTitle>
        <AlertDescription>{TEXTO_REPORTE.enviado}</AlertDescription>
      </Alert>
    );
  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <input type="hidden" name="p" value={p} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[0.9375rem] font-semibold">¿Qué pasó?</legend>
        <RadioGroup name="motivo" required defaultValue={TEXTO_REPORTE.motivos[0]} className="gap-1">
          {TEXTO_REPORTE.motivos.map((m, i) => (
            <Label key={m} htmlFor={`motivo-${i}`} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border px-3.5 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary/60">
              <RadioGroupItem id={`motivo-${i}`} value={m} />{m}
            </Label>
          ))}
        </RadioGroup>
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="detalle">Detalle <span className="font-normal text-muted-foreground">(opcional)</span></Label>
        <Textarea id="detalle" name="detalle" rows={3} maxLength={800} />
      </div>
      <Campo id="dato" name="dato" etiqueta="Dato reportado (placa, número, nombre…)" defaultValue={dato} maxLength={120} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="destino">¿Dónde ocurrió? <span className="font-normal text-muted-foreground">(opcional)</span></Label>
        <NativeSelect id="destino" name="destino" defaultValue="">
          <NativeSelectOption value="">Sin indicar</NativeSelectOption>
          {DESTINOS.map((d) => <NativeSelectOption key={d.id} value={d.id}>{d.nombre}</NativeSelectOption>)}
        </NativeSelect>
      </div>
      <Campo id="foto" name="foto" type="file" accept="image/*" etiqueta="Foto (opcional)" ayuda="Captura del anuncio, la van o el comprobante." />
      {estado.error && <Alert role="alert" variant="peligro"><OctagonAlert aria-hidden /><AlertDescription>{estado.error}</AlertDescription></Alert>}
      <Button type="submit" size="lg" disabled={estado.cargando}><Send aria-hidden /> {estado.cargando ? "Enviando…" : "Enviar reporte"}</Button>
    </form>
  );
}
