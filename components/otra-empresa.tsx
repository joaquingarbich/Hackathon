// "¿Qué empresa te dijeron?" → compara con el titular registrado del dato (placa, número o cuenta).
import { TEXTO_VERIFICAR } from "@/config/textos";
import { mismoNombre } from "@/lib/checks";
import { claseBoton, claseControl } from "@/components/ui";

export function OtraEmpresa({ accion, dato, titulares, dicha, ocultos = {} }: {
  accion: string; dato: string; titulares: string[]; dicha?: string; ocultos?: Record<string, string>;
}) {
  const coincide = dicha ? titulares.some((t) => mismoNombre(t, dicha)) : null;
  return (
    <section aria-labelledby="t-otra" className="flex flex-col gap-2 rounded-tarjeta border border-separador bg-superficie p-4">
      {dicha && (
        <p role="status" className={`font-bold ${coincide ? "text-verificado" : "text-alerta"}`}>
          {coincide ? TEXTO_VERIFICAR.mismaEmpresa(dato, titulares[0]) : TEXTO_VERIFICAR.otraEmpresa(dato, titulares.join(" / "), dicha)}
        </p>
      )}
      <form action={accion} className="flex flex-col gap-2">
        {Object.entries(ocultos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <label id="t-otra" htmlFor="empresa" className="font-semibold">{TEXTO_VERIFICAR.empresaDicha}</label>
        <div className="flex gap-2">
          <input id="empresa" name="empresa" defaultValue={dicha} maxLength={80} className={`${claseControl} flex-1`} aria-describedby="otra-ayuda" />
          <button className={claseBoton("secundario")}>Comparar</button>
        </div>
        <p id="otra-ayuda" className="text-[0.9375rem] text-texto-suave">{TEXTO_VERIFICAR.empresaDichaAyuda}</p>
      </form>
    </section>
  );
}
