// Componentes de CheckTur sobre shadcn/ui (docs/DISENO.md). Solo usan tokens de app/globals.css.
// API estable: las páginas importan de "@/components/ui"; las primitivas viven en components/ui/*.tsx.
import type { ComponentProps, ReactNode } from "react";
import { Check, TriangleAlert, Clock, CircleHelp, OctagonAlert, type LucideIcon } from "lucide-react";
import { TEXTO_ESTADO, type Estado } from "@/config/textos";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";
import { claseInput } from "./input";
import { Label } from "./label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

export { Button, buttonVariants } from "./button";
export { Input } from "./input";
export { Textarea } from "./textarea";
export { Label } from "./label";
export { Badge } from "./badge";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
export { Alert, AlertDescription, AlertTitle } from "./alert";
export { Separator } from "./separator";
export { Skeleton } from "./skeleton";
export { NativeSelect, NativeSelectOption } from "./native-select";
export { Checkbox } from "./checkbox";
export { RadioGroup, RadioGroupItem } from "./radio-group";

// Clases literales (Tailwind solo genera las que ve escritas completas).
export const ESTILO_ESTADO: Record<Estado, { chip: string; fondo: string; borde: string; solido: string; anillo: string; texto: string; Icono: LucideIcon }> = {
  verificado: {
    chip: "bg-verificado-fondo text-verificado border-verificado-borde/25",
    fondo: "bg-verificado-fondo",
    borde: "border-verificado-borde/30",
    solido: "bg-verificado-borde",
    anillo: "ring-verificado-borde/15",
    texto: "text-verificado",
    Icono: Check,
  },
  observaciones: {
    chip: "bg-observaciones-fondo text-observaciones border-observaciones-borde/30",
    fondo: "bg-observaciones-fondo",
    borde: "border-observaciones-borde/35",
    solido: "bg-observaciones-borde",
    anillo: "ring-observaciones-borde/15",
    texto: "text-observaciones",
    Icono: TriangleAlert,
  },
  actualizacion: {
    chip: "bg-actualizacion-fondo text-actualizacion border-actualizacion-borde/25",
    fondo: "bg-actualizacion-fondo",
    borde: "border-actualizacion-borde/30",
    solido: "bg-actualizacion-borde",
    anillo: "ring-actualizacion-borde/15",
    texto: "text-actualizacion",
    Icono: Clock,
  },
  no_encontrado: {
    chip: "bg-no-encontrado-fondo text-no-encontrado border-no-encontrado-borde/25",
    fondo: "bg-no-encontrado-fondo",
    borde: "border-no-encontrado-borde/30",
    solido: "bg-no-encontrado-borde",
    anillo: "ring-no-encontrado-borde/15",
    texto: "text-no-encontrado",
    Icono: CircleHelp,
  },
  alerta: {
    chip: "bg-alerta-fondo text-alerta border-alerta-borde/30",
    fondo: "bg-alerta-fondo",
    borde: "border-alerta-borde/35",
    solido: "bg-alerta-borde",
    anillo: "ring-alerta-borde/15",
    texto: "text-alerta",
    Icono: OctagonAlert,
  },
};

/** Estado en línea: siempre ícono + palabra (nunca solo color). */
export function InsigniaEstado({ estado, texto, className }: { estado: Estado; texto?: string; className?: string }) {
  const { chip, Icono } = ESTILO_ESTADO[estado];
  return (
    <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.875rem] leading-none font-semibold", chip, className)}>
      <Icono aria-hidden className="size-4 shrink-0" strokeWidth={2.5} />
      {texto ?? TEXTO_ESTADO[estado].titulo}
    </span>
  );
}

/**
 * El sello del dictamen: el elemento de firma. Estado grande con su ícono, la frase que lo explica,
 * y fuente + fecha de corte dentro (borde punteado = el "sello"). Entra con un fundido corto (.entrada).
 */
export function Sello({ estado, resumen, fuentes, corte }: { estado: Estado; resumen: ReactNode; fuentes: string; corte?: string }) {
  const { fondo, borde, solido, anillo, texto, Icono } = ESTILO_ESTADO[estado];
  return (
    <section aria-label={`Resultado: ${TEXTO_ESTADO[estado].titulo}`} className={cn("entrada overflow-hidden rounded-3xl border bg-card shadow-media", borde)}>
      <div className={cn("flex items-center gap-4 px-5 pt-5 pb-4 sm:px-6", fondo)}>
        <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-full text-sobre-estado ring-8", solido, anillo)}>
          <Icono aria-hidden className="size-7" strokeWidth={2.75} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className={cn("text-[0.8125rem] font-semibold tracking-wide uppercase", texto)}>Estado oficial</span>
          <span className={cn("text-[1.875rem] leading-none font-bold tracking-tight sm:text-[2.125rem]", texto)}>{TEXTO_ESTADO[estado].titulo}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-5 pt-4 pb-5 sm:px-6">
        <p className="text-[1.0625rem] leading-snug">{resumen}</p>
        <div className={cn("flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-dashed pt-3 text-[0.875rem] text-muted-foreground", borde)}>
          <span>{fuentes}</span>
          {corte && <span>Corte <Mono className="text-foreground">{corte}</Mono></span>}
        </div>
      </div>
    </section>
  );
}

/** Mono solo para RUC, placas, n.° y fechas (cifras tabulares). */
export function Mono({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("font-mono tabular-nums", className)} {...props} />;
}

