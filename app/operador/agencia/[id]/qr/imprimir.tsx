"use client";
import { Printer } from "lucide-react";
import { claseBoton } from "@/components/ui";

export const BotonImprimir = () => (
  <button type="button" onClick={() => window.print()} className={claseBoton("primario", "self-start print:hidden")}>
    <Printer aria-hidden className="size-5" /> Descargar PDF / imprimir
  </button>
);
