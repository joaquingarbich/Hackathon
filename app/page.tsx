import Link from "next/link";
import { ArrowRight, Bus, MapPin, Megaphone, TriangleAlert, Wallet, type LucideIcon } from "lucide-react";
import { BuscadorVerificar } from "@/components/buscador-verificar";
import { ConsultaFoto } from "@/components/consulta-foto";
import { Alert, AlertDescription, Contenedor, claseBoton } from "@/components/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CASOS, CONSEJO, TEXTO_FOTO, TEXTO_HOME, TEXTO_VERIFICAR, type Caso } from "@/config/textos";

// Home: el buscador, la consulta con foto o captura, y la información de cada caso (se despliega aquí mismo).
const ICONO_CASO: Record<Caso, LucideIcon> = { calle: Megaphone, yape: Wallet, van: Bus };

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

const item = "rounded-2xl border border-border bg-card px-4 shadow-suave not-last:border-b sm:px-5 data-[state=open]:shadow-media";

export default function Inicio() {
  return (
    <section className="flex-1 bg-[radial-gradient(120%_70%_at_50%_-10%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_70%)]">
      <Contenedor className="flex max-w-3xl flex-col items-center gap-6 pt-10 pb-14 text-center sm:pt-16 sm:pb-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-[0.8125rem] font-medium text-muted-foreground shadow-suave">
          <span aria-hidden className="size-1.5 rounded-full bg-verificado-borde" /> Registros oficiales de Piura
        </span>
        <div className="flex flex-col gap-3">
          <h1 className="text-[2.25rem] leading-[1.05] font-bold tracking-[-0.035em] sm:text-[3.5rem]">
            {TEXTO_VERIFICAR.titulo.replace(" o subir", "")}<span className="text-primary"> o subir</span>
          </h1>
          <p className="mx-auto max-w-[54ch] text-[1.0625rem] text-muted-foreground sm:text-lg">{TEXTO_HOME.bajada}</p>
        </div>

        <div className="w-full rounded-3xl border border-border bg-card p-3 text-left shadow-media sm:p-4">
          <BuscadorVerificar />
        </div>

        <section aria-labelledby="t-foto" className="flex w-full flex-col gap-3 text-left">
          <h2 id="t-foto" className="text-[0.9375rem] font-semibold text-muted-foreground">O con una imagen: {TEXTO_FOTO.ayuda.charAt(0).toLowerCase() + TEXTO_FOTO.ayuda.slice(1)}</h2>
          <ConsultaFoto />
        </section>

        <div className="mt-4 flex w-full flex-col gap-4 text-left">
          <div className="flex flex-col gap-1">
            <h2 className="text-[1.375rem] font-bold sm:text-[1.5rem]">{TEXTO_HOME.casos}</h2>
            <p className="text-muted-foreground">{TEXTO_HOME.casosAyuda}</p>
          </div>
          <Accordion type="single" collapsible className="escalonado gap-3">
            {(Object.keys(CASOS) as Caso[]).map((c) => (
              <AccordionItem key={c} value={c} className={item}>
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
            <AccordionItem value="destino" className={item}>
              <AccordionTrigger><Titulo Icono={MapPin} texto={TEXTO_HOME.destinoCaso} /></AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 sm:pl-[3.625rem]">
                <Pasos pasos={TEXTO_HOME.destinoPasos} />
                <Link href="/destinos" className={claseBoton("secundario", "self-start")}>{TEXTO_HOME.verDestinos} <ArrowRight aria-hidden /></Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Contenedor>
    </section>
  );
}
