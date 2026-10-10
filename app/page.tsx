import { Boton, Campo } from "@/components/ui";
import { ConsultaFoto } from "@/components/consulta-foto";
import Link from "next/link";
import { TEXTO_APP, TEXTO_OPERADOR } from "@/config/textos";

export default function Inicio() {
  return (
    <>
      <h1 className="text-2xl font-semibold">{TEXTO_APP.lema}</h1>
      <form action="/consulta" className="flex flex-col gap-3">
        <Campo id="q" name="q" etiqueta={TEXTO_APP.campoBusqueda} ayuda={TEXTO_APP.ejemploBusqueda} autoComplete="off" required />
        <Boton type="submit">{TEXTO_APP.botonBuscar}</Boton>
      </form>
      <ConsultaFoto />
      <Link href="/explorar" className="inline-flex min-h-11 items-center self-start font-semibold underline">
        Explorar por servicio: tours, aventura, transporte, estadía…
      </Link>
      <p className="text-sm text-texto-suave">
        {TEXTO_OPERADOR.invitacion}{" "}
        <Link href="/operador" className="underline">{TEXTO_OPERADOR.enlaceInvitacion}</Link>
      </p>
    </>
  );
}
