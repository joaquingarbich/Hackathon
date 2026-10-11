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
    umbralSugerencia: 0.3, // "¿quizás buscabas…?" cuando no hay candidatos (posible suplantación)
    umbralCoincidenciaClara: 0.85, // por encima, y con distancia al 2.º, se elige solo
    distanciaMinimaAlSegundo: 0.15,
    maxCandidatos: 3,
  },
  // Cada acción consume cuota gratuita de Gemini: máximo por IP (o por usuario) en la ventana.
  limites: {
    foto: { maximo: 12, ventanaSeg: 600 },
    resena: { maximo: 5, ventanaSeg: 3600 },
    documento: { maximo: 10, ventanaSeg: 3600 },
    reporte: { maximo: 5, ventanaSeg: 3600 },
    cuenta: { maximo: 5, ventanaSeg: 3600 }, // cuentas nuevas por IP (se crean ya confirmadas, sin el límite de Supabase)
    alta: { maximo: 20, ventanaSeg: 3600 }, // canales, vehículos y personal por cuenta (evita inundar la cola del admin)
  },
  dominiosOficialesQR: [".gob.pe"],
} as const;
