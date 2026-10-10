import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { ConsultaFoto } from "@/components/consulta-foto";
import { InsigniaEstado, Pagina, claseBoton, claseControl } from "@/components/ui";
import { CONSEJO, TEXTO_APP, TEXTO_OPERADOR } from "@/config/textos";

// W05 / C01: el verificador, para quien te ofrece un servicio fuera de CheckTur.
const RESPUESTAS = [
  ["verificado", "figura en un registro oficial"],
  ["actualizacion", "constancia validada, aún sin publicar"],
  ["observaciones", "hay algo que debes saber"],
  ["no_encontrado", "sin coincidencias a la fecha"],
  ["alerta", "un registro oficial muestra un hecho importante"],
] as const;

export default function Verificar() {
  return (
    <Pagina>
      <div className="flex flex-col gap-2">
        <h1 className="text-[2.125rem] font-extrabold">Verificar un proveedor</h1>
        <p className="text-texto-suave">Para quien te ofrece un servicio fuera de CheckTur: en la calle, la playa o por redes. Agencias, hospedajes, restaurantes, guías y transporte, contrastados con los registros oficiales de Piura.</p>
      </div>
      <form action="/consulta" className="flex flex-col gap-2.5">
        <label htmlFor="q" className="text-[0.9375rem] font-bold">{TEXTO_APP.campoBusqueda}</label>
        <input id="q" name="q" autoComplete="off" required placeholder={TEXTO_APP.ejemploBusqueda} className={claseControl} />
        <button className={claseBoton("primario")}>{TEXTO_APP.botonBuscar}</button>
      </form>
      <section aria-labelledby="t-imagen" className="flex flex-col gap-2.5">
        <h2 id="t-imagen" className="text-[1.375rem] font-bold">O verifica con una imagen</h2>
        <ConsultaFoto />
      </section>
      <p className="flex gap-2 rounded-control bg-observaciones-fondo p-3.5 text-[0.9375rem] text-observaciones">
        <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" /> {CONSEJO.ambulatorio}
      </p>
      <section aria-labelledby="t-respuestas" className="flex flex-col gap-3">
        <h2 id="t-respuestas" className="text-[1.375rem] font-bold">Qué te puede responder</h2>
        <ul className="flex flex-col gap-2.5">
          {RESPUESTAS.map(([e, t]) => (
            <li key={e} className="flex flex-wrap items-center gap-2"><InsigniaEstado estado={e} /> <span className="text-texto-suave">· {t}</span></li>
          ))}
        </ul>
      </section>
      <p className="text-[0.9375rem] text-texto-suave">
        {TEXTO_OPERADOR.invitacion} <Link href="/operador" className="font-bold text-texto">{TEXTO_OPERADOR.enlaceInvitacion}</Link>
      </p>
    </Pagina>
  );
}
