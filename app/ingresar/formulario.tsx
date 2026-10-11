"use client";
import { useActionState, useEffect, type ReactNode } from "react";
import { OctagonAlert } from "lucide-react";
import { Alert, AlertDescription, Boton } from "@/components/ui";
import type { Resultado } from "./acciones";

/** Formulario de sesión: muestra el error en su lugar y, si todo sale bien, navega con carga completa. */
export function FormularioSesion({ accion, boton, children }: { accion: (r: Resultado, f: FormData) => Promise<Resultado>; boton: string; children: ReactNode }) {
  const [r, enviar, enviando] = useActionState(accion, {});
  useEffect(() => { if (r.destino) window.location.assign(r.destino); }, [r.destino]);
  return (
    <form action={enviar} className="flex flex-col gap-4">
      {r.error && <Alert role="alert" variant="peligro"><OctagonAlert aria-hidden /><AlertDescription>{r.error}</AlertDescription></Alert>}
      {children}
      <Boton className="mt-1" disabled={enviando || !!r.destino}>{enviando || r.destino ? "Un momento…" : boton}</Boton>
    </form>
  );
}
