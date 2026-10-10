import { Camera } from "lucide-react";
import { Boton, Campo } from "@/components/ui";
import { TEXTO_APP } from "@/config/textos";

export default function Inicio() {
  return (
    <>
      <h1 className="text-2xl font-semibold">{TEXTO_APP.lema}</h1>
      <form action="/consulta" className="flex flex-col gap-3">
        <Campo id="q" name="q" etiqueta={TEXTO_APP.campoBusqueda} ayuda={TEXTO_APP.ejemploBusqueda} autoComplete="off" required />
        <Boton type="submit">{TEXTO_APP.botonBuscar}</Boton>
        {/* Fase 2: foto de logo o captura de redes */}
        <Boton type="button" variante="secundario" disabled>
          <Camera aria-hidden className="size-5" />
          {TEXTO_APP.botonFoto}
        </Boton>
      </form>
    </>
  );
}
