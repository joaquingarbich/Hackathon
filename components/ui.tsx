// Componentes base del design system. Solo usan tokens de app/globals.css.
import type { ComponentProps, ReactNode } from "react";
import { ShieldCheck, TriangleAlert, RefreshCw, CircleHelp, OctagonAlert, ChevronDown, type LucideIcon } from "lucide-react";
import { TEXTO_ESTADO, type Estado } from "@/config/textos";

// Clases literales (Tailwind solo genera las que ve escritas completas).
const ESTILO_ESTADO: Record<Estado, { clases: string; Icono: LucideIcon }> = {
  verificado: { clases: "text-verificado bg-verificado-fondo border-verificado-borde", Icono: ShieldCheck },
  observaciones: { clases: "text-observaciones bg-observaciones-fondo border-observaciones-borde", Icono: TriangleAlert },
  actualizacion: { clases: "text-actualizacion bg-actualizacion-fondo border-actualizacion-borde", Icono: RefreshCw },
  no_encontrado: { clases: "text-no-encontrado bg-no-encontrado-fondo border-no-encontrado-borde", Icono: CircleHelp },
  alerta: { clases: "text-alerta bg-alerta-fondo border-alerta-borde", Icono: OctagonAlert },
};

/** Estado del dictamen: siempre color + ícono + palabra. `grande` = cabecera del dictamen. */
export function InsigniaEstado({ estado, grande = false }: { estado: Estado; grande?: boolean }) {
  const { clases, Icono } = ESTILO_ESTADO[estado];
  const { titulo } = TEXTO_ESTADO[estado];
  return grande ? (
    <div className={`flex items-center gap-3 rounded-tarjeta border-2 p-4 ${clases}`}>
      <Icono aria-hidden className="size-8 shrink-0" />
      <span className="font-titulo text-xl font-semibold">{titulo}</span>
    </div>
  ) : (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${clases}`}>
      <Icono aria-hidden className="size-4" />
      {titulo}
    </span>
  );
}

export function Boton({ variante = "primario", className = "", ...props }: ComponentProps<"button"> & { variante?: "primario" | "secundario" }) {
  const v =
    variante === "primario"
      ? "bg-primario text-sobre-primario hover:bg-primario-hover"
      : "bg-superficie text-texto border border-borde hover:bg-fondo";
  return (
    <button
      className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-control px-5 font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${v} ${className}`}
      {...props}
    />
  );
}

export function Campo({ etiqueta, ayuda, id, ...props }: ComponentProps<"input"> & { etiqueta: string; ayuda?: string; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-semibold">{etiqueta}</label>
      <input
        id={id}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        className="min-h-12 rounded-control border border-borde bg-superficie px-4 text-base placeholder:text-texto-suave"
        {...props}
      />
      {ayuda && <p id={`${id}-ayuda`} className="text-sm text-texto-suave">{ayuda}</p>}
    </div>
  );
}

export function Tarjeta({ className = "", ...props }: ComponentProps<"section">) {
  return <section className={`rounded-tarjeta border border-borde bg-superficie p-4 ${className}`} {...props} />;
}

/** Bloque plegable nativo (<details>): accesible por teclado sin JS. */
export function Plegable({ titulo, abierto = false, children }: { titulo: string; abierto?: boolean; children: ReactNode }) {
  return (
    <details open={abierto} className="group rounded-tarjeta border border-borde bg-superficie">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold">
        {titulo}
        <ChevronDown aria-hidden className="size-5 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-t border-borde p-4">{children}</div>
    </details>
  );
}
