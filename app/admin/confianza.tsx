// Confianza del documento según las capas (no es el estado del dictamen: por eso no usa InsigniaEstado).
const ESTILO: Record<string, string> = {
  alta: "text-verificado bg-verificado-fondo border-verificado-borde",
  media: "text-observaciones bg-observaciones-fondo border-observaciones-borde",
  baja: "text-alerta bg-alerta-fondo border-alerta-borde",
};

export function InsigniaConfianza({ confianza }: { confianza: string | null }) {
  if (!confianza) return <span className="text-sm text-texto-suave">Confianza: sin calcular</span>;
  return (
    <span className={`self-start rounded-full border px-3 py-0.5 text-sm font-semibold ${ESTILO[confianza]}`}>
      Confianza {confianza}
    </span>
  );
}
