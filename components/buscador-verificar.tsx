"use client";
// Buscador único: detecta solo qué se escribió (RUC, celular/Yape/Plin, cuenta, placa o nombre) y lo muestra en un chip.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, CarFront, CreditCard, FileDigit, LoaderCircle, Search, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import { clasificarEntrada } from "@/lib/normalizacion";
import { TEXTO_VERIFICAR } from "@/config/textos";
import { buttonVariants } from "@/components/ui/button";
import { claseInput } from "@/components/ui/input";
import { RESORTE, SALIDA } from "@/components/movimiento";
import { cn } from "@/lib/utils";

const ICONO: Record<string, LucideIcon> = { ruc: FileDigit, celular: Smartphone, banco: CreditCard, placa: CarFront, nombre: Building2 };

export function BuscadorVerificar({ placeholder = TEXTO_VERIFICAR.placeholder, autoFocus = false, etiqueta = TEXTO_VERIFICAR.titulo, destino }: {
  placeholder?: string; autoFocus?: boolean; etiqueta?: string; destino?: string; // destino: atribuye la búsqueda (admin: "no encontrados" por destino)
}) {
  const [q, setQ] = useState("");
  const [enviando, setEnviando] = useState(false);
  // Al volver con "atrás" (bfcache) la página reaparece tal cual: el botón no debe quedar en "Verificando…".
  useEffect(() => {
    const volver = () => setEnviando(false);
    window.addEventListener("pageshow", volver);
    return () => window.removeEventListener("pageshow", volver);
  }, []);
  const tipo = q.trim().length >= 3 ? clasificarEntrada(q).tipo : null;
  const Icono = tipo ? ICONO[tipo] : null;
  return (
    <form action="/consulta" className="flex flex-col gap-2" role="search" onSubmit={() => setEnviando(true)}>
      {destino && <input type="hidden" name="d" value={destino} />}
      <label htmlFor="q" className="sr-only">{etiqueta}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <input id="q" name="q" value={q} onChange={(e) => setQ(e.target.value)} required autoComplete="off" autoCapitalize="off" spellCheck={false}
            autoFocus={autoFocus} placeholder={placeholder} aria-describedby="q-chip" enterKeyHint="search"
            className={cn(claseInput, "h-14 rounded-2xl pl-12 text-[1.0625rem] shadow-none")} />
        </div>
        <motion.button type="submit" whileTap={{ scale: 0.97 }} transition={RESORTE} aria-busy={enviando}
          className={cn(buttonVariants({ size: "lg" }), "h-14 min-w-36 sm:px-7")}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={enviando ? "cargando" : "listo"} className="inline-flex items-center gap-2"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: SALIDA }}>
              {enviando
                ? <><LoaderCircle aria-hidden className="animate-spin motion-reduce:animate-none" /> Verificando</>
                : <><ShieldCheck aria-hidden /> Verificar</>}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
      <p id="q-chip" aria-live="polite" className="flex min-h-8 items-center px-1">
        <AnimatePresence mode="wait" initial={false}>
          {tipo && Icono ? (
            <motion.span key={tipo} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.16, ease: SALIDA }}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[0.875rem] font-medium text-secondary-foreground">
              <Icono aria-hidden className="size-4" /> {TEXTO_VERIFICAR.chip[tipo]}
            </motion.span>
          ) : (
            <motion.span key="ayuda" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}
              className="text-[0.875rem] text-muted-foreground">Detecta solo si es RUC, celular, cuenta, placa o nombre.</motion.span>
          )}
        </AnimatePresence>
      </p>
    </form>
  );
}
