// "¿Qué empresa te dijeron?" → compara con el titular registrado del dato (placa, número o cuenta).
import { CircleCheck, OctagonAlert } from "lucide-react";
import { TEXTO_VERIFICAR } from "@/config/textos";
import { mismoNombre } from "@/lib/checks";
import { Alert, AlertDescription, Button, Label, Tarjeta, claseControl } from "@/components/ui";
import { TituloSeccion } from "@/components/dictamen";

export function OtraEmpresa({ accion, dato, titulares, dicha, ocultos = {} }: {
  accion: string; dato: string; titulares: string[]; dicha?: string; ocultos?: Record<string, string>;
}) {
  const coincide = dicha ? titulares.some((t) => mismoNombre(t, dicha)) : null;
  return (
    <Tarjeta aria-labelledby="t-otra" className="flex flex-col gap-3">
      <TituloSeccion id="t-otra">{TEXTO_VERIFICAR.empresaDicha}</TituloSeccion>
      {dicha && (
        <Alert role="status" variant={coincide ? "exito" : "peligro"} className="entrada">
          {coincide ? <CircleCheck aria-hidden /> : <OctagonAlert aria-hidden />}
          <AlertDescription className="font-semibold">
            {coincide ? TEXTO_VERIFICAR.mismaEmpresa(dato, titulares[0]) : TEXTO_VERIFICAR.otraEmpresa(dato, titulares.join(" / "), dicha)}
          </AlertDescription>
        </Alert>
      )}
      <form action={accion} className="flex flex-col gap-2">
        {Object.entries(ocultos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <Label htmlFor="empresa" className="sr-only">{TEXTO_VERIFICAR.empresaDicha}</Label>
        <div className="flex gap-2">
          <input id="empresa" name="empresa" defaultValue={dicha} maxLength={80} placeholder="Nombre que te dieron" className={`${claseControl} flex-1`} aria-describedby="otra-ayuda" />
          <Button type="submit" variant="outline" size="lg" className="h-12">Comparar</Button>
        </div>
        <p id="otra-ayuda" className="text-[0.875rem] text-muted-foreground">{TEXTO_VERIFICAR.empresaDichaAyuda}</p>
      </form>
    </Tarjeta>
  );
}
