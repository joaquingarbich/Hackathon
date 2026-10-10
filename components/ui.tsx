// Componentes base del sistema "Sello" v0.2 (docs/DISENO.md). Solo usan tokens de app/globals.css.
import type { ComponentProps, ReactNode } from "react";
import { Check, TriangleAlert, Clock, CircleHelp, OctagonAlert, ChevronDown, type LucideIcon } from "lucide-react";
import { TEXTO_ESTADO, type Estado } from "@/config/textos";

// Clases literales (Tailwind solo genera las que ve escritas completas).
const ESTILO_ESTADO: Record<Estado, { chip: string; sello: string; linea: string; solido: string; texto: string; Icono: LucideIcon }> = {
  verificado: {
    chip: "text-verificado bg-verificado-fondo",
    sello: "bg-verificado-fondo border-verificado-borde",
    linea: "border-verificado-borde",
    solido: "bg-verificado-borde",
    texto: "text-verificado",
    Icono: Check,
  },
  observaciones: {
    chip: "text-observaciones bg-observaciones-fondo",
    sello: "bg-observaciones-fondo border-observaciones-borde",
    linea: "border-observaciones-borde",
    solido: "bg-observaciones-borde",
    texto: "text-observaciones",
    Icono: TriangleAlert,
  },
  actualizacion: {
    chip: "text-actualizacion bg-actualizacion-fondo",
    sello: "bg-actualizacion-fondo border-actualizacion-borde",
    linea: "border-actualizacion-borde",
    solido: "bg-actualizacion-borde",
    texto: "text-actualizacion",
    Icono: Clock,
  },
  no_encontrado: {
    chip: "text-no-encontrado bg-no-encontrado-fondo",
    sello: "bg-no-encontrado-fondo border-no-encontrado-borde",
    linea: "border-no-encontrado-borde",
    solido: "bg-no-encontrado-borde",
    texto: "text-no-encontrado",
    Icono: CircleHelp,
  },
  alerta: {
    chip: "text-alerta bg-alerta-fondo",
    sello: "bg-alerta-fondo border-alerta-borde",
    linea: "border-alerta-borde",
    solido: "bg-alerta-borde",
    texto: "text-alerta",
    Icono: OctagonAlert,
  },
};

