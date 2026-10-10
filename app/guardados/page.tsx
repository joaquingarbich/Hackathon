import { ListaGuardados } from "@/components/guardados";
import { Pagina } from "@/components/ui";
import { TEXTO_GUARDADOS } from "@/config/textos";

export default function Guardados() {
  return (
    <Pagina>
      <div className="flex flex-col gap-1">
        <h1 className="text-[2.125rem] font-extrabold">{TEXTO_GUARDADOS.titulo}</h1>
        <p className="text-texto-suave">{TEXTO_GUARDADOS.ayuda}</p>
      </div>
      <ListaGuardados />
    </Pagina>
  );
}
