import { Camera, ShieldCheck } from "lucide-react";
import { Boton, Campo } from "@/components/ui";
import { TEXTO_APP } from "@/config/textos";

// Fase 0: solo maqueta. La búsqueda se conecta en la Fase 1.
export default function Inicio() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center gap-2">
        <ShieldCheck aria-hidden className="size-7 text-primario" />
        <span className="font-titulo text-xl font-semibold">{TEXTO_APP.nombre}</span>
      </header>
      <h1 className="text-2xl font-semibold">{TEXTO_APP.lema}</h1>
      <form className="flex flex-col gap-3">
        <Campo id="q" name="q" etiqueta={TEXTO_APP.campoBusqueda} ayuda={TEXTO_APP.ejemploBusqueda} autoComplete="off" />
        <Boton type="submit">{TEXTO_APP.botonBuscar}</Boton>
        <Boton type="button" variante="secundario">
          <Camera aria-hidden className="size-5" />
          {TEXTO_APP.botonFoto}
        </Boton>
      </form>
    </main>
  );
}
