"use client";
import { useEffect, useRef, useState } from "react";
import { Campo, Label, NativeSelect } from "@/components/ui";
import { NOMBRE_CANAL } from "@/config/textos";
import { CANALES_CELULAR, TIPOS_CANAL, type TipoCanal } from "@/lib/canales";

/** Un solo campo, con la etiqueta y el teclado del tipo elegido (celular, cuenta, usuario o web). */
function campo(tipo: TipoCanal) {
  if (CANALES_CELULAR.includes(tipo)) return { etiqueta: `Número de ${NOMBRE_CANAL[tipo]}`, placeholder: "987 654 321", inputMode: "tel" as const, type: "tel" };
  if (tipo === "banco") return { etiqueta: "Número de cuenta o CCI", placeholder: "Solo números", inputMode: "numeric" as const };
  if (tipo === "web") return { etiqueta: "Página web", placeholder: "https://miagencia.pe", inputMode: "url" as const };
  return { etiqueta: `Usuario de ${NOMBRE_CANAL[tipo]}`, placeholder: "@miagencia" };
}

export function CamposCanal() {
  const [tipo, setTipo] = useState<TipoCanal>(TIPOS_CANAL[0]);
  const ref = useRef<HTMLSelectElement>(null);
  useEffect(() => { // al enviar, el formulario se limpia (form.reset): vuelve al primer tipo
    const form = ref.current?.form;
    const volver = () => setTipo(TIPOS_CANAL[0]);
    form?.addEventListener("reset", volver);
    return () => form?.removeEventListener("reset", volver);
  }, []);
  return (
    <div className={tipo === "banco" ? "grid gap-3 sm:grid-cols-[12rem_1fr_12rem]" : "grid gap-3 sm:grid-cols-[12rem_1fr]"}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="c-tipo">Tipo</Label>
        <NativeSelect ref={ref} id="c-tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoCanal)}>
          {TIPOS_CANAL.map((t) => <option key={t} value={t}>{NOMBRE_CANAL[t]}</option>)}
        </NativeSelect>
      </div>
      <Campo key={tipo} id="c-valor" name="valor" required maxLength={80} autoComplete="off" {...campo(tipo)} />
      {tipo === "banco" && <Campo id="c-etiqueta" name="etiqueta" etiqueta="Banco" placeholder="BCP, Interbank…" maxLength={30} />}
    </div>
  );
}
