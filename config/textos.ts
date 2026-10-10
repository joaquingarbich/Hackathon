// Todo el texto del sistema que ve el turista. Reglas de redacción (CHECKTUR_CONTEXTO.md §6):
// nunca "informal", "ilegal", "estafa" ni "fraude"; el sistema informa lo que consta, no acusa.

export const ESTADOS = ["verificado", "observaciones", "actualizacion", "no_encontrado", "alerta"] as const;
export type Estado = (typeof ESTADOS)[number];

export const TEXTO_ESTADO: Record<Estado, { titulo: string; resumen: string }> = {
  verificado: {
    titulo: "Verificado",
    resumen: "Figura en el registro oficial y su RUC está activo.",
  },
  observaciones: {
    titulo: "Verificado con observaciones",
    resumen: "Figura en el registro oficial, pero hay datos que conviene que conozcas.",
  },
  actualizacion: {
    titulo: "En proceso de actualización",
    resumen: "Presentó su constancia y fue validada; está pendiente de publicación en el padrón oficial.",
  },
  no_encontrado: {
    titulo: "No encontrado",
    resumen: "No pudimos verificar a este prestador en los registros oficiales con corte al {fecha}.",
  },
  alerta: {
    titulo: "Alerta",
    resumen: "Un registro oficial indica una situación que debes revisar antes de contratar.",
  },
};

export const TEXTO_APP = {
  nombre: "CheckTur Piura",
  lema: "Verifica agencias, transporte y servicios turísticos antes de contratar.",
  campoBusqueda: "Nombre, RUC o placa",
  ejemploBusqueda: "Ej.: Vaca Loca Tours, 20123456789 o ABC-123",
  botonBuscar: "Verificar",
  botonFoto: "Usar foto o captura",
} as const;
