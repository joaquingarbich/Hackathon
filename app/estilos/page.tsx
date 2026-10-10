import { Boton, Campo, InsigniaEstado, Plegable, Tarjeta } from "@/components/ui";
import { ESTADOS } from "@/config/textos";

// Vitrina del design system: para revisar los tokens después de cambiarlos.
export default function Estilos() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Design system</h1>
      <Tarjeta className="flex flex-col gap-3">
        <h2 className="font-semibold">Estados del dictamen</h2>
        {ESTADOS.map((e) => <InsigniaEstado key={e} estado={e} grande />)}
        <div className="flex flex-wrap gap-2">{ESTADOS.map((e) => <InsigniaEstado key={e} estado={e} />)}</div>
      </Tarjeta>
      <Tarjeta className="flex flex-col gap-3">
        <h2 className="font-semibold">Controles</h2>
        <Campo id="demo" etiqueta="Campo" ayuda="Texto de ayuda" />
        <Boton>Primario</Boton>
        <Boton variante="secundario">Secundario</Boton>
        <Boton disabled>Deshabilitado</Boton>
      </Tarjeta>
      <Plegable titulo="Plegable">Contenido del bloque.</Plegable>
    </main>
  );
}
