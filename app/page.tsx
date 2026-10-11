import Link from "next/link";
import { ArrowRight, Bus, BusFront, FileDigit, Landmark, MapPin, Megaphone, TriangleAlert, Wallet, type LucideIcon } from "lucide-react";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { ConsultaFoto } from "@/components/consulta-foto";
import { Escalonar, Revelar } from "@/components/movimiento";
import { Alert, AlertDescription, Contenedor, claseBoton } from "@/components/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CASOS, CONSEJO, TEXTO_HOME, TEXTO_VERIFICAR, type Caso } from "@/config/textos";

// Home: titular y buscador (con foto o captura) a la izquierda, las fuentes oficiales a la derecha; debajo, los casos.
const ICONO_CASO: Record<Caso, LucideIcon> = { calle: Megaphone, yape: Wallet, van: Bus };
const ICONO_FUENTE: LucideIcon[] = [Landmark, BusFront, FileDigit]; // en el orden de TEXTO_HOME.fuentes

function Pasos({ pasos }: { pasos: readonly string[] }) {
  // Los números dicen algo cierto: es una secuencia.
  return (
    <ol className="flex flex-col gap-2.5">
      {pasos.map((p, i) => (
        <li key={p} className="flex gap-3 text-[0.9375rem] text-foreground">
          <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[0.8125rem] font-semibold text-secondary-foreground">{i + 1}</span>
          <span className="pt-0.5">{p}</span>
        </li>
      ))}
    </ol>
  );
}

function Titulo({ Icono, texto }: { Icono: LucideIcon; texto: string }) {
  return (
    <span className="flex items-center gap-3.5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><Icono aria-hidden className="size-5" /></span>
      <span className="text-[1.0625rem] leading-snug font-semibold">{texto}</span>
    </span>
  );
}

export default function Inicio() {
  return (
    <>
      <section className="border-b border-border">
        <Contenedor className="grid gap-10 pt-8 pb-12 sm:pt-14 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <Escalonar className="flex min-w-0 flex-col gap-5">
            <h1 className="max-w-[16ch] text-[2.25rem] leading-[1.05] font-bold tracking-[-0.03em] text-balance sm:text-[3rem] lg:text-[3.5rem]">
              {TEXTO_VERIFICAR.titulo}
            </h1>
            <p className="max-w-[48ch] text-[1.0625rem] text-muted-foreground sm:text-lg">{TEXTO_HOME.bajada}</p>
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-3 shadow-media sm:p-5">
              <BuscadorVerificar />
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <h2 className="text-[0.9375rem] font-semibold">{TEXTO_HOME.imagen}</h2>
                <ConsultaFoto />
              </div>
            </div>
          </Escalonar>

          <Revelar retraso={0.3} className="flex flex-col gap-4 self-start lg:pt-3">
            <h2 className="text-[1.0625rem] font-semibold">{TEXTO_HOME.fuentesTitulo}</h2>
            <ul className="flex flex-col gap-5">
              {TEXTO_HOME.fuentes.map((f, i) => {
                const Icono = ICONO_FUENTE[i];
                return (
                  <li key={f.nombre} className="flex gap-3">
                    <Icono aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="flex flex-col gap-0.5">
                      <b className="leading-snug font-semibold">{f.nombre}</b>
                      <span className="text-[0.875rem] text-muted-foreground">{f.entidad}</span>
                      <span className="text-[0.9375rem]">{f.que}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-border pt-4 text-[0.875rem] text-muted-foreground">{TEXTO_HOME.fuentesNota}</p>
          </Revelar>
        </Contenedor>
      </section>

      <Contenedor className="flex max-w-3xl flex-col gap-4 py-12 sm:py-16 lg:max-w-6xl">
        <Revelar className="flex max-w-3xl flex-col gap-4">
          <h2 className="text-[1.5rem] font-bold tracking-tight sm:text-[1.75rem]">{TEXTO_HOME.casos}</h2>
          <Accordion type="single" collapsible className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-suave">
            {(Object.keys(CASOS) as Caso[]).map((c) => (
              <AccordionItem key={c} value={c} className="px-4 sm:px-5">
                <AccordionTrigger><Titulo Icono={ICONO_CASO[c]} texto={CASOS[c].titulo} /></AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 sm:pl-[3.625rem]">
                  <Pasos pasos={CASOS[c].pasos} />
                  {c === "calle" && (
                    <Alert variant="aviso"><TriangleAlert aria-hidden /><AlertDescription>{CONSEJO.ambulatorio}</AlertDescription></Alert>
                  )}
                  <p className="text-[0.875rem] text-muted-foreground">Qué escribir en el buscador: <b className="font-semibold text-foreground">{CASOS[c].placeholder}</b></p>
                </AccordionContent>
              </AccordionItem>
            ))}
            <AccordionItem value="destino" className="px-4 sm:px-5">
              <AccordionTrigger><Titulo Icono={MapPin} texto={TEXTO_HOME.destinoCaso} /></AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 sm:pl-[3.625rem]">
                <Pasos pasos={TEXTO_HOME.destinoPasos} />
                <Link href="/destinos" className={claseBoton("secundario", "self-start")}>{TEXTO_HOME.verDestinos} <ArrowRight aria-hidden /></Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Revelar>
      </Contenedor>
    </>
  );
}