type Variante = "primario" | "secundario" | "fantasma";
const VARIANTE = { primario: "default", secundario: "outline", fantasma: "ghost" } as const;

/** Para <a>/<Link> con aspecto de botón. Grande (52 px): son las acciones del turista. */
export const claseBoton = (variante: Variante = "primario", extra = "") => cn(buttonVariants({ variant: VARIANTE[variante], size: "lg" }), extra);

export function Boton({ variante = "primario", className, ...props }: ComponentProps<"button"> & { variante?: Variante }) {
  return <button className={claseBoton(variante, className)} {...props} />;
}

export const claseControl = claseInput;

export function Campo({ etiqueta, ayuda, error, id, className, ...props }: ComponentProps<"input"> & { etiqueta: ReactNode; ayuda?: string; error?: string; id: string }) {
  const desc = error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{etiqueta}</Label>
      <input id={id} aria-describedby={desc} aria-invalid={error ? true : undefined} className={cn(claseInput, props.type === "file" && "h-auto py-2")} {...props} />
      {error ? (
        <p id={`${id}-error`} className="text-[0.875rem] font-medium text-alerta">{error}</p>
      ) : (
        ayuda && <p id={`${id}-ayuda`} className="text-[0.875rem] text-muted-foreground">{ayuda}</p>
      )}
    </div>
  );
}

/** Tarjeta (shadcn Card) como <section>, para poder etiquetarla con aria-labelledby. */
export function Tarjeta({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-suave sm:p-5", className)} {...props} />;
}

/** Bloque plegable (shadcn Accordion): accesible por teclado, chevron que rota. */
export function Plegable({ titulo, abierto = false, extra, children }: { titulo: ReactNode; abierto?: boolean; extra?: ReactNode; children: ReactNode }) {
  return (
    <Accordion type="single" collapsible defaultValue={abierto ? "i" : undefined} className="rounded-2xl border border-border bg-card px-4 shadow-suave sm:px-5">
      <AccordionItem value="i">
        <AccordionTrigger>
          <span className="flex flex-1 flex-wrap items-center justify-between gap-2">{titulo}{extra && <span className="mr-1">{extra}</span>}</span>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/** Chips de proceso (no son estados públicos): contorno + ícono. */
const PROCESO = {
  revision: { clases: "border-actualizacion-borde/40 text-actualizacion", Icono: Clock, texto: "En revisión" },
  aprobado: { clases: "border-verificado-borde/40 text-verificado", Icono: Check, texto: "Aprobado" },
  corregir: { clases: "border-observaciones-borde/50 text-observaciones", Icono: TriangleAlert, texto: "Por corregir" },
} as const;
export function ChipProceso({ tipo, texto }: { tipo: keyof typeof PROCESO; texto?: string }) {
  const { clases, Icono, texto: def } = PROCESO[tipo];
  return (
    <span className={cn("inline-flex items-center gap-1.5 self-start rounded-full border bg-card px-2.5 py-1 text-[0.8125rem] leading-none font-semibold", clases)}>
      <Icono aria-hidden className="size-3.5" strokeWidth={2.5} />
      {texto ?? def}
    </span>
  );
}

/** Encabezado de página: título + bajada opcional. */
export function Encabezado({ titulo, bajada, eyebrow, children }: { titulo: ReactNode; bajada?: ReactNode; eyebrow?: ReactNode; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      {eyebrow && <span className="text-[0.8125rem] font-semibold tracking-wide text-enlace uppercase">{eyebrow}</span>}
      <h1 className="text-[1.875rem] leading-[1.1] font-bold sm:text-[2.25rem]">{titulo}</h1>
      {bajada && <p className="max-w-[60ch] text-[1.0625rem] text-muted-foreground">{bajada}</p>}
      {children}
    </header>
  );
}

/** Página angosta (dictamen, trámites). */
export function Pagina({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10", className)} {...props} />;
}

/** Contenedor ancho (home, directorio, admin). */
export function Contenedor({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

/** Barra de acción inferior: la acción principal al alcance del pulgar (fija en móvil, en línea en escritorio). */
export function BarraAccion({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-auto flex flex-col gap-2 border-t border-border bg-background/85 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:static sm:mx-0 sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      {children}
    </div>
  );
}

/** Nota de valoración: "★ 4,8 de 5" (solo admin; el turista ya no ve valoraciones). */
export function NotaValoracion({ promedio }: { promedio: number }) {
  return (
    <b className="rounded-lg bg-muted px-2 py-0.5 whitespace-nowrap">
      <span aria-hidden className="text-observaciones-borde">★</span> {promedio.toFixed(1).replace(".", ",")} de 5
    </b>
  );
}

export const soles = (n: number) => `S/ ${Number.isInteger(n) ? n : n.toFixed(2).replace(".", ",")}`;

/** Mensaje de un formulario: error (role=alert) o confirmación (role=status), con ícono + texto. */
export function Aviso({ tipo, children, className }: { tipo: "error" | "ok"; children: ReactNode; className?: string }) {
  const error = tipo === "error";
  const Icono = error ? OctagonAlert : Check;
  return (
    <p role={error ? "alert" : "status"} className={cn("entrada flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-[0.9375rem] font-medium", error ? "bg-alerta-fondo text-alerta" : "bg-verificado-fondo text-verificado", className)}>
      <Icono aria-hidden className="mt-0.5 size-4.5 shrink-0" strokeWidth={2.5} />
      <span>{children}</span>
    </p>
  );
}
