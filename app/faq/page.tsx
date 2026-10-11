import type { Metadata } from "next";
import Link from "next/link";
import { Flag, ShieldCheck } from "lucide-react";
import { Encabezado, Pagina, Tarjeta, claseBoton } from "@/components/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TEXTO_APP, TEXTO_FAQ } from "@/config/textos";

export const metadata: Metadata = { title: `${TEXTO_FAQ.titulo} · ${TEXTO_APP.nombre}` };

// Preguntas frecuentes: textos en config/textos.ts (TEXTO_FAQ). Página estática.
export default function Faq() {
  return (
    <Pagina>
      <Encabezado eyebrow="Ayuda" titulo={TEXTO_FAQ.titulo} bajada={TEXTO_FAQ.bajada} />
      <h2 className="sr-only">Preguntas</h2>
      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4 shadow-suave sm:px-5">
        {TEXTO_FAQ.preguntas.map((q, i) => (
          <AccordionItem key={q.p} value={`p${i}`}>
            <AccordionTrigger>{q.p}</AccordionTrigger>
            <AccordionContent className="text-[0.9375rem] leading-relaxed text-muted-foreground">{q.r}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Tarjeta className="flex flex-col gap-3 bg-secondary/50 shadow-none">
        <h2 className="text-[1.0625rem] font-semibold">¿No encontraste tu respuesta?</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/" className={claseBoton("primario")}><ShieldCheck aria-hidden /> Verificar un dato</Link>
          <Link href="/reportar" className={claseBoton("secundario")}><Flag aria-hidden /> Reportar un problema</Link>
        </div>
      </Tarjeta>
    </Pagina>
  );
}
