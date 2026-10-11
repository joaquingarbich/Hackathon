"use client";
// Buscador único: detecta solo qué se escribió (RUC, celular/Yape/Plin, cuenta, placa o nombre) y lo muestra en un chip.
import { useState } from "react";
import { Search } from "lucide-react";
import { clasificarEntrada } from "@/lib/normalizacion";
import { TEXTO_VERIFICAR } from "@/config/textos";
import { claseBoton } from "@/components/ui";

export function BuscadorVerificar({ placeholder = TEXTO_VERIFICAR.placeholder, autoFocus = false, etiqueta = TEXTO_VERIFICAR.titulo, destino }: {
  placeholder?: string; autoFocus?: boolean; etiqueta?: string; destino?: string; // destino: atribuye la búsqueda (admin: "no encontrados" por destino)
}) {
  const [q, setQ] = useState("");
  const tipo = q.trim().length >= 3 ? clasificarEntrada(q).tipo : null;
  return (
    <form action="/consulta" className="flex flex-col gap-2" role="search">
      {destino && <input type="hidden" name="d" value={destino} />}
      <label htmlFor="q" className="sr-only">{etiqueta}</label>
      <div className="flex gap-2">
        <input id="q" name="q" value={q} onChange={(e) => setQ(e.target.value)} required autoComplete="off" autoFocus={autoFocus}
          placeholder={placeholder} aria-describedby="q-chip" enterKeyHint="search"
          className="min-h-14 w-full min-w-0 flex-1 rounded-control border-[1.5px] border-borde bg-superficie px-4 text-lg" />
        <button className={claseBoton("primario", "min-h-14 px-5")} aria-label="Verificar"><Search aria-hidden className="size-6" /></button>
      </div>
      <p id="q-chip" aria-live="polite" className="min-h-8">
        {tipo && <span className="inline-flex items-center rounded-full bg-relleno px-3 py-1 text-[0.9375rem] font-semibold">{TEXTO_VERIFICAR.chip[tipo]}</span>}
      </p>
    </form>
  );
}
