import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { ConsultaFoto } from "@/components/consulta-foto";
import { InsigniaEstado, Pagina } from "@/components/ui";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { CONSEJO, TEXTO_OPERADOR } from "@/config/textos";

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
        <h1 className="text-[2.125rem] font-extrabold">Verificar con foto</h1>
        <p className="text-texto-suave">Toma una foto del logo, letrero o placa, o sube la captura de un anuncio en redes. Leemos los datos y los contrastamos con los registros.</p>
      </div>
      <section id="foto" aria-label="Verificar con una imagen" className="flex flex-col gap-2.5">
        <ConsultaFoto />
      </section>
      <section aria-labelledby="t-texto" className="flex flex-col gap-2">
        <h2 id="t-texto" className="text-[1.375rem] font-bold">O escribe el dato</h2>
        <BuscadorVerificar />
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
