import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { ConsultaFoto } from "@/components/consulta-foto";
import { Alert, AlertDescription, Encabezado, InsigniaEstado, Pagina, Tarjeta } from "@/components/ui";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { TituloSeccion } from "@/components/dictamen";
import { CONSEJO, TEXTO_OPERADOR } from "@/config/textos";

// Verificar con foto (y, como alternativa, escribir el dato).
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
      <Encabezado eyebrow="Con una imagen" titulo="Verificar con foto" bajada="Toma una foto del logo, letrero o placa, o sube la captura de un anuncio en redes. Se leen los datos y se contrastan con los registros." />
      <section id="foto" aria-label="Verificar con una imagen">
        <ConsultaFoto />
      </section>
      <Tarjeta aria-labelledby="t-texto" className="flex flex-col gap-3">
        <TituloSeccion id="t-texto">O escribe el dato</TituloSeccion>
        <BuscadorVerificar />
      </Tarjeta>
      <Alert variant="aviso">
        <TriangleAlert aria-hidden />
        <AlertDescription>{CONSEJO.ambulatorio}</AlertDescription>
      </Alert>
      <section aria-labelledby="t-respuestas" className="flex flex-col gap-3">
        <TituloSeccion id="t-respuestas">Qué te puede responder</TituloSeccion>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-suave">
          {RESPUESTAS.map(([e, t]) => (
            <li key={e} className="flex flex-wrap items-center gap-3 px-4 py-3"><InsigniaEstado estado={e} /> <span className="text-[0.9375rem] text-muted-foreground">{t}</span></li>
          ))}
        </ul>
      </section>
      <p className="text-[0.9375rem] text-muted-foreground">
        {TEXTO_OPERADOR.invitacion} <Link href="/operador" className="inline-flex min-h-11 items-center font-semibold">{TEXTO_OPERADOR.enlaceInvitacion}</Link>
      </p>
    </Pagina>
  );
}
