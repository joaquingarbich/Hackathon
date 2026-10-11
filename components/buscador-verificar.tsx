"use client";
// Buscador único: detecta solo qué se escribió (RUC, celular/Yape/Plin, cuenta, placa o nombre) y lo muestra en un chip.
import { useState } from "react";
import { Building2, CarFront, CreditCard, FileDigit, Search, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import { clasificarEntrada } from "@/lib/normalizacion";
import { TEXTO_VERIFICAR } from "@/config/textos";
import { Button } from "@/components/ui/button";
import { claseInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ICONO: Record<string, LucideIcon> = { ruc: FileDigit, celular: Smartphone, banco: CreditCard, placa: CarFront, nombre: Building2 };

export function BuscadorVerificar({ placeholder = TEXTO_VERIFICAR.placeholder, autoFocus = false, etiqueta = TEXTO_VERIFICAR.titulo, destino }: {
  placeholder?: string; autoFocus?: boolean; etiqueta?: string; destino?: string; // destino: atribuye la búsqueda (admin: "no encontrados" por destino)
}) {
  const [q, setQ] = useState("");
  const tipo = q.trim().length >= 3 ? clasificarEntrada(q).tipo : null;
  const Icono = tipo ? ICONO[tipo] : null;
  return (
    <form action="/consulta" className="flex flex-col gap-2" role="search">
      {destino && <input type="hidden" name="d" value={destino} />}
      <label htmlFor="q" className="sr-only">{etiqueta}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <input id="q" name="q" value={q} onChange={(e) => setQ(e.target.value)} required autoComplete="off" autoCapitalize="off" spellCheck={false}
            autoFocus={autoFocus} placeholder={placeholder} aria-describedby="q-chip" enterKeyHint="search"
            className={cn(claseInput, "h-14 rounded-2xl pl-12 text-[1.0625rem] shadow-none")} />
        </div>
        <Button type="submit" size="xl" className="h-14 sm:px-7">
          <ShieldCheck aria-hidden /> Verificar
        </Button>
      </div>
      <p id="q-chip" aria-live="polite" className="flex min-h-8 items-center px-1">
        {tipo && Icono ? (
          <span key={tipo} className="chip-entrada inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[0.875rem] font-medium text-secondary-foreground">
            <Icono aria-hidden className="size-4" /> {TEXTO_VERIFICAR.chip[tipo]}
          </span>
        ) : (
          <span className="text-[0.875rem] text-muted-foreground">Detecta solo si es RUC, celular, cuenta, placa o nombre.</span>
        )}
      </p>
    </form>
  );
}

