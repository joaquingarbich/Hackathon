// Confianza del documento según las capas (no es el estado del dictamen: por eso no usa InsigniaEstado).
// Chip de proceso: contorno + palabra, nunca relleno (docs/DISENO.md).
const ESTILO: Record<string, string> = {
  alta: "text-verificado border-verificado-borde",
  media: "text-observaciones border-observaciones-borde",
  baja: "text-alerta border-alerta-borde",
};

export function InsigniaConfianza({ confianza }: { confianza: string | null }) {
  if (!confianza) return <span className="text-[0.9375rem] text-muted-foreground">Confianza: sin calcular</span>;
  return (
    <span className={`self-start rounded-full border-[1.5px] px-2.5 py-0.5 text-[0.9375rem] font-semibold ${ESTILO[confianza]}`}>
      Confianza {confianza}
    </span>
  );
}
