// Valores de negocio ajustables. Lo marcado [VERIFICAR] en CHECKTUR_CONTEXTO.md vive aquí, no en el código.
export const REGLAS = {
  ubigeoDepartamento: "20", // Piura
  diasValidacionAnticipada: 60, // la validación del admin caduca si no aparece en el padrón oficial
  diasAvisoVencimiento: 30, // "autorización próxima a vencer"
  minimoResenasParaPromedio: 3,
  maxLargoResena: 500,
  resenas: {
    maxDiasComprobante: 365, // reseñas de compras de hasta un año
    maxDiasEntreCompraYServicio: 60, // más separación: se acepta, pero el admin lo ve marcado
    mostrarUltimas: 5,
  },
  busqueda: {
    umbralSimilitud: 0.5, // mínimo para ser candidato
    umbralCoincidenciaClara: 0.85, // por encima, y con distancia al 2.º, se elige solo
    distanciaMinimaAlSegundo: 0.15,
    maxCandidatos: 3,
  },
  dominiosOficialesQR: [".gob.pe"],
} as const;