/** Estado en línea: siempre ícono + palabra (ámbar y azul son difíciles de separar solo por color). */
export function InsigniaEstado({ estado, texto }: { estado: Estado; texto?: string }) {
  const { chip, Icono } = ESTILO_ESTADO[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.9375rem] font-bold ${chip}`}>
      <Icono aria-hidden className="size-4 shrink-0" strokeWidth={2.4} />
      {texto ?? TEXTO_ESTADO[estado].titulo}
    </span>
  );
}

/** El sello del dictamen: el único elemento con personalidad. Fuente y fecha de corte viven dentro. */
export function Sello({ estado, resumen, fuentes, corte }: { estado: Estado; resumen: ReactNode; fuentes: string; corte?: string }) {
  const { sello, linea, solido, texto, Icono } = ESTILO_ESTADO[estado];
  return (
    <div className={`rounded-sello border-2 p-1.5 ${sello}`}>
      <div className={`flex flex-col gap-2.5 rounded-[0.9375rem] border-[1.5px] border-dashed p-4 sm:p-5 ${linea}`}>
        <div className="flex items-center gap-3">
          <span className={`flex size-12 shrink-0 items-center justify-center rounded-full text-fondo ${solido}`}>
            <Icono aria-hidden className="size-6.5" strokeWidth={2.8} />
          </span>
          <span className={`font-titulo text-[2rem] leading-none font-extrabold tracking-tight ${texto}`}>{TEXTO_ESTADO[estado].titulo}</span>
        </div>
        <p className="text-[1.0625rem] leading-snug">{resumen}</p>
        <div className={`flex flex-wrap justify-between gap-x-3 gap-y-1 border-t-[1.5px] border-dashed pt-2.5 text-[0.9375rem] ${linea} ${texto}`}>
          <span>{fuentes}</span>
          {corte && <span>Corte <Mono>{corte}</Mono></span>}
        </div>
      </div>
    </div>
  );
}

/** Mono solo para RUC, placas, n.° y fechas. */
export function Mono({ className = "", ...props }: ComponentProps<"span">) {
  return <span className={`font-mono ${className}`} {...props} />;
}

type Variante = "primario" | "secundario" | "fantasma";
const VARIANTE: Record<Variante, string> = {
  primario: "bg-primario text-sobre-primario hover:bg-primario-hover",
  secundario: "border-[1.5px] border-borde bg-superficie text-texto hover:bg-relleno",
  fantasma: "text-texto underline-offset-4 hover:underline",
};
export const claseBoton = (variante: Variante = "primario", extra = "") =>
  `inline-flex min-h-[3.25rem] cursor-pointer items-center justify-center gap-2 rounded-control px-5 text-[1.0625rem] font-bold no-underline transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTE[variante]} ${extra}`;

export function Boton({ variante = "primario", className = "", ...props }: ComponentProps<"button"> & { variante?: Variante }) {
  return <button className={claseBoton(variante, className)} {...props} />;
}

export const claseControl =
  "min-h-12 w-full rounded-chip border-[1.5px] border-borde bg-superficie px-3 text-[1.0625rem] text-texto placeholder:text-texto-suave aria-[invalid=true]:border-alerta-borde";

export function Campo({ etiqueta, ayuda, error, id, ...props }: ComponentProps<"input"> & { etiqueta: ReactNode; ayuda?: string; error?: string; id: string }) {
  const desc = error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[0.9375rem] font-bold">{etiqueta}</label>
      <input id={id} aria-describedby={desc} aria-invalid={error ? true : undefined} className={claseControl} {...props} />
      {error ? (
        <p id={`${id}-error`} className="text-[0.9375rem] text-alerta">{error}</p>
      ) : (
        ayuda && <p id={`${id}-ayuda`} className="text-[0.9375rem] text-texto-suave">{ayuda}</p>
      )}
    </div>
  );
}

export function Tarjeta({ className = "", ...props }: ComponentProps<"section">) {
  return <section className={`rounded-tarjeta border border-separador bg-superficie p-4 ${className}`} {...props} />;
}

/** Bloque plegable nativo (<details>): accesible por teclado sin JS. */
export function Plegable({ titulo, abierto = false, extra, children }: { titulo: ReactNode; abierto?: boolean; extra?: ReactNode; children: ReactNode }) {
  return (
    <details open={abierto} className="group rounded-tarjeta border border-separador bg-superficie">
      <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-2 px-4 font-bold">
        <span>{titulo}</span>
        <span className="flex items-center gap-2">
          {extra}
          <ChevronDown aria-hidden className="size-5 transition-transform duration-200 group-open:rotate-180" />
        </span>
      </summary>
      <div className="px-4 pb-4 text-[0.9375rem] text-texto-suave">{children}</div>
    </details>
  );
}

/** Chips de proceso (no son estados públicos): contorno + ícono, nunca relleno de tinta. */
const PROCESO = {
  revision: { clases: "border-actualizacion-borde text-actualizacion", Icono: Clock, texto: "En revisión" },
  aprobado: { clases: "border-verificado-borde text-verificado", Icono: Check, texto: "Aprobado" },
  corregir: { clases: "border-observaciones-borde text-observaciones", Icono: TriangleAlert, texto: "Por corregir" },
} as const;
export function ChipProceso({ tipo, texto }: { tipo: keyof typeof PROCESO; texto?: string }) {
  const { clases, Icono, texto: def } = PROCESO[tipo];
  return (
    <span className={`inline-flex items-center gap-1.5 self-start rounded-full border-[1.5px] px-2.5 py-0.5 text-[0.9375rem] font-bold ${clases}`}>
      <Icono aria-hidden className="size-4" strokeWidth={2.4} />
      {texto ?? def}
    </span>
  );
}

/** Página angosta (dictamen, trámites). El catálogo usa su propio contenedor ancho. */
export function Pagina({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 ${className}`} {...props} />;
}

/** Contenedor ancho del catálogo. */
export function Contenedor({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-[77.5rem] px-4 sm:px-8 ${className}`} {...props} />;
}

/** Barra de acción inferior: la acción principal al alcance del pulgar (fija en móvil, en línea en escritorio). */
export function BarraAccion({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-auto border-t border-separador bg-fondo px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
      {children}
    </div>
  );
}

/** Nota de valoración: "★ 4,8 de 5". */
export function NotaValoracion({ promedio }: { promedio: number }) {
  return (
    <b className="rounded-lg bg-relleno px-2 py-0.5 whitespace-nowrap">
      <span aria-hidden className="text-estrella">★</span> {promedio.toFixed(1).replace(".", ",")} de 5
    </b>
  );
}

export const etiquetaValoracion = (p: number) => (p >= 4.7 ? "Excepcional" : p >= 4.3 ? "Muy bueno" : p >= 3.8 ? "Bueno" : "Con opiniones mixtas");

export const soles = (n: number) => `S/ ${Number.isInteger(n) ? n : n.toFixed(2).replace(".", ",")}`;
